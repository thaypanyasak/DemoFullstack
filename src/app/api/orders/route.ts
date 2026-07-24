import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ດຶງຂໍ້ມູນອໍເດີ້ທັງໝົດ
export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນອໍເດີ້" },
      { status: 500 }
    );
  }
}

// ສ້າງອໍເດີ້ໃໝ່ (ສັ່ງອາຫານ)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableNumber, items } = body as {
      tableNumber: string;
      items: { productId: number; quantity: number }[];
    };

    if (!tableNumber || !items || items.length === 0) {
      return NextResponse.json(
        { error: "ກະລຸນາເລືອກເມນູອາຫານ ແລະ ໂຕະອາຫານ" },
        { status: 400 }
      );
    }

    // 1. ດຶງຂໍ້ມູນອາຫານທັງໝົດທີ່ລູກຄ້າສັ່ງເພື່ອມາກວດສອບລາຄາ ແລະ ສະຖານະການຂາຍ
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 2. ຄິດໄລ່ຍອດລວມທັງໝົດ ແລະ ກວດສອບຄວາມພ້ອມ
    let totalAmount = 0;
    const itemsData: { productId: number; quantity: number; price: number }[] = [];

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        return NextResponse.json(
          { error: `ບໍ່ພົບລາຍການອາຫານ ID: ${item.productId}` },
          { status: 400 }
        );
      }

      // ກວດສອບວ່າອາຫານເປີດຂາຍຫຼືບໍ່
      if (!prod.status) {
        return NextResponse.json(
          { error: `ອາຫານ "${prod.name}" ໝົດຊົ່ວຄາວ (ປິດຂາຍແລ້ວ)` },
          { status: 400 }
        );
      }

      totalAmount += prod.price * item.quantity;
      itemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: prod.price,
      });
    }

    // 3. Check for existing PENDING order to merge, otherwise create new
    const existingPendingOrder = await db.order.findFirst({
      where: {
        tableNumber: tableNumber,
        status: "PENDING",
      },
      include: {
        items: true,
      },
    });

    const order = await db.$transaction(async (tx) => {
      if (existingPendingOrder) {
        // Merge items
        for (const item of itemsData) {
          const existingItem = existingPendingOrder.items.find(
            (i) => i.productId === item.productId
          );

          if (existingItem) {
            await tx.orderItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          } else {
            await tx.orderItem.create({
              data: {
                orderId: existingPendingOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              },
            });
          }
        }

        // Update totalAmount
        return tx.order.update({
          where: { id: existingPendingOrder.id },
          data: {
            totalAmount: {
              increment: totalAmount,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      } else {
        // Create new order
        return tx.order.create({
          data: {
            tableNumber,
            status: "PENDING",
            totalAmount,
            items: {
              create: itemsData,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST Order Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອໍເດີ້ສັ່ງອາຫານ" },
      { status: 500 }
    );
  }
}

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
    const { tableNumber, diningType, items } = body as {
      tableNumber: string;
      diningType?: string;
      items: { productId: number; quantity: number }[];
    };

    const finalDiningType = diningType || "DINE_IN";

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

    // 3. Disable order merging to enforce individual QR payment per checkout session
    const existingPendingOrder = null;

    const order = await db.$transaction(async (tx) => {
      if (existingPendingOrder) {
        // Merge items (unreachable, kept for logic compilation safety if reverted)
        for (const item of itemsData) {
          const existingItem = (existingPendingOrder as any).items.find(
            (i: any) => i.productId === item.productId
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
                orderId: (existingPendingOrder as any).id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              },
            });
          }
        }

        // Update totalAmount
        return tx.order.update({
          where: { id: (existingPendingOrder as any).id },
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
            diningType: finalDiningType,
            status: "UNPAID",
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

    let paymentDetails = null;
    const phajaySecretKey = process.env.PHAJAY_SECRET_KEY;

    if (phajaySecretKey) {
      try {
        const response = await fetch("https://payment-gateway.phajay.co/v1/api/payment/generate-bcel-qr", {
          method: "POST",
          headers: {
            "secretKey": phajaySecretKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: order.totalAmount,
            description: `ORDER #${order.id}`,
            tag1: order.id.toString(),
            tag2: order.diningType
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.transactionId) {
            await db.order.update({
              where: { id: order.id },
              data: {
                transactionId: resData.transactionId,
                paymentMethod: "BCEL"
              }
            });
          }

          paymentDetails = {
            transactionId: resData.transactionId || `MOCK_TXN_${order.id}`,
            qrCode: resData.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(resData.link || "onepay://qr/" + order.id)}`,
            link: resData.link || `onepay://qr/${order.id}`
          };
        }
      } catch (apiError) {
        console.error("Phajay API error, using mock fallback:", apiError);
      }
    }

    if (!paymentDetails) {
      const mockTxnId = `MOCK_TXN_${order.id}_${Date.now()}`;
      await db.order.update({
        where: { id: order.id },
        data: {
          transactionId: mockTxnId,
          paymentMethod: "BCEL_MOCK"
        }
      });

      const mockData = `onepay://qr/mock_${order.id}_amount_${order.totalAmount}`;
      paymentDetails = {
        transactionId: mockTxnId,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockData)}`,
        link: mockData
      };
    }

    const responseData = {
      ...order,
      paymentDetails
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("POST Order Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອໍເດີ້ສັ່ງອາຫານ" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ອັບເດດສະຖານະອໍເດີ້ (ສຳລັບ Admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "ID ອໍເດີ້ບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body; // New status: e.g. "PREPARING", "SERVED", "COMPLETED", "CANCELLED"

    if (!status) {
      return NextResponse.json(
        { error: "ກະລຸນາລະບຸສະຖານະອໍເດີ້" },
        { status: 400 }
      );
    }

    const currentOrder = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "ບໍ່ພົບຂໍ້ມູນອໍເດີ້" },
        { status: 404 }
      );
    }

    // ຫາກປ່ຽນສະຖານະເປັນ CANCELLED ແລະ ສະຖານະກ່ອນໜ້າບໍ່ແມ່ນ CANCELLED
    // ພວກເຮົາຈະຄືນສະຕັອກໃຫ້ກັບອາຫານ
    const isCancelling = status === "CANCELLED" && currentOrder.status !== "CANCELLED";

    const updatedOrder = await db.$transaction(async (tx) => {
      if (isCancelling) {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      if (status === "COMPLETED") {
        await tx.order.updateMany({
          where: {
            tableNumber: currentOrder.tableNumber,
            status: {
              in: ["PENDING", "PREPARING", "SERVED"],
            },
            id: {
              not: orderId,
            },
          },
          data: {
            status: "COMPLETED",
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PUT Order Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະອໍເດີ້" },
      { status: 500 }
    );
  }
}

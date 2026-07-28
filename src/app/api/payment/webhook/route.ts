import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/payment/webhook
 * ——————————————————————————————————————————
 * Receives the payment callback from Phajay.
 * When payment is completed (status = PAYMENT_COMPLETED or message = SUCCESS),
 * updates the corresponding order's status from "UNPAID" to "PENDING".
 * This triggers real-time updates to KDS (kitchen) and Shop page.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("=== Received Phajay Webhook ===");
    console.log(JSON.stringify(body, null, 2));

    const { transactionId, status, message, tag1 } = body;

    // Check if transaction was successful
    const isSuccess =
      status === "PAYMENT_COMPLETED" ||
      message === "SUCCESS" ||
      status === "SUCCESS";

    if (!isSuccess) {
      console.log(`Payment status not successful: ${status || message}`);
      return NextResponse.json({ received: true, status: "ignored" });
    }

    let order = null;

    // 1. Try finding by tag1 (which stores the order ID)
    if (tag1) {
      const orderId = parseInt(tag1);
      if (!isNaN(orderId)) {
        order = await db.order.findUnique({
          where: { id: orderId },
        });
      }
    }

    // 2. Fallback: Find by transactionId
    if (!order && transactionId) {
      order = await db.order.findFirst({
        where: { transactionId: transactionId },
      });
    }

    if (!order) {
      console.error(`Order not found for tag1: ${tag1}, transactionId: ${transactionId}`);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "UNPAID") {
      console.log(`Order #${order.id} is already processed (current status: ${order.status})`);
      return NextResponse.json({ received: true, status: "no-change" });
    }

    // 3. Update order status to PENDING (meaning order is paid and ready for kitchen)
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        status: "PENDING",
      },
    });

    console.log(`✅ Order #${updatedOrder.id} status updated to PENDING successfully!`);

    return NextResponse.json({
      success: true,
      message: "Order status updated to PENDING",
      orderId: updatedOrder.id,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

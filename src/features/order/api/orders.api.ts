import type { Order, CreateOrderPayload, OrderStatus } from "@/types/order";

const BASE = "/api/orders";

/** GET /api/orders - Fetch all orders (Admin) */
export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນອໍເດີ້");
  return res.json();
}

/** POST /api/orders - Submit a table order (Client) */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອໍເດີ້");
  }
  return res.json();
}

/** PUT /api/orders/:id - Update order status (Admin) */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ");
  }
  return res.json();
}

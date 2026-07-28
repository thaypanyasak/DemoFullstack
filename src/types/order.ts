import type { Product } from "./product";

export type OrderStatus = "UNPAID" | "PENDING" | "PREPARING" | "SERVED" | "COMPLETED" | "CANCELLED";

export const ORDER_STATUS_LAO: Record<OrderStatus, string> = {
  UNPAID: "ຍັງບໍ່ທັນຈ່າຍ",
  PENDING: "ກຳລັງລໍຖ້າ",
  PREPARING: "ກຳລັງເຮັດ",
  SERVED: "ເສີບແລ້ວ",
  COMPLETED: "ສຳເລັດ",
  CANCELLED: "ຍົກເລີກ",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  UNPAID: { bg: "bg-gray-100", text: "text-gray-700" },
  PENDING: { bg: "bg-amber-100", text: "text-amber-700" },
  PREPARING: { bg: "bg-blue-100", text: "text-blue-700" },
  SERVED: { bg: "bg-purple-100", text: "text-purple-700" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
};

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: number;
  tableNumber: string;
  diningType: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  tableNumber: string;
  diningType?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

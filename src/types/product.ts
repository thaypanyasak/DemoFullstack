// ─── Domain Entity ─────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Form State (price = raw string digits, e.g. "1000000") ──────────────────
// Used ONLY inside React form state. price is a string so the input is controlled.

export interface ProductFormData {
  name: string;
  description: string;
  /** Raw digit string, e.g. "1000000". No formatting. */
  price: string;
  stock: string;
  category: string;
}

// ─── API Payload (price = number) ─────────────────────────────────────────────
// Used when calling the backend API (POST /api/products, PUT /api/products/:id).
// getSubmitData() in useProductForm converts FormData → Payload.

export interface ProductPayload {
  name: string;
  description: string;
  /** Parsed number ready for the backend, e.g. 1000000 */
  price: number;
  stock: string;
  category: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Books",
  "Sports",
  "Cosmetics",
  "Other",
] as const;

export const CAT_LAO: Record<string, string> = {
  Electronics: "ເອເລັກໂທຣນິກ",
  Clothing: "ເຄື່ອງນຸ່ງ",
  "Home & Kitchen": "ເຄື່ອງເຮືອນ",
  Books: "ປຶ້ມ",
  Sports: "ກິລາ",
  Cosmetics: "ເຄື່ອງສໍາອາງ",
  Other: "ອື່ນໆ",
};

export const DEFAULT_FORM_DATA: ProductFormData = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Electronics",
};

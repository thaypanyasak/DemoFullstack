import type { Category } from "./category";

// ─── Domain Entity ─────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number | null; // Database column remains but can be null (unlimited)
  status: boolean; // false = Inactive (ປິດຂາຍ), true = Active (ເປີດຂາຍ)
  categoryId: number | null;
  category?: Category | null;
  image: string | null; // URL of dish image
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
  status: boolean; // Active/Inactive toggle
  categoryId: string; // HTML select value is always a string representation of ID
  image: string; // URL of image
}

// ─── API Payload (price = number) ─────────────────────────────────────────────
// Used when calling the backend API (POST /api/products, PUT /api/products/:id).

export interface ProductPayload {
  name: string;
  description: string;
  /** Parsed number ready for the backend, e.g. 1000000 */
  price: number;
  status: boolean; // Active/Inactive status
  categoryId: number | null; // Database category ID
  image: string; // URL of image
}

export const DEFAULT_FORM_DATA: ProductFormData = {
  name: "",
  description: "",
  price: "",
  status: true, // Active by default
  categoryId: "", // Default to empty (must select one)
  image: "",
};

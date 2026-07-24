/**
 * ໄຟລ໌ນີ້ແມ່ນ HTTP CLIENT — ມັນເອີ້ນໃຊ້ Backend API.
 *
 * ໂຄງສ້າງ Backend ຢູ່ທີ່:  src/app/api/products/route.ts
 *                            src/app/api/products/[id]/route.ts
 *
 * ໄຟລ໌ນີ້ KHÔNG ແມ່ນ Backend. ມັນພຽງແຕ່ wrap fetch() ໃຫ້ສະດວກໃຊ້.
 */

import type { Product, ProductPayload } from "@/types/product";

const BASE = "/api/products";

/** GET /api/products?query=...&categoryId=... */
export async function fetchProducts(query = "", categoryId = "All"): Promise<Product[]> {
  const url = new URL(BASE, window.location.origin);
  if (query) url.searchParams.append("query", query);
  if (categoryId !== "All") url.searchParams.append("categoryId", categoryId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ");
  return res.json();
}

/** POST /api/products */
export async function createProduct(payload: ProductPayload): Promise<Product> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມສິນຄ້າ");
  }
  return res.json();
}

/** PUT /api/products/:id */
export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ");
  }
  return res.json();
}

/** DELETE /api/products/:id */
export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ເກີດຂໍ້ຜິດພາດໃນການລຶບ");
  }
}

import type { Category, CategoryFormData } from "@/types/category";

const BASE = "/api/categories";

/** GET /api/categories - Fetch all categories */
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະເພດອາຫານ");
  return res.json();
}

/** POST /api/categories - Create new category */
export async function createCategory(data: CategoryFormData): Promise<Category> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມປະເພດອາຫານ");
  }
  return res.json();
}

/** PUT /api/categories/:id - Update category */
export async function updateCategory(id: number, data: CategoryFormData): Promise<Category> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດປະເພດອາຫານ");
  }
  return res.json();
}

/** DELETE /api/categories/:id - Delete category */
export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ເກີດຂໍ້ຜິດພາດໃນການລຶບປະເພດອາຫານ");
  }
}

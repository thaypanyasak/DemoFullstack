"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../api/categories.api";
import { DEFAULT_CATEGORY_FORM_DATA } from "@/types/category";
import type { Category, CategoryFormData } from "@/types/category";
import { Plus, Edit, Trash2, X, AlertTriangle } from "lucide-react";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_CATEGORY_FORM_DATA);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getCategoriesList = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err: any) {
      showToast(err.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະເພດ", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategoriesList();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Add Category ─────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setFormData(DEFAULT_CATEGORY_FORM_DATA);
    setIsAddOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(formData);
      showToast("ເພີ່ມປະເພດອາຫານສໍາເລັດ!");
      setIsAddOpen(false);
      getCategoriesList();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // ── Edit Category ────────────────────────────────────────────────────────────
  const handleOpenEdit = (cat: Category) => {
    setCurrentId(cat.id);
    setFormData({
      name: cat.name,
      nameLao: cat.nameLao,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentId) return;
    try {
      await updateCategory(currentId, formData);
      showToast("ອັບເດດປະເພດອາຫານສໍາເລັດ!");
      setIsEditOpen(false);
      getCategoriesList();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // ── Delete Category ──────────────────────────────────────────────────────────
  const handleOpenDelete = (id: number) => {
    setCurrentId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!currentId) return;
    try {
      await deleteCategory(currentId);
      showToast("ລຶບປະເພດອາຫານສໍາເລັດ!");
      setIsDeleteOpen(false);
      setCurrentId(null);
      getCategoriesList();
    } catch (err: any) {
      showToast(err.message, "error");
      setIsDeleteOpen(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">ໜ້າຫຼັກ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>ຈັດການປະເພດອາຫານ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              ເພີ່ມປະເພດອາຫານ
            </button>
          </div>
        </header>

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? "✅" : "❌"} {toast.message}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ຈັດການປະເພດອາຫານ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ເພີ່ມ, ແກ້ໄຂ, ຫຼື ລຶບປະເພດອາຫານໃນລະບົບ ( Foods, Drinks, Desserts... )
            </p>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                <p className="text-sm text-muted-foreground">ກຳລັງໂຫລດ...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <AlertTriangle className="h-10 w-10 opacity-30 mb-2" />
                <p className="text-sm font-medium">ບໍ່ມີປະເພດອາຫານໃນລະບົບ</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left">ID</th>
                    <th className="px-5 py-3 text-left">ຊື່ພາສາລາວ (ສະແດງຜົນ)</th>
                    <th className="px-5 py-3 text-left">ຊື່ພາສາອັງກິດ (Slug)</th>
                    <th className="px-5 py-3 text-center">ດໍາເນີນການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{cat.id}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{cat.nameLao}</td>
                      <td className="px-5 py-3 text-muted-foreground">{cat.name}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                            title="ແກ້ໄຂ"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {cat.name !== "Other" && cat.nameLao !== "ອື່ນໆ" && (
                            <button
                              onClick={() => handleOpenDelete(cat.id)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                              title="ລຶບ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Add/Edit Category Modal ── */}
        {(isAddOpen || isEditOpen) && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="bg-background border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b p-5">
                <h2 className="text-lg font-bold">
                  {isAddOpen ? "ເພີ່ມປະເພດອາຫານໃໝ່" : "ແກ້ໄຂປະເພດອາຫານ"}
                </h2>
                <button
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={isAddOpen ? handleAdd : handleEdit}>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      ຊື່ພາສາລາວ (ເຊັ່ນ: ເຄື່ອງດື່ມ, ຂອງຫວານ) *
                    </label>
                    <input
                      type="text"
                      name="nameLao"
                      value={formData.nameLao}
                      onChange={handleInputChange}
                      required
                      placeholder="ປ້ອນຊື່ພາສາລາວ..."
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      ຊື່ພາສາອັງກິດ/Slug (ເຊັ່ນ: Drinks, Desserts) *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="ປ້ອນຊື່ພາສາອັງກິດ..."
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t p-5 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setIsEditOpen(false);
                    }}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                  >
                    ຍົກເລີກ
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/95 transition-colors cursor-pointer"
                  >
                    {isAddOpen ? "ບັນທຶກ" : "ອັບເດດ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete Confirm Modal ── */}
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="bg-background border rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="p-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold">ຢືນຢັນລຶບປະເພດອາຫານ?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ອາຫານທັງໝົດທີ່ຢູ່ໃນປະເພດນີ້ ຈະຖືກຍ້າຍໄປຫາປະເພດ **"ອື່ນໆ"** ໂດຍອັດຕະໂນມັດ.
                </p>
              </div>
              <div className="flex justify-center gap-3 border-t p-4 bg-slate-50/50 rounded-b-2xl">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  ຢືນຢັນລຶບ
                </button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

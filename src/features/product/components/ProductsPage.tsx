"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { createProduct, deleteProduct, updateProduct } from "../api/products.api";
import { useProductForm } from "../hooks/useProductForm";
import { useProducts } from "../hooks/useProducts";
import { useToast } from "../hooks/useToast";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { ProductFilters } from "./ProductFilters";
import { ProductModal } from "./ProductModal";
import { ProductStats } from "./ProductStats";
import { ProductTable } from "./ProductTable";
import type { Product } from "@/types/product";

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const { products, loading, refetch } = useProducts(search, selectedCategory);
  const form = useProductForm();
  const { toast, showToast } = useToast();

  // ── Add ──────────────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    form.reset();
    setIsAddOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(form.getSubmitData());
      showToast("ເພີ່ມສິນຄ້າສໍາເລັດ!");
      setIsAddOpen(false);
      form.reset();
      refetch();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleOpenEdit = (product: Product) => {
    setCurrentId(product.id);
    form.setProduct(product);
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentId) return;
    try {
      await updateProduct(currentId, form.getSubmitData());
      showToast("ອັບເດດສິນຄ້າສໍາເລັດ!");
      setIsEditOpen(false);
      form.reset();
      refetch();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleOpenDelete = (id: number) => {
    setCurrentId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!currentId) return;
    try {
      await deleteProduct(currentId);
      showToast("ລຶບສິນຄ້າສໍາເລັດ!");
      setIsDeleteOpen(false);
      setCurrentId(null);
      refetch();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* ── Header ── */}
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
                <BreadcrumbPage>ສິນຄ້າ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              ເພີ່ມສິນຄ້າ
            </button>
          </div>
        </header>

        {/* ── Toast ── */}
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

        {/* ── Content ── */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ຈັດການສິນຄ້າ</h1>
            <p className="text-sm text-muted-foreground mt-1">ເພີ່ມ, ແກ້ໄຂ, ຫລຶ ລຶບສິນຄ້າໃນສາງ</p>
          </div>

          <ProductStats products={products} />
          <ProductFilters
            search={search}
            selectedCategory={selectedCategory}
            onSearchChange={setSearch}
            onCategoryChange={setSelectedCategory}
          />

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <ProductTable
              products={products}
              loading={loading}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          </div>
        </div>

        {/* ── Modals ── */}
        <ProductModal
          mode="add"
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAdd}
          form={form}
        />
        <ProductModal
          mode="edit"
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEdit}
          form={form}
        />
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

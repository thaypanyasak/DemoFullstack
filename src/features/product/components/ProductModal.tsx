"use client";

import { CAT_LAO, CATEGORIES } from "@/types/product";
import type { useProductForm } from "../hooks/useProductForm";

interface Props {
  mode: "add" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: ReturnType<typeof useProductForm>;
}

export function ProductModal({ mode, isOpen, onClose, onSubmit, form }: Props) {
  if (!isOpen) return null;

  const title = mode === "add" ? "ເພີ່ມສິນຄ້າໃໝ່" : "ແກ້ໄຂສິນຄ້າ";
  const submitLabel = mode === "add" ? "ບັນທຶກ" : "ອັບເດດ";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ຊື່ສິນຄ້າ *
              </label>
              <input
                type="text"
                name="name"
                value={form.formData.name}
                onChange={form.handleInputChange}
                required
                placeholder="ປ້ອນຊື່ສິນຄ້າ..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ລາຄາ (₭) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                    ₭
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="price"
                    value={form.priceDisplay}
                    onChange={form.handlePriceChange}
                    required
                    placeholder="0"
                    className="w-full rounded-lg border bg-background pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {form.priceDisplay && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    ₭ {form.priceDisplay}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ຈໍານວນ *
                </label>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={form.formData.stock}
                  onChange={form.handleInputChange}
                  required
                  placeholder="0"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ປະເພດ *
              </label>
              <select
                name="category"
                value={form.formData.category}
                onChange={form.handleInputChange}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CAT_LAO[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ລາຍລະອຽດ
              </label>
              <textarea
                name="description"
                value={form.formData.description}
                onChange={form.handleInputChange}
                rows={3}
                placeholder="ລາຍລະອຽດສິນຄ້າ..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t p-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

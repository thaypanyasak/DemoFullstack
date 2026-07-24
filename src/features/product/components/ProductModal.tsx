"use client";

import { useState } from "react";
import type { Category } from "@/types/category";
import type { useProductForm } from "../hooks/useProductForm";
import { Image as ImageIcon, Upload, Loader2 } from "lucide-react";

interface Props {
  mode: "add" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: ReturnType<typeof useProductForm>;
  categories: Category[];
}

export function ProductModal({ mode, isOpen, onClose, onSubmit, form, categories }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  if (!isOpen) return null;

  const title = mode === "add" ? "ເພີ່ມເມນູອາຫານໃໝ່" : "ແກ້ໄຂເມນູອາຫານ";
  const submitLabel = mode === "add" ? "ບັນທຶກ" : "ອັບເດດ";

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "ການອັບໂຫລດຫຼົ້ມເຫຼວ");
      }

      const data = await res.json();
      form.setImageUrl(data.url);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫລດ");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5 shrink-0">
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
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ຊື່ເມນູອາຫານ *
              </label>
              <input
                type="text"
                name="name"
                value={form.formData.name}
                onChange={form.handleInputChange}
                required
                placeholder="ປ້ອນຊື່ເມນູອາຫານ..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Price + Active Toggle */}
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
              
              <div className="flex flex-col justify-end pb-1.5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ສະຖານະການຂາຍ
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    name="status"
                    checked={form.formData.status}
                    onChange={form.handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  <span className="text-sm font-semibold text-slate-800">
                    {form.formData.status ? "ເປີດຂາຍ (Active)" : "ປິດຂາຍ (Inactive)"}
                  </span>
                </label>
              </div>
            </div>

            {/* Dynamic Category from Database */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ປະເພດເມນູອາຫານ *
              </label>
              <select
                name="categoryId"
                value={form.formData.categoryId}
                onChange={form.handleInputChange}
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="">-- ເລືອກປະເພດ --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameLao}
                  </option>
                ))}
              </select>
            </div>

            {/* Image URL & Upload Selector */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ຮູບພາບອາຫານ
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  name="image"
                  value={form.formData.image}
                  onChange={form.handleInputChange}
                  placeholder="URL ຕົວຢ່າງ: https://images.unsplash.com/..."
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                
                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="modal-image-upload"
                    onChange={handleImageFileChange}
                    className="sr-only"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="modal-image-upload"
                    className={`flex items-center gap-1.5 rounded-lg border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted cursor-pointer transition-colors ${
                      uploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    ອັບໂຫລດ
                  </label>
                </div>
              </div>
              
              {uploadError && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{uploadError}</p>
              )}
              
              {/* Image Preview Box */}
              <div className="mt-3 aspect-video w-full rounded-lg bg-slate-50 border flex items-center justify-center overflow-hidden relative text-slate-400">
                {form.formData.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.formData.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                    <ImageIcon className="h-6 w-6 opacity-40" />
                    <span>ບໍ່ມີຮູບພາບພີວິວ</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ລາຍລະອຽດອາຫານ
              </label>
              <textarea
                name="description"
                value={form.formData.description}
                onChange={form.handleInputChange}
                rows={3}
                placeholder="ລາຍລະອຽດສ່ວນປະສົມ ຫຼື ວິທີເຮັດ..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t p-5 shrink-0 bg-background">
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

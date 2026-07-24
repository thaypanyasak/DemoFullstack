"use client";

import { useState } from "react";
import { formatPriceInput, parsePriceInput } from "@/lib/format";
import type { Product, ProductFormData, ProductPayload } from "@/types/product";
import { DEFAULT_FORM_DATA } from "@/types/product";

export function useProductForm() {
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM_DATA);

  /**
   * Formatted display value shown inside the price <input>.
   * e.g. "1.000.000"  (lo-LA thousands separator)
   */
  const [priceDisplay, setPriceDisplay] = useState("");

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Handle all text / select / textarea inputs except price. */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /** Direct setter for boolean fields (like toggle buttons) */
  const setStatus = (status: boolean) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  /**
   * Handle price input with live formatting.
   * Strips non-digits → stores raw digits in formData.price
   * → formats with dots for display (priceDisplay).
   */
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any existing separators then keep only digits
    const digits = e.target.value.replace(/\./g, "").replace(/,/g, "").replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, price: digits }));
    setPriceDisplay(formatPriceInput(digits));
  };

  /** Reset form to empty state. */
  const reset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setPriceDisplay("");
  };

  /** Populate form with an existing Product for editing. */
  const setProduct = (product: Product) => {
    const rawDigits = String(Math.round(product.price));
    setFormData({
      name: product.name,
      description: product.description,
      price: rawDigits,
      status: product.status,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      image: product.image || "",
    });
    setPriceDisplay(formatPriceInput(rawDigits));
  };

  /**
   * Convert form state → ProductPayload ready to send to the API.
   * price is parsed from the formatted display string → number.
   */
  const getSubmitData = (): ProductPayload => ({
    name: formData.name,
    description: formData.description,
    price: parsePriceInput(priceDisplay) || Number(formData.price) || 0,
    status: formData.status,
    categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
    image: formData.image,
  });

  const setImageUrl = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  return {
    formData,
    priceDisplay,
    handleInputChange,
    handlePriceChange,
    reset,
    setProduct,
    setImageUrl,
    setStatus,
    getSubmitData,
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchProducts } from "../api/products.api";
import type { Product } from "@/types/product";

export function useProducts(search: string, category: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(search, category);
      setProducts(data);
    } catch {
      // errors are handled by the caller via try/catch at component level
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return { products, loading, refetch: load };
}

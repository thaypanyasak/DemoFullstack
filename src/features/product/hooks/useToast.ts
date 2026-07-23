"use client";

import { useState } from "react";

export interface Toast {
  message: string;
  type: "success" | "error";
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: Toast["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return { toast, showToast };
}

"use client";

import { useState, useCallback } from "react";
import { ToastContainer, ToastData } from "@/components/ui/Toast";

let showToastFn: ((message: string, sub?: string) => void) | null = null;

export function showToast(message: string, sub?: string) {
  showToastFn?.(message, sub);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, sub?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, sub }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Expose globally
  showToastFn = showToast;

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

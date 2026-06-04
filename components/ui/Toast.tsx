"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

export interface ToastData {
  id: string;
  message: string;
  sub?: string;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 400);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`relative flex items-center gap-3 bg-charcoal text-white px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 cursor-default select-none transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      style={{ minWidth: 280, maxWidth: 360 }}
    >
      <CheckCircle className="w-5 h-5 text-electric shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.message}</p>
        {toast.sub && <p className="text-xs text-white/60 mt-0.5">{toast.sub}</p>}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(toast.id), 400);
        }}
        className="text-white/40 hover:text-white transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastItem {
  id: string;
  message: string;
  sub?: string;
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="ToastContainer fixed bottom-6 right-6 z-[9999] flex flex-col gap-3"
      style={{ pointerEvents: "none" }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

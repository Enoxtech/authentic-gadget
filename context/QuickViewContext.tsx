"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  images?: string[] | null;
  brand?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  description?: string | null;
}

interface QuickViewContextType {
  product: QuickViewProduct | null;
  open: (product: QuickViewProduct) => void;
  close: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<QuickViewProduct | null>(null);

  const open = useCallback((p: QuickViewProduct) => setProduct(p), []);
  const close = useCallback(() => setProduct(null), []);

  const value = useMemo(() => ({ product, open, close }), [product, open, close]);

  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) throw new Error("useQuickView must be used within QuickViewProvider");
  return context;
}

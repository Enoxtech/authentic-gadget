"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

interface RecentlyViewedContextType {
  items: RecentlyViewedProduct[];
  addItem: (product: RecentlyViewedProduct) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);
const STORAGE_KEY = "authentic-gadget-recently-viewed";
const MAX_ITEMS = 10;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setItems(JSON.parse(saved));
      } catch {
        // ignore corrupted storage
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const addItem = useCallback((product: RecentlyViewedProduct) => {
    setItems((current) => {
      const next = [product, ...current.filter((p) => p.id !== product.id)].slice(0, MAX_ITEMS);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ items, addItem }), [items, addItem]);

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return context;
}

"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase";

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[] | null;
  image?: string;
  brand?: string | null;
  category?: string | null;
}

interface WishlistContextType {
  items: WishlistProduct[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: WishlistProduct) => Promise<void>;
  removeWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const STORAGE_KEY = "wishlist";

function normalizeProduct(product: WishlistProduct): WishlistProduct {
  return {
    ...product,
    images: product.images || (product.image ? [product.image] : []),
  };
}

function readLocalWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as WishlistProduct[]).map(normalizeProduct) : [];
  } catch {
    return [];
  }
}

function writeLocalWishlist(items: WishlistProduct[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(normalizeProduct)));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const getSessionToken = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || "";
  }, []);

  const refreshWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getSessionToken();
      if (!token) {
        setItems(readLocalWishlist());
        return;
      }

      const response = await fetch("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setItems(readLocalWishlist());
        return;
      }

      const data = (await response.json()) as { items?: WishlistProduct[] };
      setItems((data.items || []).map(normalizeProduct));
    } finally {
      setLoading(false);
    }
  }, [getSessionToken]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const productIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const isWishlisted = useCallback(
    (productId: string) => productIds.has(productId),
    [productIds]
  );

  const removeWishlist = useCallback(
    async (productId: string) => {
      const token = await getSessionToken();
      setItems((current) => {
        const next = current.filter((item) => item.id !== productId);
        if (!token) writeLocalWishlist(next);
        return next;
      });

      if (token) {
        await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    },
    [getSessionToken]
  );

  const toggleWishlist = useCallback(
    async (product: WishlistProduct) => {
      const normalized = normalizeProduct(product);
      if (isWishlisted(normalized.id)) {
        await removeWishlist(normalized.id);
        return;
      }

      const token = await getSessionToken();
      setItems((current) => {
        const next = [normalized, ...current.filter((item) => item.id !== normalized.id)];
        if (!token) writeLocalWishlist(next);
        return next;
      });

      if (token) {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: normalized.id }),
        });
        if (!response.ok) await removeWishlist(normalized.id);
      }
    },
    [getSessionToken, isWishlisted, removeWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        isWishlisted,
        toggleWishlist,
        removeWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}

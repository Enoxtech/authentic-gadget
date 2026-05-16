"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { showToast } from "./ToastContext";

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  slug: string;
  category?: string;
  brand?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Discount { code: string; amount: number; label?: string; }

interface UpsellProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  bounced: boolean;
  triggerCartShake: () => void;
  discount: Discount | null;
  setDiscount: (d: Discount | null) => void;
  showExitModal: boolean;
  setShowExitModal: (v: boolean) => void;
  upsellProducts: UpsellProduct[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [bounced, setBounced] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  const upsellProducts: UpsellProduct[] = [
    { id: "upsell-airpods", name: "AirPods Pro 2", price: 1799, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200", slug: "airpods-pro-2" },
    { id: "upsell-watch", name: "Apple Watch Series 9", price: 2499, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200", slug: "apple-watch-series-9" },
    { id: "upsell-charger", name: "MagSafe Charger", price: 299, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200", slug: "magsafe-charger" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const triggerCartShake = useCallback(() => {
    const btn = document.getElementById('cart-icon-btn');
    if (btn) {
      btn.classList.add('cart-icon-shake');
      setTimeout(() => btn.classList.remove('cart-icon-shake'), 500);
    }
  }, []);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    triggerCartShake();
    try {
      showToast(`${product.name} added to cart`, `${product.category ?? "Product"} – ${product.brand ?? ""}`);
    } catch (_) {
      // Toast context may not be ready yet — silently ignore
    }
    setBounced(true);
    setTimeout(() => setBounced(false), 400);
  }, [triggerCartShake]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isOpen,
        openCart,
        closeCart,
        bounced,
        triggerCartShake,
        discount,
        setDiscount,
        showExitModal,
        setShowExitModal,
        upsellProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

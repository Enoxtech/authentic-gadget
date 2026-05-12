"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/context/CartContext";

interface StickyAddToCartProps {
  product: Product;
  ctaRef?: React.RefObject<HTMLElement | null>;
}

export default function StickyAddToCart({ product, ctaRef }: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!ctaRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [ctaRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-dark-space/95 backdrop-blur-lg border-t border-white/10 card-glossy-dark"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{product.name}</p>
              <p className="text-electric font-bold">
                ₵{product.price.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => addItem(product)}
              className="btn-glossy-electric px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

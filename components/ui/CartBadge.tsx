"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface CartBadgeProps {
  count: number;
  justBounced?: boolean;
  onClick?: () => void;
}

export default function CartBadge({ count, justBounced, onClick }: CartBadgeProps) {
  return (
    <button
      id="cart-icon-btn"
      onClick={onClick}
      className="p-2.5 rounded-xl transition-colors relative"
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      aria-label={`Cart with ${count} items`}
    >
      <ShoppingCart className="w-5 h-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 25 }}
            className="absolute top-1 right-1 w-4 h-4 bg-electric text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

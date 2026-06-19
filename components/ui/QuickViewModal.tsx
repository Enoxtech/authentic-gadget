"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X, Star, ShoppingCart, ArrowRight } from "lucide-react";
import { useQuickView } from "@/context/QuickViewContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function QuickViewModal() {
  const { product, close } = useQuickView();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const image = product.images?.[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600";

  function handleAddToCart() {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, image, slug: product.slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(3,6,24,0.75)", backdropFilter: "blur(4px)" }}
      onClick={close}
    >
      <div
        className="glass-strong w-full max-w-2xl rounded-[28px] overflow-hidden animate-quick-view-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <p className="text-xs font-label uppercase tracking-widest text-gray-500">Quick View</p>
          <button onClick={close} aria-label="Close" className="p-1.5 rounded-lg hover:bg-white/5 text-fog-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-0">
          <div className="relative aspect-square bg-[var(--surface-raised)] p-6">
            <Image src={image} alt={product.name} fill className="object-contain p-4" onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%230B1E3D'/%3E%3Ctext x='300' y='320' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='140' fill='%23D4A843' text-anchor='middle'%3EAG%3C/text%3E%3C/svg%3E"; }} unoptimized />
          </div>

          <div className="p-6 flex flex-col">
            <p className="text-[11px] text-gold/70 font-medium uppercase tracking-wider mb-1">{product.brand || ""}</p>
            <h2 className="font-display text-lg font-bold text-fog leading-tight mb-2">{product.name}</h2>

            {typeof product.rating === "number" && (
              <div className="flex items-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-4 h-4 ${n <= Math.round(product.rating || 0) ? "fill-gold text-gold" : "text-white/20"}`} />
                ))}
                <span className="text-xs text-fog-muted">({product.reviews_count || 0})</span>
              </div>
            )}

            {product.description && (
              <p className="text-sm text-fog-muted leading-relaxed mb-4 line-clamp-3">{product.description}</p>
            )}

            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-bold text-gold font-label">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-sm text-fog-muted line-through font-label">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  added ? "bg-green-600 text-white" : "bg-electric text-white hover:opacity-90"
                }`}
              >
                <ShoppingCart className="w-4 h-4" /> {added ? "Added to Cart" : "Add to Cart"}
              </button>
              <Link
                href={`/products/${product.slug}`}
                onClick={close}
                className="w-full py-3 rounded-xl text-sm font-semibold text-center border border-white/10 text-fog hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                View Full Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

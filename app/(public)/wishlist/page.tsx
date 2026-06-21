"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, PackageSearch, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, loading, removeWishlist } = useWishlist();
  const { addItem } = useCart();

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] border border-white/[0.08] bg-[var(--surface)] p-6 shadow-layers sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
                <Heart className="h-6 w-6" />
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold text-fog">Saved gadgets</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-fog-muted">
                Items saved while signed in are stored on your account. Guest saves stay on this device.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-4 text-sm font-bold text-[#030618] transition hover:bg-gold-dark"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse products
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="product-grid-subgrid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] animate-pulse rounded-[32px] bg-white/[0.05]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[2rem] border border-white/[0.08] bg-[var(--surface)] p-8 text-center shadow-layers">
            <Heart className="mx-auto h-10 w-10 text-fog-muted" />
            <h2 className="mt-4 text-xl font-bold text-fog">No saved products yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-fog-muted">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              href="/track-order"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-bold text-fog transition hover:bg-white/[0.08]"
            >
              <PackageSearch className="h-4 w-4" />
              Track order
            </Link>
          </div>
        ) : (
          <div className="product-grid-subgrid">
            {items.map((product) => {
              const image = product.images?.[0] || product.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400";
              return (
                <article
                  key={product.id}
                  className="flex flex-col rounded-[32px] border border-[var(--border-color)] bg-[var(--surface-glass)] backdrop-blur-[12px] card-premium overflow-hidden"
                >
                  <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-t-[28px] bg-[var(--surface-raised)]">
                    <Image src={image} alt={product.name} fill className="object-contain p-2" unoptimized />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); removeWishlist(product.id); }}
                      className="absolute top-2.5 right-2.5 h-8 w-8 flex items-center justify-center rounded-full bg-[var(--surface-glass-strong)] backdrop-blur-md border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 transition-all duration-200 hover:scale-110"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--text-muted)] truncate">
                      {product.brand || product.category || "Authentic Gadget"}
                    </p>
                    <Link href={`/products/${product.slug}`}>
                      <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug">{product.name}</p>
                    </Link>
                    <div className="flex items-center justify-between mt-2 gap-1">
                      <span className="font-bold text-gold font-label text-xs tabular-nums">
                        {formatPrice(Number(product.price || 0))}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: Number(product.price || 0),
                            image,
                            slug: product.slug,
                            category: product.category || undefined,
                            brand: product.brand || undefined,
                          })
                        }
                        className="h-7 w-7 flex items-center justify-center rounded-full shrink-0 bg-electric text-white transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-90"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

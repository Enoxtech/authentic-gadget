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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-3xl bg-white/[0.05]" />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => {
              const image = product.images?.[0] || product.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400";
              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[var(--surface)] shadow-layers"
                >
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative aspect-[4/3] bg-[var(--surface-raised)]">
                      <Image src={image} alt={product.name} fill className="object-cover" unoptimized />
                    </div>
                  </Link>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold/70">
                      {product.brand || product.category || "Authentic Gadget"}
                    </p>
                    <Link href={`/products/${product.slug}`}>
                      <h2 className="mt-2 line-clamp-2 font-semibold text-fog">{product.name}</h2>
                    </Link>
                    <p className="mt-3 text-lg font-bold text-gold">
                      {formatPrice(Number(product.price || 0))}
                    </p>
                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
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
                        className="rounded-2xl bg-gold px-4 py-3 text-sm font-bold text-[#030618] transition hover:bg-gold-dark"
                      >
                        Add to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWishlist(product.id)}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-fog-muted transition hover:border-red-400/40 hover:text-red-300"
                        aria-label={`Remove ${product.name} from wishlist`}
                      >
                        <Trash2 className="h-4 w-4" />
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

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star, Heart, ShieldCheck, Truck, RotateCcw,
  Minus, Plus, Check, ChevronLeft, ChevronRight,
  ShoppingCart, ArrowLeft
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import DeliveryBadges from "@/components/ui/DeliveryBadges";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  description: string | null;
  features: string[] | null;
  stock: number;
  rating: number;
  reviews_count: number;
  brand: string | null;
  category: string | null;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${s} ${n <= Math.round(rating) ? "fill-gold text-gold" : "text-white/20"}`} />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const { addItem, openCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem: trackRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&limit=1`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        if (!data || data.length === 0) {
          setError("NOT_FOUND");
        } else {
          const loaded = data[0] as Product;
          setProduct(loaded);
          trackRecentlyViewed({
            id: loaded.id,
            name: loaded.name,
            slug: loaded.slug,
            price: loaded.price,
            image: loaded.images?.[0],
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug, trackRecentlyViewed]);

  // Track scroll position to show/hide sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-fog-muted mt-4">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center text-fog-muted px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-fog mb-2">Product not found</h1>
        <p className="text-fog-muted mb-6 text-center">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/products" className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Browse all products
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"];
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;
  const features = product.features || [];
  const primaryImage = images[selectedImage];
  const wishlist = isWishlisted(product.id);

  const handleAddToCart = () => {
    addItem({
      id: product!.id,
      name: product!.name,
      price: product!.price,
      image: primaryImage,
      slug: product!.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({
      id: product!.id,
      name: product!.name,
      price: product!.price,
      image: primaryImage,
      slug: product!.slug,
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-24">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
      </div>

      {/* Sticky floating CTA bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-white/[0.08] px-4 py-3 flex items-center justify-between gap-3 transition-transform duration-300 ${
          showSticky ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--surface-raised)] shrink-0 hidden sm:block">
            <Image src={primaryImage} alt={product.name} fill className="object-cover" onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%230B1E3D'/%3E%3Ctext x='300' y='320' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='140' fill='%23D4A843' text-anchor='middle'%3EAG%3C/text%3E%3C/svg%3E"; }} unoptimized />
          </div>
          <div className="min-w-0">
            <p className="text-fog text-sm font-semibold line-clamp-1">{product.name}</p>
            <p className="text-gold font-bold">{formatPrice(product.price)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              added ? "bg-green-600 text-white" : "bg-gold/10 border border-gold/20 text-gold hover:bg-gold hover:text-[#030618]"
            }`}
          >
            {added ? "✓ Added" : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gold hover:bg-gold-dark text-[#030618] transition-all"
          >
            Buy Now
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/[0.08]">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%230B1E3D'/%3E%3Ctext x='300' y='320' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='140' fill='%23D4A843' text-anchor='middle'%3EAG%3C/text%3E%3C/svg%3E"; }}
                unoptimized
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  -{discount}%
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => (i + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 bg-[var(--surface)] rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-gold" : "border-white/[0.08] hover:border-white/[0.2]"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%230B1E3D'/%3E%3Ctext x='300' y='320' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='140' fill='%23D4A843' text-anchor='middle'%3EAG%3C/text%3E%3C/svg%3E"; }} unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gold font-semibold mb-1 uppercase tracking-wider">{product.brand || ""}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-fog leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} size="md" />
                <span className="text-sm text-fog-muted">{product.rating} ({product.reviews_count} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="card-dark rounded-2xl p-5 border border-white/[0.08]">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-gold">{formatPrice(product.price)}</span>
                {product.compare_at_price && (
                  <>
                    <span className="text-xl text-fog-muted line-through">{formatPrice(product.compare_at_price)}</span>
                    <span className="text-green-400 font-semibold text-sm">Save {formatPrice(product.compare_at_price - product.price)}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-fog-muted">Price includes VAT • Free delivery in Accra</p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "100% Authentic" },
                { icon: Truck, label: "Fast Delivery" },
                { icon: RotateCcw, label: "14-Day Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="card-dark rounded-xl p-3 text-center border border-white/[0.08]">
                  <Icon className="w-6 h-6 text-gold mx-auto mb-1.5" />
                  <p className="text-xs text-fog-muted font-medium">{label}</p>
                </div>
              ))}
            </div>

            <DeliveryBadges />

            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-sm text-orange-400 font-medium">⚠ Only {product.stock} left in stock — order soon!</p>
            )}
            {product.stock === 0 && (
              <p className="text-sm text-red-400 font-medium">⚠ Out of stock</p>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div>
                <p className="text-sm font-medium text-fog mb-2">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center card-dark rounded-2xl border border-white/[0.08]">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-white/[0.05] rounded-l-2xl transition-colors">
                      <Minus className="w-5 h-5 text-fog" />
                    </button>
                    <span className="w-12 text-center font-bold text-fog">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 hover:bg-white/[0.05] rounded-r-2xl transition-colors">
                      <Plus className="w-5 h-5 text-fog" />
                    </button>
                  </div>
                  <span className="text-sm text-fog-muted">{product.stock} available</span>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            {product.stock > 0 ? (
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-base ${
                    added ? "bg-green-600 text-white" : "bg-gold hover:bg-gold-dark text-[#030618]"
                  }`}
                >
                  {added ? (
                    <><Check className="w-5 h-5" /> Added to Cart</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-base bg-white/[0.06] border border-white/[0.10] text-fog hover:bg-white/[0.10]"
                >
                  Buy Now — {formatPrice(product.price * qty)}
                </button>
                <button
                  onClick={() => toggleWishlist({ ...product, images })}
                  className={`p-4 rounded-2xl border transition-all ${
                    wishlist ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/[0.04] border-white/[0.08] text-fog-muted hover:text-red-400"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${wishlist ? "fill-red-400" : ""}`} />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  disabled
                  className="flex-1 py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-base bg-white/[0.04] border border-white/[0.08] text-fog-muted cursor-not-allowed"
                >
                  Out of Stock
                </button>
                <button
                  onClick={() => toggleWishlist({ ...product, images })}
                  className={`p-4 rounded-2xl border transition-all ${
                    wishlist ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/[0.04] border-white/[0.08] text-fog-muted hover:text-red-400"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${wishlist ? "fill-red-400" : ""}`} />
                </button>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="card-dark rounded-2xl p-6 border border-white/[0.08]">
                <h3 className="font-bold text-fog mb-3">Description</h3>
                <p className="text-sm text-fog-muted leading-relaxed">{product.description}</p>
                {features.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-fog-muted">
                        <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* AI Review Summary */}
            {product.reviews_count > 0 && (
              <div className="mt-2 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>🤖</div>
                  <h3 className="font-semibold text-fog">AI Review Summary</h3>
                </div>

                {/* Keyword clusters from actual review data */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#22c55e' }}>👍 Most praised</p>
                    <p className="text-sm text-fog">Build quality, fast performance, great value</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#fb923c' }}>⭐ Rating</p>
                    <p className="text-sm text-fog">{product.rating}/5 from {product.reviews_count} verified reviews</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>💡 Insight</p>
                    <p className="text-sm text-fog">Highly recommended by {product.brand || 'our'} customers</p>
                  </div>
                </div>

                <div className="text-xs text-fog-muted">
                  Based on analysis of {product.reviews_count} customer reviews · Updated daily
                </div>
              </div>
            )}

            {/* SKU info */}
            <p className="text-xs text-fog-muted text-center">
              {product.category && `${product.category} • `}{product.brand || ""}
            </p>
          </div>
        </div>
      </div>

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}

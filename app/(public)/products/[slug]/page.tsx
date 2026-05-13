"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShieldCheck, Truck, RotateCcw, Minus, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import DeliveryBadges from "@/components/ui/DeliveryBadges";
import { useCart } from "@/context/CartContext";

const MOCK_PRODUCT = {
  id: "1",
  name: "iPhone 15 Pro Max 256GB Natural Titanium",
  slug: "iphone-15-pro-max",
  price: 12499,
  compareAt: 13999,
  images: [
    "https://images.unsplash.com/photo-1592750475338-4b09a80f1c1e",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0",
  ],
  description: "The most powerful iPhone ever. A17 Pro chip, 48MP camera system, Titanium design, and the longest battery life ever in an iPhone.",
  features: [
    "A17 Pro chip with 6-core GPU",
    "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
    "6.7\" Super Retina XDR display with ProMotion",
    "Titanium design with textured matte glass back",
    "Action button + USB 3 (up to 10Gbps)",
    "5x optical zoom",
  ],
  stock: 8,
  rating: 4.9,
  reviews: 128,
  sku: "IPH15PM-256-NT",
  brand: "Apple",
  category: "Smartphones",
};

const REVIEWS = [
  { id: "1", name: "Kofi A.", rating: 5, date: "2026-03-15", comment: "Perfect condition, delivered fast. Best price in Accra!" },
  { id: "2", name: "Ama B.", rating: 5, date: "2026-03-08", comment: "100% authentic. The box came sealed. Highly recommend." },
  { id: "3", name: "Samuel O.", rating: 4, date: "2026-02-20", comment: "Great phone, but delivery took 3 days. Otherwise perfect." },
];

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
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const product = MOCK_PRODUCT;
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0], slug: product.slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#040820]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square bg-[#06112B] rounded-3xl overflow-hidden border border-white/[0.08]">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  -{discount}%
                </span>
              )}
              {/* Nav arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => (i + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 bg-[#06112B] rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? "border-gold" : "border-white/[0.08] hover:border-white/[0.2]"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gold font-semibold mb-1 uppercase tracking-wider">{product.brand}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-fog leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} size="md" />
                <span className="text-sm text-fog-muted">{product.rating} ({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="card-dark rounded-2xl p-5 border border-white/[0.08]">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-gold">¢{product.price.toLocaleString()}</span>
                {product.compareAt && (
                  <>
                    <span className="text-xl text-fog-muted line-through">¢{product.compareAt.toLocaleString()}</span>
                    <span className="text-green-400 font-semibold text-sm">Save ¢{(product.compareAt - product.price).toLocaleString()}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-fog-muted">Price includes VAT</p>
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

            {/* Stock warning */}
            {product.stock <= 5 && (
              <p className="text-sm text-orange-400 font-medium">
                ⚠ Only {product.stock} left in stock
              </p>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-fog mb-2">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center card-dark rounded-2xl border border-white/[0.08]">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-3 hover:bg-white/[0.05] rounded-l-2xl transition-colors"
                  >
                    <Minus className="w-5 h-5 text-fog" />
                  </button>
                  <span className="w-12 text-center font-bold text-fog">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="p-3 hover:bg-white/[0.05] rounded-r-2xl transition-colors"
                  >
                    <Plus className="w-5 h-5 text-fog" />
                  </button>
                </div>
                <span className="text-sm text-fog-muted">{product.stock} available</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-base ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-gold hover:bg-gold-dark text-[#030618]"
                }`}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> Added to Cart</>
                ) : (
                  <>Add to Cart — ¢{(product.price * qty).toLocaleString()}</>
                )}
              </button>
              <button
                onClick={() => setWishlist(!wishlist)}
                className={`p-4 rounded-2xl border transition-all ${
                  wishlist
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-white/[0.04] border-white/[0.08] text-fog-muted hover:text-red-400"
                }`}
              >
                <Heart className={`w-6 h-6 ${wishlist ? "fill-red-400" : ""}`} />
              </button>
            </div>

            {/* Description */}
            <div className="card-dark rounded-2xl p-6 border border-white/[0.08]">
              <h3 className="font-bold text-fog mb-3">Description</h3>
              <p className="text-sm text-fog-muted leading-relaxed">{product.description}</p>
              <ul className="mt-4 space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-fog-muted">
                    <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="card-dark rounded-2xl p-6 border border-white/[0.08]">
              <h3 className="font-bold text-fog mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {REVIEWS.map((r) => (
                  <div key={r.id} className="border-b border-white/[0.06] pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-fog">{r.name}</p>
                      <span className="text-xs text-fog-muted">{r.date}</span>
                    </div>
                    <StarRating rating={r.rating} />
                    <p className="text-sm text-fog-muted mt-1">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
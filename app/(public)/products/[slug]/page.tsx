"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShieldCheck, Truck, RotateCcw, Minus, Plus, Check } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Lightbox from "@/components/ui/Lightbox";
import DeliveryBadges from "@/components/ui/DeliveryBadges";
import StickyAddToCart from "@/components/ui/StickyAddToCart";

const MOCK_PRODUCT = {
  id: "1",
  name: "iPhone 15 Pro Max 256GB Natural Titanium",
  slug: "iphone-15-pro-max",
  price: 12499,
  compareAt: 13999,
  images: [
    "https://images.unsplash.com/photo-1592750475338-4b09a80f1c1e?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop",
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
  tags: ["iPhone", "Apple", "Smartphone", "Flagship"],
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
        <Star key={n} className={`${s} ${n <= Math.round(rating) ? "fill-electric text-electric" : "text-fog-200"}`} />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const ctaRef = useRef<HTMLDivElement>(null);

  const product = MOCK_PRODUCT;
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

  const addToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-fog">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Breadcrumbs crumbs={[{ label: "Products", href: "/products" }, { label: product.name }]} />
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-card cursor-pointer" onClick={() => { setLightboxIndex(selectedImage); setLightboxOpen(true); }}>
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedImage(i); setLightboxIndex(i); }}
                  className={`relative w-20 h-20 bg-white rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? "border-electric" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-electric font-medium mb-1">{product.brand}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-charcoal leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} size="md" />
                <span className="text-sm text-charcoal/60">{product.rating} ({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-charcoal">¢{product.price.toLocaleString()}</span>
                {product.compareAt && (
                  <>
                    <span className="text-xl text-charcoal/40 line-through">¢{product.compareAt.toLocaleString()}</span>
                    <span className="text-green-600 font-semibold text-sm">Save ¢{(product.compareAt - product.price).toLocaleString()}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-charcoal/50">Price includes VAT</p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "100% Authentic" },
                { icon: Truck, label: "Fast Delivery" },
                { icon: RotateCcw, label: "14-Day Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white rounded-xl p-3 text-center shadow-card">
                  <Icon className="w-6 h-6 text-electric mx-auto mb-1.5" />
                  <p className="text-xs text-charcoal/70 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* Delivery Badges */}
            <DeliveryBadges />

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock <= 5 && (
                <span className="text-sm text-orange-500 font-medium">
                  ⚠ Only {product.stock} left in stock
                </span>
              )}
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-charcoal mb-2">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-2xl shadow-card">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-3 hover:bg-fog rounded-l-2xl transition-colors"
                  >
                    <Minus className="w-5 h-5 text-charcoal" />
                  </button>
                  <span className="w-12 text-center font-bold text-charcoal">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="p-3 hover:bg-fog rounded-r-2xl transition-colors"
                  >
                    <Plus className="w-5 h-5 text-charcoal" />
                  </button>
                </div>
                <span className="text-sm text-charcoal/50">{product.stock} available</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3" ref={ctaRef}>
              <button
                onClick={addToCart}
                className={`flex-1 py-4 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-electric text-white hover:bg-electric/90"
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
                  wishlist ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-fog-200 text-charcoal/40 hover:text-red-500"
                }`}
              >
                <Heart className={`w-6 h-6 ${wishlist ? "fill-red-500" : ""}`} />
              </button>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-bold text-charcoal mb-3">Description</h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">{product.description}</p>
              <ul className="mt-4 space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-charcoal/70">
                    <Check className="w-4 h-4 text-electric mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-bold text-charcoal mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {REVIEWS.map((r) => (
                  <div key={r.id} className="border-b border-fog last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-charcoal">{r.name}</p>
                      <span className="text-xs text-charcoal/40">{r.date}</span>
                    </div>
                    <StarRating rating={r.rating} />
                    <p className="text-sm text-charcoal/60 mt-1">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        images={product.images}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((i) => (i - 1 + product.images.length) % product.images.length)}
        onNext={() => setLightboxIndex((i) => (i + 1) % product.images.length)}
      />

      <StickyAddToCart product={product} ctaRef={ctaRef as React.RefObject<HTMLElement>} />
    </div>
  );
}

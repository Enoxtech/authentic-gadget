"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, Star, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import TrustBadges from "@/components/ui/TrustBadges";
import DeliveryBadges from "@/components/ui/DeliveryBadges";
import HeroSlider from "../components/ui/HeroSlider";
import { useCart } from "@/context/CartContext";

const FEATURED_PRODUCTS = [
  {
    id: "1", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max",
    price: 12499, compareAt: 13999,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400",
    rating: 4.9, reviews: 128, badge: "Best Seller", brand: "Apple",
    description: "The most powerful iPhone ever with A17 Pro chip and titanium design.",
  },
  {
    id: "2", name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra",
    price: 10999, compareAt: 11999,
    image: "https://images.unsplash.com/photo-1614707268917-71c4c5c6bbb6?w=400",
    rating: 4.8, reviews: 96, badge: "New", brand: "Samsung",
    description: "Galaxy AI powered with S Pen and 200MP camera system.",
  },
  {
    id: "3", name: "MacBook Air M3", slug: "macbook-air-m3",
    price: 8999, compareAt: 9999,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400",
    rating: 4.9, reviews: 64, badge: null, brand: "Apple",
    description: "Supercharged by M3 chip. Fanless design. All-day battery.",
  },
  {
    id: "4", name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5",
    price: 2499, compareAt: 2999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    rating: 4.7, reviews: 215, badge: "-17%", brand: "Sony",
    description: "Industry-leading noise cancellation with exceptional sound quality.",
  },
  {
    id: "5", name: "iPad Pro 12.9\"", slug: "ipad-pro-12-9",
    price: 7499, compareAt: 8499,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    rating: 4.8, reviews: 89, badge: null, brand: "Apple",
    description: "M2 chip powers a new level of performance and creativity.",
  },
  {
    id: "6", name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2",
    price: 4499, compareAt: 4999,
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400",
    rating: 4.9, reviews: 156, badge: "-10%", brand: "Apple",
    description: "The most rugged and capable Apple Watch ever built.",
  },
];

const CATEGORIES = [
  { name: "Smartphones", slug: "smartphones", icon: "📱", count: 42 },
  { name: "Laptops", slug: "laptops", icon: "💻", count: 28 },
  { name: "Audio", slug: "audio", icon: "🎧", count: 63 },
  { name: "Wearables", slug: "wearables", icon: "⌚", count: 35 },
  { name: "Gaming", slug: "gaming", icon: "🎮", count: 51 },
  { name: "Accessories", slug: "accessories", icon: "🔌", count: 97 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-4 h-4 ${n <= Math.round(rating) ? "fill-gold text-gold" : "text-white/20"}`} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { addItem } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  const handleAddToCart = (product: typeof FEATURED_PRODUCTS[0]) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#040820] overflow-x-hidden">
{/* === HERO SLIDER === */}
      <HeroSlider />
      {/* === END HERO SLIDER === */}

      {/* Trust badges */}
      <section className="border-y border-white/[0.06] bg-[#06112B]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "100% Authentic", desc: "Every product verified" },
              { icon: Truck, title: "Fast Delivery", desc: "Same-day in Accra" },
              { icon: RotateCcw, title: "Easy Returns", desc: "14-day return policy" },
              { icon: Star, title: "Top Rated", desc: "4.9/5 customer rating" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-fog">{title}</p>
                  <p className="text-xs text-fog-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-fog">Shop by Category</h2>
            <Link href="/products" className="text-sm text-gold hover:text-gold-light transition-colors font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="card-dark rounded-2xl p-5 text-center transition-all duration-300 hover:border-gold/30 hover:shadow-lg group"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <p className="font-semibold text-sm text-fog group-hover:text-gold transition-colors">{cat.name}</p>
                <p className="text-xs text-fog-muted mt-1">{cat.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold" style={{ color: '#f8f9fb' }}>
              Featured Products
            </h2>
            <Link href="/products" className="text-sm font-medium transition-colors" style={{ color: '#a78bfa' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
              onMouseLeave={e => (e.currentTarget.style.color = '#a78bfa')}
            >
              See all →
            </Link>
          </div>
          <div className="product-grid-subgrid">
            {FEATURED_PRODUCTS.map((product) => (
              <div key={product.id} className="glass-card rounded-2xl overflow-hidden">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="glass-card-image relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {product.badge && (
                      <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full z-10 text-white" style={{ background: product.badge === "Best Seller" ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'linear-gradient(135deg, #f59e0b, #06b6d4)' }}>
                        {product.badge}
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-contain p-4"
                      style={{ transition: 'transform 0.4s ease' }}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-[11px] leading-tight line-clamp-2 mb-1" style={{ color: '#f8f9fb' }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-3">
                      <StarRating rating={product.rating} />
                      <span className="text-[11px]" style={{ color: 'rgba(248,249,251,0.4)' }}>({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="glass-card-price">${product.price.toLocaleString()}</span>
                        {product.compareAt && (
                          <span className="ml-2 text-[12px] line-through" style={{ color: 'rgba(248,249,251,0.4)' }}>${product.compareAt.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                      className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 text-white"
                      style={{ background: added === product.id ? '#22c55e' : 'rgba(255,255,255,0.1)', border: added === product.id ? 'none' : '1px solid rgba(255,255,255,0.15)' }}
                    >
                      {added === product.id ? '✓ Added' : '+ Add to Cart'}
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(212,168,67,0.08)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute -top-20 right-20 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_70%)] blur-3xl" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-fog mb-3">
            Stay in the Loop
          </h2>
          <p className="text-fog-muted mb-8">
            Get exclusive deals, new arrivals, and gadget tips delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 rounded-2xl text-sm focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#f8f9fb' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
            />
            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <DeliveryBadges />
      <TrustBadges />
    </div>
  );
}
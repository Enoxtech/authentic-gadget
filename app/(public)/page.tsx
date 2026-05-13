"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { ArrowRight, Zap, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { motion } from 'framer-motion';
import TrustBadges from "@/components/ui/TrustBadges";
import DeliveryBadges from "@/components/ui/DeliveryBadges";
import { useCart } from "@/context/CartContext";

const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    price: 12499,
    compareAt: 13999,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 128,
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    price: 10999,
    compareAt: 11999,
    image: "https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 96,
    badge: "New",
  },
  {
    id: "3",
    name: "MacBook Air M3",
    price: 8999,
    compareAt: 9999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 64,
    badge: null,
  },
  {
    id: "4",
    name: "Sony WH-1000XM5",
    price: 2499,
    compareAt: 2999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 215,
    badge: "-17%",
  },
  {
    id: "5",
    name: "iPad Pro 12.9\"",
    price: 7499,
    compareAt: 8499,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 89,
    badge: null,
  },
  {
    id: "6",
    name: "Apple Watch Ultra 2",
    price: 4499,
    compareAt: 4999,
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 156,
    badge: "-10%",
  },
];

const CATEGORIES = [
  {
    name: "Smartphones",
    slug: "smartphones",
    image: "https://images.unsplash.com/photo-1592750475338-4b09a80f1c1e?w=300&h=200&fit=crop",
    count: 42,
  },
  {
    name: "Laptops",
    slug: "laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop",
    count: 28,
  },
  {
    name: "Audio",
    slug: "audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
    count: 63,
  },
  {
    name: "Wearables",
    slug: "wearables",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=200&fit=crop",
    count: 35,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? "fill-electric text-electric" : "text-fog-200"}`}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-dark-space overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-midnight overflow-hidden">
        {/* Ambient background effects */}
        <div className="orb orb-gold w-[500px] h-[500px] -top-20 -left-20 opacity-20" />
        <div className="orb orb-electric w-[400px] h-[400px] -bottom-20 -right-20 opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-electric/10 border border-electric/20 rounded-full px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-electric"></span>
                </span>
                <span className="text-electric text-sm font-medium">Gaming Consoles Now Available</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05]">
                Level Up Your{" "}
                <span className="text-electric">Tech Game</span>
              </h1>

              <p className="text-white/60 text-lg md:text-xl max-w-lg leading-relaxed">
                Authentic gadgets, unbeatable deals. From PS5s to MacBooks — all verified, all warrantied.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-electric hover:bg-electric/90 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] active:scale-95"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-all active:scale-95"
                >
                  Track Order
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%231a1a2e'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%23fff' text-anchor='middle' dy='.3em'%3E%E2%9C%A8%3C/text%3E%3C/svg%3E",
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%230B1F3A'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%23D4AF37' text-anchor='middle' dy='.3em'%3E%F0%9F%8E%AE%3C/text%3E%3C/svg%3E",
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%230B1F3A'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%2300D2FF' text-anchor='middle' dy='.3em'%3E%F0%9F%A5%B0%3C/text%3E%3C/svg%3E",
                  ].map((src, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-midnight overflow-hidden bg-midnight">
                      <Image src={src} alt="" width={40} height={40} className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">Loved by 2,400+ customers</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Floating product showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative h-[420px] lg:h-[520px]"
            >
              {/* Glow base */}
              <div className="absolute inset-0 bg-gradient-to-b from-electric/10 to-transparent rounded-3xl blur-2xl" />

              {/* Main product card - float animation */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] rounded-3xl bg-gradient-to-br from-[#0B1F3A] to-[#0a1628] border border-white/10 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
                  <div className="relative w-full h-full">
                    <img
                      src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop&q=60"
                      alt="PS5 Console"
                      className="w-full h-full object-contain drop-shadow-2xl"
                      loading="eager"
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-electric text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    -15% OFF
                  </div>
                </div>
              </motion.div>

              {/* Secondary card 1 - top left */}
              <motion.div
                animate={{ y: [0, 8, 0], rotate: [355, 360, 355] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-4 left-0 z-20"
              >
                <div className="w-[110px] h-[110px] md:w-[130px] md:h-[130px] rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#0a1628] border border-white/10 p-3 shadow-xl">
                  <div className="relative w-full h-full">
                    <img
                      src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&auto=format&fit=crop&q=60"
                      alt="MacBook Pro"
                      className="w-full h-full object-contain"
                      loading="eager"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Secondary card 2 - right side */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [5, 0, 5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-12 right-0 md:right-8 z-20"
              >
                <div className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#0a1628] border border-white/10 p-2.5 shadow-xl">
                  <div className="relative w-full h-full">
                    <img
                      src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&auto=format&fit=crop&q=60"
                      alt="Gaming Headset"
                      className="w-full h-full object-contain"
                      loading="eager"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Tertiary card - bottom left */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                className="absolute bottom-8 left-4 md:left-12 z-20"
              >
                <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#0a1628] border border-white/10 p-2 shadow-xl">
                  <div className="relative w-full h-full">
                    <img
                      src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=60"
                      alt="Apple Watch"
                      className="w-full h-full object-contain"
                      loading="eager"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Pulse rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                  className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full border border-electric/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.08, 0, 0.08] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
                  className="absolute inset-0 rounded-full border border-electric/20"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-white border-b border-fog-200">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, label: "100% Authentic", sub: "Verified products" },
            { icon: Truck, label: "Fast Delivery", sub: "Across Ghana" },
            { icon: Zap, label: "Best Prices", sub: "Affordable luxury" },
            { icon: RotateCcw, label: "Easy Returns", sub: "14-day policy" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center justify-center gap-3">
              <Icon className="w-6 h-6 text-electric hidden sm:block" />
              <div>
                <p className="font-semibold text-sm text-charcoal">{label}</p>
                <p className="text-xs text-charcoal/50">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-fog">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-charcoal">
                Shop by Category
              </h2>
              <p className="text-charcoal/50 mt-1">
                Find what you need, fast
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm text-electric font-semibold hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-midnight aspect-[4/3] card-3d shadow-layers"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="font-semibold text-white text-sm">{cat.name}</p>
                  <p className="text-white/60 text-xs">{cat.count} products</p>
                </div>
                </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-charcoal">
                Featured Products
              </h2>
              <p className="text-charcoal/50 mt-1">
                Handpicked for you
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm text-electric font-semibold hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 stagger-children">
            {FEATURED_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group bg-fog rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-300 card-3d shadow-layers"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="block"
                >
                  <div className="relative aspect-square bg-white p-4">
                  {product.badge && (
                    <span
                      className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full z-10 ${
                        product.badge === "Best Seller"
                          ? "bg-electric text-white"
                          : product.badge === "New"
                          ? "bg-midnight text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-charcoal/50">
                      {product.reviews}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-charcoal leading-tight mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">
                      ¢{product.price.toLocaleString()}
                    </span>
                    {product.compareAt && (
                      <span className="text-xs text-charcoal/40 line-through">
                        ¢{product.compareAt.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-midnight relative overflow-hidden">
        {/* Background orbs for newsletter */}
        <div className="orb orb-blue w-96 h-96 -bottom-40 -left-40" style={{ animationDelay: '1s' }} />
        <div className="orb orb-gold w-64 h-64 -top-20 right-20" style={{ animationDelay: '3s' }} />
        
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Stay in the Loop
          </h2>
          <p className="text-white/50 mb-8">
            Get exclusive deals, new arrivals, and gadget tips delivered to your
            inbox.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-electric"
            />
            <button
              type="submit"
              className="btn-glossy px-8 py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-all whitespace-nowrap spring-press"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      </div>
      <DeliveryBadges />
      <TrustBadges />
    </>
  );
}
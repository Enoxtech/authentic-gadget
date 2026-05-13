"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, Star, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import TrustBadges from "@/components/ui/TrustBadges";
import DeliveryBadges from "@/components/ui/DeliveryBadges";
import { useCart } from "@/context/CartContext";

const FEATURED_PRODUCTS = [
  {
    id: "1", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max",
    price: 12499, compareAt: 13999,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400",
    rating: 4.9, reviews: 128, badge: "Best Seller", brand: "Apple",
  },
  {
    id: "2", name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra",
    price: 10999, compareAt: 11999,
    image: "https://images.unsplash.com/photo-1614707268917-71c4c5c6bbb6?w=400",
    rating: 4.8, reviews: 96, badge: "New", brand: "Samsung",
  },
  {
    id: "3", name: "MacBook Air M3", slug: "macbook-air-m3",
    price: 8999, compareAt: 9999,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400",
    rating: 4.9, reviews: 64, badge: null, brand: "Apple",
  },
  {
    id: "4", name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5",
    price: 2499, compareAt: 2999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    rating: 4.7, reviews: 215, badge: "-17%", brand: "Sony",
  },
  {
    id: "5", name: "iPad Pro 12.9\"", slug: "ipad-pro-12-9",
    price: 7499, compareAt: 8499,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    rating: 4.8, reviews: 89, badge: null, brand: "Apple",
  },
  {
    id: "6", name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2",
    price: 4499, compareAt: 4999,
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400",
    rating: 4.9, reviews: 156, badge: "-10%", brand: "Apple",
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
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Ambient background — gold orb */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(212,168,67,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        {/* Blue orb bottom right */}
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                </span>
                <span className="text-gold text-sm font-semibold">Gaming Consoles Now Available</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-fog leading-[1.05]">
                Level Up Your{" "}
                <span className="text-gold">Tech Game</span>
              </h1>

              <p className="text-fog-muted text-lg md:text-xl max-w-lg leading-relaxed">
                Authentic gadgets, unbeatable deals. From PS5s to MacBooks — all verified, all warrantied.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-[#030618] font-bold px-8 py-4 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(212,168,67,0.4)] active:scale-95 text-base"
                >
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-fog font-semibold px-8 py-4 rounded-xl transition-all active:scale-95 text-base"
                >
                  Track Order
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex -space-x-3">
                  {["👨🏿", "👩🏾", "👨🏿‍🦱", "👩🏿"].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#06112B] bg-[#0B1E3D] flex items-center justify-center text-lg">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-fog-muted text-xs mt-0.5">Loved by 2,400+ customers</p>
                </div>
              </div>
            </motion.div>

            {/* Floating product showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative h-[420px] lg:h-[520px] hidden md:block"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-3xl" />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div className="w-[280px] h-[280px] lg:w-[340px] lg:h-[340px] rounded-3xl bg-[#06112B] border border-gold/10 p-6 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop&q=60"
                    alt="PS5 Console"
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                  <div className="absolute -bottom-3 -right-3 bg-gold text-[#030618] text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    -15% OFF
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-4 left-0"
              >
                <div className="w-[110px] h-[110px] lg:w-[130px] lg:h-[130px] rounded-2xl bg-[#06112B] border border-white/[0.08] p-3 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&auto=format&fit=crop&q=60" alt="MacBook" className="w-full h-full object-contain" loading="eager" />
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-12 right-0"
              >
                <div className="w-[90px] h-[90px] lg:w-[110px] lg:h-[110px] rounded-2xl bg-[#06112B] border border-white/[0.08] p-2.5 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&auto=format&fit=crop&q=60" alt="Headphones" className="w-full h-full object-contain" loading="eager" />
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                className="absolute bottom-8 left-4 lg:left-12"
              >
                <div className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-2xl bg-[#06112B] border border-white/[0.08] p-2 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=60" alt="Watch" className="w-full h-full object-contain" loading="eager" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

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
      <section className="py-16 bg-[#06112B]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-fog">
              Featured Products
            </h2>
            <Link href="/products" className="text-sm text-gold hover:text-gold-light transition-colors font-medium">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURED_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="card-dark rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold/20 hover:shadow-lg"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              >
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative aspect-square bg-[#0B1E3D] p-5 overflow-hidden">
                    {product.badge && (
                      <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full z-10 ${
                        product.badge === "Best Seller" ? "bg-gold text-[#030618]" : "bg-electric text-white"
                      }`}>
                        {product.badge}
                      </span>
                    )}
                    <div className="relative w-full h-full">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] text-gold/60 font-medium uppercase tracking-wider mb-1">{product.brand}</p>
                    <h3 className="font-semibold text-[14px] text-fog leading-tight line-clamp-2 mb-2 min-h-[40px]">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-3">
                      <StarRating rating={product.rating} />
                      <span className="text-[11px] text-fog-muted">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[15px] font-bold text-gold">¢{product.price.toLocaleString()}</span>
                        {product.compareAt && (
                          <span className="ml-2 text-[12px] text-fog-muted line-through">¢{product.compareAt.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                      className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        added === product.id
                          ? "bg-green-600 text-white"
                          : "bg-gold/10 border border-gold/20 text-gold hover:bg-gold hover:text-[#030618]"
                      }`}
                    >
                      {added === product.id ? "✓ Added to Cart" : "+ Add to Cart"}
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
              className="flex-1 px-5 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.10] text-fog placeholder:text-fog-muted text-sm focus:outline-none focus:border-gold/30 transition-all"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gold hover:bg-gold-dark text-[#030618] font-bold rounded-2xl transition-all whitespace-nowrap"
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
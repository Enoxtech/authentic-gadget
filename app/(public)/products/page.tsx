"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Filter, SlidersHorizontal, X, ShoppingCart } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCart } from "@/context/CartContext";

// Use raw Unsplash URLs without dimension constraints for reliability
const PRODUCTS = [
  {
    id: "1", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max",
    price: 12499, compareAt: 13999,
    image: "https://images.unsplash.com/photo-1592750475338-4b09a80f1c1e",
    rating: 4.9, reviews: 128, category: "Smartphones", badge: "Best Seller",
    brand: "Apple",
  },
  {
    id: "2", name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra",
    price: 10999, compareAt: 11999,
    image: "https://images.unsplash.com/photo-1610945415295-d9-1f7c8be6cb0",
    rating: 4.8, reviews: 96, category: "Smartphones", badge: "New",
    brand: "Samsung",
  },
  {
    id: "3", name: "MacBook Air M3", slug: "macbook-air-m3",
    price: 8999, compareAt: 9999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    rating: 4.9, reviews: 64, category: "Laptops", badge: null,
    brand: "Apple",
  },
  {
    id: "4", name: "Sony WH-1000XM5 Headphones", slug: "sony-wh-1000xm5",
    price: 2499, compareAt: 2999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    rating: 4.7, reviews: 215, category: "Audio", badge: "-17%",
    brand: "Sony",
  },
  {
    id: "5", name: "iPad Pro 12.9\"", slug: "ipad-pro-12-9",
    price: 7499, compareAt: 8499,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
    rating: 4.8, reviews: 89, category: "Tablets", badge: null,
    brand: "Apple",
  },
  {
    id: "6", name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2",
    price: 4499, compareAt: 4999,
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d",
    rating: 4.9, reviews: 156, category: "Wearables", badge: "-10%",
    brand: "Apple",
  },
  {
    id: "7", name: "Samsung Galaxy Buds2 Pro", slug: "samsung-galaxy-buds2-pro",
    price: 999, compareAt: 1299,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
    rating: 4.6, reviews: 78, category: "Audio", badge: "-23%",
    brand: "Samsung",
  },
  {
    id: "8", name: "Dell XPS 15", slug: "dell-xps-15",
    price: 11499, compareAt: 12999,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    rating: 4.7, reviews: 53, category: "Laptops", badge: "-12%",
    brand: "Dell",
  },
  {
    id: "9", name: "PlayStation 5", slug: "playstation-5",
    price: 4999, compareAt: null,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
    rating: 4.9, reviews: 312, category: "Gaming", badge: "New",
    brand: "Sony",
  },
  {
    id: "10", name: "AirPods Max", slug: "airpods-max",
    price: 3499, compareAt: 3999,
    image: "https://images.unsplash.com/photo-1625245488600-f03fef636a3c",
    rating: 4.8, reviews: 189, category: "Audio", badge: "-13%",
    brand: "Apple",
  },
  {
    id: "11", name: "Google Pixel 8 Pro", slug: "google-pixel-8-pro",
    price: 7999, compareAt: 8999,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
    rating: 4.8, reviews: 67, category: "Smartphones", badge: "-11%",
    brand: "Google",
  },
  {
    id: "12", name: "Nintendo Switch OLED", slug: "nintendo-switch-oled",
    price: 2499, compareAt: 2799,
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e",
    rating: 4.8, reviews: 241, category: "Gaming", badge: null,
    brand: "Nintendo",
  },
];

const CATEGORIES = ["All", "Smartphones", "Laptops", "Audio", "Wearables", "Gaming", "Tablets"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? "fill-gold text-gold" : "text-white/20"}`} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block card-dark rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-lg"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(201,169,110,0.08)' }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#0B1E3D] p-5 overflow-hidden">
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full z-10 ${
            product.badge === "Best Seller"
              ? "bg-gold text-[#030618]"
              : product.badge === "New"
              ? "bg-electric text-white"
              : "bg-red-500 text-white"
          }`}>
            {product.badge}
          </span>
        )}
        {discount > 0 && !product.badge && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full z-10">
            -{discount}%
          </span>
        )}
        <div className="relative w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        </div>
        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlist(!wishlist); }}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            wishlist ? "bg-red-500 text-white" : "bg-[rgba(255,255,255,0.08)] text-white/60 hover:text-red-400 backdrop-blur-sm"
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlist ? "fill-white" : ""}`} />
        </button>
      </div>

      {/* Info */}
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
        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            added
              ? "bg-green-600 text-white"
              : "bg-gold/10 border border-gold/20 text-gold hover:bg-gold hover:text-[#030618]"
          }`}
        >
          {added ? (
            <>✓ Added</>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = PRODUCTS.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#040820]">
      {/* Header */}
      <div className="bg-[#06112B] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-8">
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Products" }]} />
          <div className="flex items-end justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-fog">All Products</h1>
              <p className="text-fog-muted text-sm mt-1">{sorted.length} authentic products</p>
            </div>
            {/* Sort — desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-fog-muted">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white/[0.06] border border-white/[0.10] text-fog text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-gold/30"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: "#06112B" }}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category pills — horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-gold text-[#030618] font-bold"
                  : "bg-[#06112B] text-fog-muted border border-white/[0.08] hover:border-gold/30 hover:text-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setShowFilter(true)}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 bg-[#06112B] border border-white/[0.08] rounded-xl text-fog text-sm mb-4"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter & Sort
        </button>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-20">
            <p className="text-fog-muted text-lg">No products found in this category.</p>
            <button onClick={() => setSelectedCategory("All")} className="mt-4 text-gold hover:underline text-sm">
              View all products →
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {showFilter && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowFilter(false)} />
          <div className="relative ml-auto w-full bg-[#06112B] border-l border-white/[0.08] p-6 pt-20">
            <button
              onClick={() => setShowFilter(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/[0.08] rounded-xl"
            >
              <X className="w-5 h-5 text-fog" />
            </button>
            <h3 className="text-lg font-bold text-fog mb-4">Sort By</h3>
            <div className="space-y-2 mb-8">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setSort(o.value); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm ${
                    sort === o.value ? "bg-gold text-[#030618] font-bold" : "text-fog-muted hover:bg-white/[0.05]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <h3 className="text-lg font-bold text-fog mb-4">Categories</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm ${
                    selectedCategory === cat ? "bg-gold text-[#030618] font-bold" : "text-fog-muted hover:bg-white/[0.05]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
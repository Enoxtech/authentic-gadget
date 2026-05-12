"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Filter } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const ALL_PRODUCTS = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    price: 12499,
    compareAt: 13999,
    image: "https://images.unsplash.com/photo-1592750475338-4b09a80f1c1e?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 128,
    category: "Smartphones",
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    price: 10999,
    compareAt: 11999,
    image: "https://images.unsplash.com/photo-1610945415295-d9-1f7c8be6cb0?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 96,
    category: "Smartphones",
    badge: "New",
  },
  {
    id: "3",
    name: "MacBook Air M3",
    slug: "macbook-air-m3",
    price: 8999,
    compareAt: 9999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 64,
    category: "Laptops",
    badge: null,
  },
  {
    id: "4",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    price: 2499,
    compareAt: 2999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 215,
    category: "Audio",
    badge: "-17%",
  },
  {
    id: "5",
    name: "iPad Pro 12.9\"",
    slug: "ipad-pro-12-9",
    price: 7499,
    compareAt: 8499,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 89,
    category: "Tablets",
    badge: null,
  },
  {
    id: "6",
    name: "Apple Watch Ultra 2",
    slug: "apple-watch-ultra-2",
    price: 4499,
    compareAt: 4999,
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 156,
    category: "Wearables",
    badge: "-10%",
  },
  {
    id: "7",
    name: "Samsung Galaxy Buds2 Pro",
    slug: "samsung-galaxy-buds2-pro",
    price: 999,
    compareAt: 1299,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 78,
    category: "Audio",
    badge: "-23%",
  },
  {
    id: "8",
    name: "Dell XPS 15",
    slug: "dell-xps-15",
    price: 11499,
    compareAt: 12999,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 53,
    category: "Laptops",
    badge: "-12%",
  },
  {
    id: "9",
    name: "PlayStation 5",
    slug: "playstation-5",
    price: 4999,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 312,
    category: "Gaming",
    badge: "New",
  },
  {
    id: "10",
    name: "AirPods Max",
    slug: "airpods-max",
    price: 3499,
    compareAt: 3999,
    image: "https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 189,
    category: "Audio",
    badge: "-13%",
  },
  {
    id: "11",
    name: "Google Pixel 8 Pro",
    slug: "google-pixel-8-pro",
    price: 7999,
    compareAt: 8999,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 67,
    category: "Smartphones",
    badge: "-11%",
  },
  {
    id: "12",
    name: "Nintendo Switch OLED",
    slug: "nintendo-switch-oled",
    price: 2499,
    compareAt: 2799,
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 241,
    category: "Gaming",
    badge: null,
  },
];

const CATEGORIES = ["All", "Smartphones", "Laptops", "Audio", "Wearables", "Gaming", "Tablets"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const metadata = {
  title: "Shop All Products | Authentic Gadget",
  description: "Browse our full range of authentic tech gadgets. Gaming consoles, laptops, audio gear, wearables and accessories.",
};

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = ALL_PRODUCTS.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-fog">
      {/* Header */}
      <div className="bg-midnight text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumbs crumbs={[{ label: "Products" }]} />
          <h1 className="text-3xl font-bold mb-2">All Products</h1>
          <p className="text-white/60">{sorted.length} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters bar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-electric text-white"
                    : "bg-white text-charcoal/60 hover:bg-fog"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm text-charcoal/70 shadow-card sm:hidden"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 bg-white rounded-xl text-sm text-charcoal shadow-card border-none focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="relative aspect-square bg-white p-4">
                {product.badge && (
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full z-10 ${
                    product.badge === "Best Seller" ? "bg-electric text-white"
                    : product.badge === "New" ? "bg-midnight text-white"
                    : "bg-red-500 text-white"
                  }`}>
                    {product.badge}
                  </span>
                )}
                <div className="relative w-full aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); }}
                  className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-electric hover:text-white"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 pt-0">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 fill-electric text-electric" />
                  <span className="text-xs text-charcoal/60">{product.rating} ({product.reviews})</span>
                </div>
                <h3 className="font-semibold text-sm text-charcoal leading-tight line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal">¢{product.price.toLocaleString()}</span>
                  {product.compareAt && (
                    <span className="text-xs text-charcoal/40 line-through">¢{product.compareAt.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

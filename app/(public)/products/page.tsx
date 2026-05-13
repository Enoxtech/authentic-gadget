"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Filter, SlidersHorizontal, X, ShoppingCart, ArrowLeft } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  rating: number;
  reviews_count: number;
  category: string | null;
  badge: string | null;
  brand: string | null;
}

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

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;
  const primaryImage = product.images?.[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block card-dark rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold/30"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(201,169,110,0.08)" }}
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
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        </div>
        {/* Wishlist */}
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
        <p className="text-[11px] text-gold/60 font-medium uppercase tracking-wider mb-1">{product.brand || ""}</p>
        <h3 className="font-semibold text-[14px] text-fog leading-tight line-clamp-2 mb-2 min-h-[40px]">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-[11px] text-fog-muted">({product.reviews_count})</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[15px] font-bold text-gold">¢{product.price.toLocaleString()}</span>
            {product.compare_at_price && (
              <span className="ml-2 text-[12px] text-fog-muted line-through">¢{product.compare_at_price.toLocaleString()}</span>
            )}
          </div>
        </div>
        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            added
              ? "bg-green-600 text-white"
              : "bg-gold/10 border border-gold/20 text-gold hover:bg-gold hover:text-[#030618]"
          }`}
        >
          {added ? (
            <><CheckCircle className="w-4 h-4" /> Added</>
          ) : (
            <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
          )}
        </button>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="card-dark rounded-2xl overflow-hidden">
      <div className="aspect-square bg-[#0B1E3D] animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-white/5 rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
        <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
        <div className="h-8 bg-white/5 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [showFilter, setShowFilter] = useState(false);

  // Extract unique categories from products
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))] as string[];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*&is_active=eq.true&order=created_at.desc`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data as Product[]);
      } catch (err: any) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filtered = products.filter(
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
              <p className="text-fog-muted text-sm mt-1">{loading ? "Loading..." : `${sorted.length} authentic products`}</p>
            </div>
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
        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-gold hover:text-gold-light text-sm font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Category pills */}
        {!loading && !error && categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
            {categories.map((cat) => (
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
        )}

        {/* Mobile filter button */}
        <button
          onClick={() => setShowFilter(true)}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 bg-[#06112B] border border-white/[0.08] rounded-xl text-fog text-sm mb-4"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter & Sort
        </button>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {sorted.length === 0 && !loading && !error && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-fog-muted text-lg mb-4">No products found in this category.</p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-gold hover:text-gold-light text-sm font-medium transition-colors"
            >
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
            <button onClick={() => setShowFilter(false)} className="absolute top-4 right-4 p-2 hover:bg-white/[0.08] rounded-xl">
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
              {categories.map((cat) => (
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
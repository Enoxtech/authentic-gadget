"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, SlidersHorizontal, X, ShoppingCart } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

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
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;
  const primaryImage = product.images?.[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400";
  const wishlist = isWishlisted(product.id);

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
        {/* Quick View overlay */}
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
          {/* Quick View overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
            <Link
              href={`/products/${product.slug}`}
              className="px-4 py-2 rounded-xl text-white text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
              onClick={e => e.stopPropagation()}
            >
              Quick View
            </Link>
          </div>
        </div>
        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist({ ...product, images: product.images || [] });
          }}
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [showFilter, setShowFilter] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const handleColorFilter = (color: string) => {
    setActiveColor(prev => prev === color ? null : color);
  };

  const colorCategoryMap: Record<string, string[]> = {
    "#000000": ["black", "dark"],
    "#ffffff": ["white", "silver"],
    "#7c3aed": ["violet", "purple"],
    "#06b6d4": ["cyan", "teal"],
    "#ef4444": ["red"],
    "#22c55e": ["green"],
    "#3b82f6": ["blue"],
    "#ec4899": ["pink"],
  };

  // Show skeleton loaders for 1.5s on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowSkeletons(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Extract unique categories from products
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))] as string[];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data as Product[]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const filtered = products.filter((p) => {
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
    if (activeColor) {
      // Simple color-to-tag matching for visual search
      const colorTags = colorCategoryMap[activeColor] || [];
      const productTags = [p.brand, p.category].filter(Boolean).map(t => t!.toLowerCase());
      const matches = colorTags.some(t => productTags.some(pt => pt.includes(t)));
      if (!matches) return false;
    }
    return true;
  });
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
                onClick={() => handleFilter(cat)}
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

        {/* Color filter */}
        <div className="mb-6">
          <p className="text-xs font-medium mb-3 text-fog-muted">SEARCH BY COLOR</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { color: "#ffffff", label: "White" },
              { color: "#000000", label: "Black" },
              { color: "#7c3aed", label: "Violet" },
              { color: "#06b6d4", label: "Cyan" },
              { color: "#f59e0b", label: "Amber" },
              { color: "#ef4444", label: "Red" },
              { color: "#22c55e", label: "Green" },
              { color: "#3b82f6", label: "Blue" },
              { color: "#ec4899", label: "Pink" },
            ].map(({ color, label }) => (
              <button
                key={color}
                onClick={() => handleColorFilter(color)}
                className="relative w-8 h-8 rounded-full transition-transform hover:scale-110"
                style={{
                  background: color,
                  border: activeColor === color ? '2px solid #D4A843' : '2px solid transparent',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                title={label}
              >
                {activeColor === color && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full" style={{ background: color === '#ffffff' ? '#000' : '#fff' }} />
                  </span>
                )}
              </button>
            ))}
            {activeColor && (
              <button
                onClick={() => setActiveColor(null)}
                className="text-xs px-3 py-1 rounded-full transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(240,237,230,0.6)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Products grid */}
        {loading || showSkeletons ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-dark rounded-2xl overflow-hidden">
                <div className="skeleton aspect-square" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-3 w-16 rounded" />
                  <div className="skeleton h-9 w-full rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`products-grid stagger-children`}>
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

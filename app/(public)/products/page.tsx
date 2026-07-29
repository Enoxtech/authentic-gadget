"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Eye, Heart, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useQuickView } from "@/context/QuickViewContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn, formatPrice } from "@/lib/utils";

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
  stock?: number | null;
  created_at?: string | null;
}

type SortOption = "latest" | "price-asc" | "price-desc" | "popular";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%230B1E3D'/%3E%3Ctext x='300' y='320' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='140' fill='%23D4A843' text-anchor='middle'%3EAG%3C/text%3E%3C/svg%3E";

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function categorySlug(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ProductGridSkeleton() {
  return (
    <div className="products-grid">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="rounded-[32px] overflow-hidden border border-[var(--border-color)] bg-[var(--surface-glass)]">
          <div className="aspect-square skeleton" />
          <div className="p-3 space-y-2">
            <div className="h-2 w-1/3 rounded-full skeleton" />
            <div className="h-3 w-4/5 rounded-full skeleton" />
            <div className="h-3 w-3/5 rounded-full skeleton" />
            <div className="flex justify-between items-center mt-2">
              <div className="h-4 w-1/3 rounded-full skeleton" />
              <div className="h-7 w-7 rounded-full skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { open: openQuickView } = useQuickView();
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || FALLBACK_IMAGE);
  const [imgLoaded, setImgLoaded] = useState(false);
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;
  const wishlist = isWishlisted(product.id);
  const inStock = product.stock === undefined || product.stock === null || product.stock > 0;

  useEffect(() => {
    if (imgLoaded || imgSrc === FALLBACK_IMAGE) return;
    const timer = setTimeout(() => setImgSrc(FALLBACK_IMAGE), 6000);
    return () => clearTimeout(timer);
  }, [imgLoaded, imgSrc]);

  function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!inStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imgSrc,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-[32px] border border-[var(--border-color)] bg-[var(--surface-glass)] backdrop-blur-[12px] card-premium overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-[28px] bg-[var(--surface-raised)]">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 16vw"
          className={cn("object-contain p-2 group-hover:scale-105 transition-transform duration-300", !inStock && "opacity-55")}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          unoptimized
        />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {!inStock && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-white">Out of Stock</span>}
          {inStock && product.badge && (
            <span
              className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full",
                product.badge === "Best Seller"
                  ? "bg-gold text-[#030618]"
                  : product.badge === "New"
                  ? "bg-electric text-white"
                  : "bg-red-500 text-white"
              )}
            >
              {product.badge}
            </span>
          )}
          {inStock && discount > 0 && !product.badge && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
              -{discount}%
            </span>
          )}
        </div>

        <button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist({ ...product, images: product.images || [] });
          }}
          className={cn(
            "absolute top-2.5 right-2.5 h-8 w-8 flex items-center justify-center rounded-full bg-[var(--surface-glass-strong)] backdrop-blur-md border border-[var(--border-color)] transition-all duration-200 hover:scale-110 active:scale-95",
            wishlist ? "text-red-500" : "text-[var(--text-muted)] hover:text-red-500"
          )}
          aria-label={wishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-3.5 w-3.5", wishlist && "fill-current")} />
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            openQuickView({
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              compare_at_price: product.compare_at_price,
              images: product.images,
              brand: product.brand,
              rating: product.rating,
              reviews_count: product.reviews_count,
            });
          }}
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[var(--surface-glass-strong)] backdrop-blur-md border border-[var(--border-color)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap"
        >
          <Eye className="h-3 w-3" /> Quick View
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-widest font-label truncate">
          {product.brand || product.category || "Authentic Gadget"}
        </p>
        <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug flex-1 font-display">
          {product.name}
        </p>

        <div className="flex items-center justify-between mt-2 gap-1">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gold font-label text-xs tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-[10px] text-[var(--text-muted)] line-through font-label tabular-nums">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-full shrink-0 transition-all duration-200",
              inStock
                ? added
                  ? "bg-green-600 text-white scale-95"
                  : "bg-electric text-white hover:scale-110 hover:shadow-md active:scale-90"
                : "bg-[var(--surface)] text-[var(--text-muted)] cursor-not-allowed opacity-50"
            )}
            aria-label={inStock ? "Add to cart" : "Out of stock"}
          >
            {added ? <CheckCircle className="h-3 w-3" /> : <ShoppingCart className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </Link>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = (await response.json()) as Product[];
        setProducts(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const bySlug = new Map<string, string>();
    for (const product of products) {
      if (!product.category) continue;
      bySlug.set(categorySlug(product.category), product.category);
    }
    return Array.from(bySlug, ([slug, name]) => ({ slug, name }));
  }, [products]);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const category = categorySlug(selectedCategory);
    const result = products.filter((product) => {
      if (query) {
        const haystack = [product.name, product.brand, product.category].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (category && categorySlug(product.category) !== category) return false;
      if (inStockOnly && product.stock !== undefined && product.stock !== null && product.stock <= 0) return false;
      if (onSaleOnly && !product.compare_at_price) return false;
      return true;
    });

    result.sort((left, right) => {
      if (sortBy === "price-asc") return left.price - right.price;
      if (sortBy === "price-desc") return right.price - left.price;
      if (sortBy === "popular") return (right.reviews_count || right.rating || 0) - (left.reviews_count || left.rating || 0);
      return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime();
    });

    return result;
  }, [inStockOnly, onSaleOnly, products, searchQuery, selectedCategory, sortBy]);

  const hasFilters = Boolean(selectedCategory || inStockOnly || onSaleOnly);
  const currentTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : selectedCategory
    ? categories.find((category) => category.slug === categorySlug(selectedCategory))?.name || "Products"
    : "All Products";

  function clearFilters() {
    setSelectedCategory("");
    setInStockOnly(false);
    setOnSaleOnly(false);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display truncate">
              {currentTitle}
            </h1>
            <p className="text-sm text-[var(--text-muted)] font-display">
              {loading ? "Loading..." : `${filtered.length} authentic products`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-[var(--surface)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low-High</option>
                <option value="price-desc">Price: High-Low</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors",
                hasFilters
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
            </button>
          </div>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="flex items-center gap-1 px-3 py-1 bg-gold/10 text-gold text-xs rounded-full font-medium"
              >
                {categories.find((category) => category.slug === categorySlug(selectedCategory))?.name || selectedCategory}
                <X className="h-3 w-3" />
              </button>
            )}
            {inStockOnly && (
              <button onClick={() => setInStockOnly(false)} className="flex items-center gap-1 px-3 py-1 bg-gold/10 text-gold text-xs rounded-full font-medium">
                In Stock <X className="h-3 w-3" />
              </button>
            )}
            {onSaleOnly && (
              <button onClick={() => setOnSaleOnly(false)} className="flex items-center gap-1 px-3 py-1 bg-gold/10 text-gold text-xs rounded-full font-medium">
                On Sale <X className="h-3 w-3" />
              </button>
            )}
            <button onClick={clearFilters} className="px-3 py-1 text-xs text-[var(--text-muted)] underline">
              Clear all
            </button>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory("")}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                !selectedCategory
                  ? "bg-gold text-[#030618] font-bold"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-gold/40"
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setSelectedCategory(category.slug === categorySlug(selectedCategory) ? "" : category.slug)}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  category.slug === categorySlug(selectedCategory)
                    ? "bg-gold text-[#030618] font-bold"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-gold/40"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-gold hover:text-gold-light text-sm font-medium transition-colors">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <ProductGridSkeleton />
        ) : filtered.length > 0 ? (
          <div className="products-grid stagger-children">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !error ? (
          <div className="text-center py-20 rounded-[28px] border border-[var(--border-color)] bg-[var(--surface-glass)]">
            <div className="text-5xl mb-4">AG</div>
            <p className="text-[var(--text-muted)] text-lg mb-4">No products found.</p>
            <button onClick={clearFilters} className="text-gold hover:text-gold-light text-sm font-medium transition-colors">
              View all products
            </button>
          </div>
        ) : null}
      </div>

      {showFilters && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] rounded-t-[28px] p-6 max-h-[82vh] overflow-y-auto border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="h-9 w-9 rounded-full border border-[var(--border-color)] flex items-center justify-center">
                <X className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="sm:hidden">
                <p className="font-semibold text-sm text-[var(--text-primary)] mb-3">Sort By</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["latest", "Latest"],
                    ["price-asc", "Low-High"],
                    ["price-desc", "High-Low"],
                    ["popular", "Popular"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setSortBy(value as SortOption)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-medium border transition-colors",
                        sortBy === value ? "bg-gold text-[#030618] border-gold" : "border-[var(--border-color)] text-[var(--text-secondary)]"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)] mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => setSelectedCategory(category.slug === categorySlug(selectedCategory) ? "" : category.slug)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                        category.slug === categorySlug(selectedCategory)
                          ? "bg-gold text-[#030618] border-gold"
                          : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gold/40"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "In Stock Only", value: inStockOnly, onChange: setInStockOnly },
                  { label: "On Sale Only", value: onSaleOnly, onChange: setOnSaleOnly },
                ].map(({ label, value, onChange }) => (
                  <label key={label} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
                    <button
                      type="button"
                      onClick={() => onChange(!value)}
                      className={cn("relative w-11 h-6 rounded-full transition-colors", value ? "bg-gold" : "bg-[var(--surface-light)]")}
                    >
                      <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", value && "translate-x-5")} />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={clearFilters} className="flex-1 py-3 border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-light)]">
                Clear All
              </button>
              <button onClick={() => setShowFilters(false)} className="flex-1 py-3 bg-gold text-[#030618] rounded-xl text-sm font-bold hover:opacity-90">
                Show {filtered.length} Products
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)] px-4 py-4"><ProductGridSkeleton /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

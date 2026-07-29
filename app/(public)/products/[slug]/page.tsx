"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  HelpCircle,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
import { useCart } from "@/context/CartContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn, formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  description: string | null;
  features: string[] | null;
  stock: number;
  rating: number;
  reviews_count: number;
  brand: string | null;
  category: string | null;
}

interface Review {
  id: string;
  customer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%2306112B'/%3E%3Ctext x='300' y='320' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='140' fill='%23D4A843' text-anchor='middle'%3EAG%3C/text%3E%3C/svg%3E";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const className = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            className,
            i < Math.round(rating || 0) ? "fill-gold text-gold" : "text-[var(--text-muted)]/35"
          )}
        />
      ))}
    </div>
  );
}

function InfoPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "gold" }) {
  const toneClass = {
    neutral: "bg-[var(--surface-glass)] text-[var(--text-secondary)] border-[var(--border-color)]",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    gold: "bg-gold/10 text-gold border-gold/20",
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold", toneClass)}>
      {children}
    </span>
  );
}

function RelatedCard({ product }: { product: Product }) {
  const image = product.images?.[0] || fallbackImage;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface-glass)] transition-all hover:-translate-y-1 hover:border-gold/40"
    >
      <div className="relative aspect-square bg-[var(--surface-raised)]">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
          unoptimized
        />
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 min-h-[40px] text-sm font-semibold text-[var(--text-primary)]">{product.name}</p>
        <p className="font-label text-sm font-bold text-gold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("details");
  const { items, addItem, updateQuantity, openCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem: trackRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    let active = true;

    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
        if (res.status === 404) {
          setError("NOT_FOUND");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch product");
        const loaded = (await res.json()) as Product;
        if (!active) return;

        setProduct(loaded);
        setActiveImage(0);
        setQty(1);
        trackRecentlyViewed({
          id: loaded.id,
          name: loaded.name,
          slug: loaded.slug,
          price: loaded.price,
          image: loaded.images?.[0],
        });

        const [reviewsRes, productsRes] = await Promise.allSettled([
          fetch(`/api/reviews?productId=${encodeURIComponent(loaded.id)}`),
          fetch("/api/products"),
        ]);

        if (!active) return;
        if (reviewsRes.status === "fulfilled" && reviewsRes.value.ok) {
          setReviews((await reviewsRes.value.json()) as Review[]);
        } else {
          setReviews([]);
        }

        if (productsRes.status === "fulfilled" && productsRes.value.ok) {
          const allProducts = (await productsRes.value.json()) as Product[];
          setRelated(
            allProducts
              .filter((item) => item.id !== loaded.id && item.category === loaded.category)
              .slice(0, 4)
          );
        } else {
          setRelated([]);
        }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      active = false;
    };
  }, [slug, trackRecentlyViewed]);

  const images = useMemo(
    () => product?.images?.length
      ? product.images
      : ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900"],
    [product?.images]
  );
  const primaryImage = images[activeImage] || images[0] || fallbackImage;
  const discount = product?.compare_at_price
    ? Math.max(0, Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100))
    : 0;
  const avgRating = useMemo(() => {
    if (reviews.length === 0) return product?.rating || 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [product?.rating, reviews]);
  const wishlisted = product ? isWishlisted(product.id) : false;

  const addProductToCart = useCallback(
    (open = false) => {
      if (!product) return;
      const currentQty = items.find((item) => item.id === product.id)?.quantity || 0;
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: primaryImage,
        images,
        slug: product.slug,
        category: product.category || undefined,
        brand: product.brand || undefined,
      });
      if (qty > 1) updateQuantity(product.id, currentQty + qty);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
      if (open) openCart();
    },
    [addItem, images, items, openCart, primaryImage, product, qty, updateQuantity]
  );

  function handleBuyNow() {
    addProductToCart(false);
    router.push("/checkout");
  }

  function toggleSection(id: string) {
    setExpandedSection((current) => (current === id ? null : id));
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center bg-[var(--bg)] px-4">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gold/20 border-t-gold" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center bg-[var(--bg)] px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-glass)] text-gold">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Product not found</h1>
        <p className="mb-6 max-w-sm text-sm text-[var(--text-secondary)]">
          This product may be out of stock or no longer available.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#040820]"
        >
          <ArrowLeft className="h-4 w-4" /> Browse products
        </Link>
      </div>
    );
  }

  const details = [
    product.brand && { label: "Brand", value: product.brand },
    product.category && { label: "Category", value: product.category },
    { label: "Availability", value: product.stock > 0 ? `${product.stock} in stock` : "Out of stock" },
    { label: "Warranty", value: "Warranty support available on eligible devices" },
    { label: "Delivery", value: "Fast delivery across Ghana" },
  ].filter(Boolean) as { label: string; value: string }[];

  const sections = [
    {
      id: "details",
      title: "Product Details",
      content: (
        <div className="divide-y divide-[var(--border-color)]">
          {details.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 py-3 text-sm">
              <span className="font-medium text-[var(--text-secondary)]">{label}</span>
              <span className="text-right font-semibold text-[var(--text-primary)]">{value}</span>
            </div>
          ))}
        </div>
      ),
    },
    product.description && {
      id: "description",
      title: "Description",
      content: <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{product.description}</p>,
    },
    product.features?.length && {
      id: "features",
      title: "Key Features",
      content: (
        <ul className="space-y-2">
          {product.features.map((feature, i) => (
            <li key={`${feature}-${i}`} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ].filter(Boolean) as { id: string; title: string; content: React.ReactNode }[];

  return (
    <div className="bg-[var(--bg)] pb-24 text-[var(--text-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description || product.name,
            image: images,
            brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "GHS",
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: `https://authenticgad.com/products/${product.slug}`,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: avgRating || 5,
              reviewCount: reviews.length || product.reviews_count || 1,
              bestRating: 5,
              worstRating: 1,
            },
          }),
        }}
      />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="relative mb-3 aspect-square overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--surface-raised)] shadow-[var(--shadow-glass)]">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-5 sm:p-8"
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
                unoptimized
              />
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  -{discount}% OFF
                </span>
              )}
              <button
                onClick={() => toggleWishlist({ ...product, images })}
                className={cn(
                  "absolute right-4 top-4 rounded-full border p-3 backdrop-blur transition-all",
                  wishlisted
                    ? "border-red-500/30 bg-red-500/15 text-red-500"
                    : "border-[var(--border-color)] bg-[var(--surface-glass-strong)] text-[var(--text-secondary)] hover:text-red-500"
                )}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={cn("h-5 w-5", wishlisted && "fill-current")} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((image, i) => (
                  <button
                    key={`${image}-${i}`}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[var(--surface-raised)] transition-colors",
                      activeImage === i ? "border-gold" : "border-transparent hover:border-gold/40"
                    )}
                    aria-label={`View product image ${i + 1}`}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                      }}
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Link href="/" className="hover:text-gold">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-gold">Products</Link>
              {product.category && (
                <>
                  <span>/</span>
                  <span>{product.category}</span>
                </>
              )}
            </nav>

            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                  {product.brand || "Authentic Gadget"}
                </p>
                <h1 className="mt-1 text-2xl font-bold leading-snug text-[var(--text-primary)] sm:text-3xl">
                  {product.name}
                </h1>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <StarRating rating={avgRating} size="md" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">{avgRating ? avgRating.toFixed(1) : "5.0"}</span>
              <span className="text-sm text-[var(--text-muted)]">
                ({reviews.length || product.reviews_count || 0} reviews)
              </span>
            </div>

            <div className="mb-5 flex items-baseline gap-3">
              <span className="font-label text-3xl font-black text-gold sm:text-4xl">{formatPrice(product.price)}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-lg text-[var(--text-muted)] line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {product.stock > 0 ? (
                <InfoPill tone="green"><Check className="h-4 w-4" /> In Stock ({product.stock} left)</InfoPill>
              ) : (
                <InfoPill>Out of Stock</InfoPill>
              )}
              <InfoPill tone="gold"><ShieldCheck className="h-4 w-4" /> Verified Original</InfoPill>
              <InfoPill><Truck className="h-4 w-4" /> Ghana Delivery</InfoPill>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
              {product.description || "Premium gadget, checked for authenticity and prepared for fast delivery across Ghana."}
            </p>

            {product.stock > 0 && (
              <div className="mb-4 flex gap-3">
                <div className="flex h-12 items-center overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--surface-glass)]">
                  <button
                    onClick={() => setQty((value) => Math.max(1, value - 1))}
                    className="flex h-12 w-11 items-center justify-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--theme-hover-bg)]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-12 w-11 items-center justify-center font-bold">{qty}</span>
                  <button
                    onClick={() => setQty((value) => Math.min(product.stock, value + 1))}
                    className="flex h-12 w-11 items-center justify-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--theme-hover-bg)]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => addProductToCart(true)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                    added ? "bg-green-600 text-white" : "bg-gold text-[#040820] hover:bg-gold-dark"
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {added ? "Added" : `Add to Cart - ${formatPrice(product.price * qty)}`}
                </button>
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-2">
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-glass)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition-colors hover:border-gold/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap className="h-4 w-4 text-gold" /> Buy Now
              </button>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""}?text=${encodeURIComponent(`Hello Authentic Gadget, I want to ask about ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-500 transition-colors hover:bg-green-500/15"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""}?text=${encodeURIComponent(`Question about: ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:border-gold/40 hover:text-gold"
              >
                <HelpCircle className="h-4 w-4" /> Ask a Question
              </a>
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex items-start gap-3 rounded-xl border border-green-500/15 bg-green-500/10 p-3 text-sm">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Fast delivery across Ghana</p>
                  <p className="text-[var(--text-secondary)]">Same-day delivery in Accra where available. Other regions depend on courier route.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/10 p-3 text-sm">
                <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <p className="text-[var(--text-secondary)]">14-day return policy on eligible items after inspection.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-glass)] px-4">
              {sections.map((section) => {
                const open = expandedSection === section.id;
                return (
                  <div key={section.id} className="border-t border-[var(--border-color)] first:border-t-0">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between py-4 text-sm font-bold text-[var(--text-primary)] transition-colors hover:text-gold"
                    >
                      {section.title}
                      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {open && <div className="pb-4">{section.content}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <section className="mt-12 border-t border-[var(--border-color)] pt-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Customer Reviews</h2>
              <div className="mt-1 flex items-center gap-2">
                <StarRating rating={avgRating} />
                <span className="text-sm font-semibold text-[var(--text-primary)]">{avgRating ? avgRating.toFixed(1) : "5.0"}</span>
                <span className="text-sm text-[var(--text-muted)]">({reviews.length || product.reviews_count || 0} reviews)</span>
              </div>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.slice(0, 4).map((review) => (
                <div key={review.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-glass)] p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">{review.customer_name || "Verified Customer"}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.comment && <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-glass)] p-5 text-sm text-[var(--text-secondary)]">
              No reviews yet. Be the first customer to review this item after purchase.
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">Related Products</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {related.map((item) => (
                <RelatedCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}

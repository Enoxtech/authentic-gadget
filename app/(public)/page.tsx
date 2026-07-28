"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowRight, Star, Truck, RotateCcw, ShieldCheck, Heart, Eye, ShoppingCart, Check,
  Smartphone, Laptop, Headphones, Watch, Gamepad2, Cable, Tablet, ShoppingBag,
} from "lucide-react";
import TrustBadges from "@/components/ui/TrustBadges";
import DeliveryBadges from "@/components/ui/DeliveryBadges";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
import HeroSlider from "../components/ui/HeroSlider";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useQuickView } from "@/context/QuickViewContext";
import { formatPrice } from "@/lib/utils";

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

type FeaturedProduct = (typeof FEATURED_PRODUCTS)[number];

const NEW_ARRIVALS: FeaturedProduct[] = [
  {
    id: "7", name: "PlayStation 5 Slim", slug: "playstation-5-slim",
    price: 5499, compareAt: 5999,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
    rating: 4.9, reviews: 142, badge: "New", brand: "Sony",
    description: "Slimmer design, same blistering performance for next-gen gaming.",
  },
  {
    id: "8", name: "AirPods Pro 2", slug: "airpods-pro-2",
    price: 1899, compareAt: 2199,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400",
    rating: 4.8, reviews: 310, badge: "Best Seller", brand: "Apple",
    description: "Adaptive audio with industry-leading noise cancellation.",
  },
  {
    id: "9", name: "Samsung Galaxy Watch 6", slug: "samsung-galaxy-watch-6",
    price: 2299, compareAt: 2599,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400",
    rating: 4.7, reviews: 88, badge: "New", brand: "Samsung",
    description: "Advanced health tracking in a sleek rotating-bezel design.",
  },
  {
    id: "10", name: "Dell XPS 13", slug: "dell-xps-13",
    price: 9499, compareAt: 10499,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    rating: 4.8, reviews: 54, badge: "-10%", brand: "Dell",
    description: "Ultra-portable powerhouse with a stunning InfinityEdge display.",
  },
  {
    id: "11", name: "Logitech MX Master 3S", slug: "logitech-mx-master-3s",
    price: 699, compareAt: 799,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400",
    rating: 4.9, reviews: 201, badge: null, brand: "Logitech",
    description: "Precision-engineered ergonomic mouse for all-day productivity.",
  },
  {
    id: "12", name: "Anker 737 Power Bank", slug: "anker-737-power-bank",
    price: 899, compareAt: 999,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
    rating: 4.6, reviews: 173, badge: "New", brand: "Anker",
    description: "24,000mAh fast-charging power bank for life on the move.",
  },
];

const FALLBACK_PROMO_BANNERS = [
  { id: "promo-fallback-1", image: "/banners/promo-4.jpg", href: "/products", alt: "Authentic Gadget — Home of luxury with affordable price" },
  { id: "promo-fallback-2", image: "/banners/promo-5.jpg", href: "/offers", alt: "Authentic Gadget — Shop our premium gadget collection" },
];

const FALLBACK_CATEGORIES = [
  { id: "smartphones", name: "Smartphones", slug: "smartphones" },
  { id: "laptops", name: "Laptops", slug: "laptops" },
  { id: "audio", name: "Audio", slug: "audio" },
  { id: "wearables", name: "Wearables", slug: "wearables" },
  { id: "gaming", name: "Gaming", slug: "gaming" },
  { id: "accessories", name: "Accessories", slug: "accessories" },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  smartphones: Smartphone,
  laptops: Laptop,
  audio: Headphones,
  wearables: Watch,
  gaming: Gamepad2,
  accessories: Cable,
  tablets: Tablet,
};

const CUSTOMER_REVIEWS = [
  {
    name: "Patricia Gilbert",
    role: "Verified Buyer",
    quote: "Authentic Gadget made my phone upgrade easy. The delivery was quick, the packaging was clean, and the product was exactly as described.",
  },
  {
    name: "David Okafor",
    role: "Verified Buyer",
    quote: "The team confirmed my order fast and kept me updated. I like that the prices are clear and the checkout gives different payment options.",
  },
  {
    name: "Amaka Johnson",
    role: "Verified Buyer",
    quote: "I ordered accessories and everything arrived in good condition. The site is simple to use and support responded when I had a question.",
  },
];

function ProductTile({
  product, wishlisted, added, onToggleWishlist, onQuickView, onAddToCart,
}: {
  product: FeaturedProduct;
  wishlisted: boolean;
  added: boolean;
  onToggleWishlist: () => void;
  onQuickView: () => void;
  onAddToCart: () => void;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-[32px] border border-[var(--border-color)] bg-[var(--surface-glass)] backdrop-blur-[12px] card-premium overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-[28px] bg-[var(--surface-raised)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 16vw"
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%230B1E3D'/%3E%3Ctext x='300' y='320' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='140' fill='%23D4A843' text-anchor='middle'%3EAG%3C/text%3E%3C/svg%3E"; }}
          unoptimized
        />

        {product.badge && (
          <span
            className="absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: product.badge === "Best Seller" ? "linear-gradient(135deg, #D4A843, #C9A96E)" : "linear-gradient(135deg, #D4A843, #19AFFF)" }}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist();
          }}
          className={`absolute top-2.5 right-2.5 h-8 w-8 flex items-center justify-center rounded-full bg-[var(--surface-glass-strong)] backdrop-blur-md border border-[var(--border-color)] transition-all duration-200 hover:scale-110 active:scale-95 ${
            wishlisted ? "text-red-500" : "text-[var(--text-muted)] hover:text-red-500"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick view */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView();
          }}
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[var(--surface-glass-strong)] backdrop-blur-md border border-[var(--border-color)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap"
        >
          <Eye className="h-3 w-3" /> Quick View
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-widest truncate">
          {product.brand}
        </p>
        <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug flex-1">
          {product.name}
        </p>

        <div className="flex items-center justify-between mt-2 gap-1">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gold font-label text-xs tabular-nums">{formatPrice(product.price)}</span>
            {product.compareAt > 0 && (
              <span className="text-[10px] text-[var(--text-muted)] line-through font-label tabular-nums">{formatPrice(product.compareAt)}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(); }}
            className={`h-7 w-7 flex items-center justify-center rounded-full shrink-0 transition-all duration-200 ${
              added ? "bg-green-600 text-white scale-95" : "bg-electric text-white hover:scale-110 hover:shadow-md active:scale-90"
            }`}
            aria-label="Add to cart"
          >
            {added ? <Check className="h-3 w-3" /> : <ShoppingCart className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </Link>
  );
}

function CustomerReviews() {
  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Customer Reviews</p>
            <h2 className="mt-2 font-display text-xl md:text-2xl font-bold text-fog">Trusted by gadget buyers</h2>
          </div>
          <Link href="/products" className="hidden sm:inline-flex text-sm font-medium text-gold hover:text-gold-light transition-colors">
            Shop verified products -&gt;
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {CUSTOMER_REVIEWS.map((review) => (
            <article
              key={review.name}
              className="rounded-[28px] border border-[var(--border-color)] bg-[var(--surface-glass)] p-5 card-premium"
            >
              <div className="mb-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm leading-7 text-fog-muted">&ldquo;{review.quote}&rdquo;</p>
              <div className="mt-5 border-t border-[var(--border-color)] pt-4">
                <p className="text-sm font-bold text-fog">{review.name}</p>
                <p className="text-xs uppercase tracking-widest text-fog-muted">{review.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { open: openQuickView } = useQuickView();
  const [added, setAdded] = useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(FEATURED_PRODUCTS);
  const [newArrivals, setNewArrivals] = useState<FeaturedProduct[]>(NEW_ARRIVALS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [promoBanners, setPromoBanners] = useState(FALLBACK_PROMO_BANNERS);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) return;
        const products = (await response.json()) as Array<{
          id: string;
          name: string;
          slug: string;
          price: number;
          compare_at_price: number | null;
          images: string[] | null;
          rating: number | null;
          reviews_count: number | null;
          badge: string | null;
          brand: string | null;
          description: string | null;
        }>;

        const mapProduct = (product: typeof products[number]) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price || 0),
          compareAt: product.compare_at_price ? Number(product.compare_at_price) : 0,
          image: product.images?.[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
          rating: Number(product.rating || 4.8),
          reviews: Number(product.reviews_count || 0),
          badge: product.badge,
          brand: product.brand || "",
          description: product.description || "",
        });

        const liveProducts = products.slice(0, 6).map(mapProduct);
        const liveNewArrivals = products.slice(6, 12).map(mapProduct);

        if (!cancelled && liveProducts.length > 0) {
          setFeaturedProducts(liveProducts);
        }
        if (!cancelled && liveNewArrivals.length > 0) {
          setNewArrivals(liveNewArrivals);
        }
      } catch {
        // Keep curated fallback products if the live catalog is unavailable.
      }
    }

    loadFeaturedProducts();

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) return;
        const data = (await response.json()) as Array<{ id: string; name: string; slug: string }>;
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      } catch {
        // Keep curated fallback categories if unavailable.
      }
    }
    loadCategories();

    async function loadPromoBanners() {
      try {
        const response = await fetch("/api/banners?placement=promo");
        if (!response.ok) return;
        const data = (await response.json()) as Array<{ id: string; image: string; cta_href: string; headline: string }>;
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setPromoBanners(data.slice(0, 2).map((b) => ({ id: b.id, image: b.image, href: b.cta_href || "/products", alt: b.headline })));
        }
      } catch {
        // Keep curated fallback promo banners if unavailable.
      }
    }
    loadPromoBanners();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddToCart = (product: FeaturedProduct) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNewsletterStatus("saving");
    setNewsletterMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Subscription failed");
      setNewsletterStatus("saved");
      setNewsletterMessage("You are subscribed. Watch your inbox for deals and arrivals.");
      setNewsletterEmail("");
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-x-hidden">
{/* === HERO SLIDER === */}
      <HeroSlider />
      {/* === END HERO SLIDER === */}

      {/* Trust badges */}
      <section className="premium-trust-strip border-y border-white/[0.06] bg-[var(--surface)]">
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
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-fog">Shop by Category</h2>
            <Link href="/products" className="text-sm text-gold hover:text-gold-light transition-colors font-medium">
              View all →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Cable;
              return (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} className="flex flex-col items-center gap-2 shrink-0 group">
                  <div className="w-16 h-16 rounded-[24px] bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:border-gold/40 transition-all duration-200">
                    <Icon className="h-6 w-6 text-gold" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] text-fog-muted font-medium text-center w-16 leading-tight">{cat.name}</span>
                </Link>
              );
            })}
            <Link href="/products" className="flex flex-col items-center gap-2 shrink-0 group">
              <div className="w-16 h-16 rounded-[24px] flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-200 bg-electric">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-[11px] text-fog-muted font-medium text-center w-16 leading-tight">View All</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-fog">
              Featured Products
            </h2>
            <Link href="/products" className="text-sm font-medium text-gold hover:text-gold-light transition-colors">
              See all →
            </Link>
          </div>
          <div className="product-grid-subgrid">
            {featuredProducts.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                wishlisted={isWishlisted(product.id)}
                added={added === product.id}
                onToggleWishlist={() => toggleWishlist({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image })}
                onQuickView={() => openQuickView({
                  id: product.id, name: product.name, slug: product.slug, price: product.price,
                  compare_at_price: product.compareAt || null, images: [product.image],
                  brand: product.brand, rating: product.rating, reviews_count: product.reviews,
                })}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner 1 — admin-manageable via /admin/banners (placement: promo) */}
      {promoBanners[0] && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4">
            <Link href={promoBanners[0].href} className="block rounded-[28px] overflow-hidden card-premium border border-[var(--border-color)]">
              <Image
                src={promoBanners[0].image}
                alt={promoBanners[0].alt}
                width={1600}
                height={500}
                className="w-full h-auto object-cover"
                unoptimized
              />
            </Link>
          </div>
        </section>
      )}

      {/* New Arrivals — shown after both banners */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-fog">
              New Arrivals
            </h2>
            <Link href="/products" className="text-sm font-medium text-gold hover:text-gold-light transition-colors">
              See all →
            </Link>
          </div>
          <div className="product-grid-subgrid">
            {newArrivals.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                wishlisted={isWishlisted(product.id)}
                added={added === product.id}
                onToggleWishlist={() => toggleWishlist({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image })}
                onQuickView={() => openQuickView({
                  id: product.id, name: product.name, slug: product.slug, price: product.price,
                  compare_at_price: product.compareAt || null, images: [product.image],
                  brand: product.brand, rating: product.rating, reviews_count: product.reviews,
                })}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner 2 — separated from the first banner by product listings */}
      {promoBanners[1] && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4">
            <Link href={promoBanners[1].href} className="block rounded-[28px] overflow-hidden card-premium border border-[var(--border-color)]">
              <Image
                src={promoBanners[1].image}
                alt={promoBanners[1].alt}
                width={1600}
                height={500}
                className="w-full h-auto object-cover"
                unoptimized
              />
            </Link>
          </div>
        </section>
      )}

      <CustomerReviews />
      <RecentlyViewed />

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
          <form
            className="mx-auto flex max-w-xl flex-col gap-3 rounded-[1.35rem] border p-2 shadow-layers sm:flex-row"
            style={{
              background: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
            }}
            onSubmit={handleNewsletterSubmit}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              className="min-w-0 flex-1 rounded-2xl px-5 py-4 text-sm text-fog placeholder:text-fog-muted transition-all focus:outline-none"
              style={{ background: 'var(--theme-input-bg)', border: '1px solid var(--theme-input-border)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'color-mix(in oklch, var(--primary) 45%, var(--theme-input-border))')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--theme-input-border)')}
            />
            <button
              type="submit"
              disabled={newsletterStatus === "saving"}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-7 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_42px_rgba(124,58,237,0.45)] focus:outline-none focus:ring-2 focus:ring-cyan-300/60 focus:ring-offset-2 focus:ring-offset-[#040820]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">{newsletterStatus === "saving" ? "Saving..." : "Subscribe"}</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
          {newsletterMessage && (
            <p className={`mt-4 text-sm ${newsletterStatus === "error" ? "text-red-300" : "text-green-300"}`}>
              {newsletterMessage}
            </p>
          )}
        </div>
      </section>

      <DeliveryBadges />
      <TrustBadges />
    </div>
  );
}

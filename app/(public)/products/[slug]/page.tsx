"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star, Heart, ShieldCheck, Truck, RotateCcw,
  Minus, Plus, Check, ChevronLeft, ChevronRight,
  ShoppingCart, ArrowLeft
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import DeliveryBadges from "@/components/ui/DeliveryBadges";
import { useCart } from "@/context/CartContext";

// All products data — single source of truth
const PRODUCTS = {
  "iphone-15-pro-max": {
    id: "1",
    name: "iPhone 15 Pro Max 256GB Natural Titanium",
    slug: "iphone-15-pro-max",
    price: 12499,
    compareAt: 13999,
    images: [
      "https://images.unsplash.com/photo-1592750475338-4b09a80f1c1e",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0",
    ],
    description: "The most powerful iPhone ever. A17 Pro chip, 48MP camera system, Titanium design, and the longest battery life ever in an iPhone.",
    features: [
      "A17 Pro chip with 6-core GPU",
      "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      "6.7\" Super Retina XDR display with ProMotion",
      "Titanium design with textured matte glass back",
      "Action button + USB 3 (up to 10Gbps)",
      "5x optical zoom",
    ],
    stock: 8,
    rating: 4.9,
    reviews: 128,
    brand: "Apple",
    category: "Smartphones",
  },
  "samsung-galaxy-s24-ultra": {
    id: "2",
    name: "Samsung Galaxy S24 Ultra 256GB Titanium Black",
    slug: "samsung-galaxy-s24-ultra",
    price: 10999,
    compareAt: 11999,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9-1f7c8be6cb0",
      "https://images.unsplash.com/photo-1612948533887-e3c06d端着89ccb?w=800",
      "https://images.unsplash.com/photo-1605236453806-6f1e0a0f03ac?w=800",
    ],
    description: "The ultimate Galaxy experience. Snapdragon 8 Gen 3, 200MP camera, S Pen included, and Galaxy AI built in.",
    features: [
      "Snapdragon 8 Gen 3 processor",
      "200MP main camera + 12MP ultrawide + 50MP telephoto",
      "6.8\" Dynamic AMOLED 2X display, 120Hz",
      "5000mAh battery with 45W fast charging",
      "S Pen included — built-in",
      "Galaxy AI features pre-loaded",
    ],
    stock: 12,
    rating: 4.8,
    reviews: 96,
    brand: "Samsung",
    category: "Smartphones",
  },
  "macbook-air-m3": {
    id: "3",
    name: "MacBook Air M3 13\" 256GB Space Grey",
    slug: "macbook-air-m3",
    price: 8999,
    compareAt: 9999,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    ],
    description: "Supercharged by the M3 chip. Fanless design, all-day battery life, and a stunning 13.6\" Liquid Retina display.",
    features: [
      "Apple M3 chip (8-core CPU, 10-core GPU)",
      "13.6\" Liquid Retina display with True Tone",
      "Up to 18 hours battery life",
      "Fanless silent design",
      "MagSafe 3 charging + two Thunderbolt ports",
      "1080p FaceTime HD camera",
    ],
    stock: 6,
    rating: 4.9,
    reviews: 64,
    brand: "Apple",
    category: "Laptops",
  },
  "sony-wh-1000xm5": {
    id: "4",
    name: "Sony WH-1000XM5 Wireless Headphones",
    slug: "sony-wh-1000xm5",
    price: 2499,
    compareAt: 2999,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
      "https://images.unsplash.com/photo-1484704849700-f032a4e3d590",
    ],
    description: "Industry-leading noise cancellation with 8 microphones. 30-hour battery, crystal clear calls, and Hi-Res Audio.",
    features: [
      "8 microphones for industry-leading noise cancellation",
      "30-hour battery life (with ANC on)",
      "Hi-Res Audio + LDAC support",
      "Multipoint connection (2 devices at once)",
      "Speak-to-chat auto pauses music",
      "Foldable with carrying case",
    ],
    stock: 20,
    rating: 4.7,
    reviews: 215,
    brand: "Sony",
    category: "Audio",
  },
  "ipad-pro-12-9": {
    id: "5",
    name: "iPad Pro 12.9\" M2 256GB Space Grey",
    slug: "ipad-pro-12-9",
    price: 7499,
    compareAt: 8499,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
      "https://images.unsplash.com/photo-1585790050230-5b41b36f1c29",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
    ],
    description: "The ultimate iPad experience. M2 chip, Liquid Retina XDR display, and all-day battery life.",
    features: [
      "Apple M2 chip (8-core CPU, 10-core GPU)",
      "12.9\" Liquid Retina XDR with ProMotion 120Hz",
      "Face ID + 12MP cameras",
      "Thunderbolt / USB 4 port",
      "Apple Pencil 2 support",
      "Up to 10 hours battery",
    ],
    stock: 9,
    rating: 4.8,
    reviews: 89,
    brand: "Apple",
    category: "Tablets",
  },
  "apple-watch-ultra-2": {
    id: "6",
    name: "Apple Watch Ultra 2 49mm Titanium",
    slug: "apple-watch-ultra-2",
    price: 4499,
    compareAt: 4999,
    images: [
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d",
      "https://images.unsplash.com/photo-1544117519-9d7ffb8c0e4f",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d",
    ],
    description: "The most rugged and capable Apple Watch. Titanium case, precision dual-frequency GPS, and 36-hour battery.",
    features: [
      "49mm titanium case — aerospace grade",
      "Precision dual-frequency GPS",
      "36-hour battery (up to 72h in low power mode)",
      "S9 SiP chip with Double Tap",
      "Water resistant 100m + dive certified",
      "Action button configurable",
    ],
    stock: 5,
    rating: 4.9,
    reviews: 156,
    brand: "Apple",
    category: "Wearables",
  },
  "playstation-5": {
    id: "9",
    name: "PlayStation 5 Disc Edition",
    slug: "playstation-5",
    price: 4999,
    compareAt: null,
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3",
    ],
    description: "Next-gen gaming with 4K TV gaming, haptic feedback, and the largest library of PS5 games. Includes DualSense controller.",
    features: [
      "AMD Ryzen Zen 2 + RDNA 2 GPU",
      "4K gaming at up to 120fps",
      "Ray tracing support",
      "825GB SSD — ultra fast load times",
      "DualSense controller with haptic feedback",
      "Backwards compatible with PS4 games",
    ],
    stock: 4,
    rating: 4.9,
    reviews: 312,
    brand: "Sony",
    category: "Gaming",
  },
  "airpods-max": {
    id: "10",
    name: "AirPods Max Space Grey",
    slug: "airpods-max",
    price: 3499,
    compareAt: 3999,
    images: [
      "https://images.unsplash.com/photo-1625245488600-f03fef636a3c",
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46",
      "https://images.unsplash.com/photo-1625245488600-f03fef636a3c",
    ],
    description: "High-fidelity audio with Active Noise Cancellation, Transparency mode, and computational audio powered by the Apple H1 chip.",
    features: [
      "Custom 40mm Apple driver for rich bass",
      "Active Noise Cancellation + Transparency mode",
      "Computational audio with 9 microphones",
      "20-hour battery life",
      "Digital Crown for volume & controls",
      "Spatial audio with dynamic head tracking",
    ],
    stock: 11,
    rating: 4.8,
    reviews: 189,
    brand: "Apple",
    category: "Audio",
  },
  "google-pixel-8-pro": {
    id: "11",
    name: "Google Pixel 8 Pro 256GB Obsidian",
    slug: "google-pixel-8-pro",
    price: 7999,
    compareAt: 8999,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
    ],
    description: "Powered by Google Tensor G3. 50MP camera with Night Sight, 7 years of updates, and AI features only on Pixel.",
    features: [
      "Google Tensor G3 chip",
      "50MP main + 48MP ultrawide + 48MP telephoto",
      "6.7\" LTPO OLED 120Hz display",
      "Magic Eraser + Best Take AI features",
      "7 years of OS & security updates",
      "24-hour battery with 30W fast charging",
    ],
    stock: 7,
    rating: 4.8,
    reviews: 67,
    brand: "Google",
    category: "Smartphones",
  },
  "nintendo-switch-oled": {
    id: "12",
    name: "Nintendo Switch OLED Model",
    slug: "nintendo-switch-oled",
    price: 2499,
    compareAt: 2799,
    images: [
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e",
      "https://images.unsplash.com/photo-1574661522991-9c8e4b4e5d85",
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e",
    ],
    description: "Vivid 7-inch OLED screen, enhanced audio, and a wide adjustable stand for tabletop gaming. Includes 64GB storage.",
    features: [
      "7\" vibrant OLED display",
      "Wide adjustable stand for tabletop mode",
      "64GB internal storage",
      "Enhanced audio with OLED screen",
      "Wired LAN port in dock",
      "Compatible with all Nintendo Switch games",
    ],
    stock: 15,
    rating: 4.8,
    reviews: 241,
    brand: "Nintendo",
    category: "Gaming",
  },
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${s} ${n <= Math.round(rating) ? "fill-gold text-gold" : "text-white/20"}`} />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const product = PRODUCTS[slug as keyof typeof PRODUCTS];

  // 404 if product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-[#040820] flex flex-col items-center justify-center text-fog-muted">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-fog mb-2">Product not found</h1>
        <p className="text-fog-muted mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/products"
          className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0], slug: product.slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#040820]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-[#06112B] rounded-3xl overflow-hidden border border-white/[0.08]">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  -{discount}%
                </span>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => (i + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 bg-[#06112B] rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? "border-gold" : "border-white/[0.08] hover:border-white/[0.2]"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gold font-semibold mb-1 uppercase tracking-wider">{product.brand}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-fog leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} size="md" />
                <span className="text-sm text-fog-muted">{product.rating} ({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="card-dark rounded-2xl p-5 border border-white/[0.08]">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-gold">¢{product.price.toLocaleString()}</span>
                {product.compareAt && (
                  <>
                    <span className="text-xl text-fog-muted line-through">¢{product.compareAt.toLocaleString()}</span>
                    <span className="text-green-400 font-semibold text-sm">Save ¢{(product.compareAt - product.price).toLocaleString()}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-fog-muted">Price includes VAT</p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "100% Authentic" },
                { icon: Truck, label: "Fast Delivery" },
                { icon: RotateCcw, label: "14-Day Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="card-dark rounded-xl p-3 text-center border border-white/[0.08]">
                  <Icon className="w-6 h-6 text-gold mx-auto mb-1.5" />
                  <p className="text-xs text-fog-muted font-medium">{label}</p>
                </div>
              ))}
            </div>

            <DeliveryBadges />

            {product.stock <= 5 && (
              <p className="text-sm text-orange-400 font-medium">⚠ Only {product.stock} left in stock</p>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-fog mb-2">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center card-dark rounded-2xl border border-white/[0.08]">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-white/[0.05] rounded-l-2xl transition-colors">
                    <Minus className="w-5 h-5 text-fog" />
                  </button>
                  <span className="w-12 text-center font-bold text-fog">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 hover:bg-white/[0.05] rounded-r-2xl transition-colors">
                    <Plus className="w-5 h-5 text-fog" />
                  </button>
                </div>
                <span className="text-sm text-fog-muted">{product.stock} available</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-base ${
                  added ? "bg-green-600 text-white" : "bg-gold hover:bg-gold-dark text-[#030618]"
                }`}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> Added to Cart</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart — ¢{(product.price * qty).toLocaleString()}</>
                )}
              </button>
              <button
                onClick={() => setWishlist(!wishlist)}
                className={`p-4 rounded-2xl border transition-all ${
                  wishlist ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/[0.04] border-white/[0.08] text-fog-muted hover:text-red-400"
                }`}
              >
                <Heart className={`w-6 h-6 ${wishlist ? "fill-red-400" : ""}`} />
              </button>
            </div>

            {/* Description */}
            <div className="card-dark rounded-2xl p-6 border border-white/[0.08]">
              <h3 className="font-bold text-fog mb-3">Description</h3>
              <p className="text-sm text-fog-muted leading-relaxed">{product.description}</p>
              <ul className="mt-4 space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-fog-muted">
                    <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
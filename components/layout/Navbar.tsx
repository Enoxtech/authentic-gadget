"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Search, User, Menu, X, Heart } from "lucide-react";
import CartBadge from "@/components/ui/CartBadge";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const [bounced, setBounced] = useState(false);
  const prevCountRef = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBounced(true);
      const t = setTimeout(() => setBounced(false), 400);
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  return (
    <header className="sticky top-0 z-50 bg-midnight/95 backdrop-blur-xl text-white shadow-md">
      {/* Top bar */}
      <div className="hidden sm:block bg-midnight/90 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-7 flex items-center justify-between">
          <span className="text-xs text-white/40">
            🇬🇭 Fast delivery across Ghana
          </span>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <Link href="/track-order" className="hover:text-electric transition-colors">
              Track Order
            </Link>
            <span>|</span>
            <Link href="/about" className="hover:text-electric transition-colors">
              About Us
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-midnight">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Image
              src="/logo-white.png"
              alt="Authentic Gadget"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 h-9 rounded-xl bg-white/95 text-charcoal text-sm placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/wishlist"
              className="hidden sm:flex p-2 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <CartBadge count={itemCount} justBounced={bounced} onClick={openCart} />

            <Link
              href="/(auth)/login"
              className="hidden sm:flex p-2 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-12 pr-4 h-11 rounded-2xl bg-white text-charcoal text-sm placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-electric"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Category nav */}
        <nav className="hidden md:block border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 h-9 flex items-center gap-6 overflow-x-auto">
            {[
              { label: "All Products", href: "/" },
              { label: "Smartphones", href: "/products?category=smartphones" },
              { label: "Laptops", href: "/products?category=laptops" },
              { label: "Accessories", href: "/products?category=accessories" },
              { label: "Audio", href: "/products?category=audio" },
              { label: "Wearables", href: "/products?category=wearables" },
              { label: "Gaming", href: "/products?category=gaming" },
              { label: "Offers", href: "/offers", highlight: true },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  item.highlight
                    ? "text-electric"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={`sm:hidden fixed inset-0 z-50 glass-dark transition-all duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-midnight transform transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Authentic Gadget" width={36} height={36} className="object-contain" />
              <p className="font-display text-lg font-bold text-white">Menu</p>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
            {[
              { label: "Home", href: "/" },
              { label: "All Products", href: "/products" },
              { label: "Smartphones", href: "/products?category=smartphones" },
              { label: "Laptops", href: "/products?category=laptops" },
              { label: "Accessories", href: "/products?category=accessories" },
              { label: "Audio", href: "/products?category=audio" },
              { label: "Wearables", href: "/products?category=wearables" },
              { label: "Gaming", href: "/products?category=gaming" },
              { label: "Offers", href: "/offers" },
              { label: "Track Order", href: "/track-order" },
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Wishlist", href: "/wishlist" },
              { label: "Cart", href: "/cart" },
              { label: "Login", href: "/(auth)/login" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-4 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium text-lg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

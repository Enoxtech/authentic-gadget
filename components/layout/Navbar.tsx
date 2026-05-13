"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Search, User, Menu, X, Heart, ShoppingBag, Home, Tag, HelpCircle, Phone } from "lucide-react";
import CartBadge from "@/components/ui/CartBadge";
import { useCart } from "@/context/CartContext";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "All Products", href: "/products", icon: ShoppingBag },
  { label: "Smartphones", href: "/products?category=smartphones", icon: null },
  { label: "Laptops", href: "/products?category=laptops", icon: null },
  { label: "Accessories", href: "/products?category=accessories", icon: null },
  { label: "Audio", href: "/products?category=audio", icon: null },
  { label: "Wearables", href: "/products?category=wearables", icon: null },
  { label: "Gaming", href: "/products?category=gaming", icon: null },
  { label: "Offers", href: "/offers", icon: Tag },
  { label: "Track Order", href: "/track-order", icon: null },
  { label: "About Us", href: "/about", icon: null },
  { label: "Contact", href: "/about#contact", icon: Phone },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
  { label: "Login", href: "/(auth)/login", icon: User },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const [bounced, setBounced] = useState(false);
  const prevCountRef = useRef(itemCount);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close on escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
      {/* Top bar - hide on mobile */}
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

          {/* Search - desktop */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 h-9 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:bg-white/15 focus:border-electric/30 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search toggle - mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist - tablet+ */}
            <Link
              href="/wishlist"
              className="hidden sm:flex p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <CartBadge count={itemCount} justBounced={bounced} onClick={openCart} />

            {/* Account - tablet+ */}
            <Link
              href="/(auth)/login"
              className="hidden sm:flex p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors sm:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="px-4 pb-3 sm:hidden">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-11 pr-4 h-11 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric/30 transition-all"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Category nav - tablet+ */}
        <nav className="hidden md:block border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-5 overflow-x-auto scrollbar-hide">
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
                className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                  item.highlight
                    ? "text-electric"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* ========== MOBILE MENU ========== */}
      <div
        className={`sm:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Panel */}
        <div
          ref={menuRef}
          className={`absolute right-0 top-0 bottom-0 w-[85vw] max-w-[340px] bg-midnight border-l border-white/10 flex flex-col transform transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
              <Image
                src="/logo-white.png"
                alt="Authentic Gadget"
                width={100}
                height={30}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium text-[15px]"
                >
                  {Icon && <Icon className="w-[18px] h-[18px] shrink-0 text-white/50" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-white/10 shrink-0">
            <p className="text-xs text-white/30 text-center">
              © 2025 Authentic Gadget
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
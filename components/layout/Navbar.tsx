"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, User, Menu, X, Heart, ShoppingBag, Home,
  Smartphone, Laptop, Headphones, Watch, Gamepad2, Tag,
  MapPin, Info, Package, LogOut
} from "lucide-react";
import CartBadge from "@/components/ui/CartBadge";
import SearchBarWrapper from "@/components/ui/SearchBarWrapper";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const CATEGORIES = [
  { label: "Smartphones", href: "/products?category=smartphones", icon: Smartphone },
  { label: "Laptops", href: "/products?category=laptops", icon: Laptop },
  { label: "Audio", href: "/products?category=audio", icon: Headphones },
  { label: "Wearables", href: "/products?category=wearables", icon: Watch },
  { label: "Gaming", href: "/products?category=gaming", icon: Gamepad2 },
  { label: "Accessories", href: "/products?category=accessories", icon: Package },
];

const QUICK_LINKS = [
  { label: "Track Order", href: "/track-order", icon: Package },
  { label: "About Us", href: "/about", icon: Info },
  { label: "All Products", href: "/products", icon: ShoppingBag },
  { label: "Offers", href: "/offers", icon: Tag },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const [bounced, setBounced] = useState(false);
  const prevCountRef = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user ? { email: user.email } : null);
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();

    // Subscribe to auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ? { email: session.user.email } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBounced(true);
      const t = setTimeout(() => setBounced(false), 400);
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: 'rgba(10, 10, 10, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Top bar — hidden on mobile */}
        <div className="hidden sm:block border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 h-7 flex items-center justify-between">
            <span className="text-xs text-fog-muted">
              🇬🇭 Authentic Gadgets — Fast delivery across Ghana
            </span>
            <div className="flex items-center gap-4 text-xs text-fog-muted">
              <Link href="/track-order" className="hover:text-gold transition-colors">Track Order</Link>
              <span className="opacity-20">|</span>
              <Link href="/about" className="hover:text-gold transition-colors">About Us</Link>
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div className="bg-[#040820]">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <Image
                src="/logo-white.png"
                alt="Authentic Gadget"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            {/* Search — desktop */}
            <div className="hidden lg:flex flex-1 max-w-sm mx-4">
              <SearchBarWrapper />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2.5 hover:bg-white/[0.08] rounded-xl transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden sm:flex p-2.5 hover:bg-white/[0.08] rounded-xl transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <CartBadge count={itemCount} justBounced={bounced} onClick={openCart} />

              {/* Account */}
              {!checkingAuth && (
                user ? (
                  <Link
                    href="/account/profile"
                    className="hidden sm:flex p-2.5 hover:bg-white/[0.08] rounded-xl transition-colors"
                    aria-label="Account"
                    title={user.email || "Account"}
                  >
                    <User className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="hidden sm:flex p-2.5 hover:bg-white/[0.08] rounded-xl transition-colors"
                    aria-label="Login"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )
              )}

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen(true)}
                className="sm:hidden p-2.5 hover:bg-white/[0.08] rounded-xl transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile search */}
          {searchOpen && (
            <div className="lg:hidden px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fog-muted" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-11 pr-4 h-11 rounded-xl bg-white/[0.08] border border-white/[0.08] text-fog text-sm placeholder:text-fog-muted focus:outline-none focus:border-gold/30 transition-all"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Category bar — tablet+ */}
          <nav className="hidden md:flex border-t border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <Link
                href="/products"
                className="shrink-0 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >
                All Products
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="shrink-0 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                href="/offers"
                className="shrink-0 text-sm font-bold transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-500/10"
                style={{ color: '#a78bfa' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a78bfa')}
              >
                Offers 🔥
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ==================== MOBILE MENU ==================== */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[200] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="relative ml-auto w-[88vw] max-w-[360px] h-full bg-[#06112B] border-l border-[rgba(201,169,110,0.15)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] shrink-0">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Image
                  src="/logo-white.png"
                  alt="Authentic Gadget"
                  width={110}
                  height={34}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-white/[0.08] rounded-xl transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-5 py-3 border-b border-white/[0.08] shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog-muted" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] text-fog text-sm placeholder:text-fog-muted focus:outline-none focus:border-gold/30 transition-all"
                />
              </div>
            </div>

            {/* Nav content — scrollable */}
            <div className="flex-1 overflow-y-auto py-2">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3.5 px-5 py-3.5 text-fog hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <Home className="w-[18px] h-[18px] text-gold" />
                <span className="font-medium">Home</span>
              </Link>

              {/* Divider */}
              <div className="px-5 py-1">
                <p className="text-[10px] uppercase tracking-widest text-fog-muted font-bold mb-1">Categories</p>
              </div>

              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3.5 px-5 py-3.5 text-fog-muted hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <Icon className="w-[18px] h-[18px] text-gold/60" />
                    <span className="font-medium">{cat.label}</span>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="px-5 py-1 mt-2">
                <p className="text-[10px] uppercase tracking-widest text-fog-muted font-bold mb-1">Quick Links</p>
              </div>

              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3.5 px-5 py-3.5 text-fog-muted hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <Icon className="w-[18px] h-[18px] text-gold/60" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="px-5 py-1 mt-2">
                <p className="text-[10px] uppercase tracking-widest text-fog-muted font-bold mb-1">Account</p>
              </div>

              {user ? (
                <>
                  <Link
                    href="/account/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3.5 px-5 py-3.5 text-fog-muted hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <User className="w-[18px] h-[18px] text-gold/60" />
                    <span className="font-medium">My Account</span>
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="flex items-center gap-3.5 px-5 py-3.5 text-fog-muted hover:text-white hover:bg-white/[0.05] transition-colors w-full text-left"
                  >
                    <LogOut className="w-[18px] h-[18px] text-red-400/60" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3.5 text-fog-muted hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <User className="w-[18px] h-[18px] text-gold/60" />
                  <span className="font-medium">Login / Register</span>
                </Link>
              )}

              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3.5 px-5 py-3.5 text-fog-muted hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <Heart className="w-[18px] h-[18px] text-gold/60" />
                <span className="font-medium">Wishlist</span>
              </Link>

              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3.5 px-5 py-3.5 text-fog-muted hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <ShoppingBag className="w-[18px] h-[18px] text-gold/60" />
                <span className="font-medium">Cart {itemCount > 0 && `(${itemCount})`}</span>
              </Link>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/[0.08] shrink-0 bg-[#040820]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-fog-muted">© 2025 Authentic Gadget</span>
                <span className="text-xs text-gold font-medium">🇬🇭 Ghana</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
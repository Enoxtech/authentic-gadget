"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Menu, X, Heart } from "lucide-react";
import CartBadge from "@/components/ui/CartBadge";
import SearchBarWrapper from "@/components/ui/SearchBarWrapper";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const CATEGORIES = [
  { label: "Smartphones", href: "/products?category=smartphones" },
  { label: "Laptops", href: "/products?category=laptops" },
  { label: "Audio", href: "/products?category=audio" },
  { label: "Wearables", href: "/products?category=wearables" },
  { label: "Gaming", href: "/products?category=gaming" },
  { label: "Accessories", href: "/products?category=accessories" },
];

const QUICK_LINKS = [
  { label: "Track Order", href: "/track-order" },
  { label: "About Us", href: "/about" },
  { label: "Offers", href: "/offers" },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const [bounced, setBounced] = useState(false);
  const prevCountRef = useRef(0);

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
      <header className="site-header sticky top-0 z-50 transition-all duration-300">
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
        <div className="site-nav-shell">
          <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-3 overflow-hidden">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Image
                src="/logo-mark.png"
                alt="Authentic Gadget"
                width={36}
                height={36}
                className="h-8 w-8 object-contain logo-adaptive group-hover:scale-105 transition-transform duration-200"
                priority
              />
              <span className="hidden sm:block font-display text-base font-bold tracking-tight text-fog">
                Authentic Gadget
              </span>
            </Link>

            {/* Search — desktop */}
            <div className="hidden lg:flex flex-1 max-w-sm mx-4">
              <SearchBarWrapper />
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <ThemeToggle compact />

              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2 sm:p-2.5 hover:bg-white/[0.08] rounded-xl transition-colors"
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
                className="sm:hidden p-2 sm:p-2.5 hover:bg-white/[0.08] rounded-xl transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile search */}
          {searchOpen && (
            <div className="lg:hidden px-4 pb-3">
              <SearchBarWrapper />
            </div>
          )}

          {/* Category bar — tablet+ */}
          <nav className="hidden md:flex border-t border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <Link
                href="/products"
                className="shrink-0 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg text-fog-muted hover:bg-white/5 hover:text-fog"
              >
                All Products
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="shrink-0 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg text-fog-muted hover:bg-white/5 hover:text-fog"
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                href="/offers"
                className="shrink-0 text-sm font-bold transition-colors px-3 py-1.5 rounded-lg text-primary hover:bg-violet-500/10 hover:text-primary-light"
              >
                Offers 🔥
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ── MOBILE SIDEBAR DRAWER ─────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[59] bg-black/50 animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            className="fixed top-0 left-0 bottom-0 z-[60] w-[82vw] max-w-xs flex flex-col animate-slide-in-left sm:hidden overflow-hidden"
            style={{ background: "var(--bg)", boxShadow: "6px 0 40px rgba(0,0,0,0.35)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <Image
                  src="/logo-mark.png"
                  alt="Authentic Gadget"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain logo-adaptive"
                />
                <span className="font-display text-sm font-bold tracking-tight text-fog">Authentic Gadget</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-1 -mr-1 rounded-lg hover:bg-[var(--surface)] transition-colors"
              >
                <X className="h-5 w-5 text-[var(--text-primary)]" />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-5 pb-3 shrink-0">
              <SearchBarWrapper />
            </div>

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto px-5 scrollbar-hide min-h-0">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block py-[14px] text-[17px] font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] hover:text-gold transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="block py-[14px] text-[17px] font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] hover:text-gold transition-colors"
              >
                Shop
              </Link>

              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-[14px] text-[17px] font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] hover:text-gold transition-colors"
                >
                  {cat.label}
                </Link>
              ))}

              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-[14px] text-[17px] font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {!checkingAuth && (
                user ? (
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="block w-full text-left py-[14px] text-[17px] font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] hover:text-gold transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block py-[14px] text-[17px] font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] hover:text-gold transition-colors"
                  >
                    Login / Register
                  </Link>
                )
              )}
            </nav>

            {/* Contact info — pinned at bottom, clears mobile safe area */}
            <div
              className="shrink-0 px-5 pt-4"
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
              }}
            >
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                <span className="font-semibold text-[var(--text-secondary)]">Based in:</span> Accra, Ghana 🇬🇭
              </p>
              <p className="text-[13px] mt-2 text-gold">
                <span className="font-semibold">Phone:</span>{" "}
                <a href="tel:+233534553165" className="hover:underline">+233 53 455 3165</a>
              </p>
              <p className="text-[13px] mt-1.5 text-gold">
                <span className="font-semibold">Email:</span>{" "}
                <a href="mailto:authenticgadgets@gmail.com" className="hover:underline">authenticgadgets@gmail.com</a>
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

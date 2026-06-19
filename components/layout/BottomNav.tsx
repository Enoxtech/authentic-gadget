"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/products", label: "Shop", icon: Grid3x3, match: (p: string) => p.startsWith("/products") },
  { href: "/cart", label: "Cart", icon: ShoppingCart, match: (p: string) => p === "/cart" },
  { href: "/wishlist", label: "Wishlist", icon: Heart, match: (p: string) => p === "/wishlist" },
  { href: "/account/profile", label: "Account", icon: User, match: (p: string) => p.startsWith("/account") },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch safe-area-pb"
      style={{ background: "rgba(6,17,43,0.92)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      {TABS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname || "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
              active ? "text-gold" : "text-fog-muted"
            )}
          >
            <span className="relative">
              <Icon className="w-5 h-5" />
              {href === "/cart" && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-electric text-white text-[9px] font-bold flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

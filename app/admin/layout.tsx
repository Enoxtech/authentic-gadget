"use client";

import { Package, ShoppingCart, Users, BarChart3, Settings, LogOut, LayoutDashboard, Megaphone, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
  { id: "orders", label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { id: "products", label: "Products", icon: Package, href: "/admin/products" },
  { id: "customers", label: "Customers", icon: Users, href: "/admin/customers" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { id: "campaigns", label: "Campaigns", icon: Megaphone, href: "/admin/campaigns" },
  { id: "reviews", label: "Reviews", icon: Star, href: "/admin/reviews" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-fog flex">
      <aside className="w-64 bg-midnight text-white flex flex-col shrink-0 min-h-screen">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-lg font-bold">🏪 Authentic Gadget</h1>
          <p className="text-xs text-white/40 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
            const isActive = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={id}
                href={href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-electric text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            Exit to Store
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
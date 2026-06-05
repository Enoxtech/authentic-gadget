"use client";

import { usePathname } from "next/navigation";
import { Package, ShoppingCart, Users, BarChart3, Settings, LogOut, LayoutDashboard, Megaphone, Star } from "lucide-react";
import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";

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

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Login page renders full-screen with NO sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-fog lg:flex">
      {/* Sidebar */}
      <aside className="sticky top-0 z-30 bg-midnight text-white lg:flex lg:min-h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="p-4 border-b border-white/10 lg:p-6">
          <h1 className="text-lg font-bold">Authentic Gadget</h1>
          <p className="text-xs text-white/40 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:space-y-1 lg:overflow-visible">
          {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
            const isActive = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={id}
                href={href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all lg:w-full lg:gap-3 ${
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
          <button
            type="button"
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white lg:hidden"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </nav>
        <div className="hidden p-3 border-t border-white/10 lg:block">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 overflow-auto">
        <ErrorBoundary
          fallback={
            <div style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F8F9FB",
              fontFamily: "system-ui, sans-serif",
              padding: "24px",
            }}>
              <div style={{ textAlign: "center", maxWidth: "400px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1A1A1A", marginBottom: "8px" }}>
                  This page couldn&apos;t load
                </h1>
                <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
                  An unexpected error occurred.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: "12px 24px",
                    background: "#0B1F3A",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Reload page
                </button>
              </div>
            </div>
          }
        >
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
}

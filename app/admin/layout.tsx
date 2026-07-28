"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Package, ShoppingCart, Users, BarChart3, Settings, LogOut, LayoutDashboard, Megaphone, Star, Image as ImageIcon, Tag, Truck, ShieldCheck, ScrollText } from "lucide-react";
import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";

type AdminRole = "super_admin" | "support" | "product_manager";

const ALL_ROLES: AdminRole[] = ["super_admin", "support", "product_manager"];

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard", roles: ["super_admin"] as AdminRole[] },
  { id: "orders", label: "Orders", icon: ShoppingCart, href: "/admin/orders", roles: ALL_ROLES },
  { id: "products", label: "Products", icon: Package, href: "/admin/products", roles: ALL_ROLES },
  { id: "categories", label: "Categories", icon: Tag, href: "/admin/categories", roles: ALL_ROLES },
  { id: "banners", label: "Banners", icon: ImageIcon, href: "/admin/banners", roles: ["super_admin", "product_manager"] as AdminRole[] },
  { id: "coupons", label: "Coupons", icon: Tag, href: "/admin/coupons", roles: ["super_admin", "product_manager"] as AdminRole[] },
  { id: "delivery-areas", label: "Delivery Areas", icon: Truck, href: "/admin/delivery-areas", roles: ["super_admin", "product_manager"] as AdminRole[] },
  { id: "customers", label: "Customers", icon: Users, href: "/admin/customers", roles: ["super_admin", "support"] as AdminRole[] },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics", roles: ["super_admin"] as AdminRole[] },
  { id: "campaigns", label: "Campaigns", icon: Megaphone, href: "/admin/campaigns", roles: ["super_admin", "product_manager"] as AdminRole[] },
  { id: "reviews", label: "Reviews", icon: Star, href: "/admin/reviews", roles: ["super_admin", "support"] as AdminRole[] },
  { id: "team", label: "Admin Team", icon: ShieldCheck, href: "/admin/team", roles: ["super_admin"] as AdminRole[] },
  { id: "audit-log", label: "Audit Log", icon: ScrollText, href: "/admin/audit-log", roles: ["super_admin"] as AdminRole[] },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings", roles: ["super_admin"] as AdminRole[] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setRole(me?.role ?? null))
      .catch(() => setRole(null));
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/admin/login" || role === null) return;
    const navItem = NAV_ITEMS.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
    if (navItem && !navItem.roles.includes(role)) {
      router.replace("/admin/products");
    }
  }, [pathname, role, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Login page renders full-screen with NO sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const visibleNavItems = role ? NAV_ITEMS.filter((n) => n.roles.includes(role)) : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-fog lg:flex">
      {/* Sidebar */}
      <aside className="sticky top-0 z-30 bg-midnight text-white lg:flex lg:min-h-screen lg:w-64 lg:shrink-0 lg:flex-col" style={{ borderRight: "1px solid rgba(201,169,110,0.12)" }}>
        <div className="p-4 border-b border-white/10 lg:p-6">
          <h1 className="text-lg font-bold font-display" style={{ background: "linear-gradient(135deg, #D4A843, #19AFFF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Authentic Gadget
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:space-y-1 lg:overflow-visible">
          {visibleNavItems.map(({ id, label, icon: Icon, href }) => {
            const isActive = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={id}
                href={href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all lg:w-full lg:gap-3 ${
                  isActive
                    ? "text-white shadow-gold-glow-sm"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
                style={isActive ? { background: "linear-gradient(135deg, rgba(212,168,67,0.22), rgba(25,175,255,0.18))", border: "1px solid rgba(212,168,67,0.3)" } : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" style={isActive ? { color: "#D4A843" } : undefined} />
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, User, ChevronRight, LogOut, ShoppingBag } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_city: string;
  shipping_region: string;
  total: number;
  payment_status: string;
  order_status: string;
  payment_method: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await authClient.getSession();
        const user = data?.user || null;
        if (!user) {
          router.push("/login?redirect=/account/profile");
          return;
        }
        setUser(user);

        // Fetch orders for this user
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/login?redirect=/account/profile");
      } finally {
        setCheckingAuth(false);
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric/20 border-t-electric rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const statusColors: Record<string, string> = {
    pending: "text-amber-500",
    processing: "text-blue-400",
    shipped: "text-purple-400",
    delivered: "text-green-400",
    cancelled: "text-red-400",
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-fog py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">My Account</h1>
            <p className="text-charcoal/50 text-sm mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-fog-200 text-charcoal text-sm font-medium hover:bg-fog transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar nav */}
          <div className="bg-white rounded-[28px] p-4 card-premium border border-[var(--border-color)] h-fit">
            <nav className="space-y-1">
              {[
                { label: "Profile", href: "/account/profile", icon: User },
                { label: "My Orders", href: "/account/orders", icon: ShoppingBag },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-charcoal hover:bg-fog transition-colors font-medium text-sm"
                >
                  <Icon className="w-4 h-4 text-electric" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Orders */}
            <div className="bg-white rounded-[28px] p-6 card-premium border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-charcoal text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-electric" />
                  My Orders
                </h2>
                <Link href="/account/orders" className="text-sm text-electric font-medium hover:underline">
                  View all
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-charcoal/50 text-sm mb-4">No orders yet</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-electric text-white text-sm font-semibold rounded-xl hover:bg-electric/90 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="flex items-center gap-4 p-4 bg-fog rounded-xl hover:bg-fog-200 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-electric" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-charcoal">{order.id}</p>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${paymentStatusColors[order.payment_status] || paymentStatusColors.pending}`}>
                            {order.payment_status}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal/50 mt-0.5">
                          {order.shipping_city}, {order.shipping_region} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-charcoal text-sm">{formatPrice(Number(order.total))}</p>
                        <p className={`text-xs font-medium ${statusColors[order.order_status] || "text-charcoal/50"}`}>
                          {order.order_status || "pending"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-charcoal/30 shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

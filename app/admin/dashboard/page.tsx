"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Package, ShoppingCart, Users, DollarSign, Eye, Edit, Trash2, Plus, BarChart3 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  "low-stock": "bg-orange-100 text-orange-700",
};

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  status?: string;
}

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stat[]>([
    { label: "Total Revenue", value: "¢0", change: "+0%", icon: DollarSign, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Orders", value: "0", change: "+0", icon: ShoppingCart, color: "text-electric", bgColor: "bg-electric/10" },
    { label: "Products", value: "0", change: "+0", icon: Package, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: "Customers", value: "0", change: "+0", icon: Users, color: "text-orange-600", bgColor: "bg-orange-50" },
  ]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadData();
  }, [router]);

  async function loadData() {
    try {
      const supabase = createClient();

      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("products").select("*").order("name", { ascending: true }).limit(6),
        supabase.from("customers").select("id", { count: "exact", head: true }),
      ]);

      if (ordersRes.data) {
        const totalRevenue = ordersRes.data.reduce((sum: number, o: Order) => sum + (o.total || 0), 0);
        setStats(prev => [
          { ...prev[0], value: `¢${totalRevenue.toLocaleString()}` },
          { ...prev[1], value: String(ordersRes.data?.length || 0) },
        ]);
        setRecentOrders(ordersRes.data);
      }

      if (productsRes.data) {
        setTopProducts(productsRes.data);
        setStats(prev => [{ ...prev[0] }, { ...prev[1] }, { ...prev[2], value: String(productsRes.data?.length || 0) }, prev[3]]);
      }

      if (customersRes.count !== null) {
        setStats(prev => [
          prev[0], prev[1], prev[2],
          { ...prev[3], value: String(customersRes.count || 0) },
        ]);
      }
    } catch {
      // fallback to zeros on error
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Overview</h2>
          <p className="text-sm text-charcoal/50">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-charcoal/50">🟢 All systems normal</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-card animate-pulse">
                <div className="h-10 w-10 bg-fog rounded-xl mb-3" />
                <div className="h-8 bg-fog rounded w-24 mb-1" />
                <div className="h-4 bg-fog rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, change, icon: Icon, color, bgColor }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bgColor}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-charcoal mb-0.5">{value}</p>
                <p className="text-xs text-charcoal/50">{label}</p>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-charcoal">Recent Orders</h3>
              <Link href="/admin/orders" className="text-sm text-electric font-medium hover:underline">View All →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-charcoal/40 text-sm text-center py-8">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-charcoal/50 text-left border-b border-fog">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="border-b border-fog last:border-0 hover:bg-fog/50">
                        <td className="py-3 font-medium text-charcoal">{o.id}</td>
                        <td className="py-3 text-charcoal/70">{o.customer_name || "—"}</td>
                        <td className="py-3 text-charcoal/50">{formatDate(o.created_at)}</td>
                        <td className="py-3 font-medium text-charcoal">¢{(o.total || 0).toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.order_status] || "bg-gray-100 text-gray-600"}`}>
                            {o.order_status?.charAt(0).toUpperCase() + (o.order_status?.slice(1) || "—")}
                          </span>
                        </td>
                        <td className="py-3">
                          <Link href={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 p-1.5 hover:bg-fog rounded-lg text-charcoal/40 hover:text-electric">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-charcoal">Products</h3>
              <Link href="/admin/products" className="text-sm text-electric font-medium hover:underline">Manage →</Link>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-charcoal/40 text-sm text-center py-8">No products yet</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-3 border-b border-fog last:border-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-fog shrink-0">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-charcoal/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-charcoal truncate">{p.name}</p>
                      <p className="text-xs text-charcoal/50">Stock: {p.stock}</p>
                    </div>
                    <p className="font-bold text-sm text-charcoal">¢{p.price?.toLocaleString()}</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.stock === 0 ? "bg-red-100 text-red-700" :
                      p.stock < 5 ? "bg-orange-100 text-orange-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {p.stock === 0 ? "Out of Stock" : p.stock < 5 ? "Low Stock" : "In Stock"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
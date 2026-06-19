"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, DollarSign, ShoppingCart, TrendingUp, Users, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    topProduct: "",
  });

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadAnalytics() {
    try {
      const response = await fetch("/api/admin/analytics");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = (await response.json()) as { stats?: typeof stats; error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to load analytics");
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: "Total Orders", value: String(stats.totalOrders), icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
    { label: "Avg Order Value", value: formatPrice(stats.avgOrderValue), icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    { label: "Total Customers", value: String(stats.totalCustomers), icon: Users, color: "bg-orange-50 text-orange-600" },
    { label: "Total Products", value: String(stats.totalProducts), icon: Package, color: "bg-electric/10 text-electric" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal">Analytics</h2>
        <p className="text-sm text-charcoal/50">Store performance insights</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card animate-pulse">
              <div className="h-4 w-24 bg-fog rounded mb-4" />
              <div className="h-8 w-20 bg-fog rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl p-6 shadow-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm text-charcoal/50 font-medium mb-1">{label}</p>
                <p className="text-2xl font-bold text-charcoal">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-electric" />
              </div>
              <h3 className="font-bold text-charcoal">Top Product</h3>
            </div>
            <p className="text-charcoal text-lg font-semibold">{stats.topProduct}</p>
            <p className="text-sm text-charcoal/50 mt-1">Highest performing product by revenue</p>
          </div>
        </>
      )}
    </div>
  );
}

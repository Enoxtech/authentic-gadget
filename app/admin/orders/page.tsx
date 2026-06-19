"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const FILTERS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  item_count?: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadOrders() {
    try {
      const response = await fetch("/api/admin/orders");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to load orders");
      const data = (await response.json()) as { orders?: Order[] };
      setOrders(data.orders || []);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  const filtered = orders.filter((o) => {
    const matchesFilter =
      filter === "All" || o.order_status?.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      !search ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Orders</h2>
          <p className="text-sm text-charcoal/50">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-card mb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-electric text-white"
                  : "bg-fog text-charcoal/60 hover:bg-charcoal/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-charcoal/40">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-charcoal/40">No orders found</div>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-charcoal/50 text-left border-b border-fog">
                  <th className="pb-3 px-6 font-medium">Order ID</th>
                  <th className="pb-3 px-6 font-medium">Customer</th>
                  <th className="pb-3 px-6 font-medium">Phone</th>
                  <th className="pb-3 px-6 font-medium">Items</th>
                  <th className="pb-3 px-6 font-medium">Total</th>
                  <th className="pb-3 px-6 font-medium">Payment</th>
                  <th className="pb-3 px-6 font-medium">Order Status</th>
                  <th className="pb-3 px-6 font-medium">Date</th>
                  <th className="pb-3 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-fog last:border-0 hover:bg-fog/50 cursor-pointer"
                    onClick={() => router.push(`/admin/orders/${o.id}`)}
                  >
                    <td className="py-3.5 px-6 font-medium text-charcoal">{o.id}</td>
                    <td className="py-3.5 px-6 text-charcoal/70">{o.customer_name || "-"}</td>
                    <td className="py-3.5 px-6 text-charcoal/70">{o.customer_phone || "-"}</td>
                    <td className="py-3.5 px-6 text-charcoal/70">{o.item_count ?? 0}</td>
                    <td className="py-3.5 px-6 font-medium text-charcoal">{formatPrice(o.total || 0)}</td>
                    <td className="py-3.5 px-6">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PAYMENT_COLORS[o.payment_status] || "bg-gray-100 text-gray-600"}`}>
                        {o.payment_status?.charAt(0).toUpperCase() + (o.payment_status?.slice(1) || "-")}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.order_status] || "bg-gray-100 text-gray-600"}`}>
                        {o.order_status?.charAt(0).toUpperCase() + (o.order_status?.slice(1) || "-")}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-charcoal/50">{formatDate(o.created_at)}</td>
                    <td className="py-3.5 px-6" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 p-1.5 hover:bg-fog rounded-lg text-charcoal/40 hover:text-electric transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-fog md:hidden">
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => router.push(`/admin/orders/${o.id}`)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-charcoal">{o.id}</p>
                    <p className="mt-1 text-sm text-charcoal/60">{o.customer_name || "-"}</p>
                    <p className="mt-1 text-xs text-charcoal/40">
                      {formatDate(o.created_at)} - {o.item_count ?? 0} items
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-charcoal">
                    {formatPrice(o.total || 0)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PAYMENT_COLORS[o.payment_status] || "bg-gray-100 text-gray-600"}`}>
                    {o.payment_status?.charAt(0).toUpperCase() + (o.payment_status?.slice(1) || "-")}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.order_status] || "bg-gray-100 text-gray-600"}`}>
                    {o.order_status?.charAt(0).toUpperCase() + (o.order_status?.slice(1) || "-")}
                  </span>
                </div>
              </button>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}

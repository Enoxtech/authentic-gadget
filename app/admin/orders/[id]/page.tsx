"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Phone, Mail, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  products?: { name: string; images: string[] };
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_region: string | null;
  total: number;
  shipping: number;
  subtotal: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router2 = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const orderId = params.id as string;

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router2.push("/admin/login");
      return;
    }
    loadOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router2]);

  async function loadOrder() {
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
      if (response.status === 401) {
        router2.push("/admin/login");
        return;
      }
      const data = (await response.json()) as {
        order?: Order;
        items?: OrderItem[];
      };
      if (response.ok) {
        setOrder(data.order || null);
        setItems(data.items || []);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(status: string) {
    if (!order) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: status }),
      });
      if (!response.ok) throw new Error("Failed to update order");
      setOrder((prev) => prev ? { ...prev, order_status: status } : null);
    } finally {
      setUpdating(false);
    }
  }

  async function updatePaymentStatus(status: string) {
    if (!order) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: status }),
      });
      if (!response.ok) throw new Error("Failed to update payment");
      setOrder((prev) => prev ? { ...prev, payment_status: status } : null);
    } finally {
      setUpdating(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-fog rounded w-48" />
          <div className="h-64 bg-fog rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center">
        <p className="text-charcoal/50">Order not found</p>
        <button onClick={() => router2.push("/admin/orders")} className="mt-4 text-electric underline">Back to orders</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => router2.push("/admin/orders")}
          className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center hover:bg-fog transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Order {order.id}</h2>
          <p className="text-sm text-charcoal/50">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-electric" />
              Order Items
            </h3>
            {items.length === 0 ? (
              <p className="text-charcoal/40 text-sm">No items</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-fog last:border-0">
                    <div className="w-14 h-14 rounded-xl bg-fog overflow-hidden shrink-0">
                      {(item.products?.images?.[0] || item.product_image) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.products?.images?.[0] || item.product_image || ""} alt={item.products?.name || item.product_name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-charcoal/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-charcoal">{item.products?.name || item.product_name || "-"}</p>
                      <p className="text-xs text-charcoal/50">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-charcoal">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-fog space-y-2">
              <div className="flex justify-between text-sm text-charcoal/60">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal || order.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-charcoal/60">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-charcoal text-base pt-2 border-t border-fog">
                <span>Total</span>
                <span>{formatPrice(order.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Status controls */}
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-charcoal mb-4">Update Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-charcoal/50 mb-2 font-medium uppercase tracking-wider">Order Status</p>
                <div className="flex flex-wrap gap-2">
                  {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                    <button
                      key={s}
                      disabled={updating || order.order_status === s}
                      onClick={() => updateOrderStatus(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        order.order_status === s
                          ? ORDER_STATUS_COLORS[s]
                          : "bg-fog text-charcoal/50 hover:bg-charcoal/10"
                      } ${order.order_status !== s ? "opacity-60 hover:opacity-100" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 mb-2 font-medium uppercase tracking-wider">Payment Status</p>
                <div className="flex flex-wrap gap-2">
                  {["pending", "paid", "failed"].map((s) => (
                    <button
                      key={s}
                      disabled={updating || order.payment_status === s}
                      onClick={() => updatePaymentStatus(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        order.payment_status === s
                          ? PAYMENT_COLORS[s]
                          : "bg-fog text-charcoal/50 hover:bg-charcoal/10"
                      } ${order.payment_status !== s ? "opacity-60 hover:opacity-100" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer info sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-charcoal mb-4">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-electric/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-electric text-sm font-bold">{(order.customer_name || "?").charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal text-sm">{order.customer_name || "-"}</p>
                </div>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-3 text-sm text-charcoal/60">
                  <Mail className="w-4 h-4 shrink-0" />
                  {order.customer_email}
                </div>
              )}
              {order.customer_phone && (
                <div className="flex items-center gap-3 text-sm text-charcoal/60">
                  <Phone className="w-4 h-4 shrink-0" />
                  {order.customer_phone}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-charcoal mb-4">Delivery Address</h3>
            <div className="space-y-2 text-sm text-charcoal/60">
              {order.shipping_address && <p className="text-charcoal font-medium">{order.shipping_address}</p>}
              {order.shipping_city && <p>{order.shipping_city}{order.shipping_region ? `, ${order.shipping_region}` : ""}</p>}
              {order.shipping_region && !order.shipping_city && <p>{order.shipping_region}</p>}
              {!order.shipping_address && !order.shipping_city && !order.shipping_region && <p className="text-charcoal/40">No address provided</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-charcoal mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/50">Order ID</span>
                <span className="font-mono text-xs text-charcoal">{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/50">Payment</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PAYMENT_COLORS[order.payment_status] || ""}`}>
                  {order.payment_status?.charAt(0).toUpperCase() + (order.payment_status?.slice(1) || "")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/50">Order</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.order_status] || ""}`}>
                  {order.order_status?.charAt(0).toUpperCase() + (order.order_status?.slice(1) || "")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

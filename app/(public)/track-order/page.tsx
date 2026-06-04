"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, Package, Search, Truck } from "lucide-react";

interface TrackedOrder {
  id: string;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_city: string | null;
  shipping_region: string | null;
  created_at: string;
}

const STEPS = [
  { id: "pending", label: "Order placed", icon: Clock },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOrderId(new URLSearchParams(window.location.search).get("order") || "");
  }, []);

  const trackOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/orders/track?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`
      );
      const data = (await response.json()) as {
        error?: string;
        order?: TrackedOrder;
      };

      if (!response.ok || !data.order) {
        throw new Error(data.error || "Unable to find order");
      }

      setOrder(data.order);
    } catch (lookupError: unknown) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Unable to find order"
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order
    ? Math.max(0, STEPS.findIndex((step) => step.id === order.order_status))
    : 0;

  return (
    <div className="min-h-screen bg-fog py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-charcoal mb-2 text-center">Track Your Order</h1>
        <p className="text-charcoal/50 text-center mb-8">
          Enter the order ID and checkout email to see live status.
        </p>

        <form onSubmit={trackOrder} className="bg-white rounded-2xl p-5 shadow-card mb-8 space-y-3">
          <input
            type="text"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Order ID, e.g. AG_..."
            className="w-full px-4 py-3 rounded-xl bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Checkout email"
            className="w-full px-4 py-3 rounded-xl bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric"
          />
          <button
            type="submit"
            disabled={loading || !orderId.trim() || !email.trim()}
            className="w-full px-6 py-3 bg-electric text-white font-semibold rounded-xl hover:bg-electric/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Search className="w-4 h-4" /> {loading ? "Checking..." : "Track order"}
          </button>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </form>

        {order && (
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-fog">
              <div>
                <p className="text-xs text-charcoal/50 mb-1">Order ID</p>
                <p className="font-bold text-charcoal">{order.id}</p>
                <p className="text-xs text-charcoal/50 mt-1">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-electric">
                  GHS {Number(order.total).toLocaleString()}
                </p>
                <p className="text-xs text-charcoal/50 capitalize">
                  Payment: {order.payment_status}
                </p>
              </div>
            </div>

            <div className="space-y-0">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const done = index <= currentStep;
                return (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "bg-electric text-white" : "bg-fog text-charcoal/30"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className={`w-0.5 h-12 ${index < currentStep ? "bg-electric" : "bg-fog-200"}`} />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className={`font-semibold text-sm ${done ? "text-charcoal" : "text-charcoal/40"}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-5 border-t border-fog text-sm text-charcoal/60">
              Delivery destination: {[order.shipping_city, order.shipping_region].filter(Boolean).join(", ") || "Not provided"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

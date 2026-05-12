"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Package, CheckCircle, Truck, Clock } from "lucide-react";

const STEPS = [
  { label: "Order Placed", icon: Clock, date: "Apr 13, 2026 — 10:30 AM", done: true },
  { label: "Payment Confirmed", icon: CheckCircle, date: "Apr 13, 2026 — 10:32 AM", done: true },
  { label: "Processing", icon: Package, date: "Apr 13, 2026 — 2:15 PM", done: true },
  { label: "Shipped", icon: Truck, date: "Estimated Apr 15", done: false },
  { label: "Delivered", icon: CheckCircle, date: "Estimated Apr 16-17", done: false },
];

const metadata = {
  title: "Track Your Order | Authentic Gadget",
  description: "Follow your Authentic Gadget order from placement to delivery.",
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [found, setFound] = useState(false);

  const trackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) setFound(true);
  };

  return (
    <div className="min-h-screen bg-fog py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-charcoal mb-2 text-center">Track Your Order</h1>
        <p className="text-charcoal/50 text-center mb-8">Enter your order ID to see delivery progress</p>

        {/* Search */}
        <form onSubmit={trackOrder} className="bg-white rounded-2xl p-4 shadow-card mb-8 flex gap-3">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. AG-7K9M2N4P"
            className="flex-1 px-4 py-3 rounded-xl bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric"
          />
          <button type="submit" className="px-6 py-3 bg-electric text-white font-semibold rounded-xl hover:bg-electric/90 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" /> Track
          </button>
        </form>

        {found && (
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-fog">
              <div>
                <p className="text-xs text-charcoal/50 mb-1">Order ID</p>
                <p className="font-bold text-charcoal">AG-7K9M2N4P</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-charcoal/50 mb-1">Est. Delivery</p>
                <p className="font-bold text-electric">Apr 16–17, 2026</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-0">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === STEPS.length - 1;
                return (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.done ? "bg-electric text-white" : "bg-fog text-charcoal/30"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {!isLast && <div className={`w-0.5 h-12 ${step.done ? "bg-electric" : "bg-fog-200"}`} />}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className={`font-semibold text-sm ${step.done ? "text-charcoal" : "text-charcoal/40"}`}>{step.label}</p>
                      <p className={`text-xs ${step.done ? "text-charcoal/50" : "text-charcoal/30"}`}>{step.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-fog">
              <Link href="/(account)/orders/AG-7K9M2N4P" className="text-sm text-electric font-medium hover:underline">
                View Order Details →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

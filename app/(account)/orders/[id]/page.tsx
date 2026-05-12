"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, CheckCircle, Truck, Clock, MapPin, ArrowLeft } from "lucide-react";

const MOCK_ORDER = {
  id: "AG-7K9M2N4P",
  date: "April 13, 2026",
  status: "processing",
  paymentStatus: "paid",
  subtotal: 13998,
  shipping: 0,
  total: 13998,
  delivery: {
    name: "Kofi A.",
    phone: "+233 200 000 000",
    address: "23 Spintex Road",
    city: "Accra",
    region: "Greater Accra",
  },
  items: [
    {
      id: "1",
      name: "iPhone 15 Pro Max 256GB Natural Titanium",
      price: 12499,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1592750475338-4b09a80f1c1e?w=200&h=200&fit=crop",
    },
    {
      id: "2",
      name: "Apple AirPods Pro 2",
      price: 1499,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=200&h=200&fit=crop",
    },
  ],
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
};

export default function OrderDetailPage() {
  const order = MOCK_ORDER;
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <div className="min-h-screen bg-fog py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/(account)/profile" className="p-2 bg-white rounded-xl hover:bg-fog transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Order {order.id}</h1>
            <p className="text-sm text-charcoal/50">Placed on {order.date}</p>
          </div>
          <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-5 shadow-card mb-6">
          <h2 className="font-semibold text-charcoal mb-4">Delivery Progress</h2>
          <div className="flex items-center gap-2">
            {["Placed", "Paid", "Processing", "Shipped", "Delivered"].map((label, i, arr) => {
              const idx = ["pending", "processing", "shipped", "delivered"].indexOf(order.status);
              const currentIdx = idx < 0 ? 0 : idx + 1;
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div key={label} className="flex-1 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                    done ? "bg-electric text-white" : active ? "bg-electric/20 text-electric border-2 border-electric" : "bg-fog text-charcoal/30"
                  }`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <p className={`text-xs text-center ${done ? "text-charcoal" : "text-charcoal/40"}`}>{label}</p>
                  {i < arr.length - 1 && <div className={`w-full h-0.5 mt-2 ${done ? "bg-electric" : "bg-fog"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-5 shadow-card mb-6">
          <h2 className="font-semibold text-charcoal mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-fog shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-charcoal truncate">{item.name}</p>
                  <p className="text-xs text-charcoal/50">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-sm text-charcoal">GHS{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-fog space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-charcoal/60">Subtotal</span><span className="font-medium text-charcoal">GHS{order.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-charcoal/60">Shipping</span><span className="font-medium text-charcoal">{order.shipping === 0 ? "Free" : `GHS${order.shipping}`}</span></div>
            <div className="flex justify-between border-t border-fog pt-2"><span className="font-bold text-charcoal">Total</span><span className="font-bold text-electric">GHS{order.total.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-2xl p-5 shadow-card mb-6">
          <h2 className="font-semibold text-charcoal mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-electric" /> Delivery Address</h2>
          <p className="text-sm text-charcoal/70">{order.delivery.name}</p>
          <p className="text-sm text-charcoal/50">{order.delivery.address}</p>
          <p className="text-sm text-charcoal/50">{order.delivery.city}, {order.delivery.region}</p>
          <p className="text-sm text-charcoal/50">{order.delivery.phone}</p>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-semibold text-charcoal mb-3">Payment Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-charcoal/60">Method</span><span className="font-medium text-charcoal">Paystack</span></div>
            <div className="flex justify-between"><span className="text-charcoal/60">Status</span><span className="text-green-600 font-medium">Paid</span></div>
            <div className="flex justify-between"><span className="text-charcoal/60">Reference</span><span className="font-mono text-xs text-charcoal">{order.id}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

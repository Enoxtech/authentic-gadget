"use client";
import { Truck, Shield, RotateCcw, Clock } from "lucide-react";

export default function DeliveryBadges() {
  const badges = [
    { icon: Truck, label: "Free Delivery", sub: "Across Ghana" },
    { icon: Clock, label: "Ships in 24 Hours", sub: "Order before 2pm" },
    { icon: Shield, label: "2-Year Warranty", sub: "On all devices" },
    { icon: RotateCcw, label: "7-Day Returns", sub: "Easy refund policy" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {badges.map(({ icon: Icon, label, sub }) => (
        <div key={label} className="card-glossy-dark rounded-2xl p-4 flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-electric" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{label}</p>
            <p className="text-zinc-500 text-xs">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

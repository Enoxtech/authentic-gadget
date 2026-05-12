"use client";

import { useEffect, useRef } from "react";

const badges = [
  "🔒 100% Authentic Products",
  "✅ CAC Verified Business",
  "🚚 Free Shipping ₦50k+",
  "↩️ 7-Day Returns",
  "💬 WhatsApp Support",
  "⚡ Same-Day Lagos Delivery",
  "🏦 Secure Payment",
  "📦 Tracking Available",
  "⭐ 4.9/5 Customer Rating",
  "🔌 Apple Authorized Reseller",
];

export default function TrustBadges() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let x = 0;
    const speed = 30; // px per second

    const step = (timestamp: number) => {
      if (!track) return;
      x -= speed / 60;
      const half = track.scrollWidth / 2;
      if (Math.abs(x) >= half) x = 0;
      track.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(step);
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...badges, ...badges]; // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden bg-black/40 border-b border-white/5 py-3">
      <div
        ref={trackRef}
        className="flex items-center gap-10 whitespace-nowrap"
        style={{ width: "max-content" }}
      >
        {items.map((badge, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-zinc-400 text-xs font-medium shrink-0"
          >
            <span>{badge.split(" ")[0]}</span>
            <span>{badge.split(" ").slice(1).join(" ")}</span>
            <span className="text-white/10 ml-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

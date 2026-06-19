"use client";

import Image from "next/image";
import Link from "next/link";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { formatPrice } from "@/lib/utils";

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { items } = useRecentlyViewed();
  const filtered = items.filter((p) => p.id !== excludeId).slice(0, 6);

  if (filtered.length === 0) return null;

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-display text-lg font-bold text-fog mb-5">Recently Viewed</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {filtered.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="card-dark card-premium rounded-2xl overflow-hidden shrink-0 w-36 sm:w-40">
              <div className="relative aspect-square bg-[var(--surface-raised)] p-3">
                <Image src={p.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300"} alt={p.name} fill className="object-contain p-2" onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%230B1E3D'/%3E%3Ctext x='300' y='320' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='140' fill='%23D4A843' text-anchor='middle'%3EAG%3C/text%3E%3C/svg%3E"; }} unoptimized />
              </div>
              <div className="p-3">
                <p className="text-xs text-fog leading-tight line-clamp-2 mb-1.5 min-h-[32px]">{p.name}</p>
                <p className="text-sm font-bold text-gold font-label">{formatPrice(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

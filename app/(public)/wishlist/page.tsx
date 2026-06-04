import Link from "next/link";
import { Heart, PackageSearch, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-[#040820] px-4 py-12">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/[0.08] bg-[#06112B] p-6 text-center shadow-layers sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-300">
          <Heart className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-fog">
          Your wishlist is ready for saved picks
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-fog-muted">
          Wishlist persistence is the next feature to wire into customer accounts.
          For now, use this page as the saved-items destination and continue shopping
          verified gadgets from the catalog.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-4 text-sm font-bold text-[#030618] transition hover:bg-gold-dark"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse products
          </Link>
          <Link
            href="/track-order"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-bold text-fog transition hover:bg-white/[0.08]"
          >
            <PackageSearch className="h-4 w-4" />
            Track order
          </Link>
        </div>
      </section>
    </main>
  );
}

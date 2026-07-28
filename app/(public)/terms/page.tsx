import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-12">
      <article className="mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-[var(--surface)] p-6 shadow-layers sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Terms of Service</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-fog">Terms for shopping with Authentic Gadget</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-fog-muted">
          <p>
            Product prices, stock availability, delivery timelines, and promotions can
            change. Checkout totals are calculated from the current product records.
          </p>
          <p>
            Orders may be paid by supported online payment channels or cash on delivery
            where available. Manual bank transfer orders remain pending until payment is
            verified by admin. Online payment status is confirmed through provider webhooks.
          </p>
          <p>
            Returns and warranty handling depend on product condition, supplier terms,
            and proof of purchase. Contact support with your order ID for help.
          </p>
        </div>
        <Link href="/products" className="mt-8 inline-flex text-sm font-bold text-gold hover:text-gold-light">
          Continue shopping
        </Link>
      </article>
    </main>
  );
}

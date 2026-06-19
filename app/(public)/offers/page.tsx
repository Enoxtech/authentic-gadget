import Link from "next/link";
import { ArrowRight, BadgePercent, ShieldCheck, Truck, Zap } from "lucide-react";

const offers = [
  {
    title: "Launch Week Bundle",
    description: "Pair a phone with audio or accessories and save more at checkout.",
    label: "Up to 15% off bundles",
    accent: "from-violet-500 to-cyan-400",
  },
  {
    title: "Same-Day Accra Delivery",
    description: "Selected in-stock items qualify for fast dispatch inside Accra.",
    label: "Fast delivery",
    accent: "from-gold to-amber-300",
  },
  {
    title: "Verified Premium Picks",
    description: "Shop high-demand gadgets with authenticity checks before dispatch.",
    label: "Authentic only",
    accent: "from-emerald-400 to-cyan-400",
  },
];

export default function OffersPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[var(--surface)]">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
            <BadgePercent className="h-4 w-4" />
            Current Offers
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight text-fog sm:text-5xl">
            Better gadget deals without guessing what is genuine.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-fog-muted sm:text-base">
            Authentic Gadget offers are built around verified products, realistic delivery,
            and checkout totals calculated from live product prices.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 text-sm font-bold text-[#030618] transition hover:bg-gold-dark"
            >
              Shop all products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/track-order"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-bold text-fog transition hover:bg-white/[0.08]"
            >
              Track an order
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer) => (
            <article
              key={offer.title}
              className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-layers"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${offer.accent}`} />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                {offer.label}
              </p>
              <h2 className="mt-4 text-xl font-bold text-fog">{offer.title}</h2>
              <p className="mt-3 text-sm leading-6 text-fog-muted">{offer.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-3xl border border-gold/15 bg-gold/5 p-5 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Authenticity checked", text: "Products are reviewed before dispatch." },
            { icon: Truck, title: "Delivery first", text: "Order status can be tracked after checkout." },
            { icon: Zap, title: "Secure payments", text: "Paystack and Flutterwave use stored order totals." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-1 h-5 w-5 shrink-0 text-gold" />
              <div>
                <h3 className="text-sm font-bold text-fog">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-fog-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

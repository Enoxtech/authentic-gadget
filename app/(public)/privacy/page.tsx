import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-12">
      <article className="mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-[var(--surface)] p-6 shadow-layers sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Privacy Policy</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-fog">How Authentic Gadget handles customer data</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-fog-muted">
          <p>
            We collect the information needed to create accounts, process orders,
            confirm payments, deliver products, and provide customer support.
          </p>
          <p>
            Payment details are handled by supported payment providers such as Hubtel, Paystack, or Flutterwave. Authentic Gadget
            stores order references, customer contact details, delivery information,
            and payment status so orders can be fulfilled and tracked.
          </p>
          <p>
            Product and banner images may be stored with Cloudflare R2 so they can be
            delivered quickly and reliably across the storefront.
          </p>
          <p>
            Customer account access is managed through Supabase authentication. Keep
            your password private and contact support if you suspect unauthorized access.
          </p>
        </div>
        <Link href="/contact" className="mt-8 inline-flex text-sm font-bold text-gold hover:text-gold-light">
          Contact support
        </Link>
      </article>
    </main>
  );
}

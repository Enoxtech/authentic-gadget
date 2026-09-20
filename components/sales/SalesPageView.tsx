"use client";

import Image from "next/image";
import Script from "next/script";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-pixel";
import type { SalesPage, SalesPaymentMethod } from "@/types/sales-page";

function pixelScript(pixelId: string, page: SalesPage) {
  const product = page.product!;
  return `
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init','${pixelId}');
  fbq('track','ViewContent',{content_ids:['${product.id}'],content_name:${JSON.stringify(product.name)},content_type:'product',value:${Number(product.price)},currency:'GHS'});
  `;
}

export default function SalesPageView({ page, conversionEvent = "" }: { page: SalesPage; conversionEvent?: string }) {
  const router = useRouter();
  const product = page.product!;
  const formConfig = page.config.form;
  const allowedPayments = useMemo<SalesPaymentMethod[]>(() => {
    const methods: SalesPaymentMethod[] = [];
    if (formConfig.allowCod) methods.push("cod");
    if (formConfig.allowBankTransfer) methods.push("bank_transfer");
    return methods.length ? methods : ["cod"];
  }, [formConfig.allowCod, formConfig.allowBankTransfer]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<SalesPaymentMethod>(
    allowedPayments.includes(formConfig.defaultPaymentMethod) ? formConfig.defaultPaymentMethod : allowedPayments[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const accent = page.config.accentColor;
  const image = page.config.heroImageUrl || product.images?.[0] || "/logo-mark.png";

  function scrollToForm() {
    document.getElementById("sales-order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    trackMetaEvent("InitiateCheckout", { content_ids: [product.id], value: product.price * quantity, currency: "GHS" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your full name.");
    if (formConfig.showEmail && !/^\S+@\S+\.\S+$/.test(form.email)) return setError("Please enter a valid email address.");
    if (formConfig.showPhone && !form.phone.trim()) return setError("Please enter your phone number.");
    if (formConfig.showAddress && !form.address.trim()) return setError("Please enter your delivery address.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          customer_email: form.email.trim(),
          customer_phone: form.phone.trim(),
          shipping_address: form.address.trim() || "Delivery details to be confirmed",
          shipping_city: "Accra",
          shipping_region: "Greater Accra",
          order_note: [`Sales page: ${page.name} (${page.slug}).`, form.notes.trim()].filter(Boolean).join(" "),
          payment_method: paymentMethod,
          sales_page_id: page.id,
          items: [{ product_id: product.id, quantity }],
        }),
      });
      const data = (await response.json()) as { orderId?: string; total?: number; error?: string };
      if (!response.ok || !data.orderId || typeof data.total !== "number") throw new Error(data.error || "Unable to place order");
      const eventData = { content_ids: [product.id], content_name: product.name, value: data.total, currency: "GHS", order_id: data.orderId };
      trackMetaEvent("Purchase", eventData);
      if (conversionEvent) trackMetaCustomEvent(conversionEvent, eventData);
      router.push(`/thank-you/${page.slug}?order=${encodeURIComponent(data.orderId)}&total=${data.total}&method=${paymentMethod}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050b1c] text-white" style={{ "--sales-accent": accent } as React.CSSProperties}>
      {page.meta_pixel_id && <Script id={`sales-page-pixel-${page.id}`} strategy="afterInteractive">{pixelScript(page.meta_pixel_id, page)}</Script>}
      <header className="border-b border-white/10 bg-[#071126]/90 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Image src="/logo-white.png" alt="Authentic Gadget" width={42} height={42} className="h-10 w-10 object-contain" />
          <div><p className="font-bold">Authentic Gadget</p><p className="text-xs text-white/45">Authentic products. Delivered across Ghana.</p></div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-12 sm:py-20">
          <div className="absolute inset-0 opacity-25" style={{ background: `radial-gradient(circle at 20% 10%, ${accent}, transparent 42%)` }} />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: accent }}>Limited offer</span>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">{page.config.headline}</h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">{page.config.subheadline}</p>
              <p className="mt-4 max-w-xl whitespace-pre-line text-sm leading-7 text-white/55">{page.config.description}</p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button onClick={scrollToForm} className="rounded-full px-7 py-3.5 text-sm font-black text-[#041020] shadow-xl transition hover:-translate-y-0.5" style={{ background: accent }}>{page.config.ctaLabel}</button>
                <div><p className="text-2xl font-black">{formatPrice(product.price)}</p>{product.compare_at_price && product.compare_at_price > product.price ? <p className="text-sm text-white/35 line-through">{formatPrice(product.compare_at_price)}</p> : null}</div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-xs text-white/55"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" style={{ color: accent }} /> Authentic product</span><span className="flex items-center gap-1.5"><Truck className="h-4 w-4" style={{ color: accent }} /> Ghana delivery</span></div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl">
              <Image src={image} alt={product.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
          {page.config.benefits.map((benefit, index) => <article key={`${benefit.title}-${index}`} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5"><Check className="mb-4 h-6 w-6" style={{ color: accent }} /><h2 className="font-bold">{benefit.title}</h2><p className="mt-2 text-sm leading-6 text-white/55">{benefit.description}</p></article>)}
        </section>

        {page.config.testimonials.length > 0 && <section className="mx-auto max-w-6xl px-4 py-10"><h2 className="mb-6 text-center text-3xl font-black">What customers say</h2><div className="grid gap-4 md:grid-cols-3">{page.config.testimonials.map((item, index) => <blockquote key={`${item.name}-${index}`} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5"><div className="mb-3 flex gap-1">{[0,1,2,3,4].map((star) => <Star key={star} className="h-4 w-4 fill-current" style={{ color: accent }} />)}</div><p className="text-sm leading-6 text-white/70">&quot;{item.quote}&quot;</p><footer className="mt-4 text-xs font-bold" style={{ color: accent }}>{item.name}</footer></blockquote>)}</div></section>}

        <section id="sales-order-form" className="scroll-mt-6 px-4 py-12">
          <div className="mx-auto grid max-w-5xl gap-8 rounded-[32px] border border-white/10 bg-[#0a1530] p-5 shadow-2xl sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div><span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>Secure order form</span><h2 className="mt-3 text-3xl font-black">{formConfig.heading}</h2><p className="mt-3 text-sm leading-6 text-white/55">{formConfig.subheading}</p><div className="mt-6 rounded-2xl bg-white/5 p-4"><p className="font-bold">{product.name}</p><p className="mt-1 text-2xl font-black" style={{ color: accent }}>{formatPrice(product.price * quantity)}</p></div></div>
            <form onSubmit={submit} className="space-y-4">
              <div><label className="mb-1.5 block text-xs font-bold text-white/60">Full name *</label><input className="sales-form-input" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Kwame Mensah" /></div>
              {formConfig.showPhone && <div><label className="mb-1.5 block text-xs font-bold text-white/60">Phone number *</label><input className="sales-form-input" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} placeholder="+233 53 455 3165" /></div>}
              {formConfig.showEmail && <div><label className="mb-1.5 block text-xs font-bold text-white/60">Email address *</label><input type="email" className="sales-form-input" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} placeholder="you@example.com" /></div>}
              {formConfig.showAddress && <div><label className="mb-1.5 block text-xs font-bold text-white/60">Delivery address *</label><textarea className="sales-form-input min-h-20 resize-y" value={form.address} onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))} placeholder="House number, street and area" /></div>}
              {formConfig.showQuantity && <div><label className="mb-1.5 block text-xs font-bold text-white/60">Quantity</label><div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3"><Minus className="h-4 w-4" /></button><span className="min-w-10 text-center font-bold">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="p-3"><Plus className="h-4 w-4" /></button></div></div>}
              <div><label className="mb-2 block text-xs font-bold text-white/60">Payment method</label><div className="grid gap-2 sm:grid-cols-2">{allowedPayments.map((method) => <button key={method} type="button" onClick={() => setPaymentMethod(method)} className="rounded-xl border px-4 py-3 text-left text-sm font-bold" style={{ borderColor: paymentMethod === method ? accent : "rgba(255,255,255,0.12)", background: paymentMethod === method ? `${accent}18` : "rgba(255,255,255,0.03)" }}>{method === "cod" ? "Payment on delivery" : "Bank transfer"}</button>)}</div></div>
              <div><label className="mb-1.5 block text-xs font-bold text-white/60">Order note (optional)</label><textarea className="sales-form-input min-h-20 resize-y" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} placeholder="Colour, delivery landmark, or other instruction" /></div>
              {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
              <button disabled={submitting || product.stock < quantity} className="w-full rounded-xl px-5 py-4 text-sm font-black text-[#041020] disabled:opacity-50" style={{ background: accent }}>{submitting ? "Placing order..." : product.stock < quantity ? "Insufficient stock" : formConfig.submitLabel}</button>
              <p className="text-center text-[11px] text-white/35">Your total is calculated securely from the live product price.</p>
            </form>
          </div>
        </section>

        {page.config.faqs.length > 0 && <section className="mx-auto max-w-3xl px-4 py-12"><h2 className="mb-6 text-center text-3xl font-black">Frequently asked questions</h2><div className="space-y-3">{page.config.faqs.map((faq, index) => <details key={`${faq.question}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><summary className="cursor-pointer font-bold">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-white/55">{faq.answer}</p></details>)}</div></section>}
      </main>
      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-white/35">&copy; {new Date().getFullYear()} Authentic Gadget. All rights reserved.</footer>
    </div>
  );
}

"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Box,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Headphones,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UserRound,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-pixel";
import type { SalesPage, SalesPaymentMethod } from "@/types/sales-page";

function pixelScript(pixelId: string) {
  return `
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init','${pixelId}');
  `;
}

const GHANA_REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East",
  "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North",
];

export default function SalesPageView({ page, conversionEvent = "" }: { page: SalesPage; conversionEvent?: string }) {
  const router = useRouter();
  const product = page.product!;
  const formConfig = page.config.form;
  const productImages = useMemo(
    () => [...new Set([page.config.heroImageUrl, ...(product.images || [])].filter(Boolean))],
    [page.config.heroImageUrl, product.images]
  );
  const images = productImages.length ? productImages : ["/logo-mark.png"];
  const allowedPayments = useMemo<SalesPaymentMethod[]>(() => {
    const methods: SalesPaymentMethod[] = [];
    if (formConfig.allowCod) methods.push("cod");
    if (formConfig.allowBankTransfer) methods.push("bank_transfer");
    return methods.length ? methods : ["cod"];
  }, [formConfig.allowCod, formConfig.allowBankTransfer]);
  const [activeImage, setActiveImage] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", address: "", city: "", region: "", notes: "" });
  const [quantity, setQuantity] = useState(() => formConfig.packages[0]?.quantity || 1);
  const [paymentMethod, setPaymentMethod] = useState<SalesPaymentMethod>(
    allowedPayments.includes(formConfig.defaultPaymentMethod) ? formConfig.defaultPaymentMethod : allowedPayments[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const accent = page.config.accentColor;
  const total = product.price * quantity;
  const savings = product.compare_at_price && product.compare_at_price > product.price
    ? (product.compare_at_price - product.price) * quantity
    : 0;
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "GHS",
    });
  }, [product.id, product.name, product.price]);

  function scrollToForm() {
    document.getElementById("sales-order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    trackMetaEvent("InitiateCheckout", { content_ids: [product.id], value: total, currency: "GHS" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your full name.");
    if (formConfig.showEmail && !/^\S+@\S+\.\S+$/.test(form.email)) return setError("Please enter a valid email address.");
    if (formConfig.showPhone && !form.phone.trim()) return setError("Please enter your phone number.");
    if (formConfig.showRegion && !form.region.trim()) return setError("Please choose your delivery region.");
    if (formConfig.showCity && !form.city.trim()) return setError("Please enter your city or town.");
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
          shipping_city: form.city.trim() || "To be confirmed",
          shipping_region: form.region.trim() || "To be confirmed",
          order_note: [
            `Sales page: ${page.name} (${page.slug}).`,
            form.whatsapp.trim() ? `WhatsApp: ${form.whatsapp.trim()}.` : "",
            form.notes.trim(),
          ].filter(Boolean).join(" "),
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

  const trustItems = [
    { icon: BadgeCheck, title: "Authentic", text: "Quality checked" },
    { icon: Truck, title: "Fast delivery", text: "Across Ghana" },
    { icon: ShieldCheck, title: "Protected", text: "Secure ordering" },
    { icon: Headphones, title: "Support", text: "Help when needed" },
  ];

  return (
    <div className="sales-page-shell min-h-screen overflow-x-hidden bg-[#030817] pb-24 text-white lg:pb-0" style={{ "--sales-accent": accent } as React.CSSProperties}>
      {page.meta_pixel_id && <Script id={`sales-page-pixel-${page.id}`} strategy="afterInteractive">{pixelScript(page.meta_pixel_id)}</Script>}

      <div className="relative z-20 flex min-h-9 items-center justify-center gap-2 bg-gradient-to-r from-[#c9982e] via-[#f0cb65] to-[#20b9f6] px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.13em] text-[#061126] sm:text-xs">
        <Zap className="h-3.5 w-3.5 fill-current" /> {page.config.urgencyText}
      </div>

      <header className="relative z-20 border-b border-white/8 bg-[#061127]/88 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo-white.png" alt="Authentic Gadget" width={44} height={44} className="h-11 w-11 object-contain" priority />
            <div><p className="text-sm font-black sm:text-base">Authentic Gadget</p><p className="text-[10px] text-white/45 sm:text-xs">Original gadgets. Delivered across Ghana.</p></div>
          </div>
          <button onClick={scrollToForm} className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black transition hover:bg-white/10 sm:inline-flex">
            Order securely <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-14 pt-9 sm:pb-20 sm:pt-14">
          <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 14% 10%, ${accent}28, transparent 32%), radial-gradient(circle at 90% 30%, #19afff20, transparent 32%)` }} />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
            <div className="lg:order-2">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: accent }}><Sparkles className="h-3.5 w-3.5" /> Premium offer</span>
                {discount > 0 && <span className="rounded-full bg-emerald-400/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">Save {discount}% today</span>}
              </div>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl">{page.config.headline}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/68 sm:text-lg">{page.config.subheadline}</p>

              {page.config.badges.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {page.config.badges.map((badge) => (
                    <span key={badge} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10px] font-bold text-white/65">
                      <Check className="h-3.5 w-3.5" style={{ color: accent }} strokeWidth={3} /> {badge}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-0.5">{[0, 1, 2, 3, 4].map((item) => <Star key={item} className="h-4 w-4 fill-current" style={{ color: accent }} />)}</div>
                <span className="text-xs font-bold text-white/70">4.9 customer rating</span>
                <span className="h-1 w-1 rounded-full bg-white/25" />
                <span className="text-xs text-white/45">{page.config.socialProofText}</span>
              </div>

              <div className="mt-7 rounded-[24px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-sm">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Today&apos;s price</p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-3"><span className="text-3xl font-black sm:text-4xl" style={{ color: accent }}>{formatPrice(product.price)}</span>{product.compare_at_price && product.compare_at_price > product.price ? <span className="text-base text-white/35 line-through">{formatPrice(product.compare_at_price)}</span> : null}</div>
                    {savings > 0 && <p className="mt-1 text-xs font-bold text-emerald-300">You save {formatPrice(savings)}</p>}
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> {product.stock} in stock</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={scrollToForm} className="group inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl px-7 text-sm font-black text-[#041020] shadow-[0_18px_50px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5" style={{ background: `linear-gradient(120deg, ${accent}, #28baf6)` }}>{page.config.ctaLabel}<ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" /></button>
                <div className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-xs font-bold text-white/60"><LockKeyhole className="h-4 w-4" style={{ color: accent }} /> No online card required</div>
              </div>
            </div>

            <div className="lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[40px] opacity-30 blur-3xl" style={{ background: `linear-gradient(135deg, ${accent}, #19afff)` }} />
                <div className="relative aspect-square overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.025] p-3 shadow-2xl">
                  <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-[#f3f0e8]">
                    <Image src={images[activeImage]} alt={product.name} fill className="object-contain p-4 transition duration-700 hover:scale-[1.04]" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                    {discount > 0 && <div className="absolute left-4 top-4 rounded-full bg-[#061127] px-3 py-2 text-xs font-black text-white shadow-xl">-{discount}% OFF</div>}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/50 bg-white/85 px-4 py-3 text-[#061127] shadow-xl backdrop-blur-md"><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#061127]/45">Featured product</p><p className="mt-0.5 max-w-[230px] truncate text-sm font-black">{product.name}</p></div><BadgeCheck className="h-6 w-6 shrink-0 text-emerald-600" /></div>
                  </div>
                </div>
              </div>
              {images.length > 1 && <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1">{images.slice(0, 5).map((source, index) => <button key={source} onClick={() => setActiveImage(index)} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f3f0e8] transition" style={{ borderColor: activeImage === index ? accent : "rgba(255,255,255,0.1)" }} aria-label={`View product image ${index + 1}`}><Image src={source} alt="" fill className="object-contain p-1.5" sizes="64px" /></button>)}</div>}
            </div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-[#071329] px-4 py-5">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">{trustItems.map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.055]"><Icon className="h-5 w-5" style={{ color: accent }} /></span><div><p className="text-xs font-black sm:text-sm">{title}</p><p className="mt-0.5 text-[10px] text-white/38 sm:text-xs">{text}</p></div></div>)}</div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center"><span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>Why this offer stands out</span><h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">Everything you need, without the uncertainty</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/50">{page.config.description}</p></div>
          <div className="grid gap-4 md:grid-cols-3">{page.config.benefits.map((benefit, index) => <article key={`${benefit.title}-${index}`} className="group rounded-[24px] border border-white/8 bg-gradient-to-b from-white/[0.065] to-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-white/15"><div className="flex h-11 w-11 items-center justify-center rounded-2xl text-[#061127]" style={{ background: accent }}><Check className="h-5 w-5" strokeWidth={3} /></div><h3 className="mt-5 text-lg font-black">{benefit.title}</h3><p className="mt-2 text-sm leading-6 text-white/48">{benefit.description}</p></article>)}</div>
        </section>

        {page.config.featureBlocks.length > 0 && (
          <section className="border-y border-white/8 bg-[#071329] px-4 py-16 sm:py-24">
            <div className="mx-auto max-w-6xl space-y-8 sm:space-y-12">
              <div className="mx-auto max-w-2xl text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>Built for the way you live</span>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">More than specifications. A better everyday experience.</h2>
              </div>
              {page.config.featureBlocks.map((feature, index) => {
                const featureImage = feature.imageUrl || images[(index + 1) % images.length];
                return (
                  <article key={`${feature.title}-${index}`} className="grid overflow-hidden rounded-[30px] border border-white/8 bg-white/[0.035] lg:grid-cols-2">
                    <div className={`relative min-h-[280px] bg-[#f3f0e8] sm:min-h-[380px] ${index % 2 ? "lg:order-2" : ""}`}>
                      <Image src={featureImage} alt={feature.title} fill className="object-contain p-6 sm:p-10" sizes="(max-width: 1024px) 100vw, 50vw" unoptimized />
                    </div>
                    <div className="flex items-center p-7 sm:p-10 lg:p-14">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>Feature {String(index + 1).padStart(2, "0")}</span>
                        <h3 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">{feature.title}</h3>
                        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-white/55 sm:text-base">{feature.description}</p>
                        <button onClick={scrollToForm} className="mt-7 inline-flex items-center gap-2 text-sm font-black" style={{ color: accent }}>Order this product <ChevronRight className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mb-10 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>Simple from start to finish</span>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">How to place your order</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {page.config.howItWorks.map((step, index) => (
              <article key={`${step.title}-${index}`} className="relative overflow-hidden rounded-[24px] border border-white/8 bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-6">
                <span className="absolute right-4 top-2 text-6xl font-black text-white/[0.035]">{index + 1}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-[#061127]" style={{ background: accent }}>{index + 1}</span>
                <h3 className="mt-5 text-lg font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/48">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/8 bg-[#071329] px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto mb-9 max-w-2xl text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>Buy with clarity</span>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">{page.config.comparisonTitle}</h2>
            </div>
            <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#030817] shadow-2xl">
              <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] border-b border-white/8 bg-white/[0.045] text-[10px] font-black uppercase tracking-[0.12em] sm:text-xs">
                <div className="p-4 sm:p-5">What matters</div>
                <div className="border-l border-white/8 p-4 sm:p-5" style={{ color: accent }}>Authentic Gadget</div>
                <div className="border-l border-white/8 p-4 text-white/38 sm:p-5">Typical seller</div>
              </div>
              {page.config.comparisonRows.map((row, index) => (
                <div key={`${row.label}-${index}`} className="grid grid-cols-[1.2fr_0.9fr_0.9fr] border-b border-white/8 text-xs last:border-b-0 sm:text-sm">
                  <div className="p-4 font-bold sm:p-5">{row.label}</div>
                  <div className="flex items-center gap-2 border-l border-white/8 bg-emerald-400/[0.055] p-4 font-bold text-emerald-200 sm:p-5"><Check className="hidden h-4 w-4 shrink-0 sm:block" /> {row.authentic}</div>
                  <div className="border-l border-white/8 p-4 text-white/42 sm:p-5">{row.alternative}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:py-20 lg:grid-cols-2">
          {page.config.includedItems.length > 0 && (
            <article className="rounded-[28px] border border-white/8 bg-white/[0.045] p-7 sm:p-9">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.065]"><Box className="h-6 w-6" style={{ color: accent }} /></span>
              <h2 className="mt-6 text-2xl font-black sm:text-3xl">What&apos;s included</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {page.config.includedItems.map((item) => <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/[0.035] p-4 text-sm text-white/65"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} strokeWidth={3} /> {item}</div>)}
              </div>
            </article>
          )}
          <article className={`relative overflow-hidden rounded-[28px] border p-7 sm:p-9 ${page.config.includedItems.length ? "" : "lg:col-span-2"}`} style={{ borderColor: `${accent}55`, background: `linear-gradient(135deg, ${accent}20, #19afff10)` }}>
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-20 blur-3xl" style={{ background: accent }} />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-[#061127]" style={{ background: accent }}><ShieldCheck className="h-6 w-6" /></span>
            <h2 className="relative mt-6 text-2xl font-black sm:text-3xl">{page.config.guaranteeTitle}</h2>
            <p className="relative mt-4 max-w-xl text-sm leading-7 text-white/58">{page.config.guaranteeText}</p>
            <button onClick={scrollToForm} className="relative mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-[#041020]" style={{ background: `linear-gradient(120deg, ${accent}, #28baf6)` }}>Order with confidence <ChevronRight className="h-4 w-4" /></button>
          </article>
        </section>

        <section id="sales-order-form" className="scroll-mt-4 border-y border-white/8 bg-[#071329] px-4 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
            <div className="lg:sticky lg:top-8 lg:self-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>Complete your order</span>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">A simple order form. No unnecessary steps.</h2>
              <p className="mt-4 text-sm leading-7 text-white/50">{formConfig.subheading}</p>
              <div className="mt-7 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045]">
                <div className="flex items-center gap-4 p-4"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f3f0e8]"><Image src={images[0]} alt={product.name} fill className="object-contain p-2" sizes="80px" /></div><div className="min-w-0"><p className="line-clamp-2 text-sm font-black">{product.name}</p><p className="mt-1 text-xl font-black" style={{ color: accent }}>{formatPrice(total)}</p><p className="mt-1 text-[10px] text-white/38">Quantity: {quantity}</p></div></div>
                <div className="grid grid-cols-2 border-t border-white/8 text-xs"><div className="flex items-center gap-2 border-r border-white/8 p-4 text-white/55"><PackageCheck className="h-4 w-4" style={{ color: accent }} /> Quality checked</div><div className="flex items-center gap-2 p-4 text-white/55"><Clock3 className="h-4 w-4" style={{ color: accent }} /> Quick confirmation</div></div>
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.07] p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /><div><p className="text-sm font-black text-emerald-100">Authentic Gadget assurance</p><p className="mt-1 text-xs leading-5 text-emerald-100/55">Your order is reviewed before dispatch and our team can contact you to confirm delivery details.</p></div></div>
            </div>

            <form onSubmit={submit} className="overflow-hidden rounded-[30px] border border-white/70 bg-[#f5f1e8] text-[#071126] shadow-[0_30px_90px_rgba(0,0,0,0.32)]">
              <div className="bg-[#071126] px-5 py-6 text-white sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: accent }}>Complete your order</p><h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">{formConfig.heading}</h3><p className="mt-2 max-w-lg text-xs leading-5 text-white/60">{formConfig.subheading}</p></div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-white"><LockKeyhole className="h-5 w-5" /></span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-[9px] font-bold uppercase tracking-[0.08em] text-white/55 sm:text-[10px]">
                  {["Your details", "Delivery", "Confirm"].map((step, index) => <div key={step} className="flex items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-[#071126]" style={{ background: index === 0 ? accent : "rgba(255,255,255,0.14)", color: index === 0 ? "#071126" : "rgba(255,255,255,0.72)" }}>{index + 1}</span><span className="hidden sm:inline">{step}</span></div>)}
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-700/15 bg-emerald-50 p-4 text-emerald-950">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <p className="text-xs font-semibold leading-5">{formConfig.assuranceText}</p>
                </div>

                <fieldset className="mt-7">
                  <legend className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.08em]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071126] text-white"><UserRound className="h-4 w-4" /></span> Contact information</legend>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><label className="sales-form-label">Full name *</label><input className="sales-form-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={formConfig.namePlaceholder} autoComplete="name" /></div>
                    {formConfig.showPhone && <div><label className="sales-form-label">Phone number *</label><input className="sales-form-input" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder={formConfig.phonePlaceholder} autoComplete="tel" inputMode="tel" /></div>}
                    {formConfig.showEmail && <div><label className="sales-form-label">Email address *</label><input type="email" className="sales-form-input" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder={formConfig.emailPlaceholder} autoComplete="email" /></div>}
                    {formConfig.showWhatsApp && <div className="sm:col-span-2"><label className="sales-form-label">WhatsApp number (optional)</label><div className="relative"><MessageCircle className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#071126]/35" /><input className="sales-form-input pl-11" value={form.whatsapp} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} placeholder={formConfig.whatsappPlaceholder} inputMode="tel" /></div></div>}
                  </div>
                </fieldset>

                {(formConfig.showRegion || formConfig.showCity || formConfig.showAddress) && <fieldset className="mt-8 border-t border-[#071126]/10 pt-7">
                  <legend className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.08em]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071126] text-white"><MapPin className="h-4 w-4" /></span> Delivery details</legend>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {formConfig.showRegion && <div><label className="sales-form-label">Region *</label><select className="sales-form-input" value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}><option value="">Choose your region</option>{GHANA_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}</select></div>}
                    {formConfig.showCity && <div><label className="sales-form-label">City / town *</label><input className="sales-form-input" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder={formConfig.cityPlaceholder} autoComplete="address-level2" /></div>}
                    {formConfig.showAddress && <div className="sm:col-span-2"><label className="sales-form-label">Delivery address *</label><textarea className="sales-form-input min-h-24 resize-y" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder={formConfig.addressPlaceholder} autoComplete="street-address" /></div>}
                  </div>
                </fieldset>}

                {formConfig.showQuantity && <fieldset className="mt-8 border-t border-[#071126]/10 pt-7">
                  <legend className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.08em]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071126] text-white"><ShoppingBag className="h-4 w-4" /></span> Choose your package</legend>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {formConfig.packages.map((option) => {
                      const selected = quantity === option.quantity;
                      return <button key={`${option.label}-${option.quantity}`} type="button" onClick={() => setQuantity(option.quantity)} className="relative rounded-2xl border-2 bg-white p-4 text-left transition hover:-translate-y-0.5" style={{ borderColor: selected ? accent : "rgba(7,17,38,0.10)", boxShadow: selected ? `0 10px 28px ${accent}24` : "none" }}>
                        {option.badge && <span className="inline-flex rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#071126]" style={{ background: selected ? accent : "#eef1f5" }}>{option.badge}</span>}
                        <span className="mt-3 block text-sm font-black">{option.label}</span>
                        <span className="mt-1 block text-lg font-black" style={{ color: selected ? "#8b650d" : "#071126" }}>{formatPrice(product.price * option.quantity)}</span>
                        {option.description && <span className="mt-1 block text-[10px] leading-4 text-[#071126]/45">{option.description}</span>}
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border" style={{ borderColor: selected ? accent : "rgba(7,17,38,0.18)", background: selected ? accent : "white" }}>{selected && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                      </button>;
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-3 text-xs text-[#071126]/55"><span>Custom quantity</span><div className="flex h-10 items-center rounded-xl border border-[#071126]/10 bg-white px-1"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#071126]/5" aria-label="Reduce quantity"><Minus className="h-3.5 w-3.5" /></button><span className="w-7 text-center font-black text-[#071126]">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#071126]/5" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button></div></div>
                </fieldset>}

                <fieldset className="mt-8 border-t border-[#071126]/10 pt-7">
                  <legend className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.08em]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071126] text-white"><CreditCard className="h-4 w-4" /></span> Payment method</legend>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">{allowedPayments.map((method) => {
                    const selected = paymentMethod === method;
                    return <button key={method} type="button" onClick={() => setPaymentMethod(method)} className="relative min-h-20 rounded-2xl border-2 bg-white px-4 py-3 text-left transition" style={{ borderColor: selected ? accent : "rgba(7,17,38,0.10)" }}><span className="block text-sm font-black">{method === "cod" ? "Payment on delivery" : "Bank transfer"}</span><span className="mt-1 block text-[10px] leading-4 text-[#071126]/48">{method === "cod" ? "Pay when your order arrives" : "Transfer details appear after ordering"}</span><span className="absolute right-3 top-3 h-4 w-4 rounded-full border-4 border-white" style={{ background: selected ? accent : "#d8dde5", boxShadow: "0 0 0 1px rgba(7,17,38,0.15)" }} /></button>;
                  })}</div>
                </fieldset>

                {formConfig.showNotes && <div className="mt-7"><label className="sales-form-label">Order note (optional)</label><textarea className="sales-form-input min-h-20 resize-y" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Preferred colour, delivery landmark, or other instruction" /></div>}
                {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

                <div className="mt-7 rounded-2xl bg-[#071126] p-5 text-white"><div className="flex items-center justify-between gap-4"><div><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Order total</span><span className="mt-1 block text-xs text-white/55">{quantity} {quantity === 1 ? "unit" : "units"}</span></div><strong className="text-2xl sm:text-3xl" style={{ color: accent }}>{formatPrice(total)}</strong></div>{savings > 0 && <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3 text-xs"><span className="text-white/45">Your savings</span><span className="font-bold text-emerald-300">{formatPrice(savings)}</span></div>}</div>
                <button disabled={submitting || product.stock < quantity} className="mt-4 flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-black text-[#041020] shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50" style={{ background: `linear-gradient(120deg, ${accent}, #28baf6)` }}>{submitting ? "Placing order..." : product.stock < quantity ? "Insufficient stock" : formConfig.submitLabel}<ChevronRight className="h-5 w-5" /></button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-[#071126]/42"><LockKeyhole className="h-3 w-3" /> Live pricing is verified securely before your order is created.</p>
              </div>
            </form>
          </div>
        </section>

        {page.config.testimonials.length > 0 && <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20"><div className="mb-9 text-center"><span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>Real customer feedback</span><h2 className="mt-3 text-3xl font-black sm:text-4xl">Why customers choose us</h2></div><div className="grid gap-4 md:grid-cols-3">{page.config.testimonials.map((item, index) => <blockquote key={`${item.name}-${index}`} className="rounded-[24px] border border-white/8 bg-white/[0.045] p-6"><div className="mb-4 flex gap-1">{[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-4 w-4 fill-current" style={{ color: accent }} />)}</div><p className="text-sm leading-7 text-white/68">&quot;{item.quote}&quot;</p><footer className="mt-5 flex items-center gap-2 text-xs font-black"><span className="flex h-7 w-7 items-center justify-center rounded-full text-[#061127]" style={{ background: accent }}>{item.name.charAt(0).toUpperCase()}</span>{item.name}<BadgeCheck className="h-4 w-4 text-emerald-300" /></footer></blockquote>)}</div></section>}

        {page.config.faqs.length > 0 && <section className="border-t border-white/8 px-4 py-16 sm:py-20"><div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.7fr_1.3fr]"><div><span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>Need to know</span><h2 className="mt-3 text-3xl font-black">Frequently asked questions</h2><p className="mt-3 text-sm leading-6 text-white/45">Clear answers before you place your order.</p></div><div className="space-y-3">{page.config.faqs.map((faq, index) => <details key={`${faq.question}-${index}`} className="group rounded-2xl border border-white/8 bg-white/[0.04] p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">{faq.question}<Plus className="h-4 w-4 shrink-0 transition group-open:rotate-45" style={{ color: accent }} /></summary><p className="mt-4 border-t border-white/8 pt-4 text-sm leading-7 text-white/50">{faq.answer}</p></details>)}</div></div></section>}

        <section className="px-4 pb-16 sm:pb-24">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#122544] to-[#061127] px-6 py-12 text-center shadow-2xl sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute inset-0 opacity-50" style={{ background: `radial-gradient(circle at 15% 15%, ${accent}55, transparent 28%), radial-gradient(circle at 90% 100%, #20b9f644, transparent 30%)` }} />
            <div className="relative mx-auto max-w-3xl">
              <div className="flex justify-center gap-1">{[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-4 w-4 fill-current" style={{ color: accent }} />)}</div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-5xl">Ready to make {product.name} yours?</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55">{page.config.urgencyText}. Complete the short order form and our team will handle the next step.</p>
              <button onClick={scrollToForm} className="mt-7 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-8 text-sm font-black text-[#041020] shadow-xl transition hover:-translate-y-0.5" style={{ background: `linear-gradient(120deg, ${accent}, #28baf6)` }}>{page.config.ctaLabel}<ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/8 bg-[#020612] px-4 py-10"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left"><div className="flex items-center gap-3"><Image src="/logo-white.png" alt="Authentic Gadget" width={36} height={36} className="h-9 w-9 object-contain" /><div><p className="text-sm font-black">Authentic Gadget</p><p className="text-[10px] text-white/35">Authentic products. Reliable service.</p></div></div><div className="flex items-center gap-5 text-[10px] font-bold text-white/38"><span className="flex items-center gap-1.5"><Box className="h-3.5 w-3.5" /> Ghana delivery</span><span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure ordering</span></div><p className="text-[10px] text-white/30">&copy; {new Date().getFullYear()} Authentic Gadget</p></div></footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#061127]/96 p-3 backdrop-blur-xl lg:hidden"><div className="mx-auto flex max-w-xl items-center gap-3"><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">Order total</p><p className="truncate text-lg font-black" style={{ color: accent }}>{formatPrice(total)}</p></div><button onClick={scrollToForm} className="ml-auto flex min-h-12 flex-1 items-center justify-center gap-1 rounded-xl px-4 text-sm font-black text-[#041020]" style={{ background: `linear-gradient(120deg, ${accent}, #28baf6)` }}>{page.config.ctaLabel}<ChevronRight className="h-4 w-4" /></button></div></div>
    </div>
  );
}

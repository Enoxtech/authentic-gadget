"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, ShieldCheck, Truck, RotateCcw } from "lucide-react";

const SUPPORT_CARDS = [
  {
    icon: ShieldCheck,
    title: "Authenticity guarantee",
    body: "Every device is checked before dispatch. If a product fails authenticity checks, we replace it or refund you.",
  },
  {
    icon: Truck,
    title: "Delivery support",
    body: "Same-day dispatch is available in Accra when stock and courier capacity allow it. Other Ghana deliveries are confirmed by support.",
  },
  {
    icon: RotateCcw,
    title: "Returns window",
    body: "Return requests are accepted within 14 days when the item is unused, complete, and verified by the support team.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to send message");
      setStatus("sent");
      setNotice("Message received. Support will reply using the email you provided.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
      setNotice(error instanceof Error ? error.message : "Unable to send message right now.");
    }
  }

  return (
    <main className="min-h-screen bg-[#040820] px-4 py-12 text-fog">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/[0.08] bg-[#06112B] p-6 shadow-layers sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Support</p>
              <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
                Need help with an order or product?
              </h1>
              <p className="mt-4 text-sm leading-7 text-fog-muted">
                Send a message with your order ID, product name, or delivery question.
                The support record is saved so the team can follow up properly.
              </p>

              <div className="mt-8 space-y-4 text-sm text-fog-muted">
                <p className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gold" />
                  +233 24 123 4567
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gold" />
                  hello@authenticgadget.com
                </p>
                <p className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gold" />
                  Accra, Ghana
                </p>
              </div>

              <Link
                href="/track-order"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-bold text-fog transition hover:bg-white/[0.08]"
              >
                <MessageCircle className="h-4 w-4" />
                Track an existing order
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-fog">
                  Full name
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-fog outline-none focus:border-gold/50"
                    placeholder="Your name"
                  />
                </label>
                <label className="text-sm font-medium text-fog">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-fog outline-none focus:border-gold/50"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-fog">
                  Phone
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-fog outline-none focus:border-gold/50"
                    placeholder="+233 000 000 000"
                  />
                </label>
                <label className="text-sm font-medium text-fog">
                  Subject
                  <input
                    value={form.subject}
                    onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-fog outline-none focus:border-gold/50"
                    placeholder="Order, warranty, delivery..."
                  />
                </label>
              </div>

              <label className="mt-4 block text-sm font-medium text-fog">
                Message
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  rows={6}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-fog outline-none focus:border-gold/50"
                  placeholder="Tell us what you need help with..."
                />
              </label>

              {notice && (
                <p className={`mt-4 text-sm ${status === "error" ? "text-red-300" : "text-green-300"}`}>
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-6 w-full rounded-2xl bg-gold px-5 py-4 text-sm font-bold text-[#030618] transition hover:bg-gold-dark disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Send message"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SUPPORT_CARDS.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-3xl border border-white/[0.08] bg-[#06112B] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-bold text-fog">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-fog-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

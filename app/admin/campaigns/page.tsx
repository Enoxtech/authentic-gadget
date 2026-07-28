"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Send, Mail, MessageCircle } from "lucide-react";

interface Campaign {
  id: string;
  type: "whatsapp" | "email";
  audience: "customers" | "newsletter_subscribers";
  subject: string | null;
  message: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  status: string;
  created_at: string;
}

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm bg-fog text-charcoal border-0 focus:outline-none focus:ring-2 focus:ring-electric/30";

const STATUS_BADGE: Record<string, string> = {
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
  sending: "bg-amber-100 text-amber-700",
};

export default function CampaignsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    type: "email" as "email" | "whatsapp",
    audience: "customers" as "customers" | "newsletter_subscribers",
    subject: "",
    message: "",
  });

  function load() {
    fetch("/api/admin/campaigns").then((r) => (r.ok ? r.json() : [])).then(setCampaigns).catch(() => setCampaigns([]));
  }

  useEffect(() => {
    if (!document.cookie.includes("admin_session_client")) {
      router.push("/admin/login");
      return;
    }
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!me || !["super_admin", "product_manager"].includes(me.role)) {
          setAuthorized(false);
          router.replace("/admin/dashboard");
          return;
        }
        setAuthorized(true);
        load();
      });
  }, [router]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.message.trim()) { setError("Message is required"); return; }
    if (form.type === "email" && !form.subject.trim()) { setError("Subject is required for email campaigns"); return; }

    setSending(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send campaign");
      setSuccess(`Sent to ${data.sent_count} of ${data.recipient_count} recipients${data.failed_count ? ` (${data.failed_count} failed)` : ""}.`);
      setForm((f) => ({ ...f, subject: "", message: "" }));
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send campaign");
    } finally {
      setSending(false);
    }
  }

  if (authorized !== true) {
    return <div className="p-8 text-sm text-charcoal/50">{authorized === false ? "Redirecting…" : "Loading…"}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Megaphone className="h-5 w-5 text-electric" />
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Campaigns</h1>
          <p className="text-sm text-charcoal/50">Broadcast a message to your customers via WhatsApp or email</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="bg-white rounded-[28px] card-premium border border-[var(--border-color)] p-5 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 rounded-xl p-3">{success}</p>}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Channel</label>
            <div className="flex gap-2">
              {(["email", "whatsapp"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    form.type === t ? "bg-electric text-white" : "bg-fog text-charcoal/60"
                  }`}
                >
                  {t === "email" ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                  {t === "email" ? "Email" : "WhatsApp"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Audience</label>
            <select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as typeof f.audience }))} className={inputCls}>
              <option value="customers">All Customers</option>
              <option value="newsletter_subscribers">Newsletter Subscribers</option>
            </select>
          </div>
        </div>

        {form.type === "email" && (
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Subject</label>
            <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="🎉 Weekend deal! 10% off all smartphones" className={inputCls} />
          </div>
        )}

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            rows={4}
            placeholder="Write your campaign message..."
            className={inputCls}
          />
          {form.type === "whatsapp" && (
            <p className="text-[10px] text-charcoal/40 mt-1.5">
              Requires WhatsApp Notifications (Cloud API) to be configured in Settings. Messages may fail to recipients outside an open conversation window per WhatsApp&apos;s policy.
            </p>
          )}
          {form.type === "email" && (
            <p className="text-[10px] text-charcoal/40 mt-1.5">Requires a Resend API key configured in Settings → Email Notifications.</p>
          )}
        </div>

        <button type="submit" disabled={sending} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-electric disabled:opacity-50">
          <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send Campaign"}
        </button>
      </form>

      <div>
        <h2 className="text-sm font-bold text-charcoal/60 uppercase tracking-wide mb-3">History</h2>
        <div className="space-y-3">
          {campaigns === null ? (
            <p className="text-sm text-charcoal/50">Loading…</p>
          ) : campaigns.length === 0 ? (
            <div className="bg-white rounded-[28px] p-12 text-center card-premium border border-[var(--border-color)]">
              <Megaphone className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
              <p className="text-charcoal/50">No campaigns sent yet</p>
            </div>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="bg-white rounded-[20px] card-premium border border-[var(--border-color)] p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-fog flex items-center justify-center shrink-0">
                    {c.type === "email" ? <Mail className="h-4 w-4 text-charcoal/50" /> : <MessageCircle className="h-4 w-4 text-charcoal/50" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal truncate">{c.subject || c.message.slice(0, 60)}</p>
                    <p className="text-xs text-charcoal/40">
                      {c.audience === "customers" ? "All Customers" : "Newsletter Subscribers"} · {c.sent_count}/{c.recipient_count} sent
                      {c.failed_count > 0 ? ` · ${c.failed_count} failed` : ""} · {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[c.status] || "bg-fog text-charcoal/60"}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

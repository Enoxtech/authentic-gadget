"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, X, Trash2, Tag } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  min_order: number | null;
  active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
}

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm bg-fog text-charcoal border-0 focus:outline-none focus:ring-2 focus:ring-electric/30";

function valueLabel(c: Pick<Coupon, "type" | "value">): string {
  if (c.type === "percent") return `${c.value}% off`;
  if (c.type === "shipping") return "Free delivery";
  return `${formatPrice(c.value)} off`;
}

function CouponRow({ coupon, onUpdate, onDelete }: { coupon: Coupon; onUpdate: (id: string, updates: Partial<Coupon>) => void; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const expired = coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now();
  const limitReached = coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit;

  async function handleDelete() {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    setDeleting(true);
    try { await onDelete(coupon.id); } finally { setDeleting(false); }
  }

  return (
    <div className="bg-white rounded-[20px] card-premium border border-[var(--border-color)] overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="h-10 w-10 rounded-xl bg-fog flex items-center justify-center shrink-0">
          <Tag className="h-4 w-4 text-charcoal/50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-charcoal text-sm font-mono">{coupon.code}</p>
          <p className="text-xs text-charcoal/50">
            {valueLabel(coupon)}
            {coupon.min_order ? ` · min ${formatPrice(coupon.min_order)}` : ""}
            {coupon.usage_limit !== null ? ` · ${coupon.usage_count}/${coupon.usage_limit} used` : ` · ${coupon.usage_count} used`}
            {coupon.expires_at ? ` · expires ${formatDate(coupon.expires_at)}` : ""}
          </p>
          {(expired || limitReached) && (
            <p className="text-[10px] text-amber-600 uppercase mt-0.5">{expired ? "Expired" : "Usage limit reached"} — won&apos;t apply even if active</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1.5 text-xs text-charcoal/50 cursor-pointer">
            <input type="checkbox" checked={coupon.active} onChange={(e) => onUpdate(coupon.id, { active: e.target.checked })} className="accent-electric" />
            Active
          </label>
          <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded-lg text-charcoal/40 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { code: "", type: "percent" as Coupon["type"], value: 10, min_order: "", usage_limit: "", expires_at: "" };

function AddCouponForm({ onAdd, onClose }: { onAdd: (data: Record<string, unknown>) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!form.code.trim()) { setError("Code is required"); return; }
    setSaving(true);
    setError("");
    try {
      await onAdd({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.type === "shipping" ? 0 : Number(form.value),
        min_order: form.min_order ? Number(form.min_order) : undefined,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : undefined,
        expires_at: form.expires_at || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-[28px] card-premium border border-[var(--border-color)] p-5 space-y-3">
      {error && <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Code *</label>
          <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE15" className={`${inputCls} uppercase`} autoFocus />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Type</label>
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Coupon["type"] }))} className={inputCls}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off</option>
            <option value="shipping">Free delivery</option>
          </select>
        </div>
        {form.type !== "shipping" && (
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">
              Value {form.type === "percent" ? "(%)" : "(GHS)"}
            </label>
            <input type="number" min={0} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} className={inputCls} />
          </div>
        )}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Min Order (GHS, optional)</label>
          <input type="number" min={0} value={form.min_order} onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Usage Limit (optional)</label>
          <input type="number" min={0} value={form.usage_limit} onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))} placeholder="Unlimited" className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Expires (optional)</label>
          <input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-electric disabled:opacity-50">
          <Save className="h-3.5 w-3.5" /> {saving ? "Creating…" : "Create Coupon"}
        </button>
        <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-charcoal/60 hover:bg-fog">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [adding, setAdding] = useState(false);

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
        fetch("/api/admin/coupons").then((r) => (r.ok ? r.json() : [])).then(setCoupons).catch(() => setCoupons([]));
      });
  }, [router]);

  async function handleUpdate(id: string, updates: Partial<Coupon>) {
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    const updated = await res.json();
    setCoupons((prev) => (prev ? prev.map((c) => (c.id === id ? updated : c)) : prev));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setCoupons((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
  }

  async function handleAdd(data: Record<string, unknown>) {
    const res = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Failed to create coupon");
    setCoupons((prev) => (prev ? [body, ...prev] : [body]));
  }

  if (authorized !== true) {
    return <div className="p-8 text-sm text-charcoal/50">{authorized === false ? "Redirecting…" : "Loading…"}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Coupons</h1>
          <p className="text-sm text-charcoal/50">{coupons ? `${coupons.length} coupons` : "Loading…"}</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-electric hover:bg-electric/90 transition-colors shrink-0">
            <Plus className="h-4 w-4" /> Add Coupon
          </button>
        )}
      </div>

      {adding && <AddCouponForm onAdd={handleAdd} onClose={() => setAdding(false)} />}

      <div className="space-y-3">
        {coupons === null ? (
          <p className="text-sm text-charcoal/50">Loading…</p>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-[28px] p-12 text-center card-premium border border-[var(--border-color)]">
            <Tag className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
            <p className="text-charcoal/50">No coupons yet</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <CouponRow key={coupon.id} coupon={coupon} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}

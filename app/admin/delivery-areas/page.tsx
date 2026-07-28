"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, X, Trash2, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  estimated_days: string | null;
  enabled: boolean;
  position: number;
}

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm bg-fog text-charcoal border-0 focus:outline-none focus:ring-2 focus:ring-electric/30";

function AreaRow({ area, onUpdate, onDelete }: { area: DeliveryArea; onUpdate: (id: string, updates: Partial<DeliveryArea>) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(area);
  const [deleting, setDeleting] = useState(false);

  function save() {
    onUpdate(area.id, { name: draft.name, fee: draft.fee, estimated_days: draft.estimated_days });
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete delivery area "${area.name}"?`)) return;
    setDeleting(true);
    try { await onDelete(area.id); } finally { setDeleting(false); }
  }

  return (
    <div className="bg-white rounded-[20px] card-premium border border-[var(--border-color)] overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="h-10 w-10 rounded-xl bg-fog flex items-center justify-center shrink-0">
          <Truck className="h-4 w-4 text-charcoal/50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-charcoal text-sm">{area.name}</p>
          <p className="text-xs text-charcoal/50">{formatPrice(area.fee)}{area.estimated_days ? ` · ${area.estimated_days}` : ""}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1.5 text-xs text-charcoal/50 cursor-pointer">
            <input type="checkbox" checked={area.enabled} onChange={(e) => onUpdate(area.id, { enabled: e.target.checked })} className="accent-electric" />
            Enabled
          </label>
          <button onClick={() => setEditing(!editing)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal/60 hover:bg-fog hover:text-electric transition-colors">
            Edit
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded-lg text-charcoal/40 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {editing && (
        <div className="border-t border-fog p-4 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Name</label>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Fee (GHS)</label>
              <input type="number" min={0} value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Estimated Days</label>
              <input value={draft.estimated_days || ""} onChange={(e) => setDraft({ ...draft, estimated_days: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-electric">
              <Save className="h-3.5 w-3.5" /> Save
            </button>
            <button onClick={() => { setDraft(area); setEditing(false); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-charcoal/60 hover:bg-fog">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = { name: "", fee: 30, estimated_days: "2-3 business days" };

function AddAreaForm({ onAdd, onClose }: { onAdd: (data: typeof EMPTY_FORM) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!form.name.trim()) { setError("Area name is required"); return; }
    setSaving(true);
    setError("");
    try {
      await onAdd(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create delivery area.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-[28px] card-premium border border-[var(--border-color)] p-5 space-y-3">
      {error && <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">{error}</div>}
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Name *</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Accra Central" className={inputCls} autoFocus />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Fee (GHS)</label>
          <input type="number" min={0} value={form.fee} onChange={(e) => setForm((f) => ({ ...f, fee: Number(e.target.value) }))} className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Estimated Days</label>
          <input value={form.estimated_days} onChange={(e) => setForm((f) => ({ ...f, estimated_days: e.target.value }))} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-electric disabled:opacity-50">
          <Save className="h-3.5 w-3.5" /> {saving ? "Creating…" : "Create Area"}
        </button>
        <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-charcoal/60 hover:bg-fog">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminDeliveryAreasPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [areas, setAreas] = useState<DeliveryArea[] | null>(null);
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
        fetch("/api/admin/delivery-areas").then((r) => (r.ok ? r.json() : [])).then(setAreas).catch(() => setAreas([]));
      });
  }, [router]);

  async function handleUpdate(id: string, updates: Partial<DeliveryArea>) {
    const res = await fetch(`/api/admin/delivery-areas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    const updated = await res.json();
    setAreas((prev) => (prev ? prev.map((a) => (a.id === id ? updated : a)) : prev));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/delivery-areas/${id}`, { method: "DELETE" });
    setAreas((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
  }

  async function handleAdd(data: typeof EMPTY_FORM) {
    const res = await fetch("/api/admin/delivery-areas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Failed to create area");
    setAreas((prev) => (prev ? [...prev, body] : [body]));
  }

  if (authorized !== true) {
    return <div className="p-8 text-sm text-charcoal/50">{authorized === false ? "Redirecting…" : "Loading…"}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Delivery Areas</h1>
          <p className="text-sm text-charcoal/50">{areas ? `${areas.length} areas` : "Loading…"} — shown to customers at checkout</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-electric hover:bg-electric/90 transition-colors shrink-0">
            <Plus className="h-4 w-4" /> Add Area
          </button>
        )}
      </div>

      {adding && <AddAreaForm onAdd={handleAdd} onClose={() => setAdding(false)} />}

      <div className="space-y-3">
        {areas === null ? (
          <p className="text-sm text-charcoal/50">Loading…</p>
        ) : areas.length === 0 ? (
          <div className="bg-white rounded-[28px] p-12 text-center card-premium border border-[var(--border-color)]">
            <Truck className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
            <p className="text-charcoal/50">No delivery areas yet</p>
          </div>
        ) : (
          areas.map((area) => (
            <AreaRow key={area.id} area={area} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}

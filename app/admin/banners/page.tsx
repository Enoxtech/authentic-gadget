"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Eye, EyeOff, Trash2, Plus, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Placement = "hero" | "promo";

interface Banner {
  id: string;
  image: string;
  headline: string;
  subtitle: string | null;
  price_label: string | null;
  badge: string | null;
  cta_label: string;
  cta_href: string;
  accent_color: string;
  align: "left" | "center" | "right";
  transition: "fade" | "slide" | "zoom";
  placement: Placement;
  enabled: boolean;
  sort_order: number;
}

const EMPTY_FORM = {
  image: "",
  headline: "",
  subtitle: "",
  price_label: "",
  badge: "",
  cta_label: "Shop Now",
  cta_href: "/products",
  accent_color: "#19AFFF",
  align: "left" as Banner["align"],
  transition: "fade" as Banner["transition"],
  placement: "hero" as Placement,
  enabled: true,
};

const TABS: { id: Placement; label: string; helper: string }[] = [
  { id: "hero", label: "Hero Slider", helper: "Full-bleed rotating slides at the very top of the homepage." },
  { id: "promo", label: "Promo Sections", helper: "Standalone image banners placed between the homepage's product sections." },
];

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [tab, setTab] = useState<Placement>("hero");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadBanners() {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = (await res.json()) as { banners?: Banner[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load banners");
      setBanners(data.banners || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }

  const visibleBanners = useMemo(
    () => banners.filter((b) => b.placement === tab).sort((a, b) => a.sort_order - b.sort_order),
    [banners, tab]
  );

  function startEdit(banner?: Banner) {
    setError(null);
    if (banner) {
      setEditingId(banner.id);
      setForm({
        image: banner.image,
        headline: banner.headline,
        subtitle: banner.subtitle || "",
        price_label: banner.price_label || "",
        badge: banner.badge || "",
        cta_label: banner.cta_label,
        cta_href: banner.cta_href,
        accent_color: banner.accent_color,
        align: banner.align,
        transition: banner.transition,
        placement: banner.placement,
        enabled: banner.enabled,
      });
    } else {
      setEditingId("new");
      setForm({ ...EMPTY_FORM, placement: tab });
    }
  }

  async function save() {
    if (!form.image || !form.headline) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId === "new") {
        const res = await fetch("/api/admin/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create banner");
      } else if (editingId) {
        const res = await fetch(`/api/admin/banners/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update banner");
      }
      setEditingId(null);
      await loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(banner: Banner) {
    await fetch(`/api/admin/banners/${banner.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !banner.enabled }) });
    loadBanners();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    loadBanners();
  }

  async function move(banner: Banner, direction: "up" | "down") {
    const idx = visibleBanners.findIndex((b) => b.id === banner.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= visibleBanners.length) return;
    const other = visibleBanners[swapIdx];
    await Promise.all([
      fetch(`/api/admin/banners/${banner.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: other.sort_order }) }),
      fetch(`/api/admin/banners/${other.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: banner.sort_order }) }),
    ]);
    loadBanners();
  }

  const inputClass = "w-full rounded-xl px-3.5 py-2.5 text-sm text-fog border focus:outline-none";
  const inputStyle = { background: "var(--theme-input-bg)", borderColor: "var(--theme-input-border)" };
  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-charcoal font-display">Banners</h1>
          <p className="text-sm text-charcoal/50 mt-0.5">{activeTab.helper}</p>
        </div>
        <button onClick={() => startEdit()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#19AFFF" }}>
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      {/* Placement tabs */}
      <div className="flex items-center gap-2 border-b border-fog">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setEditingId(null); }}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors",
              tab === t.id ? "border-electric text-electric" : "border-transparent text-charcoal/50 hover:text-charcoal"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-charcoal/50">Loading...</p>
      ) : visibleBanners.length === 0 && editingId !== "new" ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-card">
          <p className="text-charcoal/50 text-sm">
            No {activeTab.label.toLowerCase()} banners yet. The storefront will show curated fallback content until you add one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleBanners.map((banner, i) => (
            <div key={banner.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.image} alt="" className="w-24 h-14 rounded-lg object-cover bg-fog shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-charcoal truncate">{banner.headline}</p>
                  <p className="text-xs text-charcoal/50 truncate">{banner.subtitle}</p>
                </div>
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full shrink-0", banner.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                  {banner.enabled ? "Active" : "Hidden"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => move(banner, "up")} disabled={i === 0} className="p-2 rounded-lg hover:bg-fog disabled:opacity-30 text-charcoal/60"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(banner, "down")} disabled={i === visibleBanners.length - 1} className="p-2 rounded-lg hover:bg-fog disabled:opacity-30 text-charcoal/60"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => toggleEnabled(banner)} className="p-2 rounded-lg hover:bg-fog text-charcoal/60">{banner.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                  <button onClick={() => startEdit(banner)} className="px-3 py-2 rounded-lg hover:bg-fog text-electric text-xs font-semibold">Edit</button>
                  <button onClick={() => remove(banner.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {editingId === banner.id && (
                <BannerForm form={form} setForm={setForm} onCancel={() => setEditingId(null)} onSave={save} saving={saving} inputClass={inputClass} inputStyle={inputStyle} />
              )}
            </div>
          ))}

          {editingId === "new" && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <BannerForm form={form} setForm={setForm} onCancel={() => setEditingId(null)} onSave={save} saving={saving} inputClass={inputClass} inputStyle={inputStyle} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BannerForm({ form, setForm, onCancel, onSave, saving, inputClass, inputStyle }: {
  form: typeof EMPTY_FORM;
  setForm: (f: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  inputClass: string;
  inputStyle: React.CSSProperties;
}) {
  const isPromo = form.placement === "promo";
  return (
    <div className="p-4 border-t border-fog space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} style={inputStyle} />
        <input placeholder="CTA link (/products/...)" value={form.cta_href} onChange={(e) => setForm({ ...form, cta_href: e.target.value })} className={inputClass} style={inputStyle} />
      </div>
      <input
        placeholder={isPromo ? "Internal label (not shown on the image)" : "Headline"}
        value={form.headline}
        onChange={(e) => setForm({ ...form, headline: e.target.value })}
        className={inputClass}
        style={inputStyle}
      />
      {!isPromo && (
        <>
          <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} style={inputStyle} />
          <div className="grid sm:grid-cols-3 gap-3">
            <input placeholder="Price label (e.g. GHS 5,499)" value={form.price_label} onChange={(e) => setForm({ ...form, price_label: e.target.value })} className={inputClass} style={inputStyle} />
            <input placeholder="Badge (e.g. New Arrival)" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={inputClass} style={inputStyle} />
            <input placeholder="CTA label" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} className={inputClass} style={inputStyle} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <select value={form.transition} onChange={(e) => setForm({ ...form, transition: e.target.value as typeof form.transition })} className={inputClass} style={inputStyle}>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
            </select>
            <select value={form.align} onChange={(e) => setForm({ ...form, align: e.target.value as typeof form.align })} className={inputClass} style={inputStyle}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
            <input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="h-10 w-full rounded-xl border" style={inputStyle} />
          </div>
        </>
      )}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-charcoal/60 hover:bg-fog"><X className="w-4 h-4" /> Cancel</button>
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: "#19AFFF" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

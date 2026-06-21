"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Save, X, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  product_count: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EMPTY_FORM = { name: "", slug: "", icon: "", description: "" };

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
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
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = (await res.json()) as { categories?: Category[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load categories");
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(cat?: Category) {
    setError(null);
    if (cat) {
      setEditingId(cat.id);
      setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || "", description: cat.description || "" });
    } else {
      setEditingId("new");
      setForm(EMPTY_FORM);
    }
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, slug: form.slug.trim() ? slugify(form.slug) : slugify(form.name) };
      if (editingId === "new") {
        const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create category");
      } else if (editingId) {
        const res = await fetch(`/api/admin/categories/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update category");
      }
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    setError(null);
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to delete category");
      return;
    }
    loadCategories();
  }

  const inputClass = "w-full rounded-xl px-3.5 py-2.5 text-sm bg-fog text-charcoal border-0 focus:outline-none focus:ring-2 focus:ring-electric/30";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Categories</h1>
          <p className="text-sm text-charcoal/50">{categories.length} categories</p>
        </div>
        <button onClick={() => startEdit()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-electric hover:bg-electric/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-charcoal/50">Loading...</p>
      ) : (
        <div className="space-y-3">
          {editingId === "new" && (
            <div className="bg-white rounded-[28px] card-premium border border-[var(--border-color)] p-4">
              <CategoryForm form={form} setForm={setForm} onCancel={() => setEditingId(null)} onSave={save} saving={saving} inputClass={inputClass} />
            </div>
          )}

          {categories.length === 0 && editingId !== "new" ? (
            <div className="bg-white rounded-[28px] p-12 text-center card-premium border border-[var(--border-color)]">
              <Tag className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
              <p className="text-charcoal/50">No categories yet</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-[28px] card-premium border border-[var(--border-color)] overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="h-11 w-11 rounded-xl bg-fog flex items-center justify-center text-2xl shrink-0">
                    {cat.icon || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal">{cat.name}</p>
                    <p className="text-xs text-charcoal/40">/{cat.slug} · {cat.product_count} product{cat.product_count === 1 ? "" : "s"}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(cat)} className="p-2 rounded-lg hover:bg-fog text-charcoal/50 hover:text-electric transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(cat)} className="p-2 rounded-lg hover:bg-red-50 text-charcoal/50 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {editingId === cat.id && (
                  <div className="p-4 border-t border-fog">
                    <CategoryForm form={form} setForm={setForm} onCancel={() => setEditingId(null)} onSave={save} saving={saving} inputClass={inputClass} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CategoryForm({ form, setForm, onCancel, onSave, saving, inputClass }: {
  form: typeof EMPTY_FORM;
  setForm: (f: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  inputClass: string;
}) {
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-[1fr_1fr_80px] gap-3">
        <input
          placeholder="Category name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })}
          className={inputClass}
        />
        <input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
        <input placeholder="📱" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={`${inputClass} text-center text-lg`} maxLength={4} />
      </div>
      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        className={inputClass}
      />
      <div className="flex items-center justify-end gap-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-charcoal/60 hover:bg-fog">
          <X className="w-4 h-4" /> Cancel
        </button>
        <button onClick={onSave} disabled={saving || !form.name.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-electric disabled:opacity-60">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, Plus } from "lucide-react";
import ImageUploadButton from "@/components/admin/ImageUploadButton";

interface Category {
  id: string;
  name: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  description: string | null;
  badge: string | null;
  images: string[];
  features: string[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    brand: "",
    category: "",
    price: "",
    compare_at_price: "",
    stock: "",
    description: "",
    badge: "",
    images: "",
    features: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadData() {
    const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`);
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = (await response.json()) as {
      product?: Product;
      categories?: Category[];
      error?: string;
    };
    if (!response.ok) {
      setErrors({ form: data.error || "Failed to load product" });
      setLoading(false);
      return;
    }

    if (data.categories) {
      setCategories(data.categories.map((c) => ({ id: c.id || c.name, name: c.name })));
    }

    if (data.product) {
      const p = data.product;
      setForm({
        name: p.name || "",
        slug: p.slug || "",
        brand: p.brand || "",
        category: p.category || "",
        price: String(p.price || ""),
        compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
        stock: String(p.stock ?? ""),
        description: p.description || "",
        badge: p.badge || "",
        images: (p.images || []).join("\n"),
        features: p.features || [],
      });
    }
    setLoading(false);
  }

  function handleNameChange(value: string) {
    setForm((prev) => ({ ...prev, name: value, slug: slugify(value) }));
  }

  function addFeature() {
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  }

  function updateFeature(index: number, value: string) {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  }

  function removeFeature(index: number) {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  }

  function appendImageUrl(url: string) {
    setForm((prev) => ({
      ...prev,
      images: prev.images ? `${prev.images.trim()}\n${url}` : url,
    }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Valid price is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.stock || Number(form.stock) < 0) errs.stock = "Stock is required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const imagesArray = form.images.split("\n").map((u) => u.trim()).filter(Boolean);
      const featuresArray = form.features.filter(Boolean);

      const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug || slugify(form.name),
          brand: form.brand.trim() || null,
          category: form.category,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          stock: Number(form.stock),
          description: form.description.trim() || null,
          badge: form.badge.trim() || null,
          images: imagesArray,
          features: featuresArray,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(data.error || "Failed to update product");
      router.push("/admin/products");
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : "Failed to update product" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 bg-fog rounded-xl animate-pulse" />
          <div className="space-y-2"><div className="h-6 w-32 bg-fog rounded animate-pulse" /><div className="h-4 w-48 bg-fog rounded animate-pulse" /></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center hover:bg-fog transition-colors">
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Edit Product</h2>
          <p className="text-sm text-charcoal/50">Update product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.form && (
          <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">{errors.form}</div>
        )}

        <div className="bg-white rounded-[28px] p-6 card-premium border border-[var(--border-color)]">
          <h3 className="font-semibold text-charcoal mb-4">Basic Info</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className={`w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30 ${errors.name ? "ring-2 ring-red-400" : ""}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal/60 focus:outline-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Category *</label>
                <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className={`w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30 ${errors.category ? "ring-2 ring-red-400" : ""}`}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Badge (optional)</label>
              <input type="text" value={form.badge} onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))} className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 card-premium border border-[var(--border-color)]">
          <h3 className="font-semibold text-charcoal mb-4">Pricing</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Price (GHS) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} min="0" className={`w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30 ${errors.price ? "ring-2 ring-red-400" : ""}`} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Compare at Price (GHS)</label>
              <input type="number" value={form.compare_at_price} onChange={(e) => setForm((prev) => ({ ...prev, compare_at_price: e.target.value }))} min="0" className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Stock *</label>
              <input type="number" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} min="0" className={`w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30 ${errors.stock ? "ring-2 ring-red-400" : ""}`} />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 card-premium border border-[var(--border-color)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="font-semibold text-charcoal">Images</h3>
            <ImageUploadButton folder="products" onUploaded={appendImageUrl} />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Image URLs (one per line)</label>
            <textarea value={form.images} onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))} rows={4} className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30 resize-none" />
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 card-premium border border-[var(--border-color)]">
          <h3 className="font-semibold text-charcoal mb-4">Description</h3>
          <div>
            <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={5} className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30 resize-none" />
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 card-premium border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-charcoal">Features</h3>
            <button type="button" onClick={addFeature} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-electric/10 text-electric rounded-lg hover:bg-electric/20 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Feature
            </button>
          </div>
          <div className="space-y-2">
            {form.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={f} onChange={(e) => updateFeature(i, e.target.value)} className="flex-1 px-3 py-2 bg-fog rounded-lg text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-electric/30" />
                <button type="button" onClick={() => removeFeature(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-charcoal/30 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {form.features.length === 0 && (
              <p className="text-sm text-charcoal/40">No features added. Click &quot;Add Feature&quot; to add product highlights.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/admin/products" className="px-6 py-2.5 bg-fog text-charcoal/70 rounded-xl text-sm font-medium hover:bg-charcoal/10 transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-electric text-white rounded-xl text-sm font-semibold hover:bg-electric/90 transition-colors disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

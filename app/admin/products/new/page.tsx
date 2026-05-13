"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, X, Plus } from "lucide-react";

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

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    const adminSession = document.cookie.includes("admin_session");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadCategories();
  }, [router]);

  async function loadCategories() {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("name").order("name", { ascending: true });
    if (data) setCategories(data.map((c: { name: string }) => ({ id: c.name, name: c.name })));
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

    setLoading(true);
    try {
      const supabase = createClient();
      const imagesArray = form.images
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

      const featuresArray = form.features.filter(Boolean);

      const { error } = await supabase.from("products").insert({
        name: form.name.trim(),
        slug: form.slug || slugify(form.name),
        brand: form.brand.trim() || null,
        category: form.category,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        stock: Number(form.stock),
        description: form.description.trim() || null,
        badge: form.badge.trim() || null,
        images: imagesArray.length > 0 ? imagesArray : [],
        features: featuresArray.length > 0 ? featuresArray : [],
      });

      if (error) throw error;
      router.push("/admin/products");
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : "Failed to create product" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center hover:bg-fog transition-colors">
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Add Product</h2>
          <p className="text-sm text-charcoal/50">Create a new product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.form && (
          <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">{errors.form}</div>
        )}

        {/* Name */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-charcoal mb-4">Basic Info</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max"
                className={`w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30 ${errors.name ? "ring-2 ring-red-400" : ""}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="auto-generated-from-name"
                className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal/60 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} placeholder="Apple" className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30" />
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
              <input type="text" value={form.badge} onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))} placeholder="Best Seller, New Arrival, etc." className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-charcoal mb-4">Pricing</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Price (¢) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="12499" min="0" className={`w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30 ${errors.price ? "ring-2 ring-red-400" : ""}`} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Compare at Price (¢)</label>
              <input type="number" value={form.compare_at_price} onChange={(e) => setForm((prev) => ({ ...prev, compare_at_price: e.target.value }))} placeholder="Optional" min="0" className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Stock *</label>
              <input type="number" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} placeholder="0" min="0" className={`w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30 ${errors.stock ? "ring-2 ring-red-400" : ""}`} />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-charcoal mb-4">Images</h3>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Image URLs (one per line)</label>
            <textarea
              value={form.images}
              onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              rows={4}
              className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30 resize-none"
            />
            <p className="text-xs text-charcoal/40 mt-1">First image will be used as the main product image</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-charcoal mb-4">Description</h3>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Product Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your product..."
              rows={5}
              className="w-full px-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30 resize-none"
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-charcoal">Features</h3>
            <button type="button" onClick={addFeature} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-electric/10 text-electric rounded-lg hover:bg-electric/20 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Feature
            </button>
          </div>
          <div className="space-y-2">
            {form.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={f}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  placeholder={`Feature ${i + 1}`}
                  className="flex-1 px-3 py-2 bg-fog rounded-lg text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30"
                />
                <button type="button" onClick={() => removeFeature(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-charcoal/30 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {form.features.length === 0 && (
              <p className="text-sm text-charcoal/40">No features added. Click "Add Feature" to add product highlights.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/products" className="px-6 py-2.5 bg-fog text-charcoal/70 rounded-xl text-sm font-medium hover:bg-charcoal/10 transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-electric text-white rounded-xl text-sm font-semibold hover:bg-electric/90 transition-colors disabled:opacity-60">
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
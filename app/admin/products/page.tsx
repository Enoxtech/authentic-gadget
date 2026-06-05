"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Plus, Edit, Trash2, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  status?: string;
  badge?: string;
}

const CATEGORIES = ["All", "Smartphones", "Laptops", "Audio", "Wearables", "Accessories", "Other"];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadProducts() {
    try {
      const response = await fetch("/api/admin/products");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to load products");
      const data = (await response.json()) as { products?: Product[] };
      setProducts(data.products || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  function StockBadge({ stock }: { stock: number }) {
    if (stock === 0) return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">Out of Stock</span>;
    if (stock < 5) return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">Low Stock ({stock})</span>;
    return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">In Stock ({stock})</span>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Products</h2>
          <p className="text-sm text-charcoal/50">{products.length} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-electric text-white text-sm font-semibold rounded-xl hover:bg-electric/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
          <input
            type="text"
            placeholder="Search products by name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === c ? "bg-electric text-white" : "bg-fog text-charcoal/60 hover:bg-charcoal/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-card animate-pulse">
              <div className="aspect-square bg-fog rounded-xl mb-3" />
              <div className="h-5 bg-fog rounded w-3/4 mb-2" />
              <div className="h-4 bg-fog rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <Package className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
          <p className="text-charcoal/50">No products found</p>
          <Link href="/admin/products/new" className="mt-3 inline-block text-electric underline text-sm">Add your first product</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-fog mb-3">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-charcoal/20" />
                  </div>
                )}
              </div>
              <p className="font-medium text-sm text-charcoal mb-0.5 truncate">{p.name}</p>
              {p.brand && <p className="text-xs text-charcoal/40 mb-1">{p.brand}</p>}
              <p className="font-bold text-electric mb-2">GHS {p.price?.toLocaleString()}</p>
              <div className="flex items-center justify-between">
                <StockBadge stock={p.stock ?? 0} />
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="p-1.5 hover:bg-fog rounded-lg text-charcoal/40 hover:text-electric transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => deleteProduct(p.id, p.name)}
                    disabled={deleting === p.id}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-charcoal/40 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

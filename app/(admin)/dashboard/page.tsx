"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package, ShoppingCart, Users, DollarSign, Eye, Edit, Trash2, Plus,
  LayoutDashboard, ShoppingBag, Users2, BarChart3, Settings, LogOut,
  X, ChevronDown, TrendingUp
} from "lucide-react";
import { createClient } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  total: number;
  order_status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  category: string;
  description: string;
  features: string[];
  images: string[];
  badge?: string;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  "low-stock": "bg-orange-100 text-orange-700",
};

const ORDER_STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

function formatCurrency(amount: number) {
  return `¢${amount.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─── Product Modal ───────────────────────────────────────────────────────────

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

function ProductModal({ product, onClose, onSaved }: ProductModalProps) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? "",
    price: product?.price?.toString() ?? "",
    compare_at_price: product?.compare_at_price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    description: product?.description ?? "",
    badge: product?.badge ?? "",
  });
  const [features, setFeatures] = useState<string[]>(product?.features ?? []);
  const [images, setImages] = useState<string[]>(product?.images ?? [""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: product?.slug ? f.slug : slugify(name) }));
  };

  const addFeature = () => setFeatures(f => [...f, ""]);
  const removeFeature = (i: number) => setFeatures(f => f.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, val: string) => {
    setFeatures(f => { const n = [...f]; n[i] = val; return n; });
  };

  const addImage = () => setImages(im => [...im, ""]);
  const removeImage = (i: number) => setImages(im => im.filter((_, idx) => idx !== i));
  const updateImage = (i: number, val: string) => {
    setImages(im => { const n = [...im]; n[i] = val; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      brand: form.brand,
      category: form.category,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      stock: parseInt(form.stock) || 0,
      description: form.description,
      features: features.filter(f => f.trim()),
      images: images.filter(im => im.trim()),
      badge: form.badge || null,
    };

    try {
      if (product) {
        const { error: err } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("products").insert(payload);
        if (err) throw err;
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-fog sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-charcoal">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-fog rounded-xl transition-colors">
            <X className="w-5 h-5 text-charcoal/50" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Product Name</label>
              <input value={form.name} onChange={e => handleNameChange(e.target.value)} required
                className="w-full px-3 py-2.5 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full px-3 py-2.5 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Brand</label>
              <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                className="w-full px-3 py-2.5 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Category</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Price (¢)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required
                className="w-full px-3 py-2.5 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Compare At Price (¢)</label>
              <input type="number" value={form.compare_at_price}
                onChange={e => setForm(f => ({ ...f, compare_at_price: e.target.value }))}
                className="w-full px-3 py-2.5 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required
                className="w-full px-3 py-2.5 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Badge (optional)</label>
              <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                placeholder="e.g. Best Seller, New Arrival"
                className="w-full px-3 py-2.5 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full px-3 py-2.5 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30 resize-none" />
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-charcoal/70">Features</label>
              <button type="button" onClick={addFeature}
                className="text-xs text-electric font-medium hover:underline">+ Add Feature</button>
            </div>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={f} onChange={e => updateFeature(i, e.target.value)}
                    placeholder={`Feature ${i + 1}`}
                    className="flex-1 px-3 py-2 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  <button type="button" onClick={() => removeFeature(i)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-charcoal/70">Image URLs</label>
              <button type="button" onClick={addImage}
                className="text-xs text-electric font-medium hover:underline">+ Add Image</button>
            </div>
            <div className="space-y-2">
              {images.map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={img} onChange={e => updateImage(i, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-fog rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/30" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-fog">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-fog rounded-xl text-sm font-medium text-charcoal/70 hover:bg-fog transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-electric text-white rounded-xl text-sm font-semibold hover:bg-electric/90 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : product ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

function OrderDetail({ order, onClose, onStatusChange }: OrderDetailProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status: string) => {
    setUpdating(true);
    await onStatusChange(order.id, status);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-fog">
          <div>
            <h2 className="text-lg font-bold text-charcoal">Order #{order.id}</h2>
            <p className="text-xs text-charcoal/50 mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-fog rounded-xl transition-colors">
            <X className="w-5 h-5 text-charcoal/50" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-charcoal/70 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  disabled={updating || order.order_status === s}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    order.order_status === s
                      ? STATUS_COLORS[s]
                      : "bg-fog text-charcoal/50 hover:bg-fog/80"
                  } disabled:cursor-default`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div className="p-4 bg-fog rounded-xl">
            <p className="text-xs text-charcoal/50 mb-1">Customer</p>
            <p className="font-semibold text-charcoal">{order.customer_name}</p>
            <p className="text-sm text-charcoal/70">{order.customer_email}</p>
            {order.customer_phone && <p className="text-sm text-charcoal/70">{order.customer_phone}</p>}
            {order.address && (
              <p className="text-sm text-charcoal/70 mt-1">
                {order.address}{order.city ? `, ${order.city}` : ""}
              </p>
            )}
          </div>

          {/* Items */}
          {order.order_items && order.order_items.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-charcoal/70 mb-3">Items</p>
              <div className="space-y-3">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-fog rounded-xl">
                    {item.product_image ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                        <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-charcoal truncate">{item.product_name}</p>
                      <p className="text-xs text-charcoal/50">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <p className="font-semibold text-sm text-charcoal">{formatCurrency(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-charcoal/50 text-center py-4">No items found</p>
          )}

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-electric/5 rounded-xl">
            <span className="font-semibold text-charcoal">Total</span>
            <span className="text-xl font-bold text-electric">{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-3 bg-charcoal text-white rounded-xl font-semibold hover:bg-charcoal/90 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function Confirm({ message, onConfirm, onCancel }: ConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <p className="text-charcoal font-semibold mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-fog rounded-xl text-sm font-medium text-charcoal/70 hover:bg-fog transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-fog animate-pulse rounded-xl ${className}`} />;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [adminChecked, setAdminChecked] = useState(false);
  const [notAuthed, setNotAuthed] = useState(false);

  // Data state
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<string>("");

  // Modal state
  const [productModal, setProductModal] = useState<Product | null | undefined>(undefined);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "product" | "order", id: string } | null>(null);

  // ─── Auth Check ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.from("orders").select("id").limit(1);
      setAdminChecked(true);
      // Note: In production you'd check a cookie/session here.
      // For now we allow access since there's no client-side admin cookie.
      // The API route handles real auth; we just need to not crash on client.
    };
    checkAdmin();
  }, []);

  // ─── Fetch Data ─────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    const [orderRes, productRes, customerRes] = await Promise.all([
      supabase.from("orders").select("total"),
      supabase.from("products").select("id"),
      supabase.from("customers").select("id"),
    ]);
    const orderTotal = (orderRes.data ?? []).reduce((s: number, o: { total: number }) => s + (o.total || 0), 0) as number;
    setStats({
      revenue: orderTotal,
      orders: orderRes.data?.length ?? 0,
      products: productRes.data?.length ?? 0,
      customers: customerRes.data?.length ?? 0,
    });
  }, []);

  const fetchOrders = useCallback(async (filter = "") => {
    let query = supabase.from("orders").select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (filter) query = query.eq("order_status", filter);
    const { data } = await query;
    return (data as unknown as Order[]) ?? [];
  }, []);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("name", { ascending: true });
    return (data as Product[]) ?? [];
  }, []);

  const fetchCustomers = useCallback(async () => {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    return (data as Customer[]) ?? [];
  }, []);

  useEffect(() => {
    if (!adminChecked) return;
    setLoading(true);

    const load = async () => {
      await fetchStats();
      const [o, p, c] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchCustomers(),
      ]);
      setOrders(o);
      setRecentOrders(o.slice(0, 5));
      setProducts(p);
      setTopProducts(p.slice(0, 5));
      setCustomers(c);
      setLoading(false);
    };
    load();
  }, [adminChecked, orderFilter]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", id);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: status as Order["order_status"] } : o));
      setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: status as Order["order_status"] } : o));
      setOrderDetail(prev => prev?.id === id ? { ...prev, order_status: status as Order["order_status"] } : null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;

    if (type === "product") {
      await supabase.from("products").delete().eq("id", id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setTopProducts(prev => prev.filter(p => p.id !== id));
    } else {
      await supabase.from("orders").delete().eq("id", id);
      setOrders(prev => prev.filter(o => o.id !== id));
      setRecentOrders(prev => prev.filter(o => o.id !== id));
    }
    setDeleteConfirm(null);
  };

  const handleProductSaved = async () => {
    const updated = await fetchProducts();
    setProducts(updated);
    setTopProducts(updated.slice(0, 5));
    await fetchStats();
  };

  const getProductStatus = (p: Product) => p.stock < 5 ? "low-stock" : "active";

  const getOrderItemsCount = (order: Order) =>
    order.order_items?.length ?? 0;

  // ─── Analytics ─────────────────────────────────────────────────────────────

  const analyticsData = (() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recentOrders = orders.filter(o => new Date(o.created_at).getTime() > thirtyDaysAgo);
    const byDay: Record<string, number> = {};
    recentOrders.forEach(o => {
      const day = new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      byDay[day] = (byDay[day] ?? 0) + 1;
    });
    const topItems: Record<string, number> = {};
    recentOrders.forEach(o => {
      (o.order_items ?? []).forEach(item => {
        topItems[item.product_name] = (topItems[item.product_name] ?? 0) + item.quantity;
      });
    });
    const topSelling = Object.entries(topItems)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));
    const avgOrderValue = recentOrders.length > 0
      ? recentOrders.reduce((s, o) => s + o.total, 0) / recentOrders.length
      : 0;
    return { byDay, topSelling, avgOrderValue, totalRevenue: stats.revenue };
  })();

  // ─── Render ────────────────────────────────────────────────────────────────

  if (notAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fog">
        <div className="text-center">
          <p className="text-charcoal/70 mb-4">Please login as admin first.</p>
          <Link href="/admin" className="px-5 py-2.5 bg-electric text-white rounded-xl font-semibold hover:bg-electric/90">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fog flex">
      {/* Sidebar */}
      <aside className="w-64 bg-midnight text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-lg font-bold">🏪 Authentic Gadget</h1>
          <p className="text-xs text-white/40 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === id ? "bg-electric text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all">
            <LogOut className="w-4 h-4" /> Exit to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-charcoal capitalize">{activeTab}</h2>
              <p className="text-sm text-charcoal/50">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-charcoal/50">🟢 All systems normal</span>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-card">
                  {loading ? <Skeleton className="h-28" /> : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-charcoal mb-0.5">{formatCurrency(stats.revenue)}</p>
                      <p className="text-xs text-charcoal/50">Total Revenue</p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-card">
                  {loading ? <Skeleton className="h-28" /> : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-electric/10 text-electric">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-charcoal mb-0.5">{stats.orders}</p>
                      <p className="text-xs text-charcoal/50">Orders</p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-card">
                  {loading ? <Skeleton className="h-28" /> : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
                          <Package className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-charcoal mb-0.5">{stats.products}</p>
                      <p className="text-xs text-charcoal/50">Products</p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-card">
                  {loading ? <Skeleton className="h-28" /> : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-charcoal mb-0.5">{stats.customers}</p>
                      <p className="text-xs text-charcoal/50">Customers</p>
                    </>
                  )}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-charcoal">Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-sm text-electric font-medium hover:underline">View All →</button>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
                  ) : recentOrders.length === 0 ? (
                    <p className="text-center text-charcoal/50 py-8">No orders yet</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-charcoal/50 text-left border-b border-fog">
                          <th className="pb-3 font-medium">Order ID</th>
                          <th className="pb-3 font-medium">Customer</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Total</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map(o => (
                          <tr key={o.id} className="border-b border-fog last:border-0 hover:bg-fog/50">
                            <td className="py-3 font-medium text-charcoal">{o.id}</td>
                            <td className="py-3 text-charcoal/70">{o.customer_name}</td>
                            <td className="py-3 text-charcoal/50">{formatDate(o.created_at)}</td>
                            <td className="py-3 font-medium text-charcoal">{formatCurrency(o.total)}</td>
                            <td className="py-3">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.order_status]}`}>
                                {o.order_status.charAt(0).toUpperCase() + o.order_status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3">
                              <button onClick={() => setOrderDetail(o)}
                                className="p-1.5 hover:bg-fog rounded-lg transition-colors text-charcoal/40 hover:text-electric">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-charcoal">Top Products</h3>
                  <button onClick={() => setActiveTab("products")} className="text-sm text-electric font-medium hover:underline">Manage →</button>
                </div>
                {loading ? (
                  <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
                ) : topProducts.length === 0 ? (
                  <p className="text-center text-charcoal/50 py-8">No products yet</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map(p => (
                      <div key={p.id} className="flex items-center gap-3 py-3 border-b border-fog last:border-0">
                        {p.images?.[0] ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-fog shrink-0">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-fog shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-charcoal truncate">{p.name}</p>
                          <p className="text-xs text-charcoal/50">Stock: {p.stock}</p>
                        </div>
                        <p className="font-bold text-sm text-charcoal">{formatCurrency(p.price)}</p>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[getProductStatus(p)]}`}>
                          {getProductStatus(p) === "low-stock" ? "Low Stock" : "Active"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === "orders" && (
            <div className="space-y-5">
              {/* Filter */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-charcoal/50">Filter:</span>
                <button onClick={() => setOrderFilter("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!orderFilter ? "bg-electric text-white" : "bg-white text-charcoal/50 hover:bg-fog"}`}>
                  All
                </button>
                {ORDER_STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => setOrderFilter(s === orderFilter ? "" : s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${orderFilter === s ? STATUS_COLORS[s] : "bg-white text-charcoal/50 hover:bg-fog"}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-charcoal mb-4">All Orders ({orders.length})</h3>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
                  ) : orders.length === 0 ? (
                    <p className="text-center text-charcoal/50 py-12">No orders found</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-charcoal/50 text-left border-b border-fog">
                          <th className="pb-3 font-medium">Order ID</th>
                          <th className="pb-3 font-medium">Customer</th>
                          <th className="pb-3 font-medium">Items</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Total</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="border-b border-fog last:border-0 hover:bg-fog/50">
                            <td className="py-3 font-medium text-charcoal">{o.id}</td>
                            <td className="py-3 text-charcoal/70">{o.customer_name}</td>
                            <td className="py-3 text-charcoal/70">{getOrderItemsCount(o)}</td>
                            <td className="py-3 text-charcoal/50">{formatDate(o.created_at)}</td>
                            <td className="py-3 font-medium text-charcoal">{formatCurrency(o.total)}</td>
                            <td className="py-3">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.order_status]}`}>
                                {o.order_status.charAt(0).toUpperCase() + o.order_status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => setOrderDetail(o)}
                                  className="p-1.5 hover:bg-fog rounded-lg text-charcoal/40 hover:text-electric"><Eye className="w-4 h-4" /></button>
                                <button
                                  onClick={() => setDeleteConfirm({ type: "order", id: o.id })}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-charcoal/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {activeTab === "products" && (
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-charcoal">Products ({products.length})</h3>
                <button onClick={() => setProductModal(undefined)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-electric text-white text-sm font-semibold rounded-xl hover:bg-electric/90 transition-colors">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64" />)}
                </div>
              ) : products.length === 0 ? (
                <p className="text-center text-charcoal/50 py-12">No products yet. Add your first product!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="border border-fog rounded-2xl p-4 hover:shadow-card transition-shadow">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-fog mb-3">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-charcoal/20">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-sm text-charcoal mb-1 truncate">{p.name}</p>
                      {p.brand && <p className="text-xs text-charcoal/40 mb-1">{p.brand}</p>}
                      <p className="font-bold text-electric mb-2">{formatCurrency(p.price)}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[getProductStatus(p)]}`}>
                          {getProductStatus(p) === "low-stock" ? "Low Stock" : `Stock: ${p.stock}`}
                        </span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setProductModal(p)}
                            className="p-1.5 hover:bg-fog rounded-lg text-charcoal/40 hover:text-electric"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteConfirm({ type: "product", id: p.id })}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-charcoal/40 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {activeTab === "customers" && (
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-bold text-charcoal mb-4">Customers ({customers.length})</h3>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
                ) : customers.length === 0 ? (
                  <p className="text-center text-charcoal/50 py-12">No customers yet</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-charcoal/50 text-left border-b border-fog">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Phone</th>
                        <th className="pb-3 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id} className="border-b border-fog last:border-0 hover:bg-fog/50">
                          <td className="py-3 font-medium text-charcoal">{c.name || "—"}</td>
                          <td className="py-3 text-charcoal/70">{c.email || "—"}</td>
                          <td className="py-3 text-charcoal/70">{c.phone || "—"}</td>
                          <td className="py-3 text-charcoal/50">{formatDate(c.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  {loading ? <Skeleton className="h-28" /> : (
                    <>
                      <p className="text-xs text-charcoal/50 mb-1">Total Revenue (30d)</p>
                      <p className="text-2xl font-bold text-charcoal">{formatCurrency(analyticsData.totalRevenue)}</p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  {loading ? <Skeleton className="h-28" /> : (
                    <>
                      <p className="text-xs text-charcoal/50 mb-1">Avg Order Value (30d)</p>
                      <p className="text-2xl font-bold text-charcoal">{formatCurrency(Math.round(analyticsData.avgOrderValue))}</p>
                    </>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  {loading ? <Skeleton className="h-28" /> : (
                    <>
                      <p className="text-xs text-charcoal/50 mb-1">Orders (30d)</p>
                      <p className="text-2xl font-bold text-charcoal">{orders.filter(o => new Date(o.created_at).getTime() > Date.now() - 30*24*60*60*1000).length}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Orders by day */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-charcoal mb-4">Orders Per Day (Last 30 Days)</h3>
                {loading ? <Skeleton className="h-40" /> : (
                  Object.keys(analyticsData.byDay).length === 0 ? (
                    <p className="text-center text-charcoal/50 py-8">No data available</p>
                  ) : (
                    <div className="flex items-end gap-1 h-40">
                      {Object.entries(analyticsData.byDay).slice(-14).map(([day, count]) => {
                        const max = Math.max(...Object.values(analyticsData.byDay));
                        return (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-electric/20 rounded-t-lg transition-all hover:bg-electric/30"
                              style={{ height: `${Math.max(4, (count / max) * 100)}%` }}
                            />
                            <span className="text-xs text-charcoal/40 transform -rotate-45 origin-top-left">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>

              {/* Top selling */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-charcoal mb-4">Top Selling Products (30d)</h3>
                {loading ? <Skeleton className="h-40" /> : (
                  analyticsData.topSelling.length === 0 ? (
                    <p className="text-center text-charcoal/50 py-8">No sales data</p>
                  ) : (
                    <div className="space-y-3">
                      {analyticsData.topSelling.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-fog last:border-0">
                          <span className="font-medium text-sm text-charcoal">{item.name}</span>
                          <span className="text-sm font-semibold text-electric">{item.qty} sold</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* Orders by status */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-charcoal mb-4">Orders by Status</h3>
                <div className="grid grid-cols-5 gap-3">
                  {ORDER_STATUS_OPTIONS.map(s => {
                    const count = orders.filter(o => o.order_status === s).length;
                    return (
                      <div key={s} className={`p-4 rounded-xl text-center ${STATUS_COLORS[s]}`}>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs mt-1 capitalize">{s}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === "settings" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-charcoal mb-4">Store Information</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-fog rounded-xl">
                    <p className="text-xs text-charcoal/50 mb-1">Store Name</p>
                    <p className="font-semibold text-charcoal">Authentic Gadget</p>
                  </div>
                  <div className="p-4 bg-fog rounded-xl">
                    <p className="text-xs text-charcoal/50 mb-1">Description</p>
                    <p className="font-semibold text-charcoal">Premium tech & gadgets in Ghana</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-charcoal mb-4">Payment Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="font-semibold text-green-700">Paystack</p>
                    <p className="text-sm text-green-600/80 mt-1">✅ Connected</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="font-semibold text-blue-700">MTN MoMo (Flutterwave)</p>
                    <p className="text-sm text-blue-600/80 mt-1">✅ Connected</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-charcoal mb-4">Change Admin Password</h3>
                <p className="text-sm text-charcoal/50 mb-4">Contact your developer to change the admin password via environment variables.</p>
                <div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl text-sm">
                  Admin password is set via the <code className="bg-yellow-100 px-1 rounded">ADMIN_PASSWORD</code> environment variable.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {productModal !== undefined && (
        <ProductModal
          product={productModal === null ? null : productModal}
          onClose={() => setProductModal(undefined)}
          onSaved={handleProductSaved}
        />
      )}

      {orderDetail && (
        <OrderDetail
          order={orderDetail}
          onClose={() => setOrderDetail(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {deleteConfirm && (
        <Confirm
          message={`Delete this ${deleteConfirm.type}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
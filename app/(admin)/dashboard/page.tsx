"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, Eye, Edit, Trash2, Plus, LayoutDashboard, ShoppingBag, Users2, BarChart3, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const STATS = [
  { label: "Total Revenue", value: "¢124,590", change: "+12%", icon: DollarSign, color: "text-green-600 bg-green-50" },
  { label: "Orders", value: "312", change: "+8%", icon: ShoppingCart, color: "text-electric bg-electric/10" },
  { label: "Products", value: "48", change: "+3", icon: Package, color: "text-purple-600 bg-purple-50" },
  { label: "Customers", value: "1,243", change: "+24", icon: Users, color: "text-orange-600 bg-orange-50" },
];

const ORDERS = [
  { id: "AG-7K9M2N4P", customer: "Kofi A.", items: 2, total: 13998, status: "pending", date: "2026-04-13" },
  { id: "AG-3X5Y7Z1Q", customer: "Ama B.", items: 1, total: 4999, status: "processing", date: "2026-04-13" },
  { id: "AG-9A2B4C6D", customer: "Samuel O.", items: 3, total: 24997, status: "shipped", date: "2026-04-12" },
  { id: "AG-1B3C5D7E", customer: "Nana K.", items: 1, total: 7499, status: "delivered", date: "2026-04-11" },
];

const PRODUCTS = [
  { id: "1", name: "iPhone 15 Pro Max", price: 12499, stock: 8, status: "active", image: "https://images.unsplash.com/photo-1592750475338-4b09a80f1c1e?w=80&h=80&fit=crop" },
  { id: "2", name: "Samsung Galaxy S24 Ultra", price: 10999, stock: 12, status: "active", image: "https://images.unsplash.com/photo-1610945415295-d9-1f7c8be6cb0?w=80&h=80&fit=crop" },
  { id: "3", name: "MacBook Air M3", price: 8999, stock: 3, status: "low-stock", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=80&h=80&fit=crop" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  "low-stock": "bg-orange-100 text-orange-700",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

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

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map(({ label, value, change, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-green-600 font-medium">{change}</span>
                    </div>
                    <p className="text-2xl font-bold text-charcoal mb-0.5">{value}</p>
                    <p className="text-xs text-charcoal/50">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-charcoal">Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-sm text-electric font-medium hover:underline">View All →</button>
                </div>
                <div className="overflow-x-auto">
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
                      {ORDERS.map((o) => (
                        <tr key={o.id} className="border-b border-fog last:border-0 hover:bg-fog/50">
                          <td className="py-3 font-medium text-charcoal">{o.id}</td>
                          <td className="py-3 text-charcoal/70">{o.customer}</td>
                          <td className="py-3 text-charcoal/50">{o.date}</td>
                          <td className="py-3 font-medium text-charcoal">¢{o.total.toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                              {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button className="p-1.5 hover:bg-fog rounded-lg transition-colors text-charcoal/40 hover:text-electric"><Eye className="w-4 h-4" /></button>
                              <button className="p-1.5 hover:bg-fog rounded-lg transition-colors text-charcoal/40 hover:text-electric"><Edit className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-charcoal">Top Products</h3>
                  <button onClick={() => setActiveTab("products")} className="text-sm text-electric font-medium hover:underline">Manage →</button>
                </div>
                <div className="space-y-3">
                  {PRODUCTS.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-3 border-b border-fog last:border-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-fog shrink-0">
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-charcoal truncate">{p.name}</p>
                        <p className="text-xs text-charcoal/50">Stock: {p.stock}</p>
                      </div>
                      <p className="font-bold text-sm text-charcoal">¢{p.price.toLocaleString()}</p>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>
                        {p.status === "low-stock" ? "Low Stock" : "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-bold text-charcoal mb-4">All Orders</h3>
              <div className="overflow-x-auto">
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
                    {ORDERS.map((o) => (
                      <tr key={o.id} className="border-b border-fog last:border-0 hover:bg-fog/50">
                        <td className="py-3 font-medium text-charcoal">{o.id}</td>
                        <td className="py-3 text-charcoal/70">{o.customer}</td>
                        <td className="py-3 text-charcoal/70">{o.items}</td>
                        <td className="py-3 text-charcoal/50">{o.date}</td>
                        <td className="py-3 font-medium text-charcoal">¢{o.total.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                            {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-fog rounded-lg text-charcoal/40 hover:text-electric"><Eye className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-fog rounded-lg text-charcoal/40 hover:text-orange-500"><Edit className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-red-50 rounded-lg text-charcoal/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-charcoal">Products</h3>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-electric text-white text-sm font-semibold rounded-xl hover:bg-electric/90 transition-colors">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PRODUCTS.map((p) => (
                  <div key={p.id} className="border border-fog rounded-2xl p-4 hover:shadow-card transition-shadow">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-fog mb-3">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    <p className="font-medium text-sm text-charcoal mb-1 truncate">{p.name}</p>
                    <p className="font-bold text-electric mb-2">¢{p.price.toLocaleString()}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>
                        {p.status === "low-stock" ? "Low Stock" : "Active"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-fog rounded-lg text-charcoal/40 hover:text-electric"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg text-charcoal/40 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="bg-white rounded-2xl p-6 shadow-card text-center py-16">
              <Users2 className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
              <p className="text-charcoal/50">Customer management — connect Supabase to view data</p>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="bg-white rounded-2xl p-6 shadow-card text-center py-16">
              <BarChart3 className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
              <p className="text-charcoal/50">Analytics — connect Supabase to view data</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl p-6 shadow-card text-center py-16">
              <Settings className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
              <p className="text-charcoal/50">Store settings — connect Supabase to configure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

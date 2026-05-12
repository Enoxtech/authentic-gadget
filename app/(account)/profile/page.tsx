"use client";

import { useState } from "react";
import { User, MapPin, Bell, ShoppingBag, Heart, Package } from "lucide-react";
import Link from "next/link";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "My Orders", icon: ShoppingBag },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const MOCK_ORDERS = [
  { id: "AG-7K9M2N4P", date: "2026-04-10", total: 13998, status: "delivered" },
  { id: "AG-3X5Y7Z1Q", date: "2026-03-28", total: 2998, status: "shipped" },
  { id: "AG-9A2B4C6D", date: "2026-03-15", total: 7499, status: "delivered" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const metadata = {
  title: "My Profile | Authentic Gadget",
  description: "Manage your profile, addresses, and preferences on Authentic Gadget.",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "Enoch K.", email: "enoch@solvi.app", phone: "+233 200 000 000" });

  return (
    <div className="min-h-screen bg-fog py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Page header */}
        <div className="bg-midnight text-white rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-electric/20 flex items-center justify-center">
            <User className="w-8 h-8 text-electric" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="text-white/50 text-sm">{profile.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Sidebar tabs */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-2 shadow-card">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id ? "bg-electric text-white" : "text-charcoal/60 hover:bg-fog"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-4">
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-bold text-charcoal text-lg mb-6">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-electric" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">Email Address</label>
                    <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-electric" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">Phone Number</label>
                    <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-electric" />
                  </div>
                  <button className="px-6 py-3 bg-electric text-white font-semibold rounded-xl hover:bg-electric/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="font-bold text-charcoal text-lg">My Orders</h2>
                {MOCK_ORDERS.map((order) => (
                  <Link key={order.id} href={`/(account)/orders/${order.id}`} className="block bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-charcoal">{order.id}</p>
                        <p className="text-sm text-charcoal/50">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-charcoal">¢{order.total.toLocaleString()}</p>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-electric font-medium">
                      <Package className="w-4 h-4" /> View Order Details →
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-bold text-charcoal text-lg mb-4">Saved Addresses</h2>
                <div className="bg-fog rounded-xl p-5 text-center">
                  <MapPin className="w-8 h-8 text-charcoal/20 mx-auto mb-2" />
                  <p className="text-sm text-charcoal/50">No saved addresses yet</p>
                  <button className="mt-3 text-sm text-electric font-medium hover:underline">+ Add new address</button>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-bold text-charcoal text-lg mb-4">My Wishlist</h2>
                <div className="text-center py-12">
                  <Heart className="w-8 h-8 text-charcoal/20 mx-auto mb-2" />
                  <p className="text-sm text-charcoal/50">Your wishlist is empty</p>
                  <Link href="/products" className="mt-3 inline-block text-sm text-electric font-medium hover:underline">Browse products</Link>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-bold text-charcoal text-lg mb-4">Notifications</h2>
                <div className="text-center py-12">
                  <Bell className="w-8 h-8 text-charcoal/20 mx-auto mb-2" />
                  <p className="text-sm text-charcoal/50">No new notifications</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

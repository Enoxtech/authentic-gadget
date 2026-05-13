"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, Store, CreditCard, User, Database, Wrench } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal">Settings</h2>
        <p className="text-sm text-charcoal/50">Configure your store</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Store Info */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-electric/10 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-electric" />
            </div>
            <h3 className="font-bold text-charcoal">Store Information</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-fog">
              <span className="text-charcoal/50 text-sm">Store Name</span>
              <span className="font-medium text-charcoal text-sm">Authentic Gadget</span>
            </div>
            <div className="flex justify-between py-2 border-b border-fog">
              <span className="text-charcoal/50 text-sm">Description</span>
              <span className="text-charcoal text-sm max-w-xs text-right">Premium gadgets at unbeatable prices. 100% authentic products with fast delivery across Ghana.</span>
            </div>
            <div className="flex justify-between py-2 border-b border-fog">
              <span className="text-charcoal/50 text-sm">Contact Email</span>
              <span className="font-medium text-charcoal text-sm">hello@authenticgadget.com</span>
            </div>
            <div className="flex justify-between py-2 border-b border-fog">
              <span className="text-charcoal/50 text-sm">Phone</span>
              <span className="font-medium text-charcoal text-sm">+233 200 000 000</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-charcoal/50 text-sm">Address</span>
              <span className="font-medium text-charcoal text-sm">Accra, Ghana</span>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-charcoal">Payment Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-fog">
              <div>
                <p className="font-medium text-charcoal text-sm">Paystack</p>
                <p className="text-xs text-charcoal/40">Mobile money & card payments</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-fog">
              <div>
                <p className="font-medium text-charcoal text-sm">MTN MoMo</p>
                <p className="text-xs text-charcoal/40">MTN Mobile Money integration</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
            </div>
            <div className="bg-fog rounded-xl p-4">
              <p className="text-xs text-charcoal/50">💡 Payment keys are configured in Vercel environment variables. Contact your developer to update payment settings.</p>
            </div>
          </div>
        </div>

        {/* Admin Account */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-charcoal">Admin Account</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-fog">
              <span className="text-charcoal/50 text-sm">Admin Password</span>
              <span className="text-charcoal/40 text-sm">Last changed: Not tracked</span>
            </div>
            <div className="bg-fog rounded-xl p-4">
              <p className="text-xs text-charcoal/50">🔒 To change the admin password, update the <code className="bg-white px-1.5 py-0.5 rounded text-charcoal">ADMIN_PASSWORD</code> environment variable in your Vercel project dashboard.</p>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-charcoal">Database</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-fog">
              <div>
                <p className="font-medium text-charcoal text-sm">Supabase</p>
                <p className="text-xs text-charcoal/40">PostgreSQL database</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
            </div>
            <div className="flex justify-between py-3 border-b border-fog">
              <span className="text-charcoal/50 text-sm">Project Reference</span>
              <span className="font-mono text-xs text-charcoal bg-fog px-2 py-1 rounded">mnrtcmffccxwtruwploo</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-charcoal/50 text-sm">Supabase Dashboard</span>
              <a
                href="https://supabase.com/dashboard/project/mnrtcmffccxwtruwploo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-electric font-medium hover:underline"
              >
                Open Dashboard →
              </a>
            </div>
          </div>
        </div>

        {/* Store Configuration */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-charcoal">Store Configuration</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-fog">
              <span className="text-charcoal/50 text-sm">Currency</span>
              <span className="font-medium text-charcoal text-sm">GHS (¢)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-fog">
              <span className="text-charcoal/50 text-sm">Tax Rate</span>
              <span className="font-medium text-charcoal text-sm">0%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-fog">
              <span className="text-charcoal/50 text-sm">Free Shipping Threshold</span>
              <span className="font-medium text-charcoal text-sm">¢2,000</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-charcoal/50 text-sm">Low Stock Alert Threshold</span>
              <span className="font-medium text-charcoal text-sm">5 units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
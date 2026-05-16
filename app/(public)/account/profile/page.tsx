"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, string> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login?redirect=/account/profile";
          return;
        }
        setUser(user);
      } catch (err) {
        console.error("Auth check error:", err);
        window.location.href = "/login?redirect=/account/profile";
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric/20 border-t-electric rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const metadata = user.user_metadata || {};
  const name = metadata.full_name || metadata.name || "";
  const phone = metadata.phone || "";

  return (
    <div className="min-h-screen bg-fog py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back nav */}
        <Link href="/account" className="inline-flex items-center gap-2 text-sm text-charcoal/50 hover:text-electric mb-6 transition-colors">
          ← Back to My Account
        </Link>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">My Profile</h1>
              <p className="text-charcoal/50 text-sm mt-1">Manage your account details</p>
            </div>
            <div className="w-20 h-20 rounded-full bg-electric/10 flex items-center justify-center">
              <User className="w-8 h-8 text-electric" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-fog rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-electric" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-charcoal/40 font-medium uppercase tracking-wider mb-1">Full Name</p>
                <p className="font-semibold text-charcoal">{name || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-fog rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-electric" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-charcoal/40 font-medium uppercase tracking-wider mb-1">Email Address</p>
                <p className="font-semibold text-charcoal">{user.email || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-fog rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-electric" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-charcoal/40 font-medium uppercase tracking-wider mb-1">Phone Number</p>
                <p className="font-semibold text-charcoal">{phone || "Not set"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-fog-200">
            <p className="text-xs text-charcoal/30 text-center">
              To update your profile, contact us at support@authenticgadget.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
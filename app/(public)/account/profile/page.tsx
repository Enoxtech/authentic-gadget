"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, string> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const supabase = createClient();

        // Get session via getSession (cookie-based)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        setDebugInfo(`session=${!!sessionData?.session}, error=${sessionError?.message || "none"}`);

        if (cancelled) return;

        if (!sessionData?.session) {
          window.location.href = "/login?redirect=/account/profile";
          return;
        }

        setUser(sessionData.session.user);
      } catch (err: any) {
        console.error("Auth check error:", err);
        setDebugInfo(`exception=${err.message}`);
        if (!cancelled) {
          window.location.href = "/login?redirect=/account/profile";
        }
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    }

    // Timeout fallback — prevent infinite loading
    const timer = setTimeout(() => {
      if (!cancelled) {
        window.location.href = "/login?redirect=/account/profile";
      }
    }, 10000);

    checkAuth();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-electric/20 border-t-electric rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal/40 text-sm mb-2">Loading profile...</p>
          <p className="text-charcoal/20 text-xs font-mono">{debugInfo}</p>
        </div>
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
        {/* Debug info */}
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-mono text-amber-600">
          Session active: {user.id}<br />
          Email: {user.email}
        </div>

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
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Authentication failed");

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-space px-4 py-12">
      {/* Ambient background orbs */}
      <div className="orb orb-gold" style={{ width: "400px", height: "400px", top: "10%", left: "-10%" }} />
      <div className="orb orb-electric" style={{ width: "300px", height: "300px", bottom: "10%", right: "-5%" }} />

      {/* Card */}
      <div className="relative w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-2xl font-bold text-fog">
            Admin Portal
          </h1>
          <p className="text-fog-muted text-sm mt-1">
            Authentic Gadget — Admin Access
          </p>
        </div>

        {/* Form card */}
        <div className="bg-navy/80 backdrop-blur-xl border border-gold/10 rounded-3xl p-8 shadow-layers">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-electric" />
            </div>
            <div>
              <h2 className="font-bold text-fog text-lg">Sign In</h2>
              <p className="text-fog-muted text-xs">Enter your admin credentials</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fog-muted mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/5 border border-white/10 text-fog text-sm placeholder:text-fog/20 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-fog/40 hover:text-fog/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 bg-gold text-midnight font-bold rounded-2xl hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 pulse-glow-gold"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to store */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-fog/40 hover:text-gold transition-colors flex items-center justify-center gap-1"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
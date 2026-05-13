"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Suspense } from "react";

type Mode = "password" | "otp";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminMode = searchParams.get("admin") === "true";
  const redirectTo = searchParams.get("redirect") || "/admin/dashboard";
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Redirect to the page they came from, or home
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
      router.refresh();
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-electric/10 mb-4">
            {isAdminMode ? <Lock className="w-7 h-7 text-electric" /> : <ShieldCheck className="w-7 h-7 text-electric" />}
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            {isAdminMode ? "Admin Access" : "Welcome Back"}
          </h1>
          <p className="text-charcoal/50 text-sm mt-1">
            {isAdminMode
              ? "Sign in to the admin panel"
              : "Sign in to your Authentic Gadget account"}
          </p>
        </div>

        {/* Mode toggle — hide in admin mode */}
        {!isAdminMode && (
          <div className="flex bg-fog rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode("password"); setError(""); setOtpSent(false); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
                mode === "password"
                  ? "bg-white text-charcoal shadow-sm"
                  : "text-charcoal/50"
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => { setMode("otp"); setError(""); setOtpSent(false); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
                mode === "otp"
                  ? "bg-white text-charcoal shadow-sm"
                  : "text-charcoal/50"
              }`}
            >
              OTP Login
            </button>
          </div>
        )}

        {isAdminMode ? (
          /* Admin password-only login */
          <form onSubmit={async (e) => {
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
              router.push(redirectTo);
              router.refresh();
            } catch (err: any) {
              setError(err.message || "Authentication failed");
            } finally {
              setLoading(false);
            }
          }}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal mb-1.5">Admin Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Access Admin Panel"}
            </button>
          </form>
        ) : (
          /* Regular user login — email/password or OTP */
          <>
            {/* Email field — shown in both modes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent transition-all"
              />
            </div>

            {mode === "password" ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end mb-6">
                  <Link
                    href="/(auth)/forgot-password"
                    className="text-sm text-electric font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className="w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </>
            ) : (
              <>
                {otpSent ? (
                  <>
                    <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
                      OTP sent to {email}. Check your inbox.
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-charcoal mb-1.5">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm text-center tracking-[0.5em] placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length < 6}
                      className="w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button
                      onClick={() => { setOtpSent(false); setOtp(""); }}
                      className="w-full mt-3 py-3 text-sm text-electric font-medium hover:underline"
                    >
                      Didn't get it? Resend
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    disabled={loading || !email}
                    className="w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {!isAdminMode && (
        <p className="text-center text-sm text-charcoal/50 mt-6">
          Don't have an account?{" "}
          <Link
            href="/(auth)/register"
            className="text-electric font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      )}

      {isAdminMode && (
        <p className="text-center text-sm text-charcoal/50 mt-6">
          <Link href="/" className="text-electric font-medium hover:underline">
            ← Back to store
          </Link>
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-fog flex items-center justify-center"><p className="text-charcoal/50">Loading...</p></div>}>
      <LoginPageInner />
    </Suspense>
  );
}

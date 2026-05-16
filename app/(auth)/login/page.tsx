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

    // Send 6-digit OTP to email (not a magic link)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { email: { singleLink: false } },
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
                    href="/forgot-password"
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

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-fog-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-fog text-charcoal/40">or continue with</span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: { redirectTo: `${window.location.origin}/auth/callback` },
                    });
                    if (error) {
                      setError(error.message);
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full py-4 bg-white border-2 border-fog-200 text-charcoal font-semibold rounded-2xl hover:border-electric hover:text-electric transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
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
            href="/register"
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Check } from "lucide-react";
import { createClient } from "@/lib/supabase";

const metadata = {
  title: "Create Account | Authentic Gadget",
  description: "Join Authentic Gadget — create your account and shop authentic tech in Ghana.",
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();

  const passwordStrong = password.length >= 8;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordStrong) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    // Sign up with email (creates unverified user)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Send OTP for phone verification if provided
    if (phone) {
      await supabase.auth.signInWithOtp({
        phone,
        options: { channel: "sms" },
      });
    }

    setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (otp.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-card p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-electric/10 mb-4">
            <ShieldCheck className="w-7 h-7 text-electric" />
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            Create Account
          </h1>
          <p className="text-charcoal/50 text-sm mt-1">
            Join Authentic Gadget — get exclusive deals
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {otpSent ? (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
              OTP sent to {email}. Check your inbox to verify.
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
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(""); }}
              className="w-full mt-3 py-3 text-sm text-electric font-medium hover:underline"
            >
              Didn't get it? Resend OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent transition-all"
              />
            </div>

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

            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Phone Number <span className="text-charcoal/30 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 200 000 000"
                className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent transition-all"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Check className={`w-3.5 h-3.5 ${passwordStrong ? "text-green-500" : "text-charcoal/20"}`} />
                    <span className={passwordStrong ? "text-green-600" : "text-charcoal/30"}>At least 8 characters</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent transition-all"
              />
              {confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Check className={`w-3.5 h-3.5 ${passwordsMatch ? "text-green-500" : "text-charcoal/20"}`} />
                  <span className={passwordsMatch ? "text-green-600" : "text-red-500"}>
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-charcoal/50 mt-6">
        Already have an account?{" "}
        <Link href="/(auth)/login" className="text-electric font-semibold hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-charcoal/30 mt-4">
        By creating an account, you agree to our{" "}
        <Link href="/terms-of-service" className="hover:text-electric">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="hover:text-electric">Privacy Policy</Link>
      </p>
    </div>
  );
}

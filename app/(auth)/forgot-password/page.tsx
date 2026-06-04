"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter your email address");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/account/profile` }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="w-full min-w-0 max-w-md">
      <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-electric/10">
            {sent ? (
              <MailCheck className="h-7 w-7 text-green-600" />
            ) : (
              <ShieldCheck className="h-7 w-7 text-electric" />
            )}
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-charcoal">
            {sent ? "Check your email" : "Reset your password"}
          </h1>
          <p className="mt-2 text-sm text-charcoal/50">
            {sent
              ? "We sent a password reset link if an account exists for that email."
              : "Enter your account email and we will send a reset link."}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <label className="block text-sm font-medium text-charcoal">
              Email Address
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-fog-200 bg-fog px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-electric"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-electric py-4 font-semibold text-white transition-colors hover:bg-electric/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-semibold text-electric hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const linkError = searchParams.get("error");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState(
    linkError || !token ? "This password reset link is invalid or has expired." : ""
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);

    if (resetError) {
      setError(resetError.message || "Unable to reset the password");
      return;
    }

    setComplete(true);
  };

  return (
    <div className="w-full min-w-0 max-w-md">
      <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-electric/10">
            <ShieldCheck className="h-7 w-7 text-electric" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-charcoal">
            {complete ? "Password updated" : "Choose a new password"}
          </h1>
          <p className="mt-2 text-sm text-charcoal/50">
            {complete
              ? "Your new password is ready to use."
              : "Use at least 8 characters for your new password."}
          </p>
        </div>

        {complete ? (
          <Link
            href="/login"
            className="mt-6 block w-full rounded-2xl bg-electric py-4 text-center font-semibold text-white transition-colors hover:bg-electric/90"
          >
            Sign in
          </Link>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <label className="block text-sm font-medium text-charcoal">
              New Password
              <span className="relative mt-1.5 block">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-fog-200 bg-fog px-4 py-3 pr-12 text-sm text-charcoal focus:border-transparent focus:outline-none focus:ring-2 focus:ring-electric"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </span>
            </label>
            <label className="block text-sm font-medium text-charcoal">
              Confirm Password
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-fog-200 bg-fog px-4 py-3 text-sm text-charcoal focus:border-transparent focus:outline-none focus:ring-2 focus:ring-electric"
              />
            </label>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-2xl bg-electric py-4 font-semibold text-white transition-colors hover:bg-electric/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

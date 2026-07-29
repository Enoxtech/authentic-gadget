"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import ThemeLogo from "@/components/ui/ThemeLogo";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message || "Login failed.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  const fieldClass =
    "w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display";

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="h-16 w-16 rounded-[22px] bg-[var(--surface-raised)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-3">
          <ThemeLogo className="h-[38px] w-[38px]" priority />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">My Account</h1>
        <p className="text-sm text-[var(--text-muted)] font-display mt-1">Sign in to view your orders and profile</p>
      </div>

      <div className="p-6 rounded-[28px] glass border border-[var(--border-color)]">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-display">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={fieldClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)]">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-electric hover:opacity-75 font-display">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className={`${fieldClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[44px] bg-electric text-white text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <p className="text-center mt-5 text-sm text-[var(--text-muted)] font-display">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-electric hover:opacity-75">
          Create one
        </Link>
      </p>
      <p className="text-center mt-2 text-sm text-[var(--text-muted)] font-display">
        <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">
          Back to store
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

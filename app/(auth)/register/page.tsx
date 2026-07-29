"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, MailCheck, UserPlus } from "lucide-react";
import ThemeLogo from "@/components/ui/ThemeLogo";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }

    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      setError("Password must be at least 8 characters and include a letter and number.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await authClient.signUp.email({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      callbackURL: "/account",
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || "Unable to create account.");
      return;
    }

    setConfirmationSent(true);
  }

  const fieldClass =
    "w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display";
  const labelClass = "block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5";

  if (confirmationSent) {
    return (
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
        <div className="h-16 w-16 rounded-[22px] bg-[var(--surface-raised)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-3">
            <ThemeLogo className="h-[38px] w-[38px]" priority />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">Check your email</h1>
          <p className="text-sm text-[var(--text-muted)] font-display mt-1">
            We sent a confirmation link to {form.email}.
          </p>
        </div>

        <div className="p-6 rounded-[28px] glass border border-[var(--border-color)] text-center">
          <MailCheck className="h-10 w-10 mx-auto mb-3 text-green-600" />
          <p className="text-sm text-[var(--text-secondary)] font-display">
            Confirm your email, then sign in to track your orders and profile.
          </p>
          <Link
            href="/login"
            className="mt-5 flex items-center justify-center py-3 rounded-[44px] bg-electric text-white text-sm font-bold font-display transition-all hover:opacity-90"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="h-16 w-16 rounded-[22px] bg-[var(--surface-raised)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-3">
          <ThemeLogo className="h-[38px] w-[38px]" priority />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">Create an Account</h1>
        <p className="text-sm text-[var(--text-muted)] font-display mt-1">Track orders and check out faster</p>
      </div>

      <div className="p-6 rounded-[28px] glass border border-[var(--border-color)]">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-display">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              required
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Kwame Mensah"
              autoComplete="name"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="+233 24 000 0000"
              autoComplete="tel"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
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
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-display">
              Must include at least one letter and one number.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[44px] bg-electric text-white text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>

      <p className="text-center mt-5 text-sm text-[var(--text-muted)] font-display">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-electric hover:opacity-75">
          Sign in
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

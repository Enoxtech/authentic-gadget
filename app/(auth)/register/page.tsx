"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, MailCheck, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [error, setError] = useState("");

  const passwordStrong =
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }
    if (!passwordStrong) {
      setError("Password must be at least 8 characters and include a letter and number");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim() || undefined,
      callbackURL: "/account",
    });

    if (signUpError) {
      setError(signUpError.message || "Unable to create account");
      setLoading(false);
      return;
    }

    setConfirmationSent(true);
    setLoading(false);
  };

  if (confirmationSent) {
    return (
      <div className="w-full min-w-0 max-w-md">
        <div className="bg-white rounded-3xl shadow-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 mb-4">
            <MailCheck className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            Check your email
          </h1>
          <p className="text-charcoal/50 text-sm mt-2">
            We sent a confirmation link to <strong>{email}</strong>. Confirm it
            to finish creating your account.
          </p>
          <Link
            href="/login"
            className="mt-6 block w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-md">
      <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-electric/10 mb-4">
            <ShieldCheck className="w-7 h-7 text-electric" />
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            Create Account
          </h1>
          <p className="text-charcoal/50 text-sm mt-1">
            Join Authentic Gadget and track your orders
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-charcoal">
            Full Name
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="John Doe"
              className="mt-1.5 w-full min-w-0 px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent"
            />
          </label>

          <label className="block text-sm font-medium text-charcoal">
            Email Address
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full min-w-0 px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent"
            />
          </label>

          <label className="block text-sm font-medium text-charcoal">
            Phone Number{" "}
            <span className="text-charcoal/30 font-normal">(optional)</span>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+233 200 000 000"
              className="mt-1.5 w-full min-w-0 px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent"
            />
          </label>

          <label className="block text-sm font-medium text-charcoal">
            Password
            <span className="relative mt-1.5 block">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Min. 8 characters"
                className="w-full min-w-0 px-4 py-3 pr-12 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
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
              placeholder="Repeat password"
              className="mt-1.5 w-full min-w-0 px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent"
            />
          </label>

          {(password || confirmPassword) && (
            <div className="space-y-1 text-xs">
              <p className={passwordStrong ? "text-green-600" : "text-charcoal/40"}>
                <Check className="inline w-3.5 h-3.5 mr-1" />
                At least 8 characters with a letter and number
              </p>
              <p className={passwordsMatch ? "text-green-600" : "text-charcoal/40"}>
                <Check className="inline w-3.5 h-3.5 mr-1" />
                Passwords match
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-fog-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-charcoal/40">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            setError("");
            const { error: oauthError } = await authClient.signIn.social({
              provider: "google",
              callbackURL: "/account",
            });
            if (oauthError) {
              setError(oauthError.message || "Unable to start Google sign in");
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full py-4 bg-white border-2 border-fog-200 text-charcoal font-semibold rounded-2xl hover:border-electric hover:text-electric transition-all disabled:opacity-60"
        >
          Continue with Google
        </button>
      </div>

      <p className="text-center text-sm text-charcoal/50 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-electric font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

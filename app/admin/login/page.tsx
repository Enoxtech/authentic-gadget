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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #040820 0%, #06112B 50%, #030618 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,67,0.15) 0%, transparent 70%)",
          top: "-100px",
          left: "-150px",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          bottom: "-80px",
          right: "-100px",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Login card */}
      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(212,168,67,0.1)",
              border: "1px solid rgba(212,168,67,0.2)",
              marginBottom: "16px",
            }}
          >
            <ShieldCheck size={32} color="#D4A843" />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-playfair, Georgia, serif)",
              fontSize: "28px",
              fontWeight: "700",
              color: "#F0EDE6",
              margin: "0 0 6px",
            }}
          >
            Admin Portal
          </h1>
          <p style={{ color: "#C0B8A9", fontSize: "14px", margin: 0 }}>
            Authentic Gadget — Admin Access
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: "rgba(6,17,43,0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(201,169,110,0.12)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 40px rgba(212,168,67,0.05)",
          }}
        >
          {/* Form header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(59,130,246,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={20} color="#3B82F6" />
            </div>
            <div>
              <h2 style={{ fontWeight: "700", fontSize: "18px", color: "#F0EDE6", margin: 0 }}>Sign In</h2>
              <p style={{ color: "#C0B8A9", fontSize: "12px", margin: "2px 0 0" }}>Enter your admin credentials</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#FCA5A5",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#EF4444",
                  flexShrink: 0,
                }}
              />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#C0B8A9",
                  marginBottom: "8px",
                }}
              >
                Admin Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  style={{
                    width: "100%",
                    padding: "14px 48px 14px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#F0EDE6",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(212,168,67,0.4)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(212,168,67,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#C0B8A9",
                    padding: "4px",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #D4A843 0%, #C9A96E 100%)",
                color: "#030618",
                fontWeight: "700",
                fontSize: "15px",
                cursor: loading || !password ? "not-allowed" : "pointer",
                opacity: loading || !password ? "0.5" : "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
                boxShadow: "0 4px 20px rgba(212,168,67,0.25)",
              }}
              onMouseEnter={(e) => {
                if (!loading && password) e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(3,6,24,0.3)",
                      borderTopColor: "#030618",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <LayoutDashboard size={16} />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to store */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            href="/"
            style={{
              color: "rgba(240,237,230,0.4)",
              fontSize: "14px",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            ← Back to store
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
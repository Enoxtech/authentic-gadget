"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

interface ExitIntentModalProps {
  onClose: () => void;
}

export default function ExitIntentModal({ onClose }: ExitIntentModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let triggered = false;

    const handler = (e: MouseEvent) => {
      if (e.clientY < 5 && !triggered) {
        triggered = true;
        // Modal shows automatically since parent controls visibility via showExitModal
      }
    };

    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative max-w-md w-full rounded-3xl p-8 text-center"
        style={{
          background: "linear-gradient(135deg, #1a0a2e 0%, #0a1628 100%)",
          border: "1px solid rgba(167,139,250,0.3)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/40" />
        </button>

        <div className="text-5xl mb-4">🎁</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Wait! Don&apos;t leave empty-handed
        </h2>
        <p className="text-white/60 mb-6">
          Get <strong style={{ color: "#a78bfa" }}>10% OFF</strong> your first
          order — use code at checkout:
        </p>

        <div className="mb-6">
          <div
            className="inline-block px-6 py-3 rounded-xl"
            style={{
              background: "rgba(124,58,237,0.2)",
              border: "2px dashed rgba(167,139,250,0.4)",
            }}
          >
            <span
              className="text-2xl font-bold tracking-widest"
              style={{ color: "#a78bfa" }}
            >
              WELCOME10
            </span>
          </div>
        </div>

        <Link
          href="/products"
          onClick={handleClose}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          }}
        >
          Shop Now & Save 10% →
        </Link>

        <p className="text-xs text-white/30 mt-4">No minimum spend · Limited time only</p>
      </div>
    </div>
  );
}
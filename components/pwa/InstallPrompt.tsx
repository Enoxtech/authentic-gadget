"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Download, Wifi, Zap, Smartphone, Share, SquarePlus } from "lucide-react";

const DISMISS_KEY = "agadget-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as "Macintosh" with touch support — catch that too
  const isIpadOsDesktopUa = ua.includes("Macintosh") && navigator.maxTouchPoints > 1;
  return isAppleMobile || isIpadOsDesktopUa;
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      if (localStorage.getItem(DISMISS_KEY)) { setDismissed(true); return; }
      if (isStandaloneDisplay()) return;

      // Safari on iOS/iPadOS never fires beforeinstallprompt — show manual steps instead
      if (isIosDevice()) {
        setIsIos(true);
        setTimeout(() => setVisible(true), 3500);
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (isIosDevice()) return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3500);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(() => setDismissed(true), 400);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function install() {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  if ((!deferredEvent && !isIos) || dismissed || !visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 animate-fade-in"
        onClick={dismiss}
        aria-hidden="true"
        style={{ backdropFilter: "blur(2px)" }}
      />

      {/* Sheet — slides up from bottom on mobile, floats centered on desktop */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[101] animate-slide-up sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:rounded-[28px] rounded-t-[28px]"
        style={{ background: "var(--bg)", boxShadow: "0 -12px 60px rgba(0,0,0,0.25), 0 0 0 1px var(--border-color)" }}
        role="dialog"
        aria-label="Install app"
      >
        {/* Drag handle pill — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: "var(--border-strong)" }} />
        </div>

        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "var(--surface)" }}
        >
          <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        </button>

        <div className="px-6 pb-6 pt-4 flex flex-col items-center text-center gap-4">
          <div className="relative h-20 w-20 rounded-[22px] shadow-lg overflow-hidden">
            <Image src="/icons/icon-192.png" alt="" fill className="object-cover" />
          </div>

          <div>
            <p className="text-lg font-bold font-display text-fog">Install Authentic Gadget</p>
            <p className="text-sm mt-1 text-fog-muted">
              Add to your home screen for a faster, app-like shopping experience.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {[
              { Icon: Wifi, label: "Works offline" },
              { Icon: Zap, label: "Lightning fast" },
              { Icon: Smartphone, label: "No app store" },
            ].map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold font-label bg-[var(--surface)] text-fog-muted"
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2 w-full">
            {isIos ? (
              <div className="w-full rounded-[14px] py-3.5 px-4 text-left flex flex-col gap-2.5 bg-[var(--surface)]">
                <p className="flex items-center gap-2.5 text-sm text-fog">
                  <span className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold text-[#040820]" style={{ background: "var(--gold)" }}>1</span>
                  Tap <Share className="h-4 w-4 inline shrink-0 text-gold" /> Share in Safari&apos;s toolbar
                </p>
                <p className="flex items-center gap-2.5 text-sm text-fog">
                  <span className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold text-[#040820]" style={{ background: "var(--gold)" }}>2</span>
                  Scroll down and tap <SquarePlus className="h-4 w-4 inline shrink-0 text-gold" /> &quot;Add to Home Screen&quot;
                </p>
              </div>
            ) : (
              <button
                onClick={install}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[14px] font-bold text-sm text-[#040820] transition-all hover:opacity-90 active:scale-95"
                style={{ background: "var(--gold)" }}
              >
                <Download className="h-4 w-4" />
                Add to Home Screen
              </button>
            )}
            <button onClick={dismiss} className="w-full py-3 rounded-[14px] text-sm text-fog-muted transition-colors">
              {isIos ? "Got It" : "Maybe Later"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

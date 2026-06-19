import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ background: "#040820" }}>
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "rgba(212,168,67,0.12)" }}
      >
        <WifiOff className="h-7 w-7" style={{ color: "#D4A843" }} />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-fog">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-fog-muted">
        Authentic Gadget needs an internet connection to load products and prices. Reconnect and try again.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl px-6 py-3 text-sm font-bold text-[#040820]"
        style={{ background: "var(--gold)" }}
      >
        Retry
      </Link>
    </main>
  );
}

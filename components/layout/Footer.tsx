import Link from "next/link";
import { ShieldCheck, Truck, Star, RotateCcw, Globe, AtSign, Video, MessageCircle } from "lucide-react";

const features = [
  { Icon: ShieldCheck, title: "100% Authentic", desc: "Every product verified before it ships" },
  { Icon: Truck, title: "Fast delivery across Ghana", desc: "Same-day delivery in Accra" },
  { Icon: Star, title: "Premium gadgets, fair prices", desc: "Curated, quality-checked inventory" },
  { Icon: RotateCcw, title: "Easy returns", desc: "14-day return policy on eligible items" },
];

const socialLinks = [
  { Icon: Globe, href: "#", label: "Facebook" },
  { Icon: AtSign, href: "#", label: "Instagram" },
  { Icon: Video, href: "#", label: "Twitter" },
  { Icon: MessageCircle, href: "#", label: "WhatsApp" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] mt-16 pb-20 lg:pb-0" style={{ background: "var(--bg-offset)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="shrink-0 h-9 w-9 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center">
              <Icon className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)] font-display leading-tight">{title}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 font-display leading-tight">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border-color)]" />

      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--text-secondary)] font-display">Follow:</span>
          <div className="flex items-center gap-2">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="h-8 w-8 rounded-full bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-gold hover:border-[var(--border-strong)] transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs font-semibold text-[var(--text-secondary)] font-display">Our Apps:</span>
          <div className="flex items-center gap-2">
            <a href="#" className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-3 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5">
              <span className="text-sm">A</span>
              App Store
            </a>
            <a href="#" className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-3 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5">
              <span className="text-sm">&gt;</span>
              Google Play
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-color)]" />

      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-muted)] font-display">
          (c) {new Date().getFullYear()} <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Authentic Gadget</Link>. All Rights Reserved.
        </p>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[11px] font-bold" style={{ background: "#FFCC08", color: "#000" }}>
            MTN MoMo
          </span>
          <span className="relative inline-flex h-5 w-8">
            <span className="absolute left-0 h-5 w-5 rounded-full bg-[#EB001B]" />
            <span className="absolute right-0 h-5 w-5 rounded-full bg-[#F79E1B] mix-blend-multiply" />
          </span>
          <span className="text-xs font-bold font-label tracking-tight" style={{ color: "#1434CB" }}>VISA</span>
          <span className="text-xs font-bold font-label tracking-tight" style={{ color: "#0070BA" }}>PayPal</span>
        </div>
      </div>

      <div className="border-t border-[var(--border-color)]" />

      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-center gap-8">
        <Link href="/privacy" className="text-xs text-[var(--text-muted)] hover:text-gold transition-colors font-display">
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-xs text-[var(--text-muted)] hover:text-gold transition-colors font-display">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}

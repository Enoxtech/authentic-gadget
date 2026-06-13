import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, Globe, AtSign, Video, MessageCircle } from "lucide-react";

const SHOP_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Smartphones", href: "/products?category=smartphones" },
  { label: "Laptops", href: "/products?category=laptops" },
  { label: "Audio", href: "/products?category=audio" },
  { label: "Wearables", href: "/products?category=wearables" },
  { label: "Gaming", href: "/products?category=gaming" },
  { label: "Accessories", href: "/products?category=accessories" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Track Order", href: "/track-order" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-[#030618] text-white border-t border-white/[0.06]">
      {/* Trust strip */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: "100% Authentic", desc: "Every product verified" },
            { icon: Truck, title: "Fast Delivery", desc: "Same-day in Accra" },
            { icon: RotateCcw, title: "Easy Returns", desc: "14-day return policy" },
            { icon: Phone, title: "24/7 Support", desc: "Always here to help" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-semibold text-sm text-fog">{title}</p>
                <p className="text-xs text-fog-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-3 mb-5">
            <Image
              src="/logo-white.png"
              alt="Authentic Gadget"
              width={120}
              height={36}
              className="theme-logo-dark h-8 w-auto object-contain"
            />
            <Image
              src="/logo-dark.png"
              alt="Authentic Gadget"
              width={120}
              height={36}
              className="theme-logo-light h-8 w-auto object-contain"
            />
          </Link>
          <p className="text-fog-muted text-sm leading-relaxed mb-6 max-w-xs">
            Ghana&apos;s most trusted destination for premium gadgets. 100% authentic products with fast delivery.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: Globe, label: "Facebook" },
              { icon: AtSign, label: "Instagram" },
              { icon: Video, label: "Twitter" },
              { icon: MessageCircle, label: "WhatsApp" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-fog-muted hover:text-gold hover:border-gold/20 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Shop</h3>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-fog-muted hover:text-gold transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Company</h3>
          <ul className="space-y-2.5">
            {COMPANY_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-fog-muted hover:text-gold transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-fog-muted">
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              +233 24 123 4567
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              hello@authenticgadget.com
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              Accra, Ghana
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-fog-muted">© 2025 Authentic Gadget. All rights reserved.</p>
          <p className="text-xs text-fog-muted">Built with ❤️ in Ghana 🇬🇭</p>
        </div>
      </div>
    </footer>
  );
}

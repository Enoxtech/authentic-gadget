import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  AtSign,
  Globe,
  Video,
  MessageCircle,
} from "lucide-react";

const SHOP_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Smartphones", href: "/categories/smartphones" },
  { label: "Laptops", href: "/categories/laptops" },
  { label: "Audio", href: "/categories/audio" },
  { label: "Wearables", href: "/categories/wearables" },
  { label: "Gaming", href: "/categories/gaming" },
  { label: "Accessories", href: "/categories/accessories" },
  { label: "Tablets & iPads", href: "/categories/tablets" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Track Order", href: "/track-order" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];

export default function Footer() {
  return (
    <footer className="bg-midnight text-white">
      {/* Trust strip */}
      <div className="border-b border-gold/10">
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
                <p className="font-semibold text-sm text-white">{title}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-3 mb-5">
            <Image
              src="/logo-dark.png"
              alt="Authentic Gadget"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs">
            Ghana&apos;s most trusted destination for premium gadgets. 100% authentic products with fast delivery across the country.
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
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/30 transition-all"
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
              <li key={href}>
                <Link href={href} className="text-sm text-white/45 hover:text-gold transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Company</h3>
          <ul className="space-y-2.5">
            {COMPANY_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-white/45 hover:text-gold transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Legal</h3>
          <ul className="space-y-2.5">
            {LEGAL_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-white/45 hover:text-gold transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2026 Authentic Gadget. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>Built by</span>
            <a
              href="https://www.linkedin.com/in/abubakar-abbas/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline font-medium"
            >
              Phinxtech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

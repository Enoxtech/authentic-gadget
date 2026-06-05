"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, Award, CheckCircle, ArrowRight } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  animTransition: { duration: 0.6, ease: "easeOut" },
};

const stagger = {
  animate: { animTransition: { staggerChildren: 0.15 } },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-space">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-electric/5 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Authentic <span className="text-electric">Gadget</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400">
              Ghana&apos;s Most Trusted Luxury Electronics Store
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 bg-dark-space">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUp}
            className="text-3xl font-bold text-white text-center mb-12"
          >
            Why Choose Us
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: ShieldCheck,
                title: "100% Authentic Products",
                desc: "Every product is guaranteed genuine with official sourcing",
              },
              {
                icon: Award,
                title: "Official Apple Authorized Reseller",
                desc: "Certified Apple partner ensuring full manufacturer support",
              },
              {
                icon: CheckCircle,
                title: "2-Year Warranty on All Devices",
                desc: "Extended warranty coverage for peace of mind",
              },
              {
                icon: MessageCircle,
                title: "Dedicated WhatsApp Support",
                desc: "Real humans, fast responses — we care about your experience",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="card-glossy-dark rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-electric/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-electric" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6 bg-glossy-dark">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold text-white text-center mb-10"
            >
              Our Story
            </motion.h2>
            <motion.div variants={fadeUp} className="card-glossy-dark rounded-2xl p-8">
              <p className="text-zinc-300 leading-relaxed mb-4">
                Since 2018, Authentic Gadget has been Ghana&apos;s premier destination for luxury electronics.
                What started as a passion for technology has grown into the nation&apos;s most trusted name
                in premium smartphones, tablets, laptops, and accessories.
              </p>
              <p className="text-zinc-300 leading-relaxed mb-4">
                We founded this business on a simple belief: <span className="text-white font-medium">Ghanaians deserve access to genuine
                tech products at fair prices</span>, with the customer service to match. In a market flooded
                with counterfeits and grey imports, we chose a different path — official sourcing,
                transparent pricing, and after-sales support that actually delivers.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                Today, we serve over 8,500 happy customers across Ghana, from Accra to Kumasi to Tamale.
                Whether you&apos;re buying your first smartphone or equipping an entire office, you can
                count on Authentic Gadget for the real thing.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-6 bg-dark-space border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "8,500+", label: "Happy Customers" },
              { value: "500+", label: "Products" },
              { value: "6 Years", label: "Of Trust" },
              { value: "24/7", label: "Support" },
            ].map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-electric mb-1">{value}</div>
                <div className="text-zinc-400 text-sm">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-dark-space">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                name: "Abubakar Abbas",
                role: "Founder & CEO",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
              },
              {
                name: "Emmanuel Asante",
                role: "Head of Operations",
                img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
              },
              {
                name: "Ama Serwaa",
                role: "Customer Care Lead",
                img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
              },
            ].map(({ name, role, img }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="card-glossy-dark rounded-2xl p-6 text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image src={img} alt={name} fill className="object-cover" sizes="96px" />
                </div>
                <h3 className="text-white font-semibold text-lg">{name}</h3>
                <p className="text-electric text-sm">{role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 px-6 bg-glossy-dark border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Certifications & Partnerships</h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              {
                label: "Apple Authorized",
                sub: "Reseller Program",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                ),
              },
              {
                label: "Samsung",
                sub: "Partner Store",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                    <path d="M6.7 2.83L1.83 11.5c-.61.54-.61 1.53 0 2.07l4.87 8.67c.61.54 1.61.54 2.21 0l4.87-8.67c.61-.54.61-1.53 0-2.07L11.07 2.83c-.61-.54-1.61-.54-2.21 0l-2.16 0z"/>
                  </svg>
                ),
              },
              {
                label: "2-Year",
                sub: "Warranty Coverage",
                icon: <ShieldCheck className="w-8 h-8 text-electric" />,
              },
              {
                label: "Verified",
                sub: "Authenticity Guaranteed",
                icon: <CheckCircle className="w-8 h-8 text-electric" />,
              },
            ].map(({ label, sub, icon }) => (
              <div
                key={label}
                className="card-glossy-dark rounded-2xl px-8 py-6 flex flex-col items-center gap-2 min-w-[160px]"
              >
                <div className="flex items-center justify-center">{icon}</div>
                <p className="text-white font-semibold">{label}</p>
                <p className="text-zinc-500 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-dark-space text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Next Device?
          </h2>
          <p className="text-zinc-400 mb-8">
            Browse our full collection of authentic electronics with official warranty.
          </p>
          <Link href="/products">
            <button className="btn-glossy-electric px-8 py-4 rounded-xl text-white font-semibold inline-flex items-center gap-2">
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 bg-dark-space text-center">
        <p className="text-zinc-500 text-sm mb-2">
          © {new Date().getFullYear()} Authentic Gadget — Ghana
        </p>
        <p className="text-zinc-600 text-xs">
          Built with care by{" "}
          <Link
            href="https://www.linkedin.com/in/abubakar-abbas/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-electric hover:underline"
          >
            Abubakar Abbas — Founder
          </Link>
        </p>
      </footer>
    </div>
  );
}

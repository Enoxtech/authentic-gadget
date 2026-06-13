"use client";

import { useState, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    badge: "🎮 New Arrival",
    badgeStyle: { background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" },
    headline: "Level Up Your Game",
    headlineGradient: "linear-gradient(135deg, #fff 0%, #a78bfa 100%)",
    subtext: "PlayStation 5 — the ultimate gaming experience. Authentic, warrantied, delivered fast.",
    price: "¢5,499",
    discount: "-15% OFF",
    ctaPrimary: { label: "Shop Now", href: "/products/playstation-5" },
    ctaSecondary: { label: "View Details", href: "/products/playstation-5" },
    bg: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1600",
    bgAlt: "Gaming setup",
    accentColor: "#4ade80",
  },
  {
    id: 2,
    badge: "💻 M3 Power",
    badgeStyle: { background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa" },
    headline: "Work At The Speed of Thought",
    headlineGradient: "linear-gradient(135deg, #fff 0%, #06b6d4 100%)",
    subtext: "MacBook Air with M3 chip. Fanless design. All-day battery. Built for professionals.",
    price: "¢8,999",
    discount: null,
    ctaPrimary: { label: "Explore MacBooks", href: "/products/macbook-air-m3" },
    ctaSecondary: { label: "Compare Models", href: "/products" },
    bg: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1600",
    bgAlt: "MacBook laptop",
    accentColor: "#06b6d4",
  },
  {
    id: 3,
    badge: "📱 Best Seller",
    badgeStyle: { background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#fbbf24" },
    headline: "Your Next Camera Is Already In Your Pocket",
    headlineGradient: "linear-gradient(135deg, #fff 0%, #f59e0b 100%)",
    subtext: "iPhone 15 Pro Max. A17 Pro chip. Titanium design. 200MP camera system that fits in your hand.",
    price: "¢12,499",
    discount: null,
    ctaPrimary: { label: "View iPhones", href: "/products/iphone-15-pro-max" },
    ctaSecondary: { label: "Trade In", href: "/products" },
    bg: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1600",
    bgAlt: "iPhone",
    accentColor: "#f59e0b",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => setTransitioning(false), 600);
  }, [transitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length);
  }, [current, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  return (
    <section
      className="hero-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`hero-slide ${i === current ? "active" : ""}`}
          aria-hidden={i !== current}
        >
          {/* Background */}
          <div
            className="hero-slide-bg"
            style={{ backgroundImage: `url(${slide.bg})` }}
          />
          <div className="hero-slide-overlay" />

          {/* Content */}
          <div className="hero-slide-content">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="hero-copy-panel w-full min-w-0 max-w-xl">
                {/* Badge */}
                <div className="hero-badge" style={slide.badgeStyle}>
                  {slide.badge}
                </div>

                {/* Headline */}
                <h1
                  className="hero-headline font-display leading-[1.05] break-words"
                  style={{
                    "--hero-accent": slide.accentColor,
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                    fontWeight: 800,
                  } as CSSProperties}
                >
                  {slide.headline}
                </h1>

                {/* Subtext */}
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-white/70 max-w-md break-words">
                  {slide.subtext}
                </p>

                {/* Price */}
                <div className="flex items-center gap-3 mt-5">
                  <span className="hero-slide-price">{slide.price}</span>
                  {slide.discount && (
                    <span className="hero-discount-tag">{slide.discount}</span>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Link
                    href={slide.ctaPrimary.href}
                    className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-sm font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${slide.accentColor === "#4ade80" ? "#22c55e" : slide.accentColor === "#06b6d4" ? "#06b6d4" : "#7c3aed"} 0%, ${slide.accentColor} 100%)`,
                      boxShadow: `0 8px 32px ${slide.accentColor}40`,
                    }}
                  >
                    {slide.ctaPrimary.label} →
                  </Link>
                  <Link
                    href={slide.ctaSecondary.href}
                    className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-all"
                  >
                    {slide.ctaSecondary.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrow navigation */}
      <button
        className="hero-slider-arrow prev"
        onClick={prev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        className="hero-slider-arrow next"
        onClick={next}
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="hero-slider-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-slider-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

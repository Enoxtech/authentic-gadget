"use client";

import { useEffect, useRef } from "react";

export default function Particles({ count = 30 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${8 + Math.random() * 12}s`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.width = `${2 + Math.random() * 3}px`;
      particle.style.height = particle.style.width;
      particle.style.opacity = String(0.2 + Math.random() * 0.5);
      if (Math.random() > 0.5) {
        particle.style.background = "rgba(232, 213, 183, 0.6)";
      } else {
        particle.style.background = "rgba(59, 130, 246, 0.5)";
      }
      container.appendChild(particle);
    }
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
}

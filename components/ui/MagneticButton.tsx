"use client";

import { useEffect, useRef, useState } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

export default function MagneticButton({
  children,
  className = "",
  href,
  onClick,
  type = "button",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 120;

      if (dist < maxDist) {
        const strength = (maxDist - dist) / maxDist;
        setPosition({ x: dx * strength * 0.35, y: dy * strength * 0.35 });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleLeave = () => {
      setPosition({ x: 0, y: 0 });
      setHovered(false);
    };

    window.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    el.addEventListener("mouseenter", () => setHovered(true));

    return () => {
      window.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
      el.removeEventListener("mouseenter", () => setHovered(false));
    };
  }, []);

  const style: React.CSSProperties = {
    display: "inline-flex",
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: hovered ? "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  const innerStyle: React.CSSProperties = {
    transition: "box-shadow 0.3s ease",
    boxShadow: hovered ? "0 0 28px rgba(232, 213, 183, 0.35), 0 8px 32px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.3)",
  };

  if (href) {
    return (
      <div ref={ref} style={style}>
        <a href={href} className={className} style={innerStyle}>
          {children}
        </a>
      </div>
    );
  }

  return (
    <div ref={ref} style={style}>
      <button type={type} onClick={onClick} className={className} style={innerStyle}>
        {children}
      </button>
    </div>
  );
}

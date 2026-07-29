"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ThemeLogoProps {
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function ThemeLogo({
  alt = "Authentic Gadget",
  className,
  priority = false,
  sizes = "40px",
}: ThemeLogoProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Image
        src="/logo-mark.png"
        alt={alt}
        fill
        sizes={sizes}
        className="theme-logo-light object-contain"
        priority={priority}
      />
      <Image
        src="/logo-white.png"
        alt=""
        fill
        sizes={sizes}
        className="theme-logo-dark object-contain"
        priority={priority}
        aria-hidden="true"
      />
    </span>
  );
}

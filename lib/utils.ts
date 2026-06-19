import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a numeric amount as Ghanaian Cedis, e.g. formatPrice(12499) -> "GHS 12,499" */
export function formatPrice(amount: number): string {
  return `GHS ${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Inline SVG data URI — used as a product image fallback so broken/unreachable
 *  photo URLs never fail under CSP (img-src only allows self/data/unsplash/supabase). */
export const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="%230B1E3D"/><text x="300" y="320" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="140" fill="%23D4A843" text-anchor="middle">AG</text></svg>';

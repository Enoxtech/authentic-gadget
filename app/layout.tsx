import type { Metadata } from "next";
import { poppins, playfair } from "@/lib/fonts";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Authentic Gadget | Home Of Luxury With Affordable Price",
    template: "%s | Authentic Gadget",
  },
  description:
    "Discover premium gadgets at unbeatable prices. Authentic products with fast delivery across Ghana.",
  keywords: [
    "gadgets",
    "electronics",
    "Ghana",
    "premium",
    "affordable",
    "smartphones",
    "laptops",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Authentic Gadget | Home Of Luxury With Affordable Price",
    description: "Premium gadgets, 100% authentic, fast delivery across Ghana.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${poppins.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

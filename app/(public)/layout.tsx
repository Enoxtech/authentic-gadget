import Script from "next/script";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/context/ToastContext";
import CartDrawer from "@/components/ui/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "Authentic Gadget | Authentic Tech Gadgets in Ghana",
    template: "%s | Authentic Gadget",
  },
  description: "Ghana's trusted store for authentic tech gadgets — consoles, laptops, phones, and accessories. Verified products, fast delivery.",
  openGraph: {
    type: "website",
    siteName: "Authentic Gadget",
    title: "Authentic Gadget | Authentic Tech Gadgets in Ghana",
    description: "Ghana's trusted store for authentic tech gadgets. Verified products with warranty.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Authentic Gadget | Authentic Tech Gadgets in Ghana",
    description: "Ghana's trusted store for authentic tech gadgets. Verified products with warranty.",
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="https://cdn.socket.io/4.8.1/socket.io.min.js" />
      <ToastProvider>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </ToastProvider>
    </>
  );
}

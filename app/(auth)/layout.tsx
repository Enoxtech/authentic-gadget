import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Sign In | Authentic Gadget",
  description: "Sign in to your Authentic Gadget account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-fog">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}

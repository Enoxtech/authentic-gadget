import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "My Account | Authentic Gadget",
  description: "Manage your profile, orders, and preferences.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-fog">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

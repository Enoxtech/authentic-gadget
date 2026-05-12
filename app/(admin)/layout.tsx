import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Authentic Gadget",
  description: "Manage products, orders, and analytics.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session");
    if (!adminSession) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/campaigns" className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center hover:bg-fog transition-colors">
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Create Campaign</h2>
          <p className="text-sm text-charcoal/50">Coming soon</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-12 text-center shadow-card">
        <div className="w-16 h-16 bg-electric/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-8 h-8 text-electric" />
        </div>
        <h3 className="text-xl font-bold text-charcoal mb-2">Coming Soon</h3>
        <p className="text-charcoal/50">Campaign creation will be available in a future update.</p>
      </div>
    </div>
  );
}
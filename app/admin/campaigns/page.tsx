"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, Plus, ArrowLeft } from "lucide-react";

export default function CampaignsPage() {
  const router = useRouter();

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Campaigns</h2>
          <p className="text-sm text-charcoal/50">Marketing campaigns</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-12 text-center shadow-card">
        <div className="w-16 h-16 bg-electric/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-8 h-8 text-electric" />
        </div>
        <h3 className="text-xl font-bold text-charcoal mb-2">Campaigns Coming Soon</h3>
        <p className="text-charcoal/50 mb-6 max-w-sm mx-auto">
          Create and manage marketing campaigns to promote your products and reach more customers across Ghana.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-electric/10 text-electric text-sm font-semibold rounded-xl hover:bg-electric/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        </div>
      </div>
    </div>
  );
}
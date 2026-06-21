import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const placementParam = request.nextUrl.searchParams.get("placement");
  const placement = placementParam === "promo" ? "promo" : "hero";

  try {
    const database = getSupabaseAdminClient();
    const { data, error } = await database
      .from("banners")
      .select("*")
      .eq("enabled", true)
      .eq("placement", placement)
      .order("sort_order", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Banners API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

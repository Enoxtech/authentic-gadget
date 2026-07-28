import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin", "support"]);
  if (error) return error;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json({ error: "Unable to load reviews" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug")?.trim();
    const database = getSupabaseAdminClient();
    const query = database
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (slug) {
      const { data, error } = await query.eq("slug", slug).maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      return NextResponse.json(data);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Products API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

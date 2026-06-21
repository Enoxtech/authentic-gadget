import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const database = getSupabaseAdminClient();
    const { data, error } = await database
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Categories API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

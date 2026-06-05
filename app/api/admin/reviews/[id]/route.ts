import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type ReviewContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, ctx: ReviewContext) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await ctx.params;
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin review DELETE error:", error);
    return NextResponse.json({ error: "Unable to delete review" }, { status: 500 });
  }
}

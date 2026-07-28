import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit-log";

type ReviewContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, ctx: ReviewContext) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "support"]);
  if (error) return error;

  try {
    const { id } = await ctx.params;
    const supabase = getSupabaseAdminClient();
    const { error: dbError } = await supabase.from("reviews").delete().eq("id", id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    await logAdminAction(request, session!, { action: "delete", entityType: "review", entityId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin review DELETE error:", error);
    return NextResponse.json({ error: "Unable to delete review" }, { status: 500 });
  }
}

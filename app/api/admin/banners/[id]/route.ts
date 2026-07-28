import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit-log";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const allowed = [
      "image", "headline", "subtitle", "price_label", "badge",
      "cta_label", "cta_href", "accent_color", "align", "transition",
      "placement", "enabled", "sort_order",
    ];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const supabase = getSupabaseAdminClient();
    const { data, error: dbError } = await supabase.from("banners").update(updates).eq("id", id).select("*").single();
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    await logAdminAction(request, session!, { action: "update", entityType: "banner", entityId: id });

    return NextResponse.json({ banner: data });
  } catch (error) {
    console.error("Admin banner PATCH error:", error);
    return NextResponse.json({ error: "Unable to update banner" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  try {
    const { id } = await params;
    const supabase = getSupabaseAdminClient();
    const { error: dbError } = await supabase.from("banners").delete().eq("id", id);
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    await logAdminAction(request, session!, { action: "delete", entityType: "banner", entityId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin banner DELETE error:", error);
    return NextResponse.json({ error: "Unable to delete banner" }, { status: 500 });
  }
}

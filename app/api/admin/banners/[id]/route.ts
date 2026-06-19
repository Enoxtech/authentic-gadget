import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

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
    const { data, error } = await supabase.from("banners").update(updates).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ banner: data });
  } catch (error) {
    console.error("Admin banner PATCH error:", error);
    return NextResponse.json({ error: "Unable to update banner" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin banner DELETE error:", error);
    return NextResponse.json({ error: "Unable to delete banner" }, { status: 500 });
  }
}

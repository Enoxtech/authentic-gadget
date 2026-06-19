import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    for (const key of ["name", "slug", "icon", "description"]) {
      if (key in body) updates[key] = body[key];
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ category: data });
  } catch (error) {
    console.error("Admin category PATCH error:", error);
    return NextResponse.json({ error: "Unable to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const supabase = getSupabaseAdminClient();

    const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (count && count > 0) {
      return NextResponse.json({ error: `Cannot delete: ${count} product(s) still use this category` }, { status: 409 });
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin category DELETE error:", error);
    return NextResponse.json({ error: "Unable to delete category" }, { status: 500 });
  }
}

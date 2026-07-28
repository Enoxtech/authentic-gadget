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
    const updates: Record<string, unknown> = {};
    for (const key of ["name", "slug", "icon", "description"]) {
      if (key in body) updates[key] = body[key];
    }

    const supabase = getSupabaseAdminClient();
    const { data, error: dbError } = await supabase.from("categories").update(updates).eq("id", id).select("*").single();
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    await logAdminAction(request, session!, { action: "update", entityType: "category", entityId: id });

    return NextResponse.json({ category: data });
  } catch (error) {
    console.error("Admin category PATCH error:", error);
    return NextResponse.json({ error: "Unable to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  try {
    const { id } = await params;
    const supabase = getSupabaseAdminClient();

    const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (count && count > 0) {
      return NextResponse.json({ error: `Cannot delete: ${count} product(s) still use this category` }, { status: 409 });
    }

    const { error: dbError } = await supabase.from("categories").delete().eq("id", id);
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    await logAdminAction(request, session!, { action: "delete", entityType: "category", entityId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin category DELETE error:", error);
    return NextResponse.json({ error: "Unable to delete category" }, { status: 500 });
  }
}

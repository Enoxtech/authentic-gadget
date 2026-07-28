import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit-log";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.active !== undefined) updates.active = Boolean(body.active);
  if (body.value !== undefined) updates.value = Number(body.value);
  if (body.min_order !== undefined) updates.min_order = body.min_order ? Number(body.min_order) : null;
  if (body.usage_limit !== undefined) updates.usage_limit = body.usage_limit ? Number(body.usage_limit) : null;
  if (body.expires_at !== undefined) updates.expires_at = body.expires_at || null;

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase.from("coupons").update(updates).eq("id", id).select("*").single();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAdminAction(request, session!, { action: "update", entityType: "coupon", entityId: id, metadata: updates });

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { error: dbError } = await supabase.from("coupons").delete().eq("id", id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAdminAction(request, session!, { action: "delete", entityType: "coupon", entityId: id });

  return NextResponse.json({ success: true });
}

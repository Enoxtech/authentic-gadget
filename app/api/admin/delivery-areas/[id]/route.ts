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

  if (body.name !== undefined) updates.name = body.name;
  if (body.fee !== undefined) updates.fee = Number(body.fee);
  if (body.estimated_days !== undefined) updates.estimated_days = body.estimated_days;
  if (body.enabled !== undefined) updates.enabled = Boolean(body.enabled);
  if (body.position !== undefined) updates.position = Number(body.position);

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase.from("delivery_areas").update(updates).eq("id", id).select("*").single();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAdminAction(request, session!, { action: "update", entityType: "delivery_area", entityId: id, metadata: updates });

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { error: dbError } = await supabase.from("delivery_areas").delete().eq("id", id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAdminAction(request, session!, { action: "delete", entityType: "delivery_area", entityId: id });

  return NextResponse.json({ success: true });
}

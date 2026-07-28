import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase
    .from("delivery_areas")
    .select("*")
    .order("position", { ascending: true });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  const body = (await request.json()) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Area name is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { count } = await supabase.from("delivery_areas").select("id", { count: "exact", head: true });

  const { data, error: dbError } = await supabase
    .from("delivery_areas")
    .insert({
      name,
      fee: Number(body.fee) || 0,
      estimated_days: typeof body.estimated_days === "string" ? body.estimated_days : null,
      enabled: true,
      position: count || 0,
    })
    .select("*")
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAdminAction(request, session!, {
    action: "create",
    entityType: "delivery_area",
    entityId: data.id,
    metadata: { name, fee: data.fee },
  });

  return NextResponse.json(data, { status: 201 });
}

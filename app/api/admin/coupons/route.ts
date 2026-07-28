import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit-log";

const TYPES = new Set(["percent", "fixed", "shipping"]);

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  const body = (await request.json()) as Record<string, unknown>;
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const type = typeof body.type === "string" && TYPES.has(body.type) ? body.type : "percent";

  if (!code) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }

  const value = type === "shipping" ? 0 : Number(body.value) || 0;
  if (type === "percent" && (value <= 0 || value > 100)) {
    return NextResponse.json({ error: "Percent value must be between 1 and 100" }, { status: 400 });
  }
  if (type === "fixed" && value <= 0) {
    return NextResponse.json({ error: "Fixed value must be greater than 0" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase
    .from("coupons")
    .insert({
      code,
      type,
      value,
      min_order: body.min_order ? Number(body.min_order) : null,
      usage_limit: body.usage_limit ? Number(body.usage_limit) : null,
      expires_at: body.expires_at || null,
      active: true,
    })
    .select("*")
    .single();

  if (dbError) {
    const message = dbError.code === "23505" ? "A coupon with that code already exists" : dbError.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await logAdminAction(request, session!, {
    action: "create",
    entityType: "coupon",
    entityId: data.id,
    metadata: { code, type, value },
  });

  return NextResponse.json(data, { status: 201 });
}

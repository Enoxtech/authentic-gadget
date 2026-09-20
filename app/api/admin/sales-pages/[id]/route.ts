import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/audit-log";
import { normalizeSalesPageConfig, parseSalesPagePayload } from "@/lib/sales-pages";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type Context = { params: Promise<{ id: string }> };
const ROLES = ["super_admin", "product_manager"] as const;

export async function GET(request: NextRequest, { params }: Context) {
  const { error } = await requireAdminRole(request, [...ROLES]);
  if (error) return error;
  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const [{ data: page, error: pageError }, { data: products, error: productsError }] = await Promise.all([
    supabase.from("sales_pages").select("*").eq("id", id).single(),
    supabase.from("products").select("id,name,slug,price,images,stock,is_active").eq("is_active", true).order("name"),
  ]);
  if (pageError || !page) return NextResponse.json({ error: "Sales page not found" }, { status: 404 });
  if (productsError) return NextResponse.json({ error: productsError.message }, { status: 500 });
  return NextResponse.json({ page: { ...page, config: normalizeSalesPageConfig(page.config) }, products: products || [] });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const { error, session } = await requireAdminRole(request, [...ROLES]);
  if (error) return error;
  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const parsed = parseSalesPagePayload(body, true);
  if (parsed.error || !parsed.payload) {
    return NextResponse.json({ error: parsed.error || "Invalid sales page" }, { status: 400 });
  }
  const updates = { ...parsed.payload, updated_at: new Date().toISOString() };
  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase
    .from("sales_pages")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  await logAdminAction(request, session!, { action: "update", entityType: "sales_page", entityId: id });
  return NextResponse.json({ page: data });
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { error, session } = await requireAdminRole(request, [...ROLES]);
  if (error) return error;
  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { error: dbError } = await supabase.from("sales_pages").delete().eq("id", id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  await logAdminAction(request, session!, { action: "delete", entityType: "sales_page", entityId: id });
  return NextResponse.json({ success: true });
}

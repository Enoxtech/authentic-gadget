import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/audit-log";
import { parseSalesPagePayload, salesPageSlug } from "@/lib/sales-pages";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const ROLES = ["super_admin", "product_manager"] as const;

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, [...ROLES]);
  if (error) return error;

  const supabase = getSupabaseAdminClient();
  const [{ data: pages, error: pagesError }, { data: products, error: productsError }] = await Promise.all([
    supabase
      .from("sales_pages")
      .select("*, product:products(id,name,slug,price,images,stock,is_active)")
      .order("updated_at", { ascending: false }),
    supabase
      .from("products")
      .select("id,name,slug,price,images,stock,is_active")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (pagesError || productsError) {
    return NextResponse.json({ error: pagesError?.message || productsError?.message }, { status: 500 });
  }
  return NextResponse.json({ pages: pages || [], products: products || [] });
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdminRole(request, [...ROLES]);
  if (error) return error;
  const body = (await request.json()) as Record<string, unknown>;
  const supabase = getSupabaseAdminClient();

  if (typeof body.duplicateFrom === "string" && body.duplicateFrom) {
    const { data: source, error: sourceError } = await supabase
      .from("sales_pages")
      .select("name,slug,product_id,meta_pixel_id,config")
      .eq("id", body.duplicateFrom)
      .single();
    if (sourceError || !source) return NextResponse.json({ error: "Sales page not found" }, { status: 404 });

    const suffix = Date.now().toString(36);
    const { data, error: dbError } = await supabase
      .from("sales_pages")
      .insert({
        name: `${source.name} Copy`,
        slug: `${salesPageSlug(source.slug)}-copy-${suffix}`,
        product_id: source.product_id,
        meta_pixel_id: source.meta_pixel_id,
        config: source.config,
        is_published: false,
      })
      .select("*")
      .single();
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
    await logAdminAction(request, session!, { action: "duplicate", entityType: "sales_page", entityId: data.id });
    return NextResponse.json({ page: data }, { status: 201 });
  }

  const parsed = parseSalesPagePayload(body);
  if (parsed.error || !parsed.payload) {
    return NextResponse.json({ error: parsed.error || "Invalid sales page" }, { status: 400 });
  }
  const { data, error: dbError } = await supabase
    .from("sales_pages")
    .insert(parsed.payload)
    .select("*")
    .single();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAdminAction(request, session!, {
    action: "create",
    entityType: "sales_page",
    entityId: data.id,
    metadata: { name: data.name, slug: data.slug },
  });
  return NextResponse.json({ page: data }, { status: 201 });
}

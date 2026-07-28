import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { parseProductPayload } from "@/lib/admin-products";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin", "support", "product_manager"]);
  if (error) return error;

  try {
    const supabase = getSupabaseAdminClient();
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("*").order("name", { ascending: true }),
      supabase.from("categories").select("id, name, slug").order("name", { ascending: true }),
    ]);

    if (productsRes.error) {
      return NextResponse.json({ error: productsRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      products: productsRes.data || [],
      categories: categoriesRes.data || [],
    });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json({ error: "Unable to load products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseProductPayload(body);
    if (parsed.error || !parsed.payload) {
      return NextResponse.json({ error: parsed.error || "Invalid product" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error: dbError } = await supabase
      .from("products")
      .insert(parsed.payload)
      .select("*")
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    await logAdminAction(request, session!, {
      action: "create",
      entityType: "product",
      entityId: data.id,
      metadata: { name: data.name },
    });

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("Admin products POST error:", error);
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}

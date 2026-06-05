import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { parseProductPayload } from "@/lib/admin-products";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type ProductContext = { params: Promise<{ id: string }> };

async function getProductId(ctx: ProductContext) {
  const { id } = await ctx.params;
  return id;
}

export async function GET(request: NextRequest, ctx: ProductContext) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const id = await getProductId(ctx);
    const supabase = getSupabaseAdminClient();
    const [productRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("categories").select("id, name, slug").order("name", { ascending: true }),
    ]);

    if (productRes.error) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      product: productRes.data,
      categories: categoriesRes.data || [],
    });
  } catch (error) {
    console.error("Admin product GET error:", error);
    return NextResponse.json({ error: "Unable to load product" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: ProductContext) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const id = await getProductId(ctx);
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseProductPayload(body, { partial: true });
    if (parsed.error || !parsed.payload) {
      return NextResponse.json({ error: parsed.error || "Invalid product" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("products")
      .update({ ...parsed.payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error("Admin product PATCH error:", error);
    return NextResponse.json({ error: "Unable to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: ProductContext) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const id = await getProductId(ctx);
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json({ error: "Unable to delete product" }, { status: 500 });
  }
}

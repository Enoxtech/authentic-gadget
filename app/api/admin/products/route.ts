import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { parseProductPayload } from "@/lib/admin-products";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

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
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseProductPayload(body);
    if (parsed.error || !parsed.payload) {
      return NextResponse.json({ error: parsed.error || "Invalid product" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("products")
      .insert(parsed.payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("Admin products POST error:", error);
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}

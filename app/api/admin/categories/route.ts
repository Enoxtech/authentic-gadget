import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit-log";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin", "support", "product_manager"]);
  if (error) return error;

  try {
    const supabase = getSupabaseAdminClient();
    const [categoriesRes, productsRes] = await Promise.all([
      supabase.from("categories").select("*").order("name", { ascending: true }),
      supabase.from("products").select("category_id"),
    ]);

    if (categoriesRes.error) {
      return NextResponse.json({ error: categoriesRes.error.message }, { status: 500 });
    }

    const counts = new Map<string, number>();
    for (const p of productsRes.data || []) {
      if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) || 0) + 1);
    }

    const categories = (categoriesRes.data || []).map((c) => ({ ...c, product_count: counts.get(c.id) || 0 }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ error: "Unable to load categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error: dbError } = await supabase
      .from("categories")
      .insert({
        name,
        slug: typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(name),
        icon: body.icon || null,
        description: body.description || null,
      })
      .select("*")
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    await logAdminAction(request, session!, {
      action: "create",
      entityType: "category",
      entityId: data.id,
      metadata: { name },
    });

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ error: "Unable to create category" }, { status: 500 });
  }
}

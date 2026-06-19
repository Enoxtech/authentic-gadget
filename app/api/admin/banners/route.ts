import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ banners: data || [] });
  } catch (error) {
    console.error("Admin banners GET error:", error);
    return NextResponse.json({ error: "Unable to load banners" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.image || !body.headline) {
      return NextResponse.json({ error: "Image and headline are required" }, { status: 400 });
    }

    const placement = body.placement === "promo" ? "promo" : "hero";
    const supabase = getSupabaseAdminClient();
    const { count } = await supabase
      .from("banners")
      .select("id", { count: "exact", head: true })
      .eq("placement", placement);

    const { data, error } = await supabase
      .from("banners")
      .insert({
        image: body.image,
        headline: body.headline,
        subtitle: body.subtitle || null,
        price_label: body.price_label || null,
        badge: body.badge || null,
        cta_label: body.cta_label || "Shop Now",
        cta_href: body.cta_href || "/products",
        accent_color: body.accent_color || "#19AFFF",
        align: body.align || "left",
        transition: body.transition || "fade",
        placement,
        enabled: body.enabled ?? true,
        sort_order: count || 0,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ banner: data }, { status: 201 });
  } catch (error) {
    console.error("Admin banners POST error:", error);
    return NextResponse.json({ error: "Unable to create banner" }, { status: 500 });
  }
}

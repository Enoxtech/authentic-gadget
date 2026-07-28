import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { code?: unknown; subtotal?: unknown };
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const subtotal = Number(body.subtotal) || 0;

  if (!code) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: coupon } = await supabase.from("coupons").select("*").eq("code", code).maybeSingle();

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }
  if (coupon.min_order && subtotal < coupon.min_order) {
    return NextResponse.json(
      { error: `This coupon requires a minimum order of GHS ${Number(coupon.min_order).toLocaleString()}` },
      { status: 400 }
    );
  }

  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round((subtotal * Number(coupon.value)) / 100 * 100) / 100;
  } else if (coupon.type === "fixed") {
    discount = Math.min(Number(coupon.value), subtotal);
  }

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    discount,
    freeShipping: coupon.type === "shipping",
  });
}

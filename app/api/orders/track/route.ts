import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId")?.trim();
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!orderId || !email) {
    return NextResponse.json(
      { error: "Order ID and email are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, total, payment_method, payment_status, order_status, shipping_city, shipping_region, created_at")
    .eq("id", orderId)
    .ilike("customer_email", email)
    .maybeSingle();

  if (error) {
    console.error("Track order lookup error:", error);
    return NextResponse.json({ error: "Unable to look up order" }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json(
      { error: "No order matched that ID and email" },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}

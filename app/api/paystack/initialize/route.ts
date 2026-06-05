import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "paystack-init", { max: 12, windowMs: 60_000 });
    if (limit.limited) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    const body = (await request.json()) as { orderId?: unknown };
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "Paystack is not configured on this server" },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_email, total, payment_status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!order.customer_email || Number(order.total) <= 0) {
      return NextResponse.json(
        { error: "Order is missing valid payment details" },
        { status: 400 }
      );
    }
    if (order.payment_status !== "pending") {
      return NextResponse.json(
        { error: "This order is not awaiting payment" },
        { status: 409 }
      );
    }

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, product_name, quantity")
      .eq("order_id", order.id);

    const origin = new URL(request.url).origin;
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(order.total) * 100),
        email: order.customer_email,
        reference: order.id,
        callback_url: `${origin}/order-success?order=${encodeURIComponent(order.id)}&total=${encodeURIComponent(String(order.total))}&method=card`,
        metadata: {
          orderId: order.id,
          products: orderItems || [],
        },
      }),
    });

    const data = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string; reference?: string };
    };

    if (!response.ok || !data.status || !data.data?.authorization_url) {
      return NextResponse.json(
        { error: data.message || "Payment initialization failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Paystack init error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const PROVIDER_NETWORK_MAP: Record<string, string> = {
  mtn: "MTN",
  vodafone: "VODAFONE",
  airteltigo: "TIGO",
};

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "flutterwave-momo-init", { max: 12, windowMs: 60_000 });
    if (limit.limited) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    const body = (await request.json()) as {
      orderId?: unknown;
      provider?: unknown;
    };
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const provider = typeof body.provider === "string" ? body.provider : "mtn";
    const network = PROVIDER_NETWORK_MAP[provider];

    if (!orderId || !network) {
      return NextResponse.json(
        { error: "A valid order and mobile money provider are required" },
        { status: 400 }
      );
    }

    const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveSecretKey) {
      return NextResponse.json(
        { error: "Flutterwave is not configured on this server" },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, customer_phone, total, payment_status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.payment_status !== "pending") {
      return NextResponse.json(
        { error: "This order is not awaiting payment" },
        { status: 409 }
      );
    }
    if (!order.customer_email || !order.customer_phone || Number(order.total) <= 0) {
      return NextResponse.json(
        { error: "Order is missing valid payment details" },
        { status: 400 }
      );
    }

    const txRef = `AG_${order.id}_${crypto.randomUUID().slice(0, 8)}`;
    const nameParts = (order.customer_name || "Customer").trim().split(/\s+/);
    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const payload = {
      tx_ref: txRef,
      amount: String(order.total),
      currency: "GHS",
      phone_number: order.customer_phone.replace(/\D/g, ""),
      email: order.customer_email,
      first_name: nameParts[0] || "Customer",
      last_name: nameParts.slice(1).join(" "),
      network,
      redirect_url: `${origin}/order-success?order=${encodeURIComponent(order.id)}&total=${encodeURIComponent(String(order.total))}&method=momo&provider=${provider}`,
      meta: {
        order_id: order.id,
        provider,
        source: "authentic_gadget_web",
      },
    };

    const response = await fetch("https://api.flutterwave.com/v3/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      status?: string;
      message?: string;
    };

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        { error: data.message || "Failed to initiate mobile money payment" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      txRef,
      note: "Payment request sent. Check your phone for the approval prompt.",
    });
  } catch (error) {
    console.error("Flutterwave MoMo error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

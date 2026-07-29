import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { decryptField, getSettings } from "@/lib/settings";

const DEFAULT_HUBTEL_REQUEST_MONEY_BASE_URL = "https://devp-reqsendmoney-230622-api.hubtel.com/v1";

function normalizeGhanaPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (/^233\d{9}$/.test(digits)) return `+${digits}`;
  if (/^0\d{9}$/.test(digits)) return `+233${digits.slice(1)}`;
  if (/^\d{9}$/.test(digits)) return `+233${digits}`;
  return "";
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "hubtel-momo-init", { max: 12, windowMs: 60_000 });
    if (limit.limited) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    const body = (await request.json()) as { orderId?: unknown };
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId) {
      return NextResponse.json({ error: "A valid order is required" }, { status: 400 });
    }

    const settings = await getSettings();
    const clientId = settings?.hubtel_client_id || process.env.HUBTEL_CLIENT_ID;
    const clientSecret = decryptField(settings?.hubtel_client_secret_enc ?? null) || process.env.HUBTEL_CLIENT_SECRET;
    const webhookSecret = decryptField(settings?.hubtel_webhook_secret_enc ?? null) || process.env.HUBTEL_WEBHOOK_SECRET;
    const baseUrl =
      settings?.hubtel_request_money_base_url ||
      process.env.HUBTEL_REQUEST_MONEY_BASE_URL ||
      DEFAULT_HUBTEL_REQUEST_MONEY_BASE_URL;

    if (!clientId || !clientSecret || !webhookSecret) {
      return NextResponse.json(
        { error: "Hubtel is not configured. Add Client ID, Client Secret, and Webhook Secret in admin settings." },
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
      return NextResponse.json({ error: "This order is not awaiting payment" }, { status: 409 });
    }
    if (!order.customer_phone || Number(order.total) <= 0) {
      return NextResponse.json({ error: "Order is missing valid payment details" }, { status: 400 });
    }

    const mobileNumber = normalizeGhanaPhone(order.customer_phone);
    if (!mobileNumber) {
      return NextResponse.json({ error: "Enter a valid Ghana mobile money number" }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const clientReference = `AG_${order.id}_${crypto.randomUUID().slice(0, 8)}`;
    const payload = {
      amount: Number(order.total),
      title: "Authentic Gadget order payment",
      description: `Payment for order ${order.id}`,
      clientReference,
      callbackUrl: `${origin}/api/hubtel/webhook?token=${encodeURIComponent(webhookSecret)}`,
      cancellationUrl: `${origin}/checkout?payment=cancelled&order=${encodeURIComponent(order.id)}`,
      returnUrl: `${origin}/order-success?order=${encodeURIComponent(order.id)}&total=${encodeURIComponent(String(order.total))}&method=momo&provider=hubtel`,
      logo: `${origin}/logo-mark.png`,
    };

    const response = await fetch(joinUrl(baseUrl, `/request-money/${encodeURIComponent(mobileNumber)}`), {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      code?: string;
      data?: { paylinkId?: string; clientReference?: string; paylinkUrl?: string; expiresAt?: number };
    };

    if (!response.ok || !data.data?.paylinkUrl) {
      return NextResponse.json(
        { error: data.message || "Failed to initiate Hubtel mobile money payment" },
        { status: 502 }
      );
    }

    await supabase
      .from("orders")
      .update({ payment_reference: data.data.clientReference || clientReference })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      txRef: data.data.clientReference || clientReference,
      paylinkId: data.data.paylinkId || null,
      redirectUrl: data.data.paylinkUrl,
      note: "Continue to Hubtel to complete mobile money payment.",
    });
  } catch (error) {
    console.error("Hubtel MoMo error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

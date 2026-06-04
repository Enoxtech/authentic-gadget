import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

interface FlutterwaveWebhook {
  event?: string;
  type?: string;
  data?: {
    id?: string | number;
    status?: string;
    amount?: number;
    currency?: string;
    tx_ref?: string;
    reference?: string;
    meta?: { order_id?: string };
  };
}

function signatureIsValid(request: Request, rawBody: string) {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
  if (!secretHash) return false;

  const signature = request.headers.get("flutterwave-signature");
  if (signature) {
    const expected = createHmac("sha256", secretHash)
      .update(rawBody)
      .digest("base64");
    return expected === signature;
  }

  return request.headers.get("verif-hash") === secretHash;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!signatureIsValid(request, rawBody)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as FlutterwaveWebhook;
    const eventType = payload.type || payload.event;
    const eventData = payload.data;
    const eventStatus = eventData?.status?.toLowerCase();

    if (
      eventType !== "charge.completed" ||
      !eventData?.id ||
      !["successful", "succeeded"].includes(eventStatus || "")
    ) {
      return NextResponse.json({ received: true });
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Flutterwave is not configured" }, { status: 503 });
    }

    const verificationResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(eventData.id))}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const verification = (await verificationResponse.json()) as {
      status?: string;
      data?: {
        status?: string;
        amount?: number;
        currency?: string;
        tx_ref?: string;
        meta?: { order_id?: string };
      };
    };

    const verified = verification.data;
    const orderId =
      verified?.meta?.order_id ||
      eventData.meta?.order_id;

    if (
      !verificationResponse.ok ||
      verification.status !== "success" ||
      verified?.status !== "successful" ||
      verified.currency !== "GHS" ||
      !orderId
    ) {
      return NextResponse.json({ error: "Transaction verification failed" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total")
      .eq("id", orderId)
      .single();

    if (orderError || !order || Number(verified.amount) !== Number(order.total)) {
      return NextResponse.json({ error: "Order verification failed" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_method: "flutterwave_momo",
        payment_reference: verified.tx_ref || eventData.tx_ref || eventData.reference || null,
        order_status: "processing",
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Flutterwave webhook update error:", updateError);
      return NextResponse.json({ error: "Unable to update order" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

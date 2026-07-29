import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { decryptField, getSettings } from "@/lib/settings";

interface HubtelReceiveMoneyWebhook {
  message?: string;
  responseCode?: string;
  data?: {
    paymentType?: string;
    status?: string;
    amount?: number;
    paylinkId?: string;
    phoneNumber?: string;
    clientReference?: string;
  };
}

function isPaidStatus(status: string | undefined, responseCode: string | undefined) {
  const normalized = (status || "").toLowerCase();
  return responseCode === "0000" || ["success", "successful", "paid", "completed"].includes(normalized);
}

function orderIdFromReference(reference: string) {
  const match = reference.match(/^(AG_\d+_[A-Za-z0-9_-]+)/);
  return match?.[1] || "";
}

export async function POST(request: NextRequest) {
  try {
    const settings = await getSettings();
    const expectedSecret = decryptField(settings?.hubtel_webhook_secret_enc ?? null) || process.env.HUBTEL_WEBHOOK_SECRET;
    const providedSecret = request.nextUrl.searchParams.get("token") || request.headers.get("x-hubtel-webhook-secret");

    if (!expectedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
    }

    const payload = (await request.json()) as HubtelReceiveMoneyWebhook;
    const data = payload.data;
    const clientReference = data?.clientReference || "";
    const orderId = orderIdFromReference(clientReference);

    if (!data || !orderId || !isPaidStatus(data.status, payload.responseCode)) {
      return NextResponse.json({ received: true });
    }

    const supabase = getSupabaseAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total")
      .eq("id", orderId)
      .single();

    if (orderError || !order || Number(data.amount) !== Number(order.total)) {
      return NextResponse.json({ error: "Order verification failed" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_method: "hubtel_momo",
        payment_reference: clientReference || data.paylinkId || null,
        order_status: "processing",
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Hubtel webhook update error:", updateError);
      return NextResponse.json({ error: "Unable to update order" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Hubtel webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

    // Verify webhook signature
    if (webhookSecret) {
      const crypto = require("crypto");
      const hash = crypto.createHmac("sha512", webhookSecret).update(body).digest("hex");
      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const supabase = createClient();

      // Update order payment status
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_method: event.data.channel,
          paystack_reference: reference,
        })
        .eq("id", reference);

      // Update order status to processing
      await supabase
        .from("orders")
        .update({ status: "processing" })
        .eq("id", reference);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

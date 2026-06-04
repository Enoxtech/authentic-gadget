import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey || !signature) {
      return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
    }

    const expectedSignature = createHmac("sha512", paystackSecretKey)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body) as {
      event?: string;
      data?: { reference?: string; channel?: string };
    };

    if (event.event === "charge.success" && event.data?.reference) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_method: event.data.channel || "paystack",
          payment_reference: event.data.reference,
          order_status: "processing",
        })
        .eq("id", event.data.reference);

      if (error) {
        console.error("Paystack webhook update error:", error);
        return NextResponse.json({ error: "Unable to update order" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

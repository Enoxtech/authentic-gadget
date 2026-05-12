import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { amount, email, orderId, products } = await request.json();

    if (!amount || !email || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/(public)/order-success`;

    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to kobo
        email,
        reference: orderId,
        callback_url: callbackUrl,
        metadata: {
          orderId,
          products: products?.map((p: any) => ({ id: p.id, name: p.name, qty: p.quantity })),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: 500 });
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

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { amount, email, orderId, products, customer_name, customer_phone, shipping_address, shipping_city, shipping_region, subtotal, shipping, total, payment_method } = await request.json();

    if (!amount || !email || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();

    // Save order to Supabase before initializing payment
    await supabase.from("orders").insert({
      id: orderId,
      customer_name: customer_name || email,
      customer_email: email,
      customer_phone: customer_phone || null,
      shipping_address: shipping_address || null,
      shipping_city: shipping_city || null,
      shipping_region: shipping_region || null,
      subtotal: subtotal || amount,
      shipping: shipping || 0,
      total: total || amount,
      payment_method: payment_method || "paystack",
      payment_status: "pending",
      order_status: "pending",
    });

    // Save order items
    if (products?.length) {
      const orderItems = products.map((p: any) => ({
        order_id: orderId,
        product_id: p.id || null,
        product_name: p.name,
        product_slug: p.slug || null,
        product_image: p.image || null,
        price: p.price,
        quantity: p.quantity || 1,
      }));
      await supabase.from("order_items").insert(orderItems);
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

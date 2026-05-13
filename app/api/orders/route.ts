import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_region,
      order_note,
      subtotal,
      shipping,
      total,
      payment_method,
      items,
    } = body;

    if (!id || !customer_name || !customer_email || !total || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();

    // Insert order
    const { error: orderError } = await supabase.from("orders").insert({
      id,
      customer_name,
      customer_email,
      customer_phone: customer_phone || null,
      shipping_address: shipping_address || null,
      shipping_city: shipping_city || null,
      shipping_region: shipping_region || null,
      order_note: order_note || null,
      subtotal,
      shipping: shipping || 0,
      total,
      payment_method: payment_method || "cod",
      payment_status: "pending",
      order_status: "pending",
    });

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: id,
      product_id: item.product_id || null,
      product_name: item.product_name || item.name,
      product_slug: item.product_slug || item.slug || null,
      product_image: item.product_image || item.image || null,
      price: item.price,
      quantity: item.quantity || 1,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Order was created, but items failed — still return success with a warning
      return NextResponse.json({ success: true, warning: "Order created but items failed to save" }, { status: 201 });
    }

    return NextResponse.json({ success: true, orderId: id }, { status: 201 });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data }, { status: 200 });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
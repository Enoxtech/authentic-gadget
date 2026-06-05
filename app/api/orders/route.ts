import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

interface SubmittedItem {
  product_id: string;
  quantity: number;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string | null;
  images: string[] | null;
  price: number | string;
  stock: number | null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readItems(value: unknown): SubmittedItem[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) {
    return null;
  }

  const items = value.map((item) => {
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    const productId = readString(record.product_id);
    const quantity = Number(record.quantity);

    if (
      !productId ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      return null;
    }

    return { product_id: productId, quantity };
  });

  return items.every(Boolean) ? (items as SubmittedItem[]) : null;
}

function createOrderId() {
  return `AG_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "order-create", { max: 10, windowMs: 60_000 });
    if (limit.limited) {
      return NextResponse.json(
        { error: "Too many order attempts. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const customerName = readString(body.customer_name);
    const customerEmail = readString(body.customer_email).toLowerCase();
    const customerPhone = readString(body.customer_phone);
    const shippingAddress = readString(body.shipping_address);
    const shippingCity = readString(body.shipping_city);
    const shippingRegion = readString(body.shipping_region);
    const orderNote = readString(body.order_note);
    const paymentMethod = readString(body.payment_method) || "cod";
    const items = readItems(body.items);

    if (!customerName || !customerEmail || !shippingAddress || !items) {
      return NextResponse.json(
        { error: "Name, email, delivery address, and valid items are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const sessionSupabase = await createServerClient();
    const productIds = [...new Set(items.map((item) => item.product_id))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, slug, images, price, stock")
      .eq("is_active", true)
      .in("id", productIds);

    if (productsError) {
      console.error("Error validating order products:", productsError);
      return NextResponse.json({ error: "Unable to validate products" }, { status: 500 });
    }

    if (!products || products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products are unavailable" },
        { status: 400 }
      );
    }

    const productsById = new Map(
      (products as ProductRow[]).map((product) => [product.id, product])
    );

    const orderItems = items.map((item) => {
      const product = productsById.get(item.product_id)!;
      const price = Number(product.price);
      return {
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        product_image: product.images?.[0] || null,
        price,
        quantity: item.quantity,
        stock: Number(product.stock || 0),
      };
    });

    if (orderItems.some((item) => item.quantity > item.stock)) {
      return NextResponse.json(
        { error: "One or more products do not have enough stock" },
        { status: 400 }
      );
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 0;
    const total = subtotal + shipping;
    const requestedId = readString(body.id);
    const orderId = /^AG_[A-Za-z0-9_-]{8,80}$/.test(requestedId)
      ? requestedId
      : createOrderId();

    const {
      data: { user },
    } = await sessionSupabase.auth.getUser();

    let customerId: string | null = null;
    if (user) {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      customerId = customer?.id || null;
    }

    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      shipping_address: shippingAddress,
      shipping_city: shippingCity || null,
      shipping_region: shippingRegion || null,
      order_note: orderNote || null,
      subtotal,
      shipping,
      total,
      payment_method: paymentMethod,
      payment_status: "pending",
      order_status: "pending",
    });

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      orderItems.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        product_slug: item.product_slug,
        product_image: item.product_image,
        price: item.price,
        quantity: item.quantity,
      }))
    );

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      return NextResponse.json(
        { error: "Order was created, but its items could not be saved" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, orderId, subtotal, shipping, total },
      { status: 201 }
    );
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const adminSupabase = getSupabaseAdminClient();
    const { data, error } = await adminSupabase
      .from("orders")
      .select("*")
      .ilike("customer_email", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: "Unable to fetch orders" }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

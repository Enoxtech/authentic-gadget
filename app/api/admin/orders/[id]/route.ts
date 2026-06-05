import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type OrderContext = { params: Promise<{ id: string }> };

const ORDER_STATUSES = new Set(["pending", "processing", "shipped", "delivered", "cancelled"]);
const PAYMENT_STATUSES = new Set(["pending", "paid", "failed", "refunded"]);

async function getOrderId(ctx: OrderContext) {
  const { id } = await ctx.params;
  return id;
}

export async function GET(request: NextRequest, ctx: OrderContext) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const id = await getOrderId(ctx);
    const supabase = getSupabaseAdminClient();
    const [orderRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("id", id).single(),
      supabase
        .from("order_items")
        .select("*, products(name, images)")
        .eq("order_id", id)
        .order("created_at", { ascending: true }),
    ]);

    if (orderRes.error) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      order: orderRes.data,
      items: itemsRes.data || [],
    });
  } catch (error) {
    console.error("Admin order GET error:", error);
    return NextResponse.json({ error: "Unable to load order" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: OrderContext) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const id = await getOrderId(ctx);
    const body = (await request.json()) as {
      order_status?: unknown;
      payment_status?: unknown;
    };
    const update: Record<string, string> = {};

    if (body.order_status !== undefined) {
      const status = typeof body.order_status === "string" ? body.order_status : "";
      if (!ORDER_STATUSES.has(status)) {
        return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
      }
      update.order_status = status;
    }

    if (body.payment_status !== undefined) {
      const status = typeof body.payment_status === "string" ? body.payment_status : "";
      if (!PAYMENT_STATUSES.has(status)) {
        return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
      }
      update.payment_status = status;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No order fields were provided" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("Admin order PATCH error:", error);
    return NextResponse.json({ error: "Unable to update order" }, { status: 500 });
  }
}

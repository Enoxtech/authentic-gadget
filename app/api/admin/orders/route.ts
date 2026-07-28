import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin", "support", "product_manager"]);
  if (error) return error;

  try {
    const supabase = getSupabaseAdminClient();
    const [ordersRes, itemsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("order_items").select("order_id"),
    ]);

    if (ordersRes.error) {
      return NextResponse.json({ error: ordersRes.error.message }, { status: 500 });
    }

    const itemCounts = new Map<string, number>();
    for (const item of itemsRes.data || []) {
      const orderId = String(item.order_id || "");
      if (!orderId) continue;
      itemCounts.set(orderId, (itemCounts.get(orderId) || 0) + 1);
    }

    const orders = (ordersRes.data || []).map((order) => {
      const orderId = String(order.id || "");
      return { ...order, item_count: itemCounts.get(orderId) || 0 };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ error: "Unable to load orders" }, { status: 500 });
  }
}

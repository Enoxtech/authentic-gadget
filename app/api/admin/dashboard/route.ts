import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const supabase = getSupabaseAdminClient();
    const [ordersRes, recentOrdersRes, topProductsRes, productsCountRes, customersCountRes] =
      await Promise.all([
        supabase.from("orders").select("total"),
        supabase
          .from("orders")
          .select("id, customer_name, total, order_status, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("products")
          .select("id, name, price, stock, images")
          .order("name", { ascending: true })
          .limit(6),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
      ]);

    if (ordersRes.error) {
      return NextResponse.json({ error: ordersRes.error.message }, { status: 500 });
    }

    const orders = ordersRes.data || [];
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: productsCountRes.count || 0,
        totalCustomers: customersCountRes.count || 0,
      },
      recentOrders: recentOrdersRes.data || [],
      topProducts: topProductsRes.data || [],
    });
  } catch (error) {
    console.error("Admin dashboard GET error:", error);
    return NextResponse.json({ error: "Unable to load dashboard" }, { status: 500 });
  }
}

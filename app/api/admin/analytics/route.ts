import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const supabase = getSupabaseAdminClient();
    const [ordersRes, productsRes, customersRes, orderItemsRes] = await Promise.all([
      supabase.from("orders").select("total, created_at"),
      supabase.from("products").select("id, name, price"),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("order_items").select("product_name, quantity, price"),
    ]);

    if (ordersRes.error) {
      return NextResponse.json({ error: ordersRes.error.message }, { status: 500 });
    }

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const productRevenue = new Map<string, number>();

    for (const item of orderItemsRes.data || []) {
      const productName = item.product_name || "Unknown";
      productRevenue.set(
        productName,
        (productRevenue.get(productName) || 0) + Number(item.price || 0) * Number(item.quantity || 0)
      );
    }

    const topProduct =
      [...productRevenue.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ||
      products[0]?.name ||
      "-";

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers: customersRes.count || 0,
        totalProducts: products.length,
        avgOrderValue,
        topProduct,
      },
    });
  } catch (error) {
    console.error("Admin analytics GET error:", error);
    return NextResponse.json({ error: "Unable to load analytics" }, { status: 500 });
  }
}

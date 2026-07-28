import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

interface OrderRow {
  total: number;
  created_at: string;
  order_status: string;
}

interface OrderItemRow {
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
}

function monthKey(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function buildMonthlyBuckets(orders: OrderRow[]) {
  const now = new Date();
  const months: { key: string; month: string; revenue: number; orders: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: monthKey(d), revenue: 0, orders: 0 });
  }

  const byKey = new Map(months.map((m) => [m.key, m]));

  for (const order of orders) {
    const d = new Date(order.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = byKey.get(key);
    if (bucket) {
      bucket.revenue += Number(order.total || 0);
      bucket.orders += 1;
    }
  }

  return months.map(({ month, revenue, orders }) => ({ month, revenue, orders }));
}

function buildStatusBreakdown(orders: OrderRow[]) {
  const colors: Record<string, string> = {
    pending: "#8B5CF6",
    processing: "#F59E0B",
    shipped: "#3B82F6",
    delivered: "#10B981",
    cancelled: "#EF4444",
  };
  const counts = new Map<string, number>();
  for (const o of orders) {
    const status = o.order_status || "pending";
    counts.set(status, (counts.get(status) || 0) + 1);
  }
  return [...counts.entries()].map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value,
    color: colors[label] || "#6B7280",
  }));
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin"]);
  if (error) return error;

  try {
    const supabase = getSupabaseAdminClient();
    const [ordersRes, productsRes, customersRes, orderItemsRes] = await Promise.all([
      supabase.from("orders").select("total, created_at, order_status"),
      supabase.from("products").select("id, name, price, category"),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("order_items").select("product_id, product_name, quantity, price"),
    ]);

    if (ordersRes.error) {
      return NextResponse.json({ error: ordersRes.error.message }, { status: 500 });
    }

    const orders = (ordersRes.data || []) as OrderRow[];
    const products = productsRes.data || [];
    const orderItems = (orderItemsRes.data || []) as OrderItemRow[];

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products by revenue
    const productRevenue = new Map<string, number>();
    for (const item of orderItems) {
      const name = item.product_name || "Unknown";
      productRevenue.set(name, (productRevenue.get(name) || 0) + Number(item.price || 0) * Number(item.quantity || 0));
    }
    const topProducts = [...productRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));
    const maxProductRevenue = topProducts[0]?.value || 1;

    // Revenue by category (join order_items -> products.category)
    const categoryById = new Map(products.map((p) => [p.id, p.category || "Uncategorized"]));
    const categoryRevenue = new Map<string, number>();
    for (const item of orderItems) {
      const category = item.product_id ? categoryById.get(item.product_id) || "Uncategorized" : "Uncategorized";
      categoryRevenue.set(category, (categoryRevenue.get(category) || 0) + Number(item.price || 0) * Number(item.quantity || 0));
    }
    const topCategories = [...categoryRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
    const maxCategoryRevenue = topCategories[0]?.value || 1;

    const topProduct = topProducts[0]?.label || products[0]?.name || "-";

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers: customersRes.count || 0,
        totalProducts: products.length,
        avgOrderValue,
        topProduct,
      },
      monthly: buildMonthlyBuckets(orders),
      statusBreakdown: buildStatusBreakdown(orders),
      topProducts: topProducts.map((p) => ({ ...p, pct: Math.round((p.value / maxProductRevenue) * 100) })),
      topCategories: topCategories.map((c) => ({ ...c, pct: Math.round((c.value / maxCategoryRevenue) * 100) })),
    });
  } catch (error) {
    console.error("Admin analytics GET error:", error);
    return NextResponse.json({ error: "Unable to load analytics" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const supabase = getSupabaseAdminClient();
    const [customersRes, ordersRes] = await Promise.all([
      supabase
        .from("customers")
        .select("id, full_name, email, phone, region, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("orders").select("customer_id"),
    ]);

    if (customersRes.error) {
      return NextResponse.json({ error: customersRes.error.message }, { status: 500 });
    }

    const orderCounts = new Map<string, number>();
    for (const order of ordersRes.data || []) {
      if (!order.customer_id) continue;
      orderCounts.set(order.customer_id, (orderCounts.get(order.customer_id) || 0) + 1);
    }

    const customers = (customersRes.data || []).map((customer) => ({
      ...customer,
      name: customer.full_name,
      order_count: orderCounts.get(customer.id) || 0,
    }));

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Admin customers GET error:", error);
    return NextResponse.json({ error: "Unable to load customers" }, { status: 500 });
  }
}

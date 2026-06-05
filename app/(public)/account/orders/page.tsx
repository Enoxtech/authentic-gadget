import Link from "next/link";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

interface Order {
  id: string;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?redirect=/account/orders");
  }

  const adminSupabase = getSupabaseAdminClient();
  const { data } = await adminSupabase
    .from("orders")
    .select("id, total, payment_status, order_status, created_at")
    .ilike("customer_email", user.email)
    .order("created_at", { ascending: false });
  const orders = (data || []) as Order[];

  return (
    <div className="min-h-screen bg-fog py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/account" className="text-sm text-electric font-medium hover:underline">
            Back to account
          </Link>
          <h1 className="text-2xl font-bold text-charcoal mt-3">My Orders</h1>
          <p className="text-charcoal/50 text-sm mt-1">{user.email}</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-card text-center">
            <ShoppingBag className="w-10 h-10 text-charcoal/20 mx-auto mb-3" />
            <p className="text-charcoal/50 text-sm mb-5">No orders found for this account.</p>
            <Link
              href="/products"
              className="inline-flex px-5 py-3 bg-electric text-white text-sm font-semibold rounded-xl"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-electric/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-electric" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-charcoal truncate">{order.id}</p>
                  <p className="text-xs text-charcoal/50 mt-1">
                    {new Date(order.created_at).toLocaleDateString()} · {order.payment_status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal">GHS {Number(order.total).toLocaleString()}</p>
                  <p className="text-xs text-electric font-medium capitalize">{order.order_status}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-charcoal/30" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

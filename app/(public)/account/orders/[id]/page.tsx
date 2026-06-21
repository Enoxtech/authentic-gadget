import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`/login?redirect=/account/orders/${encodeURIComponent(id)}`);
  }

  const adminSupabase = getSupabaseAdminClient();
  const { data: order } = await adminSupabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .ilike("customer_email", user.email)
    .maybeSingle();

  if (!order) notFound();

  const { data: itemData } = await adminSupabase
    .from("order_items")
    .select("id, product_name, product_image, price, quantity")
    .eq("order_id", id);
  const items = (itemData || []) as OrderItem[];

  return (
    <div className="min-h-screen bg-fog py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm text-electric font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> My orders
        </Link>

        <div className="bg-midnight text-white rounded-[28px] p-6 mb-6 card-premium">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">Order</p>
              <h1 className="text-xl font-bold mt-1">{order.id}</h1>
              <p className="text-white/50 text-sm mt-1">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gold text-lg">
                {formatPrice(Number(order.total))}
              </p>
              <p className="text-sm capitalize text-white/70">{order.order_status}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 card-premium border border-[var(--border-color)] mb-6">
          <h2 className="font-bold text-charcoal mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-electric" /> Items
          </h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-fog shrink-0">
                  {item.product_image ? (
                    <Image src={item.product_image} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <Package className="w-5 h-5 text-charcoal/20 absolute inset-0 m-auto" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal truncate">{item.product_name}</p>
                  <p className="text-xs text-charcoal/50">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-charcoal">
                  {formatPrice(Number(item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-[28px] p-5 card-premium border border-[var(--border-color)]">
            <h2 className="font-bold text-charcoal mb-3">Payment</h2>
            <p className="text-sm text-charcoal/60 capitalize">{order.payment_method}</p>
            <p className="text-sm text-electric font-medium capitalize">{order.payment_status}</p>
          </div>
          <div className="bg-white rounded-[28px] p-5 card-premium border border-[var(--border-color)]">
            <h2 className="font-bold text-charcoal mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-electric" /> Delivery
            </h2>
            <p className="text-sm text-charcoal/70">{order.shipping_address}</p>
            <p className="text-sm text-charcoal/50">
              {[order.shipping_city, order.shipping_region].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

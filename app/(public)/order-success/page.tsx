"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package } from "lucide-react";
import { Suspense, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order") || "AG-XXXXXXXX";
  const total = params.get("total") || "0";
  const method = params.get("method") || "cod";
  const provider = params.get("provider") || "mtn";

  const isMomo = method === "momo";
  const isCod = method === "cod" || !method;
  const isCard = method === "card";

  const PROVIDER_LABELS: Record<string, string> = {
    mtn: "MTN MoMo",
    vodafone: "Vodafone Cash",
    airteltigo: "AirtelTigo Money",
    card: "Card Payment",
  };
  const methodLabel = isMomo
    ? (PROVIDER_LABELS[provider] || "Mobile Money")
    : isCard
      ? "Card Payment"
      : "Pay on Delivery";

  // Clear the cart after a successful order
  const { clearCart } = useCart();
  useEffect(() => {
    if (orderId && orderId !== "AG-XXXXXXXX") {
      clearCart();
    }
  }, [orderId, clearCart]);

  return (
    <div className="min-h-screen bg-fog flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal mb-2">
          {isCod ? "Order Confirmed!" : "Order Placed!"}
        </h1>
        <p className="text-charcoal/50 mb-6">
          Thank you for shopping with Authentic Gadget. Your order has been received.
        </p>

        <div className="bg-white rounded-[28px] p-6 card-premium border border-[var(--border-color)] mb-6 text-left">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-fog">
            <div className="w-10 h-10 rounded-full bg-electric/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-electric" />
            </div>
            <div>
              <p className="text-xs text-charcoal/50">Order ID</p>
              <p className="font-bold text-charcoal">{orderId}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal/60">Order Total</span>
              <span className="font-bold text-electric font-label">{formatPrice(Number(total))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/60">Payment Method</span>
              <span className="text-charcoal font-medium">{methodLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/60">Payment Status</span>
              <span className={`font-medium ${isCod ? "text-amber-500" : "text-green-600"}`}>
                {isCod ? "Pay on Delivery" : "Pending Confirmation"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/60">Delivery</span>
              <span className="text-charcoal font-medium">Within 3–5 business days</span>
            </div>
          </div>
        </div>

        {isMomo && (
          <p className="text-sm text-charcoal/50 mb-4 bg-amber-50 rounded-xl p-3">
            💡 A <strong>{PROVIDER_LABELS[provider]}</strong> payment request has been sent to your phone.
            Please approve it to confirm your order. Your order will be processed once payment is confirmed.
          </p>
        )}

        {isCod && (
          <p className="text-sm text-charcoal/50 mb-4 bg-amber-50 rounded-xl p-3">
            💡 Please have <strong>{formatPrice(Number(total))}</strong> ready when our delivery agent arrives.
            Do not make payment before receiving your order.
          </p>
        )}

        <div className="space-y-3">
          <Link
            href={`/track-order?order=${encodeURIComponent(orderId)}`}
            className="block w-full py-4 bg-electric text-white font-semibold rounded-[18px] hover:bg-electric/90 transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/"
            className="block w-full py-4 bg-white text-charcoal font-semibold rounded-[18px] hover:bg-fog transition-colors border border-[var(--border-color)]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingContent() {
  return (
    <div className="min-h-screen bg-fog flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-electric/20 border-t-electric rounded-full animate-spin mx-auto mb-4" />
        <p className="text-charcoal/50">Loading order details...</p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingContent />}>
      <OrderSuccessContent />
    </Suspense>
  );
}

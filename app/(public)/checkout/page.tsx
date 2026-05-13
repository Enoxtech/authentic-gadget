"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ChevronLeft, Smartphone, Banknote, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCart } from "@/context/CartContext";

const metadata = {
  title: "Checkout | Authentic Gadget",
  description: "Complete your order securely. Pay with MTN MoMo or Cash on Delivery.",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total: cartTotal } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cod" | null>(null);
  const [momoNumber, setMomoNumber] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    note: "",
  });

  const subtotal = cartTotal;
  const shipping = subtotal > 2000 ? 0 : 150;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-charcoal/50 mb-4">Your cart is empty</p>
          <Link href="/" className="text-electric font-semibold hover:underline">Back to shop</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return;
    setLoading(true);

    const orderId = "AG-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Save order to Supabase before payment
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          customer_name: form.name,
          customer_email: form.phone + "@example.com",
          customer_phone: form.phone,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_region: form.region,
          order_note: form.note,
          subtotal,
          shipping,
          total,
          payment_method: paymentMethod === "momo" ? "momo" : "cod",
          items: items.map((item: any) => ({
            product_id: item.id,
            product_name: item.name,
            product_slug: item.slug,
            product_image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });
    } catch (err) {
      console.error("Failed to save order to database:", err);
    }

    if (paymentMethod === "momo") {
      try {
        const res = await fetch("/api/flutterwave/momo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            currency: "GHS",
            phone: momoNumber.replace(/\D/g, ""),
            email: form.phone + "@example.com",
            name: form.name,
            orderId,
          }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Payment initiation failed");

        if (data.flutterwave?.status === "success" || data.success) {
          router.push(`/order-success?order=${orderId}&total=${total}&method=momo`);
        } else {
          throw new Error(data.note || data.error || "MoMo payment request failed");
        }
      } catch (err: any) {
        alert(err.message || "Payment failed. Please try again.");
        setLoading(false);
      }
    } else {
      await new Promise((r) => setTimeout(r, 1500));
      router.push(`/order-success?order=${orderId}&total=${total}&method=cod`);
    }
  };

  return (
    <div className="min-h-screen bg-fog">
      {/* Header */}
      <div className="bg-midnight text-white py-6">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-4">
          <Link href="/cart" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg">Checkout</h1>
            <p className="text-white/50 text-sm">{items.length} items</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Breadcrumbs crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["Shipping", "Payment"].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > i + 1 ? "bg-electric text-white" : step === i + 1 ? "bg-electric text-white" : "bg-fog-200 text-charcoal/40"
              }`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === i + 1 ? "text-charcoal" : "text-charcoal/40"}`}>{label}</span>
              {i < 1 && <div className="flex-1 h-0.5 bg-fog-200 mr-2" />}
            </div>
          ))}
        </div>

        {/* Order items */}
        <div className="bg-white rounded-2xl p-4 shadow-card mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 border-b border-fog last:border-0">
              <div className="relative w-16 h-16 bg-fog rounded-xl overflow-hidden shrink-0">
                <Image src={item.image ?? ""} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                <p className="text-xs text-charcoal/50">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-charcoal text-sm">¢{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h2 className="font-bold text-charcoal mb-5">Delivery Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+233 200 000 000"
                    className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="House number, street name"
                  className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Accra"
                    className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Region</label>
                  <select
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                  >
                    <option value="">Select region</option>
                    <option>Greater Accra</option>
                    <option>Ashanti</option>
                    <option>Central</option>
                    <option>Eastern</option>
                    <option>Northern</option>
                    <option>Western</option>
                    <option>Volta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Order Note <span className="text-charcoal/30 font-normal">(optional)</span></label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Delivery instructions..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-fog text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric resize-none"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.name || !form.phone || !form.address || !form.city}
              className="mt-6 w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Delivery summary */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-charcoal">Delivering to:</p>
                <button onClick={() => setStep(1)} className="text-sm text-electric font-medium hover:underline">Edit</button>
              </div>
              <p className="text-sm text-charcoal/70">{form.name}</p>
              <p className="text-sm text-charcoal/50">{form.address}, {form.city}, {form.region}</p>
              <p className="text-sm text-charcoal/50">{form.phone}</p>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="font-bold text-charcoal mb-4">Payment Method</h2>
              <div className="space-y-3">

                {/* MTN MoMo */}
                <button
                  onClick={() => setPaymentMethod("momo")}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "momo"
                      ? "border-electric bg-electric/5"
                      : "border-fog-200 bg-fog hover:border-electric/40"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === "momo" ? "bg-electric text-white" : "bg-fog-200 text-charcoal/60"
                  }`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm text-charcoal">MTN MoMo Pay</p>
                    <p className="text-xs text-charcoal/50">Pay directly from your MoMo account</p>
                  </div>
                  {paymentMethod === "momo" && <CheckCircle2 className="w-5 h-5 text-electric shrink-0" />}
                </button>

                {/* Pay on Delivery */}
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "cod"
                      ? "border-electric bg-electric/5"
                      : "border-fog-200 bg-fog hover:border-electric/40"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === "cod" ? "bg-electric text-white" : "bg-fog-200 text-charcoal/60"
                  }`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm text-charcoal">Pay on Delivery</p>
                    <p className="text-xs text-charcoal/50">Pay with cash or MoMo when your order arrives</p>
                  </div>
                  {paymentMethod === "cod" && <CheckCircle2 className="w-5 h-5 text-electric shrink-0" />}
                </button>
              </div>

              {/* MoMo number input — shown when MoMo is selected */}
              {paymentMethod === "momo" && (
                <div className="mt-4 p-4 bg-fog rounded-xl border border-fog-200">
                  <label className="block text-sm font-medium text-charcoal mb-2">MoMo Number</label>
                  <input
                    type="tel"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="055 000 0000"
                    className="w-full px-4 py-3 rounded-xl border border-fog-200 bg-white text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric"
                  />
                  <p className="text-xs text-charcoal/40 mt-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    You will receive a MoMo prompt to complete payment
                  </p>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="mt-4 p-4 bg-fog rounded-xl border border-fog-200">
                  <p className="text-sm text-charcoal/70">
                    Have your payment ready when the delivery agent arrives. You can pay with <strong>cash</strong> or <strong>MoMo</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Subtotal</span>
                  <span className="text-charcoal font-medium">¢{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Shipping</span>
                  <span className="text-charcoal font-medium">{shipping === 0 ? "Free" : `¢${shipping}`}</span>
                </div>
                <div className="flex justify-between border-t border-fog-200 pt-2 mt-2">
                  <span className="font-bold text-charcoal">Total</span>
                  <span className="font-bold text-electric text-lg">¢{total.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !paymentMethod || (paymentMethod === "momo" && !momoNumber)}
                className="mt-5 w-full py-4 bg-electric text-white font-semibold rounded-2xl hover:bg-electric/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <>
                    {paymentMethod === "momo" && <Smartphone className="w-4 h-4" />}
                    {paymentMethod === "cod" && <Banknote className="w-4 h-4" />}
                    {paymentMethod === "momo" ? "Pay with MoMo" : paymentMethod === "cod" ? "Place Order (Pay on Delivery)" : "Select a payment method"}
                  </>
                )}
              </button>
              <p className="text-xs text-charcoal/40 mt-3 text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                {paymentMethod === "cod" ? "Payment collected at delivery" : "Your payment is secure"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

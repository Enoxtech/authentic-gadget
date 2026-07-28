"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Check, ArrowRight, ArrowLeft, ShoppingBag, Loader2, Smartphone, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  estimated_days: string | null;
}

const STEPS = [
  { id: "info", label: "Information", icon: "📋" },
  { id: "payment", label: "Payment", icon: "💳" },
  { id: "review", label: "Review", icon: "✅" },
];

const PAYMENT_METHODS = [
  { id: "momo", label: "Mobile Money (MoMo)", icon: Smartphone, desc: "MTN · Vodafone · AirtelTigo" },
  { id: "cod", label: "Pay on Delivery", icon: Truck, desc: "Pay when your order arrives" },
];

const MOMO_PROVIDERS = [
  { id: "mtn", label: "MTN MoMo", color: "#FFCC00" },
  { id: "vodafone", label: "Vodafone Cash", color: "#E60000" },
  { id: "airteltigo", label: "AirtelTigo Money", color: "#8B5CF6" },
];

export default function CheckoutPage() {
  const { items, total, discount, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "" });
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [momoProvider, setMomoProvider] = useState("mtn");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [error, setError] = useState("");
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [deliveryAreaId, setDeliveryAreaId] = useState("");
  const [vatPercent, setVatPercent] = useState(0);

  useEffect(() => {
    fetch("/api/delivery-areas")
      .then((r) => (r.ok ? r.json() : []))
      .then((areas: DeliveryArea[]) => {
        setDeliveryAreas(areas);
        if (areas.length > 0) setDeliveryAreaId((current) => current || areas[0].id);
      })
      .catch(() => setDeliveryAreas([]));
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setVatPercent(s?.vatPercent || 0))
      .catch(() => setVatPercent(0));
  }, []);

  const selectedArea = deliveryAreas.find((a) => a.id === deliveryAreaId) || null;
  const deliveryFee = discount?.freeShipping ? 0 : selectedArea?.fee || 0;
  const subtotalAfterDiscount = discount ? Math.max(0, total - discount.amount) : total;
  const taxAmount = vatPercent > 0 ? Math.round(subtotalAfterDiscount * vatPercent) / 100 : 0;
  const discountedTotal = subtotalAfterDiscount + taxAmount + deliveryFee;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setIsAnimating(false); }, 300);
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setIsAnimating(false); }, 300);
  };

  const generateOrderId = () => `AG_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

  const handlePlaceOrder = async () => {
    setError("");
    setIsProcessing(true);
    const newOrderId = generateOrderId();
    const orderPayload = {
      id: newOrderId,
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      shipping_address: formData.address,
      shipping_city: formData.city,
      shipping_region: formData.state,
      subtotal: total,
      shipping: deliveryFee,
      total: discountedTotal,
      coupon_code: discount?.code || undefined,
      delivery_area_id: deliveryAreaId || undefined,
      payment_method: paymentMethod === "cod" ? "cod" : paymentMethod,
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    // ─── Cash on Delivery ───
    if (paymentMethod === "cod") {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });
        const data = (await res.json()) as { error?: string; orderId?: string; total?: number };
        if (!res.ok || !data.orderId || !data.total) {
          throw new Error(data.error || "Order creation failed");
        }
        setOrderId(data.orderId);
        setConfirmedTotal(data.total);
        clearCart();
        setOrderPlaced(true);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Failed to place order. Please try again.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // ─── Mobile Money ───
    if (paymentMethod === "momo") {
      if (!formData.phone) {
        setError("Please enter your phone number for MoMo payment.");
        setIsProcessing(false);
        return;
      }
      try {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderPayload,
            payment_method: `momo_${momoProvider}`,
          }),
        });
        const orderData = (await orderRes.json()) as {
          error?: string;
          orderId?: string;
          total?: number;
        };
        if (!orderRes.ok || !orderData.orderId || !orderData.total) {
          throw new Error(orderData.error || "Order creation failed");
        }

        const momoRes = await fetch("/api/flutterwave/momo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            provider: momoProvider,
          }),
        });
        const momoData = (await momoRes.json()) as { error?: string; redirectUrl?: string | null };
        if (!momoRes.ok) throw new Error(momoData.error || "MoMo payment initiation failed");

        setOrderId(orderData.orderId);
        if (momoData.redirectUrl) {
          window.location.href = momoData.redirectUrl;
          return;
        }

        clearCart();
        // Redirect to order success page — Flutterwave will have sent a USSD prompt
        // Customer confirms on their phone, Flutterwave webhook updates payment status
        router.push(`/order-success?order=${orderData.orderId}&total=${orderData.total}&method=momo&provider=${momoProvider}`);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Payment initiation failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // ─── Card / Paystack ───
    if (paymentMethod === "card") {
      try {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...orderPayload, payment_method: "card" }),
        });
        const orderData = (await orderRes.json()) as {
          error?: string;
          orderId?: string;
        };
        if (!orderRes.ok || !orderData.orderId) {
          throw new Error(orderData.error || "Order creation failed");
        }

        const initRes = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderData.orderId }),
        });
        const initData = (await initRes.json()) as {
          error?: string;
          authorizationUrl?: string;
        };
        if (!initRes.ok || !initData.authorizationUrl) throw new Error(initData.error || "Failed to initialize payment");
        // Redirect to Paystack payment page
        window.location.href = initData.authorizationUrl;
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Payment failed. Please try again.");
        setIsProcessing(false);
      }
    }
  };

  const isStep0Valid = formData.name.trim() && formData.email.trim() && formData.address.trim();

  // Order success animation
  if (orderPlaced) {
    const isCod = paymentMethod === "cod";
    const finalTotal = confirmedTotal || discountedTotal;
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#040820" }}>
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <div
              className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
              style={{ background: isCod ? "linear-gradient(135deg, #D4A843, #19AFFF)" : "linear-gradient(135deg, #22c55e, #4ade80)" }}
            >
              {isCod ? <Truck className="w-12 h-12 text-white" /> : <Check className="w-12 h-12 text-white" />}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isCod ? "Order Confirmed! 🎉" : "Order Placed! 🎉"}
          </h1>
          <p className="text-white/60 mb-2">Thank you, {formData.name || "customer"}!</p>

          {isCod ? (
            <p className="text-sm text-white/40 mb-8">
              Your order <span className="font-mono text-white/60">#{orderId}</span> has been received.
              Please have <span className="font-bold text-white">{formatPrice(finalTotal)}</span> ready when our delivery agent arrives.
            </p>
          ) : (
            <p className="text-sm text-white/40 mb-8">
              Your order <span className="font-mono text-white/60">#{orderId}</span> is being processed.
              You&apos;ll receive a confirmation shortly.
            </p>
          )}

          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-6"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <div className="text-2xl">🚚</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Estimated Delivery</p>
              <p className="text-xs text-white/60">3-5 business days (Ghana) · 5-10 days (other regions)</p>
            </div>
          </div>

          <div
            className="p-4 rounded-[28px] mb-8"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-xs text-white/40 mb-2">Order total</p>
            <p className="text-3xl font-bold" style={{ color: "#D4A843" }}>
              {formatPrice(finalTotal)}
            </p>
            {isCod && (
              <p className="text-xs mt-1" style={{ color: "rgba(124,58,237,0.8)" }}>
                Pay on delivery · Do not pay before receiving your order
              </p>
            )}
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
            style={{ background: "linear-gradient(135deg, #D4A843, #19AFFF)" }}
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#040820" }}>
      {/* Header */}
      <div
        className="border-b border-white/10"
        style={{ background: "rgba(4,8,32,0.8)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="Authentic Gadget" width={28} height={28} className="h-7 w-7 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            <span className="text-lg font-bold text-white">Authentic Gadget</span>
          </Link>
          <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <ShoppingBag className="w-4 h-4" />
            <span>Checkout</span>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="border-b border-white/10 py-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    i === step
                      ? "bg-electric text-white"
                      : i < step
                      ? "bg-green-600 text-white"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  <span>{i < step ? "✓" : s.icon}</span>
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${i < step ? "bg-green-500" : "bg-white/10"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <div
              className={`rounded-[28px] p-6 transition-all duration-300 ${
                isAnimating ? "opacity-50 scale-[0.99]" : "opacity-100 scale-100"
              }`}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {/* Step 0: Information */}
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Contact Information</h2>
                  <p className="text-sm text-white/40 mb-6">Guest checkout — no account needed</p>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Full Name</label>
                        <input
                          value={formData.name}
                          onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                          placeholder="Enoch Abbas"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Email</label>
                        <input
                          value={formData.email}
                          onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                          placeholder="enoch@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">
                        Phone (for delivery updates)
                      </label>
                      <input
                        value={formData.phone}
                        onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Delivery Address</label>
                      <input
                        value={formData.address}
                        onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        placeholder="123 Street Name, Victoria Island"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">City</label>
                        <input
                          value={formData.city}
                          onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                          placeholder="Lagos"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">State</label>
                        <input
                          value={formData.state}
                          onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                          placeholder="Lagos"
                        />
                      </div>
                    </div>

                    {deliveryAreas.length > 0 && (
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Delivery Area</label>
                        <div className="space-y-2">
                          {deliveryAreas.map((area) => (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => setDeliveryAreaId(area.id)}
                              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all"
                              style={{
                                background: deliveryAreaId === area.id ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.04)",
                                border: deliveryAreaId === area.id ? "1px solid #D4A843" : "1px solid rgba(255,255,255,0.08)",
                              }}
                            >
                              <div>
                                <p className="text-sm font-medium text-white">{area.name}</p>
                                {area.estimated_days && <p className="text-xs text-white/40">{area.estimated_days}</p>}
                              </div>
                              <p className="text-sm font-bold" style={{ color: "#D4A843" }}>{formatPrice(area.fee)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                      <button
                        key={id}
                        onClick={() => { setPaymentMethod(id); setError(""); }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                        style={{
                          background:
                            paymentMethod === id ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
                          border:
                            paymentMethod === id
                              ? "2px solid #D4A843"
                              : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background:
                              paymentMethod === id
                                ? "linear-gradient(135deg, #D4A843, #19AFFF)"
                                : "rgba(255,255,255,0.1)",
                          }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{label}</p>
                          <p className="text-xs text-white/40">{desc}</p>
                        </div>
                        {paymentMethod === id && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "#D4A843" }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}

                    {/* MoMo sub-step: Provider selection */}
                    {paymentMethod === "momo" && (
                      <div className="mt-3 pl-4 border-l-2 border-gold/30 space-y-2">
                        <p className="text-xs text-white/40 mb-2">Select your network:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {MOMO_PROVIDERS.map(p => (
                            <button
                              key={p.id}
                              onClick={() => setMomoProvider(p.id)}
                              className="py-2.5 px-3 rounded-xl text-xs font-semibold transition-all"
                              style={{
                                background: momoProvider === p.id ? `${p.color}22` : "rgba(255,255,255,0.04)",
                                border: momoProvider === p.id ? `2px solid ${p.color}` : "1px solid rgba(255,255,255,0.08)",
                                color: momoProvider === p.id ? p.color : "rgba(255,255,255,0.6)",
                              }}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Review Your Order</h2>

                  {/* Delivery info */}
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl mb-4"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    <div className="text-2xl">🚚</div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">Estimated Delivery</p>
                      <p className="text-xs text-white/60">
                        2-5 business days (Lagos) · 3-7 days (other states)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div
                          className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image ?? "/placeholder.png"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.name}</p>
                          <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                          >
                            +
                          </button>
                          <p className="text-sm font-bold text-white ml-2">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {items.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-white/40 mb-4">Your cart is empty</p>
                      <Link
                        href="/products"
                        className="text-sm font-semibold"
                        style={{ color: "#D4A843" }}
                      >
                        Continue Shopping →
                      </Link>
                    </div>
                  )}

                  <div
                    className="mt-4 p-4 rounded-xl space-y-2"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Subtotal</span>
                      <span className="text-white">{formatPrice(total)}</span>
                    </div>
                    {discount && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "#22c55e" }}>Discount ({discount.code})</span>
                        <span style={{ color: "#22c55e" }}>-{formatPrice(discount.amount)}</span>
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>VAT ({vatPercent}%)</span>
                        <span className="text-white">{formatPrice(taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Delivery{selectedArea ? ` (${selectedArea.name})` : ""}</span>
                      <span style={{ color: deliveryFee === 0 ? "#22c55e" : "white" }}>
                        {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                      <span className="text-white">Total</span>
                      <span style={{ color: "#D4A843" }}>{formatPrice(discountedTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-4">
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <Link
                  href="/products"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/50 font-medium"
                >
                  ← Continue Shopping
                </Link>
              )}

              {error && (
                <div className="mt-3 px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </div>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 0 && !isStep0Valid}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold transition-all"
                  style={{
                    background: "linear-gradient(135deg, #D4A843, #19AFFF)",
                    opacity: step === 0 && !isStep0Valid ? 0.5 : 1,
                    cursor: step === 0 && !isStep0Valid ? "not-allowed" : "pointer",
                  }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-60"
                  style={{
                    background: paymentMethod === "cod"
                      ? "linear-gradient(135deg, #D4A843, #19AFFF)"
                      : "linear-gradient(135deg, #22c55e, #4ade80)",
                    boxShadow: paymentMethod === "cod"
                      ? "0 8px 32px rgba(124,58,237,0.3)"
                      : "0 8px 32px rgba(34,197,94,0.4)",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                  }}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : paymentMethod === "cod" ? (
                    <>Confirm Order → {discountedTotal > 0 ? formatPrice(discountedTotal) : ""}</>
                  ) : (
                    <>{paymentMethod === "momo" ? "Pay with MoMo →" : "Pay Now →"} {discountedTotal > 0 ? formatPrice(discountedTotal) : ""}</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right: Sticky Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-[28px] overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="p-5 border-b border-white/10">
                <h3 className="font-bold text-white">Order Summary</h3>
                <p className="text-xs text-white/40 mt-1">{itemCount} items</p>
              </div>
              <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image ?? "/placeholder.png"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{item.name}</p>
                      <p className="text-xs text-white/40">×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-white/30 text-center py-4">No items in cart</p>
                )}
              </div>
              <div className="p-5 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Subtotal</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#22c55e" }}>Discount</span>
                    <span style={{ color: "#22c55e" }}>-{formatPrice(discount.amount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>VAT ({vatPercent}%)</span>
                    <span className="text-white">{formatPrice(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Delivery</span>
                  <span style={{ color: deliveryFee === 0 ? "#22c55e" : "white" }}>
                    {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span style={{ color: "#D4A843" }}>{formatPrice(discountedTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

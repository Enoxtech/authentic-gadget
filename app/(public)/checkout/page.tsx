"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Check, ArrowRight, ArrowLeft, CreditCard, Building, Banknote, ShoppingBag } from "lucide-react";

const STEPS = [
  { id: "info", label: "Information", icon: "📋" },
  { id: "payment", label: "Payment", icon: "💳" },
  { id: "review", label: "Review", icon: "✅" },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, desc: "Pay securely with your card" },
  { id: "transfer", label: "Bank Transfer", icon: Building, desc: "GTBank / FirstBank / UBA" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive" },
];

export default function CheckoutPage() {
  const { items, total, discount, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "" });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const discountedTotal = discount ? Math.max(0, total - discount.amount) : total;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setIsAnimating(false); }, 300);
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setIsAnimating(false); }, 300);
  };

  const handlePlaceOrder = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setOrderPlaced(true);
      clearCart();
      setIsAnimating(false);
    }, 1500);
  };

  const isStep0Valid = formData.name.trim() && formData.email.trim() && formData.address.trim();

  // Order success animation
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <div
              className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #22c55e, #4ade80)" }}
            >
              <Check className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Order Placed! 🎉</h1>
          <p className="text-white/60 mb-2">Thank you, {formData.name || "customer"}!</p>
          <p className="text-sm text-white/40 mb-8">
            Your order is being processed. You&apos;ll receive a confirmation shortly.
          </p>

          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-6"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <div className="text-2xl">🚚</div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Estimated Delivery</p>
              <p className="text-xs text-white/60">2-5 business days (Lagos) · 3-7 days (other states)</p>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl mb-8"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-xs text-white/40 mb-2">Order total</p>
            <p className="text-3xl font-bold" style={{ color: "#a78bfa" }}>
              ${discountedTotal.toLocaleString()}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <div
        className="border-b border-white/10"
        style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white">
            🏪 Authentic Gadget
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
                      ? "bg-violet-600 text-white"
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
              className={`rounded-2xl p-6 transition-all duration-300 ${
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
                        onClick={() => setPaymentMethod(id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                        style={{
                          background:
                            paymentMethod === id ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
                          border:
                            paymentMethod === id
                              ? "2px solid #7c3aed"
                              : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background:
                              paymentMethod === id
                                ? "linear-gradient(135deg, #7c3aed, #06b6d4)"
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
                            style={{ background: "#7c3aed" }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
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
                            ${(item.price * item.quantity).toLocaleString()}
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
                        style={{ color: "#a78bfa" }}
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
                      <span className="text-white">${total.toLocaleString()}</span>
                    </div>
                    {discount && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "#22c55e" }}>Discount ({discount.code})</span>
                        <span style={{ color: "#22c55e" }}>-${discount.amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Delivery</span>
                      <span style={{ color: "#22c55e" }}>Calculated next</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                      <span className="text-white">Total</span>
                      <span style={{ color: "#a78bfa" }}>${discountedTotal.toLocaleString()}</span>
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

              {step < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 0 && !isStep0Valid}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                    opacity: step === 0 && !isStep0Valid ? 0.5 : 1,
                    cursor: step === 0 && !isStep0Valid ? "not-allowed" : "pointer",
                  }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #4ade80)",
                    boxShadow: "0 8px 32px rgba(34,197,94,0.4)",
                  }}
                >
                  Place Order →{" "}
                  {discountedTotal > 0 ? `$${discountedTotal.toLocaleString()}` : ""}
                </button>
              )}
            </div>
          </div>

          {/* Right: Sticky Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-2xl overflow-hidden"
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
                      ${(item.price * item.quantity).toLocaleString()}
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
                  <span className="text-white">${total.toLocaleString()}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#22c55e" }}>Discount</span>
                    <span style={{ color: "#22c55e" }}>-${discount.amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Delivery</span>
                  <span style={{ color: "#22c55e" }}>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span style={{ color: "#a78bfa" }}>${discountedTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
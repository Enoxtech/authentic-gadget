"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Check, ArrowRight, ArrowLeft, ShoppingBag, Loader2, Truck, Landmark, Copy, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  estimated_days: string | null;
}

interface BankTransferSettings {
  enabled: boolean;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  note: string;
}

const DEFAULT_BANK_TRANSFER_SETTINGS: BankTransferSettings = {
  enabled: true,
  bankName: "GT Bank",
  accountName: "Mavis Osei",
  accountNumber: "1210001009041",
  branch: "",
  note: "Use your order ID as the transfer reference, then contact support with your payment receipt for verification.",
};

const STEPS = [
  { id: "info", label: "Information", icon: "📋" },
  { id: "payment", label: "Payment", icon: "💳" },
  { id: "review", label: "Review", icon: "✅" },
];

const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "Bank Transfer", icon: Landmark, desc: "Transfer to GT Bank and verify after payment" },
  { id: "cod", label: "Pay on Delivery", icon: Truck, desc: "Pay when your order arrives" },
];

export default function CheckoutPage() {
  const { items, total, discount, updateQuantity, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "" });
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [error, setError] = useState("");
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [deliveryAreaId, setDeliveryAreaId] = useState("");
  const [vatPercent, setVatPercent] = useState(0);
  const [bankTransfer, setBankTransfer] = useState<BankTransferSettings | null>(DEFAULT_BANK_TRANSFER_SETTINGS);
  const [showTransferPopup, setShowTransferPopup] = useState(false);
  const [copiedField, setCopiedField] = useState("");

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
      .then((s) => {
        setVatPercent(s?.vatPercent || 0);
        const transfer = s?.bankTransfer as BankTransferSettings | undefined;
        if (transfer?.enabled && transfer.bankName && transfer.accountNumber) {
          setBankTransfer(transfer);
        }
      })
      .catch(() => setVatPercent(0));
  }, []);

  const selectedArea = deliveryAreas.find((a) => a.id === deliveryAreaId) || null;
  const deliveryFee = discount?.freeShipping ? 0 : selectedArea?.fee || 0;
  const subtotalAfterDiscount = discount ? Math.max(0, total - discount.amount) : total;
  const taxAmount = vatPercent > 0 ? Math.round(subtotalAfterDiscount * vatPercent) / 100 : 0;
  const discountedTotal = subtotalAfterDiscount + taxAmount + deliveryFee;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const paymentMethods = PAYMENT_METHODS.filter((method) => method.id !== "bank_transfer" || bankTransfer);

  const selectPaymentMethod = (id: string) => {
    setPaymentMethod(id);
    setError("");
    if (id === "bank_transfer" && bankTransfer) setShowTransferPopup(true);
  };

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(""), 1400);
    } catch {
      setCopiedField("");
    }
  };

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep((s) => {
        const next = s + 1;
        if (next === 1 && paymentMethod === "bank_transfer" && bankTransfer) {
          setShowTransferPopup(true);
        }
        return next;
      });
      setIsAnimating(false);
    }, 300);
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
    if (paymentMethod === "bank_transfer") {
      if (!bankTransfer) {
        setError("Bank transfer is not available right now. Please choose another payment method.");
        setIsProcessing(false);
        return;
      }
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...orderPayload, payment_method: "bank_transfer" }),
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
    const isBankTransfer = paymentMethod === "bank_transfer";
    const finalTotal = confirmedTotal || discountedTotal;
    return (
      <div className="checkout-page min-h-screen flex items-center justify-center">
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
          ) : isBankTransfer ? (
            <p className="text-sm text-white/40 mb-8">
              Your order <span className="font-mono text-white/60">#{orderId}</span> has been received.
              Transfer <span className="font-bold text-white">{formatPrice(finalTotal)}</span> and use your order ID as the payment reference.
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
          {isBankTransfer && bankTransfer && (
            <div
              className="p-4 rounded-[24px] mb-8 text-left space-y-2"
              style={{ background: "rgba(212,168,67,0.10)", border: "1px solid rgba(212,168,67,0.25)" }}
            >
              <p className="text-sm font-bold text-white">Bank transfer details</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-white/40">Bank</span>
                <span className="text-white font-semibold text-right">{bankTransfer.bankName}</span>
                <span className="text-white/40">Account Name</span>
                <span className="text-white font-semibold text-right">{bankTransfer.accountName || "Authentic Gadget"}</span>
                <span className="text-white/40">Account Number</span>
                <span className="text-white font-semibold text-right font-mono">{bankTransfer.accountNumber}</span>
                {bankTransfer.branch && (
                  <>
                    <span className="text-white/40">Branch</span>
                    <span className="text-white font-semibold text-right">{bankTransfer.branch}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-white/50">{bankTransfer.note || "After payment, contact support with your order ID and transfer receipt for verification."}</p>
            </div>
          )}
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
    <div className="checkout-page min-h-screen">
      {showTransferPopup && bankTransfer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 py-6 animate-fade-in">
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] shadow-2xl"
            style={{
              background: "linear-gradient(145deg, #081630, #040820)",
              border: "1px solid rgba(212,168,67,0.28)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: "#D4A843" }}>
                  Manual Transfer
                </p>
                <h3 className="mt-1 text-lg font-bold text-white">Bank Transfer Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferPopup(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close transfer details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 px-5 py-5">
              {[
                ["Bank", bankTransfer.bankName],
                ["Account Name", bankTransfer.accountName || "Authentic Gadget"],
                ["Account Number", bankTransfer.accountNumber],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-2xl p-3"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                >
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</p>
                    <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(label, value)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-white"
                    style={{ background: "rgba(212,168,67,0.18)", border: "1px solid rgba(212,168,67,0.30)" }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedField === label ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}

              <div
                className="rounded-2xl p-4 text-sm leading-relaxed"
                style={{
                  background: "rgba(25,175,255,0.10)",
                  border: "1px solid rgba(25,175,255,0.22)",
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                Place your order first, then transfer the exact total and use your order ID as the payment reference.
                Send your receipt to support for verification.
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => setShowTransferPopup(false)}
                className="w-full rounded-full px-5 py-3 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #D4A843, #19AFFF)" }}
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="checkout-topbar border-b border-white/10"
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

      <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 overflow-x-hidden">
        <div className="grid min-w-0 lg:grid-cols-3 gap-5 lg:gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 min-w-0">
            <div
              className={`rounded-[28px] p-4 sm:p-6 transition-all duration-300 ${
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
                          placeholder="Kwame Mensah"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Email</label>
                        <input
                          value={formData.email}
                          onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                          placeholder="kwame@example.com"
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
                        placeholder="+233 24 000 0000"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Delivery Address</label>
                      <input
                        value={formData.address}
                        onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        placeholder="15 Ringway Road, Osu"
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
                          placeholder="Accra"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Region</label>
                        <input
                          value={formData.state}
                          onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                          placeholder="Greater Accra"
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
                    {paymentMethods.map(({ id, label, icon: Icon, desc }) => (
                      <button
                        key={id}
                        onClick={() => selectPaymentMethod(id)}
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

                    {paymentMethod === "bank_transfer" && bankTransfer && (
                      <div
                        className="mt-3 p-4 rounded-xl space-y-2"
                        style={{ background: "rgba(212,168,67,0.10)", border: "1px solid rgba(212,168,67,0.25)" }}
                      >
                        <p className="text-sm font-semibold text-white">Transfer after placing your order</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-white/40">Bank</span>
                          <span className="text-white text-right font-semibold">{bankTransfer.bankName}</span>
                          <span className="text-white/40">Account Name</span>
                          <span className="text-white text-right font-semibold">{bankTransfer.accountName || "Authentic Gadget"}</span>
                          <span className="text-white/40">Account Number</span>
                          <span className="text-white text-right font-semibold font-mono">{bankTransfer.accountNumber}</span>
                        </div>
                        <p className="text-xs text-white/50">{bankTransfer.note || "Use your order ID as transfer reference and contact support after payment."}</p>
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
                        2-5 business days in Accra · 3-7 days across Ghana
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl min-w-0"
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
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
                          <p className="hidden sm:block text-sm font-bold text-white ml-2 whitespace-nowrap">
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
                      <span style={{ color: deliveryFee === 0 ? "#22c55e" : "var(--checkout-text)" }}>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white/50 font-medium"
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
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl text-white font-bold transition-all w-full sm:w-auto"
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
                  className="flex items-center justify-center gap-2 px-5 sm:px-8 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-60 w-full sm:w-auto text-sm sm:text-base whitespace-normal sm:whitespace-nowrap"
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
                  ) : paymentMethod === "bank_transfer" ? (
                    <>Confirm Bank Transfer → {discountedTotal > 0 ? formatPrice(discountedTotal) : ""}</>
                  ) : (
                    <>Pay Now - {discountedTotal > 0 ? formatPrice(discountedTotal) : ""}</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right: Sticky Order Summary */}
          <div className="lg:col-span-1 min-w-0">
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
                  <span style={{ color: deliveryFee === 0 ? "#22c55e" : "var(--checkout-text)" }}>
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

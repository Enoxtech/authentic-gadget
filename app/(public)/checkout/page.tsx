"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Copy, Landmark, Loader2, MapPin, ShoppingBag, Store, Truck, UserPlus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

type DeliveryMethod = "ship" | "pickup";
type PaymentMethod = "bank_transfer" | "cod";

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

const PICKUP_LOCATION = {
  label: "Authentic Gadget Pickup",
  address: "Abokobi/Pantang Road, close to Tel Energy Oil",
  phone: "0534553165",
  city: "Abokobi / Pantang",
  region: "Greater Accra",
};

const DEFAULT_BANK_TRANSFER_SETTINGS: BankTransferSettings = {
  enabled: true,
  bankName: "GT Bank",
  accountName: "Mavis Osei",
  accountNumber: "1210001009041",
  branch: "",
  note: "Use your order ID as the transfer reference, then contact support with your payment receipt for verification.",
};

const PAYMENT_METHODS = [
  { id: "bank_transfer" as const, label: "Bank Transfer", desc: "Transfer to our account details", icon: Landmark },
  { id: "cod" as const, label: "Pay on Delivery", desc: "Pay when your order arrives", icon: Truck },
];

export default function CheckoutPage() {
  const { items, total, discount, clearCart } = useCart();
  const [step, setStep] = useState<"details" | "payment">("details");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("ship");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Accra",
    region: "Greater Accra",
    notes: "",
  });
  const [createAccount, setCreateAccount] = useState(false);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [deliveryAreaId, setDeliveryAreaId] = useState("");
  const [vatPercent, setVatPercent] = useState(0);
  const [bankTransfer, setBankTransfer] = useState<BankTransferSettings>(DEFAULT_BANK_TRANSFER_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((settings) => {
        setVatPercent(settings?.vatPercent || 0);
        const transfer = settings?.bankTransfer as BankTransferSettings | undefined;
        if (transfer?.enabled && transfer.bankName && transfer.accountNumber) {
          setBankTransfer(transfer);
        }
      })
      .catch(() => {});

    fetch("/api/delivery-areas")
      .then((r) => (r.ok ? r.json() : []))
      .then((areas: DeliveryArea[]) => {
        setDeliveryAreas(areas);
        if (areas.length > 0) setDeliveryAreaId((current) => current || areas[0].id);
      })
      .catch(() => setDeliveryAreas([]));
  }, []);

  const selectedArea = deliveryAreas.find((area) => area.id === deliveryAreaId) || null;
  const subtotalAfterDiscount = discount ? Math.max(0, total - discount.amount) : total;
  const deliveryFee = deliveryMethod === "pickup" || discount?.freeShipping ? 0 : selectedArea?.fee || 0;
  const taxAmount = vatPercent > 0 ? Math.round(subtotalAfterDiscount * vatPercent) / 100 : 0;
  const finalTotal = subtotalAfterDiscount + taxAmount + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const detailsValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    (deliveryMethod === "pickup" || formData.address.trim());

  const bankDetailRows = [
    { label: "Bank", value: bankTransfer.branch ? `${bankTransfer.bankName} (${bankTransfer.branch})` : bankTransfer.bankName },
    { label: "Account Name", value: bankTransfer.accountName },
    { label: "Account Number", value: bankTransfer.accountNumber },
  ].filter((row) => row.value);

  function update(field: keyof typeof formData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  async function copyBankValue(value: string) {
    try {
      await navigator.clipboard?.writeText(value);
    } catch {}
  }

  function handleContinue() {
    setError("");
    if (!detailsValid) {
      setError("Please complete the required delivery details.");
      return;
    }
    setStep("payment");
  }

  async function handlePlaceOrder() {
    setError("");
    setIsProcessing(true);

    const isPickup = deliveryMethod === "pickup";
    const deliveryAddress = isPickup ? `Pickup: ${PICKUP_LOCATION.address}` : formData.address;
    const deliveryCity = isPickup ? PICKUP_LOCATION.city : formData.city;
    const deliveryRegion = isPickup ? PICKUP_LOCATION.region : formData.region;
    const deliveryNote = isPickup
      ? `Delivery method: Pickup. Pickup address: ${PICKUP_LOCATION.address}. Call number: ${PICKUP_LOCATION.phone}.`
      : `Delivery method: Ship.${selectedArea ? ` Delivery area: ${selectedArea.name}.` : ""}`;
    const orderNote = [deliveryNote, formData.notes.trim()].filter(Boolean).join(" ");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: deliveryAddress,
          shipping_city: deliveryCity,
          shipping_region: deliveryRegion,
          order_note: orderNote,
          coupon_code: discount?.code || undefined,
          delivery_area_id: isPickup ? undefined : deliveryAreaId || undefined,
          payment_method: paymentMethod,
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });
      const data = (await response.json()) as { error?: string; orderId?: string; total?: number };
      if (!response.ok || !data.orderId || typeof data.total !== "number") {
        throw new Error(data.error || "Order creation failed");
      }
      setOrderId(data.orderId);
      setConfirmedTotal(data.total);
      clearCart();
      setOrderPlaced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-white/60">Your cart is empty.</p>
          <Link href="/products" className="checkout-gradient mt-4 inline-flex rounded-full px-5 py-3 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #D4A843, #19AFFF)" }}>
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    const isBankTransfer = paymentMethod === "bank_transfer";
    return (
      <div className="checkout-page min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[28px] p-6 text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #22c55e, #4ade80)" }}>
            <Check className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Order Placed</h1>
          <p className="mt-2 text-sm text-white/60">
            Order <span className="font-mono text-white">#{orderId}</span> is pending in admin until payment is confirmed.
          </p>
          {isBankTransfer && (
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-left text-sm text-blue-900">
              <p className="font-bold">Complete your transfer</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-700">
                Transfer exactly <span className="font-bold text-blue-950">{formatPrice(confirmedTotal)}</span> and use your order ID as the payment reference.
              </p>
              <div className="mt-4 space-y-2">
                {bankDetailRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">{row.label}</p>
                      <p className="break-words text-sm font-extrabold text-blue-950">{row.value}</p>
                    </div>
                    <button type="button" onClick={() => copyBankValue(row.value)} className="shrink-0 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-900">
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Link href="/products" className="checkout-gradient mt-6 inline-flex rounded-full px-5 py-3 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #D4A843, #19AFFF)" }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page min-h-screen">
      <div className="checkout-topbar border-b border-white/10" style={{ background: "rgba(4,8,32,0.84)", backdropFilter: "blur(20px)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="Authentic Gadget" width={28} height={28} className="h-7 w-7 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            <span className="text-lg font-bold text-white">Authentic Gadget</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <ShoppingBag className="h-4 w-4" />
            Checkout
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-5xl gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0">
          <div className="mb-6 flex items-center gap-3">
            {[
              ["details", "Delivery Details"],
              ["payment", "Payment"],
            ].map(([id, label], index) => (
              <div key={id} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === id || (id === "details" && step === "payment") ? "bg-[#D4A843] text-[#040820]" : "bg-white/10 text-white/40"}`}>
                  {index + 1}
                </div>
                <span className={`text-sm font-semibold ${step === id ? "text-white" : "text-white/40"}`}>{label}</span>
                {index === 0 && <div className="h-px w-10 bg-white/12" />}
              </div>
            ))}
          </div>

          <div className="rounded-[28px] p-4 sm:p-6" style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.10)" }}>
            {step === "details" ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-white/72">Full Name *</label>
                  <input value={formData.name} onChange={(e) => update("name", e.target.value)} placeholder="Kwame Mensah" className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#D4A843]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-white/72">Phone Number *</label>
                  <input value={formData.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+233 53 455 3165" className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#D4A843]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-white/72">Email Address *</label>
                  <input value={formData.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" type="email" className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#D4A843]" />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                  <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} className="h-4 w-4 accent-[#D4A843]" />
                  <UserPlus className="h-4 w-4 text-[#D4A843]" />
                  Create an account to track this order (optional)
                </label>

                {deliveryMethod === "ship" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-white/72">Delivery Address *</label>
                    <textarea value={formData.address} onChange={(e) => update("address", e.target.value)} placeholder="House number, street name, area..." rows={2} className="w-full resize-none rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#D4A843]" />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/72">Delivery</label>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.04] p-1">
                    {[
                      { id: "ship" as const, label: "Ship", icon: Truck },
                      { id: "pickup" as const, label: "Pickup", icon: Store },
                    ].map(({ id, label, icon: Icon }) => (
                      <button key={id} type="button" onClick={() => setDeliveryMethod(id)} className={`flex items-center justify-center gap-2 rounded-[10px] py-3 text-sm font-bold transition ${deliveryMethod === id ? "checkout-toggle-active" : "text-white/45"}`}>
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {deliveryMethod === "pickup" ? (
                  <div className="rounded-xl border-2 border-[#D4A843] bg-[#D4A843]/10 p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#D4A843]" />
                      <div>
                        <p className="text-sm font-bold text-white">{PICKUP_LOCATION.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/65">{PICKUP_LOCATION.address}</p>
                        <p className="mt-1 text-xs font-semibold text-white/70">Call: {PICKUP_LOCATION.phone}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  deliveryAreas.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-white/72">Delivery Area *</label>
                      <select value={deliveryAreaId} onChange={(e) => setDeliveryAreaId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-[#D4A843]">
                        {deliveryAreas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name} - {formatPrice(area.fee)}{area.estimated_days ? ` - ${area.estimated_days}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-white/72">Order Notes (optional)</label>
                  <textarea value={formData.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any special instructions..." rows={2} className="w-full resize-none rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#D4A843]" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Choose Payment Method</h2>
                {PAYMENT_METHODS.map(({ id, label, desc, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => { setPaymentMethod(id); setError(""); }} className="flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition" style={{ borderColor: paymentMethod === id ? "#D4A843" : "rgba(255,255,255,0.10)", background: paymentMethod === id ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.04)" }}>
                    <Icon className={`h-5 w-5 shrink-0 ${paymentMethod === id ? "text-[#D4A843]" : "text-white/45"}`} />
                    <span className="flex-1">
                      <span className="block text-sm font-bold text-white">{label}</span>
                      <span className="mt-0.5 block text-xs text-white/42">{desc}</span>
                    </span>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${paymentMethod === id ? "border-[#D4A843]" : "border-white/25"}`}>
                      {paymentMethod === id && <span className="h-2.5 w-2.5 rounded-full bg-[#D4A843]" />}
                    </span>
                  </button>
                ))}

                {paymentMethod === "bank_transfer" && (
                  <div className="rounded-xl bg-blue-50 p-4 text-sm">
                    <p className="mb-2 font-bold text-blue-950">Bank Transfer Details</p>
                    <div className="space-y-2">
                      {bankDetailRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-blue-950">
                          <span>
                            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-blue-500">{row.label}</span>
                            <span className="block break-words text-sm font-extrabold">{row.value}</span>
                          </span>
                          <button type="button" onClick={() => copyBankValue(row.value)} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1.5 text-xs font-bold text-blue-900">
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-blue-500">{bankTransfer.note}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step === "payment" ? (
              <button type="button" onClick={() => setStep("details")} className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white/55">
                <ArrowLeft className="h-4 w-4" />
                Back to details
              </button>
            ) : (
              <Link href="/products" className="flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white/45">
                Continue Shopping
              </Link>
            )}

            {step === "details" ? (
              <button type="button" onClick={handleContinue} className="checkout-gradient flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white sm:w-auto" style={{ background: "linear-gradient(135deg, #D4A843, #19AFFF)" }}>
                Continue to Payment <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={handlePlaceOrder} disabled={isProcessing} className="checkout-gradient flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-60 sm:w-auto" style={{ background: paymentMethod === "cod" ? "linear-gradient(135deg, #D4A843, #19AFFF)" : "linear-gradient(135deg, #22c55e, #4ade80)" }}>
                {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : paymentMethod === "bank_transfer" ? `Confirm Transfer - ${formatPrice(finalTotal)}` : `Confirm Order - ${formatPrice(finalTotal)}`}
              </button>
            )}
          </div>
        </section>

        <aside className="min-w-0">
          <div className="sticky top-24 rounded-[28px] p-5" style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <h3 className="font-bold text-white">Order Summary</h3>
            <p className="mt-1 text-xs text-white/40">{itemCount} items</p>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    <img src={item.image ?? item.images?.[0] ?? "/placeholder.png"} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-white">{item.name}</p>
                    <p className="text-xs text-white/40">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-white">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-white/55"><span>Subtotal</span><span className="text-white">{formatPrice(total)}</span></div>
              {discount && <div className="flex justify-between text-green-400"><span>Discount ({discount.code})</span><span>-{formatPrice(discount.amount)}</span></div>}
              <div className="flex justify-between text-white/55">
                <span>Delivery ({deliveryMethod === "pickup" ? "Pickup" : selectedArea?.name || "Ship"})</span>
                <span className={deliveryFee === 0 ? "text-green-400" : "text-white"}>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
              </div>
              {taxAmount > 0 && <div className="flex justify-between text-white/55"><span>VAT ({vatPercent}%)</span><span className="text-white">{formatPrice(taxAmount)}</span></div>}
              <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white"><span>Total</span><span style={{ color: "#D4A843" }}>{formatPrice(finalTotal)}</span></div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

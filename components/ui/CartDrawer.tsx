"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, ShoppingCart, Trash2, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ExitIntentModal from "./ExitIntentModal";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 2000;

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, isOpen, closeCart, discount, setDiscount, showExitModal, setShowExitModal, upsellProducts, addItem } = useCart();
  const [animatedTotal, setAnimatedTotal] = useState(total);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const cartTotal = discount ? Math.max(0, total - discount.amount) : total;

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: total }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon code");
        return;
      }
      setDiscount({
        code: data.code,
        amount: data.discount,
        label: data.freeShipping ? "Free delivery" : data.type === "percent" ? `${data.value}% off` : "Discount applied",
        freeShipping: data.freeShipping,
      });
      setCouponInput("");
    } catch {
      setCouponError("Couldn't apply coupon. Please try again.");
    } finally {
      setApplyingCoupon(false);
    }
  }

  // Animate subtotal on change
  useEffect(() => {
    setAnimatedTotal(cartTotal);
  }, [cartTotal]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full z-50 w-full max-w-md text-white transition-transform duration-300 flex flex-col cart-drawer-glass ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={isOpen ? { animation: 'slideInRight 0.35s cubic-bezier(0.4,0,0.2,1)' } : undefined}
      >
        {/* Header with delivery estimate */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-electric" />
            <h2 className="text-lg font-bold">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-electric/20 text-electric text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-2 text-xs px-6 py-2" style={{ color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span>🚚</span>
            <span>Estimated delivery: 2-5 business days</span>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <ShoppingCart className="w-16 h-16 text-white/10 mb-4" />
              <h3 className="text-lg font-semibold text-white/60 mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-white/30 mb-8">
                Looks like you haven&apos;t added anything yet.
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-3 bg-electric hover:bg-electric/90 text-white rounded-xl font-semibold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-white/5 px-4 py-2">
              {/* Coupon section */}
              <li className="mb-4 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    placeholder="Enter coupon code"
                    disabled={applyingCoupon}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/40 outline-none disabled:opacity-50"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                    onKeyDown={e => { if (e.key === 'Enter') applyCoupon(); }}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white shrink-0 disabled:opacity-50"
                    style={{ background: 'rgba(167,139,250,0.3)', border: '1px solid rgba(167,139,250,0.3)' }}
                  >
                    {applyingCoupon ? "Checking…" : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs" style={{ color: '#f87171' }}>{couponError}</p>
                )}
                {discount && (
                  <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: '#22c55e' }}>
                    <span>✓</span>
                    <span>Code <strong>{discount.code}</strong> applied — {discount.label || 'saved'}</span>
                    <button onClick={() => setDiscount(null)} className="ml-auto text-white/30 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </li>

              {/* Free shipping progress */}
              <li className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'rgba(248,249,251,0.6)' }}>
                  <span>Free shipping progress</span>
                  <span style={{ color: '#a78bfa' }}>{formatPrice(Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal))} away</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                      background: cartTotal >= FREE_SHIPPING_THRESHOLD
                        ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                        : 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                    }}
                  />
                </div>
                {cartTotal >= FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: '#22c55e' }}>🎉 You&apos;ve unlocked free shipping!</p>
                )}
              </li>
              {items.map((item) => (
                <li key={item.id}
                  className="flex gap-4 p-4 transition-colors duration-200 cart-item-glass"
                  style={{ marginBottom: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/5 shrink-0">
                    <Image
                      src={item.image ?? "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-white hover:text-electric transition-colors line-clamp-2 leading-snug"
                    >
                      {item.name}
                    </Link>
                    {item.category && (
                      <p className="text-xs text-white/40 mt-0.5">{item.category}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white/5 rounded-lg">
                        <button
                          onClick={(e) => {
                            e.currentTarget.classList.add('qty-bounce');
                            setTimeout(() => e.currentTarget.classList.remove('qty-bounce'), 300);
                            updateQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-sm text-white/60 hover:text-white transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.currentTarget.classList.add('qty-bounce');
                            setTimeout(() => e.currentTarget.classList.remove('qty-bounce'), 300);
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-sm text-white/60 hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-bold text-electric">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start p-1.5 text-white/30 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setWishlist(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                    }}
                    className={`self-start p-1.5 transition-colors ${wishlist.includes(item.id) ? 'text-red-400' : 'text-white/30 hover:text-red-400'}`}
                    aria-label={`Move ${item.name} to wishlist`}
                  >
                    <Heart className={`w-4 h-4 ${wishlist.includes(item.id) ? 'fill-red-400' : ''}`} />
                  </button>
                </li>
              ))}

              {/* Smart Upsell */}
              <li className="mt-4 mb-2">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">💡</span>
                    <p className="text-xs font-semibold" style={{ color: '#a78bfa' }}>Complete your setup</p>
                  </div>
                  {upsellProducts.slice(0, 1).map(upsell => (
                    <div key={upsell.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={upsell.image} alt={upsell.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white text-xs">{upsell.name}</p>
                        <p className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>Matches perfectly with your order</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{formatPrice(upsell.price)}</p>
                        <button
                          onClick={() => addItem({ id: upsell.id, name: upsell.name, price: upsell.price, image: upsell.image, slug: upsell.slug })}
                          className="text-xs px-2 py-1 rounded-lg mt-1"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white' }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </li>
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-6 space-y-4">
            {discount && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: '#22c55e' }}>Discount ({discount.code})</span>
                <span style={{ color: '#22c55e' }}>-{formatPrice(discount.amount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-white/60">Subtotal</span>
              <span className="text-xl font-bold">{formatPrice(animatedTotal)}</span>
            </div>
            <p className="text-xs text-white/30">Shipping calculated at checkout</p>
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full py-3.5 text-white text-center rounded-xl font-bold transition-colors"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={closeCart}
                className="block w-full py-3 text-white/50 hover:text-white text-center rounded-xl font-medium transition-colors"
              >
                Continue Shopping
              </button>
              {clearConfirm ? (
                <div className="flex gap-2">
                  <button onClick={() => { removeItem(items.map(i => i.id).reduce((_, id) => id)); setClearConfirm(false); closeCart(); }}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl text-white" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    Yes, clear all
                  </button>
                  <button onClick={() => setClearConfirm(false)}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl text-white/60" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setClearConfirm(true)}
                  className="block w-full py-2 text-xs text-white/30 hover:text-red-400 text-center rounded-xl transition-colors"
                >
                  Clear cart
                </button>
              )}
            </div>
          </div>
        )}
        {/* Exit Intent Modal */}
        {showExitModal && <ExitIntentModal onClose={() => setShowExitModal(false)} />}
      </div>
    </>
  );
}

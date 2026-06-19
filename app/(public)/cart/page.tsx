"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();

  const subtotal = total;
  const shipping = subtotal > 2000 ? 0 : 150;
  const overallTotal = subtotal + shipping;

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    updateQuantity(id, qty);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-fog-200 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-charcoal/20" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-2">Your cart is empty</h1>
          <p className="text-charcoal/50 mb-8">Start shopping to add items to your cart</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-electric text-white font-semibold px-8 py-4 rounded-2xl hover:bg-electric/90 transition-colors"
          >
            Browse Products <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fog py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs crumbs={[{ label: "Cart" }]} />

        <h1 className="text-2xl font-bold text-charcoal mb-6">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-card"
              >
                <div className="relative w-24 h-24 bg-fog rounded-xl overflow-hidden shrink-0">
                  <Image src={item.image ?? ""} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-charcoal text-sm line-clamp-2">{item.name}</p>
                  <p className="font-bold text-charcoal mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 bg-fog rounded-xl">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-fog-200 rounded-xl transition-colors disabled:opacity-40"
                      >
                        <Minus className="w-4 h-4 text-charcoal" />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-fog-200 rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4 text-charcoal" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-charcoal">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-card h-fit sticky top-24">
            <h2 className="font-bold text-charcoal mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Subtotal</span>
                <span className="text-charcoal font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Shipping</span>
                <span className="text-charcoal font-medium">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                  🎉 You qualify for free shipping!
                </p>
              )}
              <div className="border-t border-fog-200 pt-3 flex justify-between">
                <span className="font-bold text-charcoal">Total</span>
                <span className="font-bold text-electric">{formatPrice(overallTotal)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-electric text-white font-semibold py-4 rounded-2xl hover:bg-electric/90 transition-colors"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="mt-3 w-full inline-flex items-center justify-center text-sm text-charcoal/50 hover:text-electric transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

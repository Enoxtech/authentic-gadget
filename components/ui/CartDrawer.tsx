"use client";

import { useCart } from "@/context/CartContext";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, isOpen, closeCart } = useCart();

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
        className={`fixed right-0 top-0 h-full z-50 w-full max-w-md bg-midnight text-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
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
            <ul className="divide-y divide-white/5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 p-5 hover:bg-white/5 transition-colors">
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
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-sm text-white/60 hover:text-white transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-sm text-white/60 hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-bold text-electric">
                        ₵{item.price.toLocaleString()}
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
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Subtotal</span>
              <span className="text-xl font-bold">₵{total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-white/30">Shipping calculated at checkout</p>
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full py-3.5 bg-electric hover:bg-electric/90 text-white text-center rounded-xl font-bold transition-colors"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={closeCart}
                className="block w-full py-3 text-white/50 hover:text-white text-center rounded-xl font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

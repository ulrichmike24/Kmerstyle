import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatXAF } from '../lib/formatters';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartSubtotal,
    cartItemCount,
    discountAmount,
    freeShippingThreshold,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setIsCheckoutOpen,
    language,
    t,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    setCouponFeedback({
      msg: result.message,
      isError: !result.success,
    });
    if (result.success) {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-amber-800" />
              <h2 className="font-serif font-bold text-lg text-stone-900">
                {t.cart.title}
              </h2>
              <span className="bg-stone-100 text-stone-600 font-bold text-xs px-2 py-0.5 rounded-full">
                {cartItemCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-stone-400 hover:text-red-600 p-1.5 transition-colors"
                  title={t.cart.clearCart}
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Free shipping progress bar */}
          {cart.length > 0 && (
            <div className="bg-amber-50/70 p-3.5 border-b border-amber-200/60 text-xs">
              <div className="flex items-center justify-between font-semibold text-amber-900 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  {remainingForFreeShipping > 0
                    ? t.freeDeliveryThreshold.replace('{amount}', formatXAF(remainingForFreeShipping))
                    : t.freeDeliveryUnlocked}
                </span>
                <span className="font-mono text-[11px] font-bold">
                  {Math.round(freeShippingProgress)}%
                </span>
              </div>
              <div className="w-full bg-amber-200/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {t.cart.emptyTitle}
                </h3>
                <p className="text-xs text-stone-500 max-w-xs">
                  {t.cart.emptySub}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-6 py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-amber-800 transition-colors"
                >
                  {t.cart.startShopping}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-3 bg-stone-50/70 p-3 rounded-2xl border border-stone-200/80"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title[language]}
                    className="w-18 h-22 object-cover rounded-xl shrink-0 border border-stone-200"
                  />

                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-serif font-bold text-xs text-stone-900 line-clamp-1">
                          {item.product.title[language]}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-stone-400 hover:text-red-500 p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="text-[11px] text-stone-500 space-x-2 mt-0.5 font-medium">
                        {item.selectedSize && <span>Taille : {item.selectedSize}</span>}
                        {item.selectedColor && <span>• {item.selectedColor}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60">
                      <div className="flex items-center border border-stone-200 rounded-full bg-white px-1">
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-black"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-black"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-stone-900 font-mono">
                        {formatXAF(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/50 space-y-3.5">
              {/* Promo Code Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-medium">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Tag size={13} className="text-emerald-700" />
                      {appliedCoupon.code} (-{formatXAF(discountAmount)})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-red-600 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t.cart.promoCodePlaceholder}
                      className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-700 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                    >
                      {t.cart.applyPromo}
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-1 font-medium ${
                      couponFeedback.isError ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {couponFeedback.msg}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-200/80 pt-3">
                <div className="flex justify-between">
                  <span>{t.cart.subtotal}</span>
                  <span className="font-semibold text-stone-900">{formatXAF(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>{t.cart.discount}</span>
                    <span>-{formatXAF(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.cart.deliveryFee}</span>
                  <span className="text-stone-500 italic">
                    {language === 'fr' ? 'Calculé à l’étape suivante' : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-stone-900 border-t border-stone-200 pt-2">
                  <span>{t.cart.total}</span>
                  <span className="font-mono text-amber-900">
                    {formatXAF(Math.max(0, cartSubtotal - discountAmount))}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-full shadow-lg transition-all active:scale-95"
              >
                <span>{t.cart.checkoutBtn}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

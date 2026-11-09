import React, { useState, useEffect } from 'react';
import { Zap, Clock, ShoppingBag, Eye } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatXAF } from '../lib/formatters';
import { Product } from '../types';

export const FlashSaleSection: React.FC = () => {
  const { products, language, t, addToCart, setActiveProductDetail } = useStore();

  const flashProducts = products.filter((p) => p.isFlashSale);

  // Live countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (flashProducts.length === 0) return null;

  const handleQuickAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (p.variants.length > 0) {
      // Pick first available in-stock variant
      const firstAvailable = p.variants.find((v) => v.stock > 0) || p.variants[0];
      addToCart(p, firstAvailable, 1);
    }
  };

  return (
    <section id="flash-sale-section" className="py-12 bg-amber-50/60 border-y border-amber-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header & Live Countdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-amber-200/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md animate-pulse">
              <Zap size={22} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-800">
                  {language === 'fr' ? 'OFFRES EXCLUSIVES' : 'LIMITED TIME DEALS'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                  -25% MAX
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
                {t.sections.flashSales}
              </h2>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-white px-4 py-2.5 rounded-2xl border border-amber-200 shadow-sm">
            <Clock size={16} className="text-amber-700" />
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider mr-1">
              {language === 'fr' ? 'Fin dans :' : 'Ends in :'}
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-sm text-stone-900">
              <span className="px-2 py-1 rounded bg-stone-900 text-amber-400">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded bg-stone-900 text-amber-400">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded bg-stone-900 text-amber-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Flash Sale Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {flashProducts.slice(0, 4).map((p) => {
            const discountPct = p.flashSaleDiscountPercent || (p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 20);

            return (
              <div
                key={p.id}
                onClick={() => setActiveProductDetail(p)}
                className="group bg-white rounded-2xl overflow-hidden border border-amber-200/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-stone-100">
                  <img
                    src={p.images[0]}
                    alt={p.title[language]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Badge discount */}
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    -{discountPct}%
                  </div>

                  {/* Quick look button */}
                  <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="bg-white/95 text-stone-900 font-bold text-xs px-3.5 py-2 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                      <Eye size={14} />
                      {language === 'fr' ? 'Aperçu rapide' : 'Quick View'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span className="uppercase font-semibold tracking-wider text-[10px] text-amber-800">
                        {p.brand}
                      </span>
                      <span className="text-amber-500 font-semibold">★ {p.rating.toFixed(1)}</span>
                    </div>

                    <h3 className="font-serif font-bold text-sm text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
                      {p.title[language]}
                    </h3>
                  </div>

                  <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-extrabold text-stone-900">
                        {formatXAF(p.price)}
                      </div>
                      {p.compareAtPrice && (
                        <div className="text-xs text-stone-400 line-through">
                          {formatXAF(p.compareAtPrice)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(p, e)}
                      className="p-2.5 rounded-full bg-stone-900 hover:bg-amber-700 text-white transition-colors shadow active:scale-90"
                      title={t.product.addToCart}
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

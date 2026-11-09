import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  Ruler,
  Check,
  Share2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant } from '../types';
import { formatXAF } from '../lib/formatters';

export const ProductDetailModal: React.FC = () => {
  const {
    activeProductDetail,
    setActiveProductDetail,
    language,
    t,
    addToCart,
    isInWishlist,
    toggleWishlist,
    setIsSizeGuideOpen,
    setIsCheckoutOpen,
    products,
  } = useStore();

  const product = activeProductDetail;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      // Find first available in stock
      const initial = product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedVariant(initial);
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const activePrice = product.price + (selectedVariant?.priceOffset || 0);
  const currentStock = selectedVariant ? selectedVariant.stock : 0;

  // Complete the Look items
  const completeLookProducts = products.filter((p) =>
    product.completeLookIds?.includes(p.id)
  );

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    setActiveProductDetail(null);
    setIsCheckoutOpen(true);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Bonjour KamerChic ! Je souhaite des informations / commander cet article : "${product.title[language]}" (${formatXAF(activePrice)}). Réf: ${selectedVariant?.sku || product.id}`
    );
    window.open(`https://wa.me/237699000000?text=${text}`, '_blank');
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 max-h-[94vh] flex flex-col overflow-hidden">
        {/* Sticky Modal Header */}
        <div className="px-6 py-3.5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span className="uppercase tracking-wider font-bold text-amber-800">
              {product.brand}
            </span>
            <span>•</span>
            <span>{product.subCategory}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleWishlist(product.id)}
              className="p-2 text-stone-600 hover:text-red-500 hover:bg-stone-100 rounded-full transition-colors"
              title={t.wishlist.title}
            >
              <Heart
                size={18}
                className={isFavorited ? 'fill-red-500 text-red-500' : ''}
              />
            </button>
            <button
              onClick={() => setActiveProductDetail(null)}
              className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 sm:px-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Gallery with Zoom */}
            <div className="space-y-3">
              <div
                className="relative aspect-3/4 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 cursor-crosshair group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.title[language]}
                  className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                    isZoomed ? 'scale-135' : 'scale-100'
                  }`}
                />

                {product.isFlashSale && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow">
                    Vente Flash -{product.flashSaleDiscountPercent || 20}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-amber-700 shadow-md scale-95'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details & Purchase Options */}
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                  {product.title[language]}
                </h1>

                {/* Rating & Review summary */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(product.rating) ? 'fill-amber-400' : 'text-stone-300'}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-800">
                    {product.rating.toFixed(1)} / 5
                  </span>
                  <span className="text-xs text-stone-400">
                    ({product.reviews.length} {language === 'fr' ? 'avis vérifiés au Cameroun' : 'verified Cameroon reviews'})
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
                    {formatXAF(activePrice)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm sm:text-base text-stone-400 line-through">
                      {formatXAF(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Variants: Colors */}
              {product.variants.some((v) => v.color) && (
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-2">
                    {t.product.selectColor} :{' '}
                    <span className="text-stone-900 font-semibold">
                      {selectedVariant?.color}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(product.variants.map((v) => v.color))
                    ).map((colorName) => {
                      const v = product.variants.find((item) => item.color === colorName);
                      const isSelected = selectedVariant?.color === colorName;
                      return (
                        <button
                          key={colorName}
                          onClick={() => v && setSelectedVariant(v)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-sm'
                              : 'border-stone-200 text-stone-700 hover:border-stone-400 bg-white'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: v?.colorHex || '#ccc' }}
                          />
                          <span>{colorName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variants: Sizes */}
              {product.variants.some((v) => v.size) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase text-stone-600">
                      {t.product.selectSize} :{' '}
                      <span className="text-stone-900 font-semibold">
                        {selectedVariant?.size}
                      </span>
                    </label>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-xs text-amber-800 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Ruler size={13} />
                      {t.product.sizeGuide}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      const isOutOfStock = v.stock === 0;

                      return (
                        <button
                          key={v.id}
                          disabled={isOutOfStock}
                          onClick={() => setSelectedVariant(v)}
                          className={`min-w-12 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'border-stone-900 bg-stone-900 text-white shadow'
                              : isOutOfStock
                              ? 'border-stone-200 bg-stone-100 text-stone-300 line-through cursor-not-allowed'
                              : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                          }`}
                        >
                          {v.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Real-time stock status badge */}
              <div className="flex items-center gap-2">
                {currentStock > 3 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Check size={13} />
                    {t.product.inStock} ({currentStock} disponibles)
                  </span>
                ) : currentStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300 animate-pulse">
                    ⚠️ {t.product.lowStock.replace('{count}', String(currentStock))}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                    {t.product.outOfStock}
                  </span>
                )}
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:bg-white text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-black text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(currentStock || 1, q + 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:bg-white text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    disabled={currentStock === 0}
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-full shadow transition-all active:scale-95"
                  >
                    <ShoppingBag size={17} />
                    {t.product.addToCart}
                  </button>

                  <button
                    disabled={currentStock === 0}
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-300 text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-full shadow transition-all active:scale-95"
                  >
                    <span>{t.product.buyNow}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* WhatsApp Order Button */}
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-full shadow transition-all"
                >
                  <Share2 size={15} />
                  <span>{t.product.shareWhatsApp} (Commande directe)</span>
                </button>
                {showShareToast && (
                  <p className="text-center text-xs text-emerald-700 font-medium">
                    Redirection vers WhatsApp pour finaliser votre commande...
                  </p>
                )}
              </div>

              {/* Cameroon Delivery & Reassurance Box */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2.5 text-xs text-stone-700">
                <div className="flex items-start gap-2.5 font-semibold text-stone-900">
                  <Truck size={17} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{t.product.deliveryEstimate}</p>
                    <ul className="text-stone-600 text-[11px] font-normal space-y-1 mt-1">
                      <li>• {t.product.doualaDelivery}</li>
                      <li>• {t.product.yaoundeDelivery}</li>
                      <li>• {t.product.provincesDelivery}</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-[11px] text-stone-600 pt-2 border-t border-stone-200">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>{t.product.freeReturns}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Details */}
          <div className="border-t border-stone-100 pt-6">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-2">
              {language === 'fr' ? 'Description & Confection' : 'Product Details'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              {product.description[language]}
            </p>
            {product.fabricOrMaterial && (
              <p className="text-xs text-stone-500 mt-2 font-medium">
                <strong>{t.product.material} :</strong> {product.fabricOrMaterial}
              </p>
            )}
          </div>

          {/* Complete the Look section */}
          {completeLookProducts.length > 0 && (
            <div className="border-t border-stone-100 pt-6">
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                  STYLIST PICKS
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {t.sections.completeTheLook}
                </h3>
                <p className="text-xs text-stone-500">{t.sections.completeTheLookSub}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {completeLookProducts.map((paired) => (
                  <div
                    key={paired.id}
                    onClick={() => setActiveProductDetail(paired)}
                    className="group bg-stone-50 hover:bg-white rounded-xl p-2.5 border border-stone-200 cursor-pointer transition-all flex items-center gap-3"
                  >
                    <img
                      src={paired.images[0]}
                      alt={paired.title[language]}
                      className="w-14 h-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-serif font-bold text-xs text-stone-900 truncate group-hover:text-amber-800">
                        {paired.title[language]}
                      </h4>
                      <p className="text-xs font-bold text-stone-700 mt-0.5">
                        {formatXAF(paired.price)}
                      </p>
                      <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5 mt-1">
                        {language === 'fr' ? 'Découvrir' : 'View'}
                        <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Customer Reviews */}
          <div className="border-t border-stone-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {t.product.reviews} ({product.reviews.length})
              </h3>
              <div className="text-xs text-stone-500 font-medium">
                ★ <strong>{product.rating.toFixed(1)}</strong> / 5.0
              </div>
            </div>

            <div className="space-y-3">
              {product.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{rev.authorName}</span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-500 font-medium">{rev.city}</span>
                      {rev.verifiedBuyer && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          ✓ {t.product.verifiedBuyer}
                        </span>
                      )}
                    </div>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= rev.rating ? 'fill-amber-400' : 'text-stone-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-700 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

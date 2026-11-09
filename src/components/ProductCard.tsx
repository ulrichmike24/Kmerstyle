import React, { useState } from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatXAF } from '../lib/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, t, addToCart, isInWishlist, toggleWishlist, setActiveProductDetail } = useStore();
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variants.length > 0) {
      const available = product.variants.find((v) => v.stock > 0) || product.variants[0];
      addToCart(product, available, 1);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => setActiveProductDetail(product)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/90 hover:border-amber-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Image Container with Skeleton Loader */}
      <div className="relative aspect-3/4 overflow-hidden bg-stone-100">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer" />
        )}
        <img
          src={product.images[0]}
          alt={product.title[language]}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Wishlist toggle */}
        <button
          onClick={handleHeartClick}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-red-500 hover:bg-white shadow transition-all active:scale-90"
          title={t.wishlist.title}
        >
          <Heart
            size={16}
            className={isFavorited ? 'fill-red-500 text-red-500' : 'text-stone-700'}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.isFlashSale && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
              Flash -{product.flashSaleDiscountPercent || 20}%
            </span>
          )}
          {product.isNewArrival && !product.isFlashSale && (
            <span className="px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow">
              Nouveau
            </span>
          )}
        </div>

        {/* Stock pill */}
        {totalStock <= 3 && totalStock > 0 && (
          <div className="absolute bottom-2.5 left-2.5 bg-amber-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {t.product.lowStock.replace('{count}', String(totalStock))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="font-semibold text-amber-800 tracking-wider uppercase text-[10px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-stone-600 text-[11px]">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
              <span className="text-stone-400">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-serif font-bold text-sm text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
            {product.title[language]}
          </h3>
        </div>

        <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-sm sm:text-base font-extrabold text-stone-900">
              {formatXAF(product.price)}
            </div>
            {product.compareAtPrice && (
              <div className="text-[11px] text-stone-400 line-through">
                {formatXAF(product.compareAtPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className="p-2 sm:p-2.5 rounded-full bg-stone-100 group-hover:bg-amber-700 text-stone-800 group-hover:text-white transition-all shadow-sm active:scale-90"
            title={t.product.addToCart}
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

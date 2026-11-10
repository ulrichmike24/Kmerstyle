import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Truck,
  Menu,
  X,
  Globe,
  Crown,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { formatXAF } from '../lib/formatters';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    cartItemCount,
    cartSubtotal,
    wishlist,
    setIsCartOpen,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setActiveTrackingOrder,
    orders,
    setIsLoyaltyModalOpen,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const categories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.categories.all },
    { id: 'men', label: t.categories.men },
    { id: 'women', label: t.categories.women },
    { id: 'shoes', label: t.categories.shoes },
    { id: 'watches', label: t.categories.watches },
    { id: 'perfumes', label: t.categories.perfumes },
    { id: 'accessories', label: t.categories.accessories },
  ];

  const handleCategoryClick = (catId: ProductCategory | 'all') => {
    setSelectedCategory(catId);
    setMobileMenuOpen(false);
  };

  const openLatestOrderTracking = () => {
    if (orders.length > 0) {
      setActiveTrackingOrder(orders[0]);
    } else {
      // Create empty search trigger
      setActiveTrackingOrder({
        id: '',
        orderNumber: '',
        customerId: '',
        customerName: '',
        customerPhone: '',
        deliveryAddress: { city: '', quartier: '', landmark: '', recipientName: '', phone: '' },
        deliveryZoneId: '',
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        discount: 0,
        total: 0,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'pending',
        trackingEvents: [],
        createdAt: '',
        updatedAt: '',
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Announcement Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="font-medium text-[11px] sm:text-xs tracking-wide">
              {t.announcement}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-stone-300">
            {/* Showrooms Note */}
            <div className="hidden md:flex items-center gap-1.5 text-stone-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Siège Bastos, Yaoundé • Expédition dans les 10 régions</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 border-l border-stone-700 pl-3">
              <Globe size={13} className="text-stone-400" />
              <button
                onClick={() => setLanguage('fr')}
                className={`text-[11px] font-semibold px-1 rounded transition-colors ${
                  language === 'fr' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                FR
              </button>
              <span className="text-stone-600">|</span>
              <button
                onClick={() => setLanguage('en')}
                className={`text-[11px] font-semibold px-1 rounded transition-colors ${
                  language === 'en' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile menu button & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <a href="#" className="flex flex-col group">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wider text-stone-900 group-hover:text-amber-800 transition-colors">
              KAMER<span className="text-amber-700">CHIC</span>
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-medium text-stone-500 -mt-1">
              MAISON YAOUNDÉ • LIVRAISON CAMEROUN
            </span>
          </a>
        </div>

        {/* Center: Search input on desktop */}
        <div className="hidden lg:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-stone-100/80 focus:bg-white text-stone-800 text-sm pl-10 pr-4 py-2.5 rounded-full border border-stone-200 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:outline-none transition-all placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-full"
            aria-label="Recherche"
          >
            <Search size={20} />
          </button>

          {/* Club Prestige Loyalty */}
          <button
            onClick={() => setIsLoyaltyModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            title="Club Prestige KamerChic"
          >
            <Crown size={15} className="text-amber-600 fill-amber-500/20" />
            <span className="hidden md:inline font-bold">Club Prestige</span>
          </button>

          {/* Track order button */}
          <button
            onClick={openLatestOrderTracking}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
            title={t.tracking.title}
          >
            <Truck size={15} className="text-amber-700" />
            <span className="hidden md:inline">{t.tracking.title}</span>
            {orders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          {/* Wishlist */}
          <button
            onClick={() => {
              if (wishlist.length > 0) {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
            title={t.wishlist.title}
          >
            <Heart size={21} className={wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-stone-900 hover:bg-amber-900 text-white px-3.5 py-2 rounded-full shadow-sm hover:shadow transition-all active:scale-95"
            aria-label={t.cart.title}
          >
            <div className="relative">
              <ShoppingBag size={19} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-stone-950 font-black rounded-full min-w-4 h-4 px-1 text-[10px] flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold text-xs tracking-tight text-amber-200">
              {cartSubtotal > 0 ? formatXAF(cartSubtotal) : t.cart.title}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile search bar dropdown */}
      {isSearchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-1 border-t border-stone-100 bg-stone-50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              autoFocus
              className="w-full bg-white text-stone-800 text-sm pl-10 pr-4 py-2.5 rounded-full border border-stone-300 focus:border-amber-700 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Category Navigation Bar (Desktop) */}
      <nav className="hidden md:block bg-stone-50/70 border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ul className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-stone-900 text-white font-bold shadow-sm'
                      : 'hover:text-stone-900 hover:bg-stone-200/70'
                  }`}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[105px] z-50 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white w-4/5 max-w-sm h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <span className="font-serif text-lg font-bold text-stone-900">
                  {t.sections.categoriesTitle}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-200 space-y-2">
                <button
                  onClick={() => {
                    setIsLoyaltyModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg font-bold border border-amber-200"
                >
                  <Crown size={17} className="text-amber-600" />
                  Club Prestige (Points & Avantages)
                </button>

                <button
                  onClick={() => {
                    openLatestOrderTracking();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-100 rounded-lg font-medium"
                >
                  <Truck size={17} className="text-amber-700" />
                  {t.tracking.title}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 text-xs text-stone-500 space-y-1">
              <p className="font-semibold text-stone-800">KamerChic Yaoundé • Siège Bastos</p>
              <p className="text-stone-600">WhatsApp & Appel : +237 659 17 21 01</p>
              <p className="text-stone-500">Courriel : ngassaeric17@gmail.com</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

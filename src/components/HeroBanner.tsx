import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Zap, Truck, CreditCard, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatXAF } from '../lib/formatters';

interface Slide {
  image: string;
  badge: { fr: string; en: string };
  title: { fr: string; en: string };
  highlight: { fr: string; en: string };
  priceTag: number; // in XAF
  subtitle: { fr: string; en: string };
  cta: { fr: string; en: string };
  categoryTarget: 'all' | 'men' | 'women' | 'watches' | 'perfumes';
}

const SLIDES: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=2000&q=90',
    badge: { fr: 'HAUTE COUTURE FÉMININE', en: 'WOMEN’S HAUTE COUTURE' },
    title: {
      fr: 'Robes de Soirée & Silhouettes Royales',
      en: 'Evening Gowns & Royal Silhouettes',
    },
    highlight: {
      fr: 'Satin de Soie & Corset Sculptant',
      en: 'Silk Satin & Sculpting Corsetry',
    },
    priceTag: 68000,
    subtitle: {
      fr: 'Des confections d’exception drapées à la perfection pour vos galas, mariages et réceptions de prestige à Douala et Yaoundé.',
      en: 'Masterfully draped creations designed for your highest galas and celebrations across Cameroon.',
    },
    cta: { fr: 'Découvrir la Collection Femme', en: 'Shop Women’s Collection' },
    categoryTarget: 'women',
  },
  {
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=90',
    badge: { fr: 'VESTIAIRE MASCULIN DE PRESTIGE', en: 'MEN’S PRESTIGE WARDROBE' },
    title: {
      fr: 'Grand Boubou Bazin Riche Brodé Or',
      en: 'Gold-Embroidered Rich Bazin Boubou',
    },
    highlight: {
      fr: 'Bazin 100% Teinté & Broderie Main',
      en: 'Hand-Dyed Bazin & Gold Thread Craft',
    },
    priceTag: 85000,
    subtitle: {
      fr: 'Prestance majestueuse et brillance incomparable. Confectionné selon la pure tradition d’apparat africaine.',
      en: 'Stately charisma and dazzling luster. Mastercrafted for Cameroon’s most distinguished gentlemen.',
    },
    cta: { fr: 'Voir les Boubous & Costumes', en: 'Shop Men’s Collection' },
    categoryTarget: 'men',
  },
  {
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=2000&q=90',
    badge: { fr: 'HAUTE HORLOGERIE & PARFUMERIE', en: 'FINE WATCHES & PERFUMES' },
    title: {
      fr: 'Chronographe Automatique Or Rose 18K',
      en: '18K Rose Gold Automatic Chronograph',
    },
    highlight: {
      fr: 'Verre Saphir & Mouvement Mécanique',
      en: 'Sapphire Crystal & Mechanical Caliber',
    },
    priceTag: 165000,
    subtitle: {
      fr: 'Précision suisse et noblesse des métaux précieux. Accompagné de nos extraits de parfum Oud Royal d’Arabie.',
      en: 'Swiss-grade horology and precious metals paired with intense tropical-proof niche perfumes.',
    },
    cta: { fr: 'Découvrir Montres & Parfums', en: 'Explore Watches & Scents' },
    categoryTarget: 'watches',
  },
];

export const HeroBanner: React.FC = () => {
  const { language, setSelectedCategory } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  const handleCtaClick = () => {
    setSelectedCategory(slide.categoryTarget);
    const catalogEl = document.getElementById('catalog-section');
    catalogEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative overflow-hidden bg-stone-950 text-white w-full">
      {/* 100% Full-bleed Hero Stage */}
      <div className="relative w-full h-[85vh] sm:h-[90vh] min-h-[620px] max-h-[920px]">
        {SLIDES.map((s, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            <img
              src={s.image}
              alt={s.title[language]}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-8000 ease-out"
              loading={index === 0 ? 'eager' : 'lazy'}
            />

            {/* Gradient Overlays for High-Contrast Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-black/35" />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/40 to-transparent" />
          </div>
        ))}

        {/* Content Box */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-8 flex flex-col justify-end pb-16 sm:pb-20">
          <div className="max-w-3xl space-y-4">
            {/* Top Pill with Highlight & Live Price */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold tracking-widest uppercase shadow">
                <Sparkles size={13} className="text-amber-400 fill-amber-400" />
                <span>{slide.badge[language]}</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-stone-900/90 backdrop-blur-md border border-stone-700 text-amber-300 font-mono text-xs font-extrabold shadow">
                {language === 'fr' ? 'À partir de' : 'From'} {formatXAF(slide.priceTag)}
              </span>
            </div>

            {/* Main Title matching exactly the item photography */}
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-xl">
              {slide.title[language]}
            </h1>

            {/* Sub-headline highlight */}
            <div className="text-amber-400 font-semibold text-sm sm:text-lg tracking-wide flex items-center gap-2">
              <span className="inline-block w-8 h-0.5 bg-amber-500"></span>
              <span>{slide.highlight[language]}</span>
            </div>

            <p className="text-stone-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-light drop-shadow">
              {slide.subtitle[language]}
            </p>

            {/* Call to Actions */}
            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <button
                onClick={handleCtaClick}
                className="flex items-center gap-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-stone-950 font-black text-xs sm:text-sm px-7 py-4 rounded-full shadow-2xl shadow-amber-900/50 transition-all cursor-pointer"
              >
                <span>{slide.cta[language]}</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={() => {
                  const flashEl = document.getElementById('flash-sale-section');
                  flashEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 rounded-full border border-white/40 hover:border-white text-white text-xs sm:text-sm font-bold backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                {language === 'fr' ? 'Ventes Flash (-25%)' : 'Flash Deals (-25%)'}
              </button>
            </div>
          </div>

          {/* Navigation controls & indicators */}
          <div className="flex items-center justify-between pt-8 border-t border-white/15 mt-8">
            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-10 bg-amber-500' : 'w-2.5 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-stone-900/80 border border-stone-700 hover:bg-stone-800 text-white flex items-center justify-center transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full bg-stone-900/80 border border-stone-700 hover:bg-stone-800 text-white flex items-center justify-center transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cameroon Value Props Strip */}
      <div className="bg-stone-900/95 border-t border-stone-800 text-stone-300 py-4 px-4 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Truck size={17} />
            </div>
            <div>
              <p className="font-bold text-white text-[11px] sm:text-xs">
                {language === 'fr' ? 'Livraison Express 24h' : '24h Express Delivery'}
              </p>
              <p className="text-[10px] text-stone-400">Douala & Yaoundé en direct</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 shrink-0 font-black text-xs">
              M
            </div>
            <div>
              <p className="font-bold text-white text-[11px] sm:text-xs">MTN MoMo & Orange Money</p>
              <p className="text-[10px] text-stone-400">Débit direct sécurisé USSD</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck size={17} />
            </div>
            <div>
              <p className="font-bold text-white text-[11px] sm:text-xs">
                {language === 'fr' ? 'Paiement à la Livraison' : 'Cash on Delivery'}
              </p>
              <p className="text-[10px] text-stone-400">Vérifiez vos articles avant de payer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              WA
            </div>
            <div>
              <p className="font-bold text-white text-[11px] sm:text-xs">Service WhatsApp 7j/7</p>
              <p className="text-[10px] text-stone-400">+237 699 00 00 00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

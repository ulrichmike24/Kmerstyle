import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface CategoryItem {
  id: ProductCategory;
  titleFr: string;
  titleEn: string;
  image: string;
  itemCount: number;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'men',
    titleFr: 'Hommes',
    titleEn: 'Men',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
    itemCount: 4,
  },
  {
    id: 'women',
    titleFr: 'Femmes',
    titleEn: 'Women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    itemCount: 5,
  },
  {
    id: 'shoes',
    titleFr: 'Chaussures',
    titleEn: 'Shoes',
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80',
    itemCount: 4,
  },
  {
    id: 'watches',
    titleFr: 'Montres & Horlogerie',
    titleEn: 'Luxury Watches',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    itemCount: 2,
  },
  {
    id: 'perfumes',
    titleFr: 'Parfums de Niche',
    titleEn: 'Niche Perfumes',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    itemCount: 3,
  },
  {
    id: 'accessories',
    titleFr: 'Accessoires & Maroquinerie',
    titleEn: 'Accessories & Leather',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    itemCount: 4,
  },
];

export const CategoryTiles: React.FC = () => {
  const { language, setSelectedCategory, t } = useStore();

  const handleSelect = (catId: ProductCategory) => {
    setSelectedCategory(catId);
    const catalogEl = document.getElementById('catalog-section');
    catalogEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {language === 'fr' ? 'SÉLECTION PAR UNIVERS' : 'BROWSE COLLECTIONS'}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {t.sections.categoriesTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm">
          {language === 'fr'
            ? 'Des pièces d’exception rigoureusement sélectionnées pour refléter votre prestige.'
            : 'Prestige fashion and bespoke accessories tailored for the Cameroonian lifestyle.'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            className="group relative h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 text-left cursor-pointer border border-stone-200"
          >
            <img
              src={cat.image}
              alt={language === 'fr' ? cat.titleFr : cat.titleEn}
              className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

            <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between text-white">
              <div className="flex justify-end">
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                  <ArrowUpRight size={14} />
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base leading-tight text-white group-hover:text-amber-300 transition-colors">
                  {language === 'fr' ? cat.titleFr : cat.titleEn}
                </h3>
                <span className="text-[10px] text-stone-300 font-medium">
                  {cat.itemCount} {language === 'fr' ? 'modèles' : 'items'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

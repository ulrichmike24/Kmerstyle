import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductGender, ProductCategory } from '../types';
import { SlidersHorizontal, ArrowUpDown, X, Search } from 'lucide-react';
import { formatXAF } from '../lib/formatters';

export const CatalogView: React.FC = () => {
  const {
    products,
    language,
    t,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [selectedGender, setSelectedGender] = useState<ProductGender | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'newest'>('popular');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Extract unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand)));
    return list.sort();
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle =
          p.title.fr.toLowerCase().includes(q) || p.title.en.toLowerCase().includes(q);
        const matchesDesc =
          p.description.fr.toLowerCase().includes(q) || p.description.en.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSub = p.subCategory.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesBrand && !matchesSub) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // 3. Gender filter
      if (selectedGender !== 'all' && p.gender !== selectedGender && p.gender !== 'unisex') {
        return false;
      }

      // 4. Price filter
      if (p.price > maxPrice) {
        return false;
      }

      // 5. Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return b.rating * b.reviewCount - a.rating * a.reviewCount;
    });
  }, [products, searchQuery, selectedCategory, selectedGender, maxPrice, selectedBrand, sortBy]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedGender('all');
    setMaxPrice(100000);
    setSelectedBrand('all');
    setSearchQuery('');
    setSortBy('popular');
  };

  const categoriesList: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.categories.all },
    { id: 'men', label: t.categories.men },
    { id: 'women', label: t.categories.women },
    { id: 'shoes', label: t.categories.shoes },
    { id: 'watches', label: t.categories.watches },
    { id: 'perfumes', label: t.categories.perfumes },
    { id: 'accessories', label: t.categories.accessories },
  ];

  return (
    <section id="catalog-section" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Catalog Title & Quick Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            {language === 'fr' ? 'CATALOGUE OFFICIEL' : 'OFFICIAL CATALOG'}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
            {selectedCategory === 'all'
              ? language === 'fr'
                ? 'Toutes les Créations'
                : 'All Designer Pieces'
              : t.categories[selectedCategory]}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {filteredProducts.length}{' '}
            {language === 'fr'
              ? filteredProducts.length > 1
                ? 'articles disponibles'
                : 'article disponible'
              : 'items found'}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>
        </div>

        {/* Filter / Sort action controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-colors ${
              filtersOpen
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>{t.common.filter}</span>
            {(selectedGender !== 'all' || selectedBrand !== 'all' || maxPrice < 100000) && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          <div className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white text-stone-800 text-xs font-bold pl-3 pr-8 py-2.5 rounded-full border border-stone-200 hover:border-stone-400 focus:outline-none cursor-pointer"
            >
              <option value="popular">{t.common.popular}</option>
              <option value="newest">{t.common.newest}</option>
              <option value="price-asc">{t.common.priceAsc}</option>
              <option value="price-desc">{t.common.priceDesc}</option>
            </select>
            <ArrowUpDown size={13} className="absolute right-3 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-800 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Expanded Filter Drawer */}
      {filtersOpen && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm mb-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-amber-700" />
              {language === 'fr' ? 'Filtres avancés' : 'Advanced Filters'}
            </h3>
            <button
              onClick={resetAllFilters}
              className="text-xs text-amber-800 hover:underline font-semibold"
            >
              {t.common.reset}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Gender filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-500 mb-2">
                {language === 'fr' ? 'Genre' : 'Gender'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: language === 'fr' ? 'Tous' : 'All' },
                  { id: 'men', label: language === 'fr' ? 'Hommes' : 'Men' },
                  { id: 'women', label: language === 'fr' ? 'Femmes' : 'Women' },
                  { id: 'unisex', label: 'Unisexe' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGender(g.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      selectedGender === g.id
                        ? 'bg-stone-900 text-white border-stone-900 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase text-stone-500 mb-2">
                <span>{language === 'fr' ? 'Prix Maximum' : 'Max Price'}</span>
                <span className="text-stone-900 font-mono text-sm">{formatXAF(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="15000"
                max="100000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                <span>15 000 FCFA</span>
                <span>100 000 FCFA</span>
              </div>
            </div>

            {/* Brand filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-500 mb-2">
                {language === 'fr' ? 'Maison / Marque' : 'Brand / House'}
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs rounded-lg p-2.5 focus:outline-none focus:border-amber-700"
              >
                <option value="all">{language === 'fr' ? 'Toutes les marques' : 'All Brands'}</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400 mb-4">
            <Search size={28} />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            {language === 'fr' ? 'Aucun article trouvé' : 'No products found'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-xs mx-auto">
            {language === 'fr'
              ? 'Essayez de modifier vos critères de recherche ou réinitialisez les filtres.'
              : 'Try adjusting your search terms or clearing current filter selections.'}
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-6 px-6 py-2.5 rounded-full bg-stone-900 hover:bg-amber-800 text-white text-xs font-bold shadow transition-colors"
          >
            {t.common.reset}
          </button>
        </div>
      )}
    </section>
  );
};

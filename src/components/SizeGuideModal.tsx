import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen, language, t } = useStore();
  const [activeTab, setActiveTab] = useState<'clothing' | 'shoes'>('clothing');

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Ruler size={16} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {t.product.sizeGuide}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'fr' ? 'Standards internationaux & coupes adaptées' : 'International sizing standards'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-4 p-1 bg-stone-100 rounded-xl">
          <button
            onClick={() => setActiveTab('clothing')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'clothing' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            {language === 'fr' ? 'Vêtements & Boubous' : 'Clothing & Boubous'}
          </button>
          <button
            onClick={() => setActiveTab('shoes')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'shoes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            {language === 'fr' ? 'Chaussures & Pointures' : 'Shoes & Sizing'}
          </button>
        </div>

        {/* Tables */}
        {activeTab === 'clothing' ? (
          <div className="space-y-4">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Taille</th>
                  <th className="py-2.5 px-3">FR / CM</th>
                  <th className="py-2.5 px-3">Tour Poitrine</th>
                  <th className="py-2.5 px-3">Tour Taille</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-2 px-3 font-bold">S</td>
                  <td className="py-2 px-3">36 - 38</td>
                  <td className="py-2 px-3">88 - 94 cm</td>
                  <td className="py-2 px-3">74 - 80 cm</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">M</td>
                  <td className="py-2 px-3">40 - 42</td>
                  <td className="py-2 px-3">95 - 102 cm</td>
                  <td className="py-2 px-3">81 - 88 cm</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">L</td>
                  <td className="py-2 px-3">44 - 46</td>
                  <td className="py-2 px-3">103 - 110 cm</td>
                  <td className="py-2 px-3">89 - 96 cm</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">XL</td>
                  <td className="py-2 px-3">48 - 50</td>
                  <td className="py-2 px-3">111 - 118 cm</td>
                  <td className="py-2 px-3">97 - 104 cm</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">XXL</td>
                  <td className="py-2 px-3">52 - 54</td>
                  <td className="py-2 px-3">119 - 128 cm</td>
                  <td className="py-2 px-3">105 - 114 cm</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-900 border border-amber-200">
              💡 <strong>Astuce Cameroun :</strong> Nos boubous traditionnels et robes fluides possèdent une coupe royale ample. Si vous hésitez entre deux tailles, nous recommandons votre taille habituelle pour une tombée majestueuse.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">EU</th>
                  <th className="py-2.5 px-3">UK</th>
                  <th className="py-2.5 px-3">US Homme</th>
                  <th className="py-2.5 px-3">Longueur Pied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-2 px-3 font-bold">39 EU</td>
                  <td className="py-2 px-3">6.0</td>
                  <td className="py-2 px-3">6.5</td>
                  <td className="py-2 px-3">24.5 cm</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">40 EU</td>
                  <td className="py-2 px-3">6.5</td>
                  <td className="py-2 px-3">7.0</td>
                  <td className="py-2 px-3">25.0 cm</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">41 EU</td>
                  <td className="py-2 px-3">7.5</td>
                  <td className="py-2 px-3">8.0</td>
                  <td className="py-2 px-3">26.0 cm</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">42 EU</td>
                  <td className="py-2 px-3">8.0</td>
                  <td className="py-2 px-3">8.5</td>
                  <td className="py-2 px-3">26.5 cm</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">43 EU</td>
                  <td className="py-2 px-3">9.0</td>
                  <td className="py-2 px-3">9.5</td>
                  <td className="py-2 px-3">27.5 cm</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">44 EU</td>
                  <td className="py-2 px-3">9.5</td>
                  <td className="py-2 px-3">10.0</td>
                  <td className="py-2 px-3">28.0 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="px-5 py-2 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MapPin, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, t, setActivePortal } = useStore();

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-stone-800">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <span className="font-serif text-2xl font-black text-white tracking-wider">
              KAMER<span className="text-amber-500">CHIC</span>
            </span>
            <p className="text-stone-400 leading-relaxed text-xs">
              {language === 'fr'
                ? 'La référence de l’élégance contemporaine et traditionnelle au Cameroun. Vêtements prestigieux, chaussures en cuir de maître, haute horlogerie et parfums rares.'
                : 'Cameroon’s premier luxury fashion and lifestyle destination. Haute couture, traditional Bazin, bespoke leather footwear, and niche perfumery.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-[10px] font-bold text-amber-400">
                MTN MoMo
              </span>
              <span className="px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-[10px] font-bold text-orange-400">
                Orange Money
              </span>
              <span className="px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-[10px] font-bold text-emerald-400">
                Cash à la Livraison
              </span>
            </div>
          </div>

          {/* Col 2: Showroom in Cameroon */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              {language === 'fr' ? 'Siège & Showroom' : 'Headquarters & Showroom'}
            </h4>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-200">Yaoundé (Siège Unique) :</strong>
                  <p>Quartier Bastos, descente Ambassade</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1 text-[11px] text-amber-300/90">
                <span>🚚 Expéditions express vers toutes les régions du Cameroun</span>
              </div>
            </div>
          </div>

          {/* Col 3: Customer Service */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              {language === 'fr' ? 'Service Client & WhatsApp' : 'Customer Care & WhatsApp'}
            </h4>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-amber-500 shrink-0" />
                <a href="tel:+237659172101" className="hover:text-white font-mono font-semibold">
                  +237 659 17 21 01
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-amber-500 shrink-0" />
                <span>7j/7 de 08h00 à 21h00</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-amber-500 shrink-0" />
                <a href="mailto:ngassaeric17@gmail.com" className="hover:text-white font-mono">
                  ngassaeric17@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Commitments */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              {language === 'fr' ? 'Engagements Qualité' : 'Our Guarantees'}
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>• {language === 'fr' ? 'Tissus & cuirs 100% authentiques' : '100% authentic fabrics & leathers'}</li>
              <li>• {language === 'fr' ? 'Échange sous 48h en cas de mauvaise taille' : '48h size exchange guarantee'}</li>
              <li>• {language === 'fr' ? 'Vérification du colis avant paiement en espèces' : 'Inspect before paying cash'}</li>
              <li>• {language === 'fr' ? 'Livraison sécurisée partout au Cameroun' : 'Secure delivery across all Cameroon'}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px] gap-4">
          <p>
            © {new Date().getFullYear()} KamerChic Cameroun • Yaoundé. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#" className="hover:text-stone-300">Conditions Générales de Vente</a>
            <a href="#" className="hover:text-stone-300">Politique de Confidentialité</a>
            <a href="#" className="hover:text-stone-300">Programme de Fidélité VIP</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

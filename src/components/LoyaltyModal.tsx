import React, { useState } from 'react';
import {
  Crown,
  X,
  Sparkles,
  Award,
  CheckCircle2,
  Gift,
  ArrowRight,
  ShieldCheck,
  Search,
  Phone,
  Percent,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LoyaltyTier } from '../types';
import { formatXAF } from '../lib/formatters';

export const LoyaltyModal: React.FC = () => {
  const {
    isLoyaltyModalOpen,
    setIsLoyaltyModalOpen,
    lookupLoyaltyMember,
    language,
  } = useStore();

  const [lookupPhone, setLookupPhone] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [foundMember, setFoundMember] = useState<ReturnType<typeof lookupLoyaltyMember> | null>(null);

  if (!isLoyaltyModalOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;
    const member = lookupLoyaltyMember(lookupPhone.trim());
    setFoundMember(member || null);
    setHasSearched(true);
  };

  const tiers: {
    id: LoyaltyTier;
    name: string;
    minPoints: number;
    badgeColor: string;
    bgGradient: string;
    perks: string[];
  }[] = [
    {
      id: 'bronze',
      name: 'Bronze Initié',
      minPoints: 0,
      badgeColor: 'text-amber-800 bg-amber-100 border-amber-300',
      bgGradient: 'from-amber-50 to-stone-50',
      perks: [
        '1 point accumulé par tranche de 1 000 FCFA',
        'Accès exclusif aux Ventes Privées KamerChic',
        'Notification prioritaire des Nouveaux Arrivages',
      ],
    },
    {
      id: 'argent',
      name: 'Argent Élégance',
      minPoints: 50,
      badgeColor: 'text-slate-800 bg-slate-200 border-slate-300',
      bgGradient: 'from-slate-50 to-stone-50',
      perks: [
        'Tous les avantages Bronze',
        'Remise permanente de 5% sur tout le catalogue',
        'Cadeau surprise d’anniversaire',
      ],
    },
    {
      id: 'or',
      name: 'Or Prestige',
      minPoints: 150,
      badgeColor: 'text-amber-900 bg-amber-300 border-amber-400',
      bgGradient: 'from-amber-100/60 to-yellow-50',
      perks: [
        'Tous les avantages Argent',
        'Remise permanente de 10% sur tout le panier',
        'Livraison prioritaire express à Yaoundé (Bastos, Omnisports, etc.)',
        'Packaging luxe offert',
      ],
    },
    {
      id: 'platine',
      name: 'Platine VIP Ambassadeur',
      minPoints: 300,
      badgeColor: 'text-purple-950 bg-gradient-to-r from-purple-200 to-amber-200 border-purple-300',
      bgGradient: 'from-purple-50 via-amber-50 to-stone-50',
      perks: [
        'Tous les avantages Or',
        'Remise permanente exclusive de 15%',
        'Livraison 100% GRATUITE dans tout le Cameroun (toutes régions)',
        'Conseiller de style & Personal Shopper WhatsApp dédié',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-amber-200/60 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with luxury aesthetic */}
        <div className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 shrink-0 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <button
            onClick={() => setIsLoyaltyModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-semibold mb-2">
            <Crown size={16} className="text-amber-400 fill-amber-400/20" />
            <span>Club Privilège & Fidélité</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white mb-2">
            Club Prestige KamerChic
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm max-w-lg leading-relaxed">
            Chaque achat réalisé dans notre boutique vous rapproche de privilèges exclusifs. Gagnez 1 point pour chaque 1 000 FCFA commandés.
          </p>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5">
              <span className="block text-amber-400 font-bold text-sm sm:text-base">1 000 FCFA</span>
              <span className="text-[10px] text-stone-300">= 1 Point Gagné</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5">
              <span className="block text-amber-400 font-bold text-sm sm:text-base">5% à 15%</span>
              <span className="text-[10px] text-stone-300">Remise Permanente</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5">
              <span className="block text-amber-400 font-bold text-sm sm:text-base">0 FCFA</span>
              <span className="text-[10px] text-stone-300">Livraison VIP Offerte</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Member Search / Lookup */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
              <Search size={14} />
              Consultez Vos Points & Votre Rang VIP
            </h3>
            <p className="text-xs text-stone-600 mb-3">
              Entrez votre numéro WhatsApp ou téléphone utilisé lors de vos commandes :
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  value={lookupPhone}
                  onChange={(e) => {
                    setLookupPhone(e.target.value);
                    setHasSearched(false);
                  }}
                  placeholder="Ex: 659172101 ou +237 6..."
                  className="w-full bg-white text-stone-800 text-sm pl-9 pr-3 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shrink-0 active:scale-95"
              >
                Vérifier
              </button>
            </form>

            {/* Search Result Feedback */}
            {hasSearched && (
              <div className="mt-4 pt-4 border-t border-amber-200/60 animate-in fade-in duration-200">
                {foundMember ? (
                  <div className="bg-white rounded-xl p-4 border border-emerald-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{foundMember.name}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          Rang {foundMember.tier.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {foundMember.phone} • {foundMember.ordersCount} commande{foundMember.ordersCount > 1 ? 's' : ''} réalisée{foundMember.ordersCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-emerald-700 font-semibold mt-1">
                        Total cumulé : {formatXAF(foundMember.totalSpent)}
                      </p>
                    </div>

                    <div className="text-right bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 shrink-0">
                      <span className="block text-2xl font-black text-amber-800 leading-none">
                        {foundMember.points}
                      </span>
                      <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                        Points Disponibles
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-3.5 border border-stone-200 text-xs text-stone-600">
                    <p className="font-semibold text-stone-800">Aucun compte Club Prestige trouvé pour ce numéro.</p>
                    <p className="text-stone-500 mt-0.5">
                      Vos points seront automatiquement créés dès votre première commande livrée avec ce numéro !
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tiers List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
              <Award size={15} className="text-amber-700" />
              Niveaux de Prestige & Avantages Associés
            </h3>

            <div className="space-y-3">
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-4 bg-gradient-to-r ${t.bgGradient} transition-all border-stone-200`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border shadow-xs ${t.badgeColor}`}>
                        {t.name}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        Dès {t.minPoints} points
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mt-2.5">
                    {t.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* VIP Whitelist Note */}
          <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                Liste Blanche VIP & Clients d'Honneur
              </h4>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Les membres inscrits sur la Liste Blanche par la Direction bénéficient systématiquement de la livraison offerte dans les 10 régions du Cameroun ainsi que d'une réduction spéciale immédiate lors du paiement.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-stone-500">
            Siège Bastos, Yaoundé • Service Client : +237 659 17 21 01
          </p>
          <button
            onClick={() => setIsLoyaltyModalOpen(false)}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

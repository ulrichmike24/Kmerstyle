import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Navigation,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { formatXAF, isValidCameroonPhone, formatCameroonPhone } from '../lib/formatters';

interface CameroonCityRate {
  name: string;
  region: string;
  fee: number;
  deliveryTime: string;
}

export const CAMEROON_CITIES: CameroonCityRate[] = [
  { name: 'Yaoundé', region: 'Centre (Siège & Showroom Bastos)', fee: 1500, deliveryTime: 'Livraison express en 2h à 4h' },
  { name: 'Douala', region: 'Littoral (Showroom Akwa & Bonapriso)', fee: 2500, deliveryTime: 'Livraison en 24h ouvrées' },
  { name: 'Bafoussam', region: 'Ouest (Hauts Plateaux)', fee: 3500, deliveryTime: 'Livraison sous 24h à 48h' },
  { name: 'Kribi', region: 'Sud (Bord de Mer & Port)', fee: 3500, deliveryTime: 'Livraison sous 48h' },
  { name: 'Limbe / Buea', region: 'Sud-Ouest', fee: 3000, deliveryTime: 'Livraison sous 24h à 48h' },
  { name: 'Bamenda', region: 'Nord-Ouest', fee: 4000, deliveryTime: 'Livraison sous 48h' },
  { name: 'Garoua', region: 'Nord', fee: 5000, deliveryTime: 'Expédition agence 48h à 72h' },
  { name: 'Maroua', region: 'Extrême-Nord', fee: 5000, deliveryTime: 'Expédition agence 48h à 72h' },
  { name: 'Ngaoundéré', region: 'Adamaoua', fee: 4500, deliveryTime: 'Expédition sous 48h' },
  { name: 'Bertoua', region: 'Est', fee: 4500, deliveryTime: 'Expédition sous 48h' },
  { name: 'Ebolowa', region: 'Sud', fee: 3500, deliveryTime: 'Expédition sous 24h à 48h' },
];

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    discountAmount,
    freeShippingThreshold,
    appliedCoupon,
    placeOrder,
    setActiveTrackingOrder,
    momoMerchantCode,
    omMerchantCode,
    language,
    shippingRates,
    calculateDeliveryFee,
    getShippingRateForTown,
    checkWhitelist,
    lookupLoyaltyMember,
    redeemLoyaltyPoints,
  } = useStore();

  // Form State - Default payment method is 'cod' (Payment on Delivery)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Yaoundé');
  const [quartier, setQuartier] = useState('');
  const [landmark, setLandmark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'om' | 'momo' | 'cod'>('cod');
  const [transactionRef, setTransactionRef] = useState('');
  const [useLoyaltyDiscount, setUseLoyaltyDiscount] = useState(false);

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isCheckoutOpen || cart.length === 0) return null;

  // 1. VIP Whitelist Auto-Detection
  const whitelistVip = checkWhitelist(phone) || (email ? checkWhitelist(email) : undefined);

  // 2. Club Prestige Member Check
  const loyaltyMember = phone.length >= 6 ? lookupLoyaltyMember(phone) : undefined;
  const availablePoints = loyaltyMember?.points || 0;
  // Each point = 50 FCFA discount (up to 30% of cart subtotal)
  const maxRedeemablePoints = Math.min(availablePoints, Math.floor((cartSubtotal * 0.3) / 50));
  const loyaltyDiscountValue = useLoyaltyDiscount && maxRedeemablePoints > 0 ? maxRedeemablePoints * 50 : 0;

  // 3. Shipping Calculation
  const selectedShippingRate = getShippingRateForTown(city) || shippingRates[0];
  const standardDeliveryFee = calculateDeliveryFee(city, cartSubtotal);
  const deliveryFee = whitelistVip?.freeDeliveryAllRegions ? 0 : standardDeliveryFee;
  const isFreeDelivery = deliveryFee === 0;

  // 4. VIP Discount from Whitelist
  const vipDiscountAmount = whitelistVip ? Math.round((cartSubtotal * whitelistVip.discountPercent) / 100) : 0;
  const totalDiscounts = discountAmount + vipDiscountAmount + loyaltyDiscountValue;
  const grandTotal = Math.max(0, cartSubtotal - totalDiscounts + deliveryFee);

  const activeMerchantCode = paymentMethod === 'om' ? omMerchantCode : momoMerchantCode;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeMerchantCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!name.trim()) {
      setErrorMsg('Veuillez renseigner votre nom complet.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Veuillez renseigner votre numéro de téléphone.');
      return;
    }

    if (!isValidCameroonPhone(phone)) {
      setErrorMsg('Numéro camerounais invalide. Format attendu : 6XXXXXXXX ou +237 6XXXXXXXX.');
      return;
    }

    if (!quartier.trim()) {
      setErrorMsg('Veuillez préciser votre quartier (ex: Bastos, Bonapriso, Mendong...).');
      return;
    }

    if (!landmark.trim()) {
      setErrorMsg('Veuillez donner un repère visuel (ex: Face pharmacie, portail noir...).');
      return;
    }

    if ((paymentMethod === 'om' || paymentMethod === 'momo') && !transactionRef.trim()) {
      setErrorMsg('Veuillez saisir votre référence de transaction SMS reçue après paiement.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If loyalty discount used, deduct points
      if (useLoyaltyDiscount && maxRedeemablePoints > 0) {
        await redeemLoyaltyPoints(phone, maxRedeemablePoints);
      }

      // Trigger JS Automation & Firestore Record
      const newOrder = await placeOrder({
        customerName: name.trim(),
        customerPhone: formatCameroonPhone(phone),
        customerEmail: email.trim(),
        city,
        quartier: quartier.trim(),
        landmark: landmark.trim(),
        deliveryFee,
        paymentMethod,
        merchantCode: paymentMethod !== 'cod' ? activeMerchantCode : undefined,
        transactionRef: transactionRef.trim() || undefined,
      });

      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      setActiveTrackingOrder(newOrder);
    } catch (err) {
      console.error(err);
      setErrorMsg('Une erreur est survenue lors de l’enregistrement de votre commande. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#faf9f6] text-stone-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 my-8 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase block">
              Finalisation de votre commande
            </span>
            <h2 className="font-serif font-extrabold text-xl text-stone-900">
              Caisse & Paiement Sécurisé
            </h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-full hover:bg-stone-200 transition-colors text-stone-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* 1. Commande Summary Preview */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-800">
                Articles commandés ({cart.length})
              </span>
              <span className="font-mono font-bold text-xs text-amber-900">
                Sous-total : {formatXAF(cartSubtotal)}
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto divide-y divide-stone-100 pr-1">
              {cart.map((item) => (
                <div key={item.cartItemId} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.product.images[0]}
                      alt=""
                      className="w-10 h-12 object-cover rounded-lg bg-stone-100 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-stone-900 line-clamp-1">{item.product.title.fr}</p>
                      <p className="text-[11px] text-stone-500">
                        Qté : {item.quantity} • Taille : {item.selectedSize} • {item.selectedColor}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-stone-900">
                    {formatXAF(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-700 font-semibold pt-1 border-t border-stone-100">
                <span>Réduction code ({appliedCoupon?.code})</span>
                <span>-{formatXAF(discountAmount)}</span>
              </div>
            )}
          </div>

          {/* 2. Coordonnées Client & Lieu de Livraison */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <User size={15} className="text-amber-800" />
              <span>1. Vos Coordonnées & Adresse de Livraison</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Franck Kamga"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Numéro de Téléphone (Orange ou MTN) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 699 45 21 80"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-800"
                />
              </div>

              {/* VIP Whitelist Recognition Banner */}
              {whitelistVip && (
                <div className="sm:col-span-2 bg-gradient-to-r from-amber-50 to-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in">
                  <Sparkles size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">
                        Privilège Liste Blanche : {whitelistVip.name}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        VIP {whitelistVip.vipLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Livraison 100% offerte dans toutes les régions du Cameroun + remise exclusive de {whitelistVip.discountPercent}% appliquées d'office !
                    </p>
                  </div>
                </div>
              )}

              {/* Club Prestige Points Card */}
              {availablePoints >= 10 && (
                <div className="sm:col-span-2 bg-amber-50/80 border border-amber-300/80 rounded-xl p-3 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Crown size={17} className="text-amber-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-950">
                        Club Prestige : {availablePoints} points disponibles
                      </p>
                      <p className="text-[11px] text-stone-600">
                        Utiliser {maxRedeemablePoints} points pour déduire {formatXAF(maxRedeemablePoints * 50)} de votre panier.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer shrink-0 bg-white px-2.5 py-1.5 rounded-lg border border-amber-200 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={useLoyaltyDiscount}
                      onChange={(e) => setUseLoyaltyDiscount(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-800 focus:ring-amber-500 border-amber-300"
                    />
                    <span className="text-xs font-bold text-amber-900">Appliquer</span>
                  </label>
                </div>
              )}
            </div>

            {/* City selection with dynamic rates from Firestore shipping_rates */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ville de Livraison au Cameroun *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-800 cursor-pointer"
              >
                {shippingRates.map((c) => (
                  <option key={c.id || c.town} value={c.town}>
                    {c.town} — {formatXAF(c.fee)} ({c.region})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-amber-900 mt-1 font-medium">
                ⏱️ {selectedShippingRate?.deliveryTime?.[language] || selectedShippingRate?.deliveryTime?.fr || 'Livraison rapide'} • Frais de livraison :{' '}
                <strong className="font-mono">{isFreeDelivery ? 'OFFERTS (Gratuit)' : formatXAF(deliveryFee)}</strong>
              </p>
            </div>

            {/* Quartier & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Quartier de Résidence *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bastos, Bonapriso, Mendong, Akwa..."
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Repère Visuel Précis (Pour le Livreur) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: En face de la pharmacie, portail noir..."
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                />
              </div>
            </div>
          </div>

          {/* 3. Mode de Paiement avec Code Marchand */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone size={15} className="text-amber-800" />
              <span>2. Mode de Paiement & Code Marchand</span>
            </h3>

            {/* Payment Method Selector Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('om')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'om'
                    ? 'border-orange-600 bg-orange-50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-xs mx-auto flex items-center justify-center mb-1">
                  OM
                </div>
                <span className="font-bold text-xs text-stone-900 block">Orange Money</span>
                <span className="text-[10px] text-orange-700 font-semibold block">Code Marchand</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('momo')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'momo'
                    ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-stone-950 font-black text-xs mx-auto flex items-center justify-center mb-1">
                  MTN
                </div>
                <span className="font-bold text-xs text-stone-900 block">MTN MoMo</span>
                <span className="text-[10px] text-amber-800 font-semibold block">MoMoPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs mx-auto flex items-center justify-center mb-1">
                  <Banknote size={16} />
                </div>
                <span className="font-bold text-xs text-stone-900 block">À la Livraison</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">Espèces / Cash</span>
              </button>
            </div>

            {/* Merchant Code Instruction Box */}
            {paymentMethod !== 'cod' ? (
              <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white p-4 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-amber-300">
                      Code Marchand Officiel KamerChic ({paymentMethod === 'om' ? 'Orange Money' : 'MTN MoMo'})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg border border-white/20 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedCode ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                      Code Marchand à composer
                    </span>
                    <span className="font-mono font-black text-2xl text-amber-400 tracking-wider">
                      {activeMerchantCode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                      Montant exact
                    </span>
                    <span className="font-mono font-black text-lg text-white">
                      {formatXAF(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Step by step guide */}
                <div className="text-[11px] text-stone-300 space-y-1.5 leading-relaxed bg-white/5 p-3 rounded-xl">
                  <p><strong>1.</strong> Sur votre téléphone, tapez : <span className="font-mono text-amber-300 font-bold">{paymentMethod === 'om' ? '#150*4*4#' : '*126#'}</span></p>
                  <p><strong>2.</strong> Entrez le Code Marchand : <span className="font-mono text-amber-300 font-bold">{activeMerchantCode}</span></p>
                  <p><strong>3.</strong> Montant : <span className="font-mono text-amber-300 font-bold">{formatXAF(grandTotal)}</span></p>
                  <p><strong>4.</strong> Confirmez avec votre code secret.</p>
                  <p><strong>5.</strong> Saisissez ci-dessous votre Référence / ID de transaction SMS pour déclencher l'automatisation.</p>
                </div>

                {/* Transaction Ref Input */}
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">
                    Référence SMS de la Transaction *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MP260310.8291.A0294 ou TXN-9482019"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-400 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 size={16} />
                  <span>Paiement en Espèces à la Remise en Main Propre</span>
                </p>
                <p className="text-[11px] text-stone-600">
                  Vous réglerez le montant exact de <strong>{formatXAF(grandTotal)}</strong> en espèces auprès du coursier KamerChic après vérification de votre colis et signature sur le terminal de livraison.
                </p>
              </div>
            )}
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Grand Total Breakdown */}
          <div className="bg-stone-100 p-4 rounded-2xl space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Articles ({cart.length}) :</span>
              <span className="font-mono">{formatXAF(cartSubtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Remise coupon :</span>
                <span className="font-mono">-{formatXAF(discountAmount)}</span>
              </div>
            )}
            {vipDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Remise Liste Blanche VIP (-{whitelistVip?.discountPercent}%) :</span>
                <span className="font-mono">-{formatXAF(vipDiscountAmount)}</span>
              </div>
            )}
            {loyaltyDiscountValue > 0 && (
              <div className="flex justify-between text-amber-800 font-bold">
                <span>Points Club Prestige (-{maxRedeemablePoints} pts) :</span>
                <span className="font-mono">-{formatXAF(loyaltyDiscountValue)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Livraison ({city}) :</span>
              <span className="font-mono">{isFreeDelivery ? 'OFFERTE' : formatXAF(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
              <span>TOTAL NET À PAYER :</span>
              <span className="font-mono text-base text-amber-900">{formatXAF(grandTotal)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 hover:from-black hover:to-amber-900 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Enregistrement & Déclenchement JS en cours...</span>
              </>
            ) : (
              <>
                <span>Valider & Déclencher la Commande</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

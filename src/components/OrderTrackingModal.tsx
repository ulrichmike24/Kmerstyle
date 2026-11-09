import React, { useState } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Search,
  Package,
  MapPin,
  Printer,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatXAF, formatDate } from '../lib/formatters';
import { Order, OrderStatus } from '../types';

export const OrderTrackingModal: React.FC = () => {
  const {
    activeTrackingOrder,
    setActiveTrackingOrder,
    findOrder,
    language,
    t,
  } = useStore();

  const [searchCode, setSearchCode] = useState('');
  const [searchError, setSearchError] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  if (!activeTrackingOrder) return null;

  const currentOrder = activeTrackingOrder.orderNumber
    ? activeTrackingOrder
    : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    const found = findOrder(searchCode);
    if (found) {
      setActiveTrackingOrder(found);
      setSearchError(false);
    } else {
      setSearchError(true);
    }
  };

  const statusMilestones: { key: OrderStatus; label: string; desc: string }[] = [
    {
      key: 'pending',
      label: t.tracking.status.pending,
      desc: language === 'fr' ? 'Paiement ou confirmation enregistrée' : 'Payment or order booked',
    },
    {
      key: 'confirmed',
      label: t.tracking.status.confirmed,
      desc: language === 'fr' ? 'Articles réservés par l’atelier' : 'Reserved by boutique workshop',
    },
    {
      key: 'preparing',
      label: t.tracking.status.preparing,
      desc: language === 'fr' ? 'Contrôle qualité & emballage premium' : 'Packaging & quality check',
    },
    {
      key: 'in_transit',
      label: t.tracking.status.in_transit,
      desc: language === 'fr' ? 'Coursier en route avec votre colis' : 'Courier on the way to you',
    },
    {
      key: 'delivered',
      label: t.tracking.status.delivered,
      desc: language === 'fr' ? 'Colis remis en main propre' : 'Successfully handed to customer',
    },
  ];

  const getMilestoneIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'preparing': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const activeIndex = currentOrder ? getMilestoneIndex(currentOrder.status) : 0;

  const handleCallCourier = () => {
    if (currentOrder?.assignedAgentPhone) {
      window.location.href = `tel:${currentOrder.assignedAgentPhone.replace(/\s/g, '')}`;
    }
  };

  const handleWhatsAppCourier = () => {
    const phone = currentOrder?.assignedAgentPhone?.replace(/[\s\+]/g, '') || '237677889900';
    const msg = encodeURIComponent(
      `Bonjour, je vous contacte concernant ma livraison KamerChic N° ${currentOrder?.orderNumber} à ${currentOrder?.deliveryAddress.quartier}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <Truck size={20} className="text-amber-400" />
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg">
                {t.tracking.title}
              </h2>
              {currentOrder && (
                <p className="text-xs text-amber-300 font-mono">
                  {currentOrder.orderNumber}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setActiveTrackingOrder(null)}
            className="p-1 rounded-full text-stone-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar if needed */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 shrink-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder={language === 'fr' ? 'Entrez votre N° de commande (ex: KC-2025-4819)' : 'Enter order number (e.g. KC-2025-4819)'}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-amber-700 uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Search size={14} />
              <span>{t.tracking.trackBtn}</span>
            </button>
          </form>
          {searchError && (
            <p className="text-[11px] text-red-600 font-semibold mt-1.5">
              {language === 'fr' ? 'Numéro de commande introuvable. Veuillez vérifier votre saisie.' : 'Order number not found.'}
            </p>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {currentOrder ? (
            <>
              {/* Status Header Badge */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                    {language === 'fr' ? 'ÉTAT ACTUEL DE VOTRE COMMANDE' : 'CURRENT STATUS'}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-stone-900 mt-0.5">
                    {t.tracking.status[currentOrder.status]}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {formatDate(currentOrder.updatedAt, language)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-stone-900 text-amber-300 font-mono">
                    {currentOrder.paymentStatus === 'paid' ? 'Payé' : 'À régler'} ({currentOrder.paymentMethod.toUpperCase()})
                  </span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  {t.tracking.timeline}
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {statusMilestones.map((m, idx) => {
                    const isDone = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                      <div key={m.key} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow ${
                            isDone
                              ? 'bg-amber-700 ring-4 ring-amber-100'
                              : 'bg-stone-300'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>

                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-amber-900 font-extrabold'
                                : isDone
                                ? 'text-stone-900'
                                : 'text-stone-400'
                            }`}
                          >
                            {m.label}
                          </p>
                          <p className="text-[11px] text-stone-500">{m.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier Card if assigned */}
              {currentOrder.assignedAgentName && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-400 font-bold flex items-center justify-center shrink-0">
                      JP
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                        {t.tracking.assignedCourier}
                      </span>
                      <h4 className="font-bold text-xs text-stone-900">
                        {currentOrder.assignedAgentName}
                      </h4>
                      <p className="text-xs text-stone-600 font-mono">
                        {currentOrder.assignedAgentPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCallCourier}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors"
                    >
                      <Phone size={13} />
                      <span>{t.tracking.contactCourier}</span>
                    </button>
                    <button
                      onClick={handleWhatsAppCourier}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery Address Summary */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <MapPin size={15} className="text-amber-700" />
                  <span>{t.tracking.deliveryAddressTitle}</span>
                </div>
                <p className="text-stone-700">
                  <strong>Destinataire :</strong> {currentOrder.customerName} ({currentOrder.customerPhone})
                </p>
                <p className="text-stone-700">
                  <strong>Ville / Quartier :</strong> {currentOrder.deliveryAddress.city} - {currentOrder.deliveryAddress.quartier}
                </p>
                <p className="text-stone-600 italic">
                  <strong>Repère :</strong> "{currentOrder.deliveryAddress.landmark}"
                </p>
              </div>

              {/* Order Items & Totals */}
              <div className="border border-stone-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-serif font-bold text-xs text-stone-900 uppercase tracking-wider">
                  Articles commandés ({currentOrder.items.length})
                </h4>

                <div className="divide-y divide-stone-100">
                  {currentOrder.items.map((item) => (
                    <div key={item.cartItemId} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{item.product.title[language]}</p>
                        <p className="text-stone-400 text-[11px]">
                          {item.selectedSize} • {item.selectedColor} • Qté: {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-stone-800">
                        {formatXAF(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-2 text-xs space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{formatXAF(currentOrder.subtotal)}</span>
                  </div>
                  {currentOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Remise</span>
                      <span>-{formatXAF(currentOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>{formatXAF(currentOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-stone-900 pt-1 border-t border-stone-100">
                    <span>Total</span>
                    <span className="font-mono text-amber-900">{formatXAF(currentOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Invoice print trigger */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold"
                >
                  <Printer size={14} />
                  <span>{t.tracking.printReceipt}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-stone-500">
              <Package size={36} className="mx-auto text-stone-400 mb-2" />
              <p className="text-sm font-semibold">
                {language === 'fr' ? 'Entrez un numéro de commande ci-dessus pour afficher le suivi en direct.' : 'Enter an order number above to track parcel.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

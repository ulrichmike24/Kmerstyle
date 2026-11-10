import React, { useState, useRef, useEffect } from 'react';
import {
  Truck,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Banknote,
  MapPin,
  Clock,
  ArrowLeft,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Navigation,
  Camera,
  PenTool,
  Upload,
  RefreshCw,
  Eye,
  Check,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { formatXAF, formatDate } from '../../lib/formatters';
import { Order } from '../../types';

export const DeliveryAgentPortal: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    markOrderPaid,
    completeDeliveryWithProof,
    setActivePortal,
    courierSession,
    courierLogout,
    couriers,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [failedModalOrder, setFailedModalOrder] = useState<Order | null>(null);
  const [failureReason, setFailureReason] = useState('Client injoignable après 3 tentatives');

  // Proof of delivery modal state
  const [deliveringOrder, setDeliveringOrder] = useState<Order | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [viewingProofOrder, setViewingProofOrder] = useState<Order | null>(null);

  // Canvas ref for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Active courier profile
  const activeCourier = couriers.find((c) => c.phone === courierSession?.phone) || {
    id: courierSession?.agentId || 'ag-1',
    name: courierSession?.name || 'Jean-Paul Manga',
    phone: courierSession?.phone || '+237 677 88 99 00',
    zone: 'Douala & Yaoundé',
    vehicle: 'Moto Boxer 150',
    currentCashCollected: 0,
    active: true,
    pin: '2025',
  };

  // Filter orders: show orders assigned to this courier, or unassigned pending ones
  const myAssignedOrders = orders.filter((o) => {
    if (!o.assignedAgentPhone) return true;
    return o.assignedAgentPhone === activeCourier.phone;
  });

  const pendingDeliveries = myAssignedOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const completedDeliveries = myAssignedOrders.filter(
    (o) => o.status === 'delivered'
  );

  const totalCashToCollect = pendingDeliveries
    .filter((o) => o.paymentMethod === 'cod' && o.paymentStatus !== 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/[\s\+]/g, '')}`;
  };

  const handleWhatsApp = (phone: string, orderNumber: string, quartier: string) => {
    const cleanPhone = phone.replace(/[\s\+]/g, '');
    const msg = encodeURIComponent(
      `Bonjour, c'est votre livreur KamerChic (${activeCourier.name}). Je suis en route pour votre livraison (Réf: ${orderNumber}) vers ${quartier}. Êtes-vous sur place pour réceptionner le colis ?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleOpenGps = (order: Order) => {
    const query = encodeURIComponent(
      `${order.deliveryAddress.landmark}, ${order.deliveryAddress.quartier}, ${order.deliveryAddress.city}, Cameroon`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // -------------------------------------------------------------
  // SIGNATURE CANVAS INTERACTION
  // -------------------------------------------------------------
  useEffect(() => {
    if (!deliveringOrder) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const startDraw = (e: MouseEvent | TouchEvent) => {
      isDrawingRef.current = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDraw = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        setSignatureData(canvas.toDataURL('image/png'));
      }
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      window.removeEventListener('touchend', stopDraw);
    };
  }, [deliveringOrder]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  // Image Upload / Camera Capture handler
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------
  // AUTOMATION: CONFIRM DELIVERY WITH PHOTO + SIGNATURE PROOF
  // -------------------------------------------------------------
  const handleConfirmProofDelivery = async () => {
    if (!deliveringOrder) return;
    if (!capturedImage) {
      alert('Veuillez d’abord prendre ou charger la photo du colis remis au client.');
      return;
    }
    if (!signatureData) {
      alert('Veuillez faire signer le client dans le cadre prévu avant de valider.');
      return;
    }

    setIsSubmittingDelivery(true);

    try {
      // Fire JS Automation updating Firestore document
      await completeDeliveryWithProof(deliveringOrder.id, capturedImage, signatureData);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setIsSubmittingDelivery(false);
      setDeliveringOrder(null);
      setCapturedImage(null);
      setSignatureData(null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la validation. Veuillez réessayer.');
      setIsSubmittingDelivery(false);
    }
  };

  const handleConfirmFailure = async () => {
    if (!failedModalOrder) return;
    await updateOrderStatus(
      failedModalOrder.id,
      'cancelled',
      `Échec de livraison signalé par ${activeCourier.name}. Motif : ${failureReason}`,
      `Delivery failed. Reason: ${failureReason}`
    );
    setFailedModalOrder(null);
  };

  const displayedList = activeTab === 'pending' ? pendingDeliveries : completedDeliveries;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans pb-12">
      {/* Top Courier Header */}
      <header className="bg-stone-950 text-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg border-b border-amber-900/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePortal('client')}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-200 transition-colors cursor-pointer"
            title="Aller sur la boutique"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-800 text-amber-200 flex items-center justify-center font-bold">
              <Truck size={18} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm sm:text-base leading-tight flex items-center gap-1.5">
                <span>Espace Livreur • {activeCourier.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h1>
              <p className="text-[11px] text-amber-300 font-mono">
                {activeCourier.zone} • {activeCourier.vehicle}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={courierLogout}
          className="flex items-center gap-1.5 text-xs bg-red-950/70 hover:bg-red-900 text-red-200 px-3 py-1.5 rounded-xl font-bold border border-red-800 transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Quitter session</span>
        </button>
      </header>

      {/* Courier Stats Banner */}
      <div className="max-w-2xl mx-auto w-full p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Courses à effectuer
            </span>
            <div className="text-2xl font-black text-stone-900 font-mono mt-1">
              {pendingDeliveries.length}
            </div>
            <span className="text-[11px] text-amber-700 font-semibold">
              {completedDeliveries.length} livrées avec succès
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Cash en Main (À Verser)
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1">
              {formatXAF(activeCourier.currentCashCollected || 0)}
            </div>
            <span className="text-[10px] text-emerald-800 font-semibold">
              Reverser au showroom à la clôture
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-stone-200 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Courses en Cours ({pendingDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Historique Livrées ({completedDeliveries.length})
          </button>
        </div>

        {/* Orders Card List */}
        <div className="space-y-4">
          {displayedList.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-stone-500 border border-stone-200">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
              <p className="font-bold text-sm text-stone-800">
                {activeTab === 'pending'
                  ? 'Aucune course en attente pour le moment.'
                  : 'Aucune course livrée dans l’historique.'}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Dès qu’une commande est confirmée et payée, elle apparaît ici en temps réel.
              </p>
            </div>
          ) : (
            displayedList.map((order) => {
              const isPaid = order.paymentStatus === 'paid';
              const isCod = order.paymentMethod === 'cod';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4"
                >
                  {/* Top Bar with Number & Amount */}
                  <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {formatDate(order.createdAt, 'fr')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-stone-900 mt-0.5">
                        Client : {order.customerName}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-base text-amber-900">
                        {formatXAF(order.total)}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-block ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {isPaid ? `Payé (${order.paymentMethod.toUpperCase()})` : 'À encaisser en Cash (COD)'}
                      </span>
                    </div>
                  </div>

                  {/* Informal Cameroon Address Highlight */}
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-xs text-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-amber-950">
                        <MapPin size={16} className="text-amber-700 shrink-0" />
                        <span>
                          {order.deliveryAddress.city} • Quartier {order.deliveryAddress.quartier}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenGps(order)}
                        className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors cursor-pointer"
                      >
                        <Navigation size={12} />
                        <span>Ouvrir GPS</span>
                      </button>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-amber-300/80 text-xs">
                      <span className="font-bold text-amber-900">Repère visuel :</span> "{order.deliveryAddress.landmark}"
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <p className="font-semibold text-stone-700 mb-1">Articles dans le colis :</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="truncate">
                          {item.quantity}x {item.product.title.fr} ({item.selectedSize} • {item.selectedColor})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Proof of delivery preview if already delivered */}
                  {order.status === 'delivered' && (
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        <span>Livré le {order.deliveredAt ? formatDate(order.deliveredAt, 'fr') : 'Récemment'}</span>
                      </span>

                      {(order.deliveryProofImage || order.clientSignature) && (
                        <button
                          onClick={() => setViewingProofOrder(order)}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Voir Preuves (Photo & Signature)</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Actions for pending deliveries */}
                  {order.status !== 'delivered' && (
                    <div className="space-y-3 pt-1">
                      {/* Call & WhatsApp */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCall(order.customerPhone)}
                          className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-colors"
                        >
                          <Phone size={14} />
                          <span>Appeler ({order.customerPhone})</span>
                        </button>

                        <button
                          onClick={() =>
                            handleWhatsApp(
                              order.customerPhone,
                              order.orderNumber,
                              order.deliveryAddress.quartier
                            )
                          }
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-colors"
                        >
                          <MessageSquare size={14} />
                          <span>WhatsApp Direct</span>
                        </button>
                      </div>

                      {/* Complete Delivery with Proof Trigger */}
                      <button
                        onClick={() => {
                          setDeliveringOrder(order);
                          setCapturedImage(null);
                          setSignatureData(null);
                        }}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                      >
                        <CheckCircle2 size={16} />
                        <span>Effectuer la Livraison (Photo Colis + Signature Client)</span>
                      </button>

                      <button
                        onClick={() => setFailedModalOrder(order)}
                        className="w-full py-1 text-stone-400 hover:text-red-700 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle size={13} />
                        <span>Signaler un problème ou report de livraison</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PROOF OF DELIVERY (PHOTO CAPTURE + CLIENT SIGNATURE) */}
      {/* ------------------------------------------------------------- */}
      {deliveringOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 my-8 space-y-5 text-xs text-stone-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Validation de Remise Sécurisée
                </span>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Preuves de Livraison : {deliveringOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setDeliveringOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
              <p><strong>Destinataire :</strong> {deliveringOrder.customerName} ({deliveringOrder.customerPhone})</p>
              <p><strong>Lieu :</strong> {deliveringOrder.deliveryAddress.city} - {deliveringOrder.deliveryAddress.quartier}</p>
              <p><strong>Total Commande :</strong> <span className="font-mono font-bold text-amber-900">{formatXAF(deliveringOrder.total)}</span></p>
            </div>

            {/* STEP 1: PHOTO CAPTURE */}
            <div className="space-y-2">
              <label className="block font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Camera size={15} className="text-amber-800" />
                <span>1. Capture Photo du Produit avec le Client *</span>
              </label>

              {capturedImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-stone-300 bg-stone-100 max-h-56">
                  <img src={capturedImage} alt="Preuve de livraison" className="w-full h-56 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 hover:border-amber-700 rounded-2xl cursor-pointer bg-stone-50 hover:bg-amber-50/50 transition-colors">
                  <Camera size={32} className="text-amber-700 mb-2" />
                  <span className="font-bold text-xs text-stone-900">Prendre la photo du colis remis</span>
                  <span className="text-[11px] text-stone-500 mt-0.5">Appareil photo ou fichier image</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* STEP 2: DIGITAL SIGNATURE PAD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                  <PenTool size={15} className="text-amber-800" />
                  <span>2. Signature Numérique du Client (Doigt / Stylet) *</span>
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Effacer</span>
                </button>
              </div>

              <div className="border border-stone-300 rounded-2xl bg-white p-1 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={150}
                  className="w-full h-36 bg-white cursor-crosshair touch-none"
                />
              </div>
              <p className="text-[10px] text-stone-500 italic">
                Faites signer le destinataire dans le cadre blanc pour attester la bonne réception sans réserve.
              </p>
            </div>

            {/* Submit Proof Button */}
            <div className="pt-2 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeliveringOrder(null)}
                className="px-4 py-2.5 rounded-full border border-stone-300 font-bold text-xs cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={!capturedImage || !signatureData || isSubmittingDelivery}
                onClick={handleConfirmProofDelivery}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isSubmittingDelivery ? (
                  <span>Validation automatique...</span>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Valider la Livraison avec Succès</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: VIEW SAVED PROOF (PHOTO + SIGNATURE) */}
      {/* ------------------------------------------------------------- */}
      {viewingProofOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs text-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-sm text-stone-900">
                Preuves de Livraison • {viewingProofOrder.orderNumber}
              </h3>
              <button onClick={() => setViewingProofOrder(null)} className="p-1 text-stone-400">
                <X size={18} />
              </button>
            </div>

            {viewingProofOrder.deliveryProofImage && (
              <div>
                <p className="font-bold text-stone-700 mb-1">Photo de la remise :</p>
                <img
                  src={viewingProofOrder.deliveryProofImage}
                  alt="Preuve"
                  className="w-full h-48 object-cover rounded-xl border border-stone-200 bg-stone-100"
                />
              </div>
            )}

            {viewingProofOrder.clientSignature && (
              <div>
                <p className="font-bold text-stone-700 mb-1">Signature du client :</p>
                <img
                  src={viewingProofOrder.clientSignature}
                  alt="Signature"
                  className="w-full h-24 object-contain rounded-xl border border-stone-200 bg-stone-50 p-2"
                />
              </div>
            )}

            <div className="text-right pt-2">
              <button
                onClick={() => setViewingProofOrder(null)}
                className="px-4 py-2 rounded-full bg-stone-900 text-white font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failure Reason Modal */}
      {failedModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-stone-200 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertTriangle size={18} />
              <h3>Échec de Livraison : {failedModalOrder.orderNumber}</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Motif du report ou de l’échec
              </label>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-medium cursor-pointer"
              >
                <option value="Client injoignable après 3 tentatives">Client injoignable par téléphone</option>
                <option value="Mauvaise adresse / Repère introuvable">Repère ou quartier introuvable</option>
                <option value="Client demande un report à demain">Client absent - Report demandé</option>
                <option value="Refus du colis par le client">Refus du colis</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFailedModalOrder(null)}
                className="px-4 py-2 rounded-full border border-stone-300 text-xs font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmFailure}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow"
              >
                Confirmer l’Échec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

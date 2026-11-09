import React, { useState } from 'react';
import { Truck, Phone, KeyRound, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const DeliveryLoginGate: React.FC = () => {
  const { courierLogin, couriers, setActivePortal } = useStore();

  const [phone, setPhone] = useState('+237 677 88 99 00');
  const [pin, setPin] = useState('2025');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = courierLogin(phone, pin);
    if (!result.success) {
      setErrorMsg(result.error || 'Connexion refusée');
    }
  };

  const selectCourierDemo = (cPhone: string, cPin: string) => {
    setPhone(cPhone);
    setPin(cPin);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center p-4 relative font-sans">
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => setActivePortal('client')}
          className="flex items-center gap-2 text-stone-300 hover:text-white text-xs font-semibold bg-stone-800 px-3.5 py-2 rounded-full border border-stone-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Retour à la Boutique</span>
        </button>
      </div>

      <div className="w-full max-w-sm bg-stone-800/90 border border-stone-700 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5 text-white">
        <div className="text-center space-y-1.5">
          <div className="w-13 h-13 rounded-2xl bg-amber-600 text-stone-950 flex items-center justify-center mx-auto shadow-md">
            <Truck size={28} />
          </div>
          <h1 className="font-serif text-xl font-bold">Connexion Espace Livreur</h1>
          <p className="text-xs text-stone-400">
            Réservé aux coursiers autorisés et enregistrés par la direction
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Numéro de Téléphone Enregistré
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 6XX XX XX XX"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Code PIN d'Accès (4 Chiffres)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ex: 2025"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-amber-500"
              />
              <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow transition-all cursor-pointer"
          >
            Se Connecter à ma Tournée
          </button>
        </form>

        {/* Active Couriers quick demo selection */}
        <div className="bg-stone-900/80 border border-stone-700/80 rounded-2xl p-3.5 text-xs text-stone-400 space-y-2">
          <span className="font-bold text-stone-300 block text-[11px]">
            ⚡ Coursiers Actifs Créés par l'Admin :
          </span>
          <div className="space-y-1.5">
            {couriers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCourierDemo(c.phone, c.pin)}
                className="w-full text-left p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-[11px] flex justify-between items-center transition-colors"
              >
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-[10px] text-stone-400 font-mono">{c.phone} • Secteur : {c.zone}</p>
                </div>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                  PIN: {c.pin}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

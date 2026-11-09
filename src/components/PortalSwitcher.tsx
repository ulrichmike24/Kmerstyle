import React from 'react';
import { useStore } from '../context/StoreContext';
import { PortalType } from '../types';
import { ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

export const PortalSwitcher: React.FC = () => {
  const { activePortal, setActivePortal } = useStore();

  const portals: { id: PortalType; label: string; icon: React.ReactNode; hash: string }[] = [
    {
      id: 'client',
      label: 'Boutique Client',
      icon: <ShoppingBag size={13} />,
      hash: '#client',
    },
    {
      id: 'admin',
      label: 'Portail Admin (CRUD)',
      icon: <ShieldCheck size={13} />,
      hash: '#admin',
    },
    {
      id: 'delivery',
      label: 'Espace Livreur',
      icon: <Truck size={13} />,
      hash: '#delivery',
    },
  ];

  return (
    <div className="bg-stone-950 text-white border-b border-stone-800 text-xs py-1.5 px-4 shrink-0 flex items-center justify-between">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-stone-400 text-[11px]">
          <span className="font-serif font-bold text-amber-400">KamerChic</span>
          <span className="hidden sm:inline">• Switcher de Portails :</span>
        </div>

        <div className="flex items-center gap-1.5">
          {portals.map((p) => {
            const isActive = activePortal === p.id;
            return (
              <a
                key={p.id}
                href={p.hash}
                onClick={(e) => {
                  e.preventDefault();
                  setActivePortal(p.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                {p.icon}
                <span>{p.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

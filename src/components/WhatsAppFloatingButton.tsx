import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const { language } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  const cameroonSupportPhone = '237659172101'; // Official KamerChic line +237 659 17 21 01

  const quickPrompts = [
    {
      fr: 'Bonjour, j’ai une question sur la disponibilité d’une taille.',
      en: 'Hello, I have a question about size availability.',
    },
    {
      fr: 'Bonjour, je souhaite des précisions sur les délais de livraison depuis Yaoundé.',
      en: 'Hello, I would like to know delivery times from Yaoundé.',
    },
    {
      fr: 'Bonjour, je souhaite passer commande directement par WhatsApp.',
      en: 'Hello, I would like to place an order directly on WhatsApp.',
    },
  ];

  const handleSend = (text: string) => {
    const message = encodeURIComponent(text || (language === 'fr' ? 'Bonjour KamerChic Yaoundé, j’aimerais des conseils.' : 'Hello KamerChic Yaoundé, I need assistance.'));
    window.open(`https://wa.me/${cameroonSupportPhone}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expanded Quick Message Bubble */}
      {isOpen && (
        <div className="mb-3 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 w-72 sm:w-80 animate-in fade-in slide-in-from-bottom-4 duration-200 text-stone-800">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                KC
              </div>
              <div>
                <h4 className="font-bold text-xs text-stone-900">Support KamerChic</h4>
                <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {language === 'fr' ? 'En ligne à Yaoundé (Bastos)' : 'Online in Yaoundé (Bastos)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
            {language === 'fr'
              ? 'Besoin d’aide pour choisir une taille, suivre un colis ou commander directement ? Discutons sur WhatsApp !'
              : 'Need help choosing a size, tracking an order, or buying directly? Chat with us on WhatsApp!'}
          </p>

          <div className="mt-3 space-y-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p[language])}
                className="w-full text-left p-2 rounded-xl bg-stone-50 hover:bg-emerald-50 text-[11px] text-stone-700 hover:text-emerald-900 font-medium border border-stone-100 transition-colors"
              >
                💬 {p[language]}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-1.5">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={language === 'fr' ? 'Votre message...' : 'Your message...'}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
              onKeyDown={(e) => e.key === 'Enter' && handleSend(customText)}
            />
            <button
              onClick={() => handleSend(customText)}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Pill / Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-emerald-900/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/40"
        aria-label="WhatsApp Support"
      >
        <MessageSquare size={22} className="fill-white" />
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          {language === 'fr' ? 'WhatsApp Direct' : 'WhatsApp Chat'}
        </span>
      </button>
    </div>
  );
};

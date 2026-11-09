import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, ShoppingBag, Eye, RefreshCw, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatXAF } from '../lib/formatters';
import { Product } from '../types';
import { getStylistRecommendations, StylistMessage } from '../services/ai/geminiStylist';

export const GeminiShoppingAssistant: React.FC = () => {
  const { products, addToCart, setActiveProductDetail, language } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const initialWelcomeText =
    language === 'fr'
      ? `Bonjour et bienvenue chez KamerChic ! Je suis votre Styliste Privé propulsé par Gemini AI. Pour quel événement ou quelle envie recherchez-vous une tenue aujourd'hui ? (Mariage coutumier, gala d'hôtel, affaires, parfum...) Indiquez-moi aussi votre budget en FCFA si vous le souhaitez !`
      : `Hello and welcome to KamerChic! I am your Private Fashion Stylist powered by Gemini AI. What special occasion or style are you looking for today? (Traditional wedding, evening gala, executive wear, luxury fragrance...) Feel free to mention your budget in FCFA!`;

  const [messages, setMessages] = useState<StylistMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: initialWelcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    {
      fr: '👑 Tenue pour mariage coutumier / dot',
      en: '👑 Outfit for traditional wedding / dowry',
      query: 'Je cherche une tenue prestigieuse pour un mariage coutumier ou une dot au Cameroun.',
    },
    {
      fr: '💼 Costume d’affaires élégant pour Douala',
      en: '💼 Executive suit for Douala business',
      query: 'Conseillez-moi un costume haut de gamme et respirant pour des rendez-vous d’affaires à Douala.',
    },
    {
      fr: '✨ Robe de soirée avec budget < 90 000 FCFA',
      en: '✨ Evening dress under 90,000 FCFA',
      query: 'Je cherche une robe de soirée chic pour un gala à Yaoundé avec un budget inférieur à 90 000 FCFA.',
    },
    {
      fr: '⌚ Montre prestige pour homme',
      en: '⌚ Luxury men’s timepiece',
      query: 'Montrez-moi une montre d’exception en acier pour homme pour une grande occasion.',
    },
    {
      fr: '🌹 Parfum de niche longue tenue',
      en: '🌹 Long-lasting niche perfume',
      query: 'Je veux un parfum de grand luxe avec un sillage fort et longue tenue de 24h.',
    },
  ];

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: StylistMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await getStylistRecommendations(queryText, products, language);
      const assistantMsg: StylistMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: result.text,
        recommendedProducts: result.recommendedProducts,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: StylistMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'fr'
            ? 'Nos stylistes vous recommandent ces pièces phares de la collection KamerChic pour votre prestance.'
            : 'Our stylists recommend these flagship pieces from the KamerChic luxury collection.',
        recommendedProducts: products.slice(0, 2),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const defaultVariant = product.variants[0];
    if (defaultVariant) {
      addToCart(product, defaultVariant, 1);
      setAddedItemNotice(product.title[language]);
      setTimeout(() => setAddedItemNotice(null), 3000);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: initialWelcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Stylist Trigger Button */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-amber-200 hover:text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-amber-950/40 border border-amber-600/40 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          aria-label="Styliste IA KamerChic"
        >
          <div className="relative">
            <Sparkles size={18} className="text-amber-400 animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-left">
            <span className="block text-xs font-serif font-black tracking-wide text-white">
              Styliste IA • Gemini
            </span>
            <span className="hidden sm:block text-[10px] text-amber-300/80 font-sans">
              {language === 'fr' ? 'Conseils mode personnalisés' : 'Personal luxury stylist'}
            </span>
          </div>
        </button>
      </div>

      {/* Stylist Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start sm:justify-start sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#faf9f6] w-full sm:max-w-md h-[88vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 text-white px-5 py-4 flex items-center justify-between border-b border-amber-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-stone-950 flex items-center justify-center font-serif font-black text-sm shadow-inner">
                  KC
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm tracking-wide flex items-center gap-1.5 text-white">
                    <span>KamerChic Styliste Privé</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30 font-sans font-semibold">
                      Gemini AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-amber-200/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {language === 'fr' ? 'Disponible • Douala & Yaoundé' : 'Active • Douala & Yaoundé'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Nouvelle conversation"
                  className="p-1.5 rounded-lg text-amber-300/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-amber-300/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notification toast if item added */}
            {addedItemNotice && (
              <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold text-center animate-in fade-in shrink-0">
                ✓ {addedItemNotice} ajouté au panier !
              </div>
            )}

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-stone-900 text-white rounded-br-none'
                        : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none shadow-stone-200/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1.5 ${
                        msg.sender === 'user' ? 'text-stone-400' : 'text-stone-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Recommended Products Cards inside Assistant Message */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="w-full mt-3 space-y-2.5">
                      <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-600" />
                        <span>
                          {language === 'fr'
                            ? 'Créations recommandées pour vous :'
                            : 'Recommended luxury creations:'}
                        </span>
                      </p>

                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.recommendedProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="bg-white rounded-2xl p-2.5 border border-stone-200 shadow-sm flex items-center gap-3 hover:border-amber-400 transition-all"
                          >
                            <img
                              src={prod.images[0]}
                              alt={prod.title[language]}
                              className="w-16 h-18 object-cover rounded-xl bg-stone-100 shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                                {prod.brand}
                              </span>
                              <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                                {prod.title[language]}
                              </h4>
                              <p className="text-xs font-mono font-bold text-amber-950 mt-0.5">
                                {formatXAF(prod.price)}
                              </p>

                              <div className="flex items-center gap-1.5 mt-2">
                                <button
                                  onClick={() => handleAddToCart(prod)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
                                >
                                  <ShoppingBag size={11} />
                                  <span>Ajouter</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveProductDetail(prod);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                                >
                                  <Eye size={11} />
                                  <span>Fiche</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-white rounded-2xl rounded-bl-none p-3.5 border border-stone-200 shadow-sm text-xs text-stone-600 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-600 animate-spin" />
                    <span>
                      {language === 'fr'
                        ? 'Le styliste KamerChic sélectionne les meilleures tenues...'
                        : 'Stylist is selecting the finest creations for you...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-3 py-2 bg-stone-100 border-t border-stone-200/80 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(qp.query)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-amber-50 text-[11px] font-medium text-stone-700 hover:text-amber-900 border border-stone-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  {qp[language]}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-stone-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery(inputText);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    language === 'fr'
                      ? 'Ex: Robe chic pour mariage coutumier à Douala...'
                      : 'E.g.: Luxury wedding outfit, budget 80 000 FCFA...'
                  }
                  disabled={isLoading}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-700 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-r from-stone-900 to-amber-950 hover:from-black hover:to-amber-900 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-md"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

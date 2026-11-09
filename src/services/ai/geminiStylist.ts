import { GoogleGenAI } from '@google/genai';
import { Product } from '../../types';

export interface StylistMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedProducts?: Product[];
  timestamp: string;
}

/**
 * Service to recommend products using Gemini AI with fallback to semantic catalog ranking
 */
export async function getStylistRecommendations(
  userQuery: string,
  catalog: Product[],
  language: 'fr' | 'en' = 'fr'
): Promise<{ text: string; recommendedProducts: Product[] }> {
  // 1. Try Gemini API if key is present in environment
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    '';

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const catalogSummary = catalog
        .map(
          (p) =>
            `- ID: "${p.id}", Titre: "${p.title.fr}" / "${p.title.en}", Catégorie: "${p.category}", Prix: ${p.price} FCFA, Tailles: [${p.variants.map((v) => v.size).join(', ')}], Couleurs: [${p.variants.map((v) => v.color).join(', ')}], Description: "${p.description.fr}"`
        )
        .join('\n');

      const systemPrompt = `Tu es le Styliste Privé d'élite et Conseiller Mode de la prestigieuse maison de mode "KamerChic" au Cameroun (boutiques à Akwa Douala et Bastos Yaoundé).
Ton rôle est de conseiller les clients avec élégance, courtoisie et chaleur, en tenant compte du climat camerounais, des événements locaux (mariages coutumiers/dots, galas d'hôtels, dîners à Bonanjo/Bastos, rendez-vous d'affaires, cérémonies religieuses) et du budget en FCFA.

CATALOGUE DISPONIBLE CHEZ KAMERCHIC :
${catalogSummary}

DIRECTIVES :
1. Réponds dans la langue du client (${language === 'fr' ? 'français' : 'anglais'}).
2. Donne un conseil stylistique personnalisé (harmonie des couleurs, accessoires, occasions, conseils de port).
3. Sélectionne impérativement 1 à 3 produits EXACTS du catalogue qui correspondent au besoin ou au budget.
4. À la TOUTE FIN de ta réponse, insère STRICTEMENT un bloc JSON de la forme exacte suivante (sans texte après) :
RECOMMENDED_PRODUCTS_JSON: ["id1", "id2"]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userQuery,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      const match = responseText.match(/RECOMMENDED_PRODUCTS_JSON:\s*(\[[^\]]*\])/);

      let productIds: string[] = [];
      let cleanedText = responseText;

      if (match && match[1]) {
        try {
          productIds = JSON.parse(match[1]);
          cleanedText = responseText.replace(/RECOMMENDED_PRODUCTS_JSON:\s*\[[^\]]*\]/, '').trim();
        } catch {
          // parse error
        }
      }

      const matchedProducts = catalog.filter((p) => productIds.includes(p.id));

      if (matchedProducts.length > 0) {
        return {
          text: cleanedText,
          recommendedProducts: matchedProducts,
        };
      }
    } catch {
      // Fall through to smart Cameroon luxury matcher
    }
  }

  // 2. Intelligent Smart Fallback (Deterministic Cameroon Luxury Stylist)
  const queryLower = userQuery.toLowerCase();

  let matched: Product[] = [];
  let adviceFr = '';
  let adviceEn = '';

  if (queryLower.includes('mariage') || queryLower.includes('dot') || queryLower.includes('tradition') || queryLower.includes('boubou') || queryLower.includes('bazin')) {
    matched = catalog.filter(
      (p) =>
        p.id === 'prod-1' ||
        p.id === 'prod-2' ||
        p.id === 'prod-13' ||
        p.title.fr.toLowerCase().includes('bazin') ||
        p.title.fr.toLowerCase().includes('robe')
    );
    adviceFr = `Pour une cérémonie prestigieuse ou une dot au Cameroun, la prestance passe par la noblesse des étoffes. Le Bazin riche teinté avec broderies royales ou une robe en soie plissée incarnent le raffinement absolu sous le soleil tropical. Associez-les avec des souliers en cuir ciré ou des escarpins raffinés pour parfaire l'allure royale.`;
    adviceEn = `For a distinguished wedding or traditional ceremony in Cameroon, elegance demands noble fabrics. Our hand-embroidered royal Bazin or pleated silk gown will ensure you make an unforgettable impression. Pair with polished Italian leather footwear to complete the royal look.`;
  } else if (queryLower.includes('montre') || queryLower.includes('watch') || queryLower.includes('heure') || queryLower.includes('poignet')) {
    matched = catalog.filter((p) => p.category === 'watches');
    adviceFr = `Une montre d'exception est la signature silencieuse de l'élégance masculine et féminine. Nos garde-temps automatiques et chronographes en acier chirurgical 316L résistent à l'humidité tropicale tout en offrant une finition joaillière digne des plus grands salons d'Akwa et Bastos.`;
    adviceEn = `A distinguished timepiece is the ultimate quiet signature of sophistication. Crafted from surgical 316L stainless steel, our automatic chronographs withstand tropical humidity with heirloom-level prestige.`;
  } else if (queryLower.includes('parfum') || queryLower.includes('fragrance') || queryLower.includes('odeur') || queryLower.includes('senteur')) {
    matched = catalog.filter((p) => p.category === 'perfumes');
    adviceFr = `Sous notre climat chaud et humide, privilégiez les extraits de parfum riches en Oud royal, ambre gris, vanille de Madagascar et cuir. Ces notes olfactives nobles offrent une tenue exceptionnelle de plus de 24 heures et un sillage envoûtant lors de vos soirées.`;
    adviceEn = `In warm tropical climates, high-concentration pure perfumes featuring Royal Oud, amber, and vanilla provide extraordinary 24-hour sillage and magnetic presence for evening receptions.`;
  } else if (queryLower.includes('chaussure') || queryLower.includes('soulier') || queryLower.includes('mocassin') || queryLower.includes('shoe') || queryLower.includes('escarpin')) {
    matched = catalog.filter((p) => p.category === 'shoes');
    adviceFr = `Nos souliers sont montés selon la tradition cousue avec du cuir pleine fleur italien patiné à la main. Le confort de la semelle respirante vous assure une démarche aisée toute la journée, que ce soit pour vos rendez-vous d'affaires ou vos cérémonies.`;
    adviceEn = `Crafted with hand-patinated Italian full-grain leather, our footwear guarantees unmatched comfort, breathability, and authority for both business executive meetings and gala evenings.`;
  } else if (queryLower.includes('costume') || queryLower.includes('bureau') || queryLower.includes('business') || queryLower.includes('travail') || queryLower.includes('veste')) {
    matched = catalog.filter((p) => p.id === 'prod-3' || p.category === 'men');
    adviceFr = `Pour vos conseils d'administration et rendez-vous diplomatiques à Douala ou Yaoundé, la laine froide italienne Super 150s est incontournable : elle respire naturellement et conserve un tombé impeccable sans froisser malgré la chaleur.`;
    adviceEn = `For executive meetings and diplomatic galas in Douala or Yaoundé, Super 150s Italian cool wool provides natural breathability, crisp structure, and regal poise under tropical conditions.`;
  } else {
    // Budget or general selection
    const budgetMatch = queryLower.match(/(\d+[\s\d]*)/);
    let maxPrice = Infinity;
    if (budgetMatch) {
      const num = parseInt(budgetMatch[1].replace(/\s/g, ''), 10);
      if (num > 10000) maxPrice = num;
    }

    matched = catalog.filter((p) => p.price <= maxPrice).slice(0, 3);
    if (matched.length === 0) matched = catalog.slice(0, 3);

    adviceFr = `Voici une sélection sur-mesure confectionnée par nos stylistes KamerChic. Chaque création est façonnée avec des finitions haute couture pour magnifier votre allure en toute circonstance.`;
    adviceEn = `Here is an exclusive curated selection from our KamerChic stylists. Each piece is crafted with couture precision to elevate your personal style on every occasion.`;
  }

  // Ensure we have at least 1-3 items
  if (matched.length === 0) {
    matched = catalog.slice(0, 2);
  } else {
    matched = matched.slice(0, 3);
  }

  return {
    text: language === 'fr' ? adviceFr : adviceEn,
    recommendedProducts: matched,
  };
}

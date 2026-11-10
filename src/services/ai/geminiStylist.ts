import { Product } from '../../types';

export interface StylistMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedProducts?: Product[];
  timestamp: string;
}

/**
 * Service to recommend products using Server-Side Gemini AI proxy
 * with client-side fallback to semantic catalog matching for offline reliability.
 */
export async function getStylistRecommendations(
  userQuery: string,
  catalog: Product[],
  language: 'fr' | 'en' = 'fr'
): Promise<{ text: string; recommendedProducts: Product[] }> {
  // 1. Call server-side Gemini API endpoint
  try {
    const response = await fetch('/api/ai/stylist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userQuery,
        catalog: catalog.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          brand: p.brand,
          variants: p.variants.map((v) => ({ size: v.size, color: v.color })),
          description: p.description,
          images: p.images,
        })),
        language,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        // Hydrate recommended products from our catalog state
        const matched = (data.recommendedProducts || []).map((rp: any) => {
          return catalog.find((c) => c.id === rp.id) || rp;
        });

        return {
          text: data.text,
          recommendedProducts: matched.length > 0 ? matched : findLocalMatches(userQuery, catalog),
        };
      }
    }
  } catch (error) {
    console.warn('Server Gemini call failed, using local Cameroon luxury stylist engine:', error);
  }

  // 2. Intelligent Client Fallback (Deterministic Cameroon Luxury Stylist)
  return getLocalStylistFallback(userQuery, catalog, language);
}

/**
 * Stream stylist recommendations via SSE from the server
 */
export async function streamStylistRecommendations(
  userQuery: string,
  catalog: Product[],
  language: 'fr' | 'en' = 'fr',
  onChunk: (text: string) => void
): Promise<{ text: string; recommendedProducts: Product[] }> {
  try {
    const response = await fetch('/api/ai/stylist/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userQuery,
        catalog: catalog.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
        })),
        language,
      }),
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let recommendedProducts: Product[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                fullText += data.chunk;
                onChunk(data.chunk);
              }
              if (data.done && data.recommendedProducts) {
                recommendedProducts = data.recommendedProducts.map(
                  (rp: any) => catalog.find((c) => c.id === rp.id) || rp
                );
              }
            } catch {}
          }
        }
      }

      return {
        text: fullText,
        recommendedProducts: recommendedProducts.length > 0 ? recommendedProducts : findLocalMatches(userQuery, catalog),
      };
    }
  } catch (err) {
    console.warn('Stream failed, falling back:', err);
  }

  const fallback = getLocalStylistFallback(userQuery, catalog, language);
  onChunk(fallback.text);
  return fallback;
}

/**
 * Deterministic Cameroon Luxury Stylist Engine
 */
function findLocalMatches(userQuery: string, catalog: Product[]): Product[] {
  const q = userQuery.toLowerCase();
  if (q.includes('mariage') || q.includes('dot') || q.includes('bazin') || q.includes('boubou') || q.includes('tradition')) {
    return catalog.filter((p) => p.category === 'men' || p.category === 'women').slice(0, 3);
  }
  if (q.includes('montre') || q.includes('watch') || q.includes('heure')) {
    return catalog.filter((p) => p.category === 'watches').slice(0, 3);
  }
  if (q.includes('parfum') || q.includes('fragrance') || q.includes('senteur')) {
    return catalog.filter((p) => p.category === 'perfumes').slice(0, 3);
  }
  if (q.includes('chaussure') || q.includes('soulier') || q.includes('mocassin') || q.includes('shoe')) {
    return catalog.filter((p) => p.category === 'shoes').slice(0, 3);
  }
  return catalog.slice(0, 3);
}

function getLocalStylistFallback(
  userQuery: string,
  catalog: Product[],
  language: 'fr' | 'en'
): { text: string; recommendedProducts: Product[] } {
  const queryLower = userQuery.toLowerCase();
  let matched = findLocalMatches(userQuery, catalog);

  let adviceFr = '';
  let adviceEn = '';

  if (queryLower.includes('mariage') || queryLower.includes('dot') || queryLower.includes('tradition') || queryLower.includes('bazin')) {
    adviceFr = `Pour une cérémonie prestigieuse ou une dot au Cameroun, la prestance passe par la noblesse des étoffes. Le Bazin riche teinté avec broderies royales ou une robe en soie plissée incarnent le raffinement absolu sous le soleil tropical. Associez-les avec des souliers en cuir ciré pour parfaire l'allure royale.`;
    adviceEn = `For a distinguished wedding or traditional ceremony in Cameroon, elegance demands noble fabrics. Our hand-embroidered royal Bazin or pleated silk gown will ensure you make an unforgettable impression. Pair with polished Italian leather footwear to complete the royal look.`;
  } else if (queryLower.includes('montre') || queryLower.includes('watch')) {
    adviceFr = `Une montre d'exception est la signature silencieuse de l'élégance masculine et féminine. Nos garde-temps automatiques en acier 316L résistent à l'humidité tropicale tout en offrant une finition joaillière digne des plus grands salons d'Akwa et Bastos.`;
    adviceEn = `A distinguished timepiece is the ultimate quiet signature of sophistication. Crafted from surgical 316L stainless steel, our automatic chronographs withstand tropical humidity with heirloom-level prestige.`;
  } else if (queryLower.includes('parfum')) {
    adviceFr = `Sous notre climat chaud et humide, privilégiez les extraits de parfum riches en Oud royal, ambre gris et vanille de Madagascar. Ces notes olfactives nobles offrent une tenue exceptionnelle de plus de 24 heures.`;
    adviceEn = `In warm tropical climates, high-concentration pure perfumes featuring Royal Oud, amber, and vanilla provide extraordinary 24-hour sillage and magnetic presence for evening receptions.`;
  } else if (queryLower.includes('chaussure') || queryLower.includes('soulier')) {
    adviceFr = `Nos souliers sont montés selon la tradition cousue avec du cuir pleine fleur italien patiné à la main. Le confort de la semelle respirante vous assure une démarche aisée toute la journée.`;
    adviceEn = `Crafted with hand-patinated Italian full-grain leather, our footwear guarantees unmatched comfort, breathability, and authority for both business meetings and gala evenings.`;
  } else {
    adviceFr = `Voici une sélection sur-mesure confectionnée par nos stylistes KamerChic. Chaque création est façonnée avec des finitions haute couture pour magnifier votre allure en toute circonstance.`;
    adviceEn = `Here is an exclusive curated selection from our KamerChic stylists. Each piece is crafted with couture precision to elevate your personal style on every occasion.`;
  }

  if (matched.length === 0) matched = catalog.slice(0, 2);

  return {
    text: language === 'fr' ? adviceFr : adviceEn,
    recommendedProducts: matched,
  };
}

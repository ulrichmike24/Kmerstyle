import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { paymentRouter } from './src/server/paymentRoutes';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize GoogleGenAI server-side with user-agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ============================================================================
// GEMINI AI SERVER ENDPOINTS
// ============================================================================

/**
 * Health & Capabilities Check
 */
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    model: 'gemini-3.8-flash',
    hasApiKey: !!apiKey,
    serverTimestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/ai/stylist
 * Server-side execution of KamerChic Fashion Assistant
 */
app.post('/api/ai/stylist', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userQuery, catalog = [], language = 'fr' } = req.body;

    if (!userQuery || typeof userQuery !== 'string') {
      res.status(400).json({ error: 'Requete client requise (userQuery)' });
      return;
    }

    if (!ai) {
      // Graceful Cameroon luxury deterministic fallback if no API key configured
      const fallback = generateServerFallback(userQuery, catalog, language);
      res.json(fallback);
      return;
    }

    const catalogSummary = (catalog as any[])
      .map(
        (p) =>
          `- ID: "${p.id}", Titre: "${p.title?.fr || ''}" / "${p.title?.en || ''}", Catégorie: "${p.category}", Prix: ${p.price} FCFA, Tailles: [${(p.variants || []).map((v: any) => v.size).join(', ')}], Couleurs: [${(p.variants || []).map((v: any) => v.color).join(', ')}], Description: "${p.description?.fr || ''}"`
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

    const timeoutPromise = new Promise<{ text?: string }>((_, reject) => {
      setTimeout(() => reject(new Error('Stylist timeout')), 8000);
    });

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userQuery,
        config: {
          systemInstruction: systemPrompt,
        },
      }),
      timeoutPromise,
    ]);

    const responseText = response.text || '';
    const match = responseText.match(/RECOMMENDED_PRODUCTS_JSON:\s*(\[[^\]]*\])/);

    let productIds: string[] = [];
    let cleanedText = responseText;

    if (match && match[1]) {
      try {
        productIds = JSON.parse(match[1]);
        cleanedText = responseText.replace(/RECOMMENDED_PRODUCTS_JSON:\s*\[[^\]]*\]/, '').trim();
      } catch {
        // Fall through
      }
    }

    let matchedProducts = (catalog as any[]).filter((p) => productIds.includes(p.id));

    if (matchedProducts.length === 0) {
      matchedProducts = findKeywordMatches(userQuery, catalog);
    }

    res.json({
      text: cleanedText || (language === 'fr' ? 'Voici nos recommandations prestigieuses KamerChic.' : 'Here are our curated KamerChic recommendations.'),
      recommendedProducts: matchedProducts,
    });
  } catch (error) {
    console.error('Gemini stylist server error:', error);
    // Provide guaranteed Cameroon luxury response
    const { userQuery = '', catalog = [], language = 'fr' } = req.body || {};
    const fallback = generateServerFallback(userQuery, catalog, language);
    res.json(fallback);
  }
});

/**
 * POST /api/ai/stylist/stream
 * Server-Sent Events (SSE) streaming for real-time response generation
 */
app.post('/api/ai/stylist/stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userQuery, catalog = [], language = 'fr' } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!ai) {
      const fallback = generateServerFallback(userQuery, catalog, language);
      res.write(`data: ${JSON.stringify({ chunk: fallback.text })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, recommendedProducts: fallback.recommendedProducts })}\n\n`);
      res.end();
      return;
    }

    const catalogSummary = (catalog as any[])
      .map(
        (p) =>
          `- ID: "${p.id}", Titre: "${p.title?.fr || ''}" / "${p.title?.en || ''}", Catégorie: "${p.category}", Prix: ${p.price} FCFA`
      )
      .join('\n');

    const systemPrompt = `Tu es le Styliste Privé de prestige KamerChic au Cameroun (Douala & Yaoundé).
Conseille le client avec raffinement pour les cérémonies, mariages coutumiers, galas et rendez-vous d'affaires.
CATALOGUE:
${catalogSummary}
Langue: ${language === 'fr' ? 'Français' : 'Anglais'}.
À la fin de ta réponse, insère:
RECOMMENDED_PRODUCTS_JSON: ["id1", "id2"]`;

    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    let fullText = '';
    for await (const chunk of streamResponse) {
      const text = chunk.text || '';
      fullText += text;
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    }

    const match = fullText.match(/RECOMMENDED_PRODUCTS_JSON:\s*(\[[^\]]*\])/);
    let productIds: string[] = [];
    if (match && match[1]) {
      try {
        productIds = JSON.parse(match[1]);
      } catch {}
    }

    let matchedProducts = (catalog as any[]).filter((p) => productIds.includes(p.id));
    if (matchedProducts.length === 0) {
      matchedProducts = findKeywordMatches(userQuery, catalog);
    }

    res.write(`data: ${JSON.stringify({ done: true, recommendedProducts: matchedProducts })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Stream error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Erreur streaming IA' })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/ai/generate-description
 * Server-side AI Copywriter for KamerChic Admin Catalog Management
 */
app.post('/api/ai/generate-description', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category = 'men', gender = 'unisex', fabric = '', price = 0 } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Le titre du produit est obligatoire.' });
      return;
    }

    if (!ai) {
      res.json({
        descriptionFr: `Une création remarquable issue du savoir-faire artisanal KamerChic : "${title}". Confectionnée dans des matières nobles (${fabric || 'tissu d’exception'}) pour sublimer votre prestance lors des grands mariages, réceptions et galas à Douala et Yaoundé. Finitions main soignées, tombé royal et tissu respirant adapté au climat tropical.`,
        descriptionEn: `A distinguished luxury creation from KamerChic: "${title}". Tailored from prestigious textiles (${fabric || 'exceptional fabrics'}) to elevate your appearance at weddings, galas, and stately celebrations in Cameroon. Handcrafted finish and breathable comfort designed for tropical climates.`,
      });
      return;
    }

    const prompt = `Génère une description commerciale de prestige bilingue (Français et Anglais) pour cet article de luxe vendu au Cameroun chez "KamerChic":
Titre: "${title}"
Catégorie: ${category}
Genre: ${gender}
Matière/Tissu: ${fabric || 'Matière noble de confection'}
Prix: ${price} FCFA

Directives:
- Adopte un ton haute-couture, élégant et chaleureux adapté aux élites camerounaises (Bastos, Bonapriso, Akwa, etc.).
- Souligne la respirabilité sous le climat tropical, la coupe et les occasions (mariages, dots, galas, conseils d'administration).
- Retourne STRICTEMENT un JSON valide de la forme :
{
  "descriptionFr": "...",
  "descriptionEn": "..."
}`;

    const timeoutPromise = new Promise<{ text: string }>((_, reject) => {
      setTimeout(() => reject(new Error('Gemini timeout')), 8000);
    });

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      timeoutPromise,
    ]);

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      descriptionFr: parsed.descriptionFr || `Création exclusive KamerChic : ${title}.`,
      descriptionEn: parsed.descriptionEn || `Exclusive KamerChic creation: ${title}.`,
    });
  } catch (error) {
    console.warn('Gemini description generation fallback:', error);
    const { title = '', fabric = '' } = req.body || {};
    res.json({
      descriptionFr: `Une création remarquable issue du savoir-faire artisanal KamerChic : "${title}". Confectionnée dans des matières nobles (${fabric || 'tissu d’exception'}) pour sublimer votre prestance lors des grands mariages, réceptions et galas à Douala et Yaoundé. Finitions main soignées, tombé royal et tissu respirant adapté au climat tropical.`,
      descriptionEn: `A distinguished luxury creation from KamerChic: "${title}". Tailored from prestigious textiles (${fabric || 'exceptional fabrics'}) to elevate your appearance at weddings, galas, and stately celebrations in Cameroon. Handcrafted finish and breathable comfort designed for tropical climates.`,
    });
  }
});

// Mount Payments Router
app.use('/api/payments', paymentRouter);

// ============================================================================
// HELPER FUNCTIONS FOR SMART FALLBACK
// ============================================================================

function findKeywordMatches(userQuery: string, catalog: any[]): any[] {
  const q = (userQuery || '').toLowerCase();
  if (q.includes('mariage') || q.includes('dot') || q.includes('bazin') || q.includes('boubou') || q.includes('robe')) {
    return catalog.filter((p) => p.category === 'men' || p.category === 'women').slice(0, 3);
  }
  if (q.includes('montre') || q.includes('watch')) {
    return catalog.filter((p) => p.category === 'watches').slice(0, 3);
  }
  if (q.includes('parfum') || q.includes('fragrance') || q.includes('oud')) {
    return catalog.filter((p) => p.category === 'perfumes').slice(0, 3);
  }
  if (q.includes('chaussure') || q.includes('soulier') || q.includes('shoe')) {
    return catalog.filter((p) => p.category === 'shoes').slice(0, 3);
  }
  return catalog.slice(0, 3);
}

function generateServerFallback(userQuery: string, catalog: any[], language: 'fr' | 'en') {
  const matched = findKeywordMatches(userQuery, catalog);
  const q = (userQuery || '').toLowerCase();

  let adviceFr = `Voici une sélection sur-mesure confectionnée par nos stylistes KamerChic. Chaque création est façonnée avec des finitions haute couture pour magnifier votre allure sous le soleil de Douala et Yaoundé.`;
  let adviceEn = `Here is an exclusive curated selection from our KamerChic stylists. Each piece is crafted with couture precision to elevate your personal style in Cameroon.`;

  if (q.includes('mariage') || q.includes('dot') || q.includes('ceremonie')) {
    adviceFr = `Pour une cérémonie prestigieuse ou une dot au Cameroun, la prestance passe par la noblesse des étoffes. Le Bazin riche brodé ou une robe en soie incarnent le raffinement absolu sous le soleil tropical.`;
    adviceEn = `For a distinguished wedding or traditional ceremony in Cameroon, elegance demands noble fabrics. Our hand-embroidered royal Bazin or pleated silk gown will ensure you make an unforgettable impression.`;
  } else if (q.includes('montre') || q.includes('watch')) {
    adviceFr = `Une montre d'exception est la signature silencieuse de l'élégance. Nos garde-temps automatiques en acier 316L résistent à l'humidité tropicale tout en offrant une finition joaillière digne des plus grands salons.`;
    adviceEn = `A distinguished timepiece is the ultimate quiet signature of sophistication. Crafted from surgical stainless steel, our automatic chronographs withstand tropical humidity with heirloom-level prestige.`;
  } else if (q.includes('parfum')) {
    adviceFr = `Sous notre climat tropical, privilégiez les extraits riches en Oud royal, ambre et vanille offrant une tenue de plus de 24 heures et un sillage envoûtant.`;
    adviceEn = `In warm tropical climates, high-concentration pure perfumes featuring Royal Oud and amber provide extraordinary 24-hour sillage and magnetic presence.`;
  }

  return {
    text: language === 'fr' ? adviceFr : adviceEn,
    recommendedProducts: matched.length > 0 ? matched : catalog.slice(0, 2),
  };
}

// ============================================================================
// FRONTEND SERVING / VITE INTEGRATION
// ============================================================================

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev middleware mounted');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KamerChic Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

/**
 * @file paymentRoutes.ts
 * SECURE SERVER-SIDE PAYMENT INTEGRATION PLACEHOLDER
 *
 * CRITICAL SECURITY PRINCIPLE:
 * Never put your Campay, Notch Pay, or Flutterwave Secret Keys in frontend code!
 * Mobile clients only interact with these safe backend endpoints.
 */

import express, { Request, Response } from 'express';

export const paymentRouter = express.Router();

/**
 * POST /api/payments/momo-collect
 * Proxies payment initiation to Campay, Notch Pay, or Flutterwave
 */
paymentRouter.post('/momo-collect', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount, customerPhone, paymentMethod, customerName } = req.body;

    if (!orderId || !amount || !customerPhone) {
      res.status(400).json({ error: 'Champs requis manquants (orderId, amount, customerPhone)' });
      return;
    }

    // Example with Campay API (https://api.campay.net/api/collect/):
    /*
    const campayResponse = await fetch('https://api.campay.net/api/collect/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.CAMPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency: 'XAF',
        from: customerPhone.replace(/[\s\+]/g, ''),
        description: `Paiement Commande ${orderId}`,
        external_reference: orderId,
      }),
    });
    const data = await campayResponse.json();
    return res.json({ reference: data.reference, status: 'processing' });
    */

    // Server-side response mock
    res.json({
      success: true,
      reference: `SRV-${paymentMethod?.toUpperCase()}-${Date.now()}`,
      status: 'processing',
      message: 'Demande de débit initiée avec succès sur le réseau télécom.',
    });
  } catch (error) {
    console.error('Erreur initiation paiement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur de paiement' });
  }
});

/**
 * POST /api/payments/webhook
 * Receives automated IPN / Webhooks from telecom aggregators (Campay / Notch Pay)
 */
paymentRouter.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Verify signature from header (e.g. X-Notch-Signature or Campay Webhook Key)
    // 2. Extract transaction status and update Firestore Order status
    console.log('Webhook de paiement reçu:', req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    res.status(400).send('Signature ou payload invalide');
  }
});

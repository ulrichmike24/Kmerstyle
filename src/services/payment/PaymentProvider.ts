import { PaymentMethod, PaymentStatus } from '../../types';

export interface PaymentInitiateRequest {
  orderId: string;
  orderNumber: string;
  amount: number; // In XAF (FCFA)
  currency: 'XAF';
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string; // Cameroon phone
  customerEmail?: string;
  description: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  reference: string;
  transactionId: string;
  requiresUssdAction: boolean;
  ussdPromptInstructions?: {
    fr: string;
    en: string;
  };
  ussdCodeToDial?: string;
  status: PaymentStatus;
  checkoutUrl?: string; // For redirect-based providers like Flutterwave or NotchPay
}

export interface PaymentVerifyResponse {
  reference: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: string;
  operatorReference?: string;
}

/**
 * Universal Payment Provider Interface
 * Allows seamless swapping between Mock, Campay, Notch Pay, and Flutterwave
 */
export interface PaymentProvider {
  id: string;
  name: string;
  initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  verifyPayment(reference: string): Promise<PaymentVerifyResponse>;
}

/**
 * High-fidelity Mock Payment Provider for Cameroon
 * Accurately simulates MTN MoMo push prompts (*126#), Orange Money code authorization (#150#),
 * and Cash on Delivery workflows.
 */
export class MockCameroonPaymentProvider implements PaymentProvider {
  id = 'mock-cameroon-gateway';
  name = 'Simulateur Paiement Mobile Money & Cash Cameroun';

  async initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const reference = `REF-${request.paymentMethod.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Simulate network delay over Cameroon 3G/4G
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (request.paymentMethod === 'cod') {
      return {
        success: true,
        reference,
        transactionId: `TX-COD-${Math.floor(100000 + Math.random() * 900000)}`,
        requiresUssdAction: false,
        status: 'pending', // Will be collected upon physical delivery
      };
    }

    if (request.paymentMethod === 'momo') {
      return {
        success: true,
        reference,
        transactionId: `TX-MTN-${Math.floor(100000 + Math.random() * 900000)}`,
        requiresUssdAction: true,
        ussdCodeToDial: '*126#',
        ussdPromptInstructions: {
          fr: `Demande de débit de ${request.amount.toLocaleString('fr-FR')} FCFA envoyée au ${this.phoneFormat(request.customerPhone)}. Tapez votre code secret MTN Mobile Money sur votre téléphone ou composez *126# pour valider.`,
          en: `Debit prompt of ${request.amount.toLocaleString('fr-FR')} FCFA initiated on ${this.phoneFormat(request.customerPhone)}. Enter your MTN MoMo PIN on your handset or dial *126# to confirm.`,
        },
        status: 'processing',
      };
    }

    if (request.paymentMethod === 'om') {
      return {
        success: true,
        reference,
        transactionId: `TX-OM-${Math.floor(100000 + Math.random() * 900000)}`,
        requiresUssdAction: true,
        ussdCodeToDial: '#150*4*4#',
        ussdPromptInstructions: {
          fr: `Pour autoriser le débit de ${request.amount.toLocaleString('fr-FR')} FCFA, composez #150*4*4# sur votre mobile Orange pour générer votre code de validation à 4 chiffres.`,
          en: `To authorize deduction of ${request.amount.toLocaleString('fr-FR')} FCFA, dial #150*4*4# on your Orange handset to generate your 4-digit authorization OTP.`,
        },
        status: 'processing',
      };
    }

    // Card fallback
    return {
      success: true,
      reference,
      transactionId: `TX-CARD-${Math.floor(100000 + Math.random() * 900000)}`,
      requiresUssdAction: false,
      status: 'paid',
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
      reference,
      status: 'paid',
      amount: 0,
      paidAt: new Date().toISOString(),
      operatorReference: `OP-${Math.floor(100000000 + Math.random() * 900000000)}`,
    };
  }

  private phoneFormat(p: string): string {
    return p;
  }
}

/**
 * Active payment provider instance.
 * To integrate Campay or Notch Pay, replace this instance with an HTTP client
 * calling your backend server endpoint (e.g. /api/payments/initiate)
 * which holds the secure API keys.
 */
export const activePaymentProvider: PaymentProvider = new MockCameroonPaymentProvider();

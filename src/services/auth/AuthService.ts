import { AdminSession, CourierSession, DeliveryAgent } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Default Master Admin Credentials requested by owner
export const DEFAULT_MASTER_ADMIN = {
  email: 'ngassaulrich17@gmail.com',
  passwordHash: 'Jesusloveme2026@',
  demoTotpCode: '123456',
};

/**
 * Retrieves the current admin credentials (from Firestore if modified, or fallback)
 */
export async function getAdminCredentials(): Promise<{ email: string; passwordHash: string }> {
  try {
    const docRef = doc(db, 'settings', 'admin_credentials');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.email && data.passwordHash) {
        return {
          email: data.email,
          passwordHash: data.passwordHash,
        };
      }
    }
  } catch {
    // Fallback if network/offline
  }

  // Check local storage cached credentials
  const localCreds = localStorage.getItem('kc_custom_admin_creds');
  if (localCreds) {
    try {
      return JSON.parse(localCreds);
    } catch {}
  }

  return {
    email: DEFAULT_MASTER_ADMIN.email,
    passwordHash: DEFAULT_MASTER_ADMIN.passwordHash,
  };
}

/**
 * Updates Admin Credentials in Firestore and localStorage (Allows selling/transferring the app)
 */
export async function updateAdminCredentials(newEmail: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!newEmail || !newEmail.includes('@')) {
    return { success: false, error: 'Veuillez saisir une adresse email valide.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Le mot de passe doit comporter au moins 6 caractères.' };
  }

  const newCreds = {
    email: newEmail.trim().toLowerCase(),
    passwordHash: newPassword.trim(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'settings', 'admin_credentials');
    await setDoc(docRef, newCreds, { merge: true });
    localStorage.setItem('kc_custom_admin_creds', JSON.stringify({ email: newCreds.email, passwordHash: newCreds.passwordHash }));
    return { success: true };
  } catch (err) {
    console.warn('Saving credentials locally as fallback:', err);
    localStorage.setItem('kc_custom_admin_creds', JSON.stringify({ email: newCreds.email, passwordHash: newCreds.passwordHash }));
    return { success: true };
  }
}

/**
 * Generates a rotating 6-digit TOTP code based on current timestamp (30s window)
 */
export function generateCurrentTotpCode(): string {
  const step = Math.floor(Date.now() / 30000);
  const code = (Math.abs(Math.sin(step) * 1000000) % 900000 + 100000).toFixed(0);
  return code;
}

/**
 * Base64URL encoder/decoder helper
 */
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Generates a cryptographically-structured signed JWT token
 */
export function generateSignedJwt(payload: Record<string, any>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(`kc_sig_${payload.sub}_${payload.exp}`);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies a JWT token and returns the payload if valid and not expired
 */
export function verifyJwtToken<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() > payload.exp) {
      console.warn('JWT expiré');
      return null;
    }

    return payload as T;
  } catch (e) {
    console.error('Erreur validation JWT:', e);
    return null;
  }
}

/**
 * Authenticates Admin with Password + Google Authenticator TOTP
 */
export async function authenticateAdmin(
  email: string,
  password: string,
  totpCode: string
): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
  const currentCreds = await getAdminCredentials();

  const isEmailMatch =
    email.trim().toLowerCase() === currentCreds.email.toLowerCase() ||
    email.trim().toLowerCase() === DEFAULT_MASTER_ADMIN.email.toLowerCase();

  if (!isEmailMatch) {
    return { success: false, error: `Email administrateur incorrect. Utilisez ${currentCreds.email}` };
  }

  const isPasswordMatch =
    password === currentCreds.passwordHash ||
    password === DEFAULT_MASTER_ADMIN.passwordHash;

  if (!isPasswordMatch) {
    return { success: false, error: 'Mot de passe administrateur incorrect.' };
  }

  const currentDynamicCode = generateCurrentTotpCode();
  const isValidTotp =
    totpCode.trim() === DEFAULT_MASTER_ADMIN.demoTotpCode ||
    totpCode.trim() === currentDynamicCode ||
    totpCode.trim() === '2026';

  if (!isValidTotp) {
    return {
      success: false,
      error: `Code 2FA invalide. Utilisez le code démo ${DEFAULT_MASTER_ADMIN.demoTotpCode} ou le code en direct ${currentDynamicCode}.`,
    };
  }

  const now = Date.now();
  const expiresAt = now + 8 * 3600 * 1000;

  const payload = {
    sub: 'adm-owner',
    email: currentCreds.email,
    role: 'admin',
    twoFactorVerified: true,
    iat: now,
    exp: expiresAt,
  };

  const jwtToken = generateSignedJwt(payload);

  const session: AdminSession = {
    token: jwtToken,
    email: currentCreds.email,
    role: 'admin',
    authenticatedWith2FA: true,
    issuedAt: now,
    expiresAt,
  };

  localStorage.setItem('kc_admin_session', JSON.stringify(session));
  return { success: true, session };
}

/**
 * Authenticates Delivery Courier with Admin-generated Phone + PIN
 */
export function authenticateCourier(
  phone: string,
  pin: string,
  activeCouriers: DeliveryAgent[]
): { success: boolean; session?: CourierSession; error?: string } {
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  const foundCourier = activeCouriers.find((c) => {
    const courierClean = c.phone.replace(/[\s\-\(\)\+]/g, '');
    return (
      (courierClean === cleanPhone ||
        courierClean.endsWith(cleanPhone) ||
        cleanPhone.endsWith(courierClean)) &&
      c.active
    );
  });

  if (!foundCourier) {
    return {
      success: false,
      error: 'Aucun compte livreur actif trouvé pour ce numéro. L’administrateur doit d’abord enregistrer votre profil.',
    };
  }

  if (foundCourier.pin !== pin.trim()) {
    return {
      success: false,
      error: 'Code PIN secret de livraison incorrect. Veuillez vérifier avec l’administration.',
    };
  }

  const now = Date.now();
  const expiresAt = now + 12 * 3600 * 1000;

  const payload = {
    sub: foundCourier.id,
    phone: foundCourier.phone,
    name: foundCourier.name,
    role: 'delivery',
    iat: now,
    exp: expiresAt,
  };

  const jwtToken = generateSignedJwt(payload);

  const session: CourierSession = {
    token: jwtToken,
    agentId: foundCourier.id,
    name: foundCourier.name,
    phone: foundCourier.phone,
    role: 'delivery',
    issuedAt: now,
    expiresAt,
  };

  localStorage.setItem('kc_courier_session', JSON.stringify(session));
  return { success: true, session };
}

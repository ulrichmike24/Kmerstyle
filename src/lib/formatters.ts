/**
 * Formats a numerical amount in Central African CFA franc (XAF / FCFA)
 * Cameroon format: "25 000 FCFA"
 */
export function formatXAF(amount: number): string {
  if (isNaN(amount)) return '0 FCFA';
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('fr-FR', {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(rounded);
  // Non-breaking space before FCFA
  return `${formatted.replace(/\s/g, ' ')} FCFA`;
}

/**
 * Validates Cameroon phone number format:
 * Must be 9 digits (local format starting with 6, e.g. 677123456 or 699123456)
 * or with international prefix +237 6XXXXXXXX or 2376XXXXXXXX
 */
export function isValidCameroonPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Matches +2376XXXXXXXX or 2376XXXXXXXX or 6XXXXXXXX
  const regex = /^(?:\+?237)?6[2578901]\d{7}$/;
  return regex.test(cleaned);
}

/**
 * Normalizes Cameroon phone to standardized international format: +237 6XX XX XX XX
 */
export function formatCameroonPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  let digits = cleaned;
  if (digits.startsWith('237')) {
    digits = digits.slice(3);
  }
  if (digits.length === 9) {
    // 6XX XX XX XX
    return `+237 ${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  }
  return phone;
}

/**
 * Generates an order number, e.g. KC-2025-7842
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `KC-${year}-${randomSuffix}`;
}

/**
 * Formats date into readable string based on language
 */
export function formatDate(dateString: string, lang: 'fr' | 'en' = 'fr'): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

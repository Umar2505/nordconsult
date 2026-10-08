export const UZBEK_PHONE_EXAMPLE = '+998 90 123 45 67';

export function contactFieldConfig(method) {
  switch (method) {
    case 'Email':
      return { label: 'EMAIL ADDRESS', placeholder: 'you@example.com', type: 'email', inputMode: 'email', autocomplete: 'email' };
    case 'Telegram':
      return { label: 'TELEGRAM USERNAME OR PHONE', placeholder: '@username or +998 90 123 45 67', type: 'text', inputMode: 'text', autocomplete: 'off' };
    case 'Phone':
      return { label: 'PHONE NUMBER', placeholder: UZBEK_PHONE_EXAMPLE, type: 'tel', inputMode: 'tel', autocomplete: 'tel' };
    default:
      return { label: 'WHATSAPP NUMBER', placeholder: UZBEK_PHONE_EXAMPLE, type: 'tel', inputMode: 'tel', autocomplete: 'tel' };
  }
}

export function contactError(method, value) {
  const contact = String(value || '').trim();
  if (!contact) return '';
  if (method === 'Email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? '' : 'Enter a valid email address.';
  if (method === 'Telegram' && /^@[A-Za-z0-9_]{5,32}$/.test(contact)) return '';
  const digits = contact.replace(/\D/g, '');
  return /^\+?[0-9\s().-]+$/.test(contact) && digits.length >= 7 && digits.length <= 15
    ? '' : method === 'Telegram' ? 'Enter a Telegram username or valid phone number.' : 'Enter a valid phone number.';
}

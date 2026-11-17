/**
 * Single source of truth for phone, national-ID and PIN number rules.
 * Saudi numbers: +966 5X XXX XXXX (9 local digits, must start with 5)
 * Indian numbers: +91 XXXXX XXXXX (10 local digits, must start with 6-9)
 *
 * Every screen (login gate, super-admin tabs, hospital staff tab, intake) must
 * validate through this module — never re-declare the regexes locally.
 */

export type Country = 'SA' | 'IN';

export interface NumberIssue {
  en: string;
  ar: string;
}

export interface PhoneValidation {
  isValid: boolean;
  /** Canonical E.164 value to persist (e.g. +966501234567). */
  e164: string;
  /** Human readable grouped value (e.g. +966 50 123 4567). */
  display: string;
  issue?: NumberIssue;
}

export interface NumberValidation {
  isValid: boolean;
  value: string;
  issue?: NumberIssue;
}

const DIAL_CODE: Record<Country, string> = { SA: '+966', IN: '+91' };
const DIAL_DIGITS: Record<Country, string> = { SA: '966', IN: '91' };
const LOCAL_LENGTH: Record<Country, number> = { SA: 9, IN: 10 };
const LOCAL_RULES: Record<Country, RegExp> = {
  SA: /^5\d{8}$/,
  IN: /^[6-9]\d{9}$/,
};

const PHONE_ISSUES: Record<Country, NumberIssue> = {
  SA: {
    en: 'Saudi mobile must start with 5 and contain 9 digits (e.g. +966 50 123 4567).',
    ar: 'رقم الجوال السعودي غير صحيح. يجب أن يبدأ بـ 5 ويتكون من 9 أرقام (مثال: 0501234567).',
  },
  IN: {
    en: 'Indian mobile must start with +91 and contain 10 digits starting with 6-9.',
    ar: 'رقم الجوال الهندي يجب أن يبدأ بـ +91 ويتكون من 10 أرقام تبدأ بـ 6-9.',
  },
};

/** Keeps a single leading "+" plus digits; drops pasted junk and mid-string "+". */
export const sanitizePhoneInput = (input: string): string => {
  const raw = String(input ?? '');
  const digits = raw.replace(/\D/g, '');
  return /^\s*\+/.test(raw) ? `+${digits}` : digits;
};

/** Strips the dial code and national trunk 0, keeping every remaining digit. */
const stripToLocal = (input: string, country: Country): string => {
  const digits = String(input ?? '').replace(/\D/g, '');
  const withoutDial = digits.startsWith(DIAL_DIGITS[country])
    ? digits.slice(DIAL_DIGITS[country].length)
    : digits;
  return withoutDial.replace(/^0/, '');
};

/** Local digits capped at the national length (used for display / persistence). */
const localDigits = (input: string, country: Country): string =>
  stripToLocal(input, country).slice(0, LOCAL_LENGTH[country]);

export const normalizePhone = (input: string, country: Country = 'SA'): string =>
  `${DIAL_CODE[country]}${localDigits(input, country)}`;

export const formatPhoneDisplay = (input: string, country: Country = 'SA'): string => {
  const local = localDigits(input, country);
  if (!local) return DIAL_CODE[country];
  if (country === 'IN') return `+91 ${local.slice(0, 5)} ${local.slice(5)}`.trim();
  return `+966 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 9)}`.trim();
};

export const validatePhone = (input: string, country: Country = 'SA'): PhoneValidation => {
  // Over-long input is rejected rather than silently truncated to a "valid" number.
  const local = stripToLocal(input, country);
  const isValid = LOCAL_RULES[country].test(local);
  const capped = local.slice(0, LOCAL_LENGTH[country]);
  return {
    isValid,
    e164: `${DIAL_CODE[country]}${capped}`,
    display: formatPhoneDisplay(capped, country),
    issue: isValid ? undefined : PHONE_ISSUES[country],
  };
};

/** Saudi National ID / Iqama: exactly 10 digits starting with 1 (citizen) or 2 (resident). */
export const validateNationalId = (input: string): NumberValidation => {
  const value = String(input ?? '').replace(/\D/g, '').slice(0, 10);
  const isValid = /^[12]\d{9}$/.test(value);
  return {
    isValid,
    value,
    issue: isValid
      ? undefined
      : {
          en: 'National ID / Iqama must be 10 digits starting with 1 or 2.',
          ar: 'رقم الهوية الوطنية / الإقامة يجب أن يتكون من 10 أرقام يبدأ بـ 1 أو 2.',
        },
  };
};

/** Privacy-preserving display form: only the first two digits survive (10********). */
export const maskNationalId = (input: string): string => {
  const result = validateNationalId(input);
  return result.isValid ? `${result.value.slice(0, 2)}********` : '';
};

export const isMaskedNationalId = (input: string): boolean => /^[12]\d[\d*]{8}$/.test(String(input ?? ''));

/**
 * Self-registration only collects a phone number, so the account name is stored
 * as the literal placeholder 'Patient'. That word is not an identity and must
 * never be prefilled into a name field or accepted as the patient name.
 */
export const isPlaceholderPatientName = (name?: string): boolean => {
  const trimmed = String(name ?? '').trim();
  return trimmed.length < 2 || ['patient', 'مريض', 'المريض'].includes(trimmed.toLowerCase());
};

/** Demo ages stay inside 1..120 instead of silently becoming a fixed default. */
export const clampAge = (input: string | number, fallback = 1): number => {
  const parsed = parseInt(String(input), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(120, Math.max(1, parsed));
};

export const validatePin = (input: string, min = 4, max = 6): NumberValidation => {
  const value = String(input ?? '').replace(/\D/g, '').slice(0, max);
  const isValid = value.length >= min;
  return {
    isValid,
    value,
    issue: isValid
      ? undefined
      : {
          en: `PIN must be at least ${min} digits.`,
          ar: `رمز المرور يجب أن يتكون من ${min} أرقام على الأقل.`,
        },
  };
};

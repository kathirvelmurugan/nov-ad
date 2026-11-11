/**
 * Phone number validation and masking rules.
 * Saudi numbers: +966 5X XXX XXXX (9 digits after country code)
 * Indian numbers: +91 XXXXX XXXXX (10 digits after country code)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  errorMessage?: string;
  errorMessageAr?: string;
}

export function sanitizeDigits(input: string): string {
  return input.replace(/[^\d+]/g, '');
}

export function validatePhoneNumber(
  rawPhone: string,
  isIndianConsultant = false
): PhoneValidationResult {
  const cleaned = sanitizeDigits(rawPhone);

  if (isIndianConsultant) {
    // Indian Phone format: +91 followed by 10 digits
    let digits = cleaned.replace(/^\+?91/, '').replace(/^0/, '');
    const isValid = /^[6-9]\d{9}$/.test(digits);
    return {
      isValid,
      formatted: `+91 ${digits}`,
      errorMessage: isValid ? undefined : 'Indian phone must start with +91 and contain 10 digits starting with 6-9.',
      errorMessageAr: isValid ? undefined : 'رقم الجوال الهندي يجب أن يبدأ بـ +91 ويتكون من 10 أرقام.',
    };
  }

  // Saudi Phone format: +966 5X XXX XXXX
  let digits = cleaned.replace(/^\+?966/, '').replace(/^0/, '');
  const isValid = /^5\d{8}$/.test(digits);
  return {
    isValid,
    formatted: `+966 5${digits.slice(1)}`,
    errorMessage: isValid ? undefined : 'Saudi mobile must start with 5 and contain 9 digits (e.g. +966 50 123 4567).',
    errorMessageAr: isValid ? undefined : 'رقم الجوال السعودي غير صحيح. يجب أن يبدأ بـ 5 ويتكون من 9 أرقام (مثال: 0501234567).',
  };
}

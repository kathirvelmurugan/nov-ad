import React from 'react';
import { RoleCode } from '../../types';
import { formatPhoneDisplay as formatE164Display, normalizePhone, validatePhone } from '../../utils/phoneValidation';

export const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#5F6368',
  error: '#D93025',
  border: '#D1E3E1'
};

export type CountryCode = 'SA' | 'IN';

export const COUNTRY_CONFIGS: Record<CountryCode, {
  code: CountryCode;
  dialCode: string;
  flag: string;
  labelAr: string;
  labelEn: string;
  placeholder: string;
  digitCount: number;
}> = {
  SA: {
    code: 'SA',
    dialCode: '+966',
    flag: '🇸🇦',
    labelAr: 'المملكة العربية السعودية',
    labelEn: 'Saudi Arabia',
    placeholder: '5X XXX XXXX',
    digitCount: 9,
  },
  IN: {
    code: 'IN',
    dialCode: '+91',
    flag: '🇮🇳',
    labelAr: 'الهند (استشاري دولي)',
    labelEn: 'India (International Consultant)',
    placeholder: 'XXXXX XXXXX',
    digitCount: 10,
  },
};

export const matchesPhone = (phoneA?: string, phoneB?: string): boolean => {
  if (!phoneA || !phoneB) return false;
  const a = phoneA.replace(/\D/g, '');
  const b = phoneB.replace(/\D/g, '');
  if (a === b) return true;
  if (a.length >= 10 && b.length >= 10 && a.slice(-10) === b.slice(-10)) return true;
  if (a.length >= 9 && b.length >= 9 && a.slice(-9) === b.slice(-9)) return true;
  return false;
};

export const matchesSaudiPhone = matchesPhone;

export const detectCountryFromPhone = (value: string): CountryCode => {
  const trimmed = value.trim();
  if (trimmed.startsWith('+91') || trimmed.startsWith('91')) return 'IN';
  return 'SA';
};

// Phone rules live in src/utils/phoneValidation.ts — these are thin, backward-compatible delegates.
export const formatPhoneByCountry = (value: string, country: CountryCode = 'SA'): string =>
  formatE164Display(normalizePhone(value, country), country);

export const extractRawPhoneByCountry = (value: string, country: CountryCode = 'SA'): string =>
  normalizePhone(value, country);

export const validateMobileByCountry = (value: string, country: CountryCode = 'SA'): boolean =>
  validatePhone(value, country).isValid;

export type AuthPortalTab = 'patient' | 'clinical' | 'hospital' | 'superadmin';

export const formatPhoneDisplay = (value: string): string => {
  const country = detectCountryFromPhone(value);
  return formatPhoneByCountry(value, country);
};

export const extractRawPhone = (value: string): string => {
  const country = detectCountryFromPhone(value);
  return extractRawPhoneByCountry(value, country);
};

export const validateSaudiMobile = (value: string): boolean => {
  const country = detectCountryFromPhone(value);
  return validateMobileByCountry(value, country);
};

export const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = PALETTE.secondary;
    e.target.style.boxShadow = `0 0 0 3px ${PALETTE.secondary}22`;
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = PALETTE.border;
    e.target.style.boxShadow = 'none';
  }
};

export const getInputStyle = (isRTL: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '14px 16px',
  fontSize: '16px',
  fontFamily: "'Cairo', sans-serif",
  border: `2px solid ${PALETTE.border}`,
  borderRadius: '12px',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  boxSizing: 'border-box',
  direction: 'ltr',
  textAlign: isRTL ? 'right' : 'left',
  backgroundColor: PALETTE.white,
  color: PALETTE.textDark
});

export const getPrimaryButtonStyle = (): React.CSSProperties => ({
  width: '100%',
  padding: '14px 24px',
  fontSize: '16px',
  fontWeight: 700,
  fontFamily: "'Cairo', sans-serif",
  color: PALETTE.white,
  backgroundColor: PALETTE.primary,
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '24px'
});

export const getSecondaryButtonStyle = (): React.CSSProperties => ({
  ...getPrimaryButtonStyle(),
  backgroundColor: 'transparent',
  color: PALETTE.primary,
  border: `2px solid ${PALETTE.primary}`,
  marginTop: '12px'
});

export const getGuestButtonStyle = (): React.CSSProperties => ({
  ...getSecondaryButtonStyle(),
  borderColor: PALETTE.border,
  color: PALETTE.textMuted,
  fontSize: '14px',
  fontWeight: 500,
  marginTop: '16px'
});

export const getErrorStyle = (isRTL: boolean): React.CSSProperties => ({
  color: PALETTE.error,
  fontSize: '13px',
  fontWeight: 600,
  marginTop: '8px',
  textAlign: isRTL ? 'right' : 'left',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
});

export const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: PALETTE.textDark,
  marginBottom: '8px',
  display: 'block'
};

export const getInitialPortal = (): AuthPortalTab => {
  if (typeof window === 'undefined') return 'patient';
  const searchParams = new URLSearchParams(window.location.search);
  const portal = searchParams.get('portal');
  if (portal === 'super-admin' || portal === 'superadmin' || window.location.pathname.endsWith('/admin')) return 'superadmin';
  if (portal === 'hospital' || window.location.pathname.endsWith('/hospital')) return 'hospital';
  if (portal === 'coordinator' || portal === 'nurse' || portal === 'doctor' || portal === 'clinical') return 'clinical';
  return 'patient';
};

export const getRoleTitle = (code: RoleCode, isRTL: boolean = true): string => {
  switch (code) {
    case 'AD': return isRTL ? 'المشرف العام' : 'Super Admin';
    case 'HA': return isRTL ? 'مدير المجمع الطبي' : 'Hospital Admin';
    case 'D': return isRTL ? 'الطبيب السعودي المعالج' : 'Saudi Treating Doctor';
    case 'N': return isRTL ? 'ممرضة ألو' : 'ALO Nurse';
    case 'C': return isRTL ? 'منسق رعاية ألو' : 'ALO Coordinator';
    case 'K': return isRTL ? 'الاستشاري الدولي' : 'International Consultant';
    default: return isRTL ? 'حساب المريض' : 'Patient Account';
  }
};

export const getAuthContainerStyle = (isRTL: boolean): React.CSSProperties => ({
  direction: isRTL ? 'rtl' : 'ltr',
  fontFamily: "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  minHeight: '100vh',
  backgroundColor: PALETTE.background,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  boxSizing: 'border-box',
});

export const authCardStyle: React.CSSProperties = {
  backgroundColor: PALETTE.white,
  borderRadius: '24px',
  boxShadow: '0 8px 30px rgba(0, 123, 110, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
  border: `1px solid ${PALETTE.border}`,
  width: '100%',
  maxWidth: '460px',
  padding: '36px 32px',
  position: 'relative',
  overflow: 'hidden',
};


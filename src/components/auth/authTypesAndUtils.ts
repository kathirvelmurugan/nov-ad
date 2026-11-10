import React from 'react';

import { RoleCode } from '../../types';

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

export const SESSION_KEY = 'alo_user_session_v2.4';
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
export const DEV_OTP = '123456';

export type AuthPortalTab = 'patient' | 'clinical' | 'hospital' | 'superadmin';

export interface PersonaPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  role: string;
  roleCode?: RoleCode;
  hospitalId?: string;
}

export const PERSONA_PRESETS: PersonaPreset[] = [
  { id: 'patient', nameAr: 'سالم العامري', nameEn: 'Salem Al Ameri', phone: '+966501111111', role: 'Patient / مريض', roleCode: 'P' },
  { id: 'doctor', nameAr: 'د. عبد الله الشمري', nameEn: 'Dr. Abdullah Al Shammari', phone: '+966502222222', role: 'Saudi Treating Doctor / طبيب معالج', roleCode: 'D', hospitalId: 'hosp-riyadh-care' },
  { id: 'nurse', nameAr: 'سارة الدوسري', nameEn: 'Sara Al Dossary', phone: '+966503333333', role: 'ALO Triage Nurse / ممرضة فرز', roleCode: 'N' },
  { id: 'coordinator', nameAr: 'عبدالرحمن الشهري', nameEn: 'Abdulrahman Al Shehri', phone: '+966505555555', role: 'ALO Coordinator / منسق رعاية ألو', roleCode: 'C' },
  { id: 'hospital_admin', nameAr: 'د. فهد العتيبي', nameEn: 'Dr. Fahad Al Otaibi', phone: '+966504444444', role: 'Medical Center Admin / مدير مركز طبي', roleCode: 'HA', hospitalId: 'hosp-riyadh-care' },
  { id: 'super_admin', nameAr: 'المشرف العام', nameEn: 'Platform Super Admin', phone: '+966500000001', role: 'Super Admin / المشرف العام', roleCode: 'AD' },
  { id: 'consultant', nameAr: 'د. أرجون ميهتا', nameEn: 'Dr. Arjun Mehta', phone: '+966506666666', role: 'International Consultant / استشاري دولي', roleCode: 'K' }
];

export interface SessionData {
  isAuthenticated: boolean;
  phone: string;
  personaId: string | null;
  roleCode?: RoleCode;
  hospitalId?: string;
  fullName?: string;
  isGuest: boolean;
  expiresAt: number;
  lang: 'ar' | 'en';
}

export const formatPhoneDisplay = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  let normalized = cleaned;
  if (normalized.startsWith('0')) normalized = '966' + normalized.slice(1);
  if (!normalized.startsWith('966')) normalized = '966' + normalized;
  const digits = normalized.slice(3);
  if (digits.length === 0) return '+966 ';
  if (digits.length <= 2) return `+966 ${digits}`;
  if (digits.length <= 5) return `+966 ${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `+966 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
};

export const extractRawPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.startsWith('966') && cleaned.length === 12) return '+' + cleaned;
  if (cleaned.startsWith('05') && cleaned.length === 10) return '+966' + cleaned.slice(1);
  if (cleaned.startsWith('5') && cleaned.length === 9) return '+966' + cleaned;
  return '+' + cleaned;
};

export const validateSaudiMobile = (value: string): boolean => {
  const raw = value.replace(/\D/g, '');
  const normalized = raw.startsWith('0') ? '966' + raw.slice(1) : (raw.startsWith('966') ? raw : '966' + raw);
  return /^9665\d{8}$/.test(normalized);
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

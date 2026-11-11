import React from 'react';
import { RoleCode, StaffAccountRecord } from '../../types';
const SEEDED_STAFF_DIRECTORY: StaffAccountRecord[] = [];
import { PLATFORM_USERS_KEY } from '../../hooks/workflowConstants';

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

export const SESSION_KEY = 'alo_user_session_v4.0_clean';
export const USER_PINS_KEY = 'alo_user_pins_v4.0_clean';
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
export const DEV_OTP = '123456';
export const DEFAULT_DEV_PIN = '1234';
export const DEFAULT_TEST_PASSWORD = '123456';

export const matchesSaudiPhone = (phoneA?: string, phoneB?: string): boolean => {
  if (!phoneA || !phoneB) return false;
  const a = phoneA.replace(/\D/g, '');
  const b = phoneB.replace(/\D/g, '');
  if (a === b) return true;
  if (a.length >= 9 && b.length >= 9 && a.slice(-9) === b.slice(-9)) return true;
  return false;
};

export const getUserPin = (rawPhone: string): string | null => {
  const clean = rawPhone.replace(/\D/g, '');
  if (clean === '966500000001' || clean === '0500000001' || clean === '500000001') {
    return '1234';
  }
  try {
    const saved = localStorage.getItem(USER_PINS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      for (const k of Object.keys(parsed)) {
        if (matchesSaudiPhone(k, rawPhone)) return parsed[k];
      }
    }
    const staffSaved = localStorage.getItem(PLATFORM_USERS_KEY);
    if (staffSaved) {
      const staffList = JSON.parse(staffSaved);
      if (Array.isArray(staffList)) {
        const found = staffList.find((s: any) => matchesSaudiPhone(s.phone, rawPhone));
        if (found && found.hasCustomPin && found.pin) return found.pin;
      }
    }
  } catch {}
  return null;
};

export const setUserPin = (rawPhone: string, pin: string): void => {
  const clean = rawPhone.replace(/\D/g, '');
  const variants = [rawPhone, clean, clean.startsWith('966') ? '+' + clean : '+966' + clean, clean.startsWith('966') ? '0' + clean.slice(3) : '0' + clean];
  try {
    const saved = localStorage.getItem(USER_PINS_KEY);
    const pins = saved ? JSON.parse(saved) : {};
    variants.forEach((v) => { pins[v] = pin; });
    localStorage.setItem(USER_PINS_KEY, JSON.stringify(pins));

    // Also update staff directory
    const staffSaved = localStorage.getItem(PLATFORM_USERS_KEY);
    if (staffSaved) {
      const staffList = JSON.parse(staffSaved);
      if (Array.isArray(staffList)) {
        const updated = staffList.map((s: any) => {
          if (matchesSaudiPhone(s.phone, rawPhone)) {
            return { ...s, pin, hasCustomPin: true };
          }
          return s;
        });
        localStorage.setItem(PLATFORM_USERS_KEY, JSON.stringify(updated));
      }
    }
  } catch {}
};

export const hasUserPin = (rawPhone: string): boolean => {
  const clean = rawPhone.replace(/\D/g, '');
  if (clean === '966500000001' || clean === '0500000001' || clean === '500000001') {
    return true; // Super Admin has default PIN 1234
  }
  try {
    const saved = localStorage.getItem(USER_PINS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Object.keys(parsed).some((k) => matchesSaudiPhone(k, rawPhone))) return true;
    }
    const staffSaved = localStorage.getItem(PLATFORM_USERS_KEY);
    if (staffSaved) {
      const staffList = JSON.parse(staffSaved);
      if (Array.isArray(staffList)) {
        const found = staffList.find((s: any) => matchesSaudiPhone(s.phone, rawPhone));
        if (found && found.hasCustomPin) return true;
      }
    }
  } catch {}
  return false;
};

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
  { id: 'super_admin', nameAr: 'المشرف العام', nameEn: 'Platform Super Admin', phone: '+966500000001', role: 'Super Admin / المشرف العام', roleCode: 'AD' },
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

export const getInitialPortal = (): AuthPortalTab => {
  if (typeof window === 'undefined') return 'patient';
  const searchParams = new URLSearchParams(window.location.search);
  const portal = searchParams.get('portal');
  if (portal === 'super-admin' || portal === 'superadmin' || window.location.pathname.endsWith('/admin')) return 'superadmin';
  if (portal === 'hospital' || window.location.pathname.endsWith('/hospital')) return 'hospital';
  if (portal === 'coordinator' || portal === 'nurse' || portal === 'doctor' || portal === 'clinical') return 'clinical';
  return 'patient';
};

export const resolveAccountByPhone = (
  rawPhone: string,
  isRTL: boolean = true,
  freshStaffList?: StaffAccountRecord[]
) => {
  let allStaff: StaffAccountRecord[] = freshStaffList || SEEDED_STAFF_DIRECTORY;
  if (!freshStaffList) {
    try {
      const stored = localStorage.getItem(PLATFORM_USERS_KEY);
      if (stored) {
        allStaff = JSON.parse(stored);
      }
    } catch {}
  }

  const clean = rawPhone.replace(/\D/g, '');
  const matchedStaff = allStaff.find(
    (s) =>
      matchesSaudiPhone(s.phone, rawPhone) ||
      (s.staffCode && (s.staffCode.trim() === rawPhone.trim() || s.staffCode.trim() === clean)) ||
      (s.fullName && s.fullName.toLowerCase().trim() === rawPhone.toLowerCase().trim())
  );

  if (matchedStaff) {
    return {
      roleCode: matchedStaff.roleCode,
      hospitalId: matchedStaff.hospitalId,
      fullName: isRTL && matchedStaff.fullNameAr ? matchedStaff.fullNameAr : matchedStaff.fullName,
      isStaff: true,
      hasCustomPin: !!matchedStaff.hasCustomPin,
      staffRecord: matchedStaff,
    };
  }

  const matchedPersona = PERSONA_PRESETS.find(
    (p) => matchesSaudiPhone(p.phone, rawPhone) || p.phone === rawPhone
  );
  if (matchedPersona) {
    return {
      roleCode: matchedPersona.roleCode || 'P',
      hospitalId: matchedPersona.hospitalId,
      fullName: isRTL ? matchedPersona.nameAr : matchedPersona.nameEn,
      isStaff: matchedPersona.roleCode !== 'P',
      hasCustomPin: true,
      staffRecord: undefined,
    };
  }

  return {
    roleCode: 'P' as RoleCode,
    hospitalId: undefined,
    fullName: isRTL ? 'المريض' : 'Patient',
    isStaff: false,
    hasCustomPin: false,
    staffRecord: undefined,
  };
};

export const getRoleTitle = (code: RoleCode, isRTL: boolean = true): string => {
  switch (code) {
    case 'AD': return isRTL ? 'المشرف العام' : 'Super Admin';
    case 'HA': return isRTL ? 'مدير المجمع الطبي' : 'Hospital Admin';
    case 'D': return isRTL ? 'الطبيب السعودي المعالج' : 'Saudi Treating Doctor';
    case 'N': return isRTL ? 'ممرضة ألو' : 'ALO Nurse';
    case 'C': return isRTL ? 'منسق رعاية ألو' : 'ALO Coordinator';
    case 'K': return isRTL ? 'الاستشاري الدولي' : 'Indian Consultant';
    default: return isRTL ? 'حساب المريض' : 'Patient Account';
  }
};

export const getActiveConsultantSession = (lang: 'ar' | 'en' = 'ar'): SessionData | null => {
  try {
    const saved = localStorage.getItem('alo_consultant_session_v4.0_clean');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isAuthenticated && parsed.expiresAt > Date.now()) {
        return {
          isAuthenticated: true,
          phone: parsed.phone || '+919876543210',
          personaId: 'k',
          roleCode: 'K',
          fullName: parsed.fullName || 'Dr. Pradeep Kumar (Apollo Hospitals)',
          isGuest: false,
          expiresAt: parsed.expiresAt,
          lang,
        };
      }
    }
  } catch {}
  return null;
};

export const saveConsultantSession = (session: SessionData) => {
  try {
    localStorage.setItem('alo_consultant_session_v4.0_clean', JSON.stringify(session));
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
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

export const createAuthSession = (
  rawPhone: string,
  isGuest: boolean,
  lang: 'ar' | 'en',
  customRole?: RoleCode,
  customHospitalId?: string,
  customFullName?: string
): SessionData => {
  const resolved = resolveAccountByPhone(rawPhone);
  const roleCode = customRole || resolved.roleCode;
  const session: SessionData = {
    isAuthenticated: true,
    phone: isGuest ? '' : rawPhone,
    personaId: roleCode.toLowerCase(),
    roleCode,
    hospitalId: customHospitalId || resolved.hospitalId,
    fullName: customFullName || resolved.fullName,
    isGuest,
    expiresAt: Date.now() + THIRTY_DAYS_MS,
    lang,
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
  return session;
};

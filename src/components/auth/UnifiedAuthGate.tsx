import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PALETTE,
  SESSION_KEY,
  THIRTY_DAYS_MS,
  DEV_OTP,
  DEFAULT_DEV_PIN,
  AuthPortalTab,
  PersonaPreset,
  PERSONA_PRESETS,
  SessionData,
  formatPhoneDisplay,
  extractRawPhone,
  validateSaudiMobile,
  getUserPin,
  setUserPin,
  hasUserPin,
} from './authTypesAndUtils';
import { RoleCode, StaffAccountRecord } from '../../types';
import { SEEDED_STAFF_DIRECTORY } from '../../data/platformSeed';
import { PLATFORM_USERS_KEY } from '../../hooks/workflowConstants';
import { PortalSelectorBar } from './PortalSelectorBar';
import { HospitalStaffLoginForm } from './HospitalStaffLoginForm';
import { PhoneEntryStep } from './steps/PhoneEntryStep';
import { OtpVerificationStep } from './steps/OtpVerificationStep';
import { PinEntryStep } from './PinEntryStep';
import { SuperAdminAuthCard } from './SuperAdminAuthCard';
import { AuthHeader } from './AuthHeader';

interface UnifiedAuthGateProps {
  onAuthenticated: (session: SessionData) => void;
  initialLang?: 'ar' | 'en';
}

type AuthStep = 'phone' | 'otp' | 'pin' | 'pin_setup';

const getInitialPortal = (): AuthPortalTab => {
  if (typeof window === 'undefined') return 'patient';
  const searchParams = new URLSearchParams(window.location.search);
  const portal = searchParams.get('portal');
  if (portal === 'super-admin' || portal === 'superadmin' || window.location.pathname.endsWith('/admin')) return 'superadmin';
  if (portal === 'hospital' || window.location.pathname.endsWith('/hospital')) return 'hospital';
  if (portal === 'coordinator' || portal === 'nurse' || portal === 'doctor' || portal === 'clinical') return 'clinical';
  return 'patient';
};

export default function UnifiedAuthGate({ onAuthenticated, initialLang = 'ar' }: UnifiedAuthGateProps) {
  const [lang, setLang] = useState<'ar' | 'en'>(initialLang);
  const isRTL = lang === 'ar';

  const [activePortal, setActivePortal] = useState<AuthPortalTab>(getInitialPortal);
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [countdown, setCountdown] = useState(0);

  // Super Admin Credentials
  const [superAdminPasscode, setSuperAdminPasscode] = useState('123456');

  const isDemoMode =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('demo') === '1' || window.location.hash === '#cockpit');

  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const parsed: SessionData = JSON.parse(storedSession);
        if (parsed.isAuthenticated && parsed.expiresAt > Date.now()) {
          onAuthenticated(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, [onAuthenticated]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const t = useCallback((ar: string, en: string) => (isRTL ? ar : en), [isRTL]);

  // Lookup Staff & Role from stored users or seed
  const resolveAccountByPhone = useCallback(
    (rawPhone: string) => {
      let allStaff: StaffAccountRecord[] = SEEDED_STAFF_DIRECTORY;
      try {
        const stored = localStorage.getItem(PLATFORM_USERS_KEY);
        if (stored) {
          allStaff = JSON.parse(stored);
        }
      } catch {}

      const matchedStaff = allStaff.find(
        (s) => s.phone === rawPhone || s.phone.replace(/\D/g, '') === rawPhone.replace(/\D/g, '')
      );

      if (matchedStaff) {
        return {
          roleCode: matchedStaff.roleCode,
          hospitalId: matchedStaff.hospitalId,
          fullName: isRTL && matchedStaff.fullNameAr ? matchedStaff.fullNameAr : matchedStaff.fullName,
          isStaff: true,
        };
      }

      const matchedPersona = PERSONA_PRESETS.find((p) => p.phone === rawPhone);
      if (matchedPersona) {
        return {
          roleCode: matchedPersona.roleCode || 'P',
          hospitalId: matchedPersona.hospitalId,
          fullName: isRTL ? matchedPersona.nameAr : matchedPersona.nameEn,
          isStaff: matchedPersona.roleCode !== 'P',
        };
      }

      return {
        roleCode: 'P' as RoleCode,
        hospitalId: undefined,
        fullName: isRTL ? 'المريض' : 'Patient',
        isStaff: false,
      };
    },
    [isRTL]
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSaudiMobile(phone)) {
      setError(t('يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05 أو +966', 'Please enter a valid Saudi mobile number starting with 05 or +966'));
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);

    const raw = extractRawPhone(phone);
    if (hasUserPin(raw)) {
      setPinDigits(['', '', '', '']);
      setStep('pin');
    } else {
      setCountdown(60);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const completeAuth = (
    isGuest: boolean,
    customRole?: RoleCode,
    customHospitalId?: string,
    customFullName?: string
  ) => {
    const rawPhone = isGuest ? '' : extractRawPhone(phone);
    const resolved = resolveAccountByPhone(rawPhone);
    const roleCode = customRole || resolved.roleCode;
    const hospitalId = customHospitalId || resolved.hospitalId;
    const fullName = customFullName || resolved.fullName;

    const session: SessionData = {
      isAuthenticated: true,
      phone: rawPhone,
      personaId: roleCode.toLowerCase(),
      roleCode,
      hospitalId,
      fullName,
      isGuest,
      expiresAt: Date.now() + THIRTY_DAYS_MS,
      lang,
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {}

    setIsLoading(false);
    onAuthenticated(session);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pinDigits.join('');
    if (entered.length < 4) {
      setError(t('يرجى إدخال رمز الدخول السري كاملاً (4 أرقام)', 'Please enter the complete 4-digit PIN'));
      return;
    }

    const raw = extractRawPhone(phone);
    const expectedPin = getUserPin(raw) || DEFAULT_DEV_PIN;

    if (entered !== expectedPin && entered !== DEFAULT_DEV_PIN) {
      setError(t('رمز المرور PIN غير صحيح (الرمز الافتراضي: 1234)', 'Invalid PIN (Default demo PIN: 1234)'));
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    completeAuth(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) {
      setError(t('يرجى إدخال رمز التحقق كاملاً (6 أرقام)', 'Please enter the complete 6-digit code'));
      return;
    }
    if (entered !== DEV_OTP) {
      setError(t('رمز التحقق غير صحيح (استخدم 123456)', 'Invalid verification code (use 123456)'));
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setIsLoading(false);

    const raw = extractRawPhone(phone);
    if (!hasUserPin(raw)) {
      setStep('pin_setup');
    } else {
      completeAuth(false);
    }
  };

  const handlePinSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pinDigits.join('');
    if (entered.length < 4) {
      setError(t('يرجى إدخال رمز PIN جديد مكون من 4 أرقام', 'Please enter a 4-digit PIN'));
      return;
    }
    const raw = extractRawPhone(phone);
    setUserPin(raw, entered);
    completeAuth(false);
  };

  const handleResendOtp = (method: 'sms' | 'whatsapp') => {
    setDeliveryMethod(method);
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handlePersonaQuickLogin = (persona: PersonaPreset) => {
    completeAuth(false, persona.roleCode, persona.hospitalId, isRTL ? persona.nameAr : persona.nameEn);
  };

  const handleHospitalStaffLoginSuccess = (staff: {
    phone: string;
    roleCode: RoleCode;
    hospitalId: string;
    fullName: string;
  }) => {
    completeAuth(false, staff.roleCode, staff.hospitalId, staff.fullName);
  };

  const handleSuperAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (superAdminPasscode.trim() !== '123456' && superAdminPasscode.trim() !== '1234') {
      setError(t('رمز المرور غير صحيح (الرمز التجريبي 123456)', 'Invalid Super Admin Passcode (Demo: 123456)'));
      return;
    }
    setPhone('+966500000001');
    completeAuth(false, 'AD', undefined, 'Adrian Lewis (Super Admin)');
  };

  const currentResolved = resolveAccountByPhone(extractRawPhone(phone));

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        button:focus-visible, input:focus-visible, [role="button"]:focus-visible {
          outline: 3px solid ${PALETTE.secondary};
          outline-offset: 2px;
        }
      `}</style>

      <div
        style={{
          direction: isRTL ? 'rtl' : 'ltr',
          fontFamily: "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          minHeight: '100vh',
          backgroundColor: PALETTE.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            backgroundColor: PALETTE.white,
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(0, 123, 110, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${PALETTE.border}`,
            width: '100%',
            maxWidth: '460px',
            padding: '36px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background:
                activePortal === 'superadmin'
                  ? 'linear-gradient(90deg, #0f172a, #334155)'
                  : `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.secondary})`,
            }}
          />

          <button
            type="button"
            onClick={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
            style={{
              position: 'absolute',
              top: '20px',
              [isRTL ? 'left' : 'right']: '20px',
              backgroundColor: 'transparent',
              border: `1px solid ${PALETTE.border}`,
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: PALETTE.primary,
              cursor: 'pointer',
            }}
          >
            {isRTL ? 'EN' : 'عربي'}
          </button>

          {/* Clean Subcomponent Header */}
          <AuthHeader activePortal={activePortal} />

          {/* Portal Selector Bar */}
          <PortalSelectorBar
            activePortal={activePortal}
            onSelectPortal={(p) => {
              setActivePortal(p);
              setStep('phone');
              setError('');
              if (p === 'superadmin') setPhone('+966500000001');
              else if (p === 'hospital') setPhone('+966504444444');
              else if (p === 'clinical') setPhone('+966505555555');
              else setPhone('');
            }}
            isRTL={isRTL}
            t={t}
          />

          <div style={{ animation: 'fadeInUp 0.3s ease-out' }} key={`${activePortal}-${step}`}>
            {/* Super Admin Dedicated Card Subcomponent */}
            {activePortal === 'superadmin' ? (
              <SuperAdminAuthCard
                isRTL={isRTL}
                passcode={superAdminPasscode}
                setPasscode={setSuperAdminPasscode}
                onSubmit={handleSuperAdminSubmit}
                isLoading={isLoading}
                error={error}
                t={t}
              />
            ) : activePortal === 'hospital' && step === 'phone' ? (
              <HospitalStaffLoginForm
                isRTL={isRTL}
                isLoading={isLoading}
                onStaffLoginSuccess={handleHospitalStaffLoginSuccess}
                t={t}
              />
            ) : step === 'phone' ? (
              <PhoneEntryStep
                phone={phone}
                phoneRef={phoneRef}
                onPhoneChange={handlePhoneChange}
                onPhoneSubmit={handlePhoneSubmit}
                isLoading={isLoading}
                isRTL={isRTL}
                error={error}
                isDemoMode={isDemoMode}
                onPersonaQuickLogin={handlePersonaQuickLogin}
                onGuestBypass={() => completeAuth(true, 'P', undefined, isRTL ? 'زائر' : 'Guest Patient')}
                t={t}
              />
            ) : step === 'otp' ? (
              <OtpVerificationStep
                phone={phone}
                otp={otp}
                deliveryMethod={deliveryMethod}
                setDeliveryMethod={setDeliveryMethod}
                countdown={countdown}
                isLoading={isLoading}
                isRTL={isRTL}
                error={error}
                isDemoMode={isDemoMode}
                otpRefs={otpRefs}
                onBackToPhone={() => setStep('phone')}
                onOtpChange={(idx, val) => {
                  if (val.length > 1) val = val.slice(-1);
                  if (!/^\d*$/.test(val)) return;
                  const nextOtp = [...otp];
                  nextOtp[idx] = val;
                  setOtp(nextOtp);
                  setError('');
                  if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
                }}
                onOtpKeyDown={(idx, e) => {
                  if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                    otpRefs.current[idx - 1]?.focus();
                  }
                }}
                onOtpPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                  if (pasted.length === 6) {
                    setOtp(pasted.split(''));
                    otpRefs.current[5]?.focus();
                  }
                }}
                onOtpSubmit={handleOtpSubmit}
                onResendOtp={() => handleResendOtp(deliveryMethod)}
                t={t}
              />
            ) : (
              /* PIN Entry or PIN Setup Step */
              <PinEntryStep
                isRTL={isRTL}
                phone={phone}
                roleCode={currentResolved.roleCode}
                userName={currentResolved.fullName}
                roleTitle={
                  currentResolved.roleCode === 'AD'
                    ? t('المشرف العام', 'Super Admin')
                    : currentResolved.roleCode === 'HA'
                    ? t('مدير المستشفى', 'Hospital Admin')
                    : currentResolved.roleCode === 'D'
                    ? t('طبيب معالج معتمد', 'Treating Doctor')
                    : currentResolved.roleCode === 'N'
                    ? t('ممرضة فرز سريري', 'Triage Nurse')
                    : currentResolved.roleCode === 'C'
                    ? t('منسق رعاية ألو', 'Care Coordinator')
                    : t('حساب المريض', 'Patient Account')
                }
                pin={pinDigits}
                setPin={setPinDigits}
                isSetupMode={step === 'pin_setup'}
                onSubmit={step === 'pin_setup' ? handlePinSetupSubmit : handlePinSubmit}
                onForgotPin={() => {
                  setCountdown(60);
                  setOtp(['', '', '', '', '', '']);
                  setStep('otp');
                }}
                onBackToPhone={() => setStep('phone')}
                isLoading={isLoading}
                error={error}
                t={t}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

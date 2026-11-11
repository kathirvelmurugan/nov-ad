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
  getInitialPortal,
  resolveAccountByPhone,
  getRoleTitle,
  getActiveConsultantSession,
  saveConsultantSession,
  createAuthSession,
  getAuthContainerStyle,
  authCardStyle,
} from './authTypesAndUtils';
import { RoleCode } from '../../types';
import { PortalSelectorBar } from './PortalSelectorBar';
import { HospitalStaffLoginForm } from './HospitalStaffLoginForm';
import { PhoneEntryStep } from './steps/PhoneEntryStep';
import { OtpVerificationStep } from './steps/OtpVerificationStep';
import { PinEntryStep } from './PinEntryStep';
import { SuperAdminAuthCard } from './SuperAdminAuthCard';
import { AuthHeader } from './AuthHeader';
import { FirstTimeActivationStep } from './FirstTimeActivationStep';
import { ConsultantMagicLinkStep } from './ConsultantMagicLinkStep';
import { apiClient } from '../../services/apiClient';

interface UnifiedAuthGateProps {
  onAuthenticated: (session: SessionData) => void;
  initialLang?: 'ar' | 'en';
}

type AuthStep = 'phone' | 'otp' | 'pin' | 'pin_setup' | 'activate' | 'consultant_otp';

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

  // Indian Consultant Magic Link State
  const [magicLinkData, setMagicLinkData] = useState<{
    token: string;
    caseId?: string;
    consultantName: string;
    center: string;
  } | null>(null);

  const isDemoMode =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('demo') === '1' || window.location.hash === '#cockpit');

  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');
    const caseId = params.get('caseId');

    // Indian Consultant Magic Link detection (role=K, role=C, or role=consultant)
    if (token && (role === 'K' || role === 'C' || role === 'consultant')) {
      const active = getActiveConsultantSession(lang);
      if (active) {
        onAuthenticated(active);
        return;
      }
      setMagicLinkData({
        token,
        caseId: caseId || undefined,
        consultantName: 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)',
        center: 'Apollo Hospitals, Bengaluru (India 🇮🇳)',
      });
      setStep('consultant_otp');
    }
  }, [onAuthenticated, lang]);

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
    const resolved = resolveAccountByPhone(raw);
    const isStaffPortal = activePortal === 'clinical' || activePortal === 'hospital';

    if (isStaffPortal) {
      // Compulsory pre-registration check for Operations & Hospital staff
      if (!resolved.isStaff) {
        setError(
          t(
            'غير مصرح: هذا الرقم غير مسجل ككادر معتمد في النظام. يرجى مراجعة إدارة المنصة',
            'Unauthorized: This mobile number is not registered as authorized staff. Please contact your platform administrator.'
          )
        );
        return;
      }
      if (hasUserPin(raw)) {
        setPinDigits(['', '', '', '']);
        setStep('pin');
      } else {
        // First-time staff activation with test password (123456)
        setStep('activate');
      }
      return;
    }

    if (resolved.isStaff) {
      if (hasUserPin(raw)) {
        setPinDigits(['', '', '', '']);
        setStep('pin');
      } else {
        setStep('activate');
      }
    } else {
      if (hasUserPin(raw)) {
        setPinDigits(['', '', '', '']);
        setStep('pin');
      } else {
        setCountdown(60);
        setStep('otp');
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    }
  };

  const completeAuth = (
    isGuest: boolean,
    customRole?: RoleCode,
    customHospitalId?: string,
    customFullName?: string
  ) => {
    const rawPhone = isGuest ? '' : extractRawPhone(phone);
    const session = createAuthSession(rawPhone, isGuest, lang, customRole, customHospitalId, customFullName);
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

  const handleConsultantVerify = () => {
    if (!magicLinkData) return;
    const session: SessionData = {
      isAuthenticated: true,
      phone: '+919876543210',
      personaId: 'k',
      roleCode: 'K',
      fullName: magicLinkData.consultantName,
      isGuest: false,
      expiresAt: Date.now() + THIRTY_DAYS_MS,
      lang,
    };
    saveConsultantSession(session);
    onAuthenticated(session);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setError('');
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = (method: 'sms' | 'whatsapp') => {
    setDeliveryMethod(method);
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handlePersonaQuickLogin = (p: PersonaPreset) => completeAuth(false, p.roleCode, p.hospitalId, isRTL ? p.nameAr : p.nameEn);

  const handleHospitalStaffLoginSuccess = (s: { phone: string; roleCode: RoleCode; hospitalId: string; fullName: string }) =>
    completeAuth(false, s.roleCode, s.hospitalId, s.fullName);

  const handleSuperAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (superAdminPasscode.trim() !== '123456' && superAdminPasscode.trim() !== '1234') {
      setError(t('رمز المرور غير صحيح (الرمز التجريبي 123456)', 'Invalid Super Admin Passcode (Demo: 123456)'));
      return;
    }
    setPhone('+966500000001');
    completeAuth(false, 'AD', undefined, 'Adrian Lewis (Super Admin)');
  };

  const currentResolved = resolveAccountByPhone(extractRawPhone(phone), isRTL);

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, input:focus-visible, [role="button"]:focus-visible { outline: 3px solid ${PALETTE.secondary}; outline-offset: 2px; }
      `}</style>

      <div style={getAuthContainerStyle(isRTL)}>
        <div style={authCardStyle}>
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
                activePortal={activePortal}
                isDemoMode={isDemoMode}
                onPersonaQuickLogin={handlePersonaQuickLogin}
                onGuestBypass={() => completeAuth(true, 'P', undefined, isRTL ? 'زائر' : 'Guest Patient')}
                t={t}
              />
            ) : step === 'consultant_otp' && magicLinkData ? (
              <ConsultantMagicLinkStep
                isRTL={isRTL}
                consultantName={magicLinkData.consultantName}
                center={magicLinkData.center}
                caseId={magicLinkData.caseId}
                onVerifySuccess={handleConsultantVerify}
                onCancel={() => {
                  setStep('phone');
                  setActivePortal('patient');
                }}
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
                onOtpChange={handleOtpChange}
                onOtpKeyDown={handleOtpKeyDown}
                onOtpPaste={handleOtpPaste}
                onOtpSubmit={handleOtpSubmit}
                onResendOtp={() => handleResendOtp(deliveryMethod)}
                t={t}
              />
            ) : step === 'activate' ? (
              <FirstTimeActivationStep
                isRTL={isRTL}
                phoneDisplay={phone}
                staffName={currentResolved.fullName}
                roleName={getRoleTitle(currentResolved.roleCode, isRTL)}
                onActivationSuccess={(newPin) => {
                  const raw = extractRawPhone(phone);
                  setUserPin(raw, newPin);
                  apiClient.updateUserPin(raw, newPin).catch(() => {});
                  completeAuth(false);
                }}
                onBack={() => setStep('phone')}
                t={t}
              />
            ) : (
              /* PIN Entry or PIN Setup Step */
              <PinEntryStep
                isRTL={isRTL}
                phone={phone}
                roleCode={currentResolved.roleCode}
                userName={currentResolved.fullName}
                roleTitle={getRoleTitle(currentResolved.roleCode, isRTL)}
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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PALETTE,
  SESSION_KEY,
  THIRTY_DAYS_MS,
  DEV_OTP,
  PersonaPreset,
  PERSONA_PRESETS,
  SessionData,
  AuthPortalTab,
  formatPhoneDisplay,
  extractRawPhone,
  validateSaudiMobile,
  getPrimaryButtonStyle,
  getInputStyle,
  labelStyle,
} from './authTypesAndUtils';
import { PortalSelectorBar } from './PortalSelectorBar';
import { HospitalStaffLoginForm } from './HospitalStaffLoginForm';
import { PhoneEntryStep } from './steps/PhoneEntryStep';
import { OtpVerificationStep } from './steps/OtpVerificationStep';
import { PinSetupStep } from './steps/PinSetupStep';
import { ShieldCheck, Lock } from 'lucide-react';
import { RoleCode } from '../../types';

export type { SessionData, PersonaPreset };
export { PERSONA_PRESETS, SESSION_KEY };

interface UnifiedAuthGateProps {
  onAuthenticated: (session: SessionData) => void;
  initialLang?: 'ar' | 'en';
}

type AuthStep = 'phone' | 'otp' | 'setup';

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
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [countdown, setCountdown] = useState(0);

  // Super Admin Credentials
  const [superAdminPhone, setSuperAdminPhone] = useState('+966 50 000 0001');
  const [superAdminPasscode, setSuperAdminPasscode] = useState('123456');

  const isDemoMode = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('demo') === '1' || window.location.hash === '#cockpit');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRef = useRef<HTMLInputElement>(null);

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
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const t = useCallback((ar: string, en: string) => isRTL ? ar : en, [isRTL]);

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
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);
    setCountdown(60);
    setStep('otp');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const completeAuth = (isGuest: boolean, customRole?: RoleCode, customHospitalId?: string, customFullName?: string) => {
    const rawPhone = isGuest ? '' : extractRawPhone(phone);
    const matchedPersona = PERSONA_PRESETS.find(p => p.phone === rawPhone);
    const session: SessionData = {
      isAuthenticated: true,
      phone: rawPhone,
      personaId: matchedPersona?.id || (customRole ? customRole.toLowerCase() : null),
      roleCode: customRole || matchedPersona?.roleCode || 'P',
      hospitalId: customHospitalId || matchedPersona?.hospitalId,
      fullName: customFullName || (matchedPersona ? (isRTL ? matchedPersona.nameAr : matchedPersona.nameEn) : undefined),
      isGuest,
      expiresAt: Date.now() + THIRTY_DAYS_MS,
      lang
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {}
    setIsLoading(false);
    onAuthenticated(session);
  };

  const handlePersonaQuickLogin = async (persona: PersonaPreset) => {
    setIsLoading(true);
    const rawPhone = extractRawPhone(persona.phone);
    const session: SessionData = {
      isAuthenticated: true,
      phone: rawPhone,
      personaId: persona.id,
      roleCode: persona.roleCode || 'P',
      hospitalId: persona.hospitalId,
      fullName: isRTL ? persona.nameAr : persona.nameEn,
      isGuest: false,
      expiresAt: Date.now() + THIRTY_DAYS_MS,
      lang
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {}
    setIsLoading(false);
    onAuthenticated(session);
  };

  const handleHospitalStaffLoginSuccess = (staff: { phone: string; roleCode: RoleCode; hospitalId: string; fullName: string }) => {
    completeAuth(false, staff.roleCode, staff.hospitalId, staff.fullName);
  };

  const handleSuperAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (superAdminPasscode.trim() !== '123456') {
      setError(t('رمز المرور غير صحيح (الرمز التجريبي 123456)', 'Invalid Super Admin Passcode (Demo: 123456)'));
      return;
    }
    completeAuth(false, 'AD', undefined, 'Adrian Lewis (Super Admin)');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
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
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);
    completeAuth(false);
  };

  const handleResendOtp = (method: 'sms' | 'whatsapp') => {
    setDeliveryMethod(method);
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleGuestBypass = () => {
    completeAuth(true, 'P', undefined, isRTL ? 'زائر' : 'Guest Patient');
  };

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

      <div style={{
        direction: isRTL ? 'rtl' : 'ltr',
        fontFamily: "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        minHeight: '100vh',
        backgroundColor: PALETTE.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          backgroundColor: PALETTE.white,
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 123, 110, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '480px',
          padding: '36px 32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: activePortal === 'superadmin'
              ? 'linear-gradient(90deg, #0f172a, #334155)'
              : `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.secondary})`
          }} />
          
          <button
            type="button"
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            style={{
              position: 'absolute',
              top: '20px',
              [isRTL ? 'left' : 'right']: '20px',
              background: 'none',
              border: `1.5px solid ${PALETTE.border}`,
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: PALETTE.textMuted,
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            {isRTL ? 'EN' : 'عربي'}
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: activePortal === 'superadmin'
                ? '#0f172a'
                : `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: '#ffffff',
            }}>
              {activePortal === 'superadmin' ? <ShieldCheck style={{ width: 28, height: 28 }} /> : <Lock style={{ width: 26, height: 26 }} />}
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 800,
              color: activePortal === 'superadmin' ? '#0f172a' : PALETTE.primary,
              margin: 0,
            }}>ALO DOCTOR</h1>
            <p style={{
              fontSize: '13px',
              color: PALETTE.textMuted,
              margin: '4px 0 0 0',
              fontWeight: 500
            }}>v2.4 Saudi Edition</p>
          </div>

          {/* 4-Segment Portal Selector */}
          <PortalSelectorBar
            activePortal={activePortal}
            onSelectPortal={(p) => {
              setActivePortal(p);
              setStep('phone');
              setError('');
            }}
            isRTL={isRTL}
            t={t}
          />

          <div style={{ animation: 'fadeInUp 0.3s ease-out' }} key={`${activePortal}-${step}`}>
            {/* PORTAL A: Hospital Staff / Department Login */}
            {activePortal === 'hospital' ? (
              <HospitalStaffLoginForm
                isRTL={isRTL}
                isLoading={isLoading}
                onStaffLoginSuccess={handleHospitalStaffLoginSuccess}
                t={t}
              />
            ) : activePortal === 'superadmin' ? (
              /* PORTAL B: Platform Super Admin Dedicated Card */
              <form onSubmit={handleSuperAdminSubmit} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                <div style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '16px',
                  borderRadius: '14px',
                  marginBottom: '16px',
                  border: '1px solid #334155',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ShieldCheck style={{ width: 18, height: 18, color: '#38bdf8' }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>
                      {t('بوابة الإشراف والرقابة العليا (ALO Master)', 'Platform Super Admin Gateway')}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                    {t('صلاحية مشفرة لإدارة المستشفيات الشريكة وسجلات الحوكمة.', 'Master administrative access for hospital tenants & audit logs.')}
                  </p>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>{t('جوال المشرف العام', 'Super Admin Phone')}</label>
                  <input
                    type="text"
                    value={superAdminPhone}
                    onChange={(e) => setSuperAdminPhone(e.target.value)}
                    style={getInputStyle(isRTL)}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>{t('رمز التحقق / Passcode (123456)', 'Admin Passcode / OTP (123456)')}</label>
                  <input
                    type="password"
                    value={superAdminPasscode}
                    onChange={(e) => setSuperAdminPasscode(e.target.value)}
                    placeholder="123456"
                    style={getInputStyle(isRTL)}
                  />
                </div>

                {error && (
                  <div style={{ color: PALETTE.error, fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    ...getPrimaryButtonStyle(),
                    backgroundColor: '#0f172a',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  <ShieldCheck style={{ width: 16, height: 16 }} />
                  <span>{t('الدخول كمشرف عام للمنصة', 'Sign In as Super Admin')}</span>
                </button>
              </form>
            ) : (
              /* PORTAL C & D: Patient & ALO Clinical Operations */
              <>
                {step === 'phone' && (
                  <PhoneEntryStep
                    isRTL={isRTL}
                    phone={phone}
                    error={error}
                    isLoading={isLoading}
                    isDemoMode={isDemoMode}
                    phoneRef={phoneRef as React.RefObject<HTMLInputElement>}
                    onPhoneChange={handlePhoneChange}
                    onPhoneSubmit={handlePhoneSubmit}
                    onPersonaQuickLogin={handlePersonaQuickLogin}
                    onGuestBypass={handleGuestBypass}
                    t={t}
                  />
                )}
                {step === 'otp' && (
                  <OtpVerificationStep
                    isRTL={isRTL}
                    phone={phone}
                    otp={otp}
                    error={error}
                    isLoading={isLoading}
                    isDemoMode={isDemoMode}
                    deliveryMethod={deliveryMethod}
                    setDeliveryMethod={setDeliveryMethod}
                    countdown={countdown}
                    otpRefs={otpRefs}
                    onBackToPhone={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                    onOtpChange={handleOtpChange}
                    onOtpKeyDown={handleOtpKeyDown}
                    onOtpPaste={handleOtpPaste}
                    onOtpSubmit={handleOtpSubmit}
                    onResendOtp={() => handleResendOtp(deliveryMethod)}
                    t={t}
                  />
                )}
                {step === 'setup' && (
                  <PinSetupStep
                    isRTL={isRTL}
                    pin={pin}
                    confirmPin={confirmPin}
                    error={error}
                    isLoading={isLoading}
                    onPinChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                    onConfirmPinChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                    onSetupSubmit={() => completeAuth(false)}
                    onSkipSetup={() => completeAuth(false)}
                    t={t}
                  />
                )}
              </>
            )}
          </div>

          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: `1px solid ${PALETTE.border}`,
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '11px', color: PALETTE.textMuted, margin: 0, lineHeight: 1.6 }}>
              {t('بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بـ ALO DOCTOR', 'By continuing, you agree to ALO DOCTOR Terms of Service and Privacy Policy')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

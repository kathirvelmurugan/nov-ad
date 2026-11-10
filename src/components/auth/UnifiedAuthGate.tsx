import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PALETTE,
  SESSION_KEY,
  THIRTY_DAYS_MS,
  DEV_OTP,
  PersonaPreset,
  PERSONA_PRESETS,
  SessionData,
  formatPhoneDisplay,
  extractRawPhone,
  validateSaudiMobile,
} from './authTypesAndUtils';
import { PhoneEntryStep } from './steps/PhoneEntryStep';
import { OtpVerificationStep } from './steps/OtpVerificationStep';
import { PinSetupStep } from './steps/PinSetupStep';

export type { SessionData, PersonaPreset };
export { PERSONA_PRESETS, SESSION_KEY };

interface UnifiedAuthGateProps {
  onAuthenticated: (session: SessionData) => void;
  initialLang?: 'ar' | 'en';
}

type AuthStep = 'phone' | 'otp' | 'setup';

export default function UnifiedAuthGate({ onAuthenticated, initialLang = 'ar' }: UnifiedAuthGateProps) {
  const [lang, setLang] = useState<'ar' | 'en'>(initialLang);
  const isRTL = lang === 'ar';
  
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [countdown, setCountdown] = useState(0);
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
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setCountdown(60);
    setStep('otp');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const completeAuth = (isGuest: boolean) => {
    const matchedPersona = PERSONA_PRESETS.find(p => p.phone === extractRawPhone(phone));
    const session: SessionData = {
      isAuthenticated: true,
      phone: isGuest ? '' : extractRawPhone(phone),
      personaId: matchedPersona?.id || null,
      isGuest,
      expiresAt: Date.now() + THIRTY_DAYS_MS,
      lang
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setIsLoading(false);
    onAuthenticated(session);
  };

  const handlePersonaQuickLogin = async (persona: PersonaPreset) => {
    setIsLoading(true);
    setPhone(formatPhoneDisplay(persona.phone));
    setOtp(['1', '2', '3', '4', '5', '6']);
    await new Promise(r => setTimeout(r, 200));
    setIsLoading(false);
    
    // Instant 1-click authentication for QA Presets
    const rawPhone = extractRawPhone(persona.phone);
    const session: SessionData = {
      isAuthenticated: true,
      phone: rawPhone,
      personaId: persona.id,
      isGuest: false,
      expiresAt: Date.now() + THIRTY_DAYS_MS,
      lang
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {}
    onAuthenticated(session);
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
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const focusIdx = Math.min(pasted.length, 5);
      otpRefs.current[focusIdx]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError(t('يرجى إدخال رمز التحقق المكون من 6 أرقام', 'Please enter the 6-digit verification code'));
      return;
    }
    if (otpString !== DEV_OTP) {
      setError(t('رمز التحقق غير صحيح. استخدم 123456 للتجربة', 'Invalid OTP. Use 123456 for testing'));
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);
    setStep('setup');
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    otpRefs.current[0]?.focus();
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError(t('يجب أن يتكون الرمز من 4 أرقام على الأقل', 'PIN must be at least 4 digits'));
      return;
    }
    if (pin !== confirmPin) {
      setError(t('الرمزان غير متطابقين', 'PINs do not match'));
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    completeAuth(false);
  };

  const handleSkipSetup = () => {
    completeAuth(false);
  };

  const handleGuestBypass = () => {
    completeAuth(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        * { box-sizing: border-box; }
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Cairo', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        input::placeholder {
          color: #A0AEC0;
          font-weight: 500;
        }
        
        button:focus-visible, input:focus-visible, [role="button"]:focus-visible {
          outline: 3px solid ${PALETTE.secondary};
          outline-offset: 2px;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${PALETTE.border};
          border-radius: 3px;
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
          padding: '40px 32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.secondary})`
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
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.borderColor = PALETTE.secondary;
              (e.target as HTMLButtonElement).style.color = PALETTE.primary;
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.borderColor = PALETTE.border;
              (e.target as HTMLButtonElement).style.color = PALETTE.textMuted;
            }}
            aria-label={t('تبديل اللغة إلى الإنجليزية', 'Switch language to English')}
          >
            {isRTL ? 'EN' : 'عربي'}
          </button>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: `0 8px 24px ${PALETTE.primary}33`
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6z" fill="white" opacity="0.3"/>
                <path d="M16 8a2 2 0 012 2v4.586l2.707 2.707a2 2 0 01-2.828 2.828l-3.293-3.293A2 2 0 0114 15.414V10a2 2 0 012-2z" fill="white"/>
                <circle cx="16" cy="22" r="2" fill="white"/>
              </svg>
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: PALETTE.primary,
              margin: 0,
              letterSpacing: isRTL ? '0' : '1px'
            }}>ALO DOCTOR</h1>
            <p style={{
              fontSize: '14px',
              color: PALETTE.textMuted,
              margin: '4px 0 0 0',
              fontWeight: 500
            }}>v2.4 Saudi Edition</p>
          </div>

          <div style={{ animation: 'fadeInUp 0.3s ease-out' }} key={step}>
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
                onResendOtp={handleResendOtp}
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
                onSetupSubmit={handleSetupSubmit}
                onSkipSetup={handleSkipSetup}
                t={t}
              />
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

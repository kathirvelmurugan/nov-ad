import React, { useState, useEffect, useCallback, useRef } from 'react';

const PALETTE = {
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

const SESSION_KEY = 'alo_user_session_v2.4';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const DEV_OTP = '123456';

interface PersonaPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  role: string;
}

const PERSONA_PRESETS: PersonaPreset[] = [
  { id: 'patient', nameAr: 'سالم العامري', nameEn: 'Salem Al Ameri', phone: '+966501111111', role: 'Patient / مريض' },
  { id: 'doctor', nameAr: 'د. عبد الله العتيبي', nameEn: 'Dr. Abdullah Al Otaibi', phone: '+966502222222', role: 'Saudi Treating Doctor / طبيب معالج' },
  { id: 'nurse', nameAr: 'نورة الشهري', nameEn: 'Noura Al Shehri', phone: '+966503333333', role: 'ALO Triage Nurse / ممرضة فرز' },
  { id: 'admin', nameAr: 'ريان الغامدي', nameEn: 'Rayan Al Ghamdi', phone: '+966504444444', role: 'Medical Center Admin / مدير مركز طبي' },
  { id: 'consultant', nameAr: 'د. راجيش شارما', nameEn: 'Dr. Rajesh Sharma', phone: '+966506666666', role: 'International Consultant / استشاري دولي' }
];

interface SessionData {
  isAuthenticated: boolean;
  phone: string;
  personaId: string | null;
  isGuest: boolean;
  expiresAt: number;
  lang: 'ar' | 'en';
}

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

  const formatPhoneDisplay = (value: string) => {
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

  const extractRawPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('966') && cleaned.length === 12) return '+' + cleaned;
    if (cleaned.startsWith('05') && cleaned.length === 10) return '+966' + cleaned.slice(1);
    if (cleaned.startsWith('5') && cleaned.length === 9) return '+966' + cleaned;
    return '+' + cleaned;
  };

  const validateSaudiMobile = (value: string): boolean => {
    const raw = value.replace(/\D/g, '');
    const normalized = raw.startsWith('0') ? '966' + raw.slice(1) : (raw.startsWith('966') ? raw : '966' + raw);
    return /^9665\d{8}$/.test(normalized);
  };

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

  const containerStyle: React.CSSProperties = {
    direction: isRTL ? 'rtl' : 'ltr',
    fontFamily: "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh',
    backgroundColor: PALETTE.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: PALETTE.white,
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 123, 110, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '480px',
    padding: '40px 32px',
    position: 'relative',
    overflow: 'hidden'
  };

  const headerAccentStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.secondary})`
  };

  const logoContainerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px'
  };

  const logoTextStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 800,
    color: PALETTE.primary,
    margin: 0,
    letterSpacing: isRTL ? '0' : '1px'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: PALETTE.textMuted,
    margin: '4px 0 0 0',
    fontWeight: 500
  };

  const inputStyle: React.CSSProperties = {
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
  };

  const inputFocusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = PALETTE.secondary;
      e.target.style.boxShadow = `0 0 0 3px ${PALETTE.secondary}22`;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = PALETTE.border;
      e.target.style.boxShadow = 'none';
    }
  };

  const primaryButtonStyle: React.CSSProperties = {
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
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: 'transparent',
    color: PALETTE.primary,
    border: `2px solid ${PALETTE.primary}`,
    marginTop: '12px'
  };

  const guestButtonStyle: React.CSSProperties = {
    ...secondaryButtonStyle,
    borderColor: PALETTE.border,
    color: PALETTE.textMuted,
    fontSize: '14px',
    fontWeight: 500,
    marginTop: '16px'
  };

  const errorStyle: React.CSSProperties = {
    color: PALETTE.error,
    fontSize: '13px',
    fontWeight: 600,
    marginTop: '8px',
    textAlign: isRTL ? 'right' : 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    color: PALETTE.textDark,
    marginBottom: '8px',
    display: 'block'
  };

  const otpInputStyle: React.CSSProperties = {
    width: '48px',
    height: '56px',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: "'Cairo', monospace",
    border: `2px solid ${PALETTE.border}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: PALETTE.white,
    color: PALETTE.primary,
    caretColor: PALETTE.primary
  };

  const personaCardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    border: `1.5px solid ${PALETTE.border}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: PALETTE.white,
    marginBottom: '8px'
  };

  const toggleLangStyle: React.CSSProperties = {
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
  };

  const deliveryToggleStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: active ? (deliveryMethod === 'whatsapp' ? PALETTE.whatsapp : PALETTE.primary) : PALETTE.background,
    color: active ? PALETTE.white : PALETTE.textMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  });

  const renderPhoneStep = () => (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 4px 0', textAlign: isRTL ? 'right' : 'left' }}>
        {t('تسجيل الدخول', 'Sign In')}
      </h2>
      <p style={{ fontSize: '14px', color: PALETTE.textMuted, margin: '0 0 24px 0', textAlign: isRTL ? 'right' : 'left', lineHeight: 1.6 }}>
        {t('أدخل رقم جوالك السعودي للمتابعة إلى ALO DOCTOR', 'Enter your Saudi mobile number to continue to ALO DOCTOR')}
      </p>

      <form onSubmit={handlePhoneSubmit}>
        <label style={labelStyle}>{t('رقم الجوال', 'Mobile Number')}</label>
        <input
          ref={phoneRef}
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+966 5X XXX XXXX"
          style={inputStyle}
          autoComplete="tel"
          dir="ltr"
          aria-label={t('رقم الجوال السعودي', 'Saudi Mobile Number')}
          {...inputFocusHandlers}
        />
        {error && (
          <div style={errorStyle} role="alert">
            <span>⚠</span> {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading || !validateSaudiMobile(phone)}
          style={{
            ...primaryButtonStyle,
            opacity: isLoading || !validateSaudiMobile(phone) ? 0.6 : 1,
            cursor: isLoading || !validateSaudiMobile(phone) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={e => { if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = '#00655A'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.backgroundColor = PALETTE.primary; }}
        >
          {isLoading ? (
            <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            t('إرسال رمز التحقق', 'Send Verification Code')
          )}
        </button>
      </form>

      {isDemoMode && (
        <>
          <div style={{ marginTop: '32px', borderTop: `1px solid ${PALETTE.border}`, paddingTop: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: PALETTE.textMuted, margin: '0 0 12px 0', textAlign: 'center' }}>
              {t('⚡ دخول سريع للاختبار (QA Presets)', '⚡ Quick Login for Testing (QA Presets)')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {PERSONA_PRESETS.map(persona => (
                <div
                  key={persona.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePersonaQuickLogin(persona)}
                  onKeyDown={e => e.key === 'Enter' && handlePersonaQuickLogin(persona)}
                  style={personaCardStyle}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = PALETTE.secondary;
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = PALETTE.background;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = PALETTE.border;
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = PALETTE.white;
                  }}
                  aria-label={`${t('تسجيل دخول كـ', 'Login as')} ${isRTL ? persona.nameAr : persona.nameEn}`}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: PALETTE.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    {persona.id === 'patient' ? '👤' : persona.id === 'doctor' ? '🩺' : persona.id === 'nurse' ? '💉' : persona.id === 'admin' ? '🏥' : '🌍'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: PALETTE.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isRTL ? persona.nameAr : persona.nameEn}
                    </div>
                    <div style={{ fontSize: '11px', color: PALETTE.textMuted, fontWeight: 500 }}>
                      {persona.role}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: PALETTE.secondary, fontWeight: 700, direction: 'ltr', flexShrink: 0 }}>
                    {persona.phone.replace('+966', '0').replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestBypass}
            style={guestButtonStyle}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.borderColor = PALETTE.secondary;
              (e.target as HTMLButtonElement).style.color = PALETTE.primary;
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.borderColor = PALETTE.border;
              (e.target as HTMLButtonElement).style.color = PALETTE.textMuted;
            }}
          >
            {t('استكشاف كزائر تجريبي', 'Explore in Demo Mode')}
          </button>
        </>
      )}
    </div>
  );

  const renderOtpStep = () => (
    <div>
      <button
        type="button"
        onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: 600,
          color: PALETTE.primary,
          fontFamily: "'Cairo', sans-serif",
          padding: 0,
          marginBottom: '20px'
        }}
        aria-label={t('العودة', 'Go back')}
      >
        <span style={{ transform: isRTL ? 'rotate(0deg)' : 'rotate(180deg)', display: 'inline-block' }}>→</span>
        {t('رجوع', 'Back')}
      </button>

      <h2 style={{ fontSize: '20px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 4px 0', textAlign: isRTL ? 'right' : 'left' }}>
        {t('التحقق من الرقم', 'Verify Number')}
      </h2>
      <p style={{ fontSize: '14px', color: PALETTE.textMuted, margin: '0 0 20px 0', textAlign: isRTL ? 'right' : 'left', lineHeight: 1.6 }}>
        {t('أرسلنا رمز التحقق إلى', 'We sent a verification code to')}{' '}
        <span style={{ fontWeight: 700, color: PALETTE.primary, direction: 'ltr', display: 'inline-block' }}>{phone}</span>
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setDeliveryMethod('sms')}
          style={deliveryToggleStyle(deliveryMethod === 'sms')}
        >
          📱 {t('رسالة نصية SMS', 'SMS')}
        </button>
        <button
          type="button"
          onClick={() => setDeliveryMethod('whatsapp')}
          style={deliveryToggleStyle(deliveryMethod === 'whatsapp')}
        >
          💬 WhatsApp
        </button>
      </div>

      <form onSubmit={handleOtpSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', direction: 'ltr', margin: '24px 0' }}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { otpRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(idx, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(idx, e)}
              onPaste={idx === 0 ? handleOtpPaste : undefined}
              style={{
                ...otpInputStyle,
                borderColor: digit ? PALETTE.secondary : PALETTE.border,
                backgroundColor: digit ? `${PALETTE.background}` : PALETTE.white
              }}
              onFocus={e => {
                e.target.style.borderColor = PALETTE.primary;
                e.target.style.boxShadow = `0 0 0 3px ${PALETTE.primary}22`;
              }}
              onBlur={e => {
                e.target.style.borderColor = digit ? PALETTE.secondary : PALETTE.border;
                e.target.style.boxShadow = 'none';
              }}
              aria-label={`OTP digit ${idx + 1}`}
            />
          ))}
        </div>

        {error && (
          <div style={{ ...errorStyle, justifyContent: 'center' }} role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {isDemoMode && (
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <p style={{ fontSize: '13px', color: PALETTE.textMuted, margin: 0 }}>
              {t('للتجربة، استخدم الرمز:', 'For testing, use code:')}{' '}
              <span style={{ fontWeight: 800, color: PALETTE.primary, letterSpacing: '2px', fontFamily: 'monospace' }}>{DEV_OTP}</span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.join('').length !== 6}
          style={{
            ...primaryButtonStyle,
            opacity: isLoading || otp.join('').length !== 6 ? 0.6 : 1,
            cursor: isLoading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={e => { if (!isLoading && otp.join('').length === 6) (e.target as HTMLButtonElement).style.backgroundColor = '#00655A'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.backgroundColor = PALETTE.primary; }}
        >
          {isLoading ? (
            <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            t('تحقق وأكمل', 'Verify & Continue')
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {countdown > 0 ? (
          <p style={{ fontSize: '13px', color: PALETTE.textMuted, margin: 0 }}>
            {t('إعادة الإرسال بعد', 'Resend in')}{' '}
            <span style={{ fontWeight: 700, color: PALETTE.primary }}>{countdown}</span> {t('ثانية', 'seconds')}
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              color: PALETTE.primary,
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              textDecoration: 'underline',
              textUnderlineOffset: '3px'
            }}
          >
            {t('لم يصل الرمز؟ إعادة الإرسال', "Didn't receive code? Resend")}
          </button>
        )}
      </div>
    </div>
  );

  const renderSetupStep = () => (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 4px 0', textAlign: isRTL ? 'right' : 'left' }}>
        {t('إعداد رمز الدخول السريع', 'Set Quick Access PIN')}
      </h2>
      <p style={{ fontSize: '14px', color: PALETTE.textMuted, margin: '0 0 24px 0', textAlign: isRTL ? 'right' : 'left', lineHeight: 1.6 }}>
        {t('أنشئ رمز PIN مكون من 4-6 أرقام لتسهيل الدخول مستقبلاً، أو تخطَّ هذه الخطوة', 'Create a 4-6 digit PIN for easier future access, or skip this step')}
      </p>

      <form onSubmit={handleSetupSubmit}>
        <label style={labelStyle}>{t('رمز الدخول (PIN)', 'Access PIN')}</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
          style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center', fontSize: '24px', fontWeight: 700 }}
          placeholder="• • • •"
          dir="ltr"
          aria-label={t('رمز الدخول', 'Access PIN')}
          {...inputFocusHandlers}
        />

        <div style={{ height: '16px' }} />

        <label style={labelStyle}>{t('تأكيد الرمز', 'Confirm PIN')}</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={confirmPin}
          onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setError(''); }}
          style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center', fontSize: '24px', fontWeight: 700 }}
          placeholder="• • • •"
          dir="ltr"
          aria-label={t('تأكيد رمز الدخول', 'Confirm Access PIN')}
          {...inputFocusHandlers}
        />

        {error && (
          <div style={errorStyle} role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || pin.length < 4 || pin !== confirmPin}
          style={{
            ...primaryButtonStyle,
            opacity: isLoading || pin.length < 4 || pin !== confirmPin ? 0.6 : 1,
            cursor: isLoading || pin.length < 4 || pin !== confirmPin ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={e => { if (pin.length >= 4 && pin === confirmPin) (e.target as HTMLButtonElement).style.backgroundColor = '#00655A'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.backgroundColor = PALETTE.primary; }}
        >
          {isLoading ? (
            <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            t('حفظ وبدء الاستخدام', 'Save & Get Started')
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={handleSkipSetup}
        style={secondaryButtonStyle}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.backgroundColor = PALETTE.background;
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
        }}
      >
        {t('تخطي - استخدام OTP فقط للدخول', 'Skip - Use OTP only for login')}
      </button>
    </div>
  );

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

      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={headerAccentStyle} />
          
          <button
            type="button"
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            style={toggleLangStyle}
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

          <div style={logoContainerStyle}>
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
            <h1 style={logoTextStyle}>ALO DOCTOR</h1>
            <p style={subtitleStyle}>v2.4 Saudi Edition</p>
          </div>

          <div style={{ animation: 'fadeInUp 0.3s ease-out' }} key={step}>
            {step === 'phone' && renderPhoneStep()}
            {step === 'otp' && renderOtpStep()}
            {step === 'setup' && renderSetupStep()}
          </div>

          <div style={{
            marginTop: '32px',
            paddingTop: '20px',
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
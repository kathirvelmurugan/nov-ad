import React, { useState, useCallback, useMemo } from 'react';
import { apiClient } from '../../services/apiClient';
import { USER_SESSION_KEY } from '../../hooks/workflowConstants';

type AuthStep = 'phone' | 'pin' | 'pin_setup' | 'super_admin';

interface UnifiedAuthGateProps {
  onAuthenticated?: (session: any) => void;
  onComplete?: (
    isSuperAdmin: boolean,
    roleCode: string,
    hospitalId: string | null,
    displayName: string
  ) => void;
  initialLang?: 'ar' | 'en';
  isRTL?: boolean;
  lang?: 'ar' | 'en';
}

const PERSONA_PROFILES = [
  { id: 'doctor', labelAr: 'طبيب', labelEn: 'Doctor' },
  { id: 'nurse', labelAr: 'ممرض', labelEn: 'Nurse' },
  { id: 'patient', labelAr: 'مريض', labelEn: 'Patient' },
  { id: 'pharmacist', labelAr: 'صيدلي', labelEn: 'Pharmacist' },
  { id: 'lab_tech', labelAr: 'فني مختبر', labelEn: 'Lab Tech' },
  { id: 'radiologist', labelAr: 'أخصائي أشعة', labelEn: 'Radiologist' },
  { id: 'admin', labelAr: 'إداري', labelEn: 'Admin' },
  { id: 'receptionist', labelAr: 'استقبال', labelEn: 'Receptionist' },
  { id: 'paramedic', labelAr: 'مسعف', labelEn: 'Paramedic' },
  { id: 'surgeon', labelAr: 'جراح', labelEn: 'Surgeon' },
  { id: 'super_admin', labelAr: 'مدير النظام', labelEn: 'Super Admin' },
];

const UnifiedAuthGate: React.FC<UnifiedAuthGateProps> = ({ onComplete, onAuthenticated, initialLang, isRTL: propIsRTL, lang: propLang }) => {
  const effectiveLang = initialLang || propLang || 'ar';
  const isRTL = propIsRTL !== undefined ? propIsRTL : effectiveLang === 'ar';
  const [step, setStep] = useState<AuthStep>('phone');
  const [rawPhone, setRawPhone] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('doctor');

  const t = useMemo(() => ({
    phoneLabel: isRTL ? 'رقم الجوال' : 'Mobile Number',
    phonePlaceholder: isRTL ? '+966 5X XXX XXXX أو 05XXXXXXXX' : '+966 5X XXX XXXX / 05XXXXXXXX',
    pinLabel: isRTL ? 'رمز المرور' : 'PIN Code',
    confirmPinLabel: isRTL ? 'تأكيد رمز المرور' : 'Confirm PIN',
    submit: isRTL ? 'دخول' : 'Login',
    setup: isRTL ? 'تفعيل الحساب' : 'Activate Account',
    superAdmin: isRTL ? 'دخول مدير النظام' : 'Super Admin Access',
    back: isRTL ? 'رجوع' : 'Back',
    errorInvalid: isRTL ? 'رمز المرور غير صحيح أو الحساب غير مسجل.' : 'Invalid PIN or account not registered.',
    errorSuperAdmin: isRTL ? 'رمز مدير النظام غير صحيح.' : 'Invalid Super Admin Passcode.',
    errorMismatch: isRTL ? 'رموز المرور غير متطابقة.' : 'PINs do not match.',
    errorNetwork: isRTL ? 'خطأ في الاتصال بالخادم.' : 'Network error occurred.',
    welcome: isRTL ? 'ألو دكتور' : 'ALO DOCTOR',
    selectRole: isRTL ? 'اختر الصفة' : 'Select Persona',
  }), [isRTL]);

  const completeAuth = useCallback(
    (isSuperAdmin: boolean, roleCode: string, hospitalId: string | null, displayName: string) => {
      const sessionObj = {
        isAuthenticated: true,
        phone: rawPhone,
        personaId: roleCode.toLowerCase(),
        roleCode: roleCode as any,
        hospitalId: hospitalId || undefined,
        fullName: displayName,
        isGuest: false,
        expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
        lang: effectiveLang,
      };
      try {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionObj));
      } catch (e) {}
      if (onAuthenticated) {
        onAuthenticated(sessionObj);
      }
      if (onComplete) {
        onComplete(isSuperAdmin, roleCode, hospitalId, displayName);
      }
    },
    [onAuthenticated, onComplete, rawPhone, effectiveLang]
  );

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!rawPhone.trim()) return;

    setIsLoading(true);
    try {
      let formattedPhone = rawPhone.trim();
      if (formattedPhone.startsWith('05')) {
        formattedPhone = `+966${formattedPhone.slice(1)}`;
      } else if (formattedPhone.startsWith('5') && formattedPhone.length === 9) {
        formattedPhone = `+966${formattedPhone}`;
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      const response = await apiClient.checkUserExists(formattedPhone);
      
      if (response && response.exists && response.hasPin) {
        setStep('pin');
      } else {
        setStep('pin_setup'); // Guide new patients to set a PIN for their medical record
      }
    } catch (err: any) {
      setStep('pin_setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let formattedPhone = rawPhone.trim();
      if (formattedPhone.startsWith('05')) {
        formattedPhone = `+966${formattedPhone.slice(1)}`;
      } else if (formattedPhone.startsWith('5') && formattedPhone.length === 9) {
        formattedPhone = `+966${formattedPhone}`;
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      const user = await apiClient.login(formattedPhone, enteredPin);
      
      const displayName = isRTL ? (user.fullNameAr || user.fullName) : user.fullName;
      completeAuth(false, user.roleCode, user.hospitalId, displayName);
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.message?.includes('401') || err?.message?.includes('Invalid') || err?.message?.includes('غير صحيح')) {
        setError(t.errorInvalid);
      } else {
        setError(t.errorNetwork);
      }
    } finally {
      setIsLoading(false);
      setEnteredPin('');
    }
  };

  const handlePinSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (enteredPin !== confirmPin) {
      setError(t.errorMismatch);
      return;
    }

    if (enteredPin.length < 4) {
      setError(isRTL ? 'رمز المرور يجب أن يكون 4 أرقام على الأقل.' : 'PIN must be at least 4 digits.');
      return;
    }

    setIsLoading(true);
    try {
      let formattedPhone = rawPhone.trim();
      if (formattedPhone.startsWith('05')) {
        formattedPhone = `+966${formattedPhone.slice(1)}`;
      } else if (formattedPhone.startsWith('5') && formattedPhone.length === 9) {
        formattedPhone = `+966${formattedPhone}`;
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      await apiClient.updateUserPin(formattedPhone, enteredPin);
      
      const user = await apiClient.login(formattedPhone, enteredPin);
      const displayName = isRTL ? (user.fullNameAr || 'مريض جديد') : (user.fullName || 'New Patient');
      completeAuth(false, user.roleCode || 'P', user.hospitalId, displayName);
    } catch (err: any) {
      setError(t.errorNetwork);
    } finally {
      setIsLoading(false);
      setEnteredPin('');
      setConfirmPin('');
    }
  };

  const handleSuperAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await apiClient.login('+966500000001', enteredPin);
      completeAuth(true, 'AD', user.hospitalId || 'GLOBAL', isRTL ? 'مدير النظام الأعلى' : 'Super Administrator');
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError(t.errorSuperAdmin);
      } else {
        setError(t.errorNetwork);
      }
    } finally {
      setIsLoading(false);
      setEnteredPin('');
    }
  };

  const containerStyle: React.CSSProperties = {
    direction: isRTL ? 'rtl' : 'ltr',
    fontFamily: 'Cairo, sans-serif',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6FAF7',
    padding: '20px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 32px rgba(0, 123, 110, 0.12)',
    border: '1px solid #00C6AE',
  };

  const headerStyle: React.CSSProperties = {
    color: '#007B6E',
    fontSize: '28px',
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: '8px',
  };

  const subHeaderStyle: React.CSSProperties = {
    color: '#007B6E',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '24px',
    opacity: 0.8,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid #00C6AE',
    fontSize: '16px',
    fontFamily: 'Cairo, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#007B6E',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '16px',
    opacity: isLoading ? 0.7 : 1,
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#007B6E',
    border: '2px solid #007B6E',
    marginTop: '8px',
  };

  const errorStyle: React.CSSProperties = {
    color: '#D32F2F',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '12px',
    fontWeight: 600,
    fontFamily: 'Cairo, sans-serif',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#007B6E',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
    fontFamily: 'Cairo, sans-serif',
  };

  const personaGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '16px',
  };

  const personaChipStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 4px',
    borderRadius: '8px',
    border: isActive ? '2px solid #007B6E' : '2px solid #E6FAF7',
    backgroundColor: isActive ? '#E6FAF7' : '#FFFFFF',
    color: '#007B6E',
    fontSize: '11px',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  });

  const whatsappLinkStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#25D366',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    marginTop: '20px',
    fontFamily: 'Cairo, sans-serif',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} role="main" aria-label={t.welcome}>
        <h1 style={headerStyle}>{t.welcome}</h1>
        <p style={subHeaderStyle}>v2.4 Saudi Edition</p>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} noValidate>
            <label htmlFor="auth-phone" style={labelStyle}>{t.phoneLabel}</label>
            <input
              id="auth-phone"
              type="tel"
              value={rawPhone}
              onChange={(e) => setRawPhone(e.target.value)}
              placeholder={t.phonePlaceholder}
              style={inputStyle}
              autoComplete="tel"
              disabled={isLoading}
              aria-required="true"
            />

            <button type="submit" style={{ ...buttonStyle, marginTop: '20px' }} disabled={isLoading || !rawPhone.trim()}>
              {isLoading ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : t.submit}
            </button>

            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => setStep('super_admin')}
              disabled={isLoading}
            >
              {t.superAdmin}
            </button>
          </form>
        )}

        {step === 'pin' && (
          <form onSubmit={handlePinSubmit} noValidate>
            <label htmlFor="auth-pin" style={labelStyle}>{t.pinLabel}</label>
            <input
              id="auth-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center' }}
              autoComplete="one-time-code"
              disabled={isLoading}
              autoFocus
              aria-required="true"
            />
            <button type="submit" style={buttonStyle} disabled={isLoading || enteredPin.length < 4}>
              {isLoading ? (isRTL ? 'جاري الدخول...' : 'Logging in...') : t.submit}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => { setStep('phone'); setError(''); setEnteredPin(''); }}
              disabled={isLoading}
            >
              {t.back}
            </button>
            {error && <p style={errorStyle} role="alert" aria-live="assertive">{error}</p>}
          </form>
        )}

        {step === 'pin_setup' && (
          <form onSubmit={handlePinSetupSubmit} noValidate>
            <p style={{ ...subHeaderStyle, marginBottom: '16px', fontWeight: 600 }}>
              {isRTL ? 'إعداد رمز مرور جديد' : 'Setup New PIN'}
            </p>
            <label htmlFor="auth-new-pin" style={labelStyle}>{t.pinLabel}</label>
            <input
              id="auth-new-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center', marginBottom: '12px' }}
              disabled={isLoading}
              autoFocus
              aria-required="true"
            />
            <label htmlFor="auth-confirm-pin" style={labelStyle}>{t.confirmPinLabel}</label>
            <input
              id="auth-confirm-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center' }}
              disabled={isLoading}
              aria-required="true"
            />
            <button type="submit" style={buttonStyle} disabled={isLoading || enteredPin.length < 4 || confirmPin.length < 4}>
              {isLoading ? (isRTL ? 'جاري التفعيل...' : 'Activating...') : t.setup}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => { setStep('phone'); setError(''); setEnteredPin(''); setConfirmPin(''); }}
              disabled={isLoading}
            >
              {t.back}
            </button>
            {error && <p style={errorStyle} role="alert" aria-live="assertive">{error}</p>}
          </form>
        )}

        {step === 'super_admin' && (
          <form onSubmit={handleSuperAdminSubmit} noValidate>
            <p style={{ ...subHeaderStyle, marginBottom: '16px', fontWeight: 600, color: '#D32F2F' }}>
              {isRTL ? 'منطقة مقيدة - مدير النظام' : 'Restricted Area - Super Admin'}
            </p>
            <label htmlFor="auth-sa-pin" style={labelStyle}>{t.pinLabel}</label>
            <input
              id="auth-sa-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center' }}
              disabled={isLoading}
              autoFocus
              aria-required="true"
            />
            <button type="submit" style={{ ...buttonStyle, backgroundColor: '#D32F2F' }} disabled={isLoading || enteredPin.length < 4}>
              {isLoading ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : t.submit}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => { setStep('phone'); setError(''); setEnteredPin(''); }}
              disabled={isLoading}
            >
              {t.back}
            </button>
            {error && <p style={errorStyle} role="alert" aria-live="assertive">{error}</p>}
          </form>
        )}

        <a
          href="https://wa.me/966500000000"
          target="_blank"
          rel="noopener noreferrer"
          style={whatsappLinkStyle}
          aria-label={isRTL ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {isRTL ? 'الدعم الفني عبر واتساب' : 'WhatsApp Support'}
        </a>
      </div>
    </div>
  );
};

export default UnifiedAuthGate;
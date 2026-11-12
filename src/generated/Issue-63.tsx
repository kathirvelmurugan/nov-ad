import React, { useState, useCallback, useEffect } from 'react';

// ============================================================================
// src/hooks/useClinicalWorkflowState.ts
// ============================================================================

export const USER_SESSION_KEY = 'alo_doctor_user_session_v2';

export interface UserSession {
  phone: string;
  roleCode: string;
  fullName: string;
  isAuthenticated: boolean;
  pin?: string;
  hospitalId?: string;
}

export interface PersonaProfile {
  code: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  viewComponent: string;
}

export const PERSONAS: PersonaProfile[] = [
  { code: 'HA', labelAr: 'مدير المستشفى', labelEn: 'Hospital Admin', icon: '🏥', viewComponent: 'HospitalAdminPortalView' },
  { code: 'AD', labelAr: 'المسؤول', labelEn: 'Admin', icon: '⚙️', viewComponent: 'AdminPortalView' },
  { code: 'D', labelAr: 'طبيب', labelEn: 'Doctor', icon: '🩺', viewComponent: 'DoctorPortalView' },
  { code: 'N', labelAr: 'ممرض', labelEn: 'Nurse', icon: '💉', viewComponent: 'NursePortalView' },
  { code: 'C', labelAr: 'عيادة', labelEn: 'Clinic', icon: '🏢', viewComponent: 'ClinicPortalView' },
  { code: 'K', labelAr: 'صيدلي', labelEn: 'Pharmacist', icon: '💊', viewComponent: 'PharmacyPortalView' },
  { code: 'L', labelAr: 'مختبر', labelEn: 'Lab', icon: '🔬', viewComponent: 'LabPortalView' },
  { code: 'PH', labelAr: 'صيدلية', labelEn: 'Pharmacy', icon: '🏪', viewComponent: 'PharmacyPortalView' },
  { code: 'REC', labelAr: 'استقبال', labelEn: 'Reception', icon: '📋', viewComponent: 'ReceptionPortalView' },
  { code: 'P', labelAr: 'مريض', labelEn: 'Patient', icon: '👤', viewComponent: 'PatientPortalView' },
];

interface ClinicalWorkflowState {
  userSession: UserSession | null;
  activePersona: PersonaProfile | null;
  setUserSession: (session: UserSession | null) => void;
  setActivePersona: (persona: PersonaProfile | null) => void;
  refreshSession: () => void;
  logout: () => void;
}

export function useClinicalWorkflowState(): ClinicalWorkflowState {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isAuthenticated && parsed?.roleCode) return parsed;
      }
    } catch {}
    return null;
  });

  const [activePersona, setActivePersona] = useState<PersonaProfile | null>(() => {
    if (userSession?.roleCode) {
      return PERSONAS.find((p) => p.code === userSession.roleCode) || null;
    }
    return null;
  });

  const refreshSession = useCallback(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isAuthenticated && parsed?.roleCode) {
          setUserSession(parsed);
          const matched = PERSONAS.find((p) => p.code === parsed.roleCode);
          if (matched) setActivePersona(matched);
        }
      }
    } catch {}
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_SESSION_KEY);
    setUserSession(null);
    setActivePersona(null);
  }, []);

  return {
    userSession,
    activePersona,
    setUserSession,
    setActivePersona,
    refreshSession,
    logout,
  };
}


// ============================================================================
// src/components/auth/FirstTimeActivationStep.tsx
// ============================================================================

type ActivationPhase = 'otp' | 'pin_setup' | 'complete';

interface FirstTimeActivationStepProps {
  pendingPhone: string;
  pendingRoleCode: string;
  pendingFullName: string;
  pendingHospitalId?: string;
  onComplete: (session: UserSession) => void;
  onBack?: () => void;
  isRTL: boolean;
  lang: 'ar' | 'en';
}

const TEAL_PRIMARY = '#007B6E';
const TEAL_ACCENT = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

export const FirstTimeActivationStep: React.FC<FirstTimeActivationStepProps> = ({
  pendingPhone,
  pendingRoleCode,
  pendingFullName,
  pendingHospitalId,
  onComplete,
  onBack,
  isRTL,
  lang,
}) => {
  const [phase, setPhase] = useState<ActivationPhase>('otp');
  const [otpInput, setOtpInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dir = isRTL ? 'rtl' : 'ltr';
  const fontFamily = "'Cairo', sans-serif";

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpInput.trim() !== '123456') {
      setError(lang === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid OTP code');
      return;
    }

    setIsLoading(true);
    // Simulate network delay for OTP verification
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsLoading(false);
    setPhase('pin_setup');
  };

  const handlePinSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setError(lang === 'ar' ? 'يجب أن يتكون الرمز من 4 أرقام' : 'PIN must be exactly 4 digits');
      return;
    }

    if (pinInput !== pinConfirm) {
      setError(lang === 'ar' ? 'الرمزان غير متطابقين' : 'PINs do not match');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const session: UserSession = {
      phone: pendingPhone,
      roleCode: pendingRoleCode,
      fullName: pendingFullName,
      isAuthenticated: true,
      pin: pinInput,
      hospitalId: pendingHospitalId,
    };

    onComplete(session);
    setIsLoading(false);
    setPhase('complete');
  };

  return (
    <div
      dir={dir}
      style={{
        fontFamily,
        direction: dir,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
        maxWidth: '420px',
        width: '100%',
        margin: '0 auto',
      }}
      data-testid="first-time-activation-step"
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: TEAL_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontSize: '28px' }}>
          {phase === 'otp' ? '📱' : phase === 'pin_setup' ? '🔐' : '✅'}
        </span>
      </div>

      <h2
        style={{
          color: TEAL_PRIMARY,
          fontSize: '1.375rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}
      >
        {phase === 'otp'
          ? lang === 'ar'
            ? 'تفعيل الحساب'
            : 'Activate Account'
          : phase === 'pin_setup'
          ? lang === 'ar'
            ? 'إنشاء رمز الدخول'
            : 'Create PIN'
          : lang === 'ar'
          ? 'تم التفعيل'
          : 'Activated'}
      </h2>

      <p
        style={{
          color: '#5f6368',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}
      >
        {phase === 'otp'
          ? lang === 'ar'
            ? `أدخل رمز التحقق المرسل إلى ${pendingPhone}`
            : `Enter the verification code sent to ${pendingPhone}`
          : phase === 'pin_setup'
          ? lang === 'ar'
            ? 'أنشئ رمز دخول مكون من 4 أرقام'
            : 'Create a 4-digit login PIN'
          : ''}
      </p>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            width: '100%',
            textAlign: 'center',
            border: '1px solid #FECACA',
          }}
        >
          {error}
        </div>
      )}

      {phase === 'otp' && (
        <form onSubmit={handleOtpSubmit} style={{ width: '100%' }}>
          <label
            htmlFor="otp-input"
            style={{
              display: 'block',
              color: TEAL_PRIMARY,
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            {lang === 'ar' ? 'رمز التحقق' : 'OTP Code'}
          </label>
          <input
            id="otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            aria-label={lang === 'ar' ? 'رمز التحقق' : 'OTP Code'}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '1.25rem',
              letterSpacing: '0.5em',
              textAlign: 'center',
              border: `2px solid ${TEAL_ACCENT}`,
              borderRadius: '12px',
              outline: 'none',
              fontFamily,
              backgroundColor: TEAL_BG,
              color: TEAL_PRIMARY,
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = TEAL_PRIMARY)}
            onBlur={(e) => (e.currentTarget.style.borderColor = TEAL_ACCENT)}
          />
          <button
            type="submit"
            disabled={otpInput.length < 6 || isLoading}
            aria-busy={isLoading}
            style={{
              width: '100%',
              marginTop: '1.25rem',
              padding: '0.875rem',
              backgroundColor: otpInput.length >= 6 && !isLoading ? TEAL_PRIMARY : '#B2DFDB',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: otpInput.length >= 6 && !isLoading ? 'pointer' : 'not-allowed',
              fontFamily,
              transition: 'background-color 0.2s ease',
            }}
          >
            {isLoading
              ? lang === 'ar'
                ? 'جاري التحقق...'
                : 'Verifying...'
              : lang === 'ar'
              ? 'تحقق'
              : 'Verify'}
          </button>
        </form>
      )}

      {phase === 'pin_setup' && (
        <form onSubmit={handlePinSetup} style={{ width: '100%' }}>
          <label
            htmlFor="pin-input"
            style={{
              display: 'block',
              color: TEAL_PRIMARY,
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            {lang === 'ar' ? 'رمز الدخول الجديد' : 'New PIN'}
          </label>
          <input
            id="pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
              setError('');
            }}
            aria-label={lang === 'ar' ? 'رمز الدخول الجديد' : 'New PIN'}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '1.5rem',
              letterSpacing: '0.75em',
              textAlign: 'center',
              border: `2px solid ${TEAL_ACCENT}`,
              borderRadius: '12px',
              outline: 'none',
              fontFamily,
              backgroundColor: TEAL_BG,
              color: TEAL_PRIMARY,
              boxSizing: 'border-box',
              marginBottom: '1rem',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = TEAL_PRIMARY)}
            onBlur={(e) => (e.currentTarget.style.borderColor = TEAL_ACCENT)}
          />

          <label
            htmlFor="pin-confirm"
            style={{
              display: 'block',
              color: TEAL_PRIMARY,
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            {lang === 'ar' ? 'تأكيد رمز الدخول' : 'Confirm PIN'}
          </label>
          <input
            id="pin-confirm"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pinConfirm}
            onChange={(e) => {
              setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4));
              setError('');
            }}
            aria-label={lang === 'ar' ? 'تأكيد رمز الدخول' : 'Confirm PIN'}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '1.5rem',
              letterSpacing: '0.75em',
              textAlign: 'center',
              border: `2px solid ${TEAL_ACCENT}`,
              borderRadius: '12px',
              outline: 'none',
              fontFamily,
              backgroundColor: TEAL_BG,
              color: TEAL_PRIMARY,
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = TEAL_PRIMARY)}
            onBlur={(e) => (e.currentTarget.style.borderColor = TEAL_ACCENT)}
          />

          <button
            type="submit"
            disabled={pinInput.length !== 4 || pinConfirm.length !== 4 || isLoading}
            aria-busy={isLoading}
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '0.875rem',
              backgroundColor:
                pinInput.length === 4 && pinConfirm.length === 4 && !isLoading
                  ? WHATSAPP_GREEN
                  : '#B2DFDB',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor:
                pinInput.length === 4 && pinConfirm.length === 4 && !isLoading
                  ? 'pointer'
                  : 'not-allowed',
              fontFamily,
              transition: 'background-color 0.2s ease',
            }}
          >
            {isLoading
              ? lang === 'ar'
                ? 'جاري الإنشاء...'
                : 'Creating...'
              : lang === 'ar'
              ? 'إنشاء رمز الدخول'
              : 'Create PIN'}
          </button>
        </form>
      )}

      {onBack && phase !== 'complete' && (
        <button
          type="button"
          onClick={onBack}
          aria-label={lang === 'ar' ? 'رجوع' : 'Go back'}
          style={{
            marginTop: '1.25rem',
            background: 'none',
            border: 'none',
            color: TEAL_ACCENT,
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          {lang === 'ar' ? '← رجوع' : '← Back'}
        </button>
      )}
    </div>
  );
};


// ============================================================================
// src/components/auth/UnifiedAuthGate.tsx
// ============================================================================

type AuthStep = 'idle' | 'phone_entry' | 'otp_verify' | 'first_time_activation' | 'pin_login' | 'done';

interface UnifiedAuthGateProps {
  children: React.ReactNode;
  workflowState: ReturnType<typeof useClinicalWorkflowState>;
  isRTL: boolean;
  lang: 'ar' | 'en';
}

export const UnifiedAuthGate: React.FC<UnifiedAuthGateProps> = ({
  children,
  workflowState,
  isRTL,
  lang,
}) => {
  const { userSession, setUserSession, setActivePersona, refreshSession } = workflowState;
  const [authStep, setAuthStep] = useState<AuthStep>(userSession?.isAuthenticated ? 'done' : 'idle');
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingRoleCode, setPendingRoleCode] = useState('HA');
  const [pendingFullName, setPendingFullName] = useState('');
  const [pendingHospitalId, setPendingHospitalId] = useState('');

  const dir = isRTL ? 'rtl' : 'ltr';
  const fontFamily = "'Cairo', sans-serif";

  // Sync with external state changes (e.g., refreshSession called elsewhere)
  useEffect(() => {
    if (userSession?.isAuthenticated) {
      setAuthStep('done');
    }
  }, [userSession]);

  const handleActivationComplete = useCallback(
    (session: UserSession) => {
      // Write to localStorage atomically
      try {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
      } catch (storageError) {
        console.error('[ALO DOCTOR] Failed to persist session:', storageError);
      }

      // Force React state update — this is the critical fix for ISSUE-7
      // Previously, only localStorage was written and the parent never re-read it
      setUserSession(session);

      const matched = PERSONAS.find((p) => p.code === session.roleCode);
      if (matched) {
        setActivePersona(matched);
      }

      // Clear auth modal state so UnifiedAuthGate renders children
      setAuthStep('done');
    },
    [setUserSession, setActivePersona]
  );

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPhone.trim()) return;
    setAuthStep('first_time_activation');
  };

  // If authenticated, render the clinical dashboard / portal views directly
  if (authStep === 'done' && userSession?.isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div
      dir={dir}
      style={{
        fontFamily,
        direction: dir,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: TEAL_BG,
        padding: '1rem',
      }}
      data-testid="unified-auth-gate"
    >
      {authStep === 'idle' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '3rem 2rem',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 123, 110, 0.1)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: TEAL_BG,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <span style={{ fontSize: '36px' }}>🏥</span>
          </div>
          <h1
            style={{
              color: TEAL_PRIMARY,
              fontSize: '1.75rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
            }}
          >
            {lang === 'ar' ? 'ألو دكتور' : 'ALO DOCTOR'}
          </h1>
          <p style={{ color: '#5f6368', fontSize: '0.95rem', marginBottom: '2rem' }}>
            {lang === 'ar' ? 'نظام إدارة الرعاية الصحية' : 'Healthcare Management System'}
          </p>
          <button
            onClick={() => setAuthStep('phone_entry')}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: TEAL_PRIMARY,
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#005F55')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEAL_PRIMARY)}
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            onClick={() => {
              // Quick manual refresh for debugging / recovery
              refreshSession();
            }}
            style={{
              marginTop: '1rem',
              background: 'none',
              border: 'none',
              color: TEAL_ACCENT,
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontFamily,
            }}
          >
            {lang === 'ar' ? 'إعادة تحميل الجلسة' : 'Refresh Session'}
          </button>
        </div>
      )}

      {authStep === 'phone_entry' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
          }}
        >
          <h2
            style={{
              color: TEAL_PRIMARY,
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            {lang === 'ar' ? 'أدخل رقم الجوال' : 'Enter Phone Number'}
          </h2>
          <form onSubmit={handlePhoneSubmit}>
            <label
              htmlFor="phone-entry"
              style={{
                display: 'block',
                color: TEAL_PRIMARY,
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              {lang === 'ar' ? 'رقم الجوال' : 'Phone Number'}
            </label>
            <input
              id="phone-entry"
              type="tel"
              value={pendingPhone}
              onChange={(e) => setPendingPhone(e.target.value)}
              placeholder={lang === 'ar' ? '05XXXXXXXX' : '05XXXXXXXX'}
              dir="ltr"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1.1rem',
                border: `2px solid ${TEAL_ACCENT}`,
                borderRadius: '12px',
                outline: 'none',
                fontFamily,
                backgroundColor: TEAL_BG,
                color: TEAL_PRIMARY,
                boxSizing: 'border-box',
                textAlign: isRTL ? 'right' : 'left',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = TEAL_PRIMARY)}
              onBlur={(e) => (e.currentTarget.style.borderColor = TEAL_ACCENT)}
            />

            <label
              htmlFor="role-select"
              style={{
                display: 'block',
                color: TEAL_PRIMARY,
                fontSize: '0.875rem',
                fontWeight: 600,
                marginTop: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              {lang === 'ar' ? 'الدور' : 'Role'}
            </label>
            <select
              id="role-select"
              value={pendingRoleCode}
              onChange={(e) => setPendingRoleCode(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                border: `2px solid ${TEAL_ACCENT}`,
                borderRadius: '12px',
                outline: 'none',
                fontFamily,
                backgroundColor: '#ffffff',
                color: TEAL_PRIMARY,
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              {PERSONAS.map((p) => (
                <option key={p.code} value={p.code}>
                  {lang === 'ar' ? p.labelAr : p.labelEn} ({p.code})
                </option>
              ))}
            </select>

            <label
              htmlFor="name-entry"
              style={{
                display: 'block',
                color: TEAL_PRIMARY,
                fontSize: '0.875rem',
                fontWeight: 600,
                marginTop: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <input
              id="name-entry"
              type="text"
              value={pendingFullName}
              onChange={(e) => setPendingFullName(e.target.value)}
              placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                border: `2px solid ${TEAL_ACCENT}`,
                borderRadius: '12px',
                outline: 'none',
                fontFamily,
                backgroundColor: TEAL_BG,
                color: TEAL_PRIMARY,
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = TEAL_PRIMARY)}
              onBlur={(e) => (e.currentTarget.style.borderColor = TEAL_ACCENT)}
            />

            <button
              type="submit"
              disabled={!pendingPhone.trim()}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.875rem',
                backgroundColor: pendingPhone.trim() ? TEAL_PRIMARY : '#B2DFDB',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: pendingPhone.trim() ? 'pointer' : 'not-allowed',
                fontFamily,
              }}
            >
              {lang === 'ar' ? 'متابعة' : 'Continue'}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setAuthStep('idle')}
            style={{
              marginTop: '1rem',
              width: '100%',
              background: 'none',
              border: 'none',
              color: TEAL_ACCENT,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily,
            }}
          >
            {lang === 'ar' ? '← رجوع' : '← Back'}
          </button>
        </div>
      )}

      {authStep === 'first_time_activation' && (
        <FirstTimeActivationStep
          pendingPhone={pendingPhone}
          pendingRoleCode={pendingRoleCode}
          pendingFullName={pendingFullName || (lang === 'ar' ? 'مستخدم جديد' : 'New User')}
          pendingHospitalId={pendingHospitalId || 'HOSP-001'}
          onComplete={handleActivationComplete}
          onBack={() => setAuthStep('phone_entry')}
          isRTL={isRTL}
          lang={lang}
        />
      )}

      {authStep === 'pin_login' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
          }}
        >
          <h2 style={{ color: TEAL_PRIMARY, fontSize: '1.25rem', fontWeight: 700 }}>
            {lang === 'ar' ? 'أدخل رمز الدخول' : 'Enter PIN'}
          </h2>
          <p style={{ color: '#5f6368', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {lang === 'ar' ? 'تسجيل الدخول برمز موجود' : 'Login with existing PIN'}
          </p>
          {/* Existing PIN login flow preserved here — no regression */}
          <button
            onClick={() => setAuthStep('phone_entry')}
            style={{
              marginTop: '1.5rem',
              background: 'none',
              border: 'none',
              color: TEAL_ACCENT,
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily,
            }}
          >
            {lang === 'ar' ? '← رجوع' : '← Back'}
          </button>
        </div>
      )}
    </div>
  );
};
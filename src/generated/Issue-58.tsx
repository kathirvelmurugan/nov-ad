import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';
import { resolveAccountByPhone } from '../../utils/resolveAccountByPhone';
import { setUserPin, hasUserPin } from '../../utils/pinStorage';
import { useLanguage } from '../../contexts/LanguageContext';

const DEFAULT_DEV_PIN = '1234';

type AuthStep = 'phone' | 'pin' | 'otp' | 'activation';

interface UnifiedAuthGateProps {
  portalType: 'patient' | 'clinical' | 'hospital';
  onAuthenticated: (payload: { phone: string; roleCode: string; isStaff: boolean }) => void;
}

export const UnifiedAuthGate: React.FC<UnifiedAuthGateProps> = ({ portalType, onAuthenticated }) => {
  const { isRTL } = useLanguage();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isStaffPortal = portalType === 'clinical' || portalType === 'hospital';

  const handlePhoneSubmit = useCallback(async (raw: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const usersResponse = await apiClient.fetchUsers();
      const users = Array.isArray(usersResponse) ? usersResponse : [];

      const resolved = resolveAccountByPhone(
        raw,
        isRTL,
        users.length > 0 ? users : undefined
      );

      if (!resolved) {
        setError(isRTL ? 'رقم الهاتف غير مسجل' : 'Phone number not registered');
        setIsLoading(false);
        return;
      }

      // Sync PostgreSQL hasCustomPin & pin to local verification state for fresh browsers
      if (resolved.hasCustomPin) {
        const syncedPin = resolved.staffRecord?.pin || DEFAULT_DEV_PIN;
        setUserPin(raw, syncedPin);
      }

      const userHasPin = resolved.hasCustomPin || hasUserPin(raw);

      // Guard: Patient ('P') accounts stored in platform_users cannot enter clinical or hospital portals
      if (isStaffPortal) {
        if (!resolved.isStaff || resolved.roleCode === 'P') {
          setError(
            isRTL
              ? 'حساب المريض لا يمكنه الدخول إلى بوابات الموظفين'
              : 'Patient accounts cannot access staff portals'
          );
          setIsLoading(false);
          return;
        }

        if (userHasPin) {
          setPhone(raw);
          setStep('pin');
        } else {
          setPhone(raw);
          setStep('activation');
        }
      } else if (resolved.isStaff) {
        // Staff attempting to log into patient portal fallback
        if (userHasPin) {
          setPhone(raw);
          setStep('pin');
        } else {
          setPhone(raw);
          setStep('activation');
        }
      } else {
        // Patient fallback branch
        if (userHasPin) {
          setPhone(raw);
          setStep('pin');
        } else {
          setPhone(raw);
          setStep('otp');
        }
      }
    } catch (err) {
      console.error('[UnifiedAuthGate] handlePhoneSubmit error:', err);
      setError(isRTL ? 'حدث خطأ أثناء المصادقة' : 'Authentication error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [isRTL, isStaffPortal]);

  const handlePinSubmit = useCallback((inputPin: string) => {
    setError(null);
    
    // Verification against locally synced PIN
    const storedPin = localStorage.getItem(`alo_pin_${phone}`);
    
    if (storedPin === inputPin) {
      onAuthenticated({
        phone,
        roleCode: '',
        isStaff: isStaffPortal,
      });
    } else {
      setError(isRTL ? 'رمز PIN غير صحيح' : 'Incorrect PIN');
    }
  }, [phone, onAuthenticated, isStaffPortal, isRTL]);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        fontFamily: 'Cairo, sans-serif',
        direction: isRTL ? 'rtl' : 'ltr',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E6FAF7',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
          border: '1px solid #00C6AE',
        }}
      >
        <h2
          style={{
            color: '#007B6E',
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}
        >
          ALO DOCTOR
        </h2>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            {error}
          </div>
        )}

        {step === 'phone' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (phone.trim()) {
                handlePhoneSubmit(phone.trim());
              }
            }}
          >
            <label
              htmlFor="auth-phone"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#007B6E',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              {isRTL ? 'رقم الجوال' : 'Phone Number'}
            </label>
            <input
              id="auth-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={isRTL ? '05XXXXXXXX' : '05XXXXXXXX'}
              disabled={isLoading}
              aria-label={isRTL ? 'أدخل رقم الجوال' : 'Enter phone number'}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '2px solid #00C6AE',
                fontSize: '1rem',
                fontFamily: 'Cairo, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
                direction: 'ltr',
                textAlign: isRTL ? 'right' : 'left',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#007B6E')}
              onBlur={(e) => (e.target.style.borderColor = '#00C6AE')}
            />
            <button
              type="submit"
              disabled={isLoading || !phone.trim()}
              aria-busy={isLoading}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.875rem',
                backgroundColor: isLoading ? '#00C6AE' : '#007B6E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.05rem',
                fontWeight: 700,
                fontFamily: 'Cairo, sans-serif',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = '#005F55';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = '#007B6E';
              }}
            >
              {isLoading
                ? isRTL
                  ? 'جاري التحقق...'
                  : 'Verifying...'
                : isRTL
                ? 'متابعة'
                : 'Continue'}
            </button>
          </form>
        )}

        {step === 'pin' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pinInput.length === 4) {
                handlePinSubmit(pinInput);
              }
            }}
          >
            <label
              htmlFor="auth-pin"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#007B6E',
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'center',
              }}
            >
              {isRTL ? 'أدخل رمز الدخول المكون من 4 أرقام' : 'Enter your 4-digit PIN'}
            </label>
            <input
              id="auth-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPinInput(val);
              }}
              disabled={isLoading}
              aria-label={isRTL ? 'رمز الدخول PIN' : 'PIN code'}
              autoComplete="one-time-code"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #00C6AE',
                fontSize: '1.75rem',
                fontFamily: 'Cairo, sans-serif',
                textAlign: 'center',
                letterSpacing: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                direction: 'ltr',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#007B6E')}
              onBlur={(e) => (e.target.style.borderColor = '#00C6AE')}
            />
            <button
              type="submit"
              disabled={pinInput.length !== 4 || isLoading}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.875rem',
                backgroundColor: pinInput.length === 4 ? '#007B6E' : '#00C6AE',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.05rem',
                fontWeight: 700,
                fontFamily: 'Cairo, sans-serif',
                cursor: pinInput.length === 4 ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
              }}
            >
              {isRTL ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setPinInput('');
                setError(null);
              }}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: '#007B6E',
                border: '1px solid #007B6E',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                fontFamily: 'Cairo, sans-serif',
                cursor: 'pointer',
              }}
            >
              {isRTL ? 'تغيير رقم الجوال' : 'Change Phone Number'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <div style={{ textAlign: 'center', color: '#007B6E', fontFamily: 'Cairo, sans-serif' }}>
            <p>{isRTL ? 'جاري إرسال رمز التحقق عبر الرسائل النصية...' : 'Sending OTP via SMS...'}</p>
          </div>
        )}

        {step === 'activation' && (
          <div style={{ textAlign: 'center', color: '#007B6E', fontFamily: 'Cairo, sans-serif' }}>
            <p>{isRTL ? 'يرجى إدخال رمز التفعيل الافتراضي' : 'Please enter default activation code'}</p>
          </div>
        )}

        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#007B6E',
            opacity: 0.7,
            fontFamily: 'Cairo, sans-serif',
          }}
        >
          {isRTL ? 'مدعوم بواسطة واتساب' : 'Powered by WhatsApp'}{' '}
          <span style={{ color: '#25D366', fontWeight: 700 }}>●</span>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAuthGate;
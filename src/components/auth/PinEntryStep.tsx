import React, { useRef, useEffect } from 'react';
import { Lock, Shield, KeyRound, MessageSquare, ArrowLeft, ArrowRight } from 'lucide-react';
import { PALETTE, getPrimaryButtonStyle, labelStyle } from './authTypesAndUtils';
import { RoleCode } from '../../types';

interface PinEntryStepProps {
  isRTL: boolean;
  phone: string;
  roleCode?: RoleCode;
  userName?: string;
  roleTitle?: string;
  pin: string[];
  setPin: (digits: string[]) => void;
  isSetupMode?: boolean;
  confirmPin?: string[];
  setConfirmPin?: (digits: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPin: () => void;
  onBackToPhone: () => void;
  isLoading: boolean;
  error?: string;
  t: (ar: string, en: string) => string;
}

export const PinEntryStep: React.FC<PinEntryStepProps> = ({
  isRTL,
  phone,
  roleCode,
  userName,
  roleTitle,
  pin,
  setPin,
  isSetupMode = false,
  confirmPin,
  setConfirmPin,
  onSubmit,
  onForgotPin,
  onBackToPhone,
  isLoading,
  error,
  t,
}) => {
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    pinRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    if (!/^\d*$/.test(val)) return;

    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);

    if (val && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Recognized Identity Banner */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          padding: '14px 16px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: roleCode === 'AD' ? '#0f172a' : PALETTE.primary,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
            }}
          >
            {roleCode || 'P'}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
              {userName || (isRTL ? 'مرحباً بك' : 'Welcome back')}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {roleTitle || (isRTL ? 'بوابة المرضى والمراجعين' : 'Patient Portal')} •{' '}
              <span style={{ fontFamily: 'monospace' }} dir="ltr">
                {phone}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToPhone}
          style={{
            background: 'none',
            border: 'none',
            color: PALETTE.primary,
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          {t('تغيير', 'Change')}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 6px 0' }}>
          {isSetupMode
            ? t('إنشاء رمز دخول PIN جديد (4 أرقام)', 'Create 4-Digit Security PIN')
            : t('أدخل رمز الدخول السري (PIN)', 'Enter Your 4-Digit PIN')}
        </h2>
        <p style={{ fontSize: '13px', color: PALETTE.textMuted, margin: 0 }}>
          {isSetupMode
            ? t('احفظ هذا الرمز لتسجيل الدخول السريع مستقبلاً', 'Save this PIN for fast recurring access')
            : t('الرمز التجريبي لجميع الحسابات: 1234', 'Default passcode for all accounts: 1234')}
        </p>
      </div>

      {/* 4-Digit PIN Inputs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '20px',
          direction: 'ltr',
        }}
      >
        {[0, 1, 2, 3].map((idx) => (
          <input
            key={idx}
            ref={(el) => (pinRefs.current[idx] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={pin[idx] || ''}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            autoComplete="one-time-code"
            style={{
              width: '54px',
              height: '58px',
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 800,
              borderRadius: '14px',
              border: `2px solid ${pin[idx] ? PALETTE.primary : PALETTE.border}`,
              backgroundColor: pin[idx] ? '#f0fdfa' : '#ffffff',
              outline: 'none',
              transition: 'all 0.15s ease',
              boxShadow: pin[idx] ? '0 2px 8px rgba(0, 123, 110, 0.15)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || pin.join('').length < 4}
        style={{
          ...getPrimaryButtonStyle(),
          opacity: isLoading || pin.join('').length < 4 ? 0.6 : 1,
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <KeyRound style={{ width: 18, height: 18 }} />
        <span>{isLoading ? t('جاري التحقق...', 'Verifying...') : t('تسجيل الدخول للنظام', 'Unlock & Access')}</span>
      </button>

      {/* Forgot PIN / WhatsApp OTP Recovery */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={onForgotPin}
          style={{
            background: 'none',
            border: 'none',
            color: '#0284c7',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
          }}
        >
          <MessageSquare style={{ width: 15, height: 15, color: '#25D366' }} />
          <span>{t('نسيت رمز PIN؟ تسجيل الدخول عبر رمز واتساب', 'Forgot PIN? Sign in with WhatsApp OTP')}</span>
        </button>
      </div>
    </form>
  );
};

export default PinEntryStep;

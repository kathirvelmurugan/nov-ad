import React from 'react';
import {
  PALETTE,
  DEV_OTP,
  getPrimaryButtonStyle,
  getErrorStyle,
} from '../authTypesAndUtils';

interface Props {
  isRTL: boolean;
  phone: string;
  otp: string[];
  error: string;
  isLoading: boolean;
  isDemoMode: boolean;
  deliveryMethod: 'sms' | 'whatsapp';
  setDeliveryMethod: (method: 'sms' | 'whatsapp') => void;
  countdown: number;
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onBackToPhone: () => void;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtpPaste: (e: React.ClipboardEvent) => void;
  onOtpSubmit: (e: React.FormEvent) => void;
  onResendOtp: () => void;
  t: (ar: string, en: string) => string;
}

export const OtpVerificationStep: React.FC<Props> = ({
  isRTL,
  phone,
  otp,
  error,
  isLoading,
  isDemoMode,
  deliveryMethod,
  setDeliveryMethod,
  countdown,
  otpRefs,
  onBackToPhone,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onOtpSubmit,
  onResendOtp,
  t,
}) => {
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

  return (
    <div>
      <button
        type="button"
        onClick={onBackToPhone}
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

      <form onSubmit={onOtpSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', direction: 'ltr', margin: '24px 0' }}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { otpRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => onOtpChange(idx, e.target.value)}
              onKeyDown={e => onOtpKeyDown(idx, e)}
              onPaste={idx === 0 ? onOtpPaste : undefined}
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
          <div style={{ ...getErrorStyle(isRTL), justifyContent: 'center' }} role="alert">
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
            ...getPrimaryButtonStyle(),
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
            onClick={onResendOtp}
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
};

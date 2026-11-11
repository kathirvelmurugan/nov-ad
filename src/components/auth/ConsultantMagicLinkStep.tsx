import React, { useState, useRef } from 'react';
import { ShieldCheck, Stethoscope, ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import { PALETTE, DEV_OTP } from './authTypesAndUtils';

interface Props {
  isRTL: boolean;
  consultantName: string;
  center: string;
  caseId?: string;
  onVerifySuccess: () => void;
  onCancel: () => void;
  t: (ar: string, en: string) => string;
}

export const ConsultantMagicLinkStep: React.FC<Props> = ({
  isRTL,
  consultantName,
  center,
  caseId,
  onVerifySuccess,
  onCancel,
  t,
}) => {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (idx: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val;
    setOtpDigits(next);
    setError('');
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setError(t('يرجى إدخال رمز التحقق كاملاً (6 أرقام)', 'Please enter the complete 6-digit verification code'));
      return;
    }
    if (entered !== DEV_OTP && entered !== '123456') {
      setError(t('رمز التحقق غير صحيح (استخدم 123456 للاختبار)', 'Invalid code (Use 123456 for testing)'));
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onVerifySuccess();
    }, 400);
  };

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      {/* Header Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          backgroundColor: '#e6faf7',
          color: PALETTE.primary,
          fontSize: '11px',
          fontWeight: 700,
          marginBottom: '16px',
        }}
      >
        <ShieldCheck style={{ width: '14px', height: '14px' }} />
        <span>{t('رابط وصول آمن · استشاري دولي معتمد', 'Secure Magic Link · Certified Indian Consultant')}</span>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 4px 0' }}>
        {t('التحقق الأمني للاستشاري الدولي', 'International Consultant Identity Verification')}
      </h2>
      <p style={{ fontSize: '13px', color: PALETTE.textMuted, margin: '0 0 20px 0', lineHeight: 1.5 }}>
        {t(
          'تم فتح ملف الحالة عبر رابط دخول سريع. يرجى تأكيد ملكية الجهاز بتسجيل رمز التحقق لمرة واحدة لحفظ الجلسة لمدة 30 يوماً.',
          'Case dossier accessed via secure magic link. Verify device once with OTP to persist your trusted 30-day session.'
        )}
      </p>

      {/* Consultant Dossier Card */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#ccfbf1',
              color: '#0f766e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            <Stethoscope style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{consultantName}</div>
            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 style={{ width: '12px', height: '12px' }} />
              <span>{center}</span>
            </div>
          </div>
        </div>

        {caseId && (
          <div
            style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
            }}
          >
            <span style={{ color: '#64748b' }}>{t('الحالة المستهدفة:', 'Target Dossier:')}</span>
            <span style={{ fontWeight: 800, color: PALETTE.primary, fontFamily: 'monospace' }}>{caseId}</span>
          </div>
        )}
      </div>

      {/* Phone Dispatch Hint */}
      <div style={{ fontSize: '12px', color: '#475569', marginBottom: '12px', fontWeight: 600 }}>
        {t('تم إرسال رمز التحقق إلى الجوال المعتمد:', 'OTP dispatched to registered mobile:')}{' '}
        <span style={{ direction: 'ltr', display: 'inline-block', fontFamily: 'monospace', color: PALETTE.primary }}>
          +91 98•••• ••10
        </span>
      </div>

      {/* 6-digit OTP Inputs */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', direction: 'ltr', marginBottom: '16px' }}>
          {otpDigits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (otpRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: '44px',
                height: '48px',
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 800,
                borderRadius: '12px',
                border: `2px solid ${d ? PALETTE.primary : '#cbd5e1'}`,
                backgroundColor: d ? '#f0fdfa' : '#ffffff',
                outline: 'none',
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
            ⚠ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || otpDigits.some((d) => !d)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: PALETTE.primary,
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '14px',
            border: 'none',
            cursor: isLoading || otpDigits.some((d) => !d) ? 'not-allowed' : 'pointer',
            opacity: isLoading || otpDigits.some((d) => !d) ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isLoading ? (
            <span>{t('جارٍ التحقق وحفظ الجلسة...', 'Verifying & Persisting Session...')}</span>
          ) : (
            <>
              <span>{t('تأكيد الهوية ودخول ملف الحالة', 'Verify Identity & Access Case')}</span>
              {isRTL ? <ArrowLeft style={{ width: '16px' }} /> : <ArrowRight style={{ width: '16px' }} />}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '12px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          {t('إلغاء والعودة للبوابة الرئيسية', 'Cancel and return to home')}
        </button>
      </form>
    </div>
  );
};

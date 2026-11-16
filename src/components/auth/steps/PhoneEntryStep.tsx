import React, { useState } from 'react';
import {
  PALETTE,
  CountryCode,
  inputFocusHandlers,
  getInputStyle,
  getPrimaryButtonStyle,
  getErrorStyle,
  labelStyle,
} from '../authTypesAndUtils';
import { validatePhone } from '../../../utils/phoneValidation';

interface Props {
  isRTL: boolean;
  phone: string;
  country: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  error: string;
  isLoading: boolean;
  phoneRef: React.RefObject<HTMLInputElement>;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneSubmit: (e: React.FormEvent) => void;
  t: (ar: string, en: string) => string;
}

export const PhoneEntryStep: React.FC<Props> = ({
  isRTL,
  phone,
  country,
  onCountryChange,
  error,
  isLoading,
  phoneRef,
  onPhoneChange,
  onPhoneSubmit,
  t,
}) => {
  const isKSA = country === 'SA';
  const [touched, setTouched] = useState(false);

  const validation = validatePhone(phone, country);
  const isBlank = !phone.replace(/\D/g, '');
  // Silent while typing, explicit once blurred or after a failed submit.
  const shownError = validation.isValid
    ? ''
    : error || (touched ? (isRTL ? validation.issue?.ar : validation.issue?.en) || '' : '');
  const canSubmit = !isLoading && !isBlank;

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 4px 0', textAlign: isRTL ? 'right' : 'left' }}>
        {t('تسجيل الدخول الموحد لمنصة ألو', 'Unified ALO Healthcare Login')}
      </h2>
      <p style={{ fontSize: '14px', color: PALETTE.textMuted, margin: '0 0 20px 0', textAlign: isRTL ? 'right' : 'left', lineHeight: 1.6 }}>
        {t('أدخل رقم جوالك للدخول المباشر إلى بوابتك الطبية المعتمدة', 'Enter your mobile number for direct access to your verified medical portal')}
      </p>

      {/* Dual Region Country Selector: Saudi Arabia (+966) / India (+91) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <button
          type="button"
          onClick={() => onCountryChange('SA')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '12px',
            border: `1.5px solid ${isKSA ? PALETTE.primary : PALETTE.border}`,
            backgroundColor: isKSA ? PALETTE.background : PALETTE.white,
            color: isKSA ? PALETTE.primary : PALETTE.textDark,
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          aria-pressed={isKSA}
        >
          <span style={{ fontSize: '16px' }}>🇸🇦</span>
          <span>{isRTL ? 'السعودية (+966)' : 'Saudi Arabia (+966)'}</span>
        </button>

        <button
          type="button"
          onClick={() => onCountryChange('IN')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '12px',
            border: `1.5px solid ${!isKSA ? PALETTE.primary : PALETTE.border}`,
            backgroundColor: !isKSA ? PALETTE.background : PALETTE.white,
            color: !isKSA ? PALETTE.primary : PALETTE.textDark,
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          aria-pressed={!isKSA}
        >
          <span style={{ fontSize: '16px' }}>🇮🇳</span>
          <span>{isRTL ? 'الهند (+91 استشاري دولي)' : 'India (+91 Consultant)'}</span>
        </button>
      </div>

      <form onSubmit={onPhoneSubmit}>
        <label style={labelStyle}>
          {isKSA
            ? t('رقم الجوال السعودي', 'Saudi Mobile Number')
            : t('رقم الجوال الهندي (للاستشاري الدولي)', 'Indian Mobile Number (International Consultant)')}
        </label>
        <input
          id="auth-phone-input"
          ref={phoneRef}
          type="tel"
          value={phone}
          onChange={onPhoneChange}
          placeholder={isKSA ? '+966 5X XXX XXXX' : '+91 XXXXX XXXXX'}
          style={getInputStyle(isRTL)}
          autoComplete="tel"
          dir="ltr"
          onBlur={() => setTouched(true)}
          aria-invalid={!!shownError}
          aria-label={isKSA ? t('رقم الجوال السعودي', 'Saudi Mobile Number') : t('رقم الجوال الهندي', 'Indian Mobile Number')}
          {...inputFocusHandlers}
        />
        {shownError && (
          <div style={getErrorStyle(isRTL)} role="alert">
            <span>⚠</span> {shownError}
          </div>
        )}
        <button
          id="auth-phone-submit-btn"
          type="submit"
          disabled={!canSubmit}
          style={{
            ...getPrimaryButtonStyle(),
            marginTop: '16px',
            opacity: canSubmit ? 1 : 0.6,
            cursor: canSubmit ? 'pointer' : 'not-allowed'
          }}
          onMouseEnter={e => { if (canSubmit) (e.target as HTMLButtonElement).style.backgroundColor = '#00655A'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.backgroundColor = PALETTE.primary; }}
        >
          {isLoading ? (
            <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            t('متابعة وتسجيل الدخول', 'Continue to Login')
          )}
        </button>
      </form>
    </div>
  );
};

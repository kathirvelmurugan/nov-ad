import React from 'react';
import {
  PALETTE,
  validateSaudiMobile,
  inputFocusHandlers,
  getInputStyle,
  getPrimaryButtonStyle,
  getErrorStyle,
  labelStyle,
  AuthPortalTab,
} from '../authTypesAndUtils';

interface Props {
  isRTL: boolean;
  phone: string;
  error: string;
  isLoading: boolean;
  isDemoMode?: boolean;
  activePortal?: AuthPortalTab;
  phoneRef: React.RefObject<HTMLInputElement>;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneSubmit: (e: React.FormEvent) => void;
  onPersonaQuickLogin?: (persona: any) => void;
  onGuestBypass?: () => void;
  t: (ar: string, en: string) => string;
}

export const PhoneEntryStep: React.FC<Props> = ({
  isRTL,
  phone,
  error,
  isLoading,
  phoneRef,
  onPhoneChange,
  onPhoneSubmit,
  t,
}) => {

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 4px 0', textAlign: isRTL ? 'right' : 'left' }}>
        {t('تسجيل الدخول الموحد لمنصة ألو', 'Unified ALO Healthcare Login')}
      </h2>
      <p style={{ fontSize: '14px', color: PALETTE.textMuted, margin: '0 0 24px 0', textAlign: isRTL ? 'right' : 'left', lineHeight: 1.6 }}>
        {t('أدخل رقم جوالك للدخول التلقائي والمباشر إلى بوابتك المخصصة', 'Enter your mobile number for automatic direct routing to your portal')}
      </p>

      <form onSubmit={onPhoneSubmit}>
        <label style={labelStyle}>
          {t('رقم الجوال السعودي', 'Saudi Mobile Number')}
        </label>
        <input
          id="auth-phone-input"
          ref={phoneRef}
          type="tel"
          value={phone}
          onChange={onPhoneChange}
          placeholder="+966 5X XXX XXXX"
          style={getInputStyle(isRTL)}
          autoComplete="tel"
          dir="ltr"
          aria-label={t('رقم الجوال السعودي', 'Saudi Mobile Number')}
          {...inputFocusHandlers}
        />
        {error && (
          <div style={getErrorStyle(isRTL)} role="alert">
            <span>⚠</span> {error}
          </div>
        )}
        <button
          id="auth-phone-submit-btn"
          type="submit"
          disabled={isLoading || !validateSaudiMobile(phone)}
          style={{
            ...getPrimaryButtonStyle(),
            opacity: isLoading || !validateSaudiMobile(phone) ? 0.6 : 1,
            cursor: isLoading || !validateSaudiMobile(phone) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={e => { if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = '#00655A'; }}
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

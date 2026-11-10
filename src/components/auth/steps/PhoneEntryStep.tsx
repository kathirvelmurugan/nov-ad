import React from 'react';
import {
  PALETTE,
  PERSONA_PRESETS,
  PersonaPreset,
  validateSaudiMobile,
  inputFocusHandlers,
  getInputStyle,
  getPrimaryButtonStyle,
  getGuestButtonStyle,
  getErrorStyle,
  labelStyle,
} from '../authTypesAndUtils';

interface Props {
  isRTL: boolean;
  phone: string;
  error: string;
  isLoading: boolean;
  isDemoMode: boolean;
  phoneRef: React.RefObject<HTMLInputElement>;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneSubmit: (e: React.FormEvent) => void;
  onPersonaQuickLogin: (persona: PersonaPreset) => void;
  onGuestBypass: () => void;
  t: (ar: string, en: string) => string;
}

export const PhoneEntryStep: React.FC<Props> = ({
  isRTL,
  phone,
  error,
  isLoading,
  isDemoMode,
  phoneRef,
  onPhoneChange,
  onPhoneSubmit,
  onPersonaQuickLogin,
  onGuestBypass,
  t,
}) => {
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
    marginBottom: '8px',
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 4px 0', textAlign: isRTL ? 'right' : 'left' }}>
        {t('تسجيل الدخول', 'Sign In')}
      </h2>
      <p style={{ fontSize: '14px', color: PALETTE.textMuted, margin: '0 0 24px 0', textAlign: isRTL ? 'right' : 'left', lineHeight: 1.6 }}>
        {t('أدخل رقم جوالك السعودي للمتابعة إلى ALO DOCTOR', 'Enter your Saudi mobile number to continue to ALO DOCTOR')}
      </p>

      <form onSubmit={onPhoneSubmit}>
        <label style={labelStyle}>{t('رقم الجوال', 'Mobile Number')}</label>
        <input
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
                  onClick={() => onPersonaQuickLogin(persona)}
                  onKeyDown={e => e.key === 'Enter' && onPersonaQuickLogin(persona)}
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
            onClick={onGuestBypass}
            style={getGuestButtonStyle()}
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
};

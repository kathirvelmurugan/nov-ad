import React from 'react';
import {
  PALETTE,
  getInputStyle,
  getPrimaryButtonStyle,
  getSecondaryButtonStyle,
  getErrorStyle,
  labelStyle,
  inputFocusHandlers,
} from '../authTypesAndUtils';

interface Props {
  isRTL: boolean;
  pin: string;
  confirmPin: string;
  error: string;
  isLoading: boolean;
  onPinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetupSubmit: (e: React.FormEvent) => void;
  onSkipSetup: () => void;
  t: (ar: string, en: string) => string;
}

export const PinSetupStep: React.FC<Props> = ({
  isRTL,
  pin,
  confirmPin,
  error,
  isLoading,
  onPinChange,
  onConfirmPinChange,
  onSetupSubmit,
  onSkipSetup,
  t,
}) => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 4px 0', textAlign: isRTL ? 'right' : 'left' }}>
        {t('إعداد رمز الدخول السريع', 'Set Quick Access PIN')}
      </h2>
      <p style={{ fontSize: '14px', color: PALETTE.textMuted, margin: '0 0 24px 0', textAlign: isRTL ? 'right' : 'left', lineHeight: 1.6 }}>
        {t('أنشئ رمز PIN مكون من 4-6 أرقام لتسهيل الدخول مستقبلاً، أو تخطَّ هذه الخطوة', 'Create a 4-6 digit PIN for easier future access, or skip this step')}
      </p>

      <form onSubmit={onSetupSubmit}>
        <label style={labelStyle}>{t('رمز الدخول (PIN)', 'Access PIN')}</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={onPinChange}
          style={{ ...getInputStyle(isRTL), letterSpacing: '8px', textAlign: 'center', fontSize: '24px', fontWeight: 700 }}
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
          onChange={onConfirmPinChange}
          style={{ ...getInputStyle(isRTL), letterSpacing: '8px', textAlign: 'center', fontSize: '24px', fontWeight: 700 }}
          placeholder="• • • •"
          dir="ltr"
          aria-label={t('تأكيد رمز الدخول', 'Confirm Access PIN')}
          {...inputFocusHandlers}
        />

        {error && (
          <div style={getErrorStyle(isRTL)} role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || pin.length < 4 || pin !== confirmPin}
          style={{
            ...getPrimaryButtonStyle(),
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
        onClick={onSkipSetup}
        style={getSecondaryButtonStyle()}
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
};

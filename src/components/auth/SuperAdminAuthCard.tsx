import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, WHATSAPP_GREEN } from '../../theme/brandColors';

interface SuperAdminAuthCardProps {
  onSubmit?: (phone: string, passcode: string) => void;
  isLoading?: boolean;
}

const SuperAdminAuthCard: React.FC<SuperAdminAuthCardProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [phone, setPhone] = useState('+966 50 000 0001');
  const [passcode, setPasscode] = useState('');
  const [isMasked, setIsMasked] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');
  const passcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      
      const htmlDir = document.documentElement.getAttribute('dir');
      if (htmlDir === 'ltr') setDirection('ltr');

      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    if (passcodeRef.current) {
      passcodeRef.current.focus();
    }
  }, []);

  const formatSaudiPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    let normalized = digits.startsWith('966') ? digits : `966${digits.replace(/^0+/, '')}`;
    
    if (normalized.length > 12) normalized = normalized.slice(0, 12);
    
    let formatted = '+966';
    if (normalized.length > 3) formatted += ` ${normalized.slice(3, 5)}`;
    if (normalized.length > 5) formatted += ` ${normalized.slice(5, 8)}`;
    if (normalized.length > 8) formatted += ` ${normalized.slice(8, 12)}`;
    
    return formatted.trim();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSaudiPhone(e.target.value);
    setPhone(formatted);
  };

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPasscode(value);
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.length >= 4 && passcode.length <= 6 && onSubmit) {
      const rawPhone = phone.replace(/\s/g, '');
      onSubmit(rawPhone, passcode);
    }
  }, [phone, passcode, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const tealPrimary = TEAL_PRIMARY;
  const tealSecondary = TEAL_SECONDARY;
  const tealLight = TEAL_BG;
  const whatsappGreen = WHATSAPP_GREEN;

  const bgClass = isDarkMode ? 'bg-[#0f1716]' : 'bg-[#E6FAF7]';
  const cardBg = isDarkMode ? 'bg-[#1a2423] border-[#007B6E]/30' : 'bg-white border-[#00C6AE]/20';
  const textPrimary = isDarkMode ? 'text-[#E6FAF7]' : 'text-[#007B6E]';
  const textSecondary = isDarkMode ? 'text-[#00C6AE]' : 'text-[#007B6E]/70';
  const inputBg = isDarkMode ? 'bg-[#0f1716] border-[#007B6E] text-[#E6FAF7] placeholder-[#00C6AE]/50' : 'bg-[#E6FAF7]/50 border-[#00C6AE]/30 text-[#007B6E] placeholder-[#007B6E]/40';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-cairo ${bgClass} transition-colors duration-300`} dir={direction}>
      <div 
        className={`w-full max-w-md rounded-2xl shadow-xl border p-8 ${cardBg} transition-all duration-300`}
        role="region"
        aria-label="Super Admin Authentication Portal"
      >
        {/* Certification Badge */}
        <div className="flex flex-col items-center mb-8">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold tracking-wide uppercase"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(0, 123, 110, 0.15)' : tealLight,
              borderColor: tealSecondary,
              color: tealPrimary 
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span className={direction === 'rtl' ? 'ml-2' : 'mr-2'}>بوابة المشرف العام المعتمدة / Certified Super Admin Portal</span>
          </div>
          
          <h1 className={`mt-6 text-2xl font-extrabold ${textPrimary}`}>
            ALO DOCTOR v2.4
          </h1>
          <p className={`mt-1 text-sm font-medium ${textSecondary}`}>
            Saudi Edition • Secure Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Input */}
          <div className="space-y-2">
            <label 
              htmlFor="superadmin-phone" 
              className={`block text-sm font-semibold ${textPrimary}`}
            >
              {direction === 'rtl' ? 'رقم الجوال المعتمد' : 'Authorized Mobile Number'}
            </label>
            <div className="relative">
              <input
                id="superadmin-phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={handleKeyDown}
                className={`w-full px-4 py-3 rounded-xl border-2 text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${inputBg}`}
                style={{ 
                  fontFamily: 'Cairo, sans-serif',
                  direction: 'ltr',
                  textAlign: direction === 'rtl' ? 'right' : 'left',
                  // @ts-ignore
                  '--tw-ring-color': tealSecondary 
                }}
                placeholder="+966 5X XXX XXXX"
                autoComplete="tel"
                aria-required="true"
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full"
                style={{ 
                  [direction === 'rtl' ? 'left' : 'right']: '12px',
                  backgroundColor: `${tealPrimary}15` 
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tealPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Passcode Input */}
          <div className="space-y-2">
            <label 
              htmlFor="superadmin-passcode" 
              className={`block text-sm font-semibold ${textPrimary}`}
            >
              {direction === 'rtl' ? 'رمز الدخول (4-6 أرقام)' : 'Access Passcode (4-6 Digits)'}
            </label>
            <div className="relative">
              <input
                ref={passcodeRef}
                id="superadmin-passcode"
                type={isMasked ? 'password' : 'text'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={passcode}
                onChange={handlePasscodeChange}
                onKeyDown={handleKeyDown}
                className={`w-full px-4 py-3 rounded-xl border-2 text-2xl font-bold tracking-[0.5em] text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${inputBg}`}
                style={{ 
                  fontFamily: 'Cairo, sans-serif',
                  // @ts-ignore
                  '--tw-ring-color': tealSecondary 
                }}
                placeholder="••••••"
                autoComplete="one-time-code"
                aria-required="true"
                aria-describedby="passcode-hint"
              />
              <button
                type="button"
                onClick={() => setIsMasked(!isMasked)}
                className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00C6AE]`}
                style={{ [direction === 'rtl' ? 'left' : 'right']: '8px' }}
                aria-label={isMasked ? 'Show passcode' : 'Hide passcode'}
                tabIndex={-1}
              >
                {isMasked ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tealSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tealSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            <p id="passcode-hint" className={`text-xs font-medium ${textSecondary} text-center mt-1`}>
              {direction === 'rtl' ? 'أدخل رمز PIN المكون من 4 إلى 6 أرقام' : 'Enter your 4 to 6 digit PIN code'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || passcode.length < 4 || passcode.length > 6}
            className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-offset-2"
            style={{ 
              backgroundColor: tealPrimary,
              fontFamily: 'Cairo, sans-serif',
              // @ts-ignore
              '--tw-ring-color': `${tealSecondary}60`
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = tealSecondary)}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = tealPrimary)}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {direction === 'rtl' ? 'جاري التحقق...' : 'Verifying...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {direction === 'rtl' ? 'تسجيل الدخول كمشرف عام' : 'Authenticate as Super Admin'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
            )}
          </button>
        </form>

        {/* Footer Operations Lead Attribution */}
        <div className="mt-8 pt-6 border-t flex flex-col items-center gap-2" style={{ borderColor: isDarkMode ? 'rgba(0, 198, 174, 0.15)' : 'rgba(0, 123, 110, 0.1)' }}>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: whatsappGreen }}
              aria-hidden="true"
            />
            <span className={`text-xs font-semibold ${textSecondary}`}>
              System Status: Operational
            </span>
          </div>
          <p className={`text-[10px] font-medium tracking-wider uppercase ${textSecondary} opacity-70`}>
            Maintained by Rehmaan (Operations Lead)
          </p>
          <p className={`text-[10px] font-medium ${textSecondary} opacity-50`}>
            ALO DOCTOR v2.4 Saudi Edition &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAuthCard;
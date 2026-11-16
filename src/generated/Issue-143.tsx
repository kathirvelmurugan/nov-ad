import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CountryOption {
  code: string;
  dial: string;
  flag: string;
  labelAr: string;
  labelEn: string;
}

const COUNTRIES: CountryOption[] = [
  { code: 'SA', dial: '+966', flag: '🇸🇦', labelAr: 'المملكة العربية السعودية', labelEn: 'Saudi Arabia' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', labelAr: 'الهند', labelEn: 'India' },
];

interface PhoneEntryStepProps {
  lang: 'ar' | 'en';
  persona: string;
  onPhoneSubmit: (payload: { country: CountryOption; phone: string }) => void;
}

export const PhoneEntryStep: React.FC<PhoneEntryStepProps> = ({ lang, persona, onPhoneSubmit }) => {
  const isRtl = lang === 'ar';
  const defaultCountry = COUNTRIES.find(c => c.code === 'SA') || COUNTRIES[0];
  
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(defaultCountry);
  const [phone, setPhone] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPhoneNumber = (value: string, countryCode: string): string => {
    const digits = value.replace(/\D/g, '');
    if (countryCode === 'SA') {
      return digits.slice(0, 9);
    }
    if (countryCode === 'IN') {
      return digits.slice(0, 10);
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, selectedCountry.code);
    setPhone(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const minLength = selectedCountry.code === 'SA' ? 9 : 10;
    if (phone.length >= minLength) {
      onPhoneSubmit({ country: selectedCountry, phone });
    }
  };

  const t = {
    title: isRtl ? 'أدخل رقم هاتفك' : 'Enter your phone number',
    subtitle: isRtl ? `مرحباً بك في ألو دكتور (${persona})` : `Welcome to Alo Doctor (${persona})`,
    placeholder: isRtl ? 'رقم الهاتف' : 'Phone number',
    continueBtn: isRtl ? 'متابعة' : 'Continue',
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, sans-serif', width: '100%', maxWidth: '420px', margin: '0 auto' }}>
      <h2 style={{ color: '#007B6E', fontSize: '24px', fontWeight: 700, marginBottom: '8px', textAlign: isRtl ? 'right' : 'left' }}>
        {t.title}
      </h2>
      <p style={{ color: '#555', fontSize: '14px', marginBottom: '32px', textAlign: isRtl ? 'right' : 'left' }}>
        {t.subtitle}
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div ref={dropdownRef} style={{ position: 'relative', width: '140px' }}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #E6FAF7',
              borderRadius: '8px',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif',
              fontSize: '16px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#00C6AE'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E6FAF7'}
          >
            <span>{selectedCountry.flag} {selectedCountry.dial}</span>
            <span style={{ fontSize: '10px' }}>▼</span>
          </button>

          {isDropdownOpen && (
            <ul
              role="listbox"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: '#fff',
                border: '1px solid #E6FAF7',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,123,110,0.1)',
                listStyle: 'none',
                padding: 0,
                margin: '4px 0 0 0',
                zIndex: 50,
                overflow: 'hidden'
              }}
            >
              {COUNTRIES.map((country) => (
                <li
                  key={country.code}
                  role="option"
                  aria-selected={selectedCountry.code === country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setIsDropdownOpen(false);
                    setPhone(formatPhoneNumber(phone, country.code));
                    inputRef.current?.focus();
                  }}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: selectedCountry.code === country.code ? '#E6FAF7' : 'transparent',
                    fontFamily: 'Cairo, sans-serif',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E6FAF7'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedCountry.code === country.code ? '#E6FAF7' : 'transparent'}
                >
                  <span>{country.flag}</span>
                  <span style={{ flex: 1 }}>{isRtl ? country.labelAr : country.labelEn}</span>
                  <span style={{ color: '#007B6E', fontWeight: 600 }}>{country.dial}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          ref={inputRef}
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          dir="ltr"
          aria-label={t.placeholder}
          style={{
            flex: 1,
            padding: '12px',
            border: '2px solid #E6FAF7',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: 'Cairo, sans-serif',
            outline: 'none',
            transition: 'border-color 0.2s',
            textAlign: isRtl ? 'right' : 'left'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#00C6AE'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#E6FAF7'}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={phone.length < (selectedCountry.code === 'SA' ? 9 : 10)}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: phone.length >= (selectedCountry.code === 'SA' ? 9 : 10) ? '#007B6E' : '#B2DFDB',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'Cairo, sans-serif',
          cursor: phone.length >= (selectedCountry.code === 'SA' ? 9 : 10) ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.2s'
        }}
      >
        {t.continueBtn}
      </button>
    </div>
  );
};


interface OtpVerificationStepProps {
  lang: 'ar' | 'en';
  phone: string;
  countryDial: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
}

export const OtpVerificationStep: React.FC<OtpVerificationStepProps> = ({
  lang,
  phone,
  countryDial,
  onVerify,
  onResend,
  onBack
}) => {
  const isRtl = lang === 'ar';
  const OTP_LENGTH = 6;
  const DEV_BYPASS_CODE = '123456';
  const RESEND_COOLDOWN = 60;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const processVerification = useCallback((code: string) => {
    setIsVerifying(true);
    if (code === DEV_BYPASS_CODE) {
      setTimeout(() => {
        onVerify(code);
        setIsVerifying(false);
      }, 400);
      return;
    }
    onVerify(code);
    setIsVerifying(false);
  }, [onVerify]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    const joined = newOtp.join('');
    if (joined.length === OTP_LENGTH) {
      processVerification(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft') {
      if (isRtl && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
      if (!isRtl && index > 0) inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight') {
      if (isRtl && index > 0) inputsRef.current[index - 1]?.focus();
      if (!isRtl && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedData) return;

    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();

    if (pastedData.length === OTP_LENGTH) {
      processVerification(pastedData);
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
      onResend();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const t = {
    title: isRtl ? 'رمز التحقق' : 'Verification Code',
    subtitle: isRtl ? `أرسلنا رمزاً مكوناً من 6 أرقام إلى` : `We sent a 6-digit code to`,
    resend: isRtl ? 'إعادة إرسال الرمز' : 'Resend Code',
    back: isRtl ? 'تغيير الرقم' : 'Change Number',
    verifying: isRtl ? 'جاري التحقق...' : 'Verifying...',
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, sans-serif', width: '100%', maxWidth: '420px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#007B6E',
          fontFamily: 'Cairo, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }}>←</span>
        {t.back}
      </button>

      <h2 style={{ color: '#007B6E', fontSize: '24px', fontWeight: 700, marginBottom: '8px', textAlign: isRtl ? 'right' : 'left' }}>
        {t.title}
      </h2>
      
      <p style={{ color: '#555', fontSize: '14px', marginBottom: '32px', textAlign: isRtl ? 'right' : 'left' }}>
        {t.subtitle} <span dir="ltr" style={{ fontWeight: 700, color: '#007B6E' }}>{countryDial} {phone}</span>
      </p>

      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '32px', 
          direction: 'ltr',
          justifyContent: 'center' 
        }}
        onPaste={handlePaste}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isVerifying}
            aria-label={`${isRtl ? 'رقم' : 'Digit'} ${index + 1}`}
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'Cairo, sans-serif',
              border: otp[index] ? '2px solid #00C6AE' : '2px solid #E6FAF7',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: '#fff',
              color: '#007B6E',
              transition: 'all 0.2s ease',
              caretColor: 'transparent'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#007B6E';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 198, 174, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = otp[index] ? '#00C6AE' : '#E6FAF7';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        ))}
      </div>

      {isVerifying && (
        <div style={{ textAlign: 'center', marginBottom: '24px', color: '#007B6E', fontWeight: 600 }}>
          {t.verifying}
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        {timer > 0 ? (
          <p style={{ color: '#666', fontSize: '14px', fontFamily: 'Cairo, sans-serif' }}>
            {isRtl ? 'إعادة الإرسال بعد' : 'Resend available in'}{' '}
            <span style={{ color: '#007B6E', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timer)}
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: '#25D366',
              fontFamily: 'Cairo, sans-serif',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E6FAF7'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t.resend}
          </button>
        )}
      </div>
    </div>
  );
};
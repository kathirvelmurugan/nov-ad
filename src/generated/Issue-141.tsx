import React, { useState, useEffect, useCallback } from 'react';

interface Tenant {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface AuthSuccessPayload {
  phone: string;
  roleCode: string;
  hospitalId: string;
  fullName: string;
}

interface HospitalStaffLoginFormProps {
  onSuccess: (payload: AuthSuccessPayload) => void;
  onFirstTimeActivationRequired: (phone: string) => void;
  apiClient: {
    login: (phone: string, pin: string, tenantId: string) => Promise<any>;
    fetchTenants: () => Promise<Tenant[]>;
  };
  currentLang: 'ar' | 'en';
}

const TEAL_PRIMARY = '#007B6E';
const TEAL_ACCENT = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';
const ERROR_RED = '#D32F2F';

export const HospitalStaffLoginForm: React.FC<HospitalStaffLoginFormProps> = ({
  onSuccess,
  onFirstTimeActivationRequired,
  apiClient,
  currentLang
}) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTenants, setIsFetchingTenants] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const isRtl = currentLang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const fontFamily = 'Cairo, sans-serif';

  const loadTenants = useCallback(async () => {
    try {
      setIsFetchingTenants(true);
      const fetchedTenants = await apiClient.fetchTenants();
      setTenants(fetchedTenants);
      if (fetchedTenants.length > 0 && !selectedTenantId) {
        setSelectedTenantId(fetchedTenants[0].id);
      }
    } catch (err) {
      setErrorMessage(
        isRtl 
          ? 'تعذر تحميل قائمة المستشفيات. يرجى المحاولة لاحقاً.' 
          : 'Failed to load hospital list. Please try again later.'
      );
    } finally {
      setIsFetchingTenants(false);
    }
  }, [apiClient, isRtl, selectedTenantId]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!phone || !pin || !selectedTenantId) {
      setErrorMessage(
        isRtl 
          ? 'يرجى تعبئة جميع الحقول المطلوبة.' 
          : 'Please fill in all required fields.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.login(phone, pin, selectedTenantId);

      if (response?.requiresActivation) {
        onFirstTimeActivationRequired(phone);
        return;
      }

      if (response?.user) {
        onSuccess({
          phone,
          roleCode: response.user.roleCode,
          hospitalId: response.user.hospitalId,
          fullName: response.user.fullName
        });
      }
    } catch (err: any) {
      const fallbackMsg = isRtl 
        ? 'رقم الهاتف أو رمز الدخول غير صحيح.' 
        : 'Invalid phone number or PIN.';
      
      setErrorMessage(
        err?.response?.data?.message || err?.message || fallbackMsg
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        direction: dir,
        fontFamily,
        backgroundColor: TEAL_BG,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
          border: `1px solid ${TEAL_ACCENT}20`
        }}
        noValidate
      >
        <h2
          style={{
            color: TEAL_PRIMARY,
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
            textAlign: isRtl ? 'right' : 'left'
          }}
        >
          {isRtl ? 'دخول الكادر الطبي' : 'Hospital Staff Login'}
        </h2>
        <p
          style={{
            color: '#666666',
            fontSize: '14px',
            marginBottom: '24px',
            textAlign: isRtl ? 'right' : 'left'
          }}
        >
          {isRtl ? 'ألو دكتور - الإصدار السعودي 2.4' : 'ALO DOCTOR - Saudi Edition v2.4'}
        </p>

        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              backgroundColor: '#FDEDED',
              color: ERROR_RED,
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: 600,
              border: `1px solid ${ERROR_RED}30`,
              textAlign: isRtl ? 'right' : 'left'
            }}
          >
            {errorMessage}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="tenant-select"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: TEAL_PRIMARY,
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            {isRtl ? 'المستشفى' : 'Hospital'}
          </label>
          <select
            id="tenant-select"
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            disabled={isFetchingTenants || isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${TEAL_ACCENT}`,
              backgroundColor: isFetchingTenants ? '#F5F5F5' : '#FFFFFF',
              fontFamily,
              fontSize: '16px',
              color: '#333333',
              outline: 'none',
              direction: dir,
              cursor: isFetchingTenants ? 'not-allowed' : 'pointer'
            }}
            aria-label={isRtl ? 'اختر المستشفى' : 'Select Hospital'}
          >
            {isFetchingTenants ? (
              <option value="">
                {isRtl ? 'جاري التحميل...' : 'Loading...'}
              </option>
            ) : (
              tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {isRtl ? tenant.nameAr : tenant.nameEn}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="staff-phone"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: TEAL_PRIMARY,
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            {isRtl ? 'رقم الجوال' : 'Phone Number'}
          </label>
          <input
            id="staff-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
            placeholder={isRtl ? '+9665XXXXXXXX' : '+9665XXXXXXXX'}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${TEAL_ACCENT}`,
              fontFamily,
              fontSize: '16px',
              color: '#333333',
              outline: 'none',
              direction: 'ltr',
              textAlign: isRtl ? 'right' : 'left',
              boxSizing: 'border-box'
            }}
            aria-required="true"
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label
            htmlFor="staff-pin"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: TEAL_PRIMARY,
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            {isRtl ? 'رمز الدخول' : 'PIN Code'}
          </label>
          <input
            id="staff-pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="••••"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${TEAL_ACCENT}`,
              fontFamily,
              fontSize: '16px',
              letterSpacing: '4px',
              color: '#333333',
              outline: 'none',
              direction: 'ltr',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isFetchingTenants}
          style={{
            width: '100%',
            padding: '14px 24px',
            backgroundColor: isLoading ? TEAL_ACCENT : TEAL_PRIMARY,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontFamily,
            fontSize: '16px',
            fontWeight: 700,
            cursor: isLoading || isFetchingTenants ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease, transform 0.1s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseDown={(e) => {
            if (!isLoading && !isFetchingTenants) {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
            }
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          {isLoading ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
              </svg>
              {isRtl ? 'جاري التحقق...' : 'Verifying...'}
            </>
          ) : (
            isRtl ? 'تسجيل الدخول' : 'Sign In'
          )}
        </button>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          input:focus, select:focus {
            border-color: ${TEAL_PRIMARY} !important;
            box-shadow: 0 0 0 3px ${TEAL_ACCENT}30 !important;
          }
          button:hover:not(:disabled) {
            background-color: ${TEAL_ACCENT} !important;
          }
        `}</style>
      </form>
    </div>
  );
};


interface FirstTimeActivationStepProps {
  phone: string;
  apiClient: {
    updateUserPin: (phone: string, pin: string) => Promise<any>;
  };
  onActivationSuccess: (payload: AuthSuccessPayload) => void;
  onBack: () => void;
  currentLang: 'ar' | 'en';
}

export const FirstTimeActivationStep: React.FC<FirstTimeActivationStepProps> = ({
  phone,
  apiClient,
  onActivationSuccess,
  onBack,
  currentLang
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [confirmPinDigits, setConfirmPinDigits] = useState<string[]>(['', '', '', '']);
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isRtl = currentLang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const fontFamily = 'Cairo, sans-serif';

  const inputRefs = {
    create: Array.from({ length: 4 }, () => React.createRef<HTMLInputElement>()),
    confirm: Array.from({ length: 4 }, () => React.createRef<HTMLInputElement>())
  };

  const handleDigitChange = (
    index: number,
    value: string,
    isConfirm: boolean
  ) => {
    if (!/^[0-9]?$/.test(value)) return;

    const setter = isConfirm ? setConfirmPinDigits : setPinDigits;
    const refs = isConfirm ? inputRefs.confirm : inputRefs.create;

    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    setErrorMessage('');

    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    isConfirm: boolean
  ) => {
    const refs = isConfirm ? inputRefs.confirm : inputRefs.create;
    const digits = isConfirm ? confirmPinDigits : pinDigits;

    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    isConfirm: boolean
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!pastedData) return;

    const setter = isConfirm ? setConfirmPinDigits : setPinDigits;
    const refs = isConfirm ? inputRefs.confirm : inputRefs.create;
    const newDigits = pastedData.split('');

    setter((prev) => {
      const next = [...prev];
      newDigits.forEach((digit, i) => {
        if (i < 4) next[i] = digit;
      });
      return next;
    });

    const focusIndex = Math.min(newDigits.length, 3);
    refs[focusIndex].current?.focus();
  };

  const handleCreateNext = () => {
    const pinString = pinDigits.join('');
    if (pinString.length !== 4) {
      setErrorMessage(
        isRtl ? 'يرجى إدخال رمز مكون من 4 أرقام.' : 'Please enter a 4-digit PIN.'
      );
      return;
    }
    setStep('confirm');
    setErrorMessage('');
    setTimeout(() => inputRefs.confirm[0].current?.focus(), 100);
  };

  const handleConfirmSubmit = async () => {
    const pinString = pinDigits.join('');
    const confirmString = confirmPinDigits.join('');

    if (confirmString.length !== 4) {
      setErrorMessage(
        isRtl ? 'يرجى إدخال رمز التأكيد المكون من 4 أرقام.' : 'Please enter the 4-digit confirmation PIN.'
      );
      return;
    }

    if (pinString !== confirmString) {
      setErrorMessage(
        isRtl ? 'رمز الدخول وتأكيده غير متطابقين.' : 'PIN and confirmation do not match.'
      );
      setConfirmPinDigits(['', '', '', '']);
      setTimeout(() => inputRefs.confirm[0].current?.focus(), 100);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await apiClient.updateUserPin(phone, pinString);

      if (response?.user) {
        onActivationSuccess({
          phone,
          roleCode: response.user.roleCode,
          hospitalId: response.user.hospitalId,
          fullName: response.user.fullName
        });
      } else {
        onActivationSuccess({
          phone,
          roleCode: response?.roleCode || 'STAFF',
          hospitalId: response?.hospitalId || '',
          fullName: response?.fullName || ''
        });
      }
    } catch (err: any) {
      const fallbackMsg = isRtl
        ? 'فشل تفعيل الحساب. يرجى المحاولة مرة أخرى.'
        : 'Activation failed. Please try again.';
      
      setErrorMessage(
        err?.response?.data?.message || err?.message || fallbackMsg
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPinInput = (
    digits: string[],
    refs: React.RefObject<HTMLInputElement>[],
    isConfirm: boolean,
    disabled: boolean
  ) => (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        direction: 'ltr',
        margin: '24px 0'
      }}
    >
      {digits.map((digit, index) => (
        <input
          key={`${isConfirm ? 'confirm' : 'create'}-${index}`}
          ref={refs[index] as React.RefObject<HTMLInputElement>}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleDigitChange(index, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
          onPaste={(e) => handlePaste(e, isConfirm)}
          disabled={disabled || isLoading}
          aria-label={`${isConfirm ? 'Confirm ' : ''}PIN digit ${index + 1}`}
          style={{
            width: '56px',
            height: '64px',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 700,
            fontFamily,
            borderRadius: '12px',
            border: `2px solid ${errorMessage ? ERROR_RED : TEAL_ACCENT}`,
            backgroundColor: disabled ? '#F5F5F5' : '#FFFFFF',
            color: TEAL_PRIMARY,
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            caretColor: 'transparent'
          }}
          onFocus={(e) => {
            if (!errorMessage) {
              e.target.style.borderColor = TEAL_PRIMARY;
              e.target.style.boxShadow = `0 0 0 3px ${TEAL_ACCENT}40`;
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = errorMessage ? ERROR_RED : TEAL_ACCENT;
            e.target.style.boxShadow = 'none';
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      style={{
        direction: dir,
        fontFamily,
        backgroundColor: TEAL_BG,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
          border: `1px solid ${TEAL_ACCENT}20`
        }}
      >
        <button
          onClick={onBack}
          disabled={isLoading}
          aria-label={isRtl ? 'العودة' : 'Go back'}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            padding: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            color: TEAL_PRIMARY,
            fontFamily,
            fontSize: '14px',
            fontWeight: 600,
            gap: '4px',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {isRtl ? 'العودة' : 'Back'}
        </button>

        <h2
          style={{
            color: TEAL_PRIMARY,
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '8px',
            textAlign: isRtl ? 'right' : 'left'
          }}
        >
          {isRtl ? 'تفعيل الحساب لأول مرة' : 'First-Time Activation'}
        </h2>

        <p
          style={{
            color: '#666666',
            fontSize: '14px',
            marginBottom: '8px',
            textAlign: isRtl ? 'right' : 'left'
          }}
        >
          {isRtl ? 'رقم الجوال:' : 'Phone:'}{' '}
          <span style={{ direction: 'ltr', display: 'inline-block', fontWeight: 600, color: '#333' }}>
            {phone}
          </span>
        </p>

        <p
          style={{
            color: '#555555',
            fontSize: '15px',
            marginBottom: '24px',
            textAlign: isRtl ? 'right' : 'left',
            lineHeight: 1.6
          }}
        >
          {step === 'create'
            ? isRtl
              ? 'أنشئ رمز دخول مكون من 4 أرقام لتأمين حسابك.'
              : 'Create a 4-digit PIN to secure your account.'
            : isRtl
            ? 'أعد إدخال رمز الدخول للتأكيد.'
            : 'Re-enter your PIN to confirm.'}
        </p>

        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              backgroundColor: '#FDEDED',
              color: ERROR_RED,
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: 600,
              border: `1px solid ${ERROR_RED}30`,
              textAlign: isRtl ? 'right' : 'left'
            }}
          >
            {errorMessage}
          </div>
        )}

        {step === 'create' ? (
          <>
            {renderPinInput(pinDigits, inputRefs.create, false, false)}
            <button
              onClick={handleCreateNext}
              disabled={pinDigits.some((d) => !d) || isLoading}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: pinDigits.some((d) => !d) ? '#CCCCCC' : TEAL_PRIMARY,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontFamily,
                fontSize: '16px',
                fontWeight: 700,
                cursor: pinDigits.some((d) => !d) || isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                marginTop: '8px'
              }}
            >
              {isRtl ? 'التالي' : 'Next'}
            </button>
          </>
        ) : (
          <>
            {renderPinInput(confirmPinDigits, inputRefs.confirm, true, false)}
            <button
              onClick={handleConfirmSubmit}
              disabled={confirmPinDigits.some((d) => !d) || isLoading}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: confirmPinDigits.some((d) => !d) || isLoading ? '#CCCCCC' : WHATSAPP_GREEN,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontFamily,
                fontSize: '16px',
                fontWeight: 700,
                cursor: confirmPinDigits.some((d) => !d) || isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
                  </svg>
                  {isRtl ? 'جاري التفعيل...' : 'Activating...'}
                </>
              ) : (
                isRtl ? 'تأكيد وتفعيل' : 'Confirm & Activate'
              )}
            </button>

            <button
              onClick={() => {
                setStep('create');
                setConfirmPinDigits(['', '', '', '']);
                setErrorMessage('');
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: TEAL_PRIMARY,
                border: `1px solid ${TEAL_ACCENT}`,
                borderRadius: '8px',
                fontFamily,
                fontSize: '14px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '12px',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isRtl ? 'تغيير رمز الدخول' : 'Change PIN'}
            </button>
          </>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};
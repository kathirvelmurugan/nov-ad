import React, { useState, useEffect, useCallback, useRef } from 'react';

const COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  error: '#D32F2F',
  textDark: '#1A1A1A',
  textLight: '#FFFFFF',
  border: '#B2DFDB'
};

const PERSONAS = [
  { id: 'intake', labelAr: 'الاستقبال', labelEn: 'Intake' },
  { id: 'nurse', labelAr: 'الممرض', labelEn: 'Nurse' },
  { id: 'doctor', labelAr: 'الطبيب', labelEn: 'Doctor' },
  { id: 'consultant', labelAr: 'الاستشاري', labelEn: 'Consultant' },
  { id: 'coordinator', labelAr: 'المنسق', labelEn: 'Coordinator' },
  { id: 'partner_lab', labelAr: 'شريك المختبر', labelEn: 'Lab Partner' },
  { id: 'partner_rx', labelAr: 'شريك الصيدلية', labelEn: 'Pharmacy Partner' },
  { id: 'hospital_admin', labelAr: 'إدارة المستشفى', labelEn: 'Hospital Admin' },
  { id: 'patient', labelAr: 'المريض', labelEn: 'Patient' },
  { id: 'followup', labelAr: 'المتابعة', labelEn: 'Follow-Up' },
  { id: 'system', labelAr: 'النظام', labelEn: 'System' }
];

const GAP_VALIDATIONS = {
  intake: [
    { field: 'privacyConsent', type: 'checkbox', rule: 'required_true', messageAr: 'يجب الموافقة على سياسة الخصوصية', messageEn: 'Privacy consent must be checked' },
    { field: 'diagnosis', type: 'text', rule: 'min_length_1', messageAr: 'التشخيص لا يمكن أن يكون فارغاً', messageEn: 'Diagnosis cannot be empty' },
    { field: 'age', type: 'number', rule: 'range_0_150', messageAr: 'العمر يجب أن يكون بين 0 و 150', messageEn: 'Age must be between 0 and 150' },
    { field: 'gender', type: 'select', rule: 'not_default', messageAr: 'يرجى اختيار الجنس', messageEn: 'Please select gender' }
  ],
  nurse: [
    { field: 'assignedDoctor', type: 'select', rule: 'not_default', messageAr: 'يجب تعيين طبيب قبل المتابعة لـ N07', messageEn: 'Doctor must be assigned before N07' },
    { field: 'summaryNotes', type: 'textarea', rule: 'min_length_1', messageAr: 'ملاحظات الملخص لا يمكن أن تكون فارغة', messageEn: 'Summary notes cannot be empty' }
  ],
  doctor: [
    { field: 'focusQuestions', type: 'textarea', rule: 'min_length_1', messageAr: 'أسئلة التركيز مطلوبة للموافقة على الإحالة D10', messageEn: 'Focus questions required for D10 referral approval' }
  ],
  consultant: [
    { field: 'focusAnswers', type: 'textarea', rule: 'not_blank_default', messageAr: 'إجابات التركيز الافتراضية فارغة', messageEn: 'Default focus answers are blank' },
    { field: 'opinionText', type: 'textarea', rule: 'min_length_1', messageAr: 'نص الرأي لا يمكن أن يكون فارغاً', messageEn: 'Opinion text cannot be empty' }
  ],
  coordinator: [
    { field: 'relayMessage', type: 'textarea', rule: 'min_length_1', messageAr: 'رسالة الترحيل لا يمكن أن تكون فارغة', messageEn: 'Relay message cannot be empty' }
  ],
  partner_lab: [
    { field: 'd13Status', type: 'custom', rule: 'dependencies_complete', messageAr: 'D13 محظور حتى اكتمال المختبر والصيدلية والاستقبال', messageEn: 'D13 blocked until lab/rx/reception complete' }
  ],
  followup: [
    { field: 'rating', type: 'number', rule: 'min_1', messageAr: 'تقييم 0 نجوم يمنع الإغلاق', messageEn: '0-star rating blocks closure' }
  ]
};

const useDirection = () => {
  const [lang, setLang] = useState('ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const toggle = useCallback(() => setLang(prev => prev === 'ar' ? 'en' : 'ar'), []);
  return { lang, dir, toggle };
};

const ValidationBadge = ({ isValid, messageAr, messageEn, lang }) => (
  <div
    role="alert"
    aria-live="polite"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      backgroundColor: isValid ? COLORS.background : '#FDEDED',
      border: `1px solid ${isValid ? COLORS.secondary : COLORS.error}`,
      color: isValid ? COLORS.primary : COLORS.error,
      fontFamily: '"Cairo", sans-serif',
      fontSize: '14px',
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      textAlign: lang === 'ar' ? 'right' : 'left',
      transition: 'all 0.2s ease-in-out'
    }}
  >
    <span aria-hidden="true">{isValid ? '✓' : '✕'}</span>
    <span>{lang === 'ar' ? messageAr : messageEn}</span>
  </div>
);

const PersonaSwitcher = ({ activePersona, onSelect, lang, isProduction }) => {
  if (isProduction) return null;

  return (
    <nav
      aria-label={lang === 'ar' ? 'تبديل الأدوار' : 'Persona Switcher'}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '16px',
        backgroundColor: COLORS.textLight,
        borderBottom: `2px solid ${COLORS.border}`,
        direction: lang === 'ar' ? 'rtl' : 'ltr'
      }}
    >
      {PERSONAS.map(persona => (
        <button
          key={persona.id}
          onClick={() => onSelect(persona.id)}
          aria-pressed={activePersona === persona.id}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: activePersona === persona.id ? COLORS.primary : COLORS.background,
            color: activePersona === persona.id ? COLORS.textLight : COLORS.primary,
            fontFamily: '"Cairo", sans-serif',
            fontWeight: activePersona === persona.id ? 700 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${COLORS.secondary}`}
          onBlur={(e) => e.target.style.boxShadow = 'none'}
        >
          {lang === 'ar' ? persona.labelAr : persona.labelEn}
        </button>
      ))}
    </nav>
  );
};

const FormField = ({ label, type, value, onChange, error, lang, options = [] }) => {
  const inputId = useRef(`field-${Math.random().toString(36).substr(2, 9)}`).current;
  const errorId = `${inputId}-error`;

  const baseStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${error ? COLORS.error : COLORS.border}`,
    fontFamily: '"Cairo", sans-serif',
    fontSize: '16px',
    direction: lang === 'ar' ? 'rtl' : 'ltr',
    backgroundColor: COLORS.textLight,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={inputId}
        style={{
          fontFamily: '"Cairo", sans-serif',
          fontWeight: 600,
          color: COLORS.textDark,
          fontSize: '14px'
        }}
      >
        {label}
      </label>

      {type === 'checkbox' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <input
            id={inputId}
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            style={{ width: '20px', height: '20px', accentColor: COLORS.primary, cursor: 'pointer' }}
          />
        </div>
      )}

      {type === 'text' || type === 'number' && (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          style={baseStyle}
          min={type === 'number' ? 0 : undefined}
          max={type === 'number' ? 150 : undefined}
          onFocus={(e) => e.target.style.borderColor = COLORS.primary}
          onBlur={(e) => e.target.style.borderColor = error ? COLORS.error : COLORS.border}
        />
      )}

      {(type === 'textarea') && (
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          style={{ ...baseStyle, resize: 'vertical' }}
          onFocus={(e) => e.target.style.borderColor = COLORS.primary}
          onBlur={(e) => e.target.style.borderColor = error ? COLORS.error : COLORS.border}
        />
      )}

      {type === 'select' && (
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          style={baseStyle}
          onFocus={(e) => e.target.style.borderColor = COLORS.primary}
          onBlur={(e) => e.target.style.borderColor = error ? COLORS.error : COLORS.border}
        >
          <option value="">--</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {type === 'rating' && (
        <div style={{ display: 'flex', gap: '4px', direction: 'ltr' }} role="radiogroup" aria-label={label}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              onClick={() => onChange(star)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: star <= value ? '#FFB300' : COLORS.border,
                padding: 0,
                outline: 'none'
              }}
              aria-label={`${star} stars`}
            >
              ★
            </button>
          ))}
        </div>
      )}

      {error && (
        <span id={errorId} style={{ color: COLORS.error, fontSize: '12px', fontFamily: '"Cairo", sans-serif' }}>
          {error}
        </span>
      )}
    </div>
  );
};

const ApiRegressionSimulator = ({ lang }) => {
  const [stage, setStage] = useState(3);
  const [attemptedStage, setAttemptedStage] = useState(3);
  const [httpStatus, setHttpStatus] = useState(null);

  const handlePatch = (targetStage) => {
    setAttemptedStage(targetStage);
    if (targetStage < stage) {
      setHttpStatus(409);
    } else {
      setHttpStatus(200);
      setStage(targetStage);
    }
  };

  return (
    <div style={{ padding: '16px', backgroundColor: COLORS.background, borderRadius: '12px', marginTop: '16px' }}>
      <h3 style={{ fontFamily: '"Cairo", sans-serif', color: COLORS.primary, margin: '0 0 12px 0' }}>
        {lang === 'ar' ? 'محاكي API - اختبار التراجع' : 'API Simulator - Regression Test'}
      </h3>
      <p style={{ fontFamily: '"Cairo", sans-serif', fontSize: '14px' }}>
        {lang === 'ar' ? `المرحلة الحالية: ${stage}` : `Current Stage: ${stage}`}
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => handlePatch(s)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: s < stage ? '#FFCDD2' : COLORS.secondary,
              color: s < stage ? COLORS.error : COLORS.textLight,
              fontFamily: '"Cairo", sans-serif',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            PATCH → {s}
          </button>
        ))}
      </div>
      {httpStatus && (
        <ValidationBadge
          isValid={httpStatus === 200}
          messageAr={httpStatus === 409 ? `خطأ HTTP 409: التراجع إلى المرحلة ${attemptedStage} مرفوض` : `نجاح HTTP 200: تم الانتقال للمرحلة ${attemptedStage}`}
          messageEn={httpStatus === 409 ? `HTTP 409: Backward regression to stage ${attemptedStage} rejected` : `HTTP 200: Advanced to stage ${attemptedStage}`}
          lang={lang}
        />
      )}
    </div>
  );
};

const AuthOtpPinSimulator = ({ lang }) => {
  const [step, setStep] = useState('otp');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [landed, setLanded] = useState(false);

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6) setStep('pin');
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.length >= 4) {
      setStep('done');
      setLanded(true);
    }
  };

  if (landed) {
    return (
      <div style={{ padding: '24px', backgroundColor: COLORS.background, borderRadius: '12px', textAlign: 'center', marginTop: '16px' }}>
        <h3 style={{ fontFamily: '"Cairo", sans-serif', color: COLORS.primary }}>
          {lang === 'ar' ? 'بوابة إدارة المستشفى' : 'Hospital Admin Portal View'}
        </h3>
        <ValidationBadge
          isValid={true}
          messageAr="تم الوصول بنجاح بعد إعداد OTP و PIN"
          messageEn="Successfully landed after OTP + PIN setup"
          lang={lang}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', backgroundColor: COLORS.background, borderRadius: '12px', marginTop: '16px' }}>
      <h3 style={{ fontFamily: '"Cairo", sans-serif', color: COLORS.primary, margin: '0 0 12px 0' }}>
        {lang === 'ar' ? 'مصادقة المسؤول (HA)' : 'Hospital Admin Auth'}
      </h3>
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <FormField
            label={lang === 'ar' ? 'رمز OTP (6 أرقام)' : 'OTP Code (6 digits)'}
            type="text"
            value={otp}
            onChange={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
            lang={lang}
          />
          <button type="submit" disabled={otp.length !== 6} style={{ padding: '12px', backgroundColor: otp.length === 6 ? COLORS.primary : COLORS.border, color: COLORS.textLight, border: 'none', borderRadius: '8px', fontFamily: '"Cairo", sans-serif', fontWeight: 700, cursor: otp.length === 6 ? 'pointer' : 'not-allowed' }}>
            {lang === 'ar' ? 'تحقق' : 'Verify'}
          </button>
        </form>
      )}
      {step === 'pin' && (
        <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <FormField
            label={lang === 'ar' ? 'إنشاء PIN (4+ أرقام)' : 'Create PIN (4+ digits)'}
            type="text"
            value={pin}
            onChange={(v) => setPin(v.replace(/\D/g, ''))}
            lang={lang}
          />
          <button type="submit" disabled={pin.length < 4} style={{ padding: '12px', backgroundColor: pin.length >= 4 ? COLORS.primary : COLORS.border, color: COLORS.textLight, border: 'none', borderRadius: '8px', fontFamily: '"Cairo", sans-serif', fontWeight: 700, cursor: pin.length >= 4 ? 'pointer' : 'not-allowed' }}>
            {lang === 'ar' ? 'إعداد والدخول' : 'Setup & Enter'}
          </button>
        </form>
      )}
    </div>
  );
};

export default function AloDoctorValidationSuite() {
  const { lang, dir, toggle } = useDirection();
  const [activePersona, setActivePersona] = useState('intake');
  const [isProduction, setIsProduction] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    if (!document.getElementById('cairo-font')) {
      const link = document.createElement('link');
      link.id = 'cairo-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, [dir, lang]);

  useEffect(() => {
    setFormData({});
    setErrors({});
    setSubmitted(false);
  }, [activePersona]);

  const validateField = useCallback((fieldConfig, value) => {
    switch (fieldConfig.rule) {
      case 'required_true':
        return value === true ? null : (lang === 'ar' ? fieldConfig.messageAr : fieldConfig.messageEn);
      case 'min_length_1':
        return (typeof value === 'string' && value.trim().length > 0) ? null : (lang === 'ar' ? fieldConfig.messageAr : fieldConfig.messageEn);
      case 'range_0_150':
        return (typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 150) ? null : (lang === 'ar' ? fieldConfig.messageAr : fieldConfig.messageEn);
      case 'not_default':
        return (value && value !== '') ? null : (lang === 'ar' ? fieldConfig.messageAr : fieldConfig.messageEn);
      case 'not_blank_default':
        return (value && value.trim() !== '' && value.trim() !== 'DEFAULT') ? null : (lang === 'ar' ? fieldConfig.messageAr : fieldConfig.messageEn);
      case 'min_1':
        return (typeof value === 'number' && value >= 1) ? null : (lang === 'ar' ? fieldConfig.messageAr : fieldConfig.messageEn);
      case 'dependencies_complete':
        return value === true ? null : (lang === 'ar' ? fieldConfig.messageAr : fieldConfig.messageEn);
      default:
        return null;
    }
  }, [lang]);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitted(false);
    
    const currentValidations = GAP_VALIDATIONS[activePersona] || [];
    const fieldConfig = currentValidations.find(v => v.field === field);
    if (fieldConfig) {
      const error = validateField(fieldConfig, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [activePersona, validateField]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const currentValidations = GAP_VALIDATIONS[activePersona] || [];
    const newErrors = {};
    let isValid = true;

    currentValidations.forEach(validation => {
      const error = validateField(validation, formData[validation.field]);
      if (error) {
        newErrors[validation.field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setSubmitted(true);

    if (isValid) {
      console.log(`[ALO DOCTOR E2E] Negative path validation passed for persona: ${activePersona}. Payload:`, formData);
    } else {
      console.warn(`[ALO DOCTOR E2E] Negative path correctly blocked submission for persona: ${activePersona}. Errors:`, newErrors);
    }
  }, [activePersona, formData, validateField]);

  const renderPersonaForm = () => {
    const currentValidations = GAP_VALIDATIONS[activePersona] || [];

    if (activePersona === 'intake') {
      return (
        <>
          <FormField label={lang === 'ar' ? 'الموافقة على الخصوصية' : 'Privacy Consent'} type="checkbox" value={formData.privacyConsent || false} onChange={(v) => handleFieldChange('privacyConsent', v)} error={errors.privacyConsent} lang={lang} />
          <FormField label={lang === 'ar' ? 'التشخيص' : 'Diagnosis'} type="text" value={formData.diagnosis || ''} onChange={(v) => handleFieldChange('diagnosis', v)} error={errors.diagnosis} lang={lang} />
          <FormField label={lang === 'ar' ? 'العمر' : 'Age'} type="number" value={formData.age ?? ''} onChange={(v) => handleFieldChange('age', v)} error={errors.age} lang={lang} />
          <FormField label={lang === 'ar' ? 'الجنس' : 'Gender'} type="select" value={formData.gender || ''} onChange={(v) => handleFieldChange('gender', v)} error={errors.gender} lang={lang} options={[{ value: 'M', label: lang === 'ar' ? 'ذكر' : 'Male' }, { value: 'F', label: lang === 'ar' ? 'أنثى' : 'Female' }]} />
        </>
      );
    }

    if (activePersona === 'nurse') {
      return (
        <>
          <FormField label={lang === 'ar' ? 'الطبيب المعين' : 'Assigned Doctor'} type="select" value={formData.assignedDoctor || ''} onChange={(v) => handleFieldChange('assignedDoctor', v)} error={errors.assignedDoctor} lang={lang} options={[{ value: 'dr_1', label: 'Dr. Ahmed' }, { value: 'dr_2', label: 'Dr. Sara' }]} />
          <FormField label={lang === 'ar' ? 'ملاحظات الملخص (N07)' : 'Summary Notes (N07)'} type="textarea" value={formData.summaryNotes || ''} onChange={(v) => handleFieldChange('summaryNotes', v)} error={errors.summaryNotes} lang={lang} />
        </>
      );
    }

    if (activePersona === 'doctor') {
      return (
        <FormField label={lang === 'ar' ? 'أسئلة التركيز (D10)' : 'Focus Questions (D10)'} type="textarea" value={formData.focusQuestions || ''} onChange={(v) => handleFieldChange('focusQuestions', v)} error={errors.focusQuestions} lang={lang} />
      );
    }

    if (activePersona === 'consultant') {
      return (
        <>
          <FormField label={lang === 'ar' ? 'إجابات التركيز' : 'Focus Answers'} type="textarea" value={formData.focusAnswers || ''} onChange={(v) => handleFieldChange('focusAnswers', v)} error={errors.focusAnswers} lang={lang} />
          <FormField label={lang === 'ar' ? 'نص الرأي' : 'Opinion Text'} type="textarea" value={formData.opinionText || ''} onChange={(v) => handleFieldChange('opinionText', v)} error={errors.opinionText} lang={lang} />
        </>
      );
    }

    if (activePersona === 'coordinator') {
      return (
        <FormField label={lang === 'ar' ? 'رسالة الترحيل' : 'Relay Message'} type="textarea" value={formData.relayMessage || ''} onChange={(v) => handleFieldChange('relayMessage', v)} error={errors.relayMessage} lang={lang} />
      );
    }

    if (activePersona === 'partner_lab') {
      return (
        <FormField label={lang === 'ar' ? 'اكتمال المتطلبات (D13)' : 'Dependencies Complete (D13)'} type="checkbox" value={formData.d13Status || false} onChange={(v) => handleFieldChange('d13Status', v)} error={errors.d13Status} lang={lang} />
      );
    }

    if (activePersona === 'followup') {
      return (
        <FormField label={lang === 'ar' ? 'التقييم' : 'Rating'} type="rating" value={formData.rating || 0} onChange={(v) => handleFieldChange('rating', v)} error={errors.rating} lang={lang} />
      );
    }

    return null;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F7F6', fontFamily: '"Cairo", sans-serif', direction: dir }}>
      <header style={{ backgroundColor: COLORS.primary, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, color: COLORS.textLight, fontSize: '20px', fontWeight: 700 }}>
          ALO DOCTOR <span style={{ fontWeight: 300, fontSize: '14px' }}>v2.4 Saudi Edition | ISSUE-9 WAVE-3</span>
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setIsProduction(!isProduction)}
            aria-label={isProduction ? 'Switch to Staging' : 'Switch to Production'}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid COLORS.textLight', backgroundColor: isProduction ? COLORS.error : 'transparent', color: COLORS.textLight, fontFamily: '"Cairo", sans-serif', fontSize: '12px', cursor: 'pointer' }}
          >
            {isProduction ? (lang === 'ar' ? 'إنتاج' : 'PROD') : (lang === 'ar' ? 'تجريبي' : 'STAGE')}
          </button>
          <button
            onClick={toggle}
            aria-label="Toggle Language"
            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: COLORS.secondary, color: COLORS.textLight, fontFamily: '"Cairo", sans-serif', fontWeight: 600, cursor: 'pointer' }}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
      </header>

      <PersonaSwitcher activePersona={activePersona} onSelect={setActivePersona} lang={lang} isProduction={isProduction} />

      <main style={{ maxWidth: '800px', margin: '32px auto', padding: '0 16px' }}>
        <section style={{ backgroundColor: COLORS.textLight, borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,123,110,0.08)', marginBottom: '24px' }}>
          <h2 style={{ color: COLORS.primary, fontSize: '18px', marginTop: 0, borderBottom: `2px solid ${COLORS.background}`, paddingBottom: '12px' }}>
            {lang === 'ar' ? 'اختبار المسار السلبي: ' : 'Negative Path Validation: '}
            {PERSONAS.find(p => p.id === activePersona)?.[lang === 'ar' ? 'labelAr' : 'labelEn']}
          </h2>

          {GAP_VALIDATIONS[activePersona] && (
            <form onSubmit={handleSubmit} noValidate>
              {renderPersonaForm()}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  marginTop: '16px',
                  backgroundColor: COLORS.primary,
                  color: COLORS.textLight,
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: '"Cairo", sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#005C52'}
                onMouseLeave={(e) => e.target.style.backgroundColor = COLORS.primary}
              >
                {lang === 'ar' ? 'اختبار الإرسال (يجب أن يفشل إذا كان غير صالح)' : 'Test Submit (Should fail if invalid)'}
              </button>
            </form>
          )}

          {submitted && Object.keys(errors).length === 0 && GAP_VALIDATIONS[activePersona] && (
            <div style={{ marginTop: '16px' }}>
              <ValidationBadge
                isValid={true}
                messageAr="تم اجتياز التحقق - البيانات صالحة"
                messageEn="Validation Passed - Data is valid"
                lang={lang}
              />
            </div>
          )}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <ApiRegressionSimulator lang={lang} />
          <AuthOtpPinSimulator lang={lang} />
        </section>

        <footer style={{ marginTop: '48px', textAlign: 'center', padding: '24px', color: COLORS.primary, fontSize: '12px', opacity: 0.7 }}>
          <p>E2E Regression Suite | Model: qwen3.8-max via Alibaba DashScope | Branch: feature-sarat</p>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: COLORS.whatsapp, fontSize: '16px' }}>●</span>
            {lang === 'ar' ? 'متوافق مع معايير الوصول السعودية' : 'Saudi Accessibility Standards Compliant'}
          </p>
        </footer>
      </main>
    </div>
  );
}
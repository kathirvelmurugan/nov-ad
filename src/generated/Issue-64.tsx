import React, { useState, useMemo, useCallback } from 'react';

// --- Types & Interfaces ---
interface PersonaProfile {
  id: string;
  nameEn: string;
  nameAr: string;
}

interface PatientIntakeData {
  age: string;
  gender: string;
  city: string;
  diagnosis: string;
  privacyAgreed: boolean;
}

interface FieldErrorProps {
  messageEn: string;
  messageAr: string;
  lang: 'en' | 'ar';
}

interface FormErrorSummaryProps {
  errors: Record<string, { en: string; ar: string }>;
  lang: 'en' | 'ar';
}

// --- Constants ---
const SAUDI_CITIES = [
  { value: 'riyadh', en: 'Riyadh', ar: 'الرياض' },
  { value: 'jeddah', en: 'Jeddah', ar: 'جدة' },
  { value: 'dammam', en: 'Dammam', ar: 'الدمام' },
  { value: 'mecca', en: 'Mecca', ar: 'مكة المكرمة' },
  { value: 'medina', en: 'Medina', ar: 'المدينة المنورة' },
  { value: 'khobar', en: 'Al Khobar', ar: 'الخبر' },
  { value: 'tabuk', en: 'Tabuk', ar: 'تبوك' },
  { value: 'buraidah', en: 'Buraidah', ar: 'بريدة' },
  { value: 'khamis', en: 'Khamis Mushait', ar: 'خميس مشيط' },
  { value: 'abha', en: 'Abha', ar: 'أبها' },
];

const PERSONA_PROFILES: PersonaProfile[] = [
  { id: 'patient', nameEn: 'Patient', nameAr: 'مريض' },
  { id: 'doctor', nameEn: 'Doctor', nameAr: 'طبيب' },
  { id: 'nurse', nameEn: 'Nurse', nameAr: 'ممرض' },
  { id: 'pharmacist', nameEn: 'Pharmacist', nameAr: 'صيدلي' },
  { id: 'admin', nameEn: 'Admin', nameAr: 'مسؤول' },
  { id: 'lab_tech', nameEn: 'Lab Tech', nameAr: 'فني مختبر' },
  { id: 'radiologist', nameEn: 'Radiologist', nameAr: 'أخصائي أشعة' },
  { id: 'paramedic', nameEn: 'Paramedic', nameAr: 'مسعف' },
  { id: 'therapist', nameEn: 'Therapist', nameAr: 'معالج' },
  { id: 'researcher', nameEn: 'Researcher', nameAr: 'باحث' },
  { id: 'guest', nameEn: 'Guest', nameAr: 'زائر' },
];

// --- Sub-Components ---

const FieldError: React.FC<FieldErrorProps> = ({ messageEn, messageAr, lang }) => (
  <p
    role="alert"
    aria-live="polite"
    style={{
      color: '#D32F2F',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
      marginBottom: '0.5rem',
      fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'system-ui, sans-serif',
      textAlign: lang === 'ar' ? 'right' : 'left',
    }}
  >
    {lang === 'ar' ? messageAr : messageEn}
  </p>
);

const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({ errors, lang }) => {
  const errorEntries = Object.entries(errors);
  if (errorEntries.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        backgroundColor: '#FDEDED',
        border: '1px solid #F5C2C7',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem',
        direction: lang === 'ar' ? 'rtl' : 'ltr',
        fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'system-ui, sans-serif',
      }}
    >
      <h3 style={{ color: '#D32F2F', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
        {lang === 'ar' ? 'يرجى تصحيح الأخطاء التالية:' : 'Please correct the following errors:'}
      </h3>
      <ul style={{ margin: 0, paddingLeft: lang === 'ar' ? 0 : '1.25rem', paddingRight: lang === 'ar' ? '1.25rem' : 0 }}>
        {errorEntries.map(([key, messages]) => (
          <li key={key} style={{ color: '#D32F2F', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
            {lang === 'ar' ? messages.ar : messages.en}
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Intake Symptoms and Diagnosis Section ---
interface IntakeSymptomsAndDiagnosisSectionProps {
  diagnosis: string;
  onDiagnosisChange: (value: string) => void;
  diagnosisError: boolean;
  lang: 'en' | 'ar';
}

const IntakeSymptomsAndDiagnosisSection: React.FC<IntakeSymptomsAndDiagnosisSectionProps> = ({
  diagnosis,
  onDiagnosisChange,
  diagnosisError,
  lang,
}) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: `1.5px solid ${diagnosisError ? '#D32F2F' : '#007B6E'}`,
    backgroundColor: '#FFFFFF',
    fontSize: '1rem',
    fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'system-ui, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        htmlFor="diagnosis-input"
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#007B6E',
          fontSize: '0.95rem',
        }}
      >
        {lang === 'ar' ? 'التشخيص الطبي (P05)' : 'Medical Diagnosis (P05)'}
      </label>
      <input
        id="diagnosis-input"
        type="text"
        value={diagnosis}
        onChange={(e) => onDiagnosisChange(e.target.value)}
        placeholder={lang === 'ar' ? 'أدخل التشخيص الطبي...' : 'Enter medical diagnosis...'}
        style={inputStyle}
        aria-invalid={diagnosisError}
        aria-describedby={diagnosisError ? 'diagnosis-error' : undefined}
      />
      {diagnosisError && (
        <div id="diagnosis-error">
          <FieldError
            messageEn="Medical Diagnosis is required (minimum 3 characters)."
            messageAr="التشخيص الطبي مطلوب (3 أحرف على الأقل)."
            lang={lang}
          />
        </div>
      )}
    </div>
  );
};

// --- Main Patient Intake View ---
const PatientIntakeView: React.FC = () => {
  // State Management
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [activePersona, setActivePersona] = useState<string>('patient');
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Gap 1: Privacy Consent defaults to false
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);

  // Gap 3: Editable Demographics
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [city, setCity] = useState<string>('');

  // Gap 2: Diagnosis
  const [diagnosis, setDiagnosis] = useState<string>('');

  // Validation Logic
  const validateForm = useCallback((): Record<string, { en: string; ar: string }> => {
    const errors: Record<string, { en: string; ar: string }> = {};

    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      errors.age = {
        en: 'Age is required and must be a valid number between 1 and 120.',
        ar: 'العمر مطلوب ويجب أن يكون رقماً صحيحاً بين 1 و 120.',
      };
    }

    if (!gender) {
      errors.gender = {
        en: 'Gender is required.',
        ar: 'الجنس مطلوب.',
      };
    }

    if (!city) {
      errors.city = {
        en: 'City is required.',
        ar: 'المدينة مطلوبة.',
      };
    }

    if (!diagnosis || diagnosis.trim().length < 3) {
      errors.diagnosis = {
        en: 'Medical Diagnosis is required (minimum 3 characters).',
        ar: 'التشخيص الطبي مطلوب (3 أحرف على الأقل).',
      };
    }

    if (!privacyAgreed) {
      errors.privacy = {
        en: 'You must agree to the MOH Health Data Privacy Consent before submitting your case.',
        ar: 'يجب الموافقة على إقرار الخصوصية وحماية البيانات الصحية قبل إرسال الملف.',
      };
    }

    return errors;
  }, [age, gender, city, diagnosis, privacyAgreed]);

  const errors = useMemo(() => (submitted ? validateForm() : {}), [submitted, validateForm]);
  const hasErrors = submitted && Object.keys(errors).length > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    const currentErrors = validateForm();
    if (Object.keys(currentErrors).length === 0) {
      // Success logic here - no alert() used per requirements
      console.log('Form submitted successfully:', { age, gender, city, diagnosis, privacyAgreed });
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    maxWidth: '640px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#E6FAF7',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 123, 110, 0.08)',
    direction: lang === 'ar' ? 'rtl' : 'ltr',
    fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'system-ui, sans-serif',
    color: '#1A1A1A',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '2px solid #00C6AE',
    paddingBottom: '1rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 600,
    color: '#007B6E',
    fontSize: '0.95rem',
  };

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    fontSize: '1rem',
    fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'system-ui, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  };

  const getInputStyle = (hasError: boolean): React.CSSProperties => ({
    ...inputBaseStyle,
    border: `1.5px solid ${hasError ? '#D32F2F' : '#007B6E'}`,
  });

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#007B6E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'system-ui, sans-serif',
    transition: 'background-color 0.2s ease',
    marginTop: '1.5rem',
  };

  const personaSwitcherStyle: React.CSSProperties = {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #00C6AE',
    backgroundColor: '#FFFFFF',
    color: '#007B6E',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'system-ui, sans-serif',
  };

  return (
    <div style={containerStyle}>
      {/* Header with Language Toggle & Persona Switcher */}
      <header style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#007B6E' }}>
          {lang === 'ar' ? 'نموذج استقبال المريض' : 'Patient Intake Form'}
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            aria-label={lang === 'ar' ? 'تبديل الشخصية' : 'Switch Persona'}
            value={activePersona}
            onChange={(e) => setActivePersona(e.target.value)}
            style={personaSwitcherStyle}
          >
            {PERSONA_PROFILES.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {lang === 'ar' ? profile.nameAr : profile.nameEn}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            style={{
              ...personaSwitcherStyle,
              backgroundColor: '#00C6AE',
              color: '#FFFFFF',
              border: 'none',
            }}
            aria-label="Toggle Language"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
      </header>

      {/* Form Error Summary (Gap 3 requirement) */}
      {hasErrors && <FormErrorSummary errors={errors} lang={lang} />}

      <form onSubmit={handleSubmit} noValidate>
        {/* Demographics Section (Gap 3) */}
        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1.5rem 0' }}>
          <legend style={{ ...labelStyle, fontSize: '1.1rem', marginBottom: '1rem' }}>
            {lang === 'ar' ? 'البيانات الديموغرافية' : 'Demographic Information'}
          </legend>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {/* Age Input */}
            <div>
              <label htmlFor="age-input" style={labelStyle}>
                {lang === 'ar' ? 'العمر' : 'Age'}
              </label>
              <input
                id="age-input"
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={getInputStyle(submitted && !!errors.age)}
                aria-invalid={submitted && !!errors.age}
                aria-describedby={submitted && errors.age ? 'age-error' : undefined}
                required
              />
              {submitted && errors.age && (
                <div id="age-error">
                  <FieldError messageEn={errors.age.en} messageAr={errors.age.ar} lang={lang} />
                </div>
              )}
            </div>

            {/* Gender Select */}
            <div>
              <label htmlFor="gender-select" style={labelStyle}>
                {lang === 'ar' ? 'الجنس' : 'Gender'}
              </label>
              <select
                id="gender-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={getInputStyle(submitted && !!errors.gender)}
                aria-invalid={submitted && !!errors.gender}
                aria-describedby={submitted && errors.gender ? 'gender-error' : undefined}
                required
              >
                <option value="" disabled>
                  {lang === 'ar' ? 'اختر الجنس' : 'Select Gender'}
                </option>
                <option value="M">{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                <option value="F">{lang === 'ar' ? 'أنثى' : 'Female'}</option>
              </select>
              {submitted && errors.gender && (
                <div id="gender-error">
                  <FieldError messageEn={errors.gender.en} messageAr={errors.gender.ar} lang={lang} />
                </div>
              )}
            </div>

            {/* City Select */}
            <div>
              <label htmlFor="city-select" style={labelStyle}>
                {lang === 'ar' ? 'المدينة' : 'City'}
              </label>
              <select
                id="city-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={getInputStyle(submitted && !!errors.city)}
                aria-invalid={submitted && !!errors.city}
                aria-describedby={submitted && errors.city ? 'city-error' : undefined}
                required
              >
                <option value="" disabled>
                  {lang === 'ar' ? 'اختر المدينة' : 'Select City'}
                </option>
                {SAUDI_CITIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {lang === 'ar' ? c.ar : c.en}
                  </option>
                ))}
              </select>
              {submitted && errors.city && (
                <div id="city-error">
                  <FieldError messageEn={errors.city.en} messageAr={errors.city.ar} lang={lang} />
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Diagnosis Section (Gap 2) */}
        <IntakeSymptomsAndDiagnosisSection
          diagnosis={diagnosis}
          onDiagnosisChange={setDiagnosis}
          diagnosisError={submitted && !!errors.diagnosis}
          lang={lang}
        />

        {/* Privacy Consent Section (Gap 1) */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #00C6AE' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <input
              id="privacy-consent"
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              style={{
                marginTop: '0.25rem',
                width: '1.25rem',
                height: '1.25rem',
                accentColor: '#007B6E',
                cursor: 'pointer',
              }}
              aria-invalid={submitted && !!errors.privacy}
              aria-describedby={submitted && errors.privacy ? 'privacy-error' : undefined}
            />
            <label
              htmlFor="privacy-consent"
              style={{
                fontSize: '0.9rem',
                color: '#333333',
                cursor: 'pointer',
                lineHeight: 1.5,
              }}
            >
              {lang === 'ar'
                ? 'أوافق على إقرار الخصوصية وحماية البيانات الصحية الصادر عن وزارة الصحة السعودية (MOH) وأسمح بمعالجة بياناتي الطبية.'
                : 'I agree to the MOH Health Data Privacy Consent and allow the processing of my medical data according to Saudi Arabian regulations.'}
            </label>
          </div>
          {submitted && errors.privacy && (
            <div id="privacy-error" style={{ marginTop: '0.5rem', marginLeft: lang === 'ar' ? 0 : '2rem', marginRight: lang === 'ar' ? '2rem' : 0 }}>
              <FieldError messageEn={errors.privacy.en} messageAr={errors.privacy.ar} lang={lang} />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#005C52')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007B6E')}
        >
          {lang === 'ar' ? 'إرسال الملف الطبي' : 'Submit Medical Case'}
        </button>
      </form>

      {/* WhatsApp Support Link (Branding) */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <a
          href="https://wa.me/966500000000"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#25D366',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {lang === 'ar' ? 'الدعم عبر واتساب' : 'WhatsApp Support'}
        </a>
      </div>
    </div>
  );
};

export default PatientIntakeView;
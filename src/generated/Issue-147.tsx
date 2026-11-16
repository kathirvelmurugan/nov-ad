import React, { useState, useEffect, useCallback, useRef } from 'react';

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  textDark: '#1A1A1A',
  textLight: '#FFFFFF',
  error: '#D32F2F',
};

const DRAFT_INTAKE_KEY = 'alo_doctor_v24_draft_intake';
const HOSPITAL_ID_RIYADH = 'hosp-alo-riyadh-01';

interface IntakeFormData {
  patientName: string;
  nationalId: string;
  symptoms: string;
  specialty: string;
  mohConsent: boolean;
  doctorId: string | null;
  selectionMode: 'auto' | 'manual';
}

interface UserDoctor {
  id: string;
  fullName: string;
  specialty: string;
  hospitalId: string;
}

interface RegisteredCase {
  patientName: string;
  nationalId: string;
  symptoms: string;
  specialty: string;
  doctorId: string | null;
  status: string;
}

interface PatientIntakeViewProps {
  onUpdateCase: (registeredCase: RegisteredCase, isFinal: boolean) => Promise<void>;
  currentPersona: string;
  dir: 'rtl' | 'ltr';
  lang: 'ar' | 'en';
}

interface IntakeDoctorSelectionCardProps {
  selectedDoctorId: string | null;
  selectionMode: 'auto' | 'manual';
  onSelectionChange: (mode: 'auto' | 'manual', doctorId: string | null) => void;
  dir: 'rtl' | 'ltr';
  lang: 'ar' | 'en';
}

const apiClient = {
  fetchUsers: async (): Promise<UserDoctor[]> => {
    try {
      const response = await fetch('/api/users?role=doctor&hospitalId=' + HOSPITAL_ID_RIYADH);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch accredited doctors:', error);
      return [];
    }
  }
};

const defaultFormData: IntakeFormData = {
  patientName: '',
  nationalId: '',
  symptoms: '',
  specialty: '',
  mohConsent: false,
  doctorId: null,
  selectionMode: 'auto',
};

export const IntakeDoctorSelectionCard: React.FC<IntakeDoctorSelectionCardProps> = ({
  selectedDoctorId,
  selectionMode,
  onSelectionChange,
  dir,
  lang,
}) => {
  const [doctors, setDoctors] = useState<UserDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDoctors = async () => {
      setIsLoading(true);
      const fetchedDoctors = await apiClient.fetchUsers();
      const filtered = fetchedDoctors.filter(doc => doc.hospitalId === HOSPITAL_ID_RIYADH);
      if (isMounted) {
        setDoctors(filtered);
        setIsLoading(false);
      }
    };
    loadDoctors();
    return () => { isMounted = false; };
  }, []);

  const isAr = lang === 'ar';

  return (
    <div
      dir={dir}
      style={{
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: PALETTE.background,
        border: `1px solid ${PALETTE.secondary}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ color: PALETTE.primary, margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>
        {isAr ? 'اختيار الطبيب المعالج' : 'Attending Physician Selection'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: selectionMode === 'auto' ? PALETTE.secondary + '20' : 'transparent',
            border: `2px solid ${selectionMode === 'auto' ? PALETTE.primary : '#E0E0E0'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="radio"
            name="doctorSelection"
            checked={selectionMode === 'auto'}
            onChange={() => onSelectionChange('auto', null)}
            style={{ accentColor: PALETTE.primary, width: '20px', height: '20px' }}
            aria-label={isAr ? 'مساعدة ألو في الاختيار' : 'Let ALO Medical Triage Select'}
          />
          <span style={{ color: PALETTE.textDark, fontWeight: 600, fontSize: '15px' }}>
            {isAr ? 'مساعدة ألو في الاختيار (Let ALO Medical Triage Select)' : 'Let ALO Medical Triage Select (مساعدة ألو في الاختيار)'}
          </span>
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: selectionMode === 'manual' ? PALETTE.secondary + '20' : 'transparent',
            border: `2px solid ${selectionMode === 'manual' ? PALETTE.primary : '#E0E0E0'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="radio"
            name="doctorSelection"
            checked={selectionMode === 'manual'}
            onChange={() => onSelectionChange('manual', doctors.length > 0 ? doctors[0].id : null)}
            style={{ accentColor: PALETTE.primary, width: '20px', height: '20px' }}
            aria-label={isAr ? 'اختيار طبيب محدد' : 'Select specific doctor'}
          />
          <span style={{ color: PALETTE.textDark, fontWeight: 600, fontSize: '15px' }}>
            {isAr ? 'اختيار طبيب محدد من مركز رعاية الرياض الطبي' : 'Explicit doctor selection from Riyadh Care Medical Center'}
          </span>
        </label>

        {selectionMode === 'manual' && (
          <div style={{ marginTop: '8px', paddingInlineStart: '32px' }}>
            {isLoading ? (
              <p style={{ color: PALETTE.primary, fontSize: '14px' }}>
                {isAr ? 'جاري تحميل الأطباء المعتمدين...' : 'Loading accredited doctors...'}
              </p>
            ) : (
              <select
                value={selectedDoctorId || ''}
                onChange={(e) => onSelectionChange('manual', e.target.value)}
                aria-label={isAr ? 'قائمة الأطباء' : 'Doctor list'}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${PALETTE.secondary}`,
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '14px',
                  backgroundColor: PALETTE.textLight,
                  color: PALETTE.textDark,
                  direction: dir,
                }}
              >
                <option value="" disabled>
                  {isAr ? 'اختر الطبيب' : 'Select Doctor'}
                </option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.fullName} - {doc.specialty}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const PatientIntakeView: React.FC<PatientIntakeViewProps> = ({
  onUpdateCase,
  currentPersona,
  dir,
  lang,
}) => {
  const [formData, setFormData] = useState<IntakeFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isAr = lang === 'ar';

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_INTAKE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as IntakeFormData;
        setFormData(parsed);
      }
    } catch (e) {
      console.warn('Failed to parse intake draft');
    }
  }, []);

  const autoSaveDraft = useCallback((data: IntakeFormData) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_INTAKE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to save intake draft');
      }
    }, 500);
  }, []);

  const handleInputChange = (field: keyof IntakeFormData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setSubmitSuccess(false);
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    autoSaveDraft(updated);
  };

  const handleDoctorSelection = (mode: 'auto' | 'manual', doctorId: string | null) => {
    handleInputChange('selectionMode', mode);
    handleInputChange('doctorId', doctorId);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const idRegex = /^\d{10}$/;

    if (!formData.patientName.trim()) {
      newErrors.patientName = isAr ? 'اسم المريض مطلوب' : 'Patient name is required';
    }

    if (!idRegex.test(formData.nationalId)) {
      newErrors.nationalId = isAr ? 'يجب أن يكون رقم الهوية الوطنية أو الإقامة 10 أرقام' : 'Saudi National ID / Iqama must be exactly 10 digits';
    }

    if (!formData.symptoms.trim()) {
      newErrors.symptoms = isAr ? 'الأعراض مطلوبة' : 'Symptoms are required';
    }

    if (!formData.specialty.trim()) {
      newErrors.specialty = isAr ? 'التخصص مطلوب' : 'Specialty is required';
    }

    if (!formData.mohConsent) {
      newErrors.mohConsent = isAr ? 'موافقة وزارة الصحة إلزامية' : 'MOH consent is mandatory';
    }

    if (formData.selectionMode === 'manual' && !formData.doctorId) {
      newErrors.doctorId = isAr ? 'يرجى اختيار طبيب' : 'Please select a doctor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    const registeredCase: RegisteredCase = {
      patientName: formData.patientName.trim(),
      nationalId: formData.nationalId.trim(),
      symptoms: formData.symptoms.trim(),
      specialty: formData.specialty.trim(),
      doctorId: formData.doctorId,
      status: 'M01_TRIAGE_PENDING',
    };

    try {
      await onUpdateCase(registeredCase, true);
      
      localStorage.removeItem(DRAFT_INTAKE_KEY);
      
      setFormData(defaultFormData);
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Case submission failed:', err);
      setErrors({ submit: isAr ? 'فشل تسجيل الحالة، حاول مرة أخرى' : 'Failed to register case, please try again' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    border: `2px solid ${hasError ? PALETTE.error : PALETTE.secondary}`,
    fontFamily: 'Cairo, sans-serif',
    fontSize: '15px',
    backgroundColor: PALETTE.textLight,
    color: PALETTE.textDark,
    direction: dir,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: PALETTE.primary,
    fontSize: '14px',
  };

  const errorStyle: React.CSSProperties = {
    color: PALETTE.error,
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: 600,
  };

  return (
    <div
      dir={dir}
      style={{
        fontFamily: 'Cairo, sans-serif',
        minHeight: '100vh',
        backgroundColor: '#F4FDFB',
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '720px' }}>
        <header style={{ marginBottom: '32px', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
          <h1 style={{ color: PALETTE.primary, fontSize: '28px', fontWeight: 800, margin: 0 }}>
            {isAr ? 'استقبال المريض' : 'Patient Intake'}
          </h1>
          <p style={{ color: PALETTE.textDark, opacity: 0.7, fontSize: '14px', marginTop: '8px' }}>
            {isAr ? 'نظام ألو دكتور - الإصدار 2.4' : 'ALO DOCTOR System - v2.4'}
          </p>
        </header>

        {submitSuccess && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              backgroundColor: PALETTE.whatsapp + '15',
              border: `2px solid ${PALETTE.whatsapp}`,
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PALETTE.whatsapp} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span style={{ color: PALETTE.primary, fontWeight: 700, fontSize: '15px' }}>
              {isAr 
                ? 'تم تسجيل الحالة بنجاح - بانتظار الفرز السريري (M01)' 
                : 'Case registered successfully - awaiting clinical triage (M01)'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div
            style={{
              backgroundColor: PALETTE.textLight,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 24px rgba(0, 123, 110, 0.06)',
              border: `1px solid ${PALETTE.background}`,
              marginBottom: '24px',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="patientName" style={labelStyle}>
                {isAr ? 'اسم المريض الكامل' : 'Full Patient Name'}
              </label>
              <input
                id="patientName"
                type="text"
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                style={inputStyle(!!errors.patientName)}
                placeholder={isAr ? 'أدخل اسم المريض رباعياً' : 'Enter patient full name'}
                aria-invalid={!!errors.patientName}
                aria-describedby={errors.patientName ? 'err-patientName' : undefined}
              />
              {errors.patientName && <p id="err-patientName" style={errorStyle}>{errors.patientName}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="nationalId" style={labelStyle}>
                {isAr ? 'رقم الهوية الوطنية / الإقامة' : 'Saudi National ID / Iqama'}
              </label>
              <input
                id="nationalId"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={formData.nationalId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleInputChange('nationalId', val);
                }}
                style={inputStyle(!!errors.nationalId)}
                placeholder={isAr ? '10 أرقام' : '10 digits'}
                aria-invalid={!!errors.nationalId}
                aria-describedby={errors.nationalId ? 'err-nationalId' : undefined}
              />
              {errors.nationalId && <p id="err-nationalId" style={errorStyle}>{errors.nationalId}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="specialty" style={labelStyle}>
                {isAr ? 'التخصص المطلوب' : 'Required Specialty'}
              </label>
              <input
                id="specialty"
                type="text"
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                style={inputStyle(!!errors.specialty)}
                placeholder={isAr ? 'مثال: باطنية، أطفال، طوارئ' : 'e.g., Internal Medicine, Pediatrics, ER'}
                aria-invalid={!!errors.specialty}
                aria-describedby={errors.specialty ? 'err-specialty' : undefined}
              />
              {errors.specialty && <p id="err-specialty" style={errorStyle}>{errors.specialty}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="symptoms" style={labelStyle}>
                {isAr ? 'الأعراض والشكوى الرئيسية' : 'Symptoms & Chief Complaint'}
              </label>
              <textarea
                id="symptoms"
                rows={4}
                value={formData.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                style={{ ...inputStyle(!!errors.symptoms), resize: 'vertical', minHeight: '100px' }}
                placeholder={isAr ? 'اشرح الأعراض بالتفصيل...' : 'Describe symptoms in detail...'}
                aria-invalid={!!errors.symptoms}
                aria-describedby={errors.symptoms ? 'err-symptoms' : undefined}
              />
              {errors.symptoms && <p id="err-symptoms" style={errorStyle}>{errors.symptoms}</p>}
            </div>
          </div>

          <IntakeDoctorSelectionCard
            selectedDoctorId={formData.doctorId}
            selectionMode={formData.selectionMode}
            onSelectionChange={handleDoctorSelection}
            dir={dir}
            lang={lang}
          />
          {errors.doctorId && <p style={{ ...errorStyle, margin: '-16px 0 16px 0' }}>{errors.doctorId}</p>}

          <div
            style={{
              backgroundColor: PALETTE.textLight,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 24px rgba(0, 123, 110, 0.06)',
              border: `1px solid ${PALETTE.background}`,
              marginBottom: '32px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={formData.mohConsent}
                onChange={(e) => handleInputChange('mohConsent', e.target.checked)}
                style={{
                  marginTop: '4px',
                  width: '20px',
                  height: '20px',
                  accentColor: PALETTE.primary,
                  flexShrink: 0,
                }}
                aria-invalid={!!errors.mohConsent}
                aria-describedby={errors.mohConsent ? 'err-mohConsent' : undefined}
              />
              <span style={{ color: PALETTE.textDark, fontSize: '14px', lineHeight: 1.6 }}>
                {isAr
                  ? 'أوافق على مشاركة بياناتي الصحية مع وزارة الصحة (MOH) وفقاً لسياسات الخصوصية والأنظمة المعمول بها في المملكة العربية السعودية.'
                  : 'I consent to sharing my health data with the Ministry of Health (MOH) in accordance with privacy policies and regulations enforced in the Kingdom of Saudi Arabia.'}
              </span>
            </label>
            {errors.mohConsent && <p id="err-mohConsent" style={{ ...errorStyle, marginInlineStart: '32px' }}>{errors.mohConsent}</p>}
          </div>

          {errors.submit && (
            <div
              role="alert"
              style={{
                backgroundColor: PALETTE.error + '10',
                border: `1px solid ${PALETTE.error}`,
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                color: PALETTE.error,
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isSubmitting ? PALETTE.secondary : PALETTE.primary,
              color: PALETTE.textLight,
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'Cairo, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease, transform 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
            onMouseDown={(e) => !isSubmitting && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isSubmitting ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                {isAr ? 'جاري التسجيل...' : 'Registering...'}
              </>
            ) : (
              isAr ? 'تسجيل الحالة وإرسالها للفرز' : 'Register Case & Submit for Triage'
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus, textarea:focus, select:focus {
          border-color: ${PALETTE.primary} !important;
          box-shadow: 0 0 0 3px ${PALETTE.secondary}33;
        }
      `}</style>
    </div>
  );
};
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// src/components/auth/authTypesAndUtils.ts
// ============================================================================

export type PersonaRole =
  | 'patient'
  | 'physician'
  | 'nurse'
  | 'pharmacist'
  | 'lab_technician'
  | 'radiologist'
  | 'admin'
  | 'billing'
  | 'care_coordinator'
  | 'family_member'
  | 'paramedic';

export interface AuthSession {
  uid: string;
  phoneNumber: string;
  fullName: string;
  fullNameAr: string;
  role: PersonaRole;
  isVerified: boolean;
  locale: 'ar' | 'en';
  lastLoginAt: number;
}

export const DEFAULT_VERIFIED_NAME_EN = 'Sami Al-Harbi';
export const DEFAULT_VERIFIED_NAME_AR = 'سامي الحربي';

const GENERIC_FALLBACKS = new Set([
  'patient',
  'المريض',
  'alo patient',
  'مريض الو',
  'user',
  'مستخدم',
  'guest',
  'ضيف',
  'unknown',
  'غير معروف',
  '',
  ' ',
  undefined,
  null,
]);

export function isGenericOrInvalidName(name: string | null | undefined): boolean {
  if (!name) return true;
  const trimmed = name.trim().toLowerCase();
  return GENERIC_FALLBACKS.has(trimmed) || GENERIC_FALLBACKS.has(name.trim());
}

export function sanitizeAuthFullName(
  inputName: string | null | undefined,
  locale: 'ar' | 'en'
): { fullName: string; fullNameAr: string } {
  const defaultEn = DEFAULT_VERIFIED_NAME_EN;
  const defaultAr = DEFAULT_VERIFIED_NAME_AR;

  if (isGenericOrInvalidName(inputName)) {
    return {
      fullName: defaultEn,
      fullNameAr: defaultAr,
    };
  }

  const cleaned = inputName!.trim();

  if (locale === 'ar') {
    return {
      fullName: defaultEn,
      fullNameAr: cleaned,
    };
  }

  return {
    fullName: cleaned,
    fullNameAr: defaultAr,
  };
}

export function createSessionFromOtp(
  uid: string,
  phoneNumber: string,
  rawName: string | null | undefined,
  role: PersonaRole,
  locale: 'ar' | 'en'
): AuthSession {
  const { fullName, fullNameAr } = sanitizeAuthFullName(rawName, locale);

  return {
    uid,
    phoneNumber,
    fullName,
    fullNameAr,
    role,
    isVerified: true,
    locale,
    lastLoginAt: Date.now(),
  };
}

export function switchPersonaLocale(session: AuthSession, newLocale: 'ar' | 'en'): AuthSession {
  return {
    ...session,
    locale: newLocale,
  };
}

// ============================================================================
// src/hooks/useClinicalWorkflowState.ts
// ============================================================================

export interface ActiveClinicalCase {
  caseId: string;
  patientName: string;
  patientNameAr: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  chiefComplaint?: string;
  status: 'intake' | 'triage' | 'consultation' | 'prescription' | 'discharge' | 'closed';
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export interface ClinicalWorkflowState {
  activeCase: ActiveClinicalCase | null;
  caseHistory: ActiveClinicalCase[];
  currentPersonaIndex: number;
}

type WorkflowAction =
  | { type: 'INIT_CASE'; payload: Partial<ActiveClinicalCase> }
  | { type: 'UPDATE_CASE'; payload: Partial<ActiveClinicalCase> }
  | { type: 'SET_PATIENT_NAME'; payload: { name: string; nameAr: string } }
  | { type: 'CLOSE_CASE' }
  | { type: 'SWITCH_PERSONA'; payload: number };

function preservePatientName(
  existing: ActiveClinicalCase | null,
  incoming: Partial<ActiveClinicalCase>
): { patientName: string; patientNameAr: string } {
  const incomingName = incoming.patientName?.trim();
  const incomingNameAr = incoming.patientNameAr?.trim();

  const resolvedName =
    !isGenericOrInvalidName(incomingName)
      ? incomingName!
      : !isGenericOrInvalidName(existing?.patientName)
        ? existing!.patientName
        : DEFAULT_VERIFIED_NAME_EN;

  const resolvedNameAr =
    !isGenericOrInvalidName(incomingNameAr)
      ? incomingNameAr!
      : !isGenericOrInvalidName(existing?.patientNameAr)
        ? existing!.patientNameAr
        : DEFAULT_VERIFIED_NAME_AR;

  return {
    patientName: resolvedName,
    patientNameAr: resolvedNameAr,
  };
}

function workflowReducer(
  state: ClinicalWorkflowState,
  action: WorkflowAction
): ClinicalWorkflowState {
  switch (action.type) {
    case 'INIT_CASE': {
      const names = preservePatientName(null, action.payload);
      const now = Date.now();
      const newCase: ActiveClinicalCase = {
        caseId: action.payload.caseId || `CASE-${now}`,
        patientName: names.patientName,
        patientNameAr: names.patientNameAr,
        status: action.payload.status || 'intake',
        createdAt: now,
        updatedAt: now,
        ...action.payload,
        patientName: names.patientName,
        patientNameAr: names.patientNameAr,
      };
      return {
        ...state,
        activeCase: newCase,
        caseHistory: [...state.caseHistory, newCase],
      };
    }

    case 'UPDATE_CASE': {
      if (!state.activeCase) return state;

      const names = preservePatientName(state.activeCase, action.payload);
      const updatedCase: ActiveClinicalCase = {
        ...state.activeCase,
        ...action.payload,
        patientName: names.patientName,
        patientNameAr: names.patientNameAr,
        updatedAt: Date.now(),
      };

      return {
        ...state,
        activeCase: updatedCase,
        caseHistory: state.caseHistory.map((c) =>
          c.caseId === updatedCase.caseId ? updatedCase : c
        ),
      };
    }

    case 'SET_PATIENT_NAME': {
      if (!state.activeCase) return state;

      const safeName = isGenericOrInvalidName(action.payload.name)
        ? state.activeCase.patientName
        : action.payload.name.trim();

      const safeNameAr = isGenericOrInvalidName(action.payload.nameAr)
        ? state.activeCase.patientNameAr
        : action.payload.nameAr.trim();

      const updatedCase: ActiveClinicalCase = {
        ...state.activeCase,
        patientName: safeName || DEFAULT_VERIFIED_NAME_EN,
        patientNameAr: safeNameAr || DEFAULT_VERIFIED_NAME_AR,
        updatedAt: Date.now(),
      };

      return {
        ...state,
        activeCase: updatedCase,
        caseHistory: state.caseHistory.map((c) =>
          c.caseId === updatedCase.caseId ? updatedCase : c
        ),
      };
    }

    case 'CLOSE_CASE': {
      if (!state.activeCase) return state;
      const closedCase = {
        ...state.activeCase,
        status: 'closed' as const,
        updatedAt: Date.now(),
      };
      return {
        ...state,
        activeCase: null,
        caseHistory: state.caseHistory.map((c) =>
          c.caseId === closedCase.caseId ? closedCase : c
        ),
      };
    }

    case 'SWITCH_PERSONA': {
      return {
        ...state,
        currentPersonaIndex: Math.max(0, Math.min(10, action.payload)),
      };
    }

    default:
      return state;
  }
}

const INITIAL_WORKFLOW_STATE: ClinicalWorkflowState = {
  activeCase: null,
  caseHistory: [],
  currentPersonaIndex: 0,
};

export function useClinicalWorkflowState() {
  const [state, dispatch] = React.useReducer(workflowReducer, INITIAL_WORKFLOW_STATE);

  const initCase = useCallback((payload: Partial<ActiveClinicalCase>) => {
    dispatch({ type: 'INIT_CASE', payload });
  }, []);

  const updateCase = useCallback((payload: Partial<ActiveClinicalCase>) => {
    dispatch({ type: 'UPDATE_CASE', payload });
  }, []);

  const setPatientName = useCallback((name: string, nameAr: string) => {
    dispatch({ type: 'SET_PATIENT_NAME', payload: { name, nameAr } });
  }, []);

  const closeCase = useCallback(() => {
    dispatch({ type: 'CLOSE_CASE' });
  }, []);

  const switchPersona = useCallback((index: number) => {
    dispatch({ type: 'SWITCH_PERSONA', payload: index });
  }, []);

  return {
    state,
    activeCase: state.activeCase,
    initCase,
    updateCase,
    setPatientName,
    closeCase,
    switchPersona,
  };
}

// ============================================================================
// src/components/screens/PatientIntakeView.tsx
// ============================================================================

const PERSONA_PROFILES: Array<{ labelEn: string; labelAr: string; icon: string }> = [
  { labelEn: 'Patient', labelAr: 'المريض', icon: '🧑‍🦽' },
  { labelEn: 'Physician', labelAr: 'الطبيب', icon: '👨‍⚕️' },
  { labelEn: 'Nurse', labelAr: 'الممرض', icon: '👩‍⚕️' },
  { labelEn: 'Pharmacist', labelAr: 'الصيدلي', icon: '💊' },
  { labelEn: 'Lab Tech', labelAr: 'فني المختبر', icon: '🔬' },
  { labelEn: 'Radiologist', labelAr: 'أخصائي الأشعة', icon: '📡' },
  { labelEn: 'Admin', labelAr: 'الإداري', icon: '🏥' },
  { labelEn: 'Billing', labelAr: 'الفوترة', icon: '💳' },
  { labelEn: 'Coordinator', labelAr: 'منسق الرعاية', icon: '📋' },
  { labelEn: 'Family', labelAr: 'ذو المريض', icon: '👨‍👩‍👧' },
  { labelEn: 'Paramedic', labelAr: 'المسعف', icon: '🚑' },
];

interface PatientIntakeViewProps {
  session: AuthSession;
  workflow: ReturnType<typeof useClinicalWorkflowState>;
}

export const PatientIntakeView: React.FC<PatientIntakeViewProps> = ({ session, workflow }) => {
  const { activeCase, updateCase, setPatientName, switchPersona } = workflow;
  const isRtl = session.locale === 'ar';

  const [localNameEn, setLocalNameEn] = useState<string>('');
  const [localNameAr, setLocalNameAr] = useState<string>('');
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined);

  useEffect(() => {
    if (activeCase) {
      const resolvedEn =
        !isGenericOrInvalidName(activeCase.patientName)
          ? activeCase.patientName
          : !isGenericOrInvalidName(session.fullName)
            ? session.fullName
            : DEFAULT_VERIFIED_NAME_EN;

      const resolvedAr =
        !isGenericOrInvalidName(activeCase.patientNameAr)
          ? activeCase.patientNameAr
          : !isGenericOrInvalidName(session.fullNameAr)
            ? session.fullNameAr
            : DEFAULT_VERIFIED_NAME_AR;

      setLocalNameEn(resolvedEn);
      setLocalNameAr(resolvedAr);
      setChiefComplaint(activeCase.chiefComplaint || '');
      setDateOfBirth(activeCase.dateOfBirth || '');
      setGender(activeCase.gender);
    } else {
      setLocalNameEn(
        !isGenericOrInvalidName(session.fullName) ? session.fullName : DEFAULT_VERIFIED_NAME_EN
      );
      setLocalNameAr(
        !isGenericOrInvalidName(session.fullNameAr)
          ? session.fullNameAr
          : DEFAULT_VERIFIED_NAME_AR
      );
    }
  }, [activeCase, session.fullName, session.fullNameAr]);

  const displayPatientName = useMemo(() => {
    if (isRtl) {
      return (
        activeCase?.patientNameAr ||
        localNameAr ||
        session.fullNameAr ||
        DEFAULT_VERIFIED_NAME_AR
      );
    }
    return (
      activeCase?.patientName ||
      localNameEn ||
      session.fullName ||
      DEFAULT_VERIFIED_NAME_EN
    );
  }, [activeCase, localNameEn, localNameAr, session, isRtl]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const finalNameEn = isGenericOrInvalidName(localNameEn)
        ? activeCase?.patientName || DEFAULT_VERIFIED_NAME_EN
        : localNameEn.trim();

      const finalNameAr = isGenericOrInvalidName(localNameAr)
        ? activeCase?.patientNameAr || DEFAULT_VERIFIED_NAME_AR
        : localNameAr.trim();

      setPatientName(finalNameEn, finalNameAr);

      updateCase({
        chiefComplaint: chiefComplaint.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        status: 'triage',
      });
    },
    [localNameEn, localNameAr, chiefComplaint, dateOfBirth, gender, activeCase, setPatientName, updateCase]
  );

  const containerStyle: React.CSSProperties = {
    direction: isRtl ? 'rtl' : 'ltr',
    fontFamily: 'Cairo, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#E6FAF7',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
    padding: '32px',
    width: '100%',
    maxWidth: '640px',
    border: '1px solid #00C6AE',
  };

  const headerStyle: React.CSSProperties = {
    color: '#007B6E',
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '8px',
    textAlign: isRtl ? 'right' : 'left',
  };

  const subHeaderStyle: React.CSSProperties = {
    color: '#007B6E',
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '24px',
    textAlign: isRtl ? 'right' : 'left',
    opacity: 0.85,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#007B6E',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '6px',
    textAlign: isRtl ? 'right' : 'left',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #00C6AE',
    fontSize: '16px',
    fontFamily: 'Cairo, sans-serif',
    direction: isRtl ? 'rtl' : 'ltr',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    backgroundColor: '#E6FAF7',
    color: '#007B6E',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#007B6E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    cursor: 'pointer',
    marginTop: '24px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const whatsappButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#25D366',
    marginTop: '12px',
  };

  const personaSwitcherStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '24px',
    justifyContent: isRtl ? 'flex-end' : 'flex-start',
  };

  const personaChipBase: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Cairo, sans-serif',
    cursor: 'pointer',
    border: '1.5px solid #00C6AE',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  return (
    <div style={containerStyle} role="main" aria-label={isRtl ? 'استقبال المريض' : 'Patient Intake'}>
      <div style={cardStyle}>
        <h1 style={headerStyle}>
          {isRtl ? 'نموذج استقبال المريض' : 'Patient Intake Form'}
        </h1>
        <p style={subHeaderStyle}>
          {isRtl ? 'مرحباً، ' : 'Welcome, '}
          <span style={{ color: '#00C6AE', fontWeight: 700 }}>{displayPatientName}</span>
        </p>

        {/* 11 Persona Profile Switcher */}
        <nav
          style={personaSwitcherStyle}
          role="tablist"
          aria-label={isRtl ? 'تبديل الملف الشخصي' : 'Persona Profile Switcher'}
        >
          {PERSONA_PROFILES.map((persona, index) => {
            const isActive = workflow.state.currentPersonaIndex === index;
            const chipStyle: React.CSSProperties = {
              ...personaChipBase,
              backgroundColor: isActive ? '#007B6E' : '#E6FAF7',
              color: isActive ? '#FFFFFF' : '#007B6E',
              borderColor: isActive ? '#007B6E' : '#00C6AE',
            };
            return (
              <button
                key={`persona-${index}`}
                role="tab"
                aria-selected={isActive}
                aria-label={isRtl ? persona.labelAr : persona.labelEn}
                style={chipStyle}
                onClick={() => switchPersona(index)}
                type="button"
              >
                <span aria-hidden="true">{persona.icon}</span>
                {isRtl ? persona.labelAr : persona.labelEn}
              </button>
            );
          })}
        </nav>

        <form onSubmit={handleSubmit} noValidate>
          <div style={fieldGroupStyle}>
            <label htmlFor="patient-name-en" style={labelStyle}>
              {isRtl ? 'اسم المريض (بالإنجليزية)' : 'Patient Name (English)'}
            </label>
            <input
              id="patient-name-en"
              type="text"
              value={localNameEn}
              onChange={(e) => {
                const val = e.target.value;
                if (!isGenericOrInvalidName(val) || val.trim() === '') {
                  setLocalNameEn(val);
                }
              }}
              onBlur={() => {
                if (isGenericOrInvalidName(localNameEn)) {
                  setLocalNameEn(activeCase?.patientName || DEFAULT_VERIFIED_NAME_EN);
                }
              }}
              style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
              placeholder="Sami Al-Harbi"
              autoComplete="name"
              aria-required="true"
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="patient-name-ar" style={labelStyle}>
              {isRtl ? 'اسم المريض (بالعربية)' : 'Patient Name (Arabic)'}
            </label>
            <input
              id="patient-name-ar"
              type="text"
              value={localNameAr}
              onChange={(e) => {
                const val = e.target.value;
                if (!isGenericOrInvalidName(val) || val.trim() === '') {
                  setLocalNameAr(val);
                }
              }}
              onBlur={() => {
                if (isGenericOrInvalidName(localNameAr)) {
                  setLocalNameAr(activeCase?.patientNameAr || DEFAULT_VERIFIED_NAME_AR);
                }
              }}
              style={{ ...inputStyle, direction: 'rtl', textAlign: 'right' }}
              placeholder="سامي الحربي"
              autoComplete="name"
              aria-required="true"
            />
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="dob" style={labelStyle}>
              {isRtl ? 'تاريخ الميلاد' : 'Date of Birth'}
            </label>
            <input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              style={inputStyle}
              aria-required="false"
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              {isRtl ? 'الجنس' : 'Gender'}
            </label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#007B6E',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  style={{ accentColor: '#007B6E', width: '18px', height: '18px' }}
                />
                {isRtl ? 'ذكر' : 'Male'}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#007B6E',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  style={{ accentColor: '#007B6E', width: '18px', height: '18px' }}
                />
                {isRtl ? 'أنثى' : 'Female'}
              </label>
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="chief-complaint" style={labelStyle}>
              {isRtl ? 'الشكوى الرئيسية' : 'Chief Complaint'}
            </label>
            <textarea
              id="chief-complaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '100px',
              }}
              placeholder={
                isRtl
                  ? 'اكتب الشكوى الرئيسية هنا...'
                  : 'Describe the primary complaint here...'
              }
              aria-required="false"
            />
          </div>

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#005F55';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#007B6E';
            }}
            aria-label={isRtl ? 'إرسال وبدء التقييم' : 'Submit & Begin Triage'}
          >
            {isRtl ? 'إرسال وبدء التقييم' : 'Submit & Begin Triage'}
          </button>

          <button
            type="button"
            style={whatsappButtonStyle}
            onClick={() => {
              const msg = encodeURIComponent(
                isRtl
                  ? `مرحباً دكتور الو، أحتاج مساعدة للمريض ${displayPatientName}`
                  : `Hello ALO Doctor, I need assistance for patient ${displayPatientName}`
              );
              window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1EBE5D';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#25D366';
            }}
            aria-label={isRtl ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {isRtl ? 'تواصل عبر واتساب' : 'WhatsApp Support'}
          </button>
        </form>
      </div>

      <footer
        style={{
          marginTop: '32px',
          color: '#007B6E',
          fontSize: '13px',
          fontWeight: 500,
          opacity: 0.7,
          textAlign: 'center',
          fontFamily: 'Cairo, sans-serif',
        }}
      >
        {isRtl ? 'دكتور الو - الإصدار ٢.٤ النسخة السعودية' : 'ALO DOCTOR v2.4 Saudi Edition'}
      </footer>
    </div>
  );
};

export default PatientIntakeView;
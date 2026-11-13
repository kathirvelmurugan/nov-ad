import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// --- Types & Interfaces ---
interface TreatingDoctor {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive';
}

interface ActiveCase {
  id: string;
  patientName: string;
  treatingDoctor?: TreatingDoctor | null;
  triageNotes?: string;
  status: string;
}

interface PersonaProfile {
  id: string;
  role: string;
  name: string;
}

interface NurseTriageViewProps {
  activeCase: ActiveCase;
  currentPersona: PersonaProfile;
  onRouteToDoctorReview: (caseId: string, notes: string) => void;
  onUpdateTriageNotes: (caseId: string, notes: string) => void;
  onAssignDoctor: (caseId: string) => void;
}

// --- Constants ---
const COLORS = {
  tealPrimary: '#007B6E',
  tealSecondary: '#00C6AE',
  tealBackground: '#E6FAF7',
  whatsappGreen: '#25D366',
  errorRed: '#D32F2F',
  errorBackground: '#FDEDED',
  textDark: '#1A1A1A',
  textMuted: '#5F6368',
  white: '#FFFFFF',
  borderLight: '#E0E0E0',
};

const MIN_TRIAGE_NOTES_LENGTH = 20;

// --- Sub-Components ---

const FieldError: React.FC<{ message: string; dir: 'rtl' | 'ltr' }> = ({ message, dir }) => (
  <div
    role="alert"
    aria-live="polite"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
      padding: '10px 14px',
      backgroundColor: COLORS.errorBackground,
      borderRight: dir === 'rtl' ? `4px solid ${COLORS.errorRed}` : 'none',
      borderLeft: dir === 'ltr' ? `4px solid ${COLORS.errorRed}` : 'none',
      borderRadius: '6px',
      fontFamily: '"Cairo", sans-serif',
      fontSize: '13px',
      fontWeight: 600,
      color: COLORS.errorRed,
      direction: dir,
      textAlign: dir === 'rtl' ? 'right' : 'left',
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <span>{message}</span>
  </div>
);

const PersonaSwitcherIndicator: React.FC<{ persona: PersonaProfile; dir: 'rtl' | 'ltr' }> = ({ persona, dir }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: COLORS.tealBackground,
      borderRadius: '8px',
      marginBottom: '24px',
      border: `1px solid ${COLORS.tealSecondary}`,
      direction: dir,
      fontFamily: '"Cairo", sans-serif',
    }}
  >
    <span style={{ fontSize: '13px', color: COLORS.tealPrimary, fontWeight: 700 }}>
      {dir === 'rtl' ? 'الملف الشخصي النشط' : 'Active Profile'}
    </span>
    <span style={{ fontSize: '14px', color: COLORS.textDark, fontWeight: 600 }}>
      {persona.name} ({persona.role})
    </span>
  </div>
);

// --- Main Component ---

const NurseTriageView: React.FC<NurseTriageViewProps> = ({
  activeCase,
  currentPersona,
  onRouteToDoctorReview,
  onUpdateTriageNotes,
  onAssignDoctor,
}) => {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dir: 'rtl' | 'ltr' = isRTL ? 'rtl' : 'ltr';

  // Local State
  const [triageNotes, setTriageNotes] = useState<string>(activeCase.triageNotes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Validation Errors
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Memoized Validations
  const isDoctorValid = useMemo(() => {
    return Boolean(
      activeCase.treatingDoctor?.name && 
      activeCase.treatingDoctor.name.trim().length > 0 && 
      activeCase.treatingDoctor.status !== 'pending'
    );
  }, [activeCase.treatingDoctor]);

  const isNotesValid = useMemo(() => {
    return triageNotes.trim().length >= MIN_TRIAGE_NOTES_LENGTH;
  }, [triageNotes]);

  // Handlers
  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTriageNotes(value);
    
    // Clear error if user starts typing valid content
    if (value.trim().length >= MIN_TRIAGE_NOTES_LENGTH) {
      setNotesError(null);
    }
    
    // Auto-save draft to parent if needed
    if (onUpdateTriageNotes) {
      onUpdateTriageNotes(activeCase.id, value);
    }
  }, [activeCase.id, onUpdateTriageNotes]);

  const handleN07Transition = useCallback(async () => {
    let hasError = false;

    // Gap 4: Guard N07 click - verify treating doctor
    if (!isDoctorValid) {
      setDoctorError(
        isRTL 
          ? "يرجى تعيين الطبيب السعودي المعالج المعتمد قبل إرسال الملف." 
          : "Please assign an accredited Saudi treating doctor before routing the case."
      );
      hasError = true;
    } else {
      setDoctorError(null);
    }

    // Gap 5: Enforce minimum 20 characters for triage summary
    if (!isNotesValid) {
      setNotesError(
        isRTL 
          ? "الملخص التمريضي السريري مطلوب (20 حرفاً على الأقل)." 
          : "Clinical triage summary is required (minimum 20 characters)."
      );
      hasError = true;
    } else {
      setNotesError(null);
    }

    // Halt transition if any validation fails
    if (hasError) {
      return;
    }

    // Proceed with transition
    setIsSubmitting(true);
    try {
      await onRouteToDoctorReview(activeCase.id, triageNotes.trim());
    } catch (error) {
      console.error('[ALO DOCTOR v2.4] N07 Transition failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isDoctorValid, isNotesValid, isRTL, activeCase.id, triageNotes, onRouteToDoctorReview]);

  // Styles
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '"Cairo", sans-serif',
      direction: dir as 'rtl' | 'ltr',
      backgroundColor: COLORS.white,
      minHeight: '100vh',
      color: COLORS.textDark,
    },
    header: {
      fontSize: '22px',
      fontWeight: 800,
      color: COLORS.tealPrimary,
      marginBottom: '8px',
      textAlign: (isRTL ? 'right' : 'left') as 'left' | 'right',
    },
    subHeader: {
      fontSize: '14px',
      color: COLORS.textMuted,
      marginBottom: '24px',
      textAlign: (isRTL ? 'right' : 'left') as 'left' | 'right',
    },
    sectionCard: {
      backgroundColor: COLORS.white,
      border: `1px solid ${COLORS.borderLight}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0, 123, 110, 0.04)',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 700,
      color: COLORS.textDark,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    doctorInfoBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      backgroundColor: isDoctorValid ? COLORS.tealBackground : '#FFF8F8',
      border: `1px solid ${isDoctorValid ? COLORS.tealSecondary : COLORS.errorRed}33`,
      borderRadius: '8px',
      transition: 'all 0.2s ease',
    },
    doctorName: {
      fontSize: '15px',
      fontWeight: 600,
      color: isDoctorValid ? COLORS.tealPrimary : COLORS.errorRed,
    },
    doctorStatusBadge: {
      fontSize: '11px',
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: '12px',
      backgroundColor: isDoctorValid ? COLORS.tealPrimary : COLORS.errorRed,
      color: COLORS.white,
      textTransform: 'uppercase' as const,
    },
    assignButton: {
      padding: '8px 16px',
      backgroundColor: COLORS.white,
      color: COLORS.tealPrimary,
      border: `1.5px solid ${COLORS.tealPrimary}`,
      borderRadius: '6px',
      fontFamily: '"Cairo", sans-serif',
      fontSize: '13px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    textarea: {
      width: '100%',
      minHeight: '140px',
      padding: '14px',
      fontFamily: '"Cairo", sans-serif',
      fontSize: '14px',
      lineHeight: '1.6',
      color: COLORS.textDark,
      backgroundColor: COLORS.white,
      border: `1.5px solid ${notesError ? COLORS.errorRed : COLORS.borderLight}`,
      borderRadius: '8px',
      resize: 'vertical' as const,
      direction: dir as 'rtl' | 'ltr',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxSizing: 'border-box' as const,
    },
    charCount: {
      fontSize: '12px',
      color: triageNotes.trim().length < MIN_TRIAGE_NOTES_LENGTH ? COLORS.errorRed : COLORS.textMuted,
      textAlign: (isRTL ? 'left' : 'right') as 'left' | 'right',
      marginTop: '6px',
      fontWeight: 600,
    },
    n07Button: {
      width: '100%',
      padding: '16px 24px',
      backgroundColor: isSubmitting ? COLORS.textMuted : COLORS.tealPrimary,
      color: COLORS.white,
      border: 'none',
      borderRadius: '10px',
      fontFamily: '"Cairo", sans-serif',
      fontSize: '16px',
      fontWeight: 800,
      cursor: isSubmitting ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.2s ease',
      boxShadow: `0 4px 14px ${COLORS.tealPrimary}33`,
      marginTop: '12px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Persona Switcher Compatibility */}
      <PersonaSwitcherIndicator persona={currentPersona} dir={dir} />

      {/* Header */}
      <h1 style={styles.header}>
        {isRTL ? 'فرز التمريض' : 'Nurse Triage'}
      </h1>
      <p style={styles.subHeader}>
        {isRTL ? 'ملف المريض:' : 'Patient Case:'} {activeCase.patientName} • ID: {activeCase.id}
      </p>

      {/* Doctor Assignment Section (Gap 4) */}
      <section style={styles.sectionCard} aria-labelledby="doctor-assignment-heading">
        <h2 id="doctor-assignment-heading" style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.tealPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {isRTL ? 'تعيين الطبيب المعالج' : 'Treating Doctor Assignment'}
        </h2>

        <div style={styles.doctorInfoBox}>
          {isDoctorValid ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={styles.doctorName}>{activeCase.treatingDoctor!.name}</span>
                <span style={{ fontSize: '12px', color: COLORS.textMuted }}>
                  {isRTL ? 'طبيب سعودي معتمد' : 'Accredited Saudi Doctor'}
                </span>
              </div>
              <span style={styles.doctorStatusBadge}>
                {isRTL ? 'نشط' : 'Active'}
              </span>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={styles.doctorName}>
                  {activeCase.treatingDoctor?.status === 'pending' 
                    ? (isRTL ? 'قيد الانتظار...' : 'Pending...') 
                    : (isRTL ? 'لم يتم تعيين طبيب' : 'No doctor assigned')}
                </span>
                <span style={{ fontSize: '12px', color: COLORS.errorRed }}>
                  {isRTL ? 'مطلوب لإرسال الملف' : 'Required for case routing'}
                </span>
              </div>
              <button
                type="button"
                style={styles.assignButton}
                onClick={() => onAssignDoctor(activeCase.id)}
                aria-label={isRTL ? 'تعيين طبيب معالج' : 'Assign treating doctor'}
              >
                {isRTL ? 'تعيين طبيب' : 'Assign Doctor'}
              </button>
            </>
          )}
        </div>

        {/* Inline FieldError for Doctor */}
        {doctorError && <FieldError message={doctorError} dir={dir} />}
      </section>

      {/* Clinical Summary Section (Gap 5) */}
      <section style={styles.sectionCard} aria-labelledby="clinical-summary-heading">
        <h2 id="clinical-summary-heading" style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.tealPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          {isRTL ? 'الملخص التمريضي السريري' : 'Clinical Triage Summary'}
        </h2>

        <textarea
          style={styles.textarea}
          value={triageNotes}
          onChange={handleNotesChange}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = notesError ? COLORS.errorRed : COLORS.tealPrimary;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${notesError ? `${COLORS.errorRed}22` : `${COLORS.tealPrimary}22`}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = notesError ? COLORS.errorRed : COLORS.borderLight;
            e.currentTarget.style.boxShadow = 'none';
          }}
          placeholder={
            isRTL 
              ? 'أدخل الملخص السريري للمريض هنا (الحد الأدنى 20 حرفاً)...' 
              : 'Enter patient clinical triage summary here (minimum 20 characters)...'
          }
          aria-label={isRTL ? 'الملخص التمريضي السريري' : 'Clinical triage summary'}
          aria-invalid={!!notesError}
          aria-describedby={notesError ? 'triage-notes-error' : undefined}
          disabled={isSubmitting}
        />

        <div style={styles.charCount}>
          {triageNotes.trim().length} / {MIN_TRIAGE_NOTES_LENGTH} {isRTL ? 'حرف كحد أدنى' : 'chars minimum'}
        </div>

        {/* Inline FieldError for Notes */}
        {notesError && (
          <div id="triage-notes-error">
            <FieldError message={notesError} dir={dir} />
          </div>
        )}
      </section>

      {/* N07 Routing Action */}
      <button
        type="button"
        style={styles.n07Button}
        onClick={handleN07Transition}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        aria-label={isRTL ? 'إرسال لمراجعة الطبيب (N07)' : 'Route to Doctor Review (N07)'}
      >
        {isSubmitting ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            {isRTL ? 'جاري الإرسال...' : 'Routing...'}
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            {isRTL ? 'إرسال لمراجعة الطبيب (N07)' : 'Route to Doctor Review (N07)'}
          </>
        )}
      </button>

      {/* Global Styles for Animations & Cairo Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        * {
          box-sizing: border-box;
        }

        body {
          font-family: 'Cairo', sans-serif;
          margin: 0;
          padding: 0;
          background-color: ${COLORS.tealBackground};
        }

        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        textarea::placeholder {
          color: ${COLORS.textMuted};
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default NurseTriageView;
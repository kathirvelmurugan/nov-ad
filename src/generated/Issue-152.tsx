import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface FocusQuestion {
  id: string;
  textAr: string;
  textEn: string;
}

interface CaseData {
  caseId: string;
  stage: string;
  consultantPhone: string;
  focusQuestions: FocusQuestion[];
  patientSummary: string;
}

interface ConsultantMobileViewProps {
  caseId?: string;
  persona?: string;
}

const COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#5F6368',
  border: '#D1E8E5',
  error: '#D93025',
  success: '#007B6E'
};

const CONSULTANT_PHONE = '+919876543210';

const apiClient = {
  fetchCase: async (caseId: string): Promise<CaseData> => {
    const response = await fetch(`/api/v2/cases/${caseId}`);
    if (!response.ok) throw new Error('Failed to fetch case data');
    return response.json();
  },
  submitOpinion: async (
    caseId: string,
    payload: { focusAnswers: Record<string, string>; clinicalSynthesis: string }
  ): Promise<{ success: boolean; timestamp: string }> => {
    const response = await fetch(`/api/v2/cases/${caseId}/opinion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ALO-CLIENT': 'consultant-mobile-v2.4'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to submit opinion');
    return response.json();
  }
};

const getSaudiAstTimestamp = (): string => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const ConsultantMobileView: React.FC<ConsultantMobileViewProps> = ({ caseId: propCaseId, persona }) => {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const resolvedCaseId = propCaseId || urlParams.get('caseId') || '';
  const magicPassToken = urlParams.get('magicPass');

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<string>('INITIAL');

  const [focusAnswers, setFocusAnswers] = useState<Record<string, string>>({});
  const [clinicalSynthesis, setClinicalSynthesis] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState<string>('');

  const isRtl = useMemo(() => {
    return persona === 'ar' || navigator.language.startsWith('ar');
  }, [persona]);

  const dir = isRtl ? 'rtl' : 'ltr';
  const lang = isRtl ? 'ar-SA' : 'en-US';
  const fontFamily = "'Cairo', sans-serif";

  useEffect(() => {
    const initializeCase = async () => {
      if (!resolvedCaseId) {
        setError(isRtl ? 'معرف الحالة غير صالح' : 'Invalid case identifier');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await apiClient.fetchCase(resolvedCaseId);

        if (data.consultantPhone !== CONSULTANT_PHONE && !magicPassToken) {
          setError(isRtl ? 'غير مصرح بالوصول إلى هذه الحالة' : 'Unauthorized access to this case');
          setIsLoading(false);
          return;
        }

        setCaseData(data);
        setStage(data.stage);

        if (data.stage === 'OPINION_READY') {
          setIsLocked(true);
        }

        const initialAnswers: Record<string, string> = {};
        data.focusQuestions.forEach((q) => {
          initialAnswers[q.id] = '';
        });
        setFocusAnswers(initialAnswers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCase();
  }, [resolvedCaseId, magicPassToken, isRtl]);

  const handleFocusAnswerChange = useCallback((questionId: string, value: string) => {
    if (isLocked) return;
    setFocusAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  }, [isLocked]);

  const handleSynthesisChange = useCallback((value: string) => {
    if (isLocked) return;
    setClinicalSynthesis(value);
  }, [isLocked]);

  const handleSubmitOpinion = useCallback(async () => {
    if (!resolvedCaseId || isLocked || isSubmitting) return;

    const allAnswered = caseData?.focusQuestions.every(
      (q) => focusAnswers[q.id]?.trim().length > 0
    );

    if (!allAnswered) {
      setError(isRtl ? 'يرجى الإجابة على جميع الأسئلة المركزة' : 'Please answer all focus questions');
      return;
    }

    if (!clinicalSynthesis.trim()) {
      setError(isRtl ? 'يرجى تقديم التوليف السريري' : 'Please provide clinical synthesis');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await apiClient.submitOpinion(resolvedCaseId, {
        focusAnswers,
        clinicalSynthesis
      });

      const astTimestamp = getSaudiAstTimestamp();
      setSubmissionTimestamp(astTimestamp);
      setStage('OPINION_READY');
      setIsLocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [resolvedCaseId, isLocked, isSubmitting, caseData, focusAnswers, clinicalSynthesis, isRtl]);

  const styles = useMemo(() => ({
    container: {
      direction: dir as 'rtl' | 'ltr',
      fontFamily,
      backgroundColor: COLORS.background,
      minHeight: '100vh',
      padding: '16px',
      maxWidth: '480px',
      margin: '0 auto',
      boxSizing: 'border-box' as const
    },
    header: {
      backgroundColor: COLORS.primary,
      color: COLORS.white,
      padding: '20px 16px',
      borderRadius: '12px',
      marginBottom: '20px',
      textAlign: 'center' as const
    },
    headerTitle: {
      fontSize: '18px',
      fontWeight: 700,
      margin: 0,
      fontFamily
    },
    headerSubtitle: {
      fontSize: '13px',
      opacity: 0.9,
      marginTop: '4px',
      fontFamily
    },
    card: {
      backgroundColor: COLORS.white,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      border: `1px solid ${COLORS.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: 700,
      color: COLORS.primary,
      marginBottom: '12px',
      fontFamily,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    questionBlock: {
      marginBottom: '16px',
      paddingBottom: '16px',
      borderBottom: `1px solid ${COLORS.border}`
    },
    questionText: {
      fontSize: '14px',
      fontWeight: 600,
      color: COLORS.textDark,
      marginBottom: '8px',
      fontFamily,
      lineHeight: 1.6
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '12px',
      borderRadius: '8px',
      border: `1.5px solid ${COLORS.border}`,
      fontFamily,
      fontSize: '14px',
      resize: 'vertical' as const,
      direction: dir as 'rtl' | 'ltr',
      backgroundColor: isLocked ? '#F8F9FA' : COLORS.white,
      color: COLORS.textDark,
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box' as const
    },
    textareaFocus: {
      borderColor: COLORS.secondary
    },
    synthesisTextarea: {
      width: '100%',
      minHeight: '160px',
      padding: '12px',
      borderRadius: '8px',
      border: `1.5px solid ${COLORS.border}`,
      fontFamily,
      fontSize: '14px',
      resize: 'vertical' as const,
      direction: dir as 'rtl' | 'ltr',
      backgroundColor: isLocked ? '#F8F9FA' : COLORS.white,
      color: COLORS.textDark,
      outline: 'none',
      boxSizing: 'border-box' as const
    },
    submitButton: {
      width: '100%',
      padding: '16px',
      backgroundColor: isLocked ? COLORS.textMuted : COLORS.primary,
      color: COLORS.white,
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 700,
      fontFamily,
      cursor: isLocked || isSubmitting ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'background-color 0.2s ease',
      opacity: isSubmitting ? 0.7 : 1
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: COLORS.background,
      color: COLORS.primary,
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 700,
      fontFamily,
      border: `1.5px solid ${COLORS.secondary}`,
      marginTop: '12px'
    },
    errorBanner: {
      backgroundColor: '#FDECEA',
      color: COLORS.error,
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily,
      marginBottom: '16px',
      border: '1px solid #F5C6CB'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      fontFamily
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: `3px solid ${COLORS.border}`,
      borderTopColor: COLORS.primary,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      marginBottom: '16px'
    },
    milestoneTag: {
      display: 'inline-block',
      backgroundColor: COLORS.secondary,
      color: COLORS.white,
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 700,
      fontFamily
    }
  }), [dir, fontFamily, isLocked, isSubmitting]);

  if (isLoading) {
    return (
      <div style={styles.container}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <span style={{ color: COLORS.primary, fontSize: '14px', fontWeight: 600 }}>
            {isRtl ? 'جاري تحميل بيانات الحالة...' : 'Loading case data...'}
          </span>
        </div>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBanner}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container} dir={dir} lang={lang}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus { border-color: ${COLORS.secondary} !important; }
        button:hover:not(:disabled) { filter: brightness(1.05); }
        * { box-sizing: border-box; }
      `}</style>

      <header style={styles.header}>
        <h1 style={styles.headerTitle}>
          {isRtl ? 'الرأي الطبي التخصصي' : 'Specialist Clinical Opinion'}
        </h1>
        <p style={styles.headerSubtitle}>
          {isRtl ? 'نظام الاستشارات الطبية عبر الحدود - K06' : 'Cross-Border Clinical Consultation System - K06'}
        </p>
        <div style={{ marginTop: '8px' }}>
          <span style={styles.milestoneTag}>
            {stage === 'OPINION_READY' ? 'M05' : 'K06'}
          </span>
        </div>
      </header>

      {error && (
        <div style={styles.errorBanner} role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {isLocked && (
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 8px' }}>
              <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill={COLORS.primary}/>
            </svg>
            <div style={styles.badge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              {isRtl ? 'تم اعتماد الرأي الطبي التخصصي' : 'Certified Clinical Opinion Submitted'}
            </div>
            {submissionTimestamp && (
              <p style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '8px', fontFamily }}>
                {isRtl ? 'توقيت السعودية (AST): ' : 'Saudi AST Timestamp: '}
                {submissionTimestamp}
              </p>
            )}
          </div>
        </div>
      )}

      <section style={styles.card} aria-label={isRtl ? 'الأسئلة المركزة' : 'Focus Questions'}>
        <h2 style={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.primary}>
            <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
          </svg>
          {isRtl ? 'الأسئلة المركزة من الطبيب المعالج' : 'Focus Questions from Treating Doctor'}
        </h2>

        {caseData?.focusQuestions.map((question, index) => (
          <div key={question.id} style={{
            ...styles.questionBlock,
            borderBottom: index === caseData.focusQuestions.length - 1 ? 'none' : `1px solid ${COLORS.border}`
          }}>
            <label
              htmlFor={`focus-answer-${question.id}`}
              style={styles.questionText}
            >
              <span style={{ color: COLORS.secondary, fontWeight: 700, marginLeft: isRtl ? 0 : '6px', marginRight: isRtl ? '6px' : 0 }}>
                {index + 1}.
              </span>
              {isRtl ? question.textAr : question.textEn}
            </label>
            <textarea
              id={`focus-answer-${question.id}`}
              style={styles.textarea}
              value={focusAnswers[question.id] || ''}
              onChange={(e) => handleFocusAnswerChange(question.id, e.target.value)}
              disabled={isLocked}
              placeholder={isRtl ? 'أدخل إجابتك السريرية هنا...' : 'Enter your clinical answer here...'}
              aria-required="true"
              aria-disabled={isLocked}
            />
          </div>
        ))}
      </section>

      <section style={styles.card} aria-label={isRtl ? 'التوليف السريري' : 'Clinical Synthesis'}>
        <h2 style={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.primary}>
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          {isRtl ? 'التوليف السريري للرأي الثاني' : 'Comprehensive Second Opinion Synthesis'}
        </h2>
        <textarea
          id="clinical-synthesis"
          style={styles.synthesisTextarea}
          value={clinicalSynthesis}
          onChange={(e) => handleSynthesisChange(e.target.value)}
          disabled={isLocked}
          placeholder={isRtl ? 'قدم توليفك السريري الشامل وتوصياتك...' : 'Provide your comprehensive clinical synthesis and recommendations...'}
          aria-required="true"
          aria-disabled={isLocked}
        />
      </section>

      {!isLocked && (
        <button
          type="button"
          style={styles.submitButton}
          onClick={handleSubmitOpinion}
          disabled={isSubmitting || isLocked}
          aria-busy={isSubmitting}
          aria-label={isRtl ? 'اعتماد الرأي الطبي التخصصي' : 'Submit Formal Opinion'}
        >
          {isSubmitting ? (
            <>
              <div style={{
                width: '18px',
                height: '18px',
                border: `2px solid rgba(255,255,255,0.3)`,
                borderTopColor: COLORS.white,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              {isRtl ? 'جاري الاعتماد...' : 'Submitting...'}
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
              {isRtl ? 'اعتماد الرأي الطبي التخصصي' : 'Submit Formal Opinion'}
            </>
          )}
        </button>
      )}

      <footer style={{
        textAlign: 'center',
        padding: '20px 0',
        fontSize: '11px',
        color: COLORS.textMuted,
        fontFamily
      }}>
        <p>ALO DOCTOR v2.4 Saudi Edition</p>
        <p>{isRtl ? 'سجل سريري معتمد - M05' : 'Certified Clinical Record - M05'}</p>
      </footer>
    </div>
  );
};

export default ConsultantMobileView;
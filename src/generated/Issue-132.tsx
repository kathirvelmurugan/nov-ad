import React, { useEffect, useMemo, useState, useCallback } from 'react';

// ============================================================================
// ALO DOCTOR v2.4 Saudi Edition - Types & Constants
// ============================================================================

type PersonaRole = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';

interface ConsultantToken {
  otpVerified?: boolean;
  sessionCookieActive?: boolean;
}

interface CaseRecord {
  id: string;
  caseNumber: string;
  patientName: string;
  currentStage: string;
  consultantToken?: ConsultantToken;
  isClosed?: boolean;
  isSubmitted?: boolean;
  focusQuestions?: string[];
  clinicalSynthesis?: string;
}

interface ScreenRouterProps {
  cases: CaseRecord[];
  activeCase: CaseRecord;
  onSelectCase: (caseId: string) => void;
  currentPersona: PersonaRole;
  language: 'ar' | 'en';
}

interface ConsultantMobileViewProps {
  activeCase: CaseRecord;
  onNavigate: (screen: string) => void;
  onSubmitOpinion: (focusAnswers: string[], synthesis: string) => void;
  language: 'ar' | 'en';
  currentPersona: PersonaRole;
}

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textLight: '#FFFFFF',
  error: '#D32F2F',
};

const I18N = {
  en: {
    writtenOpinion: 'Written Second Opinion',
    focusQuestions: 'Focus Questions',
    clinicalSynthesis: 'Comprehensive Clinical Synthesis',
    submit: 'Submit Consultation',
    submitting: 'Submitting...',
    accessDenied: 'Access Denied. Full verification required for this action.',
    caseLocked: 'Case Scoped Access Active',
    q1: 'What are the primary differential diagnoses based on the provided imaging and labs?',
    q2: 'Are there any immediate surgical or interventional indications?',
    q3: 'What is the recommended pharmacological management plan?',
    placeholderSynthesis: 'Enter your comprehensive clinical synthesis here...',
    placeholderAnswer: 'Type your detailed response...',
    success: 'Consultation submitted successfully to ALO Care Coordinator.',
  },
  ar: {
    writtenOpinion: 'الرأي الطبي الثاني المكتوب',
    focusQuestions: 'الأسئلة المحورية',
    clinicalSynthesis: 'التوليف السريري الشامل',
    submit: 'إرسال الاستشارة',
    submitting: 'جاري الإرسال...',
    accessDenied: 'تم رفض الوصول. التحقق الكامل مطلوب لهذا الإجراء.',
    caseLocked: 'الوصول النطاقي للحالة مفعل',
    q1: 'ما هي التشخيصات التفريقية الأولية بناءً على الصور والتحاليل المقدمة؟',
    q2: 'هل توجد أي دلائل فورية للتدخل الجراحي أو القسطرة؟',
    q3: 'ما هي الخطة الدوائية الموصى بها؟',
    placeholderSynthesis: 'أدخل التوليف السريري الشامل هنا...',
    placeholderAnswer: 'اكتب إجابتك التفصيلية...',
    success: 'تم إرسال الاستشارة بنجاح إلى منسق رعاية آلو.',
  },
};

// ============================================================================
// Component 1: src/router/ScreenRouter.tsx
// ============================================================================

export const ScreenRouter: React.FC<ScreenRouterProps> = ({
  cases,
  activeCase,
  onSelectCase,
  currentPersona,
  language,
}) => {
  const [isRouting, setIsRouting] = useState(true);

  useEffect(() => {
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const magicToken = searchParams?.get('token') || searchParams?.get('magic_token');
    const queryCaseId = searchParams?.get('caseId') || searchParams?.get('case_id');
    const hasMagicLinkToken = Boolean(magicToken);

    if (hasMagicLinkToken && queryCaseId) {
      const matchedCase = cases.find(
        (c) => c.id === queryCaseId || c.caseNumber === queryCaseId
      );

      if (matchedCase) {
        if (activeCase.id !== matchedCase.id) {
          onSelectCase(matchedCase.id);
        }
      }
    }

    setIsRouting(false);
  }, [cases, activeCase.id, onSelectCase]);

  if (isRouting) {
    return (
      <div
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        style={{
          fontFamily: 'Cairo, sans-serif',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: PALETTE.background,
          color: PALETTE.primary,
        }}
      >
        <p>{language === 'ar' ? 'جاري تأمين الاتصال...' : 'Securing connection...'}</p>
      </div>
    );
  }

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{
        fontFamily: 'Cairo, sans-serif',
        minHeight: '100vh',
        backgroundColor: PALETTE.background,
      }}
    >
      {currentPersona === 'K' ? (
        <ConsultantMobileView
          activeCase={activeCase}
          onNavigate={() => {}}
          onSubmitOpinion={() => {}}
          language={language}
          currentPersona={currentPersona}
        />
      ) : (
        <div style={{ padding: '24px', color: PALETTE.textDark }}>
          <h2>ALO DOCTOR v2.4</h2>
          <p>Active Persona: {currentPersona}</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Component 2: src/components/screens/ConsultantMobileView.tsx
// ============================================================================

export const ConsultantMobileView: React.FC<ConsultantMobileViewProps> = ({
  activeCase,
  onNavigate,
  onSubmitOpinion,
  language,
  currentPersona,
}) => {
  const t = I18N[language];
  const isRtl = language === 'ar';

  const hasMagicToken = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get('token') || params.get('magic_token'));
  }, []);

  const isCaseAccepted = activeCase.currentStage === 'ACCEPTED';

  const isOtpVerified = useMemo(() => {
    return (
      hasMagicToken ||
      !!activeCase.consultantToken?.otpVerified ||
      !!activeCase.consultantToken?.sessionCookieActive ||
      activeCase.currentStage === 'WITH_CONSULTANT' ||
      isCaseAccepted
    );
  }, [hasMagicToken, activeCase, isCaseAccepted]);

  const [currentScreen, setCurrentScreen] = useState<string>('K01');
  const [focusAnswers, setFocusAnswers] = useState<string[]>(['', '', '']);
  const [clinicalSynthesis, setClinicalSynthesis] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (hasMagicToken && !activeCase.isClosed && !activeCase.isSubmitted) {
      setCurrentScreen('K06');
    }
  }, [hasMagicToken, activeCase.isClosed, activeCase.isSubmitted]);

  useEffect(() => {
    if (activeCase.focusQuestions && activeCase.focusQuestions.length === 3) {
      // Preserve existing answers if navigating back
    }
    if (activeCase.clinicalSynthesis) {
      setClinicalSynthesis(activeCase.clinicalSynthesis);
    }
  }, [activeCase.id, activeCase.focusQuestions, activeCase.clinicalSynthesis]);

  const handleFocusAnswerChange = useCallback((index: number, value: string) => {
    setFocusAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isOtpVerified) return;
    if (activeCase.isClosed || activeCase.isSubmitted) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      onSubmitOpinion(focusAnswers, clinicalSynthesis);
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [isOtpVerified, activeCase, focusAnswers, clinicalSynthesis, onSubmitOpinion]);

  if (!isOtpVerified) {
    return (
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{
          fontFamily: 'Cairo, sans-serif',
          padding: '32px 16px',
          textAlign: 'center',
          color: PALETTE.error,
          backgroundColor: PALETTE.white,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={PALETTE.error} strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2 style={{ marginTop: '16px', fontSize: '20px', fontWeight: 700 }}>{t.accessDenied}</h2>
      </div>
    );
  }

  const focusQuestionsText = [t.q1, t.q2, t.q3];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: PALETTE.background,
        minHeight: '100vh',
        paddingBottom: '100px',
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: PALETTE.primary,
          color: PALETTE.textLight,
          padding: '20px 16px',
          borderBottom: `3px solid ${PALETTE.secondary}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              {t.writtenOpinion}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
              {activeCase.caseNumber} • {activeCase.patientName}
            </p>
          </div>
          {hasMagicToken && (
            <span
              style={{
                backgroundColor: PALETTE.whatsapp,
                color: PALETTE.white,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t.caseLocked}
            </span>
          )}
        </div>
      </header>

      {/* Screen K06: Written Second Opinion & Focus Questions */}
      {currentScreen === 'K06' && (
        <main style={{ padding: '24px 16px' }}>
          {submitSuccess ? (
            <div
              style={{
                backgroundColor: PALETTE.white,
                borderRadius: '16px',
                padding: '40px 24px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 123, 110, 0.08)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: PALETTE.background,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={PALETTE.primary} strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ color: PALETTE.primary, fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>
                {t.success}
              </h2>
            </div>
          ) : (
            <>
              {/* Focus Questions Section */}
              <section style={{ marginBottom: '32px' }}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: PALETTE.primary,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PALETTE.secondary} strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {t.focusQuestions}
                </h2>

                {focusQuestionsText.map((question, index) => (
                  <div
                    key={`focus-q-${index}`}
                    style={{
                      backgroundColor: PALETTE.white,
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      boxShadow: '0 2px 8px rgba(0, 123, 110, 0.04)',
                      border: `1px solid ${PALETTE.background}`,
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: PALETTE.textDark,
                        marginBottom: '10px',
                        lineHeight: 1.6,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: PALETTE.primary,
                          color: PALETTE.white,
                          fontSize: '12px',
                          fontWeight: 700,
                          marginRight: isRtl ? '0' : '10px',
                          marginLeft: isRtl ? '10px' : '0',
                        }}
                      >
                        {index + 1}
                      </span>
                      {question}
                    </label>
                    <textarea
                      value={focusAnswers[index] || ''}
                      onChange={(e) => handleFocusAnswerChange(index, e.target.value)}
                      placeholder={t.placeholderAnswer}
                      disabled={activeCase.isClosed || activeCase.isSubmitted}
                      rows={4}
                      aria-label={`${t.focusQuestions} ${index + 1}`}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1.5px solid ${PALETTE.secondary}33`,
                        fontFamily: 'Cairo, sans-serif',
                        fontSize: '14px',
                        color: PALETTE.textDark,
                        backgroundColor: PALETTE.background,
                        resize: 'vertical',
                        direction: isRtl ? 'rtl' : 'ltr',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = PALETTE.primary;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = `${PALETTE.secondary}33`;
                      }}
                    />
                  </div>
                ))}
              </section>

              {/* Clinical Synthesis Section */}
              <section style={{ marginBottom: '32px' }}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: PALETTE.primary,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PALETTE.secondary} strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  {t.clinicalSynthesis}
                </h2>

                <div
                  style={{
                    backgroundColor: PALETTE.white,
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0, 123, 110, 0.04)',
                    border: `1px solid ${PALETTE.background}`,
                  }}
                >
                  <textarea
                    value={clinicalSynthesis}
                    onChange={(e) => setClinicalSynthesis(e.target.value)}
                    placeholder={t.placeholderSynthesis}
                    disabled={activeCase.isClosed || activeCase.isSubmitted}
                    rows={8}
                    aria-label={t.clinicalSynthesis}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${PALETTE.secondary}33`,
                      fontFamily: 'Cairo, sans-serif',
                      fontSize: '14px',
                      color: PALETTE.textDark,
                      backgroundColor: PALETTE.background,
                      resize: 'vertical',
                      direction: isRtl ? 'rtl' : 'ltr',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      lineHeight: 1.8,
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = PALETTE.primary;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = `${PALETTE.secondary}33`;
                    }}
                  />
                </div>
              </section>
            </>
          )}
        </main>
      )}

      {/* Sticky Submit Footer */}
      {!submitSuccess && currentScreen === 'K06' && !activeCase.isClosed && !activeCase.isSubmitted && (
        <footer
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: PALETTE.white,
            padding: '16px',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
            zIndex: 100,
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isOtpVerified}
            aria-busy={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isSubmitting ? PALETTE.secondary : PALETTE.primary,
              color: PALETTE.white,
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'Cairo, sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
              opacity: isSubmitting ? 0.8 : 1,
            }}
          >
            {isSubmitting ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    animation: 'spin 1s linear infinite',
                  }}
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                {t.submitting}
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {t.submit}
              </>
            )}
          </button>
        </footer>
      )}

      {/* Global Styles for Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Cairo', sans-serif;
          background-color: ${PALETTE.background};
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        textarea::placeholder {
          color: #9CA3AF;
          font-family: 'Cairo', sans-serif;
        }

        button:hover:not(:disabled) {
          filter: brightness(1.05);
        }

        button:active:not(:disabled) {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default ScreenRouter;
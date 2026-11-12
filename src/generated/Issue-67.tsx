import React, { useState, useMemo, useCallback, useId } from 'react';

// --- Types & Interfaces ---
interface ConsultantMobileViewProps {
  lang: 'ar' | 'en';
  personaId: string;
  consultationType?: 'written' | 'video' | 'audio';
  focusQuestions?: string[];
  onSubmitOpinion?: (payload: OpinionPayload) => void;
}

interface OpinionPayload {
  opinionText: string;
  focusAnswers: [string, string, string];
}

interface FieldErrorProps {
  id: string;
  message: string;
  lang: 'ar' | 'en';
}

// --- Constants & i18n ---
const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  error: '#D32F2F',
  textDark: '#1A1A1A',
  textMuted: '#5F6368',
  white: '#FFFFFF',
};

const I18N = {
  en: {
    focusQuestionLabel: 'Focus Question',
    answerPlaceholder: 'Provide a detailed clinical answer (minimum 15 characters)...',
    answerError: 'Each focus question answer must be at least 15 characters long.',
    opinionLabel: 'Comprehensive Written Second Opinion',
    opinionPlaceholder: 'Write your comprehensive medical second opinion here...',
    charCounter: (current: number, min: number) => `${current} / ${min} characters`,
    opinionError: 'Comprehensive written second opinion must be at least 50 characters.',
    submitBtn: 'Submit Consultant Opinion',
  },
  ar: {
    focusQuestionLabel: 'سؤال التركيز السريري',
    answerPlaceholder: 'قدم إجابة سريرية مفصلة (لا تقل عن 15 حرفاً)...',
    answerError: 'يجب ألا تقل إجابة كل سؤال تركيز عن 15 حرفاً.',
    opinionLabel: 'الرأي الطبي التخصصي المكتوب الشامل',
    opinionPlaceholder: 'اكتب رأيك الطبي التخصصي الثاني الشامل هنا...',
    charCounter: (current: number, min: number) => `${current} / ${min} حرف`,
    opinionError: 'الرأي الطبي التخصصي المكتوب يجب ألا يقل عن 50 حرفاً.',
    submitBtn: 'إرسال رأي الاستشاري',
  },
};

// --- Sub-components ---

const FieldError: React.FC<FieldErrorProps> = ({ id, message, lang }) => (
  <div
    id={id}
    role="alert"
    aria-live="polite"
    style={{
      color: PALETTE.error,
      fontSize: '0.8125rem',
      marginTop: '0.375rem',
      fontFamily: '"Cairo", sans-serif',
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      textAlign: lang === 'ar' ? 'right' : 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <span>{message}</span>
  </div>
);

// --- Main Component: ConsultantWrittenOpinionSection ---

export const ConsultantWrittenOpinionSection: React.FC<ConsultantMobileViewProps> = ({
  lang = 'en',
  personaId,
  consultationType = 'written',
  focusQuestions = [],
  onSubmitOpinion,
}) => {
  const t = I18N[lang];
  const isRTL = lang === 'ar';

  // Gap 7 Fix: Removed hardcoded TAVR pre-fills. Initialized to empty strings.
  const [focusAnswers, setFocusAnswers] = useState<[string, string, string]>(['', '', '']);
  const [opinionText, setOpinionText] = useState<string>('');
  
  // Validation state tracking for user feedback
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);
  const [touchedAnswers, setTouchedAnswers] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [touchedOpinion, setTouchedOpinion] = useState<boolean>(false);

  // Unique IDs for A11y aria-describedby
  const opinionId = useId();
  const opinionErrorId = useId();
  const answerIds = [useId(), useId(), useId()];
  const answerErrorIds = [useId(), useId(), useId()];

  const MIN_ANSWER_LENGTH = 15;
  const MIN_OPINION_LENGTH = 50;

  // Validation logic
  const isAnswerValid = useCallback((ans: string) => ans.trim().length >= MIN_ANSWER_LENGTH, []);
  const isOpinionValid = useMemo(() => opinionText.trim().length >= MIN_OPINION_LENGTH, [opinionText]);

  const allAnswersValid = useMemo(
    () => focusAnswers.every((ans) => isAnswerValid(ans)),
    [focusAnswers, isAnswerValid]
  );

  const isFormValid = allAnswersValid && isOpinionValid;

  // Handlers
  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...focusAnswers] as [string, string, string];
    newAnswers[index] = value;
    setFocusAnswers(newAnswers);
  };

  const handleAnswerBlur = (index: number) => {
    const newTouched = [...touchedAnswers] as [boolean, boolean, boolean];
    newTouched[index] = true;
    setTouchedAnswers(newTouched);
  };

  const handleOpinionBlur = () => {
    setTouchedOpinion(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setTouchedAnswers([true, true, true]);
    setTouchedOpinion(true);

    if (isFormValid && onSubmitOpinion) {
      onSubmitOpinion({
        opinionText: opinionText.trim(),
        focusAnswers: focusAnswers.map((a) => a.trim()) as [string, string, string],
      });
    }
  };

  const showOpinionError = (attemptedSubmit || touchedOpinion) && !isOpinionValid;
  const shouldRenderFocusQuestions = focusQuestions.length > 0 || consultationType === 'written';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        fontFamily: '"Cairo", sans-serif',
        backgroundColor: PALETTE.white,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
        border: `1px solid ${PALETTE.background}`,
        maxWidth: '800px',
        margin: '0 auto',
      }}
      data-persona={personaId}
      data-lang={lang}
    >
      {/* Focus Questions Section */}
      {shouldRenderFocusQuestions && (
        <section aria-labelledby={`focus-section-${personaId}`} style={{ marginBottom: '32px' }}>
          <h3
            id={`focus-section-${personaId}`}
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: PALETTE.primary,
              marginBottom: '16px',
              borderBottom: `2px solid ${PALETTE.background}`,
              paddingBottom: '8px',
            }}
          >
            {t.focusQuestionLabel}s
          </h3>

          {[0, 1, 2].map((index) => {
            const questionText = focusQuestions[index] || `${t.focusQuestionLabel} ${index + 1}`;
            const showError = (attemptedSubmit || touchedAnswers[index]) && !isAnswerValid(focusAnswers[index]);

            return (
              <div key={index} style={{ marginBottom: '20px' }}>
                <label
                  htmlFor={answerIds[index]}
                  style={{
                    display: 'block',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: PALETTE.textDark,
                    marginBottom: '8px',
                  }}
                >
                  {questionText}
                </label>
                <textarea
                  id={answerIds[index]}
                  value={focusAnswers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  onBlur={() => handleAnswerBlur(index)}
                  placeholder={t.answerPlaceholder}
                  rows={3}
                  aria-invalid={showError}
                  aria-describedby={showError ? answerErrorIds[index] : undefined}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '0.9375rem',
                    fontFamily: '"Cairo", sans-serif',
                    lineHeight: 1.6,
                    color: PALETTE.textDark,
                    backgroundColor: PALETTE.background,
                    border: `1.5px solid ${showError ? PALETTE.error : PALETTE.secondary}`,
                    borderRadius: '10px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    direction: isRTL ? 'rtl' : 'ltr',
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = showError ? PALETTE.error : PALETTE.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${showError ? 'rgba(211, 47, 47, 0.15)' : 'rgba(0, 123, 110, 0.15)'}`;
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.borderColor = showError ? PALETTE.error : PALETTE.secondary;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {showError && (
                  <FieldError id={answerErrorIds[index]} message={t.answerError} lang={lang} />
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Written Opinion Section */}
      <section aria-labelledby={`opinion-section-${personaId}`} style={{ marginBottom: '32px' }}>
        <label
          id={`opinion-section-${personaId}`}
          htmlFor={opinionId}
          style={{
            display: 'block',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: PALETTE.primary,
            marginBottom: '12px',
          }}
        >
          {t.opinionLabel}
        </label>

        <div style={{ position: 'relative' }}>
          <textarea
            id={opinionId}
            value={opinionText}
            onChange={(e) => setOpinionText(e.target.value)}
            onBlur={handleOpinionBlur}
            placeholder={t.opinionPlaceholder}
            rows={6}
            aria-invalid={showOpinionError}
            aria-describedby={`${opinionId}-counter ${showOpinionError ? opinionErrorId : ''}`}
            style={{
              width: '100%',
              padding: '16px',
              paddingBottom: '40px',
              fontSize: '1rem',
              fontFamily: '"Cairo", sans-serif',
              lineHeight: 1.7,
              color: PALETTE.textDark,
              backgroundColor: PALETTE.white,
              border: `1.5px solid ${showOpinionError ? PALETTE.error : PALETTE.secondary}`,
              borderRadius: '12px',
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              direction: isRTL ? 'rtl' : 'ltr',
              textAlign: isRTL ? 'right' : 'left',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = showOpinionError ? PALETTE.error : PALETTE.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${showOpinionError ? 'rgba(211, 47, 47, 0.15)' : 'rgba(0, 123, 110, 0.15)'}`;
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = showOpinionError ? PALETTE.error : PALETTE.secondary;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          
          {/* Live Character Counter */}
          <div
            id={`${opinionId}-counter`}
            aria-live="polite"
            style={{
              position: 'absolute',
              bottom: '12px',
              [isRTL ? 'left' : 'right']: '16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: opinionText.trim().length >= MIN_OPINION_LENGTH ? PALETTE.primary : PALETTE.textMuted,
              fontFamily: '"Cairo", sans-serif',
              pointerEvents: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {t.charCounter(opinionText.trim().length, MIN_OPINION_LENGTH)}
          </div>
        </div>

        {showOpinionError && (
          <FieldError id={opinionErrorId} message={t.opinionError} lang={lang} />
        )}
      </section>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: isRTL ? 'flex-start' : 'flex-end' }}>
        <button
          type="submit"
          aria-disabled={!isFormValid && attemptedSubmit}
          aria-describedby={showOpinionError ? opinionErrorId : undefined}
          style={{
            fontFamily: '"Cairo", sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            color: PALETTE.white,
            backgroundColor: PALETTE.primary,
            border: 'none',
            borderRadius: '12px',
            padding: '14px 32px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            opacity: !isFormValid && attemptedSubmit ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(0, 123, 110, 0.25)',
            direction: isRTL ? 'rtl' : 'ltr',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#005F55';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 123, 110, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = PALETTE.primary;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 123, 110, 0.25)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = `3px solid ${PALETTE.secondary}`;
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          {t.submitBtn}
        </button>
      </div>
    </form>
  );
};

// --- Parent Screen Wrapper: ConsultantMobileView ---

export const ConsultantMobileView: React.FC<ConsultantMobileViewProps> = (props) => {
  const { lang = 'en', personaId } = props;
  const isRTL = lang === 'ar';

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      style={{
        minHeight: '100vh',
        backgroundColor: PALETTE.background,
        fontFamily: '"Cairo", sans-serif',
        padding: '16px',
        paddingTop: 'env(safe-area-inset-top, 16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}
      data-screen="consultant-mobile-view"
      data-persona={personaId}
    >
      <header
        style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '16px 0',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: PALETTE.primary,
            margin: 0,
            letterSpacing: isRTL ? '0' : '-0.02em',
          }}
        >
          {isRTL ? 'رأي الاستشاري الطبي' : 'Consultant Medical Opinion'}
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: PALETTE.textMuted,
            marginTop: '4px',
            fontWeight: 500,
          }}
        >
          ALO DOCTOR v2.4 • {isRTL ? 'النسخة السعودية' : 'Saudi Edition'}
        </p>
      </header>

      <ConsultantWrittenOpinionSection {...props} />
    </main>
  );
};

export default ConsultantMobileView;
import React, { useState, useCallback, useMemo } from 'react';

interface DoctorFocusQuestionsSectionProps {
  localQuestions: string[];
  onQuestionsChange: (questions: string[]) => void;
  invalidIndices: number[];
  language: 'ar' | 'en';
}

export const DoctorFocusQuestionsSection: React.FC<DoctorFocusQuestionsSectionProps> = ({
  localQuestions,
  onQuestionsChange,
  invalidIndices,
  language,
}) => {
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const fontFamily = 'Cairo, sans-serif';

  const handleQuestionChange = useCallback(
    (index: number, value: string) => {
      const updated = [...localQuestions];
      updated[index] = value;
      onQuestionsChange(updated);
    },
    [localQuestions, onQuestionsChange]
  );

  const labels = useMemo(() => {
    if (language === 'ar') {
      return ['السؤال السريري الأول', 'السؤال السريري الثاني', 'السؤال السريري الثالث'];
    }
    return ['Clinical Focus Question 1', 'Clinical Focus Question 2', 'Clinical Focus Question 3'];
  }, [language]);

  const placeholders = useMemo(() => {
    if (language === 'ar') {
      return [
        'أدخل السؤال السريري الأول (10 أحرف على الأقل)...',
        'أدخل السؤال السريري الثاني (10 أحرف على الأقل)...',
        'أدخل السؤال السريري الثالث (10 أحرف على الأقل)...',
      ];
    }
    return [
      'Enter first clinical focus question (min 10 characters)...',
      'Enter second clinical focus question (min 10 characters)...',
      'Enter third clinical focus question (min 10 characters)...',
    ];
  }, [language]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        backgroundColor: '#E6FAF7',
        borderRadius: '12px',
        border: '1px solid #00C6AE',
        direction: dir,
        fontFamily,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 700,
          color: '#007B6E',
          textAlign: isRTL ? 'right' : 'left',
        }}
      >
        {language === 'ar' ? 'أسئلة التركيز السريري للإحالة' : 'Referral Clinical Focus Questions'}
      </h3>

      {localQuestions.map((question, index) => {
        const isInvalid = invalidIndices.includes(index);
        return (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor={`focus-question-${index}`}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#007B6E',
              }}
            >
              {labels[index]}
            </label>
            <textarea
              id={`focus-question-${index}`}
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              placeholder={placeholders[index]}
              dir={dir}
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? `focus-question-error-${index}` : undefined}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                fontSize: '15px',
                fontFamily,
                lineHeight: 1.6,
                color: '#1a1a1a',
                backgroundColor: '#ffffff',
                border: `2px solid ${isInvalid ? '#d32f2f' : '#00C6AE'}`,
                borderRadius: '8px',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                boxShadow: isInvalid ? '0 0 0 3px rgba(211, 47, 47, 0.15)' : 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                if (!isInvalid) {
                  e.currentTarget.style.borderColor = '#007B6E';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 123, 110, 0.15)';
                }
              }}
              onBlur={(e) => {
                if (!isInvalid) {
                  e.currentTarget.style.borderColor = '#00C6AE';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            />
            {isInvalid && (
              <span
                id={`focus-question-error-${index}`}
                role="alert"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#d32f2f',
                }}
              >
                {language === 'ar'
                  ? `يجب أن يحتوي السؤال على 10 أحرف على الأقل`
                  : `Question must contain at least 10 characters`}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface PersonaProfile {
  id: string;
  role: string;
  language: 'ar' | 'en';
}

interface DoctorReviewViewProps {
  persona: PersonaProfile;
  referralId: string;
  initialQuestions?: string[];
  onApproveReferral: (questions: string[]) => Promise<void>;
}

const MIN_QUESTION_LENGTH = 10;
const REQUIRED_QUESTIONS_COUNT = 3;

export const DoctorReviewView: React.FC<DoctorReviewViewProps> = ({
  persona,
  referralId,
  initialQuestions = ['', '', ''],
  onApproveReferral,
}) => {
  const language = persona.language || 'en';
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const fontFamily = 'Cairo, sans-serif';

  const [localQuestions, setLocalQuestions] = useState<string[]>(() => {
    const base = [...initialQuestions];
    while (base.length < REQUIRED_QUESTIONS_COUNT) {
      base.push('');
    }
    return base.slice(0, REQUIRED_QUESTIONS_COUNT);
  });

  const [invalidIndices, setInvalidIndices] = useState<number[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateFocusQuestions = useCallback((): {
    isValid: boolean;
    missingIndices: number[];
  } => {
    const missingIndices: number[] = [];

    for (let i = 0; i < REQUIRED_QUESTIONS_COUNT; i++) {
      const q = localQuestions[i] || '';
      if (q.trim().length < MIN_QUESTION_LENGTH) {
        missingIndices.push(i);
      }
    }

    return {
      isValid: missingIndices.length === 0,
      missingIndices,
    };
  }, [localQuestions]);

  const formatMissingList = useCallback(
    (indices: number[]): string => {
      return indices.map((idx) => `Q${idx + 1}`).join(', ');
    },
    []
  );

  const handleD10ApproveClick = useCallback(async () => {
    if (isSubmitting) return;

    const { isValid, missingIndices } = validateFocusQuestions();

    if (!isValid) {
      setInvalidIndices(missingIndices);
      const missingList = formatMissingList(missingIndices);

      const errorMessage =
        language === 'ar'
          ? `يرجى إكمال جميع أسئلة التركيز السريري الثلاثة قبل اعتماد الإحالة. الأسئلة الناقصة: ${missingList}`
          : `Please complete all 3 clinical focus questions before referral approval. Missing: ${missingList}`;

      setValidationError(errorMessage);

      const firstInvalidElement = document.getElementById(`focus-question-${missingIndices[0]}`);
      if (firstInvalidElement) {
        firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidElement.focus();
      }

      return;
    }

    setInvalidIndices([]);
    setValidationError(null);
    setIsSubmitting(true);

    try {
      await onApproveReferral(localQuestions);
    } catch (error) {
      console.error('[ALO DOCTOR v2.4] D10 Approval failed:', error);
      setValidationError(
        language === 'ar'
          ? 'حدث خطأ أثناء اعتماد الإحالة. يرجى المحاولة مرة أخرى.'
          : 'An error occurred during referral approval. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    validateFocusQuestions,
    formatMissingList,
    language,
    localQuestions,
    onApproveReferral,
  ]);

  const handleQuestionsChange = useCallback((updatedQuestions: string[]) => {
    setLocalQuestions(updatedQuestions);
    setInvalidIndices([]);
    setValidationError(null);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        maxWidth: '900px',
        margin: '0 auto',
        direction: dir,
        fontFamily,
        backgroundColor: '#f8fdfc',
        minHeight: '100vh',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderBottom: '2px solid #00C6AE',
          paddingBottom: '16px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 800,
            color: '#007B6E',
            textAlign: isRTL ? 'right' : 'left',
          }}
        >
          {language === 'ar' ? 'مراجعة الطبيب - اعتماد الإحالة' : 'Doctor Review - Referral Approval'}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: '#555',
            textAlign: isRTL ? 'right' : 'left',
          }}
        >
          {language === 'ar' ? `رقم الإحالة: ${referralId}` : `Referral ID: ${referralId}`}
        </p>
      </header>

      <DoctorFocusQuestionsSection
        localQuestions={localQuestions}
        onQuestionsChange={handleQuestionsChange}
        invalidIndices={invalidIndices}
        language={language}
      />

      {validationError && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: '16px 20px',
            backgroundColor: '#fdecea',
            border: '1px solid #d32f2f',
            borderRadius: '8px',
            color: '#b71c1c',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 1.6,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            direction: dir,
            fontFamily,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d32f2f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: '2px' }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: isRTL ? 'flex-start' : 'flex-end',
          paddingTop: '16px',
        }}
      >
        <button
          type="button"
          onClick={handleD10ApproveClick}
          disabled={isSubmitting}
          aria-label={
            language === 'ar'
              ? 'اعتماد الإحالة والتوجيه إلى منسق ALO'
              : 'Approve Referral & Route to ALO Coordinator'
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: 700,
            fontFamily,
            color: '#ffffff',
            backgroundColor: isSubmitting ? '#80b5af' : '#007B6E',
            border: 'none',
            borderRadius: '8px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 123, 110, 0.25)',
            minWidth: '280px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = '#005f55';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 123, 110, 0.35)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = '#007B6E';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 110, 0.25)';
            }
          }}
          onMouseDown={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = 'translateY(1px)';
            }
          }}
          onMouseUp={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
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
              <style>
                {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
              </style>
              {language === 'ar' ? 'جارٍ الاعتماد...' : 'Approving...'}
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {language === 'ar'
                ? 'اعتماد الإحالة والتوجيه إلى منسق ALO'
                : 'Approve Referral & Route to ALO Coordinator'}
            </>
          )}
        </button>
      </div>

      <footer
        style={{
          marginTop: 'auto',
          paddingTop: '24px',
          borderTop: '1px solid #E6FAF7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#888',
          fontFamily,
        }}
      >
        <span>ALO DOCTOR v2.4 Saudi Edition</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#25D366',
              display: 'inline-block',
            }}
          />
          {language === 'ar' ? 'منصة معتمدة' : 'Certified Platform'}
        </span>
      </footer>
    </div>
  );
};

export default DoctorReviewView;
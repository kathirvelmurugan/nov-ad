import React, { useState, useCallback } from 'react';

const TEAL_PRIMARY = '#007B6E';
const TEAL_ACCENT = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';
const ERROR_RED = '#D32F2F';

interface FollowUpSatisfactionWidgetProps {
  onComplete: (rating: number) => void;
  isArabic: boolean;
}

export const FollowUpSatisfactionWidget: React.FC<FollowUpSatisfactionWidgetProps> = ({
  onComplete,
  isArabic,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    if (rating === 0) {
      setError(
        isArabic
          ? 'يرجى تقييم تجربة الاستشارة الطبية (من نجمة إلى 5 نجوم) قبل إتمام وإنهاء الملف.'
          : 'Please rate your second opinion experience (1 to 5 stars) before closing the consultation.'
      );
      return;
    }
    setError(null);
    onComplete(rating);
  }, [rating, isArabic, onComplete]);

  const starLabels = isArabic
    ? ['نجمة واحدة', 'نجمتان', '3 نجوم', '4 نجوم', '5 نجوم']
    : ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'];

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: TEAL_BG,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${TEAL_ACCENT}`,
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <h3
        style={{
          color: TEAL_PRIMARY,
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        {isArabic ? 'تقييم تجربة الاستشارة' : 'Rate Your Consultation Experience'}
      </h3>

      <div
        role="radiogroup"
        aria-label={isArabic ? 'تقييم من 1 إلى 5 نجوم' : 'Rating from 1 to 5 stars'}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '20px',
          direction: 'ltr', 
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={starLabels[star - 1]}
              onClick={() => {
                setRating(star);
                setError(null);
              }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onFocus={() => setHoverRating(star)}
              onBlur={() => setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                transition: 'transform 0.2s ease',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill={isActive ? WHATSAPP_GREEN : 'none'}
                stroke={isActive ? WHATSAPP_GREEN : '#CBD5E1'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            backgroundColor: '#FEF2F2',
            border: `1px solid ${ERROR_RED}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: ERROR_RED,
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: 1.6,
            textAlign: isArabic ? 'right' : 'left',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        style={{
          width: '100%',
          backgroundColor: TEAL_PRIMARY,
          color: '#FFFFFF',
          fontFamily: 'Cairo, sans-serif',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '14px 24px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 4px 6px -1px rgba(0, 123, 110, 0.2)',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = TEAL_ACCENT)}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = TEAL_PRIMARY)}
        onFocus={(e) => (e.currentTarget.style.backgroundColor = TEAL_ACCENT)}
        onBlur={(e) => (e.currentTarget.style.backgroundColor = TEAL_PRIMARY)}
      >
        {isArabic ? 'إتمام وإنهاء المتابعة' : 'Complete Follow-Up'}
      </button>
    </div>
  );
};

export default FollowUpSatisfactionWidget;


import React, { useState } from 'react';
import FollowUpSatisfactionWidget from '../followup/FollowUpSatisfactionWidget';

const TEAL_PRIMARY = '#007B6E';
const TEAL_BG = '#E6FAF7';

const PERSONAS = [
  { id: 'P1', label: 'Patient - General Inquiry' },
  { id: 'P2', label: 'Patient - Chronic Condition' },
  { id: 'P3', label: 'Doctor - Cardiologist' },
  { id: 'P4', label: 'Doctor - Pediatrician' },
  { id: 'P5', label: 'Admin - Clinic Manager' },
  { id: 'P6', label: 'Patient - Post-Op' },
  { id: 'P7', label: 'Doctor - Neurologist' },
  { id: 'P8', label: 'Patient - Mental Health' },
  { id: 'P9', label: 'Admin - Billing Support' },
  { id: 'P10', label: 'Doctor - Orthopedic' },
  { id: 'P11', label: 'System - QA Tester' },
];

interface FollowUpChatViewProps {
  initialPersonaId?: string;
}

export const FollowUpChatView: React.FC<FollowUpChatViewProps> = ({
  initialPersonaId = 'P1',
}) => {
  const [activePersona, setActivePersona] = useState<string>(initialPersonaId);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  const isArabic = document.documentElement.dir === 'rtl' || document.documentElement.lang.startsWith('ar');

  const handleCompletion = (rating: number) => {
    setIsCompleted(true);
    console.log(`Follow-up completed with rating: ${rating}`);
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        fontFamily: 'Cairo, sans-serif',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: `2px solid ${TEAL_BG}`,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            color: TEAL_PRIMARY,
            fontSize: '1.5rem',
            fontWeight: 800,
            margin: 0,
          }}
        >
          {isArabic ? 'متابعة الاستشارة الطبية' : 'Medical Follow-Up Consultation'}
        </h1>

        {import.meta.env.DEV && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: '#FEF3C7',
              borderRadius: '8px',
              border: '1px solid #F59E0B',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#92400E',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              DEV Persona:
            </span>
            <select
              value={activePersona}
              onChange={(e) => setActivePersona(e.target.value)}
              aria-label="Debug Persona Switcher"
              style={{
                fontFamily: 'Cairo, sans-serif',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #D97706',
                backgroundColor: '#FFFFFF',
                color: '#92400E',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {PERSONAS.map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.id}: {persona.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '800px',
          width: '100%',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: `1px solid ${TEAL_BG}`,
          }}
        >
          <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7 }}>
            {isArabic
              ? 'مرحباً بك في نافذة المتابعة. يمكنك هنا مراجعة تفاصيل استشارتك السابقة وطرح أي أسئلة إضافية على الطبيب المختص.'
              : 'Welcome to the follow-up window. Here you can review your previous consultation details and ask any additional questions to the specialist doctor.'}
          </p>
          
          {!isCompleted && (
            <div style={{ marginTop: '32px' }}>
              <FollowUpSatisfactionWidget
                onComplete={handleCompletion}
                isArabic={isArabic}
              />
            </div>
          )}

          {isCompleted && (
            <div
              role="status"
              style={{
                marginTop: '32px',
                padding: '24px',
                backgroundColor: TEAL_BG,
                borderRadius: '12px',
                textAlign: 'center',
                border: `1px solid #00C6AE`,
              }}
            >
              <p
                style={{
                  color: TEAL_PRIMARY,
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  margin: 0,
                }}
              >
                {isArabic
                  ? 'شكراً لك! تم إتمام المتابعة وتقييمك بنجاح.'
                  : 'Thank you! Your follow-up and rating have been successfully completed.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FollowUpChatView;
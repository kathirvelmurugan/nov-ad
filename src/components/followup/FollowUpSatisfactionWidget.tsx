import React from 'react';
import { TEAL_PRIMARY, TEAL_BG } from './followUpConstants';

interface Props {
  isRTL: boolean;
  rating: number;
  hoverRating: number;
  tags: string[];
  selectedTags: Set<number>;
  onRatingChange: (star: number) => void;
  setHoverRating: (star: number) => void;
  onToggleTag: (index: number) => void;
  onCompleteFollowUp: () => void;
  patientEndedFollowUp?: boolean;
}

export const FollowUpSatisfactionWidget: React.FC<Props> = ({
  isRTL,
  rating,
  hoverRating,
  tags,
  selectedTags,
  onRatingChange,
  setHoverRating,
  onToggleTag,
  onCompleteFollowUp,
  patientEndedFollowUp = false,
}) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleRatingClick = (star: number) => {
    if (patientEndedFollowUp) return;
    setError(null);
    onRatingChange(star);
  };

  const handleComplete = () => {
    if (patientEndedFollowUp) return;
    if (rating === 0) {
      setError(
        isRTL
          ? 'يرجى تقييم تجربة الاستشارة الطبية (من نجمة إلى 5 نجوم) قبل تأكيد إنهاء المتابعة.'
          : 'Please rate your second opinion experience (1 to 5 stars) before concluding the follow-up.'
      );
      return;
    }
    setError(null);
    onCompleteFollowUp();
  };

  return (
    <section
      aria-label={isRTL ? 'إنهاء المتابعة وتقييم الاستشارة' : 'End Follow-Up & Experience Rating'}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#1A2E35' }}>
          {isRTL ? 'إتمام وإنهاء فترة المتابعة' : 'Conclude 21-Day Follow-Up'}
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B', maxWidth: '520px', lineHeight: 1.6 }}>
          {isRTL
            ? 'المتابعة مستمرة ومفتوحة طوال 21 يوماً. عندما تنتهي من كافة استفساراتك، يمكنك النقر على "أرغب في إنهاء المتابعة" ليقوم المنسق بإصدار الملف النهائي وإغلاق الحالة.'
            : 'Follow-up remains continuously active for up to 21 days. When you have asked all your questions, click "I want to end this follow-up" so the coordinator can release the final dossier and close the case.'}
        </p>
      </div>

      {patientEndedFollowUp && (
        <div
          role="status"
          style={{
            backgroundColor: '#ECFDF5',
            border: '1.5px solid #10B981',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#065F46',
            width: '100%',
            maxWidth: '560px',
            boxSizing: 'border-box',
            textAlign: 'center',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '4px' }}>
            ✓ {isRTL ? 'تم تأكيد رغبتكم في إنهاء المتابعة بنجاح' : 'Follow-Up Concluded by Patient'}
          </div>
          <div>
            {isRTL
              ? 'يقوم منسق رعاية ألو حالياً بمراجعة واعتماد التقرير الشامل النهائي (PDF 2) المتضمن كافة الإجابات وسيقوم بإغلاق الحالة رسمياً.'
              : 'ALO Care Coordinator is reviewing all answers and generating the Final Comprehensive Dossier (PDF 2) before closing the case.'}
          </div>
        </div>
      )}

      {/* 5-Star Rating Widget */}
      <div
        role="radiogroup"
        aria-label={isRTL ? 'تقييم من 5 نجوم' : '5-star rating'}
        style={{
          display: 'flex',
          gap: '8px',
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
              aria-label={`${star} ${isRTL ? 'نجوم' : 'stars'}`}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => !patientEndedFollowUp && setHoverRating(star)}
              onMouseLeave={() => !patientEndedFollowUp && setHoverRating(0)}
              onFocus={() => !patientEndedFollowUp && setHoverRating(star)}
              onBlur={() => !patientEndedFollowUp && setHoverRating(0)}
              disabled={patientEndedFollowUp}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: patientEndedFollowUp ? 'default' : 'pointer',
                transition: 'transform 0.15s ease',
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill={isActive ? '#F59E0B' : 'none'}
                stroke={isActive ? '#F59E0B' : '#CBD5E1'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>

      {rating > 0 && (
        <p style={{ margin: '-8px 0 0 0', fontSize: '14px', fontWeight: 600, color: TEAL_PRIMARY }}>
          {rating === 5
            ? isRTL
              ? 'ممتاز!'
              : 'Excellent!'
            : rating === 4
            ? isRTL
              ? 'جيد جداً'
              : 'Very Good'
            : rating === 3
            ? isRTL
              ? 'جيد'
              : 'Good'
            : rating === 2
            ? isRTL
              ? 'مقبول'
              : 'Fair'
            : isRTL
            ? 'يحتاج تحسين'
            : 'Needs Improvement'}
        </p>
      )}

      {/* Quick Feedback Tags */}
      <div
        role="group"
        aria-label={isRTL ? 'علامات التغذية الراجعة السريعة' : 'Quick feedback tags'}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {tags.map((tag, index) => {
          const isSelected = selectedTags.has(index);
          return (
            <button
              key={index}
              type="button"
              onClick={() => !patientEndedFollowUp && onToggleTag(index)}
              aria-pressed={isSelected}
              disabled={patientEndedFollowUp}
              style={{
                padding: '8px 18px',
                borderRadius: '24px',
                border: `1.5px solid ${isSelected ? TEAL_PRIMARY : '#CBD5E1'}`,
                backgroundColor: isSelected ? TEAL_BG : '#FFFFFF',
                color: isSelected ? TEAL_PRIMARY : '#64748B',
                fontFamily: "'Cairo', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                cursor: patientEndedFollowUp ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isSelected && (
                <span style={{ [isRTL ? 'marginLeft' : 'marginRight']: '6px' }}>✓</span>
              )}
              {tag}
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: '#FDEDED',
            border: '1px solid #D32F2F',
            color: '#D32F2F',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            textAlign: 'center',
            maxWidth: '420px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {error}
        </div>
      )}

      {/* Continuous Follow-Up Action: "I want to end this follow-up" */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={patientEndedFollowUp || rating === 0}
        aria-label={isRTL ? 'أرغب في إنهاء المتابعة' : 'I want to end this follow-up'}
        style={{
          marginTop: '8px',
          padding: '14px 40px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: patientEndedFollowUp ? '#10B981' : rating === 0 ? '#CBD5E1' : TEAL_PRIMARY,
          color: '#FFFFFF',
          fontFamily: "'Cairo', sans-serif",
          fontSize: '16px',
          fontWeight: 700,
          cursor: patientEndedFollowUp || rating === 0 ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: !patientEndedFollowUp && rating > 0 ? `0 4px 16px rgba(0, 123, 110, 0.3)` : 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
        }}
        onMouseEnter={(e) => {
          if (!patientEndedFollowUp && rating > 0) e.currentTarget.style.backgroundColor = '#005F55';
        }}
        onMouseLeave={(e) => {
          if (!patientEndedFollowUp && rating > 0) e.currentTarget.style.backgroundColor = TEAL_PRIMARY;
        }}
      >
        {patientEndedFollowUp ? (
          <>
            <span>✓</span>
            <span>{isRTL ? 'تم طلب إنهاء المتابعة' : 'Follow-up Ended'}</span>
          </>
        ) : (
          <>
            <span>{isRTL ? 'أرغب في إنهاء المتابعة' : 'I want to end this follow-up'}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 12 12 12 19" />
            </svg>
          </>
        )}
      </button>
    </section>
  );
};

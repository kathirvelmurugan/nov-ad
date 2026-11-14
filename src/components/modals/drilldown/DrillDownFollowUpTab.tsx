import React from 'react';

export interface CaseItem {
  id: string;
  status: string;
  satisfactionScore?: number;
  followUpWindowStatus?: 'open' | 'closed' | 'pending';
}

export interface DrillDownFollowUpTabProps {
  caseItem: CaseItem;
  lang: 'ar' | 'en';
  patientQuestions: string[];
  followUpAnswers: string[];
}

const i18n = {
  ar: {
    tabTitle: 'المتابعة والإغلاق (21 يومًا)',
    followUpWindow: 'نافذة المتابعة',
    open: 'مفتوحة',
    closed: 'مغلقة',
    pending: 'قيد الانتظار',
    clarificationLog: 'سجل أسئلة التوضيح والردود',
    question: 'السؤال',
    coordinatorResponse: 'رد المنسق',
    noQuestions: 'لا توجد أسئلة مسجلة حتى الآن.',
    satisfactionScore: 'درجة رضا المريض',
    outOf: 'من 5',
    notRated: 'لم يتم التقييم بعد',
  },
  en: {
    tabTitle: '21-Day Follow-Up & Closure',
    followUpWindow: 'Follow-Up Window',
    open: 'Open',
    closed: 'Closed',
    pending: 'Pending',
    clarificationLog: 'Clarification Questions & Answers Log',
    question: 'Question',
    coordinatorResponse: 'Coordinator Response',
    noQuestions: 'No questions logged yet.',
    satisfactionScore: 'Patient Satisfaction Score',
    outOf: 'out of 5',
    notRated: 'Not rated yet',
  },
};

const DrillDownFollowUpTab: React.FC<DrillDownFollowUpTabProps> = ({
  caseItem,
  lang,
  patientQuestions,
  followUpAnswers,
}) => {
  const isRTL = lang === 'ar';
  const t = i18n[lang];
  const dir = isRTL ? 'rtl' : 'ltr';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';

  const windowStatus = caseItem.followUpWindowStatus || 'pending';

  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'open':
        return 'bg-[#E6FAF7] text-[#007B6E] border border-[#00C6AE]';
      case 'closed':
        return 'bg-gray-100 text-gray-600 border border-gray-300';
      case 'pending':
      default:
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    }
  };

  const renderStars = (score: number | undefined) => {
    if (score === undefined || score === null) {
      return (
        <span className="text-sm text-gray-500 italic">
          {t.notRated}
        </span>
      );
    }

    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1" aria-label={`${score} ${t.outOf}`}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-[#00C6AE]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-5 h-5 text-[#00C6AE]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id={`half-star-grad-${caseItem.id}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#E5E7EB" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-star-grad-${caseItem.id})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className={`ms-2 text-sm font-semibold text-[#007B6E]`}>
          {score.toFixed(1)} {t.outOf}
        </span>
      </div>
    );
  };

  return (
    <div
      dir={dir}
      className={`w-full h-full p-4 md:p-6 overflow-y-auto bg-white ${fontClass}`}
      role="tabpanel"
      aria-label={t.tabTitle}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E6FAF7]">
        <h2 className="text-xl md:text-2xl font-bold text-[#007B6E]">
          {t.tabTitle}
        </h2>
        
        {/* 21-Day Follow-Up Window Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">{t.followUpWindow}:</span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-colors duration-200 ${getStatusBadgeClasses(windowStatus)}`}
          >
            <span className={`w-2 h-2 rounded-full me-2 ${
              windowStatus === 'open' ? 'bg-[#00C6AE]' : 
              windowStatus === 'closed' ? 'bg-gray-400' : 
              'bg-yellow-500 animate-pulse'
            }`} aria-hidden="true" />
            {windowStatus === 'open' ? t.open : windowStatus === 'closed' ? t.closed : t.pending}
          </span>
        </div>
      </div>

      {/* Clarification Questions & Answers Log */}
      <section className="mb-8" aria-labelledby="clarification-log-heading">
        <h3
          id="clarification-log-heading"
          className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-[#00C6AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {t.clarificationLog}
        </h3>

        {patientQuestions.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <p className="text-gray-500 text-sm">{t.noQuestions}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patientQuestions.map((question, index) => (
              <div
                key={`qa-pair-${index}`}
                className="bg-[#E6FAF7]/30 border border-[#E6FAF7] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Question */}
                <div className="mb-3">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#007B6E] text-white text-xs font-bold shrink-0 mt-0.5">
                      {isRTL ? 'س' : 'Q'}
                    </span>
                    <div className="flex-1">
                      <span className="block text-xs font-semibold text-[#007B6E] uppercase tracking-wider mb-1">
                        {t.question} {index + 1}
                      </span>
                      <p className="text-gray-800 text-sm leading-relaxed font-medium">
                        {question}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coordinator Response */}
                {followUpAnswers[index] && (
                  <div className={`pt-3 border-t border-[#00C6AE]/20 ${isRTL ? 'mr-8' : 'ml-8'}`}>
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#25D366] text-white text-xs font-bold shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <div className="flex-1">
                        <span className="block text-xs font-semibold text-[#25D366] uppercase tracking-wider mb-1">
                          {t.coordinatorResponse}
                        </span>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {followUpAnswers[index]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Patient Satisfaction Score Card */}
      <section aria-labelledby="satisfaction-score-heading">
        <div className="bg-gradient-to-br from-white to-[#E6FAF7] border border-[#00C6AE]/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C6AE]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#25D366]/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />
          
          <div className="relative z-10">
            <h3
              id="satisfaction-score-heading"
              className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.satisfactionScore}
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-[#00C6AE] shadow-inner">
                  <span className="text-2xl font-black text-[#007B6E]">
                    {caseItem.satisfactionScore !== undefined ? caseItem.satisfactionScore.toFixed(1) : '-'}
                  </span>
                </div>
                <div>
                  {renderStars(caseItem.satisfactionScore)}
                </div>
              </div>
              
              {caseItem.satisfactionScore !== undefined && caseItem.satisfactionScore >= 4.5 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] rounded-full text-xs font-bold border border-[#25D366]/20">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {isRTL ? 'تقييم ممتاز' : 'Excellent Rating'}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DrillDownFollowUpTab;
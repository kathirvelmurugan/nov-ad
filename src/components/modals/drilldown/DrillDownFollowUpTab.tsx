import React from 'react';

export interface CaseItem {
  id: string;
  status?: string;
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
    tabTitle: 'المتابعة والإغلاق (٢١ يومًا)',
    windowStatus: 'حالة نافذة المتابعة',
    open: 'مفتوحة',
    closed: 'مغلقة',
    pending: 'قيد الانتظار',
    clarificationLog: 'سجل أسئلة التوضيح والإجابات',
    question: 'السؤال',
    coordinatorResponse: 'رد المنسق',
    noQuestions: 'لا توجد أسئلة مسجلة حتى الآن.',
    satisfactionScore: 'درجة رضا المريض',
    outOf: 'من ٥',
  },
  en: {
    tabTitle: '21-Day Follow-Up & Closure',
    windowStatus: 'Follow-Up Window Status',
    open: 'Open',
    closed: 'Closed',
    pending: 'Pending',
    clarificationLog: 'Clarification Questions & Answers Log',
    question: 'Question',
    coordinatorResponse: 'Coordinator Response',
    noQuestions: 'No questions recorded yet.',
    satisfactionScore: 'Patient Satisfaction Score',
    outOf: 'out of 5',
  },
};

const DrillDownFollowUpTab: React.FC<DrillDownFollowUpTabProps> = ({
  caseItem,
  lang,
  patientQuestions,
  followUpAnswers,
}) => {
  const t = i18n[lang];
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'text-right' : 'text-left';

  const getStatusBadgeClasses = (status?: string) => {
    switch (status) {
      case 'open':
        return 'bg-[#E6FAF7] text-[#007B6E] border border-[#00C6AE]';
      case 'closed':
        return 'bg-gray-100 text-gray-600 border border-gray-300';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-300';
      default:
        return 'bg-[#E6FAF7] text-[#007B6E] border border-[#00C6AE]';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'open':
        return t.open;
      case 'closed':
        return t.closed;
      case 'pending':
        return t.pending;
      default:
        return t.pending;
    }
  };

  const renderSatisfactionStars = (score?: number) => {
    const safeScore = Math.min(Math.max(score || 0, 0), 5);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-6 h-6 ${i <= safeScore ? 'text-[#00C6AE]' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div
      dir={dir}
      className={`w-full h-full flex flex-col gap-6 p-4 md:p-6 font-cairo ${textAlign}`}
      role="tabpanel"
      aria-label={t.tabTitle}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E6FAF7]">
        <h2 className="text-xl md:text-2xl font-bold text-[#007B6E]">
          {t.tabTitle}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            {t.windowStatus}:
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${getStatusBadgeClasses(caseItem.followUpWindowStatus)}`}
          >
            {getStatusText(caseItem.followUpWindowStatus)}
          </span>
        </div>
      </div>

      {/* Clarification Questions & Answers Log */}
      <section
        className="bg-white rounded-xl shadow-sm border border-[#E6FAF7] overflow-hidden"
        aria-labelledby="clarification-log-heading"
      >
        <div className="bg-[#E6FAF7] px-4 py-3 border-b border-[#00C6AE]/20">
          <h3
            id="clarification-log-heading"
            className="text-lg font-semibold text-[#007B6E]"
          >
            {t.clarificationLog}
          </h3>
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
          {patientQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg
                className="w-12 h-12 mb-3 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-sm font-medium">{t.noQuestions}</p>
            </div>
          ) : (
            <ul className="space-y-4" role="list">
              {patientQuestions.map((question, index) => (
                <li
                  key={`q-${index}`}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-[#00C6AE]/30 transition-colors duration-200"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#007B6E] text-white flex items-center justify-center text-xs font-bold mt-0.5">
                        {isRTL ? `؟` : `Q`}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#007B6E] uppercase tracking-wider mb-1">
                          {t.question}
                        </p>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {question}
                        </p>
                      </div>
                    </div>

                    {followUpAnswers[index] && (
                      <div className={`flex items-start gap-2 ${isRTL ? 'mr-4' : 'ml-4'} pt-2 border-t border-gray-200`}>
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs font-bold mt-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#25D366] uppercase tracking-wider mb-1">
                            {t.coordinatorResponse}
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {followUpAnswers[index]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Patient Satisfaction Score Card */}
      <section
        className="bg-gradient-to-br from-white to-[#E6FAF7] rounded-xl shadow-sm border border-[#00C6AE]/20 p-6"
        aria-labelledby="satisfaction-score-heading"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <h3
              id="satisfaction-score-heading"
              className="text-lg font-semibold text-[#007B6E]"
            >
              {t.satisfactionScore}
            </h3>
            <div className="flex items-center gap-1" role="img" aria-label={`${caseItem.satisfactionScore || 0} ${t.outOf}`}>
              {renderSatisfactionStars(caseItem.satisfactionScore)}
            </div>
          </div>
          
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-[#00C6AE] shadow-inner">
            <span className="text-3xl font-black text-[#007B6E]">
              {caseItem.satisfactionScore !== undefined ? caseItem.satisfactionScore.toFixed(1) : '—'}
            </span>
          </div>
        </div>
        
        <div className={`mt-4 text-sm text-gray-500 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
          {caseItem.satisfactionScore !== undefined ? `${caseItem.satisfactionScore} ${t.outOf}` : ''}
        </div>
      </section>

      <style>{`
        .font-cairo {
          font-family: 'Cairo', sans-serif;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #E6FAF7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00C6AE;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #007B6E;
        }
      `}</style>
    </div>
  );
};

export default DrillDownFollowUpTab;
import React from 'react';

interface TimelineActiveStageCardProps {
  activeCase: any;
  lang: 'ar' | 'en';
  currentStageMeta?: any;
  onOpenReport?: (type: 'pdf1' | 'pdf2') => void;
}

const TimelineActiveStageCard: React.FC<TimelineActiveStageCardProps> = ({
  activeCase,
  lang,
  currentStageMeta,
  onOpenReport,
}) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const stageTitle = isAr
    ? currentStageMeta?.titleAr || activeCase?.stageTitleAr || 'المرحلة الحالية'
    : currentStageMeta?.titleEn || activeCase?.stageTitleEn || 'Current Stage';

  const statusLabel = isAr
    ? currentStageMeta?.statusAr || activeCase?.statusAr || 'قيد التنفيذ'
    : currentStageMeta?.statusEn || activeCase?.statusEn || 'In Progress';

  const progressDescription = isAr
    ? currentStageMeta?.descriptionAr || activeCase?.progressDescriptionAr || 'جاري معالجة الطلب وفقاً للإجراءات المعتمدة.'
    : currentStageMeta?.descriptionEn || activeCase?.progressDescriptionEn || 'Processing request according to approved procedures.';

  const slaEstimate = isAr
    ? currentStageMeta?.slaAr || activeCase?.slaEstimateAr || 'الإنجاز المتوقع خلال ٤٨ ساعة'
    : currentStageMeta?.slaEn || activeCase?.slaEstimateEn || 'Estimated completion within 48 hours';

  const viewReportLabel = isAr ? 'عرض التقرير' : 'View Report';
  const askClarificationLabel = isAr ? 'طلب توضيح' : 'Ask Clarification';

  return (
    <div
      dir={dir}
      className="w-full max-w-3xl mx-auto rounded-2xl border border-[#007B6E]/20 bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-colors duration-300 font-cairo"
    >
      {/* Header Section */}
      <div className="bg-[#E6FAF7] dark:bg-[#007B6E]/10 px-6 py-5 border-b border-[#007B6E]/10 dark:border-[#00C6AE]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-3 h-3 rounded-full bg-[#00C6AE] animate-pulse shadow-[0_0_8px_rgba(0,198,174,0.6)]" />
          <h3 className="text-xl font-bold text-[#007B6E] dark:text-[#00C6AE] leading-tight">
            {stageTitle}
          </h3>
        </div>
        
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-semibold bg-[#007B6E] text-white dark:bg-[#00C6AE] dark:text-gray-900 shadow-sm whitespace-nowrap">
          {statusLabel}
        </span>
      </div>

      {/* Body Section */}
      <div className="px-6 py-6 space-y-6">
        {/* Progress Description */}
        <div className="space-y-2">
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {progressDescription}
          </p>
        </div>

        {/* SLA Estimate */}
        <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
          <svg 
            className={`w-5 h-5 text-[#007B6E] dark:text-[#00C6AE] flex-shrink-0 ${isAr ? 'ml-2' : 'mr-2'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {slaEstimate}
          </span>
        </div>

        {/* Call-to-Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-3 pt-2 ${isAr ? 'sm:justify-start' : 'sm:justify-end'}`}>
          <button
            type="button"
            onClick={() => onOpenReport?.('pdf1')}
            disabled={!onOpenReport}
            className="relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#007B6E] hover:bg-[#00655A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C6AE] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
            aria-label={viewReportLabel}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {viewReportLabel}
          </button>

          <button
            type="button"
            onClick={() => onOpenReport?.('pdf2')}
            disabled={!onOpenReport}
            className="relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-[#007B6E] dark:text-[#00C6AE] bg-transparent border-2 border-[#007B6E] dark:border-[#00C6AE] hover:bg-[#E6FAF7] dark:hover:bg-[#007B6E]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C6AE] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            aria-label={askClarificationLabel}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {askClarificationLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineActiveStageCard;
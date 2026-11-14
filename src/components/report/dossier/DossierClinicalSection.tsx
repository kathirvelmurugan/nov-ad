import React from 'react';

interface DossierClinicalSectionProps {
  caseItem: any;
  lang: 'ar' | 'en';
}

const DossierClinicalSection: React.FC<DossierClinicalSectionProps> = ({ caseItem, lang }) => {
  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const fontFamily = 'font-cairo';

  const primaryDiagnosis = caseItem?.primaryDiagnosis || {};
  const clinicalHistory = caseItem?.clinicalHistory || {};
  const focusQuestions = caseItem?.focusQuestions || [];

  const t = {
    ar: {
      clinicalSummary: 'الملخص السريري',
      primaryDiagnosis: 'التشخيص الأساسي',
      icdCode: 'رمز التصنيف الدولي للأمراض',
      clinicalTitle: 'المسمى السريري',
      historyAndSymptoms: 'التاريخ المرضي والأعراض',
      chiefComplaint: 'الشكوى الرئيسية',
      presentIllness: 'المرض الحالي',
      pastHistory: 'التاريخ المرضي السابق',
      symptoms: 'الأعراض المرافقة',
      mandatedFocusQuestions: 'أسئلة التركيز الإلزامية للطبيب المعالج',
      question: 'السؤال',
      noDataAvailable: 'لا توجد بيانات متاحة',
      printNote: 'ملاحظة سريرية - للطباعة'
    },
    en: {
      clinicalSummary: 'Clinical Summary',
      primaryDiagnosis: 'Primary Diagnosis',
      icdCode: 'ICD Code',
      clinicalTitle: 'Clinical Title',
      historyAndSymptoms: 'History & Symptoms',
      chiefComplaint: 'Chief Complaint',
      presentIllness: 'Present Illness',
      pastHistory: 'Past History',
      symptoms: 'Associated Symptoms',
      mandatedFocusQuestions: 'Mandated Treating Doctor Focus Questions',
      question: 'Question',
      noDataAvailable: 'No data available',
      printNote: 'Clinical Note - Print Ready'
    }
  };

  const labels = t[lang];

  return (
    <section
      dir={dir}
      className={`w-full ${fontFamily} ${textAlign} bg-white rounded-xl shadow-sm border border-[#E6FAF7] overflow-hidden print:shadow-none print:border-0 print:rounded-none print:break-inside-avoid-page`}
      aria-label={labels.clinicalSummary}
    >
      {/* Section Header */}
      <header className="bg-[#007B6E] text-white px-6 py-4 print:bg-transparent print:text-black print:border-b-2 print:border-[#007B6E] print:px-0 print:py-2">
        <h2 className="text-xl font-bold tracking-wide flex items-center gap-3">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-[#00C6AE] print:hidden" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {labels.clinicalSummary}
        </h2>
      </header>

      <div className="p-6 space-y-8 print:p-0 print:space-y-6">
        
        {/* Primary Diagnosis Banner */}
        <div 
          className="relative overflow-hidden rounded-lg border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#007B6E] bg-[#E6FAF7] p-5 print:bg-transparent print:border-2 print:p-3"
          role="region"
          aria-label={labels.primaryDiagnosis}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C6AE] opacity-10 rounded-full -mr-10 -mt-10 print:hidden" aria-hidden="true" />
          
          <h3 className="text-lg font-bold text-[#007B6E] mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00C6AE] print:hidden" aria-hidden="true" />
            {labels.primaryDiagnosis}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
            <div className="bg-white/60 rounded-md p-3 border border-[#00C6AE]/20 print:bg-transparent print:border-[#007B6E]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 print:text-black">
                {labels.icdCode}
              </p>
              <p className="text-base font-bold text-gray-900 font-mono" dir="ltr">
                {primaryDiagnosis.icdCode || labels.noDataAvailable}
              </p>
            </div>
            
            <div className="bg-white/60 rounded-md p-3 border border-[#00C6AE]/20 print:bg-transparent print:border-[#007B6E]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 print:text-black">
                {labels.clinicalTitle}
              </p>
              <p className="text-base font-bold text-gray-900">
                {isRtl ? primaryDiagnosis.titleAr : primaryDiagnosis.titleEn || labels.noDataAvailable}
              </p>
            </div>
          </div>
        </div>

        {/* Clinical History & Symptoms Summary */}
        <div 
          className="space-y-4"
          role="region"
          aria-label={labels.historyAndSymptoms}
        >
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-[#E6FAF7] pb-2 print:border-[#007B6E]">
            {labels.historyAndSymptoms}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
            {/* Chief Complaint */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#007B6E] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00C6AE] rounded-full print:hidden" aria-hidden="true" />
                {labels.chiefComplaint}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md print:bg-transparent print:p-0 print:border-b print:border-dashed print:border-gray-300 print:pb-2">
                {isRtl ? clinicalHistory.chiefComplaintAr : clinicalHistory.chiefComplaintEn || labels.noDataAvailable}
              </p>
            </div>

            {/* Present Illness */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#007B6E] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00C6AE] rounded-full print:hidden" aria-hidden="true" />
                {labels.presentIllness}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md print:bg-transparent print:p-0 print:border-b print:border-dashed print:border-gray-300 print:pb-2">
                {isRtl ? clinicalHistory.presentIllnessAr : clinicalHistory.presentIllnessEn || labels.noDataAvailable}
              </p>
            </div>

            {/* Past History */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#007B6E] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00C6AE] rounded-full print:hidden" aria-hidden="true" />
                {labels.pastHistory}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md print:bg-transparent print:p-0 print:border-b print:border-dashed print:border-gray-300 print:pb-2">
                {isRtl ? clinicalHistory.pastHistoryAr : clinicalHistory.pastHistoryEn || labels.noDataAvailable}
              </p>
            </div>

            {/* Associated Symptoms */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#007B6E] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00C6AE] rounded-full print:hidden" aria-hidden="true" />
                {labels.symptoms}
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md space-y-1 print:bg-transparent print:p-0 print:list-none print:flex print:flex-wrap print:gap-2">
                {(isRtl ? clinicalHistory.symptomsAr : clinicalHistory.symptomsEn)?.length > 0 ? (
                  (isRtl ? clinicalHistory.symptomsAr : clinicalHistory.symptomsEn).map((symptom: string, index: number) => (
                    <li key={index} className="print:inline-block print:bg-[#E6FAF7] print:px-2 print:py-1 print:rounded print:text-xs print:border print:border-[#00C6AE]">
                      {symptom}
                    </li>
                  ))
                ) : (
                  <li>{labels.noDataAvailable}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Mandated Treating Doctor 3 Focus Questions Box */}
        <div 
          className="relative mt-8 print:mt-4"
          role="region"
          aria-label={labels.mandatedFocusQuestions}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#007B6E]/5 to-[#00C6AE]/10 rounded-xl pointer-events-none print:hidden" aria-hidden="true" />
          
          <div className="relative border-2 border-[#007B6E] rounded-xl overflow-hidden print:border-black">
            <div className="bg-[#007B6E] px-5 py-3 flex items-center justify-between print:bg-transparent print:border-b-2 print:border-black print:px-0 print:py-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2 print:text-black">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-[#00C6AE] print:text-black" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {labels.mandatedFocusQuestions}
              </h3>
              <span className="hidden print:inline-block text-xs font-bold text-black border border-black px-2 py-0.5 rounded">
                {labels.printNote}
              </span>
            </div>
            
            <div className="p-5 bg-white space-y-4 print:p-3">
              {focusQuestions && focusQuestions.length > 0 ? (
                focusQuestions.slice(0, 3).map((question: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 rounded-lg border border-[#E6FAF7] hover:border-[#00C6AE] transition-colors duration-200 group print:hover:border-[#E6FAF7] print:p-2 print:border-gray-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E6FAF7] text-[#007B6E] flex items-center justify-center font-bold text-sm border-2 border-[#00C6AE] group-hover:bg-[#007B6E] group-hover:text-white transition-colors duration-200 print:bg-transparent print:border-black print:text-black print:w-6 print:h-6 print:text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm font-medium text-gray-500 mb-1 print:hidden">
                        {labels.question} {index + 1}
                      </p>
                      <p className="text-base font-semibold text-gray-800 leading-relaxed">
                        {isRtl ? question.textAr : question.textEn}
                      </p>
                      {question.rationale && (
                        <p className="text-xs text-gray-500 mt-2 italic border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#00C6AE] pl-2 rtl:pl-0 rtl:pr-2 print:hidden">
                          {isRtl ? question.rationaleAr : question.rationaleEn}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 print:py-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 mx-auto mb-3 opacity-50 print:h-8 print:w-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium">{labels.noDataAvailable}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Accent Line for Print */}
      <div className="h-1 bg-gradient-to-r from-[#007B6E] via-[#00C6AE] to-[#25D366] hidden print:block" aria-hidden="true" />
    </section>
  );
};

export default DossierClinicalSection;
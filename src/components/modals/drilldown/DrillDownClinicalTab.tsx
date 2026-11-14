import React from 'react';
import { FileText, Stethoscope, AlertCircle, HelpCircle, Paperclip } from 'lucide-react';

export interface DrillDownClinicalTabProps {
  caseItem: any;
  diagnosis: string;
  isRTL: boolean;
}

const DrillDownClinicalTab: React.FC<DrillDownClinicalTabProps> = ({ caseItem, diagnosis, isRTL }) => {
  const dir = isRTL ? 'rtl' : 'ltr';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';
  const focusQuestions = caseItem?.focusQuestions || [
    isRTL ? 'ما هي الأعراض الرئيسية؟' : 'What are the primary symptoms?',
    isRTL ? 'ما هو التشخيص التفريقي؟' : 'What is the differential diagnosis?',
    isRTL ? 'ما هي الخطة العلاجية المقترحة؟' : 'What is the proposed treatment plan?'
  ];
  const scans = caseItem?.scans || [];
  const symptoms = caseItem?.symptoms || (isRTL ? 'لا توجد أعراض مسجلة' : 'No symptoms recorded');

  return (
    <div dir={dir} className={`${fontClass} space-y-4 p-4 bg-[#E6FAF7] rounded-xl min-h-[300px]`}>
      <div className="bg-white border-r-4 border-[#007B6E] rounded-lg shadow-sm p-4 flex items-start gap-3">
        <Stethoscope className="w-5 h-5 text-[#00C6AE] mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-[#007B6E] mb-1">
            {isRTL ? 'التشخيص الأساسي' : 'Primary Diagnosis'}
          </h4>
          <p className="text-gray-800 text-sm leading-relaxed">{diagnosis}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 border border-[#00C6AE]/20">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-[#007B6E]" />
          <h4 className="text-sm font-bold text-[#007B6E]">
            {isRTL ? 'الأعراض والعرض السريري' : 'Symptoms & Clinical Presentation'}
          </h4>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{symptoms}</p>
      </div>

      {/* Medications and Allergies if present */}
      {((caseItem?.currentMedications && caseItem.currentMedications.length > 0) || (caseItem?.allergies && caseItem.allergies.length > 0)) && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-[#00C6AE]/20 space-y-3">
          {caseItem?.currentMedications && caseItem.currentMedications.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#007B6E] mb-1.5">
                {isRTL ? 'الأدوية الموصوفة للمريض' : 'Active Prescriptions'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {caseItem.currentMedications.map((m: string, i: number) => (
                  <span key={i} className="text-xs bg-[#E6FAF7] text-[#007B6E] font-medium px-2 py-0.5 rounded border border-[#00C6AE]/30">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
          {caseItem?.allergies && caseItem.allergies.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-rose-700 mb-1.5">
                {isRTL ? 'الحساسية الدوائية' : 'Drug Allergies'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {caseItem.allergies.map((a: string, i: number) => (
                  <span key={i} className="text-xs bg-rose-50 text-rose-800 font-medium px-2 py-0.5 rounded border border-rose-200">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-[#007B6E]" />
          <h4 className="text-sm font-bold text-[#007B6E]">
            {isRTL ? 'أسئلة التركيز الإلزامية' : 'Mandated Focus Questions'}
          </h4>
        </div>
        <ul className="space-y-2 list-none">
          {focusQuestions.map((q: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00C6AE] text-white flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{q}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Paperclip className="w-4 h-4 text-[#007B6E]" />
          <h4 className="text-sm font-bold text-[#007B6E]">
            {isRTL ? 'الفحوصات والملفات المرفقة' : 'Attached Scans & Files'}
          </h4>
        </div>
        {scans.length > 0 ? (
          <ul className="space-y-2">
            {scans.map((scan: any, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-[#E6FAF7] p-2 rounded-md">
                <FileText className="w-4 h-4 text-[#00C6AE] flex-shrink-0" />
                <span>{typeof scan === 'string' ? scan : scan.name || `Scan ${i + 1}`}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">
            {isRTL ? 'لا توجد ملفات مرفقة' : 'No files attached'}
          </p>
        )}
      </div>
    </div>
  );
};

export default DrillDownClinicalTab;
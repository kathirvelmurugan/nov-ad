import React from 'react';
import { FileText } from 'lucide-react';
import { ClinicalCase } from '../../types';

interface TimelineDossierSummaryCardProps {
  activeCase: ClinicalCase;
  isAr: boolean;
}

export const TimelineDossierSummaryCard: React.FC<TimelineDossierSummaryCardProps> = ({
  activeCase,
  isAr,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-alo-darkCard/50 border border-slate-200 dark:border-alo-darkBorder rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
          <FileText className="w-4 h-4 text-alo-teal" />
          <span>{isAr ? 'ملخص البيانات المسجلة من قبلك في الطلب (Stage 1 Intake):' : 'Summary of Your Submitted Intake Dossier:'}</span>
        </div>
        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
          ✓ {isAr ? 'طلب مكتمل' : 'Intake Complete'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <span className="font-bold text-slate-500 block mb-1">
            {isAr ? 'الشكوى السريرية الرئيسية والأعراض:' : 'Chief Clinical Complaint:'}
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {isAr ? (activeCase.diagnosisAr || activeCase.diagnosis) : (activeCase.diagnosisEn || activeCase.diagnosis)}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <span className="font-bold text-slate-500 block mb-1">
            {isAr ? 'المستشفى الشريك والطبيب المعالج المختار:' : 'Selected Partner Hospital & Doctor:'}
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {activeCase.treatingDoctor.hospital} · {activeCase.treatingDoctor.name} ({activeCase.treatingDoctor.city})
          </span>
        </div>
      </div>
    </div>
  );
};

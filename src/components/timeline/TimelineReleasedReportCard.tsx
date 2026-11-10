import React from 'react';
import { FileCheck2 } from 'lucide-react';
import { ClinicalCase, ClinicalStage } from '../../types';

interface TimelineReleasedReportCardProps {
  activeCase: ClinicalCase;
  stage: ClinicalStage;
  isAr: boolean;
  onOpenReportModal: () => void;
  onOpenTelehealth?: () => void;
  onAdvanceStage: () => void;
}

export const TimelineReleasedReportCard: React.FC<TimelineReleasedReportCardProps> = ({
  activeCase,
  stage,
  isAr,
  onOpenReportModal,
  onOpenTelehealth,
  onAdvanceStage,
}) => {
  const isReportReleased =
    !!activeCase.reportReleased ||
    !!activeCase.metadata?.pdf1Released ||
    !!activeCase.doctorReleasedToPatient;

  if (!isReportReleased) return null;

  return (
    <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500/60 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          {isAr ? 'ملخص تقرير الرأي الطبي الثاني المعتمد:' : 'Certified Second Opinion Report Summary:'}
        </span>
        <span className="text-[11px] font-bold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200">
          ✓ {isAr ? 'معتمد من الطبيب السعودي ومنسق ألو' : 'Saudi MD Endorsed & Coordinator Released'}
        </span>
      </div>

      {activeCase.consultantOpinion && (
        <div dir="ltr" className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800 leading-relaxed text-left">
          <strong className="block text-alo-teal mb-1">
            {activeCase.consultant?.name || 'International Consultant'} ({activeCase.consultant?.center || 'Specialist Center'}):
          </strong>
          {activeCase.consultantOpinion}
        </div>
      )}

      {activeCase.saudiEndorsement?.localClinicalNotes && (
        <div className="text-xs text-emerald-900 dark:text-emerald-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
          <strong>{isAr ? 'توجيهات طبيبك السعودي: ' : 'Saudi Doctor Directives: '}</strong>
          {activeCase.saudiEndorsement.localClinicalNotes}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onOpenReportModal}
          className="px-4 py-2 rounded-xl bg-alo-teal hover:bg-teal-800 text-white text-xs font-extrabold shadow-sm cursor-pointer"
        >
          📄 {isAr ? 'فتح وطباعة التقرير الطبي الكامل (PDF 1)' : 'Open & Print Full Certified Report (PDF 1)'}
        </button>
        {activeCase.consultationType === 'video' && onOpenTelehealth && (
          <button
            type="button"
            onClick={onOpenTelehealth}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-alo-teal border border-teal-300 text-xs font-extrabold cursor-pointer"
          >
            🎥 {isAr ? 'الدخول لقاعة الاستشارة المرئية' : 'Join Video Telehealth Call'}
          </button>
        )}
        {stage === 'PARTNER_SERVICES' && (
          <button
            type="button"
            onClick={onAdvanceStage}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
          >
            💬 {isAr ? 'الانتقال لمتابعة الـ 21 يوماً →' : 'Proceed to 21-Day Follow-up →'}
          </button>
        )}
      </div>
    </div>
  );
};

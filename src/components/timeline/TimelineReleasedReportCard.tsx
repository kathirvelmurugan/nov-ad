import React from 'react';
import { FileCheck2, FileText, CheckCircle2 } from 'lucide-react';
import { ClinicalCase, ClinicalStage } from '../../types';

interface TimelineReleasedReportCardProps {
  activeCase: ClinicalCase;
  stage: ClinicalStage;
  isAr: boolean;
  onOpenReportModal: (type?: 'pdf1' | 'pdf2') => void;
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
    Boolean(activeCase.reportReleased) ||
    Boolean(activeCase.metadata?.pdf1Released) ||
    Boolean(activeCase.doctorReleasedToPatient) ||
    Boolean(activeCase.metadata?.pdf2Released) ||
    stage === 'CLOSED';

  if (!isReportReleased) return null;

  const isCaseClosed = stage === 'CLOSED' || Boolean(activeCase.metadata?.pdf2Released) || activeCase.status === 'closed';

  return (
    <div className={`p-5 rounded-2xl border-2 space-y-3 transition-all ${
      isCaseClosed
        ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500/70 shadow-sm'
        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/60'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
          {isCaseClosed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{isAr ? 'الملف الطبي الشامل النهائي المعتمد (PDF 2):' : 'Final Certified Comprehensive Dossier (PDF 2):'}</span>
            </>
          ) : (
            <>
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'ملخص تقرير الرأي الطبي الثاني المعتمد:' : 'Certified Second Opinion Report Summary:'}</span>
            </>
          )}
        </span>
        <span className="text-[11px] font-bold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          ✓ {isCaseClosed
            ? (isAr ? 'مؤرشف نهائياً ومطابق لـ ZATCA وسدايا' : 'Archived & Sealed · ZATCA & SDAIA Verified')
            : (isAr ? 'معتمد من الطبيب السعودي ومنسق ألو' : 'Saudi MD Endorsed & Coordinator Released')}
        </span>
      </div>

      {isCaseClosed && (
        <p className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed font-medium">
          {isAr
            ? 'تم حفظ واعتماد الملف الطبي الشامل النهائي (PDF 2) رقمياً بشكل دائم. يتضمن الرأي الطبي الثاني، ومداولات متابعة الـ 21 يوماً، وإيصال فاتورة هيئة الزكاة والضريبة والجمارك (ZATCA)، والأختام الرقمية المشفرة.'
            : 'Your Final Comprehensive Clinical Dossier (PDF 2) is securely sealed and archived. It integrates your second opinion, 21-day follow-up thread, official ZATCA tax receipt, and cryptographic audit seal.'}
        </p>
      )}

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
          {activeCase.saudiEndorsement?.localClinicalNotes}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {isCaseClosed ? (
          <>
            <button
              type="button"
              onClick={() => onOpenReportModal('pdf2')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>📑</span>
              <span>{isAr ? 'عرض وطباعة الملف الشامل النهائي (PDF 2)' : 'Open & Print Final Dossier (PDF 2)'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenReportModal('pdf1')}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 hover:bg-teal-50 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>{isAr ? 'معاينة التقرير الأول (PDF 1)' : 'View Opinion Report (PDF 1)'}</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onOpenReportModal('pdf1')}
            className="px-4 py-2 rounded-xl bg-alo-teal hover:bg-teal-800 text-white text-xs font-extrabold shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <span>📄</span>
            <span>{isAr ? 'فتح وطباعة التقرير الطبي الكامل (PDF 1)' : 'Open & Print Full Certified Report (PDF 1)'}</span>
          </button>
        )}

        {activeCase.consultationType === 'video' && onOpenTelehealth && !isCaseClosed && (
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

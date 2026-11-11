import React from 'react';
import { ClinicalCase } from '../../types';
import { BilingualReportModal } from '../cockpit/BilingualReportModal';
import {
  ShieldCheck,
  Clock,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { STAGES, getStageContent } from '../timeline/timelineContent';
import { TimelineProgressBar } from '../timeline/TimelineProgressBar';
import { TimelinePhysicalExamAlert } from '../timeline/TimelinePhysicalExamAlert';
import { TimelineReleasedReportCard } from '../timeline/TimelineReleasedReportCard';
import { TimelineDossierSummaryCard } from '../timeline/TimelineDossierSummaryCard';

interface Props {
  activeCase: ClinicalCase;
  cases?: ClinicalCase[];
  onSelectCase?: (caseId: string) => void;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onResetActiveCase?: () => void;
  onSelectRole?: (roleCode: string) => void;
  onBackToLanding?: () => void;
  onOpenTelehealth?: () => void;
  onOpenPayment?: () => void;
  lang?: 'ar' | 'en';
}

export const PatientStatusTimelineView: React.FC<Props> = ({
  activeCase,
  cases = [],
  onSelectCase,
  onAdvanceStage,
  onUpdateCase: _onUpdateCase,
  onResetActiveCase,
  onSelectRole,
  onBackToLanding,
  onOpenTelehealth,
  onOpenPayment,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const stage = activeCase.currentStage;
  const currentIndex = STAGES.findIndex((s) => s.stage === stage);
  const isDemoMode = false;
  const isInvoiceIssued = !!activeCase.invoiceIssued && Array.isArray(activeCase.allowedPaymentMethods) && activeCase.allowedPaymentMethods.length > 0;
  const isPaid = !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed';
  const isPaymentVerified = !!activeCase.paymentVerified || !!activeCase.metadata?.paymentVerified;
  const isReportReleased =
    !!activeCase.reportReleased ||
    !!activeCase.metadata?.pdf1Released ||
    !!activeCase.doctorReleasedToPatient;
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);

  const content = getStageContent(
    stage,
    activeCase,
    isAr,
    isInvoiceIssued,
    isPaid,
    isPaymentVerified,
    isReportReleased
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Return to Landing Page Breadcrumb */}
      {onBackToLanding && (
        <div className="flex items-center justify-between pb-1">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-black text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{isAr ? '← العودة إلى الصفحة الرئيسية واختيار الخدمات' : '← Back to Patient Landing Page'}</span>
          </button>
        </div>
      )}
      
      {/* Patient Own Cases Switcher */}
      {cases && cases.length > 1 && (
        <div className="card-clinical p-3.5 bg-gradient-to-r from-teal-50/60 to-slate-50 dark:from-slate-900/80 dark:to-teal-950/30 border border-teal-200 dark:border-teal-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-alo-navy dark:text-slate-200">
              {isAr ? `ملفاتي الطبية المسجلة (${cases.length} حالات)` : `My Registered Cases (${cases.length} cases)`}
            </span>
            <span className="text-[11px] text-slate-500">
              {isAr ? 'انقر للتبديل بين حالاتك السريرية' : 'Click to switch between your cases'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cases.map((c) => {
              const isSelected = c.id === activeCase.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCase?.(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-alo-teal text-white border-teal-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-alo-teal'
                  }`}
                >
                  <span className="font-mono">{c.caseNumber || c.id}</span>
                  <span>·</span>
                  <span>{isAr ? c.specialtyAr || c.specialty : c.specialtyEn || c.specialty}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Header: Patient Journey Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 rounded-2xl border border-teal-800/60 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-teal-500/20 text-teal-200 px-2.5 py-0.5 rounded text-xs font-mono font-bold border border-teal-500/30">
                {activeCase.caseNumber || activeCase.id}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isAr ? 'بوابة متابعة المريض المباشرة' : 'Live Patient Portal'}
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight">
              {isAr ? activeCase.patientNameAr : (activeCase.patientNameEn || activeCase.patientName)}
            </h2>
            <p className="text-xs text-teal-200/80 mt-1 flex flex-wrap items-center gap-2">
              <span>{isAr ? 'الهوية الوطنية: 10********' : 'National ID: 10********'}</span>
              <span>·</span>
              <span>{isAr ? (activeCase.specialtyAr || activeCase.specialty) : (activeCase.specialtyEn || activeCase.specialty)}</span>
              <span>·</span>
              <span>{activeCase.treatingDoctor?.city || (isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia')}</span>
            </p>
          </div>

          {/* Quick Isolated Reset (QA Only) */}
          {isDemoMode && onResetActiveCase && (
            <button
              onClick={onResetActiveCase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-xs font-bold transition-all"
              title={isAr ? 'إعادة ضبط مسار هذا المريض فقط' : 'Reset this patient case only'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة ضبط هذه الحالة فقط' : 'Reset This Case'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Visual Stepper: Patient Journey Progress Pipeline */}
      <TimelineProgressBar currentIndex={currentIndex} isAr={isAr} />

      {/* 2.5 In-Person Physical Examination Required Alert */}
      <TimelinePhysicalExamAlert activeCase={activeCase} isAr={isAr} />

      {/* 3. Central Stage Tracker Card */}
      <div className="bg-white dark:bg-alo-darkCard border border-slate-200 dark:border-alo-darkBorder rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Stage Status Badge & SLA */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-alo-teal border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            {isAr ? content.badgeAr : content.badgeEn}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            {isAr ? content.slaAr : content.slaEn}
          </span>
        </div>

        {/* Headline & Description */}
        <div className="space-y-3">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            {isAr ? content.titleAr : content.titleEn}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {isAr ? content.descAr : content.descEn}
          </p>
        </div>

        {/* Live Queue / Progress Callout */}
        <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-800 dark:text-sky-300">
              {isAr ? 'حالة التتبع المباشر للطلب:' : 'Live Request Tracking Status:'}
            </div>
            <div className="text-xs text-sky-700 dark:text-sky-400 mt-0.5 font-medium">
              {isAr ? content.queueStatusAr : content.queueStatusEn}
            </div>
          </div>
        </div>

        {/* Released Certified Report Summary (Shown ONLY after Coordinator assigns report) */}
        <TimelineReleasedReportCard
          activeCase={activeCase}
          stage={stage}
          isAr={isAr}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenTelehealth={onOpenTelehealth}
          onAdvanceStage={onAdvanceStage}
        />

        {/* Patient Actionable Milestones & Clinical Journey Status */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            {isAr ? 'الإجراء الحالي لمتابعة مسار الحالة:' : 'Current Case Milestone Action:'}
          </div>

          {stage === 'AWAITING_PAYMENT' && isInvoiceIssued && !isPaid ? (
            <button
              onClick={onOpenPayment}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs active:scale-95 cursor-pointer"
            >
              <span>{isAr ? 'الانتقال إلى بوابة الدفع وسداد الفاتورة الآن →' : 'Open Payment Checkout & Complete Payment Now →'}</span>
            </button>
          ) : stage === 'PARTNER_SERVICES' && isReportReleased ? (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs active:scale-95 cursor-pointer"
            >
              <span>{isAr ? 'عرض وطباعة التقرير الطبي المعتمد (PDF 1) →' : 'View & Print Certified Report (PDF 1) →'}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm">
              <Clock className="w-4 h-4 animate-pulse text-alo-teal" />
              <span>
                {stage === 'NURSE_CHECK'
                  ? (isAr ? 'قيد الفرز والتدقيق السريري وحجب الهوية لدى كادر التمريض' : 'Under clinical triage & SDAIA de-identification by Partner Hospital Nurse')
                  : stage === 'DOCTOR_REVIEW'
                  ? (isAr ? 'قيد المراجعة والاعتماد وصياغة الأسئلة لدى الطبيب السعودي المعالج' : 'Under clinical review by Saudi Treating Physician')
                  : stage === 'WITH_CONSULTANT'
                  ? (isAr ? 'قيد إعداد الرأي الطبي الثاني لدى الاستشاري الدولي' : 'Under review by International Medical Specialist')
                  : stage === 'AWAITING_PAYMENT'
                  ? (isInvoiceIssued
                      ? (isAr ? 'تم السداد — بانتظار تحقق منسق ألو وتوصيل الاستشاري' : 'Paid — awaiting ALO Coordinator verification')
                      : (isAr ? 'بانتظار إعداد الفاتورة وطرق الدفع من منسق رعاية ألو' : 'Awaiting ALO Coordinator payment setup'))
                  : stage === 'OPINION_READY'
                  ? (isAr ? 'بانتظار مراجعة واعتماد التقرير من الطبيب السعودي المعالج' : 'Awaiting Saudi Treating Doctor endorsement')
                  : (isAr ? 'بانتظار إسناد التقرير المعتمد من منسق رعاية ألو' : 'Awaiting ALO Coordinator report assignment')}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 4. Patient Dossier Summary Card (What the patient submitted) */}
      <TimelineDossierSummaryCard activeCase={activeCase} isAr={isAr} />

      <BilingualReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeCase={activeCase}
        lang={lang}
      />
    </div>
  );
};

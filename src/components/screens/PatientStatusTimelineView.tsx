import React from 'react';
import { ClinicalCase, UserSession } from '../../types';
import { BilingualReportModal } from '../cockpit/BilingualReportModal';
import {
  ShieldCheck,
  Clock,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Activity,
  FolderPlus,
  PlusCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
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
  onRegisterCase?: () => void;
  onStartNewCase?: () => void;
  onOpenFollowUp?: () => void;
  userSession?: UserSession | null;
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
  onRegisterCase,
  onStartNewCase,
  onOpenFollowUp,
  userSession,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  // Determine if this patient has any real registered/submitted clinical cases
  const isCaseRegistered = (c: ClinicalCase | undefined | null): boolean => {
    if (!c) return false;
    if (c.id === 'draft-intake' || c.status === 'draft') return false;
    if (c.caseNumber && c.caseNumber.trim().length > 0) return true;
    if ((c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0)) return true;
    return false;
  };

  const validRegisteredCases = (cases || []).filter(isCaseRegistered);
  const currentCaseIsRegistered = isCaseRegistered(activeCase);
  const hasNoCases = validRegisteredCases.length === 0 && !currentCaseIsRegistered;

  // ── Empty State: Patient has NO registered cases ──────────────────────────
  if (hasNoCases) {
    const displayName = userSession?.fullName || (isAr ? (activeCase.patientNameAr || activeCase.patientName || 'المريض') : (activeCase.patientNameEn || activeCase.patientName || 'Patient'));
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
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

        {/* 1. Header: Patient Identity Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 rounded-2xl border border-teal-800/60 shadow-lg text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'بوابة متابعة المريض المباشرة' : 'Live Patient Portal'}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {isAr ? 'لا توجد حالات مسجلة' : 'No Active Cases'}
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-tight">
                {displayName}
              </h2>
              <p className="text-xs text-teal-200/80 mt-1 flex flex-wrap items-center gap-2">
                {userSession?.phone && (
                  <>
                    <span className="font-mono">{userSession.phone}</span>
                    <span>·</span>
                  </>
                )}
                <span>{isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Main Empty State Card */}
        <div className="bg-white dark:bg-alo-darkCard border border-slate-200 dark:border-alo-darkBorder rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/60 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-inner border border-emerald-200 dark:border-emerald-800">
            <FolderPlus className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isAr ? 'ليس لديك أي حالات نشطة حالياً، سجّل حالة جديدة' : 'You do not have any active cases, register one'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {isAr
                ? 'لم يتم العثور على أي حالات سريرية مسجلة باسمك حتى الآن. يمكنك بدء طلب رأي طبي ثانٍ معتمد الآن وتسجيل حالتك بسهولة للحصول على استشارة كبار الاستشاريين الدوليين.'
                : 'You do not have any active cases registered under your name. Start a new medical second opinion or register a case to begin your clinical journey.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => {
                if (onStartNewCase) onStartNewCase();
                else if (onRegisterCase) onRegisterCase();
                else if (onBackToLanding) onBackToLanding();
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm py-3.5 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAr ? 'سجّل حالة جديدة (ابدأ الآن)' : 'Register a Case'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>

            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors cursor-pointer"
              >
                <span>{isAr ? 'العودة للصفحة الرئيسية' : 'Back to Home'}</span>
              </button>
            )}
          </div>

          {/* 3 Step Onboarding Highlights */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1 · {isAr ? 'اختيار التخصص' : 'Specialty'}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-1">
                {isAr ? 'حدد تخصص الحالة وصيغة الاستشارة' : 'Select Specialty & Format'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'مرئي أو مكتوب مع استشاري دولي معتمد' : 'Video or written second opinion'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                2 · {isAr ? 'بيانات المريض' : 'Intake'}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-1">
                {isAr ? 'سجل الأعراض والأسئلة التوجيهية' : 'Enter Details & Questions'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'حدد 3 أسئلة دقيقة ليركز عليها الطبيب' : '3 targeted clinical questions'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                3 · {isAr ? 'رفع التقارير' : 'Upload'}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-1">
                {isAr ? 'إرفاق فحوصات الأشعة والتقارير' : 'Upload Diagnostic Scans'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'مقاطع DICOM وملفات PDF مشفرة ومحمية' : 'DICOM loops & stamped PDF records'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  const [selectedReportType, setSelectedReportType] = React.useState<'pdf1' | 'pdf2'>('pdf2');

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
      
      {/* Patient Own Cases Switcher (Clean Horizontal Scroll Pill Bar) */}
      {cases && cases.length > 1 && (
        <div className="card-clinical p-3.5 bg-gradient-to-r from-teal-50/60 to-slate-50 dark:from-slate-900/80 dark:to-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-alo-navy dark:text-slate-200">
                {isAr ? `ملفاتي الطبية المسجلة (${cases.filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0)).length})` : `My Registered Cases (${cases.filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0)).length})`}
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {isAr ? '· انقر للتبديل بين ملفاتك الطبية' : '· Click to switch between your cases'}
              </span>
            </div>
            {onStartNewCase && (
              <button
                type="button"
                onClick={onStartNewCase}
                className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/80 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-300/80 dark:border-emerald-700 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة استشارة جديدة' : '+ Add New Case'}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {cases
              .filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0))
              .map((c) => {
                const isSelected = c.id === activeCase.id;
                const stageNum = c.stage || (c.currentStage ? STAGES.findIndex((s) => s.stage === c.currentStage) + 1 : 1);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCase?.(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-alo-teal text-white border-teal-600 shadow-md ring-2 ring-teal-500/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-alo-teal shadow-2xs'
                    }`}
                  >
                    <span className="font-mono font-black">{c.caseNumber || c.id}</span>
                    <span className="opacity-50">·</span>
                    <span className="max-w-[120px] truncate">{isAr ? c.specialtyAr || c.specialty || 'استشارة عامة' : c.specialtyEn || c.specialty || 'Consultation'}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {isAr ? `مرحلة ${stageNum}` : `Stage ${stageNum}`}
                    </span>
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

          <div className="flex items-center gap-2 shrink-0">
            {onStartNewCase && (
              <button
                type="button"
                onClick={onStartNewCase}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'طلب استشارة جديدة' : 'New Consultation'}</span>
              </button>
            )}

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
          onOpenReportModal={(type = 'pdf2') => {
            setSelectedReportType(type);
            setIsReportModalOpen(true);
          }}
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
          ) : (stage === 'CLOSED' || Boolean(activeCase.metadata?.pdf2Released) || activeCase.status === 'closed') ? (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedReportType('pdf2');
                  setIsReportModalOpen(true);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs active:scale-95 cursor-pointer"
              >
                <span>📑 {isAr ? 'عرض وتحميل الملف الشامل النهائي (PDF 2) →' : 'View & Download Final Dossier (PDF 2) →'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedReportType('pdf1');
                  setIsReportModalOpen(true);
                }}
                className="w-full sm:w-auto bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 hover:bg-teal-50 font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs active:scale-95 cursor-pointer"
              >
                <span>📄 {isAr ? 'التقرير الأول (PDF 1)' : 'Certified Report (PDF 1)'}</span>
              </button>
            </div>
          ) : stage === 'PARTNER_SERVICES' && isReportReleased ? (
            <button
              onClick={() => {
                setSelectedReportType('pdf1');
                setIsReportModalOpen(true);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs active:scale-95 cursor-pointer"
            >
              <span>{isAr ? 'عرض وطباعة التقرير الطبي المعتمد (PDF 1) →' : 'View & Print Certified Report (PDF 1) →'}</span>
            </button>
          ) : stage === 'FOLLOW_UP_21_DAYS' ? (
            <button
              onClick={onOpenFollowUp || onAdvanceStage}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs active:scale-95 cursor-pointer"
            >
              <span>💬 {isAr ? 'فتح محادثة المتابعة الطبية وتقييم الاستشارة →' : 'Open Follow-up Chat & Rating →'}</span>
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
                  ? (isAr ? 'تم استلام الرأي — بانتظار تدقيق منسق رعاية ألو وتوزيعه بالتزامن' : 'Opinion submitted — awaiting ALO Coordinator verification & dispatch')
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
        reportType={selectedReportType}
      />
    </div>
  );
};

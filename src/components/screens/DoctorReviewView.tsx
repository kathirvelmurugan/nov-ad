import React from 'react';
import { ClinicalCase, Persona, UserSession } from '../../types';
import { Check, Timer, ShieldCheck, FileCheck2, Stethoscope, Eye, CheckCircle2, X } from 'lucide-react';
import { useSlaCountdown } from '../../hooks/useSlaCountdown';
import { DoctorOpinionEndorsementPanel } from './doctor/DoctorOpinionEndorsementPanel';
import { DoctorFocusQuestionsSection } from './doctor/DoctorFocusQuestionsSection';
import { DoctorFacilityOrdersSection } from './doctor/DoctorFacilityOrdersSection';
import { PortalCaseTrackerPanel, getStageBadgeMeta } from '../common/PortalCaseTrackerPanel';

interface Props {
  activeCase?: ClinicalCase;
  cases?: ClinicalCase[];
  onSelectCase?: (caseId: string) => void;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
  userSession?: UserSession | null;
  activePersona?: Persona;
}

export const DoctorReviewView: React.FC<Props> = ({
  activeCase,
  cases = [],
  onSelectCase,
  onAdvanceStage,
  onUpdateCase,
  lang = 'ar',
  userSession,
  activePersona,
}) => {
  const isAr = lang === 'ar';
  const doctorName = userSession?.fullName || activePersona?.name || activeCase?.treatingDoctor?.name || (isAr ? 'الطبيب السعودي المعالج' : 'Saudi Treating Doctor');
  const partnerHospital = activeCase?.treatingDoctor?.hospital || (isAr ? 'المستشفى الشريك المعتمد' : 'Partner Accredited Hospital');

  const { formatted: slaFormatted } = useSlaCountdown({
    storageKey: `alo_sla_doctor_${activeCase?.id || 'default'}`,
    initialHours: 23,
    initialMinutes: 42,
    initialSeconds: 15,
  });

  const assignedConsultant = activeCase?.consultant || {
    name: 'Dr. Arjun Mehta',
    center: 'KIMS Heart Institute',
    city: 'Hyderabad, India',
  };

  const [localQuestions, setLocalQuestions] = React.useState<[string, string, string]>(() => {
    const src = isAr 
      ? activeCase?.treatingDoctor?.focusQuestions 
      : (activeCase?.treatingDoctor?.focusQuestionsEn || activeCase?.treatingDoctor?.focusQuestions);
    return [(src && src[0]) || '', (src && src[1]) || '', (src && src[2]) || ''];
  });

  React.useEffect(() => {
    const src = isAr 
      ? activeCase?.treatingDoctor?.focusQuestions 
      : (activeCase?.treatingDoctor?.focusQuestionsEn || activeCase?.treatingDoctor?.focusQuestions);
    setLocalQuestions([(src && src[0]) || '', (src && src[1]) || '', (src && src[2]) || '']);
  }, [lang, activeCase?.id]);

  const isActionableForDoctor = (c: ClinicalCase) => c.currentStage === 'DOCTOR_REVIEW' || (c.currentStage === 'OPINION_READY' && !c.saudiEndorsement?.releasedToPatient);

  const handleQuestionChange = (index: 0 | 1 | 2, value: string) => {
    if (!isReferralEditable) return;
    const updated = [...localQuestions] as [string, string, string];
    updated[index] = value;
    setLocalQuestions(updated);
    const baseAr = activeCase?.treatingDoctor?.focusQuestions || ['', '', ''];
    const arQs = [...baseAr] as [string, string, string];
    arQs[index] = value;
    onUpdateCase({
      focusQuestions: arQs,
      treatingDoctor: {
        ...(activeCase?.treatingDoctor || { name: 'د. عبد الله الشمري', hospital: 'مستشفى رعاية الرياض', city: 'الرياض' }),
        focusQuestions: arQs, focusQuestionsEn: arQs,
      },
    });
  };

  const questions = localQuestions;
  const hasConsultantOpinion =
    activeCase?.currentStage === 'OPINION_READY' ||
    ['PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(activeCase?.currentStage || '') ||
    (activeCase?.currentStage !== 'DOCTOR_REVIEW' && !!activeCase?.secondOpinionSubmitted);

  const [viewTab, setViewTab] = React.useState<'opinion' | 'referral'>(
    hasConsultantOpinion ? 'opinion' : 'referral'
  );

  React.useEffect(() => {
    setViewTab(hasConsultantOpinion ? 'opinion' : 'referral');
  }, [hasConsultantOpinion, activeCase?.id]);

  const pendingDoctorCases = React.useMemo(() => {
    return cases.filter(isActionableForDoctor);
  }, [cases]);

  const isCurrentStageDoctor = !!activeCase && isActionableForDoctor(activeCase);
  const isReferralEditable = activeCase?.currentStage === 'DOCTOR_REVIEW';

  const [forwardedBanner, setForwardedBanner] = React.useState<{ caseId: string; caseNumber: string; patientName: string } | null>(null);

  // Zero-Case Dedicated Empty State
  if (!activeCase || !activeCase.caseNumber || cases.length === 0) {
    return (
      <div data-testid="doctor-review-empty" className="max-w-2xl mx-auto my-12 text-center p-10 card-clinical space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-alo-teal flex items-center justify-center mx-auto text-2xl border border-teal-200 dark:border-teal-800 shadow-inner">
          <Stethoscope className="w-8 h-8 text-alo-teal" />
        </div>
        <h3 className="text-xl font-black text-alo-navy dark:text-slate-100">
          {isAr ? 'لا توجد حالات بانتظار مراجعة الطبيب السعودي المعالج' : 'No Cases Pending Doctor Review'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {isAr
            ? 'صندوق إحالات الطبيب المعالج محدّث بالكامل. ستظهر الحالات هنا فور اعتماد الفرز التمريضي وتدقيق الفحوصات.'
            : 'Physician referral queue is up to date. Cases will appear here once Nurse Triage is completed and verified.'}
        </p>
      </div>
    );
  }

  const stageMeta = !isCurrentStageDoctor ? getStageBadgeMeta(activeCase.currentStage, isAr) : null;

  return (
    <div data-testid="doctor-review-view" className="max-w-4xl mx-auto space-y-6">
      {/* Integrated Portal Case Tracker Panel */}
      {cases.length > 0 && (
        <div className="w-full">
          <PortalCaseTrackerPanel
            cases={cases}
            activeCaseId={activeCase.id}
            onSelectCase={onSelectCase}
            lang={lang}
            portalTitleAr="مراجعة الطبيب المعالج وتتبع الحالات"
            portalTitleEn="Saudi Doctor Queue & Case Tracking"
            actionablePredicate={isActionableForDoctor}
          />
        </div>
      )}

      {/* D10 Forwarded Confirmation Banner */}
      {forwardedBanner && (
        <div
          role="status"
          dir={isAr ? 'rtl' : 'ltr'}
          className="card-clinical p-4 bg-gradient-to-r from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-300 dark:border-emerald-800/70 flex flex-wrap items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide">
                {isAr ? 'تم النقل بنجاح' : 'Successfully Forwarded'}
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">
                {isAr
                  ? `تم نقل الحالة [${forwardedBanner.caseNumber}] إلى المرحلة التالية ← منسق رعاية ألو (C01)`
                  : `Case [${forwardedBanner.caseNumber}] moved to next stage → ALO Coordinator (C01)`}
              </p>
              {forwardedBanner.patientName && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                  {isAr ? 'المريض:' : 'Patient:'} {forwardedBanner.patientName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectCase?.(forwardedBanner.caseId)}
              className="text-xs font-extrabold px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              {isAr ? 'عرض في التتبع' : 'View in Tracker'}
            </button>
            <button
              type="button"
              onClick={() => setForwardedBanner(null)}
              aria-label={isAr ? 'إغلاق الإشعار' : 'Dismiss notification'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Read-Only Tracking Mode Banner */}
      {!isCurrentStageDoctor && stageMeta && (
        <div className="card-clinical p-4 bg-gradient-to-r from-slate-50 to-teal-50/40 dark:from-slate-900/80 dark:to-teal-950/30 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-alo-teal shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isAr ? 'وضع التتبع (للقراءة فقط) · الحالة في مرحلة أخرى خارج إجراء الطبيب الحالي' : 'Tracking Mode (Read-Only) · Case Currently in Another Stage'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${stageMeta.colorClass}`}>
                {stageMeta.label}
              </span>
            </div>
          </div>
          {pendingDoctorCases.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectCase?.(pendingDoctorCases[0].id)}
              className="text-xs font-extrabold px-4 py-2 rounded-lg bg-alo-teal text-white hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
            >
              {isAr ? 'الانتقال إلى الحالة المنتظرة لمراجعتك' : 'Jump to Next Actionable Case'}
            </button>
          )}
        </div>
      )}

      {/* Doctor Header & SLA Warning */}
      <div className="card-clinical p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-alo-teal">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
              D01 · {isAr ? 'الطبيب السعودي المعالج' : 'Saudi Treating Doctor'}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {isAr ? 'المستشفى الشريك:' : 'Partner Hospital:'} {partnerHospital}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-mono font-bold text-alo-teal">
              {activeCase.caseNumber}
            </span>
          </div>
          <h2 className="text-2xl font-black text-alo-navy dark:text-slate-100 mt-1">
            {doctorName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-alo-teal font-mono text-xs font-bold border border-teal-200 dark:border-teal-800">
              <ShieldCheck className="w-3.5 h-3.5 text-alo-teal" />
              {isAr
                ? `المريض المسجل (محلياً): ${activeCase.patientName || activeCase.patientNameAr || '—'}`
                : `Domestic Patient: ${activeCase.patientName || activeCase.patientNameEn || '—'}`}
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {isAr ? `الهوية / الإقامة: ${activeCase.nationalIdMasked || '—'}` : `ID / Iqama: ${activeCase.nationalIdMasked || '—'}`}
            </span>
            <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              {isAr ? `رمز العبور للهند: ${activeCase.egressToken || '—'}` : `Egress Token: ${activeCase.egressToken || '—'}`}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? (activeCase.specialtyAr || activeCase.specialty) : (activeCase.specialtyEn || activeCase.specialty)} · {activeCase.treatingDoctor?.city || (isAr ? 'الرياض' : 'Riyadh')}
            </span>
          </div>
        </div>

        {/* 24-Hour SLA Badge */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 p-3 rounded-xl flex items-center gap-3 shadow-sm">
          <Timer className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
          <div>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-bold">
              {isAr ? 'مهلة المراجعة السريرية (SLA X09):' : 'Clinical SLA Review Window:'}
            </span>
            <span className="text-xs font-mono font-black text-amber-900 dark:text-amber-200" data-testid="doctor-sla-timer">
              {slaFormatted} {isAr ? 'متبقية' : 'Remaining'}
            </span>
          </div>
        </div>
      </div>

      {hasConsultantOpinion && (
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-alo-darkCard p-2 rounded-2xl border border-slate-200 dark:border-alo-darkBorder shadow-2xs">
          <button
            type="button"
            onClick={() => setViewTab('opinion')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              viewTab === 'opinion'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isAr ? 'D11–D12 · رأي الاستشاري الدولي والاعتماد' : 'D11–D12 · Indian Consultant Opinion & Approval'}
          </button>
          <button
            type="button"
            onClick={() => setViewTab('referral')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              viewTab === 'referral'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isAr ? 'D01–D10 · بيانات الإحالة الأصلية' : 'D01–D10 · Original Referral Details'}
          </button>
        </div>
      )}

      {hasConsultantOpinion && viewTab === 'opinion' ? (
        <DoctorOpinionEndorsementPanel
          activeCase={activeCase}
          onAdvanceStage={onAdvanceStage}
          onUpdateCase={onUpdateCase}
          lang={lang}
        />
      ) : (
      <>
      {/* Patient Symptoms & Chief Complaint Dossier Card */}
      <div className="card-clinical p-5 space-y-3 bg-gradient-to-r from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-teal-950/20 border-l-4 border-l-alo-teal">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
              P01-P06 · {isAr ? 'الشكوى السريرية والأعراض المسجلة' : 'Patient Symptoms & Clinical History'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            ✓ {isAr ? 'ملف المريض مكتمل' : 'Intake Dossier Complete'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="font-bold text-slate-500 block mb-1">
              {isAr ? 'التشخيص المبدئي المرفوع:' : 'Reported Primary Diagnosis:'}
            </span>
            <span className="font-extrabold text-sm text-alo-navy dark:text-slate-100">
              {isAr ? (activeCase.diagnosisAr || activeCase.diagnosis) : (activeCase.diagnosisEn || activeCase.diagnosis)}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="font-bold text-slate-500 block mb-1">
              {isAr ? 'الأعراض والشكوى السريرية المفصلة:' : 'Detailed Symptoms & Complaint:'}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {isAr 
                ? (activeCase.symptomsAr || activeCase.symptoms || 'ألم صدري خناقي مع ضيق تنفس جهدي ونوبات دوار حديثة عند بذل أي مجهود بدني')
                : (activeCase.symptomsEn || activeCase.symptoms || 'Exertional angina, dyspnea NYHA class III, and recent presyncope on exertion')}
            </span>
          </div>
        </div>
      </div>

      {/* D02-D04: Diagnostic Scans & Lab Triage Review */}
      <div className="card-clinical p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
              D02–D04 · {isAr ? 'تدقيق الفحوصات والأشعة والمؤشرات' : 'Diagnostic Scans & Lab Inspection'}
            </span>
            <FileCheck2 className="w-4 h-4 text-alo-teal" />
            <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
              {isAr ? 'الملف التشخيصي المرفوع من التمريض:' : 'Clinical Dossier & Scans:'}
            </h3>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
            ✓ {isAr ? 'فحوصات مكتملة ومدققة' : 'Verified Clinical Scans'}
          </span>
        </div>

        <p className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
          {isAr ? (activeCase.diagnosisAr || activeCase.diagnosis) : (activeCase.diagnosisEn || activeCase.diagnosis)}
        </p>
      </div>

      {/* Review Details & Consultant Selection */}
      <div className="card-clinical p-6 space-y-6">
        {/* D05-D06: Pick the Indian consultant (recipient) + confirm call type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
              D05–D06 · {isAr ? 'اختيار الاستشاري ونمط الاستشارة' : 'Specialist & Modality Selection'}
            </span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isAr ? 'الاستشاري الدولي المعين (المستقبل):' : 'Assigned Indian Consultant (Recipient):'}
            </label>
            <div className="bg-slate-50 dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xs border border-slate-200 dark:border-slate-700">🇮🇳</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">{assignedConsultant.name}</h4>
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      ✓ {isAr ? 'معتمد رسمياً' : 'Verified Specialist'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {assignedConsultant.center} · {assignedConsultant.city}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800 font-bold">
                {isAr ? 'جاهز للاستشارة' : 'Direct Dispatch Ready'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'تأكيد نوع الاستشارة:' : 'Confirm call type:'}
            </span>
            <button
              type="button"
              disabled={!isReferralEditable}
              onClick={() => { if (!isReferralEditable) return; onUpdateCase({ consultationType: 'written' }); }}
              className={`text-xs px-3 py-1 rounded-lg font-extrabold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                activeCase.consultationType === 'written'
                  ? 'bg-alo-mint border-teal-300 text-alo-teal'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {isAr ? 'رأي مكتوب فقط' : 'Written opinion only'}
            </button>
            <button
              type="button"
              disabled={!isReferralEditable}
              onClick={() => { if (!isReferralEditable) return; onUpdateCase({ consultationType: 'video' }); }}
              className={`text-xs px-3 py-1 rounded-lg font-extrabold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                activeCase.consultationType === 'video'
                  ? 'bg-alo-mint border-teal-300 text-alo-teal'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {isAr ? 'مرئي + رأي مكتوب' : 'Video + written opinion'}
            </button>
          </div>

          {/* Universal In-Person Physical Exam Flag */}
          <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/70 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isReferralEditable}
                  checked={!!activeCase.inPersonExamRequired}
                  onChange={(e) => {
                    if (!isReferralEditable) return;
                    const checked = e.target.checked;
                    onUpdateCase({
                      inPersonExamRequired: checked,
                      inPersonExamReason: checked ? (activeCase.inPersonExamReason || (isAr ? 'فحص سريري مباشر وتقييم استقرار المفصل وردود الفعل الحركية' : 'Direct physical examination & joint stability / motor reflex evaluation')) : undefined,
                      inPersonAppointmentSlot: checked ? (activeCase.inPersonAppointmentSlot || (isAr ? 'غداً - 10:30 صباحاً (عيادة العظام)' : 'Tomorrow - 10:30 AM (Orthopedic Clinic)')) : undefined,
                      internalOrders: {
                        ...(activeCase.internalOrders || {
                          medicalCenterId: 'mc_riyadh_care',
                          medicalCenterName: activeCase.treatingDoctor?.hospital || partnerHospital,
                          lab: { ordered: false, tests: [], status: 'none' },
                          pharmacy: { ordered: false, medications: [], status: 'none' },
                        }),
                        reception: {
                          checkinCode: 'ALO-RC-8812',
                          status: checked ? 'scheduled' : 'none',
                          appointmentSlot: checked ? (isAr ? 'غداً - 10:30 صباحاً' : 'Tomorrow - 10:30 AM') : undefined,
                        }
                      }
                    });
                  }}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? '🏥 يلزم فحص سريري حضوري بالمجمع الطبي (قرار الطبيب المعالج)' : '🏥 In-Person Clinical Exam Required at Medical Center'}
                </span>
              </label>
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded border border-amber-300">
                {isAr ? 'شامل: للرأي المكتوب والمرئي' : 'Universal (Written & Video)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {isAr
                ? '💡 معيار طبي سعودي: يقرر الطبيب المعالج حاجة المريض للفحص الحسي البدني أو قياس المدى الحركي بالمجمع، ويتم حجز موعد الاستقبال تلقائياً دون إيقاف دراسة الاستشاري الدولي.'
                : '💡 Saudi clinical standard: Treating physician determines if hands-on physical palpation is needed; reception slot is scheduled concurrently without halting the international review.'}
            </p>

            {activeCase.inPersonExamRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'السبب السريري للفحص الحضوري:' : 'Clinical Reason for In-Person Exam:'}
                  </label>
                  <input
                    type="text"
                    disabled={!isReferralEditable}
                    value={activeCase.inPersonExamReason || ''}
                    onChange={(e) => { if (!isReferralEditable) return; onUpdateCase({ inPersonExamReason: e.target.value }); }}
                    placeholder={isAr ? 'مثال: فحص استقرار المفصل ودرجة الحركة' : 'e.g. Joint stability & ROM evaluation'}
                    className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'موعد الحضور الموصى به لدى الاستقبال (REC01):' : 'Scheduled In-Person Slot (REC01):'}
                  </label>
                  <select
                    disabled={!isReferralEditable}
                    value={activeCase.inPersonAppointmentSlot || (isAr ? 'غداً - 10:30 صباحاً (عيادة العظام)' : 'Tomorrow - 10:30 AM (Orthopedic Clinic)')}
                    onChange={(e) => { if (!isReferralEditable) return; onUpdateCase({ inPersonAppointmentSlot: e.target.value }); }}
                    className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value={isAr ? 'غداً - 10:30 صباحاً (عيادة العظام)' : 'Tomorrow - 10:30 AM (Orthopedic Clinic)'}>
                      {isAr ? 'غداً - 10:30 صباحاً (عيادة العظام)' : 'Tomorrow - 10:30 AM (Orthopedic Clinic)'}
                    </option>
                    <option value={isAr ? 'غداً - 02:00 مساءً (عيادة القلب)' : 'Tomorrow - 02:00 PM (Cardiology Clinic)'}>
                      {isAr ? 'غداً - 02:00 مساءً (عيادة القلب)' : 'Tomorrow - 02:00 PM (Cardiology Clinic)'}
                    </option>
                    <option value={isAr ? 'بعد غد - 11:00 صباحاً (الاستشاري المناوب)' : 'Day After Tomorrow - 11:00 AM (Attending Consultant)'}>
                      {isAr ? 'بعد غد - 11:00 صباحاً (الاستشاري المناوب)' : 'Day After Tomorrow - 11:00 AM (Attending Consultant)'}
                    </option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3 Mandatory Focus Questions */}
        <DoctorFocusQuestionsSection
          isAr={isAr}
          questions={questions}
          onQuestionChange={handleQuestionChange}
        />

        {/* D08: Concurrent In-House Facility Lab & Pharmacy Orders */}
        <DoctorFacilityOrdersSection
          activeCase={activeCase}
          isAr={isAr}
          onUpdateCase={onUpdateCase}
        />

        {/* Advance Action */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            disabled={!isReferralEditable}
            onClick={() => {
              if (!isReferralEditable) return;

              const forwardedCaseId = activeCase.id;
              const forwardedCaseNumber = activeCase.caseNumber || activeCase.id;
              const forwardedPatient = (isAr ? activeCase.patientNameAr : activeCase.patientNameEn) || activeCase.patientName || '';

              setForwardedBanner({
                caseId: forwardedCaseId,
                caseNumber: forwardedCaseNumber,
                patientName: forwardedPatient,
              });

              const nextPending = pendingDoctorCases.find((c) => c.id !== activeCase.id);
              onUpdateCase({
                currentStage: 'AWAITING_PAYMENT',
                referralApproved: true, invoiceIssued: false, allowedPaymentMethods: [], paymentAssignedAt: undefined, paymentVerified: false,
                pricing: { ...activeCase.pricing, paid: false, invoiceNumber: undefined },
                metadata: { ...(activeCase.metadata || {}), paymentLinkIssued: false, paymentVerified: false },
              });
              if (nextPending && onSelectCase) onSelectCase(nextPending.id);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'D10 · اعتماد الإحالة وإرسال الملف لمنسق رعاية ألو (C01)' : 'D10 · Approve Referral & Route to ALO Coordinator (C01)'}</span>
            <span>{isAr ? '←' : '→'}</span>
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
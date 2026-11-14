import React from 'react';
import { ClinicalCase, Persona, UserSession } from '../../types';
import { Check, Stethoscope, Eye, CheckCircle2, X, MousePointerClick } from 'lucide-react';
import { useSlaCountdown } from '../../hooks/useSlaCountdown';
import { DoctorOpinionEndorsementPanel } from './doctor/DoctorOpinionEndorsementPanel';
import { DoctorFocusQuestionsSection } from './doctor/DoctorFocusQuestionsSection';
import { DoctorFacilityOrdersSection } from './doctor/DoctorFacilityOrdersSection';
import DoctorConsultantSelectSection from './doctor/DoctorConsultantSelectSection';
import DoctorDiagnosisAuditSection from './doctor/DoctorDiagnosisAuditSection';
import DoctorHeaderBar from './doctor/DoctorHeaderBar';
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
  activeCase: propsActiveCase,
  cases = [],
  onSelectCase,
  onAdvanceStage,
  onUpdateCase,
  lang = 'ar',
  userSession,
  activePersona,
}) => {
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null);

  const isActionableForDoctor = (c: ClinicalCase) =>
    c.currentStage === 'DOCTOR_REVIEW' ||
    (c.currentStage === 'OPINION_READY' &&
      (Boolean(c.metadata?.coordinatorDispatched) || Boolean(c.reportReleased)) &&
      c.saudiEndorsement?.status !== 'endorsed');

  const pendingDoctorCases = React.useMemo(() => {
    return cases.filter(isActionableForDoctor);
  }, [cases]);

  // Intelligent Caseload Auto-Selection: Auto-default to the first actionable doctor case
  const defaultDoctorCase = pendingDoctorCases[0] || (propsActiveCase?.id ? propsActiveCase : cases[0]);
  const effectiveCaseId = selectedCaseId !== null ? selectedCaseId : defaultDoctorCase?.id || null;
  const currentCase = effectiveCaseId ? (cases.find((c) => c.id === effectiveCaseId) || null) : null;
  const activeCase = (currentCase || propsActiveCase) as ClinicalCase;

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

  const isReferralEditable = currentCase?.currentStage === 'DOCTOR_REVIEW';

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
  const areQuestionsValid = Boolean(
    questions &&
    questions.length === 3 &&
    questions.every((q) => (q || '').trim().length >= 10)
  );
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

  const isCurrentStageDoctor = !!currentCase && isActionableForDoctor(currentCase);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    onSelectCase?.(caseId);
  };

  const [forwardedBanner, setForwardedBanner] = React.useState<{
    caseId: string;
    caseNumber: string;
    patientName: string;
    targetStageAr?: string;
    targetStageEn?: string;
  } | null>(null);

  React.useEffect(() => {
    if (!forwardedBanner) return;
    const timer = setTimeout(() => setForwardedBanner(null), 8000);
    return () => clearTimeout(timer);
  }, [forwardedBanner]);

  if (cases.length === 0) {
    return (
      <div data-testid="doctor-review-view" data-subview="empty" className="max-w-2xl mx-auto my-12 text-center p-10 card-clinical space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-alo-teal flex items-center justify-center mx-auto text-2xl border border-teal-200">
          <Stethoscope className="w-8 h-8 text-alo-teal" />
        </div>
        <h3 className="text-xl font-black text-alo-navy dark:text-slate-100">{isAr ? 'لا توجد حالات بانتظار مراجعة الطبيب' : 'No Cases Pending Doctor Review'}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{isAr ? 'صندوق إحالات الطبيب المعالج محدّث بالكامل.' : 'Physician referral queue is up to date.'}</p>
      </div>
    );
  }

  const stageMeta = currentCase && !isCurrentStageDoctor ? getStageBadgeMeta(currentCase.currentStage, isAr) : null;

  return (
    <div data-testid="doctor-review-view" className="max-w-4xl mx-auto space-y-6">
      <div className="w-full">
        <PortalCaseTrackerPanel
          cases={cases}
          activeCaseId={selectedCaseId || ''}
          onSelectCase={handleSelectCase}
          lang={lang}
          portalTitleAr="مراجعة الطبيب المعالج وتتبع الحالات"
          portalTitleEn="Saudi Doctor Queue & Case Tracking"
          actionablePredicate={isActionableForDoctor}
        />
      </div>

      {!currentCase ? (
        <div className="card-clinical p-8 text-center space-y-3 bg-white dark:bg-slate-900 border border-dashed border-slate-300 rounded-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 flex items-center justify-center text-[#007B6E]">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{isAr ? 'يرجى اختيار حالة من قائمة الإحالات أعلاه' : 'Select a Case from the Queue Above'}</h3>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 rounded-xl px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-teal-900 dark:text-teal-200">{isAr ? 'عرض تفاصيل الحالة:' : 'Viewing Case:'}</span>
              <span className="font-mono font-bold text-[#007B6E]">{currentCase.caseNumber || currentCase.id}</span>
              <span className="text-slate-400">·</span>
              <span className="font-bold text-slate-700">{isAr ? (currentCase.patientNameAr || currentCase.patientName) : (currentCase.patientNameEn || currentCase.patientName)}</span>
            </div>
            <button type="button" onClick={() => setSelectedCaseId(null)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold cursor-pointer">
              <X className="w-3.5 h-3.5" />
              <span>{isAr ? 'إغلاق التفاصيل' : 'Close Details'}</span>
            </button>
          </div>

          {!isCurrentStageDoctor && stageMeta && (
            <div className="card-clinical p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-alo-teal" />
                <span className="text-xs font-extrabold">{isAr ? 'وضع التتبع (للقراءة فقط)' : 'Tracking Mode (Read-Only)'}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${stageMeta.colorClass}`}>{stageMeta.label}</span>
              </div>
              {pendingDoctorCases.length > 0 && (
                <button type="button" onClick={() => handleSelectCase(pendingDoctorCases[0].id)} className="px-4 py-2 bg-alo-teal text-white text-xs font-bold rounded-lg cursor-pointer">
                  {isAr ? 'الانتقال إلى الحالة المنتظرة لمراجعتك' : 'Jump to Next Actionable Case'}
                </button>
              )}
            </div>
          )}

          <DoctorHeaderBar
            activeCase={activeCase}
            doctorName={doctorName}
            partnerHospital={partnerHospital}
            slaFormatted={slaFormatted}
            isAr={isAr}
          />

          {hasConsultantOpinion && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewTab('opinion')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${viewTab === 'opinion' ? 'bg-alo-teal text-white' : 'text-slate-600'}`}
              >
                {isAr ? 'D11–D12 · رأي الاستشاري الدولي والاعتماد' : 'D11–D12 · Indian Consultant Opinion & Approval'}
              </button>
              <button
                type="button"
                onClick={() => setViewTab('referral')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${viewTab === 'referral' ? 'bg-alo-teal text-white' : 'text-slate-600'}`}
              >
                {isAr ? 'D01–D10 · بيانات الإحالة الأصلية' : 'D01–D10 · Original Referral Details'}
              </button>
            </div>
          )}

          {viewTab === 'opinion' && hasConsultantOpinion ? (
            <DoctorOpinionEndorsementPanel
              activeCase={activeCase}
              lang={lang}
              onUpdateCase={onUpdateCase}
              onAdvanceStage={onAdvanceStage}
            />
          ) : (
            <div className="card-clinical p-6 space-y-6">
              <DoctorDiagnosisAuditSection activeCase={activeCase} isAr={isAr} />
              <DoctorConsultantSelectSection
                activeCase={activeCase}
                assignedConsultant={assignedConsultant}
                isReferralEditable={isReferralEditable}
                partnerHospital={partnerHospital}
                isAr={isAr}
                onUpdateCase={onUpdateCase}
              />
              <DoctorFocusQuestionsSection
                isAr={isAr}
                questions={questions}
                onQuestionChange={handleQuestionChange}
              />
              <DoctorFacilityOrdersSection
                activeCase={activeCase}
                isAr={isAr}
                onUpdateCase={onUpdateCase}
              />

              <div className="pt-4 border-t border-slate-200 flex flex-col items-end gap-1.5">
                <button
                  disabled={!isReferralEditable || !areQuestionsValid}
                  onClick={() => {
                    if (!isReferralEditable || !areQuestionsValid) return;
                    setForwardedBanner({
                      caseId: activeCase.id,
                      caseNumber: activeCase.caseNumber || activeCase.id,
                      patientName: (isAr ? activeCase.patientNameAr : activeCase.patientNameEn) || activeCase.patientName || '',
                      targetStageAr: 'منسق رعاية ألو (C01)',
                      targetStageEn: 'ALO Coordinator (C01)',
                    });
                    onUpdateCase({
                      currentStage: 'AWAITING_PAYMENT',
                      referralApproved: true, invoiceIssued: false, allowedPaymentMethods: [], paymentAssignedAt: undefined, paymentVerified: false,
                      pricing: { ...activeCase.pricing, paid: false, invoiceNumber: undefined },
                      metadata: { ...(activeCase.metadata || {}), paymentLinkIssued: false, paymentVerified: false },
                    });
                    setSelectedCaseId(null);
                    onSelectCase?.('');
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 text-white font-extrabold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'D10 · اعتماد الإحالة وإرسال الملف لمنسق رعاية ألو (C01)' : 'D10 · Approve Referral & Route to ALO Coordinator (C01)'}</span>
                </button>
                {!areQuestionsValid && isReferralEditable && (
                  <span className="text-[11px] text-rose-500 font-medium">
                    {isAr ? '⚠️ مطلوب استيفاء الأسئلة التوجيهية الثلاثة' : '⚠️ All 3 focus questions must be completed'}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {forwardedBanner && (
        <aside role="status" dir={isAr ? 'rtl' : 'ltr'} className="fixed bottom-6 inset-x-4 max-w-4xl mx-auto z-50 p-4 bg-white/95 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="text-xs font-extrabold text-emerald-800 uppercase">{isAr ? 'تم النقل بنجاح' : 'Forwarded'}</span>
              <p className="text-sm font-bold text-slate-800">
                {isAr ? `تم نقل الحالة [${forwardedBanner.caseNumber}] إلى المرحلة التالية ← ${forwardedBanner.targetStageAr || 'منسق رعاية ألو (C01)'}` : `Case [${forwardedBanner.caseNumber}] moved to next stage → ${forwardedBanner.targetStageEn || 'ALO Coordinator (C01)'}`}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setForwardedBanner(null)} className="w-8 h-8 flex items-center justify-center text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { ClinicalCase, PaymentMethodId } from '../../types';
import { MousePointerClick } from 'lucide-react';
import { TEAL_PRIMARY, TEAL_ACCENT, TEAL_BG } from '../coordinator/coordinatorStyles';
import { CoordinatorPaymentGateTab } from '../coordinator/CoordinatorPaymentGateTab';
import { CoordinatorTelehealthTab } from '../coordinator/CoordinatorTelehealthTab';
import { CoordinatorReportReleaseTab } from '../coordinator/CoordinatorReportReleaseTab';
import { CoordinatorFollowUpTab } from '../coordinator/CoordinatorFollowUpTab';
import { CoordinatorCaseClosureTab } from '../coordinator/CoordinatorCaseClosureTab';
import CoordinatorCaseHeader from '../coordinator/CoordinatorCaseHeader';
import CoordinatorNavTabs from '../coordinator/CoordinatorNavTabs';
import { BilingualReportModal } from '../cockpit/BilingualReportModal';
import { PortalCaseTrackerPanel, getStageBadgeMeta } from '../common/PortalCaseTrackerPanel';
import { isActionableForCoordinator, getTierData, getDefaultProposedSlots, getDefaultIncomingQuestions } from '../coordinator/coordinatorLogic';

interface Props {
  activeCase?: ClinicalCase;
  cases?: ClinicalCase[];
  onSelectCase?: (caseId: string) => void;
  onAdvanceStage: () => void;
  onAssignPaymentToPatient?: (
    methods: PaymentMethodId[],
    tierData: { tier: number; tierName: string; baseSar: number; vatSar: number; totalSar: number },
  ) => void;
  onVerifyPaymentAndDispatch?: () => void;
  onReleaseReportToPatient?: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang: 'ar' | 'en';
}

export const CoordinatorPortalView: React.FC<Props> = ({
  activeCase: propsActiveCase,
  cases = [],
  onSelectCase,
  onAdvanceStage,
  onAssignPaymentToPatient,
  onVerifyPaymentAndDispatch,
  onReleaseReportToPatient,
  onUpdateCase,
  lang,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const pendingCoordinatorCases = useMemo(() => {
    return cases.filter(isActionableForCoordinator);
  }, [cases]);

  // Intelligent Caseload Auto-Selection: Auto-default to the first actionable coordinator case
  const defaultCoordCase = pendingCoordinatorCases[0] || (propsActiveCase?.id ? propsActiveCase : cases[0]);
  const effectiveCaseId = selectedCaseId !== null ? selectedCaseId : defaultCoordCase?.id || null;
  const currentCase = effectiveCaseId ? (cases.find((c) => c.id === effectiveCaseId) || null) : null;
  const activeCase = (currentCase || propsActiveCase) as ClinicalCase;

  const isPaid = !!activeCase?.pricing?.paid || activeCase?.paymentDetails?.status === 'completed';
  const isPaymentVerified = !!activeCase?.paymentVerified || !!activeCase?.metadata?.paymentVerified;
  const isInvoiceIssued = !!activeCase?.invoiceIssued;
  const isSaudiDoctorApproved = activeCase?.saudiEndorsement?.status === 'endorsed' || !!activeCase?.metadata?.saudiDoctorApprovedOpinion;

  const getInitialTab = (): 'C01' | 'C07' | 'C08' | 'C09' | 'C10' => {
    if (activeCase?.currentStage === 'AWAITING_PAYMENT' || (isPaid && !isPaymentVerified)) return 'C01';
    if (activeCase?.currentStage === 'PARTNER_SERVICES' || (Boolean(activeCase?.secondOpinionSubmitted || activeCase?.currentStage === 'OPINION_READY') && !activeCase?.reportReleased) || (isSaudiDoctorApproved && !activeCase?.reportReleased)) return 'C08';
    if (activeCase?.currentStage === 'CLOSED') return 'C10';
    if (activeCase?.currentStage === 'FOLLOW_UP_21_DAYS') return 'C09';
    if (activeCase?.consultationType === 'video' && isPaid && isPaymentVerified) return 'C07';
    return 'C01';
  };

  const [activeTab, setActiveTab] = useState<'C01' | 'C07' | 'C08' | 'C09' | 'C10'>(getInitialTab);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isPDF2ModalOpen, setIsPDF2ModalOpen] = useState(false);
  const [coordinatorReportType, setCoordinatorReportType] = useState<'pdf1' | 'pdf2'>('pdf2');
  const [selectedConsultationType, setSelectedConsultationType] = useState<'written' | 'video'>(activeCase?.consultationType === 'written' ? 'written' : 'video');
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethodId[]>(activeCase?.allowedPaymentMethods && activeCase.allowedPaymentMethods.length > 0 ? activeCase.allowedPaymentMethods : ['mada', 'applepay', 'visa', 'tabby']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [relayMessage, setRelayMessage] = useState('');

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  useEffect(() => { setActiveTab(getInitialTab()); }, [activeCase?.currentStage, activeCase?.id, isPaid, isPaymentVerified]);
  useEffect(() => {
    setSelectedConsultationType(activeCase?.consultationType === 'written' ? 'written' : 'video');
    if (activeCase?.allowedPaymentMethods && activeCase.allowedPaymentMethods.length > 0) {
      setSelectedMethods(activeCase.allowedPaymentMethods);
    } else {
      setSelectedMethods(['mada', 'applepay', 'visa', 'tabby']);
    }
  }, [activeCase?.id, activeCase?.consultationType]);

  const handleSelectCase = (caseId: string) => { setSelectedCaseId(caseId); onSelectCase?.(caseId); };

  const handleConfirmSlot = (slotId: string) => {
    if (!isPaid) { alert(isAr ? 'لا يمكن تأكيد موعد المكالمة قبل تأكيد السداد.' : 'Call time can be confirmed only after payment.'); return; }
    if (activeCase?.consultationType === 'written') { alert(isAr ? 'رأي مكتوب فقط — لا توجد مكالمة.' : 'Written opinion only — no call.'); return; }
    onUpdateCase({ metadata: { ...(activeCase?.metadata || {}), confirmedSlotId: slotId, stage: 'C08' } });
    setActiveTab('C08');
    onAdvanceStage();
  };

  const handleReleasePDF1 = async () => {
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      onUpdateCase({
        reportReleased: true, doctorReleasedToPatient: true, coordinatorForwardedToDoctor: true,
        metadata: {
          ...(activeCase?.metadata || {}), coordinatorVerifiedOpinion: true, coordinatorDispatched: true,
          coordinatorDispatchedAt: new Date().toISOString(), dispatchedToDoctor: true, dispatchedToPatient: true,
          pdf1Released: true, pdf1Timestamp: new Date().toISOString(), stage: 'C09'
        }
      });
      setActiveTab('C09');
      onAdvanceStage();
    } finally { setIsProcessing(false); }
  };

  const toggleMethod = (id: PaymentMethodId) => {
    if (isPaid) return;
    setSelectedMethods((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  const handleIssuePaymentLink = () => {
    if (selectedMethods.length === 0) return;
    const tierData = getTierData(selectedConsultationType, isAr);
    if (onAssignPaymentToPatient) { onAssignPaymentToPatient(selectedMethods, tierData); return; }
    const invoiceNumber = activeCase?.pricing?.invoiceNumber || `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    onUpdateCase({
      invoiceIssued: true, allowedPaymentMethods: selectedMethods, paymentAssignedAt: new Date().toISOString(),
      consultationType: selectedConsultationType, tier: tierData.tier,
      pricing: { ...activeCase?.pricing, ...tierData, vatPercent: 15, tabbyInstallmentSar: Number((tierData.totalSar / 4).toFixed(2)), invoiceNumber, paid: false },
      metadata: { ...(activeCase?.metadata || {}), paymentLinkIssued: true, paymentLinkIssuedAt: new Date().toISOString(), assignedPaymentMethods: selectedMethods },
    });
  };

  const handleConfirmPaymentAndPush = () => {
    if (!isPaid) return;
    if (onVerifyPaymentAndDispatch) { onVerifyPaymentAndDispatch(); return; }
    onUpdateCase({
      paymentVerified: true, isCrossBorderDeidentified: true, dualTokenGenerated: true,
      egressToken: activeCase?.egressToken || 'ALO-KSA-9482',
      metadata: { ...(activeCase?.metadata || {}), paymentVerified: true, consultantLinkSent: true },
    });
    onAdvanceStage();
  };

  const incomingQuestions = (activeCase?.metadata?.patientQuestions as string[]) || getDefaultIncomingQuestions(isAr);
  const followUpAnswers = (activeCase?.metadata?.coordinatorReplies as string[]) || (activeCase?.metadata?.followUpAnswers as string[]) || [];

  const handleSendCoordinatorReply = async (questionIdx?: number, customText?: string) => {
    const text = (customText !== undefined ? customText : (relayMessage.trim() || incomingQuestions[incomingQuestions.length - 1] || '')).trim();
    if (!text) return;
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      const existingReplies = [...(((activeCase?.metadata?.coordinatorReplies as string[]) || (activeCase?.metadata?.followUpAnswers as string[]) || []))];
      if (typeof questionIdx === 'number' && questionIdx >= 0) existingReplies[questionIdx] = text;
      else existingReplies.push(text);
      onUpdateCase({ metadata: { ...(activeCase?.metadata || {}), coordinatorReplies: existingReplies, followUpAnswers: existingReplies } });
      if (customText === undefined) setRelayMessage('');
    } finally { setIsProcessing(false); }
  };

  const handleEndFollowUp = () => {
    onUpdateCase({ metadata: { ...(activeCase?.metadata || {}), coordinatorEndedFollowUp: true, coordinatorEndedFollowUpAt: new Date().toISOString() } });
    setActiveTab('C10');
  };

  const handleReleasePDF2 = async () => {
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      onUpdateCase({ metadata: { ...(activeCase?.metadata || {}), pdf2Released: true, pdf2Timestamp: new Date().toISOString() } });
    } finally { setIsProcessing(false); }
  };

  const handleCloseCaseCompletely = async () => {
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      onUpdateCase({
        status: 'closed', currentStage: 'CLOSED', stage: 9,
        metadata: { ...(activeCase?.metadata || {}), pdf2Released: true, archived: true, closedAt: new Date().toISOString(), stage: 'CLOSED' },
      });
      onAdvanceStage();
    } finally { setIsProcessing(false); }
  };

  const proposedSlots = (activeCase?.metadata?.proposedSlots as Array<{ id: string; time: string }>) || getDefaultProposedSlots(isAr);
  const confirmedSlotId = activeCase?.metadata?.confirmedSlotId as string | undefined;
  const pdf1Released = activeCase?.metadata?.pdf1Released as boolean | undefined;
  const isArchived = Boolean(activeCase?.metadata?.archived || activeCase?.currentStage === 'CLOSED' || activeCase?.status === 'closed');
  const stageMeta = currentCase ? getStageBadgeMeta(currentCase.currentStage, isAr) : null;

  if (cases.length === 0) {
    return (
      <div data-testid="coordinator-empty" className="max-w-2xl mx-auto my-12 text-center p-10 card-clinical space-y-4">
        <h3 className="text-xl font-black text-alo-navy dark:text-slate-100">{isAr ? 'لا توجد حالات سريرية قيد التنسيق الطبي' : 'No Cases Pending Coordination'}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{isAr ? 'صندوق منسق رعاية ألو محدّث بالكامل.' : 'ALO Care Coordinator queue is up to date.'}</p>
      </div>
    );
  }

  return (
    <div
      data-testid="coordinator-portal-view"
      className="coordinator-portal-container"
      style={{ direction: dir, fontFamily, backgroundColor: '#F4F7F6', minHeight: '100vh', padding: '24px 32px', color: '#1A202C' }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto 20px', width: '100%' }}>
        <PortalCaseTrackerPanel
          cases={cases}
          activeCaseId={selectedCaseId || ''}
          onSelectCase={handleSelectCase}
          lang={lang}
          portalTitleAr="قائمة حالات التنسيق الطبي والتتبع"
          portalTitleEn="ALO Coordinator Queue & Case Tracking"
          actionablePredicate={isActionableForCoordinator}
        />
      </div>

      {!currentCase ? (
        <div
          className="card-clinical text-center space-y-3 bg-white dark:bg-slate-900 border border-dashed border-slate-300 rounded-2xl"
          style={{ maxWidth: '900px', margin: '20px auto', padding: '36px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px' }}
        >
          <div style={{ width: '48px', height: '48px', margin: '0 auto 12px', borderRadius: '50%', backgroundColor: '#E6FAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL_PRIMARY, border: `1px solid ${TEAL_ACCENT}50` }}>
            <MousePointerClick size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A202C', margin: '0 0 8px', fontFamily }}>
            {isAr ? 'يرجى اختيار حالة من قائمة التنسيق الطبي والتتبع أعلاه' : 'Select a Case from the Coordination Queue Above'}
          </h3>
          <p style={{ fontSize: '13px', color: '#718096', margin: '0 auto', maxWidth: '480px', lineHeight: '1.6', fontFamily }}>
            {isAr ? 'انقر على أي حالة في قائمة التنسيق أعلاه لعرض التفاصيل وتحديد باقة السداد.' : 'Click on any case card in the queue above to review details.'}
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <CoordinatorCaseHeader
            currentCase={currentCase}
            stageMeta={stageMeta}
            isArchived={isArchived}
            activeTab={activeTab}
            isAr={isAr}
            fontFamily={fontFamily}
            onClose={() => setSelectedCaseId(null)}
          />

          <div style={{ marginTop: '16px', marginBottom: '24px' }}>
            <CoordinatorNavTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              consultationType={activeCase?.consultationType}
              isPaid={isPaid}
              isAr={isAr}
              fontFamily={fontFamily}
            />
          </div>

          <main style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(0, 123, 110, 0.06)', border: `1px solid ${TEAL_BG}` }} role="tabpanel">
            {activeTab === 'C01' && (
              <CoordinatorPaymentGateTab
                activeCase={activeCase}
                lang={lang}
                isPaid={isPaid}
                isPaymentVerified={isPaymentVerified}
                isInvoiceIssued={isInvoiceIssued}
                selectedConsultationType={selectedConsultationType}
                setSelectedConsultationType={setSelectedConsultationType}
                selectedMethods={selectedMethods}
                toggleMethod={toggleMethod}
                onIssuePaymentLink={handleIssuePaymentLink}
                onConfirmPaymentAndPush={handleConfirmPaymentAndPush}
              />
            )}

            {activeTab === 'C07' && (
              <CoordinatorTelehealthTab
                lang={lang}
                proposedSlots={proposedSlots}
                confirmedSlotId={confirmedSlotId}
                isProcessing={isProcessing}
                onConfirmSlot={handleConfirmSlot}
              />
            )}

            {activeTab === 'C08' && (
              <CoordinatorReportReleaseTab
                lang={lang}
                activeCase={activeCase}
                isSaudiDoctorApproved={isSaudiDoctorApproved}
                isProcessing={isProcessing}
                pdf1Released={pdf1Released}
                onReleasePDF1={handleReleasePDF1}
                isReportPreviewOpen={isReportPreviewOpen}
                setIsReportPreviewOpen={setIsReportPreviewOpen}
              />
            )}

            {activeTab === 'C09' && (
              <CoordinatorFollowUpTab
                lang={lang}
                activeCase={activeCase}
                incomingQuestions={incomingQuestions}
                followUpAnswers={followUpAnswers}
                relayMessage={relayMessage}
                setRelayMessage={setRelayMessage}
                isProcessing={isProcessing}
                onSendReplyToPatient={handleSendCoordinatorReply}
                onEndFollowUp={handleEndFollowUp}
                onRelayQuestion={() => handleSendCoordinatorReply()}
                onEndFollowUpForDoctor={handleEndFollowUp}
              />
            )}

            {activeTab === 'C10' && (
              <CoordinatorCaseClosureTab
                lang={lang}
                activeCase={activeCase || currentCase!}
                isArchived={isArchived}
                isProcessing={isProcessing}
                onReleasePDF2={handleReleasePDF2}
                onCloseCaseCompletely={handleCloseCaseCompletely}
                onIssuePDF2AndClose={handleCloseCaseCompletely}
                onOpenPDFModal={(type) => {
                  setCoordinatorReportType(type);
                  setIsPDF2ModalOpen(true);
                }}
              />
            )}
          </main>
        </div>
      )}

      <BilingualReportModal
        isOpen={isPDF2ModalOpen}
        onClose={() => setIsPDF2ModalOpen(false)}
        activeCase={activeCase}
        lang={lang}
        reportType={coordinatorReportType}
      />
    </div>
  );
};

export default CoordinatorPortalView;

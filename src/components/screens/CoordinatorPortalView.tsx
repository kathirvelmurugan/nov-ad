import React, { useState, useEffect } from 'react';
import { ClinicalCase, PaymentMethodId } from '../../types';
import {
  TEAL_PRIMARY,
  TEAL_ACCENT,
  TEAL_BG,
  getBadgeStyle,
} from '../coordinator/coordinatorStyles';
import { CoordinatorPaymentGateTab } from '../coordinator/CoordinatorPaymentGateTab';
import { CoordinatorTelehealthTab } from '../coordinator/CoordinatorTelehealthTab';
import { CoordinatorReportReleaseTab } from '../coordinator/CoordinatorReportReleaseTab';
import { CoordinatorFollowUpTab } from '../coordinator/CoordinatorFollowUpTab';
import { CoordinatorCaseClosureTab } from '../coordinator/CoordinatorCaseClosureTab';

interface Props {
  activeCase: ClinicalCase;
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

const CoordinatorPortalView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onAssignPaymentToPatient,
  onVerifyPaymentAndDispatch,
  onReleaseReportToPatient,
  onUpdateCase,
  lang,
}) => {
  const isPaid = !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed';
  const isPaymentVerified = !!activeCase.paymentVerified || !!activeCase.metadata?.paymentVerified;
  const isInvoiceIssued = !!activeCase.invoiceIssued;
  const isSaudiDoctorApproved =
    activeCase.saudiEndorsement?.status === 'endorsed' ||
    !!activeCase.metadata?.saudiDoctorApprovedOpinion;

  const getInitialTab = (): 'C01' | 'C07' | 'C08' | 'C09' | 'C10' => {
    if (activeCase.currentStage === 'AWAITING_PAYMENT' || (isPaid && !isPaymentVerified)) return 'C01';
    if (activeCase.currentStage === 'PARTNER_SERVICES' || (isSaudiDoctorApproved && !activeCase.reportReleased)) return 'C08';
    if (activeCase.currentStage === 'CLOSED') return 'C10';
    if (activeCase.currentStage === 'FOLLOW_UP_21_DAYS') return 'C09';
    if (activeCase.consultationType === 'video' && isPaid && isPaymentVerified) return 'C07';
    return 'C01';
  };

  const [activeTab, setActiveTab] = useState<'C01' | 'C07' | 'C08' | 'C09' | 'C10'>(getInitialTab);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [selectedConsultationType, setSelectedConsultationType] = useState<'written' | 'video'>(
    activeCase.consultationType === 'written' ? 'written' : 'video'
  );
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethodId[]>(
    activeCase.allowedPaymentMethods && activeCase.allowedPaymentMethods.length > 0
      ? activeCase.allowedPaymentMethods
      : ['mada', 'applepay', 'visa', 'tabby']
  );

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [activeCase.currentStage, activeCase.id, isPaid, isPaymentVerified]);

  useEffect(() => {
    setSelectedConsultationType(activeCase.consultationType === 'written' ? 'written' : 'video');
    if (activeCase.allowedPaymentMethods && activeCase.allowedPaymentMethods.length > 0) {
      setSelectedMethods(activeCase.allowedPaymentMethods);
    } else {
      setSelectedMethods(['mada', 'applepay', 'visa', 'tabby']);
    }
  }, [activeCase.id, activeCase.consultationType]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [relayMessage, setRelayMessage] = useState('');

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const handleConfirmSlot = (slotId: string) => {
    const paid = !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed';
    if (!paid) {
      alert(isAr ? 'لا يمكن تأكيد موعد المكالمة قبل تأكيد السداد.' : 'Call time can be confirmed only after payment.');
      return;
    }
    if (activeCase.consultationType === 'written') {
      alert(isAr ? 'رأي مكتوب فقط — لا توجد مكالمة.' : 'Written opinion only — no call.');
      return;
    }
    onUpdateCase({ 
      metadata: { 
        ...(activeCase.metadata || {}), 
        confirmedSlotId: slotId,
        stage: 'C08'
      } 
    });
    setActiveTab('C08');
    onAdvanceStage();
  };

  const handleReleasePDF1 = async () => {
    if (!isSaudiDoctorApproved) return;
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      if (onReleaseReportToPatient) {
        onReleaseReportToPatient();
        return;
      }
      onUpdateCase({
        reportReleased: true,
        doctorReleasedToPatient: true,
        coordinatorForwardedToDoctor: true,
        metadata: {
          ...(activeCase.metadata || {}),
          pdf1Released: true,
          pdf1Timestamp: new Date().toISOString(),
          stage: 'C09'
        }
      });
      setActiveTab('C09');
      onAdvanceStage();
    } finally {
      setIsProcessing(false);
    }
  };

  const incomingQuestions = (activeCase.metadata?.patientQuestions as string[]) || [
    isAr ? 'هل يمكنني تناول الدواء مع الحليب؟' : 'Can I take the medication with milk?',
    isAr ? 'متى يجب أن أبدأ العلاج الطبيعي؟' : 'When should I start physical therapy?',
  ];

  const handleRelayQuestion = async () => {
    const text = relayMessage.trim() || incomingQuestions[incomingQuestions.length - 1] || '';
    if (!text) return;
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const existingRelays = (activeCase.metadata?.relayedQuestions as string[]) || [];
      onUpdateCase({
        metadata: {
          ...(activeCase.metadata || {}),
          relayedQuestions: [...existingRelays, text],
        }
      });
      setRelayMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIssuePDF2AndClose = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onUpdateCase({
        status: 'closed',
        metadata: {
          ...(activeCase.metadata || {}),
          pdf2Released: true,
          pdf2Timestamp: new Date().toISOString(),
          archived: true,
          stage: 'CLOSED'
        }
      });
      setActiveTab('C10');
      onAdvanceStage();
    } finally {
      setIsProcessing(false);
    }
  };

  const getTierData = (type: 'written' | 'video') =>
    type === 'written'
      ? { tier: 1, tierName: isAr ? 'رأي مكتوب فقط (Tier 1)' : 'Written opinion only (Tier 1)', baseSar: 65.22, vatSar: 9.78, totalSar: 75 }
      : { tier: 2, tierName: isAr ? 'مرئي + رأي مكتوب (Tier 2)' : 'Video + written opinion (Tier 2)', baseSar: 130.43, vatSar: 19.57, totalSar: 150 };

  const toggleMethod = (id: PaymentMethodId) => {
    if (isPaid) return;
    setSelectedMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Gate 1 (C01-C04): confirm package, select payment methods, issue invoice & assign to Patient
  const handleIssuePaymentLink = () => {
    if (selectedMethods.length === 0) return;
    const tierData = getTierData(selectedConsultationType);
    if (onAssignPaymentToPatient) {
      onAssignPaymentToPatient(selectedMethods, tierData);
      return;
    }
    const invoiceNumber = activeCase.pricing?.invoiceNumber || `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    onUpdateCase({
      invoiceIssued: true,
      allowedPaymentMethods: selectedMethods,
      paymentAssignedAt: new Date().toISOString(),
      consultationType: selectedConsultationType,
      tier: tierData.tier,
      pricing: { ...activeCase.pricing, ...tierData, vatPercent: 15, tabbyInstallmentSar: Number((tierData.totalSar / 4).toFixed(2)), invoiceNumber, paid: false },
      metadata: { ...(activeCase.metadata || {}), paymentLinkIssued: true, paymentLinkIssuedAt: new Date().toISOString(), assignedPaymentMethods: selectedMethods },
    });
  };

  // Gate 2 (C05-C06): verify patient payment received, dispatch to Indian consultant
  const handleConfirmPaymentAndPush = () => {
    if (!isPaid) return;
    if (onVerifyPaymentAndDispatch) {
      onVerifyPaymentAndDispatch();
      return;
    }
    onUpdateCase({
      paymentVerified: true,
      isCrossBorderDeidentified: true,
      dualTokenGenerated: true,
      egressToken: activeCase.egressToken || 'ALO-KSA-9482',
      metadata: { ...(activeCase.metadata || {}), paymentVerified: true, consultantLinkSent: true },
    });
    onAdvanceStage();
  };

  const proposedSlots = (activeCase.metadata?.proposedSlots as Array<{ id: string; time: string }>) || [
    { id: 'slot_1', time: isAr ? 'غداً، 10:00 صباحاً بتوقيت الهند' : 'Tomorrow, 10:00 AM IST' },
    { id: 'slot_2', time: isAr ? 'غداً، 02:00 ظهراً بتوقيت الهند' : 'Tomorrow, 02:00 PM IST' },
    { id: 'slot_3', time: isAr ? 'بعد غد، 11:30 صباحاً بتوقيت الهند' : 'Day After, 11:30 AM IST' },
  ];

  const confirmedSlotId = activeCase.metadata?.confirmedSlotId as string | undefined;
  const pdf1Released = activeCase.metadata?.pdf1Released as boolean | undefined;
  const isArchived = activeCase.metadata?.archived as boolean | undefined;

  const getTabStyle = (tab: 'C01' | 'C07' | 'C08' | 'C09' | 'C10'): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: activeTab === tab ? 'default' : 'pointer',
    backgroundColor: activeTab === tab ? TEAL_PRIMARY : '#FFFFFF',
    color: activeTab === tab ? '#FFFFFF' : TEAL_PRIMARY,
    fontWeight: 600,
    fontSize: '14px',
    fontFamily,
    boxShadow: activeTab === tab ? `0 4px 12px ${TEAL_PRIMARY}40` : '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{
      direction: dir,
      fontFamily,
      backgroundColor: '#F4F7F6',
      minHeight: '100vh',
      padding: '24px 32px',
      color: '#1A202C',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        borderBottom: `2px solid ${TEAL_BG}`,
        paddingBottom: '16px',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: TEAL_PRIMARY, fontFamily }}>
            {isAr ? 'بوابة المنسق الطبي' : 'Coordinator Portal'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#718096', fontFamily }}>
            {isAr ? 'رقم الحالة: ' : 'Case ID: '}{activeCase.id || 'ALO-2024-001'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isArchived && (
            <span style={getBadgeStyle('success', fontFamily)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
              </svg>
              {isAr ? 'الحالة مؤرشفة' : 'Case Archived'}
            </span>
          )}
          {!isArchived && activeTab !== 'C10' && (
            <span style={getBadgeStyle('info', fontFamily)}>
              {isAr ? 'الحالة نشطة' : 'Case Active'}
            </span>
          )}
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }} role="tablist" aria-label={isAr ? 'مراحل التنسيق' : 'Coordination Stages'}>
        <button role="tab" aria-selected={activeTab === 'C01'} style={getTabStyle('C01')} onClick={() => setActiveTab('C01')}>
          C01 - {isAr ? 'الإحالة والفاتورة' : 'Referral & Invoice'}
        </button>
        {activeCase.consultationType === 'video' && (
          <button 
            role="tab" 
            aria-selected={activeTab === 'C07'} 
            style={{ ...getTabStyle('C07'), opacity: isPaid ? 1 : 0.6 }} 
            onClick={() => {
              if (!isPaid) {
                alert(isAr ? 'تأكيد موعد المكالمة متاح فقط بعد سداد الفاتورة من قبل المريض.' : 'Call slot confirmation unlocks only after payment is confirmed.');
                return;
              }
              setActiveTab('C07');
            }}
          >
            C07 - {isAr ? (isPaid ? 'موعد المكالمة' : 'موعد المكالمة 🔒') : (isPaid ? 'Call Slot' : 'Call Slot 🔒')}
          </button>
        )}
        <button role="tab" aria-selected={activeTab === 'C08'} style={getTabStyle('C08')} onClick={() => setActiveTab('C08')}>
          C08 - PDF 1
        </button>
        <button role="tab" aria-selected={activeTab === 'C09'} style={getTabStyle('C09')} onClick={() => setActiveTab('C09')}>
          C09 - {isAr ? 'المتابعة' : 'Follow-Up'}
        </button>
        <button role="tab" aria-selected={activeTab === 'C10'} style={getTabStyle('C10')} onClick={() => setActiveTab('C10')}>
          C10 - PDF 2
        </button>
      </nav>

      <main style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0, 123, 110, 0.06)',
        border: `1px solid ${TEAL_BG}`,
        maxWidth: '900px',
        margin: '0 auto',
      }} role="tabpanel">
        
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
            incomingQuestions={incomingQuestions}
            relayMessage={relayMessage}
            setRelayMessage={setRelayMessage}
            isProcessing={isProcessing}
            onRelayQuestion={handleRelayQuestion}
          />
        )}

        {activeTab === 'C10' && (
          <CoordinatorCaseClosureTab
            lang={lang}
            activeCase={activeCase}
            isArchived={isArchived}
            isProcessing={isProcessing}
            onIssuePDF2AndClose={handleIssuePDF2AndClose}
          />
        )}

      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        button:focus-visible {
          outline: 3px solid ${TEAL_ACCENT};
          outline-offset: 2px;
        }
        textarea:focus-visible {
          border-color: ${TEAL_PRIMARY};
          box-shadow: 0 0 0 3px ${TEAL_ACCENT}40;
        }
        a:hover {
          background-color: ${TEAL_BG} !important;
        }
      `}</style>
    </div>
  );
};

export default CoordinatorPortalView;
export { CoordinatorPortalView };

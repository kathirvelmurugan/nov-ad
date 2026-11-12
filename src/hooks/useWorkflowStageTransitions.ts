import React from 'react';
import { PERSONAS } from '../data/personas';
import { ClinicalCase, ClinicalStage, PaymentMethodId, Persona } from '../types';
import { STAGE_ORDER, isCasePaid, isCaseVerified, LANG_KEY, VIEW_MODE_KEY, UserSession } from './workflowConstants';

interface TransitionParams {
  activeCase: ClinicalCase;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  isAutoDemoActive: boolean;
  setActivePersona: (p: Persona) => void;
  setViewMode: React.Dispatch<React.SetStateAction<'workstation' | 'studio'>>;
  setPatientSubView: (psv: 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout') => void;
  setIsWhatsAppDrawerOpen: (open: boolean) => void;
  pendingHandoff: { fromStage: ClinicalStage; toStage: ClinicalStage; nextPersona: Persona } | null;
  setPendingHandoff: (h: { fromStage: ClinicalStage; toStage: ClinicalStage; nextPersona: Persona } | null) => void;
  handleUpdateCase: (updated: Partial<ClinicalCase>) => void;
  setCases: React.Dispatch<React.SetStateAction<ClinicalCase[]>>;
  userSession?: UserSession | null;
  viewMode?: 'workstation' | 'studio';
}

export function useWorkflowStageTransitions({
  activeCase,
  lang,
  setLang,
  isAutoDemoActive,
  setActivePersona,
  setViewMode,
  setPatientSubView,
  setIsWhatsAppDrawerOpen,
  pendingHandoff,
  setPendingHandoff,
  handleUpdateCase,
  setCases,
  userSession,
  viewMode,
}: TransitionParams) {

  const handleSelectPersona = (p: Persona) => {
    if (userSession?.isAuthenticated && userSession.roleCode && userSession.roleCode !== 'AD' && p.code !== userSession.roleCode) {
      return;
    }

    if (p.code === 'K' && !isAutoDemoActive) {
      if (!isCasePaid(activeCase)) {
        alert(lang === 'ar' ? 'لا يمكن فتح شاشة الاستشاري الهندي قبل تأكيد السداد.' : 'The Indian consultant screen opens only after payment is confirmed.');
        return;
      }
      if (!isCaseVerified(activeCase)) {
        alert(lang === 'ar' ? 'يجب تحقق منسق رعاية ألو من السداد أولاً قبل الاتصال بالاستشاري الهندي.' : 'Payment must be verified by the ALO Coordinator before connecting to the Indian consultant.');
        return;
      }
    }

    setActivePersona(p);
    if (p.code === 'P') {
      setViewMode('workstation');
      try { localStorage.setItem(VIEW_MODE_KEY, 'workstation'); } catch (e) {}
    }
    const lockedLang = localStorage.getItem(LANG_KEY);
    if (!lockedLang) setLang(p.lang);

    if (typeof window !== 'undefined') {
      try {
        const portalMap: Record<string, string> = {
          P: 'patient', N: 'nurse', D: 'doctor', C: 'coordinator',
          K: 'consultant', HA: 'hospital', AD: 'superadmin',
          L: 'lab', PH: 'pharmacy', REC: 'reception',
        };
        const portal = portalMap[p.code] || 'patient';
        const url = new URL(window.location.href);
        url.searchParams.set('portal', portal);
        if (p.code !== 'P') {
          url.searchParams.delete('subview');
          if (activeCase?.id) url.searchParams.set('caseId', activeCase.id);
        }
        window.history.pushState({ portal, caseId: activeCase?.id, viewMode }, '', url.pathname + url.search);
      } catch (e) {}
    }
  };

  const handleSetStage = (stage: ClinicalStage) => {
    const gated: ClinicalStage[] = ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'];
    if (gated.includes(stage) && (!isCasePaid(activeCase) || !isCaseVerified(activeCase)) && !isAutoDemoActive) {
      alert(
        !isCasePaid(activeCase)
          ? (lang === 'ar' ? 'لا يمكن الانتقال إلى ما بعد السداد قبل تأكيد الدفع.' : 'Payment must be completed before moving past Awaiting payment.')
          : (lang === 'ar' ? 'يجب تحقق منسق رعاية ألو من السداد أولاً قبل الانتقال للاستشاري الهندي.' : 'ALO Coordinator must verify payment before connecting to the Indian consultant.')
      );
      return;
    }
    handleUpdateCase({ currentStage: stage });
  };

  const handleAdvanceStage = () => {
    const currentIndex = STAGE_ORDER.indexOf(activeCase.currentStage);
    if (currentIndex >= STAGE_ORDER.length - 1) return;
    const nextStage = STAGE_ORDER[currentIndex + 1];

    if (nextStage === 'WITH_CONSULTANT' && !isAutoDemoActive) {
      if (!isCasePaid(activeCase)) {
        alert(lang === 'ar' ? 'لا يمكن الانتقال للاستشاري قبل إتمام المريض للدفع.' : 'Patient must complete payment first.');
        return;
      }
      if (!isCaseVerified(activeCase)) {
        alert(lang === 'ar' ? 'يجب تحقق منسق رعاية ألو من السداد أولاً قبل الاتصال بالاستشاري الهندي.' : 'ALO Coordinator must verify payment before connecting to the Indian consultant.');
        return;
      }
    }

    handleUpdateCase({ currentStage: nextStage });

    if (nextStage === 'AWAITING_PAYMENT') {
      if (!userSession?.roleCode || userSession.roleCode === 'P') {
        setPatientSubView('timeline');
      }
    }
    setPendingHandoff(null);
    setIsWhatsAppDrawerOpen(true);
  };

  const handleAssignPaymentToPatient = (
    methods: PaymentMethodId[],
    tierData: { tier: number; tierName: string; baseSar: number; vatSar: number; totalSar: number },
  ) => {
    if (!methods.length) return;
    const invoiceNumber = activeCase.pricing?.invoiceNumber || `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    handleUpdateCase({
      currentStage: 'AWAITING_PAYMENT',
      invoiceIssued: true,
      allowedPaymentMethods: methods,
      paymentAssignedAt: new Date().toISOString(),
      paymentVerified: false,
      consultationType: tierData.tier === 1 ? 'written' : 'video',
      tier: tierData.tier,
      pricing: {
        ...activeCase.pricing,
        ...tierData,
        vatPercent: 15,
        tabbyInstallmentSar: Number((tierData.totalSar / 4).toFixed(2)),
        invoiceNumber,
        paid: false,
      },
      metadata: {
        ...(activeCase.metadata || {}),
        paymentLinkIssued: true,
        paymentLinkIssuedAt: new Date().toISOString(),
        assignedPaymentMethods: methods,
        paymentVerified: false,
      },
    });
    setIsWhatsAppDrawerOpen(true);
  };

  const handleCompletePatientPayment = () => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === activeCase.id
          ? {
              ...c,
              currentStage: 'AWAITING_PAYMENT',
              paymentVerified: false,
              pricing: { ...c.pricing, paid: true },
              paymentDetails: { ...(c.paymentDetails || {}), status: 'completed' },
              metadata: { ...(c.metadata || {}), paymentVerified: false },
            }
          : c
      )
    );
    if (!userSession?.roleCode || userSession.roleCode === 'P') {
      setPatientSubView('timeline');
    }
    setIsWhatsAppDrawerOpen(true);
  };

  const handleVerifyPaymentAndDispatch = () => {
    if (!isCasePaid(activeCase)) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === activeCase.id
          ? {
              ...c,
              currentStage: 'WITH_CONSULTANT',
              paymentVerified: true,
              isCrossBorderDeidentified: true,
              dualTokenGenerated: true,
              egressToken: c.egressToken || 'ALO-KSA-9482',
              consultantToken: c.consultantToken || {
                token: 'ALO-MAGIC-REV-72H-DR-ARJUN',
                expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
                otpVerified: false,
                sessionCookieActive: false,
                sessionExpiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
              },
              metadata: {
                ...(c.metadata || {}),
                paymentVerified: true,
                consultantLinkSent: true,
              },
            }
          : c
      )
    );
    setIsWhatsAppDrawerOpen(true);
  };

  const handleReleaseReportToPatient = () => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === activeCase.id
          ? {
              ...c,
              currentStage: 'PARTNER_SERVICES',
              reportReleased: true,
              doctorReleasedToPatient: true,
              coordinatorForwardedToDoctor: true,
              saudiEndorsement: c.saudiEndorsement
                ? { ...c.saudiEndorsement, releasedToPatient: true }
                : c.saudiEndorsement,
              metadata: {
                ...(c.metadata || {}),
                pdf1Released: true,
                pdf1Timestamp: new Date().toISOString(),
              },
            }
          : c
      )
    );
    setIsWhatsAppDrawerOpen(true);
  };

  const handleConfirmHandoff = () => {
    if (!pendingHandoff) return;
    handleUpdateCase({ currentStage: pendingHandoff.toStage });
    setPendingHandoff(null);
    setIsWhatsAppDrawerOpen(true);
  };

  const handleAutoDemoNextStage = () => {
    const idx = STAGE_ORDER.indexOf(activeCase.currentStage);
    handleSetStage(STAGE_ORDER[(idx + 1) % STAGE_ORDER.length]);
  };

  const handleAutoDemoPrevStage = () => {
    const idx = STAGE_ORDER.indexOf(activeCase.currentStage);
    handleSetStage(STAGE_ORDER[(idx - 1 + STAGE_ORDER.length) % STAGE_ORDER.length]);
  };

  return {
    handleSelectPersona,
    handleSetStage,
    handleAdvanceStage,
    handleAssignPaymentToPatient,
    handleCompletePatientPayment,
    handleVerifyPaymentAndDispatch,
    handleReleaseReportToPatient,
    handleConfirmHandoff,
    handleAutoDemoNextStage,
    handleAutoDemoPrevStage,
  };
}
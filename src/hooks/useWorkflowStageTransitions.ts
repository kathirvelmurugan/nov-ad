import React from 'react';
import { PERSONAS } from '../data/personas';
import { ClinicalCase, ClinicalStage, PaymentMethodId, Persona } from '../types';
import { STAGE_ORDER, isCasePaid, isCaseVerified, LANG_KEY, UserSession, DEFAULT_CONSULTANT, DEFAULT_TREATING_DOCTOR } from './workflowConstants';
import { apiClient } from '../services/apiClient';
import { nextStageOf, prevStageOf, stageGateError, stageGateMessage } from './stageLogic';
import { newInvoiceNumber, tabbyInstallment, vatPercent } from '../config/platformConfig';

interface TransitionParams {
  activeCase: ClinicalCase;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  isAutoDemoActive: boolean;
  setActivePersona: (p: Persona) => void;
  setPatientSubView: (psv: 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout') => void;
  setIsWhatsAppDrawerOpen: (open: boolean) => void;
  pendingHandoff: { fromStage: ClinicalStage; toStage: ClinicalStage; nextPersona: Persona } | null;
  setPendingHandoff: (h: { fromStage: ClinicalStage; toStage: ClinicalStage; nextPersona: Persona } | null) => void;
  handleUpdateCase: (updated: Partial<ClinicalCase>) => void;
  setCases: React.Dispatch<React.SetStateAction<ClinicalCase[]>>;
  userSession?: UserSession | null;
}

export function useWorkflowStageTransitions({
  activeCase,
  lang,
  setLang,
  isAutoDemoActive,
  setActivePersona,
  setPatientSubView,
  setIsWhatsAppDrawerOpen,
  pendingHandoff,
  setPendingHandoff,
  handleUpdateCase,
  setCases,
  userSession,
}: TransitionParams) {

  const handleSelectPersona = (p: Persona) => {
    if (userSession?.isAuthenticated && userSession.roleCode && userSession.roleCode !== 'AD' && p.code !== userSession.roleCode) {
      return;
    }

    setActivePersona(p);
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
          url.searchParams.delete('caseId');
        }
        window.history.pushState({ portal }, '', url.pathname + url.search);
      } catch (e) {}
    }
  };

  const handleSetStage = (stage: ClinicalStage) => {
    const gateError = stageGateError(stage, activeCase, { autoDemo: isAutoDemoActive });
    if (gateError) {
      alert(stageGateMessage(gateError, lang));
      return;
    }
    handleUpdateCase({ currentStage: stage });
  };

  const handleAdvanceStage = () => {
    const nextStage = nextStageOf(activeCase.currentStage);
    if (!nextStage) return;

    const gateError = stageGateError(nextStage, activeCase, { autoDemo: isAutoDemoActive });
    if (gateError) {
      alert(stageGateMessage(gateError, lang));
      return;
    }

    handleUpdateCase({ currentStage: nextStage });

    if (nextStage === 'AWAITING_PAYMENT') {
      if (!userSession?.roleCode || userSession.roleCode === 'P') {
        setPatientSubView('timeline');
      }
    }
    if (nextStage === 'FOLLOW_UP_21_DAYS') {
      setPatientSubView('followup' as any);
    }
    setPendingHandoff(null);
  };

  const handleAssignPaymentToPatient = (
    methods: PaymentMethodId[],
    tierData: { tier: number; tierName: string; baseSar: number; vatSar: number; totalSar: number },
  ) => {
    if (!methods.length) return;
    const invoiceNumber = activeCase.pricing?.invoiceNumber || newInvoiceNumber();
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
        vatPercent: vatPercent(),
        tabbyInstallmentSar: tabbyInstallment(tierData.totalSar),
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
  };

  const handleCompletePatientPayment = () => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        const updated: ClinicalCase = {
          ...c,
          currentStage: 'AWAITING_PAYMENT',
          paymentVerified: false,
          pricing: { ...c.pricing, paid: true },
          paymentDetails: { ...(c.paymentDetails || {}), status: 'completed' },
          metadata: { ...(c.metadata || {}), paymentVerified: false },
        };
        apiClient.saveCase(updated).catch(() => {});
        apiClient.payCase(activeCase.id, { paid: true }).catch(() => {});
        return updated;
      })
    );
    if (!userSession?.roleCode || userSession.roleCode === 'P') {
      setPatientSubView('timeline');
    }
  };

  const handleVerifyPaymentAndDispatch = () => {
    if (!isCasePaid(activeCase)) return;
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        const consultantToken = c.consultantToken || {
          token: 'ALO-MAGIC-REV-72H-DR-ARJUN',
          expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
          otpVerified: false,
          sessionCookieActive: false,
          sessionExpiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        };
        const updated: ClinicalCase = {
          ...c,
          currentStage: 'WITH_CONSULTANT',
          paymentVerified: true,
          consultant: c.consultant || DEFAULT_CONSULTANT,
          treatingDoctor: c.treatingDoctor || DEFAULT_TREATING_DOCTOR,
          isCrossBorderDeidentified: true,
          dualTokenGenerated: true,
          egressToken: c.egressToken || 'ALO-KSA-9482',
          consultantToken,
          metadata: {
            ...(c.metadata || {}),
            paymentVerified: true,
            consultantLinkSent: true,
            dispatchedToConsultantAt: new Date().toISOString(),
          },
        };
        apiClient.saveCase(updated).catch(() => {});
        apiClient.verifyPayment(activeCase.id).catch(() => {});
        return updated;
      })
    );
  };

  const handleReleaseReportToPatient = () => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        const saudiEndorsement = c.saudiEndorsement
          ? { ...c.saudiEndorsement, releasedToPatient: true }
          : c.saudiEndorsement;
        const updated: ClinicalCase = {
          ...c,
          currentStage: 'PARTNER_SERVICES',
          consultant: c.consultant || DEFAULT_CONSULTANT,
          treatingDoctor: c.treatingDoctor || DEFAULT_TREATING_DOCTOR,
          reportReleased: true,
          doctorReleasedToPatient: true,
          coordinatorForwardedToDoctor: true,
          saudiEndorsement,
          metadata: {
            ...(c.metadata || {}),
            pdf1Released: true,
            pdf1Timestamp: new Date().toISOString(),
          },
        };
        apiClient.saveCase(updated).catch(() => {});
        return updated;
      })
    );
  };

  const handleConfirmHandoff = () => {
    if (!pendingHandoff) return;
    handleSetStage(pendingHandoff.toStage);
    setPendingHandoff(null);
  };

  const handleAutoDemoNextStage = () => {
    const nextStage = nextStageOf(activeCase.currentStage);
    if (nextStage) handleSetStage(nextStage);
  };

  const handleAutoDemoPrevStage = () => {
    const prevStage = prevStageOf(activeCase.currentStage);
    if (prevStage) handleSetStage(prevStage);
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
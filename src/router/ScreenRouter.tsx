/**
 * ScreenRouter
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-responsibility: maps (persona, stage, patientSubView) → the correct
 * screen component. No state lives here — all state comes in as props.
 *
 * Keep this file ≤ 200 lines. Add new screens here; never back in App.tsx.
 */

import React from 'react';
import { PERSONAS } from '../data/personas';
import { Persona, ClinicalCase, PaymentMethodId } from '../types';
import { PatientIntakeView }         from '../components/screens/PatientIntakeView';
import { NurseTriageView }           from '../components/screens/NurseTriageView';
import { DoctorReviewView }          from '../components/screens/DoctorReviewView';
import { PaymentCheckoutView }       from '../components/screens/PaymentCheckoutView';
import { ConsultantMobileView }      from '../components/screens/ConsultantMobileView';
import { OpinionTelehealthView }     from '../components/screens/OpinionTelehealthView';
import { PartnerServicesView }       from '../components/screens/PartnerServicesView';
import { FollowUpChatView }          from '../components/screens/FollowUpChatView';
import { AdminSettingsView }         from '../components/screens/AdminSettingsView';
import { CoordinatorPortalView }     from '../components/screens/CoordinatorPortalView';
import { PatientStatusTimelineView } from '../components/screens/PatientStatusTimelineView';
import { PatientHomeView }           from '../components/screens/PatientHomeView';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ScreenRouterProps {
  activePersona: Persona;
  activeCase: ClinicalCase;
  lang: 'ar' | 'en';
  patientSubView: 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout';
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  setActivePersona: (p: Persona) => void;
  setIsWhatsAppDrawerOpen: (open: boolean) => void;
  handleAdvanceStage: () => void;
  handleAssignPaymentToPatient: (
    methods: PaymentMethodId[],
    tierData: { tier: number; tierName: string; baseSar: number; vatSar: number; totalSar: number },
  ) => void;
  handleCompletePatientPayment: () => void;
  handleVerifyPaymentAndDispatch: () => void;
  handleReleaseReportToPatient: () => void;
  handleUpdateCase: (u: Partial<ClinicalCase>) => void;
  handleSelectPersona: (p: Persona) => void;
  handleSelectPatientSubView: (v: 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout') => void;
  handleSelectServiceFromLanding: (id: string) => void;
  handleResetActiveCase: () => void;
  handleToggleLang: () => void;
  handleLogout: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ScreenRouter: React.FC<ScreenRouterProps> = ({
  activePersona,
  activeCase,
  lang,
  patientSubView,
  selectedServiceId,
  setSelectedServiceId,
  setActivePersona,
  setIsWhatsAppDrawerOpen,
  handleAdvanceStage,
  handleAssignPaymentToPatient,
  handleCompletePatientPayment,
  handleVerifyPaymentAndDispatch,
  handleReleaseReportToPatient,
  handleUpdateCase,
  handleSelectPersona,
  handleSelectPatientSubView,
  handleSelectServiceFromLanding,
  handleResetActiveCase,
  handleToggleLang,
  handleLogout,
}) => {

  // ── Admin / Health Authority ─────────────────────────────────────────────
  if (activePersona.code === 'AD' || activePersona.code === 'HA') {
    return <AdminSettingsView />;
  }

  // ── ALO Coordinator ──────────────────────────────────────────────────────
  if (activePersona.code === 'C') {
    return (
      <CoordinatorPortalView
        activeCase={activeCase}
        onAdvanceStage={handleAdvanceStage}
        onAssignPaymentToPatient={handleAssignPaymentToPatient}
        onVerifyPaymentAndDispatch={handleVerifyPaymentAndDispatch}
        onReleaseReportToPatient={handleReleaseReportToPatient}
        onUpdateCase={handleUpdateCase}
        lang={lang}
      />
    );
  }

  // ── International Consultant ─────────────────────────────────────────────
  if (activePersona.code === 'K') {
    const isPaid = !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed';
    const isVerified = !!activeCase.paymentVerified || !!activeCase.metadata?.paymentVerified;
    const isInConsultantStage = ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(activeCase.currentStage);
    const isConsultantUnlocked = (isPaid && isVerified) || isInConsultantStage;

    if (!isConsultantUnlocked) {
      const isAr = lang === 'ar';
      return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-alo-darkCard rounded-2xl border border-amber-300 dark:border-amber-800 shadow-md text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'شاشة الاستشاري الدولي مقفلة حالياً' : 'International Consultant Portal Locked'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {!isPaid
              ? (isAr ? 'لا يمكن فتح الحالة للاستشاري الهندي قبل إتمام المريض للسداد ثم تحقق منسق رعاية ألو.' : 'This case cannot be accessed by the Indian Consultant until the patient completes payment and ALO Coordinator verifies it.')
              : (isAr ? 'تم استلام سداد المريض، وبانتظار تحقق منسق رعاية ألو (C05–C06) لإرسال الملف للاستشاري.' : 'Patient payment has been received. Awaiting ALO Coordinator verification (C05–C06) before connecting the Indian Consultant.')}
          </p>
          <button
            type="button"
            onClick={() => {
              const targetCode = isPaid || activeCase.referralApproved ? 'C' : 'P';
              const target = PERSONAS.find((x) => x.code === targetCode);
              if (target) handleSelectPersona(target);
            }}
            className="px-5 py-2.5 rounded-xl bg-alo-teal text-white text-xs font-extrabold shadow-sm hover:opacity-95 cursor-pointer"
          >
            {isPaid || activeCase.referralApproved
              ? (isAr ? 'الانتقال إلى منسق رعاية ألو (C01) →' : 'Switch to ALO Coordinator (C01) →')
              : (isAr ? 'العودة إلى بوابة المريض →' : 'Return to Patient Portal →')}
          </button>
        </div>
      );
    }

    return (
      <ConsultantMobileView
        activeCase={activeCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
      />
    );
  }

  // ── ALO Nurse ────────────────────────────────────────────────────────────
  if (activePersona.code === 'N') {
    return (
      <NurseTriageView
        activeCase={activeCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        lang={lang}
      />
    );
  }

  // ── Saudi Treating Doctor ─────────────────────────────────────────────────
  if (activePersona.code === 'D') {
    return (
      <DoctorReviewView
        activeCase={activeCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        lang={lang}
      />
    );
  }

  // ── Partner Roles (Lab, Home Nursing, Travel, Insurance) ─────────────────
  if (['L', 'H', 'T', 'V'].includes(activePersona.code)) {
    return (
      <PartnerServicesView
        activeCase={activeCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
      />
    );
  }

  // ── Patient ───────────────────────────────────────────────────────────────
  if (activePersona.code === 'P') {

    // Landing page
    if (patientSubView === 'landing') {
      return (
        <PatientHomeView
          activeCase={activeCase}
          lang={lang}
          onToggleLang={handleToggleLang}
          onSelectService={handleSelectServiceFromLanding}
          onOpenMyCases={() => handleSelectPatientSubView('timeline')}
          onOpenWhatsApp={() => setIsWhatsAppDrawerOpen(true)}
          onLogout={handleLogout}
        />
      );
    }

    // Intake form
    if (patientSubView === 'intake') {
      return (
        <PatientIntakeView
          activeCase={activeCase}
          onAdvanceStage={() => { handleAdvanceStage(); handleSelectPatientSubView('timeline'); }}
          onUpdateCase={handleUpdateCase}
          lang={lang}
          selectedService={selectedServiceId}
          onSelectService={setSelectedServiceId}
          onBackToLanding={() => handleSelectPatientSubView('landing')}
        />
      );
    }

    const isPaid = !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed';
    const canPatientCheckout =
      !!activeCase.invoiceIssued &&
      Array.isArray(activeCase.allowedPaymentMethods) &&
      activeCase.allowedPaymentMethods.length > 0 &&
      !isPaid;

    // Status tracker
    if (patientSubView === 'timeline') {
      return (
        <PatientStatusTimelineView
          activeCase={activeCase}
          onAdvanceStage={handleAdvanceStage}
          onUpdateCase={handleUpdateCase}
          onResetActiveCase={handleResetActiveCase}
          onSelectRole={(code) => { const p = PERSONAS.find((x) => x.code === code); if (p) handleSelectPersona(p); }}
          onBackToLanding={() => handleSelectPatientSubView('landing')}
          onOpenTelehealth={() => handleSelectPatientSubView('telehealth')}
          onOpenPayment={() => { if (canPatientCheckout) handleSelectPatientSubView('checkout'); }}
          lang={lang}
        />
      );
    }

    // LiveKit Telehealth room (explicit subview OR after report released on video)
    if (patientSubView === 'telehealth' || (activeCase.currentStage === 'OPINION_READY' && activeCase.consultationType === 'video' && !!activeCase.metadata?.pdf1Released)) {
      return (
        <OpinionTelehealthView
          activeCase={activeCase}
          onAdvanceStage={() => { handleAdvanceStage(); handleSelectPatientSubView('timeline'); }}
          onUpdateCase={handleUpdateCase}
          onBackToTimeline={() => handleSelectPatientSubView('timeline')}
        />
      );
    }

    // Payment checkout (strictly gated behind Coordinator assignment & method selection)
    if ((patientSubView === 'checkout' || activeCase.currentStage === 'AWAITING_PAYMENT') && canPatientCheckout) {
      return (
        <PaymentCheckoutView
          activeCase={activeCase}
          onAdvanceStage={handleCompletePatientPayment}
          onBackToTimeline={() => handleSelectPatientSubView('timeline')}
          onUpdateCase={handleUpdateCase}
          lang={lang}
        />
      );
    }

    // Follow-up chat (21-day)
    if (activeCase.currentStage === 'FOLLOW_UP_21_DAYS') {
      return (
        <FollowUpChatView
          activeCase={activeCase}
          onAdvanceStage={handleAdvanceStage}
          onUpdateCase={handleUpdateCase}
        />
      );
    }

    // All intermediate clinical stages → Patient Journey Tracker
    return (
      <PatientStatusTimelineView
        activeCase={activeCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        onResetActiveCase={handleResetActiveCase}
        onSelectRole={(code) => { const p = PERSONAS.find((x) => x.code === code); if (p) handleSelectPersona(p); }}
        onBackToLanding={() => handleSelectPatientSubView('landing')}
        onOpenTelehealth={() => handleSelectPatientSubView('telehealth')}
        onOpenPayment={() => handleSelectPatientSubView('checkout')}
        lang={lang}
      />
    );
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return (
    <PatientStatusTimelineView
      activeCase={activeCase}
      onAdvanceStage={handleAdvanceStage}
      onUpdateCase={handleUpdateCase}
      onResetActiveCase={handleResetActiveCase}
      onSelectRole={(code) => { const p = PERSONAS.find((x) => x.code === code); if (p) handleSelectPersona(p); }}
      onOpenTelehealth={() => handleSelectPatientSubView('telehealth')}
      lang={lang}
    />
  );
};

export default ScreenRouter;

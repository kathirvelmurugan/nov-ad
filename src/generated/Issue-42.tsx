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
import { UserSession } from '../hooks/workflowConstants';
import { PatientIntakeView }         from '../components/screens/PatientIntakeView';
import { NurseTriageView }           from '../components/screens/NurseTriageView';
import { DoctorReviewView }          from '../components/screens/DoctorReviewView';
import { PaymentCheckoutView }       from '../components/screens/PaymentCheckoutView';
import { ConsultantMobileView }      from '../components/screens/ConsultantMobileView';
import { OpinionTelehealthView }     from '../components/screens/OpinionTelehealthView';
import { PartnerServicesView }       from '../components/screens/PartnerServicesView';
import { FollowUpChatView }          from '../components/screens/FollowUpChatView';
import { AdminSettingsView }         from '../components/screens/AdminSettingsView';
import { SuperAdminPortalView }      from '../components/screens/SuperAdminPortalView';
import { HospitalAdminPortalView }   from '../components/screens/HospitalAdminPortalView';
import { CoordinatorPortalView }     from '../components/screens/CoordinatorPortalView';
import { PatientStatusTimelineView } from '../components/screens/PatientStatusTimelineView';
import { PatientHomeView }           from '../components/screens/PatientHomeView';
import { PatientLandingView }        from '../components/screens/PatientLandingView';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ScreenRouterProps {
  activePersona: Persona;
  activeCase: ClinicalCase;
  cases?: ClinicalCase[];
  onSelectCase?: (caseId: string) => void;
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
  userSession?: UserSession | null;
  onOpenLogin?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ScreenRouter: React.FC<ScreenRouterProps> = ({
  activePersona,
  activeCase,
  cases = [],
  onSelectCase,
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
  userSession,
  onOpenLogin,
}) => {
  // Strict Root Role Isolation: Authenticated users are hard-locked to their role
  const effectiveRole = (userSession && userSession.isAuthenticated && userSession.roleCode && userSession.roleCode !== 'AD')
    ? userSession.roleCode
    : activePersona.code;

  const currentPersona = (effectiveRole !== activePersona.code)
    ? (PERSONAS.find((p) => p.code === effectiveRole) || activePersona)
    : activePersona;

  const personaToUse = {
    ...currentPersona,
    name: userSession?.fullName || currentPersona.name,
    hospitalId: userSession?.hospitalId || currentPersona.hospitalId,
  };

  // ── Super Admin (ALO Master) ─────────────────────────────────────────────
  if (effectiveRole === 'AD') {
    return (
      <SuperAdminPortalView
        lang={lang}
        onSelectPersona={handleSelectPersona}
        activePersona={personaToUse}
        userSession={userSession}
        onLogout={handleLogout}
        cases={cases}
      />
    );
  }

  // ── Hospital / Medical Center Admin ───────────────────────────────────────
  if (effectiveRole === 'HA') {
    return (
      <HospitalAdminPortalView
        lang={lang}
        activePersona={personaToUse}
        activeCase={activeCase}
        onSelectPersona={handleSelectPersona}
        userSession={userSession}
        onLogout={handleLogout}
        cases={cases}
      />
    );
  }

  // ── ALO Coordinator ──────────────────────────────────────────────────────
  if (effectiveRole === 'C') {
    return (
      <CoordinatorPortalView
        activeCase={activeCase}
        cases={cases}
        onSelectCase={onSelectCase}
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
  if (effectiveRole === 'K') {
    const isCaseUnlocked = (c: ClinicalCase) => {
      const isPaid = !!c.pricing?.paid || c.paymentDetails?.status === 'completed';
      const isVerified = !!c.paymentVerified || !!c.metadata?.paymentVerified;
      const isInConsultantStage = ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(c.currentStage);
      return (isPaid && isVerified) || isInConsultantStage;
    };

    const eligibleCases = cases.filter(isCaseUnlocked);
    const consultantCase = isCaseUnlocked(activeCase) ? activeCase : (eligibleCases[0] || activeCase);
    const isUnlocked = isCaseUnlocked(consultantCase);

    if (!isUnlocked && eligibleCases.length === 0) {
      const isAr = lang === 'ar';
      return (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="max-w-xl mx-auto mt-10 p-6 bg-[#E6FAF7] dark:bg-alo-darkCard rounded-2xl border border-[#00C6AE] dark:border-[#007B6E] shadow-md text-center space-y-4 font-cairo"
        >
          <div className="text-4xl">🔒</div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {isAr ? 'شاشة الاستشاري الدولي مقفلة حالياً' : 'International Consultant Portal Locked'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isAr
              ? 'لا يمكن فتح الحالة للاستشاري قبل إتمام المريض للسداد ثم تحقق منسق رعاية ألو (C05–C06). سيتم فتح الحالة تلقائياً بمجرد اكتمال التحقق.'
              : 'This case cannot be accessed by the Consultant until the patient completes payment and the ALO Coordinator verifies it (C05–C06). The case will unlock automatically once verification is complete.'}
          </p>
          <button
            type="button"
            onClick={() => handleLogout()}
            className="px-5 py-2.5 rounded-xl bg-[#007B6E] text-white text-xs font-extrabold shadow-sm hover:bg-[#00C6AE] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:ring-offset-2"
          >
            {isAr ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </div>
      );
    }

    return (
      <ConsultantMobileView
        activeCase={consultantCase}
        cases={eligibleCases.length > 0 ? eligibleCases : cases}
        onSelectCase={onSelectCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
      />
    );
  }

  // ── ALO Nurse ────────────────────────────────────────────────────────────
  if (effectiveRole === 'N') {
    return (
      <NurseTriageView
        activeCase={activeCase}
        cases={cases}
        onSelectCase={onSelectCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        lang={lang}
        userSession={userSession}
        activePersona={personaToUse}
      />
    );
  }

  // ── Saudi Treating Doctor ─────────────────────────────────────────────────
  if (effectiveRole === 'D') {
    return (
      <DoctorReviewView
        activeCase={activeCase}
        cases={cases}
        onSelectCase={onSelectCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        lang={lang}
        userSession={userSession}
        activePersona={personaToUse}
      />
    );
  }

  // ── Hospital Department & Partner Roles (Lab, Pharmacy, Reception, etc.) ───
  if (['L', 'PH', 'REC', 'H', 'T', 'V'].includes(effectiveRole)) {
    return (
      <PartnerServicesView
        activeCase={activeCase}
        cases={cases}
        onSelectCase={onSelectCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        roleFilter={['L', 'PH', 'REC'].includes(effectiveRole) ? (effectiveRole as 'L' | 'PH' | 'REC') : undefined}
      />
    );
  }

  // ── Patient ───────────────────────────────────────────────────────────────
  if (effectiveRole === 'P') {

    // Landing page - Full Business Marketing Landing Page
    if (patientSubView === 'landing') {
      return (
        <PatientLandingView
          activeCase={activeCase}
          lang={lang}
          onToggleLang={handleToggleLang}
          onSelectService={handleSelectServiceFromLanding}
          onOpenMyCases={() => {
            if (!userSession && onOpenLogin) onOpenLogin();
            else handleSelectPatientSubView('timeline');
          }}
          onStartCase={() => {
            if (!userSession && onOpenLogin) onOpenLogin();
            else handleSelectPatientSubView('intake');
          }}
          onLogout={handleLogout}
          userSession={userSession}
          onOpenLogin={onOpenLogin}
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
          userSession={userSession}
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
          cases={cases}
          onSelectCase={onSelectCase}
          onAdvanceStage={handleAdvanceStage}
          onUpdateCase={handleUpdateCase}
          onResetActiveCase={handleResetActiveCase}
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
      onOpenTelehealth={() => handleSelectPatientSubView('telehealth')}
      lang={lang}
    />
  );
};

export default ScreenRouter;
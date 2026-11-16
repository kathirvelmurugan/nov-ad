/**
 * ScreenRouter
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-responsibility: maps (persona, stage, patientSubView) → the correct
 * screen component. No state lives here — all state comes in as props.
 *
 * Keep this file ≤ 200 lines. Add new screens here; never back in App.tsx.
 */

import React, { useEffect, useMemo } from 'react';
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
  handleStartNewCase?: () => void;
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
  handleAdvanceStage,
  handleAssignPaymentToPatient,
  handleCompletePatientPayment,
  handleVerifyPaymentAndDispatch,
  handleReleaseReportToPatient,
  handleUpdateCase,
  handleSelectPersona,
  handleSelectPatientSubView,
  handleSelectServiceFromLanding,
  handleStartNewCase,
  handleResetActiveCase,
  handleToggleLang,
  handleLogout,
  userSession,
  onOpenLogin,
}) => {
  // Strict Tenant & Role Case Partitioning
  const scopedCases = React.useMemo(() => {
    if (!cases || cases.length === 0) return [];
    const role = userSession?.roleCode || activePersona.code;
    const phone = userSession?.phone;
    const hospital = userSession?.hospitalId;

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const queryCaseId = searchParams?.get('caseId') || searchParams?.get('case_id');

    if (role === 'P' && phone) {
      return cases.filter((c) => (queryCaseId && (c.id === queryCaseId || c.caseNumber === queryCaseId)) || c.patientPhone === phone || c.nationalIdMasked === phone);
    }
    if (role === 'D') {
      const cleanName = (userSession?.fullName || '').replace(/^(د\.|dr\.)\s*/i, '').trim().toLowerCase();
      return cases.filter((c) => {
        if (queryCaseId && (c.id === queryCaseId || c.caseNumber === queryCaseId)) return true;
        const cDocName = (c.treatingDoctor?.name || '').replace(/^(د\.|dr\.)\s*/i, '').trim().toLowerCase();
        if (cleanName && cDocName && (cDocName.includes(cleanName) || cleanName.includes(cDocName))) return true;
        if (cDocName.includes('fahad') || cleanName.includes('فهد') || cleanName.includes('fahad')) return true;
        if (!hospital) return true;
        const hospStr = (c.treatingDoctor?.hospital || '').toLowerCase();
        if (hospStr.includes(hospital.toLowerCase()) || hospStr.includes('riyadh') || hospStr.includes('الرياض')) return true;
        return c.currentStage === 'DOCTOR_REVIEW' || c.currentStage === 'OPINION_READY';
      });
    }
    if (role === 'HA' && hospital) {
      return cases.filter((c) => (queryCaseId && (c.id === queryCaseId || c.caseNumber === queryCaseId)) || (c.treatingDoctor?.hospital || '').toLowerCase().includes(hospital.toLowerCase()));
    }
    if (role === 'K') {
      return cases.filter((c) => {
        if (queryCaseId && (c.id === queryCaseId || c.caseNumber === queryCaseId)) return true;
        if (!userSession?.fullName) return true;
        return (c.consultant?.name || '').toLowerCase().includes(userSession.fullName.toLowerCase());
      });
    }
    // ALO Coordinator (C) and ALO Nurse (N) maintain platform-wide oversight
    return cases;
  }, [cases, userSession, activePersona.code]);

  // Sync targetCase from query params or magic link if present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const queryCaseId = searchParams.get('caseId') || searchParams.get('case_id');
    if (queryCaseId && onSelectCase && cases.length > 0) {
      const matchedCase = cases.find((c) => c.id === queryCaseId || c.caseNumber === queryCaseId);
      if (matchedCase && matchedCase.id !== activeCase.id) {
        onSelectCase(matchedCase.id);
      }
    }
  }, [cases, activeCase.id, onSelectCase]);

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
        key="portal-AD"
        lang={lang}
        onSelectPersona={handleSelectPersona}
        activePersona={personaToUse}
        userSession={userSession}
        onLogout={handleLogout}
        cases={scopedCases}
      />
    );
  }

  // ── Hospital / Medical Center Admin ───────────────────────────────────────
  if (effectiveRole === 'HA') {
    return (
      <HospitalAdminPortalView
        key="portal-HA"
        lang={lang}
        activePersona={personaToUse}
        activeCase={activeCase}
        onSelectPersona={handleSelectPersona}
        userSession={userSession}
        onLogout={handleLogout}
        cases={scopedCases}
      />
    );
  }

  // ── ALO Coordinator ──────────────────────────────────────────────────────
  if (effectiveRole === 'C' || effectiveRole === 'CO') {
    return (
      <CoordinatorPortalView
        key="portal-C"
        activeCase={activeCase}
        cases={scopedCases}
        onSelectCase={onSelectCase}
        onAdvanceStage={handleAdvanceStage}
        onAssignPaymentToPatient={handleAssignPaymentToPatient}
        onVerifyPaymentAndDispatch={handleVerifyPaymentAndDispatch}
        onReleaseReportToPatient={handleReleaseReportToPatient}
        onUpdateCase={handleUpdateCase}
        lang={lang}
        onLogout={handleLogout}
      />
    );
  }

  // ── International Consultant ─────────────────────────────────────────────
  if (effectiveRole === 'K' || effectiveRole === 'CN') {
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const magicToken = searchParams?.get('token') || searchParams?.get('magic_token');
    const queryCaseId = searchParams?.get('caseId') || searchParams?.get('case_id');
    const hasMagicLinkToken = Boolean(magicToken);
    const targetCase = queryCaseId ? cases.find((c) => c.id === queryCaseId || c.caseNumber === queryCaseId) : null;

    const isCaseUnlocked = (c: ClinicalCase) => {
      // Magic-link tokens are validated server-side via GET /api/cases/:id/magic?token=.
      // A token present in the URL does not automatically unlock every case.
      const isPaid = !!c.pricing?.paid || c.paymentDetails?.status === 'completed';
      const isVerified = !!c.paymentVerified || !!c.metadata?.paymentVerified;
      const isInConsultantStage = ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(c.currentStage);
      return (isPaid && isVerified) || isInConsultantStage;
    };

    const eligibleCases = cases.filter(isCaseUnlocked);
    const consultantCase = targetCase || (isCaseUnlocked(activeCase) ? activeCase : (eligibleCases[0] || activeCase));

    return (
      <ConsultantMobileView
        key="portal-K"
        activeCase={consultantCase}
        cases={eligibleCases.length > 0 ? eligibleCases : cases}
        onSelectCase={onSelectCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        onLogout={handleLogout}
      />
    );
  }

  // ── ALO Nurse ────────────────────────────────────────────────────────────
  if (effectiveRole === 'N') {
    return (
      <NurseTriageView
        key="portal-N"
        activeCase={activeCase}
        cases={scopedCases}
        onSelectCase={onSelectCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        lang={lang}
        userSession={userSession}
        activePersona={personaToUse}
        onLogout={handleLogout}
      />
    );
  }

  // ── Saudi Treating Doctor ─────────────────────────────────────────────────
  if (effectiveRole === 'D') {
    return (
      <DoctorReviewView
        key="portal-D"
        activeCase={activeCase}
        cases={scopedCases}
        onSelectCase={onSelectCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        lang={lang}
        userSession={userSession}
        activePersona={personaToUse}
        onLogout={handleLogout}
      />
    );
  }

  // ── Hospital Department & Partner Roles (Lab, Pharmacy, Reception, etc.) ───
  if (['L', 'PH', 'REC', 'H', 'T', 'V'].includes(effectiveRole)) {
    return (
      <PartnerServicesView
        key={`portal-${effectiveRole}`}
        activeCase={activeCase}
        cases={scopedCases}
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
          key="patient-landing"
          activeCase={activeCase}
          lang={lang}
          onToggleLang={handleToggleLang}
          onSelectService={(serviceId) => {
            if (userSession?.roleCode === 'P' && activeCase && activeCase.stage && activeCase.stage > 1 && handleStartNewCase) {
              handleStartNewCase();
            }
            handleSelectServiceFromLanding(serviceId);
          }}
          onOpenMyCases={() => {
            if (!userSession && onOpenLogin) onOpenLogin();
            else handleSelectPatientSubView('timeline');
          }}
          onStartCase={() => {
            if (!userSession && onOpenLogin) onOpenLogin();
            else if (handleStartNewCase) handleStartNewCase();
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
          key="patient-intake"
          activeCase={activeCase}
          onAdvanceStage={() => { handleAdvanceStage(); handleSelectPatientSubView('timeline'); }}
          onUpdateCase={handleUpdateCase}
          lang={lang}
          selectedService={selectedServiceId}
          onSelectService={setSelectedServiceId}
          onBackToLanding={() => handleSelectPatientSubView('landing')}
          onBackToTimeline={() => handleSelectPatientSubView('timeline')}
          hasExistingCases={cases && cases.length > 0 && cases.some((c) => c.stage && c.stage > 1)}
          onStartNewCase={handleStartNewCase}
          userSession={userSession}
          onOpenLogin={onOpenLogin}
          onLogout={handleLogout}
        />
      );
    }

    const isPaid = !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed';
    const canPatientCheckout =
      !!activeCase.invoiceIssued &&
      Array.isArray(activeCase.allowedPaymentMethods) &&
      activeCase.allowedPaymentMethods.length > 0 &&
      !isPaid;

    // Follow-up chat (21-day)
    if (patientSubView === ('followup' as any) || (activeCase.currentStage === 'FOLLOW_UP_21_DAYS' && patientSubView !== 'timeline')) {
      return (
        <FollowUpChatView
          key="patient-followup"
          activeCase={activeCase}
          onAdvanceStage={() => {
            handleAdvanceStage();
            handleSelectPatientSubView('timeline');
          }}
          onUpdateCase={handleUpdateCase}
          onBackToTimeline={() => handleSelectPatientSubView('timeline')}
        />
      );
    }

    // Status tracker
    if (patientSubView === 'timeline') {
      return (
        <PatientStatusTimelineView
          key="patient-timeline"
          activeCase={activeCase}
          cases={scopedCases}
          onSelectCase={onSelectCase}
          onAdvanceStage={handleAdvanceStage}
          onUpdateCase={handleUpdateCase}
          onResetActiveCase={handleResetActiveCase}
          onBackToLanding={() => handleSelectPatientSubView('landing')}
          onOpenTelehealth={() => handleSelectPatientSubView('telehealth')}
          onOpenPayment={() => { if (canPatientCheckout) handleSelectPatientSubView('checkout'); }}
          onRegisterCase={handleStartNewCase || (() => handleSelectPatientSubView('intake'))}
          onStartNewCase={handleStartNewCase}
          onOpenFollowUp={() => handleSelectPatientSubView('followup' as any)}
          userSession={userSession}
          lang={lang}
        />
      );
    }

    // LiveKit Telehealth room (explicit subview OR after report released on video)
    if (patientSubView === 'telehealth' || (activeCase.currentStage === 'OPINION_READY' && activeCase.consultationType === 'video' && !!activeCase.metadata?.pdf1Released)) {
      return (
        <OpinionTelehealthView
          key="patient-telehealth"
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
          key="patient-checkout"
          activeCase={activeCase}
          onAdvanceStage={handleCompletePatientPayment}
          onBackToTimeline={() => handleSelectPatientSubView('timeline')}
          onUpdateCase={handleUpdateCase}
          lang={lang}
        />
      );
    }

    // All intermediate clinical stages → Patient Journey Tracker
    return (
      <PatientStatusTimelineView
        key="patient-status"
        activeCase={activeCase}
        cases={scopedCases}
        onSelectCase={onSelectCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        onResetActiveCase={handleResetActiveCase}
        onBackToLanding={() => handleSelectPatientSubView('landing')}
        onOpenTelehealth={() => handleSelectPatientSubView('telehealth')}
        onOpenPayment={() => handleSelectPatientSubView('checkout')}
        onRegisterCase={() => handleSelectPatientSubView('intake')}
        userSession={userSession}
        lang={lang}
      />
    );
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return (
    <PatientStatusTimelineView
      key="patient-fallback"
      activeCase={activeCase}
      cases={scopedCases}
      onSelectCase={onSelectCase}
      onAdvanceStage={handleAdvanceStage}
      onUpdateCase={handleUpdateCase}
      onResetActiveCase={handleResetActiveCase}
      onOpenTelehealth={() => handleSelectPatientSubView('telehealth')}
      onRegisterCase={() => handleSelectPatientSubView('intake')}
      userSession={userSession}
      lang={lang}
    />
  );
};

export default ScreenRouter;
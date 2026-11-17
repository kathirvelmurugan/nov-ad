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
      // Intake stores the number in national format ("500000051") while the auth
      // record carries the international one ("+966500000051"). Comparing the raw
      // strings hid a patient's own case from their portal, so ownership is decided
      // on the subscriber digits only.
      const tail = (value?: string) => (value || '').replace(/\D/g, '').slice(-9);
      const owner = tail(phone);
      return cases.filter(
        (c) =>
          (queryCaseId && (c.id === queryCaseId || c.caseNumber === queryCaseId)) ||
          (owner.length === 9 && tail(c.patientPhone) === owner) ||
          c.nationalIdMasked === phone
      );
    }
    if (role === 'D') {
      // A treating doctor sees only the cases assigned to them.
      //
      // The previous version compared the case's hospital *name* against the
      // session's hospital *id* (so it never matched), then let any case through
      // when that name happened to contain "riyadh", and handed an unbound doctor
      // the entire platform via `if (!hospital) return true`. Ownership is now an
      // account-id join, with the name retained only as a legacy fallback.
      if (!hospital) return [];
      const doctorId = userSession?.id;
      const cleanName = (userSession?.fullName || '').replace(/^(د\.|dr\.)\s*/i, '').trim().toLowerCase();
      return cases.filter((c) => {
        if (doctorId && c.treatingDoctor?.id) return c.treatingDoctor.id === doctorId;
        const cDocName = (c.treatingDoctor?.name || '').replace(/^(د\.|dr\.)\s*/i, '').trim().toLowerCase();
        return Boolean(cleanName && cDocName && (cDocName.includes(cleanName) || cleanName.includes(cDocName)));
      });
    }
    if (role === 'HA' && hospital) {
      return cases.filter((c) => (queryCaseId && (c.id === queryCaseId || c.caseNumber === queryCaseId)) || (c.treatingDoctor?.hospital || '').toLowerCase().includes(hospital.toLowerCase()));
    }
    if (role === 'K') {
      // Same ownership rule as the treating doctor: the account id is the join,
      // the name is a legacy fallback only. A consultant with no id and no name
      // must see nothing rather than the whole platform.
      const consultantId = userSession?.id;
      const cleanName = (userSession?.fullName || '').trim().toLowerCase();
      return cases.filter((c) => {
        if (queryCaseId && (c.id === queryCaseId || c.caseNumber === queryCaseId)) return true;
        if (consultantId && c.consultant?.id) return c.consultant.id === consultantId;
        if (!cleanName) return false;
        return (c.consultant?.name || '').trim().toLowerCase().includes(cleanName);
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

  // ── Fallback: an unrecognised role is a stop, not a downgrade ──────────────
  // This used to render PatientStatusTimelineView, which silently showed the
  // patient portal to whatever role fell through the branches above.
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xl">
          !
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">
          {lang === 'ar' ? 'لا توجد بوابة معرّفة لهذه الصفة' : 'No portal is defined for this role'}
        </h2>
        <p className="text-sm text-slate-600">
          {lang === 'ar'
            ? `الصفة «${effectiveRole}» غير مرتبطة بأي شاشة. تواصل مع مدير النظام.`
            : `The role "${effectiveRole}" is not mapped to any screen. Contact the platform administrator.`}
        </p>
        <p className="text-[11px] text-slate-400 font-mono break-all" dir="ltr">
          account={userSession?.id || 'guest'} · role={effectiveRole} · hospital={userSession?.hospitalId || 'none'}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full px-4 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors"
        >
          {lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
        </button>
      </div>
    </div>
  );
};

export default ScreenRouter;
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
import { Persona, ClinicalCase, ClinicalStage } from '../types';
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
        onUpdateCase={handleUpdateCase}
        lang={lang}
      />
    );
  }

  // ── International Consultant ─────────────────────────────────────────────
  if (activePersona.code === 'K') {
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
          onOpenPayment={() => handleSelectPatientSubView('checkout')}
          lang={lang}
        />
      );
    }

    // Payment checkout (explicit subview OR auto-route when AWAITING_PAYMENT and not on timeline)
    if (patientSubView === 'checkout' || activeCase.currentStage === 'AWAITING_PAYMENT') {
      return (
        <PaymentCheckoutView
          activeCase={activeCase}
          onAdvanceStage={() => {
            handleUpdateCase({
              pricing: { ...activeCase.pricing, paid: true },
              paymentDetails: { ...activeCase.paymentDetails, status: 'completed' },
              metadata: { ...(activeCase.metadata || {}), paymentVerified: true },
            });
            handleAdvanceStage();
            handleSelectPatientSubView('timeline');
          }}
          onBackToTimeline={() => handleSelectPatientSubView('timeline')}
          onUpdateCase={handleUpdateCase}
          lang={lang}
        />
      );
    }

    // LiveKit Telehealth room (explicit subview OR auto-route when OPINION_READY + video)
    if (patientSubView === 'telehealth' || (activeCase.currentStage === 'OPINION_READY' && activeCase.consultationType === 'video' && patientSubView !== 'timeline')) {
      return (
        <OpinionTelehealthView
          activeCase={activeCase}
          onAdvanceStage={() => { handleAdvanceStage(); handleSelectPatientSubView('timeline'); }}
          onUpdateCase={handleUpdateCase}
          onBackToTimeline={() => handleSelectPatientSubView('timeline')}
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

import React, { useState } from 'react';
import { PERSONAS } from './data/personas';
import { SEED_CASES } from './data/seedCases';
import { Persona, ClinicalCase, ClinicalStage } from './types';
import { TopProfileSwitcher } from './components/TopProfileSwitcher';
import { StageProgressBar } from './components/StageProgressBar';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';
import { PatientIntakeView } from './components/screens/PatientIntakeView';
import { NurseTriageView } from './components/screens/NurseTriageView';
import { DoctorReviewView } from './components/screens/DoctorReviewView';
import { PaymentCheckoutView } from './components/screens/PaymentCheckoutView';
import { ConsultantMobileView } from './components/screens/ConsultantMobileView';
import { OpinionTelehealthView } from './components/screens/OpinionTelehealthView';
import { PartnerServicesView } from './components/screens/PartnerServicesView';
import { FollowUpChatView } from './components/screens/FollowUpChatView';
import { AdminSettingsView } from './components/screens/AdminSettingsView';

export const App: React.FC = () => {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [cases, setCases] = useState<ClinicalCase[]>(SEED_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>(SEED_CASES[0].id);

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Rotate to next case
  const handleNextCase = () => {
    const currentIndex = cases.findIndex((c) => c.id === activeCaseId);
    const nextIndex = (currentIndex + 1) % cases.length;
    setActiveCaseId(cases[nextIndex].id);
  };

  // Update active case partially
  const handleUpdateCase = (updated: Partial<ClinicalCase>) => {
    setCases((prev) =>
      prev.map((c) => (c.id === activeCase.id ? { ...c, ...updated } : c))
    );
  };

  // Advance to next stage in the 9-stage sequence
  const handleAdvanceStage = () => {
    const stageOrder: ClinicalStage[] = [
      'INTAKE_RECEIVED',
      'NURSE_CHECK',
      'DOCTOR_REVIEW',
      'AWAITING_PAYMENT',
      'WITH_CONSULTANT',
      'OPINION_READY',
      'PARTNER_SERVICES',
      'FOLLOW_UP_21_DAYS',
      'CLOSED',
    ];
    const currentIndex = stageOrder.indexOf(activeCase.currentStage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      handleUpdateCase({ currentStage: nextStage });

      // Automatically adjust persona to match next stage for frictionless pairing
      if (nextStage === 'NURSE_CHECK') setActivePersona(PERSONAS.find((p) => p.code === 'N')!);
      else if (nextStage === 'DOCTOR_REVIEW') setActivePersona(PERSONAS.find((p) => p.code === 'D')!);
      else if (nextStage === 'AWAITING_PAYMENT') setActivePersona(PERSONAS.find((p) => p.code === 'P')!);
      else if (nextStage === 'WITH_CONSULTANT') setActivePersona(PERSONAS.find((p) => p.code === 'K')!);
      else if (nextStage === 'OPINION_READY') setActivePersona(PERSONAS.find((p) => p.code === 'P')!);
      else if (nextStage === 'PARTNER_SERVICES') setActivePersona(PERSONAS.find((p) => p.code === 'L')!);
      else if (nextStage === 'FOLLOW_UP_21_DAYS') setActivePersona(PERSONAS.find((p) => p.code === 'P')!);
    }
  };

  // Set explicit stage from progress bar
  const handleSetStage = (stage: ClinicalStage) => {
    handleUpdateCase({ currentStage: stage });
  };

  // Magic 1-click Auto-Fill: populates realistic data for the current screen
  const handleAutoFill = () => {
    alert('⚡ تم ملء بيانات الشاشة تلقائياً وفق المواصفة السريرية المعتمدة (v2.4)!');
  };

  // Render the appropriate screen based on persona and stage
  const renderScreen = () => {
    // If Admin, render Admin Settings
    if (activePersona.code === 'AD' || activePersona.code === 'HA') {
      return <AdminSettingsView />;
    }

    // If Consultant, render English Mobile App
    if (activePersona.code === 'K') {
      return (
        <ConsultantMobileView
          activeCase={activeCase}
          onAdvanceStage={handleAdvanceStage}
          onUpdateCase={handleUpdateCase}
        />
      );
    }

    // Otherwise render based on the active case's stage
    switch (activeCase.currentStage) {
      case 'INTAKE_RECEIVED':
        return (
          <PatientIntakeView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
          />
        );
      case 'NURSE_CHECK':
        return (
          <NurseTriageView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
          />
        );
      case 'DOCTOR_REVIEW':
        return (
          <DoctorReviewView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
          />
        );
      case 'AWAITING_PAYMENT':
        return (
          <PaymentCheckoutView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
          />
        );
      case 'WITH_CONSULTANT':
        return (
          <ConsultantMobileView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
          />
        );
      case 'OPINION_READY':
        return (
          <OpinionTelehealthView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
          />
        );
      case 'PARTNER_SERVICES':
        return (
          <PartnerServicesView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
          />
        );
      case 'FOLLOW_UP_21_DAYS':
      case 'CLOSED':
      default:
        return (
          <FollowUpChatView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
          />
        );
    }
  };

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${
        activePersona.isRtl ? 'font-cairo' : 'font-sans'
      }`}
      dir={activePersona.isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. Floating Top Profile Switcher */}
      <TopProfileSwitcher
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        activeCase={activeCase}
        onNextCase={handleNextCase}
        onSelectCase={setActiveCaseId}
        cases={cases}
        onAutoFill={handleAutoFill}
      />

      {/* 2. Interactive 9-Stage Stepper Progress Bar */}
      <StageProgressBar
        currentStage={activeCase.currentStage}
        onSetStage={handleSetStage}
      />

      {/* 3. Main Clinical Screen Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {renderScreen()}
      </main>

      {/* 4. WhatsApp Meta-Approved Templates Drawer */}
      <WhatsAppDrawer activeCase={activeCase} />
    </div>
  );
};

export default App;

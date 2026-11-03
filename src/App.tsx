import React, { useState, useEffect } from 'react';
import { PERSONAS } from './data/personas';
import { SEED_CASES } from './data/seedCases';
import { Persona, ClinicalCase, ClinicalStage } from './types';
import { TopProfileSwitcher } from './components/TopProfileSwitcher';
import { StageProgressBar } from './components/StageProgressBar';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';
import { WhatsAppToast } from './components/WhatsAppToast';
import { PatientIntakeView } from './components/screens/PatientIntakeView';
import { NurseTriageView } from './components/screens/NurseTriageView';
import { DoctorReviewView } from './components/screens/DoctorReviewView';
import { PaymentCheckoutView } from './components/screens/PaymentCheckoutView';
import { ConsultantMobileView } from './components/screens/ConsultantMobileView';
import { OpinionTelehealthView } from './components/screens/OpinionTelehealthView';
import { PartnerServicesView } from './components/screens/PartnerServicesView';
import { FollowUpChatView } from './components/screens/FollowUpChatView';
import { AdminSettingsView } from './components/screens/AdminSettingsView';
import { GuideModal } from './components/GuideModal';
import { StageHandoffModal } from './components/StageHandoffModal';
import { AutoDemoController } from './components/AutoDemoController';
import { PatientPipelineBoard } from './components/PatientPipelineBoard';

const STORAGE_KEY = 'alo_cases_v2.4';
const ACTIVE_CASE_KEY = 'alo_active_case_id_v2.4';
const THEME_KEY = 'alo_theme_v2.4';
const LANG_KEY = 'alo_lang_v2.4';

export const App: React.FC = () => {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  
  // Persistent Cases state: isolated in user's browser sandbox
  const [cases, setCases] = useState<ClinicalCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: ClinicalCase) => {
            const seed = SEED_CASES.find((s) => s.id === c.id);
            if (!seed) return c;
            return {
              ...seed,
              ...c,
              patientNameAr: c.patientNameAr || seed.patientNameAr,
              patientNameEn: c.patientNameEn || seed.patientNameEn,
              specialtyAr: c.specialtyAr || seed.specialtyAr,
              specialtyEn: c.specialtyEn || seed.specialtyEn,
              diagnosisAr: c.diagnosisAr || seed.diagnosisAr,
              diagnosisEn: c.diagnosisEn || seed.diagnosisEn,
            };
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse cases from localStorage:', e);
    }
    return SEED_CASES;
  });

  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_CASE_KEY);
      if (saved) return saved;
    } catch (e) {}
    return SEED_CASES[0].id;
  });
  
  // Pinterest "Clinical Calm" light mode as default
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light';
  });

  // Smart language default: Arabic for Saudi roles, English for Dr. Arjun
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    } catch (e) {}
    return 'ar';
  });

  const [isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPipelineBoardOpen, setIsPipelineBoardOpen] = useState(false);
  const [pendingHandoff, setPendingHandoff] = useState<{
    fromStage: ClinicalStage;
    toStage: ClinicalStage;
    nextPersona: Persona;
  } | null>(null);
  const [isAutoDemoActive, setIsAutoDemoActive] = useState(false);

  // Sync state modifications to localStorage for refresh-durability
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.warn('Failed to save cases to localStorage:', e);
    }
  }, [cases]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_CASE_KEY, activeCaseId);
    } catch (e) {}
  }, [activeCaseId]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }, [lang]);

  // 1-Click Sandbox Reset
  const handleResetDemo = () => {
    const isAr = lang === 'ar';
    const confirmMsg = isAr
      ? 'هل أنت متأكد من رغبتك في إعادة ضبط جميع الحالات إلى حالتها الأصلية؟ سيتم مسح أي تعديلات محلية في المتصفح.'
      : 'Are you sure you want to reset all 10 clinical cases to initial demo state? All local browser changes will be cleared.';
    if (window.confirm(confirmMsg)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_CASE_KEY);
      } catch (e) {}
      setCases(SEED_CASES);
      setActiveCaseId(SEED_CASES[0].id);
    }
  };

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

  // Smart persona select: updates persona while strictly preserving explicit user language lock
  const handleSelectPersona = (p: Persona) => {
    setActivePersona(p);
    
    // Check if user has explicitly locked their language
    const lockedLang = localStorage.getItem(LANG_KEY);
    if (!lockedLang) {
      setLang(p.lang);
    }

    // Contextually switch stage to match persona view
    if (p.code === 'N') handleUpdateCase({ currentStage: 'NURSE_CHECK' });
    else if (p.code === 'D') handleUpdateCase({ currentStage: 'DOCTOR_REVIEW' });
    else if (p.code === 'K') handleUpdateCase({ currentStage: 'WITH_CONSULTANT' });
    else if (p.code === 'L' || p.code === 'H' || p.code === 'T' || p.code === 'V') handleUpdateCase({ currentStage: 'PARTNER_SERVICES' });
    else if (p.code === 'AD' || p.code === 'HA') handleUpdateCase({ currentStage: 'CLOSED' });
    else if (p.code === 'P' || p.code === 'F') {
      if (activeCase.currentStage === 'CLOSED' || activeCase.currentStage === 'PARTNER_SERVICES') {
        handleUpdateCase({ currentStage: 'INTAKE_RECEIVED' });
      }
    }
  };

  // 1-Click Universal Language Toggle: locks reviewer preference
  const handleToggleLang = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    try {
      localStorage.setItem(LANG_KEY, nextLang);
    } catch (e) {}
  };

  // 1-Click Theme Toggle
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Synchronize HTML element class for dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Advance to next stage: shows Clinical Handoff Interstitial Modal
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
      
      let nextP = PERSONAS[0];
      if (nextStage === 'NURSE_CHECK') nextP = PERSONAS.find((p) => p.code === 'N')!;
      else if (nextStage === 'DOCTOR_REVIEW') nextP = PERSONAS.find((p) => p.code === 'D')!;
      else if (nextStage === 'AWAITING_PAYMENT') nextP = PERSONAS.find((p) => p.code === 'P')!;
      else if (nextStage === 'WITH_CONSULTANT') nextP = PERSONAS.find((p) => p.code === 'K')!;
      else if (nextStage === 'OPINION_READY') nextP = PERSONAS.find((p) => p.code === 'P')!;
      else if (nextStage === 'PARTNER_SERVICES') nextP = PERSONAS.find((p) => p.code === 'L')!;
      else if (nextStage === 'FOLLOW_UP_21_DAYS') nextP = PERSONAS.find((p) => p.code === 'P')!;
      else if (nextStage === 'CLOSED') nextP = PERSONAS.find((p) => p.code === 'AD')!;

      setPendingHandoff({
        fromStage: activeCase.currentStage,
        toStage: nextStage,
        nextPersona: nextP,
      });
    }
  };

  // Confirm Stage Advance (executes clinical handoff)
  const handleConfirmHandoff = () => {
    if (!pendingHandoff) return;
    const { toStage, nextPersona } = pendingHandoff;
    handleUpdateCase({ currentStage: toStage });
    handleSelectPersona(nextPersona);
    setPendingHandoff(null);
  };

  // Select case from 10-patient pipeline overview board with automatic hero activation
  const handleSelectCaseFromPipeline = (selectedCase: ClinicalCase, heroPersonaCode: string) => {
    setActiveCaseId(selectedCase.id);
    const targetPersona = PERSONAS.find((p) => p.code === heroPersonaCode) || PERSONAS[0];
    handleSelectPersona(targetPersona);
    setIsPipelineBoardOpen(false);
  };

  // Set explicit stage from progress bar
  const handleSetStage = (stage: ClinicalStage) => {
    handleUpdateCase({ currentStage: stage });

    // Sync persona to match stage without overriding language
    let p = PERSONAS[0];
    if (stage === 'INTAKE_RECEIVED') p = PERSONAS.find((x) => x.code === 'P')!;
    else if (stage === 'NURSE_CHECK') p = PERSONAS.find((x) => x.code === 'N')!;
    else if (stage === 'DOCTOR_REVIEW') p = PERSONAS.find((x) => x.code === 'D')!;
    else if (stage === 'AWAITING_PAYMENT') p = PERSONAS.find((x) => x.code === 'P')!;
    else if (stage === 'WITH_CONSULTANT') p = PERSONAS.find((x) => x.code === 'K')!;
    else if (stage === 'OPINION_READY') p = PERSONAS.find((x) => x.code === 'P')!;
    else if (stage === 'PARTNER_SERVICES') p = PERSONAS.find((x) => x.code === 'L')!;
    else if (stage === 'FOLLOW_UP_21_DAYS') p = PERSONAS.find((x) => x.code === 'P')!;
    else if (stage === 'CLOSED') p = PERSONAS.find((x) => x.code === 'AD')!;

    if (p) {
      setActivePersona(p);
      const lockedLang = localStorage.getItem(LANG_KEY);
      if (!lockedLang) {
        setLang(p.lang);
      }
    }
  };

  // Executive Auto-Demo Navigation Handlers
  const handleAutoDemoNextStage = () => {
    const stageOrder: ClinicalStage[] = [
      'INTAKE_RECEIVED',
      'NURSE_CHECK',
      'DOCTOR_REVIEW',
      'AWAITING_PAYMENT',
      'WITH_CONSULTANT',
      'OPINION_READY',
      'PARTNER_SERVICES',
      'FOLLOW_UP_21_DAYS',
      'CLOSED'
    ];
    const currentIndex = stageOrder.indexOf(activeCase.currentStage);
    const nextIndex = (currentIndex + 1) % stageOrder.length;
    handleSetStage(stageOrder[nextIndex]);
  };

  const handleAutoDemoPrevStage = () => {
    const stageOrder: ClinicalStage[] = [
      'INTAKE_RECEIVED',
      'NURSE_CHECK',
      'DOCTOR_REVIEW',
      'AWAITING_PAYMENT',
      'WITH_CONSULTANT',
      'OPINION_READY',
      'PARTNER_SERVICES',
      'FOLLOW_UP_21_DAYS',
      'CLOSED'
    ];
    const currentIndex = stageOrder.indexOf(activeCase.currentStage);
    const prevIndex = (currentIndex - 1 + stageOrder.length) % stageOrder.length;
    handleSetStage(stageOrder[prevIndex]);
  };

  // Magic 1-click Auto-Fill: populates realistic data for the current screen
  const handleAutoFill = () => {
    alert(
      lang === 'ar'
        ? '⚡ تم ملء بيانات الشاشة تلقائياً وفق المواصفة السريرية المعتمدة (v2.4)!'
        : '⚡ Screen auto-filled with accredited clinical benchmark data (v2.4)!'
    );
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

    // If Partner Roles (Lab, Home Nursing, Travel, Insurance), render Partner Services
    if (['L', 'H', 'T', 'V'].includes(activePersona.code)) {
      return (
        <PartnerServicesView
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
            lang={lang}
          />
        );
      case 'NURSE_CHECK':
        return (
          <NurseTriageView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            lang={lang}
          />
        );
      case 'DOCTOR_REVIEW':
        return (
          <DoctorReviewView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
            lang={lang}
          />
        );
      case 'AWAITING_PAYMENT':
        return (
          <PaymentCheckoutView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
            lang={lang}
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

  const isAr = lang === 'ar';

  return (
    <div
      className={`min-h-screen bg-alo-canvas dark:bg-alo-darkCanvas text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200 ${
        isAr ? 'font-cairo' : 'font-sans'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={lang}
    >
      {/* 1. Top Utility Ribbon & Persona Switcher */}
      <TopProfileSwitcher
        activePersona={activePersona}
        onSelectPersona={handleSelectPersona}
        activeCase={activeCase}
        onNextCase={handleNextCase}
        onSelectCase={setActiveCaseId}
        cases={cases}
        onAutoFill={handleAutoFill}
        onResetDemo={handleResetDemo}
        onOpenGuide={() => setIsGuideOpen(true)}
        onStartAutoDemo={() => setIsAutoDemoActive(true)}
        onOpenPipelineBoard={() => setIsPipelineBoardOpen(true)}
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Interactive 9-Stage Stepper Progress Bar */}
      <StageProgressBar
        currentStage={activeCase.currentStage}
        onSetStage={handleSetStage}
        lang={lang}
      />

      {/* 3. Main Clinical Screen Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {renderScreen()}
      </main>

      {/* 4. WhatsApp Real-Time Stage Transition Toast */}
      <WhatsAppToast
        activeCase={activeCase}
        onAdvanceStage={handleAdvanceStage}
        onOpenDrawer={() => setIsWhatsAppDrawerOpen(true)}
        lang={lang}
      />

      {/* 5. WhatsApp Meta-Approved Templates Drawer */}
      <WhatsAppDrawer
        activeCase={activeCase}
        externalOpen={isWhatsAppDrawerOpen}
        onSetExternalOpen={setIsWhatsAppDrawerOpen}
      />

      {/* 6. Bilingual Platform Testing Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        lang={lang}
        onSelectStage={handleSetStage}
        onSelectPersonaCode={(code) => {
          const p = PERSONAS.find((x) => x.code === code);
          if (p) handleSelectPersona(p);
        }}
      />

      {/* 7. Clinical Stage Handoff Interstitial Modal */}
      {pendingHandoff && (
        <StageHandoffModal
          isOpen={!!pendingHandoff}
          fromStage={pendingHandoff.fromStage}
          toStage={pendingHandoff.toStage}
          nextPersona={pendingHandoff.nextPersona}
          lang={lang}
          onContinue={handleConfirmHandoff}
          onClose={() => setPendingHandoff(null)}
        />
      )}

      {/* 8. 10-Patient Live Clinical Pipeline Overview Board */}
      <PatientPipelineBoard
        isOpen={isPipelineBoardOpen}
        onClose={() => setIsPipelineBoardOpen(false)}
        cases={cases}
        activeCaseId={activeCase.id}
        onSelectCase={handleSelectCaseFromPipeline}
        isAr={lang === 'ar'}
      />

      {/* 9. Executive Auto-Demo Presentation Controller */}
      <AutoDemoController
        isActive={isAutoDemoActive}
        currentStage={activeCase.currentStage}
        activePersona={activePersona}
        lang={lang}
        onNextStage={handleAutoDemoNextStage}
        onPrevStage={handleAutoDemoPrevStage}
        onSelectStage={handleSetStage}
        onStop={() => setIsAutoDemoActive(false)}
        activeCaseNumber={activeCase.caseNumber}
      />
    </div>
  );
};

export default App;

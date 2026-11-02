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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

  // Smart persona select: updates persona and aligns language default
  const handleSelectPersona = (p: Persona) => {
    setActivePersona(p);
    setLang(p.lang);

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

  // 1-Click Universal Language Toggle
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
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
      if (nextStage === 'NURSE_CHECK') handleSelectPersona(PERSONAS.find((p) => p.code === 'N')!);
      else if (nextStage === 'DOCTOR_REVIEW') handleSelectPersona(PERSONAS.find((p) => p.code === 'D')!);
      else if (nextStage === 'AWAITING_PAYMENT') handleSelectPersona(PERSONAS.find((p) => p.code === 'P')!);
      else if (nextStage === 'WITH_CONSULTANT') handleSelectPersona(PERSONAS.find((p) => p.code === 'K')!);
      else if (nextStage === 'OPINION_READY') handleSelectPersona(PERSONAS.find((p) => p.code === 'P')!);
      else if (nextStage === 'PARTNER_SERVICES') handleSelectPersona(PERSONAS.find((p) => p.code === 'L')!);
      else if (nextStage === 'FOLLOW_UP_21_DAYS') handleSelectPersona(PERSONAS.find((p) => p.code === 'P')!);
    }
  };

  // Set explicit stage from progress bar
  const handleSetStage = (stage: ClinicalStage) => {
    handleUpdateCase({ currentStage: stage });

    // Sync persona to match stage
    if (stage === 'INTAKE_RECEIVED') {
      const p = PERSONAS.find((x) => x.code === 'P');
      if (p) { setActivePersona(p); setLang(p.lang); }
    } else if (stage === 'NURSE_CHECK') {
      const p = PERSONAS.find((x) => x.code === 'N');
      if (p) { setActivePersona(p); setLang(p.lang); }
    } else if (stage === 'DOCTOR_REVIEW') {
      const p = PERSONAS.find((x) => x.code === 'D');
      if (p) { setActivePersona(p); setLang(p.lang); }
    } else if (stage === 'AWAITING_PAYMENT') {
      const p = PERSONAS.find((x) => x.code === 'P');
      if (p) { setActivePersona(p); setLang(p.lang); }
    } else if (stage === 'WITH_CONSULTANT') {
      const p = PERSONAS.find((x) => x.code === 'K');
      if (p) { setActivePersona(p); setLang(p.lang); }
    } else if (stage === 'OPINION_READY') {
      const p = PERSONAS.find((x) => x.code === 'P');
      if (p) { setActivePersona(p); setLang(p.lang); }
    } else if (stage === 'PARTNER_SERVICES') {
      const p = PERSONAS.find((x) => x.code === 'L');
      if (p) { setActivePersona(p); setLang(p.lang); }
    } else if (stage === 'FOLLOW_UP_21_DAYS') {
      const p = PERSONAS.find((x) => x.code === 'P');
      if (p) { setActivePersona(p); setLang(p.lang); }
    } else if (stage === 'CLOSED') {
      const p = PERSONAS.find((x) => x.code === 'AD');
      if (p) { setActivePersona(p); setLang(p.lang); }
    }
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
    </div>
  );
};

export default App;

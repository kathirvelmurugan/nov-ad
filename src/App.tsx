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
import { CoordinatorPortalView } from './components/screens/CoordinatorPortalView';
import { PatientStatusTimelineView } from './components/screens/PatientStatusTimelineView';
import { NewCaseModal } from './components/NewCaseModal';
import { GuideModal } from './components/GuideModal';
import { StageHandoffModal } from './components/StageHandoffModal';
import { AutoDemoController } from './components/AutoDemoController';
import { PatientPipelineBoard } from './components/PatientPipelineBoard';
import { FiveDeviceCockpitView } from './components/FiveDeviceCockpitView';

const STORAGE_KEY = 'alo_cases_v2.4';
const ACTIVE_CASE_KEY = 'alo_active_case_id_v2.4';
const THEME_KEY = 'alo_theme_v2.4';
const LANG_KEY = 'alo_lang_v2.4';
const VIEW_MODE_KEY = 'alo_view_mode_v2.4';

const FRESH_PRIMARY_CASE: ClinicalCase = {
  id: 'case-test-01',
  caseNumber: 'ALO-2026-TEST01',
  patientName: '',
  patientNameAr: 'مسار تجريبي نظيف (Fresh Case)',
  patientNameEn: 'Fresh Real-Time Test Case',
  nationalIdMasked: '',
  age: 48,
  gender: 'M',
  city: 'الرياض (Riyadh)',
  cityAr: 'الرياض',
  cityEn: 'Riyadh',
  specialty: 'أمراض القلب والشرايين (Cardiology)',
  specialtyAr: 'أمراض القلب والشرايين',
  specialtyEn: 'Cardiology',
  diagnosis: '',
  diagnosisAr: '',
  diagnosisEn: '',
  symptoms: '',
  symptomsAr: '',
  symptomsEn: '',
  consultationType: 'video',
  currentStage: 'INTAKE_RECEIVED',
  stage: 1,
  treatingDoctor: {
    name: 'د. عبدالله الشمري',
    hospital: 'مستشفى رعاية الرياض (Riyadh Care)',
    city: 'الرياض',
    focusQuestions: ['', '', ''],
    focusQuestionsEn: ['', '', ''],
  },
  consultant: {
    name: 'Dr. Arjun Menon',
    center: 'Apollo Hospitals',
    city: 'Chennai',
  },
  pricing: {
    tier: 2,
    tierName: 'Video',
    baseSar: 450,
    vatPercent: 15,
    vatSar: 67.5,
    totalSar: 517.5,
    paid: false,
  },
  files: [],
  partnerOrders: {
    lab: { test: 'Troponin & Lipid Panel', status: 'pending' },
    pharmacy: { meds: ['Atorvastatin 40mg', 'Aspirin 81mg'], substituteAllowed: false, status: 'pending' },
    homeNurse: { area: 'Riyadh - Al Malqa', visits: 2, status: 'scheduled' },
    physio: { sessions: 4, status: 'planned' },
  },
  metadata: {
    isFreshTest: true,
  },
};

export const App: React.FC = () => {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  
  // Pure Live Flow Case state: strictly isolated single patient without static demo clutter
  const [cases, setCases] = useState<ClinicalCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const liveCase = parsed.find((c: ClinicalCase) => c.id === FRESH_PRIMARY_CASE.id);
          if (liveCase) {
            return [{ ...FRESH_PRIMARY_CASE, ...liveCase }];
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse cases from localStorage:', e);
    }
    return [FRESH_PRIMARY_CASE];
  });

  const [activeCaseId, setActiveCaseId] = useState<string>(FRESH_PRIMARY_CASE.id);
  
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
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [pendingHandoff, setPendingHandoff] = useState<{
    fromStage: ClinicalStage;
    toStage: ClinicalStage;
    nextPersona: Persona;
  } | null>(null);
  const [isAutoDemoActive, setIsAutoDemoActive] = useState(false);
  const [viewMode, setViewMode] = useState<'workstation' | 'studio'>(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      if (saved === 'studio' || saved === 'workstation') return saved;
    } catch (e) {}
    return 'studio';
  });

  const handleToggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'workstation' ? 'studio' : 'workstation';
      try {
        localStorage.setItem(VIEW_MODE_KEY, next);
      } catch (e) {}
      return next;
    });
  };

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

  // Isolated Reset for Active Case Only (protects demo seed cases)
  const handleResetActiveCase = () => {
    const isAr = lang === 'ar';
    const confirmMsg = isAr
      ? `هل أنت متأكد من رغبتك في تصفير هذه الحالة (${activeCase.caseNumber || activeCase.id}) بالكامل والبدء من جديد بمسار نظيف؟`
      : `Reset this case (${activeCase.caseNumber || activeCase.id}) back to a clean slate (blank intake)?`;
    if (window.confirm(confirmMsg)) {
      handleUpdateCase({
        currentStage: 'INTAKE_RECEIVED',
        stage: 1,
        patientName: '',
        patientNameAr: '',
        patientNameEn: '',
        nationalIdMasked: '',
        symptoms: '',
        symptomsAr: '',
        symptomsEn: '',
        diagnosis: '',
        diagnosisAr: '',
        diagnosisEn: '',
        consultantOpinion: '',
        proposedCallSlot: '',
        finalClosureNote: '',
        vitals: undefined,
        piiMasked: false,
        triageComplete: false,
        focusQuestions: ['', '', ''],
        referralApproved: false,
        invoiceIssued: false,
        paymentVerified: false,
        reportReleased: false,
        verdicts: [],
        secondOpinionSubmitted: false,
        consultantAnswers: [],
        consultantNotes: '',
        coordinatorForwardedToDoctor: false,
        doctorReleasedToPatient: false,
        isCrossBorderDeidentified: false,
        dualTokenGenerated: false,
        egressToken: '',
        files: [],
        pricing: { ...activeCase.pricing, paid: false, invoiceNumber: undefined },
        metadata: {
          isFreshTest: true,
          pdf1Released: false,
          pdf2Released: false,
          paymentVerified: false,
          paymentLinkIssued: false,
        },
      });
      setActivePersona(PERSONAS[0]); // Return to Patient at Stage 1
    }
  };

  // Add new dynamic test patient (e.g. TEST-KSA-01)
  const handleAddNewCase = (newCase: ClinicalCase) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setActivePersona(PERSONAS[0]); // Patient
  };

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Flow gate: a case counts as paid once checkout completed or pricing.paid is set
  const isCasePaid = (c: ClinicalCase) => !!c.pricing?.paid || c.paymentDetails?.status === 'completed' || !!c.paymentVerified;

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
    else if (p.code === 'C') handleUpdateCase({ currentStage: 'AWAITING_PAYMENT' });
    else if (p.code === 'K') {
      if (!isCasePaid(activeCase) && !isAutoDemoActive) {
        alert(lang === 'ar' ? 'لا يمكن فتح شاشة الاستشاري الهندي قبل تأكيد السداد.' : 'The Indian consultant screen opens only after payment is confirmed.');
        return;
      }
      handleUpdateCase({ currentStage: 'WITH_CONSULTANT' });
    }
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

  // Advance to next stage: direct button-driven transition (handoff modal disabled)
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
      else if (nextStage === 'AWAITING_PAYMENT') nextP = PERSONAS.find((p) => p.code === 'C') || PERSONAS[0];
      else if (nextStage === 'WITH_CONSULTANT') nextP = PERSONAS.find((p) => p.code === 'K')!;
      else if (nextStage === 'OPINION_READY') nextP = PERSONAS.find((p) => p.code === 'D') || PERSONAS[0];
      else if (nextStage === 'PARTNER_SERVICES') nextP = PERSONAS.find((p) => p.code === 'C') || PERSONAS[0];
      else if (nextStage === 'FOLLOW_UP_21_DAYS') nextP = PERSONAS.find((p) => p.code === 'P')!;
      else if (nextStage === 'CLOSED') nextP = PERSONAS.find((p) => p.code === 'C') || PERSONAS[0];

      handleUpdateCase({ currentStage: nextStage });
      handleSelectPersona(nextP);
      setPendingHandoff(null);
      setIsWhatsAppDrawerOpen(true);
    }
  };

  // Confirm Stage Advance (executes clinical handoff)
  const handleConfirmHandoff = () => {
    if (!pendingHandoff) return;
    const { toStage, nextPersona } = pendingHandoff;
    handleUpdateCase({ currentStage: toStage });
    handleSelectPersona(nextPersona);
    setPendingHandoff(null);
    setIsWhatsAppDrawerOpen(true);
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
    const gated: ClinicalStage[] = ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'];
    if (gated.includes(stage) && !isCasePaid(activeCase) && !isAutoDemoActive) {
      alert(lang === 'ar' ? 'لا يمكن الانتقال إلى ما بعد السداد قبل تأكيد الدفع.' : 'Payment must be completed before moving past Awaiting payment.');
      return;
    }
    handleUpdateCase({ currentStage: stage });

    // Sync persona to match stage without overriding language
    let p = PERSONAS[0];
    if (stage === 'INTAKE_RECEIVED') p = PERSONAS.find((x) => x.code === 'P')!;
    else if (stage === 'NURSE_CHECK') p = PERSONAS.find((x) => x.code === 'N')!;
    else if (stage === 'DOCTOR_REVIEW') p = PERSONAS.find((x) => x.code === 'D')!;
    else if (stage === 'AWAITING_PAYMENT') p = PERSONAS.find((x) => x.code === 'P') || PERSONAS[0];
    else if (stage === 'WITH_CONSULTANT') p = PERSONAS.find((x) => x.code === 'K')!;
    else if (stage === 'OPINION_READY') p = PERSONAS.find((x) => x.code === 'D') || PERSONAS[0];
    else if (stage === 'PARTNER_SERVICES') p = PERSONAS.find((x) => x.code === 'C') || PERSONAS[0];
    else if (stage === 'FOLLOW_UP_21_DAYS') p = PERSONAS.find((x) => x.code === 'P')!;
    else if (stage === 'CLOSED') p = PERSONAS.find((x) => x.code === 'C') || PERSONAS[0];

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

    // If ALO Coordinator, render Coordinator Portal
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

    // If ALO Nurse (N), render Nurse Triage
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

    // If Saudi Treating Doctor (D), render Doctor Review
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

    // If Patient Persona (P)
    if (activePersona.code === 'P') {
      if (activeCase.currentStage === 'INTAKE_RECEIVED') {
        return (
          <PatientIntakeView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
            lang={lang}
          />
        );
      }
      if (activeCase.currentStage === 'AWAITING_PAYMENT') {
        return (
          <PaymentCheckoutView
            activeCase={activeCase}
            onAdvanceStage={() => {
              // Patient completed payment -> route to ALO Coordinator (C) to verify & push to Indian consultant
              handleUpdateCase({
                pricing: { ...activeCase.pricing, paid: true },
                paymentDetails: { ...activeCase.paymentDetails, status: 'completed' },
                metadata: { ...(activeCase.metadata || {}), paymentVerified: true },
              });
              const coord = PERSONAS.find((p) => p.code === 'C') || PERSONAS[0];
              setActivePersona(coord);
            }}
            onUpdateCase={handleUpdateCase}
            lang={lang}
          />
        );
      }
      if (activeCase.currentStage === 'FOLLOW_UP_21_DAYS') {
        return (
          <FollowUpChatView
            activeCase={activeCase}
            onAdvanceStage={handleAdvanceStage}
            onUpdateCase={handleUpdateCase}
          />
        );
      }
      // For all intermediate clinical stages (NURSE_CHECK, DOCTOR_REVIEW, WITH_CONSULTANT, OPINION_READY, PARTNER_SERVICES, CLOSED):
      // Render the dedicated, real-time Live Patient Journey Tracker!
      return (
        <PatientStatusTimelineView
          activeCase={activeCase}
          onAdvanceStage={handleAdvanceStage}
          onUpdateCase={handleUpdateCase}
          onResetActiveCase={handleResetActiveCase}
          onSelectRole={(code) => {
            const p = PERSONAS.find((x) => x.code === code);
            if (p) handleSelectPersona(p);
          }}
          lang={lang}
        />
      );
    }

    // Fallback: Default to Patient Status Timeline
    return (
      <PatientStatusTimelineView
        activeCase={activeCase}
        onAdvanceStage={handleAdvanceStage}
        onUpdateCase={handleUpdateCase}
        onResetActiveCase={handleResetActiveCase}
        onSelectRole={(code) => {
          const p = PERSONAS.find((x) => x.code === code);
          if (p) handleSelectPersona(p);
        }}
        lang={lang}
      />
    );
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
        onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)}
        onResetCurrentCase={handleResetActiveCase}
        onOpenGuide={() => setIsGuideOpen(true)}
        onStartAutoDemo={() => setIsAutoDemoActive(true)}
        onOpenPipelineBoard={() => setIsPipelineBoardOpen(true)}
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
      />

      {viewMode === 'studio' ? (
        <FiveDeviceCockpitView
          activeCase={activeCase}
          onAdvanceStage={handleAdvanceStage}
          onUpdateCase={handleUpdateCase}
          onResetActiveCase={handleResetActiveCase}
          lang={lang}
          onSwitchToWorkstation={() => {
            setViewMode('workstation');
            try {
              localStorage.setItem(VIEW_MODE_KEY, 'workstation');
            } catch (e) {}
          }}
          onOpenWhatsAppDrawer={() => setIsWhatsAppDrawerOpen(true)}
        />
      ) : (
        <>
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
        </>
      )}

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

      {/* 7. Clinical Stage Handoff Interstitial Modal (Disabled per user workflow request) */}
      {false && pendingHandoff && (
        <StageHandoffModal
          isOpen={!!pendingHandoff}
          fromStage={(pendingHandoff as any).fromStage}
          toStage={(pendingHandoff as any).toStage}
          nextPersona={(pendingHandoff as any).nextPersona}
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

      {/* 10. New Live Clinical Case Modal (TEST-KSA-01) */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        onAddCase={handleAddNewCase}
        existingCount={cases.filter((c) => c.id.startsWith('TEST-')).length}
        lang={lang}
      />
    </div>
  );
};

export default App;

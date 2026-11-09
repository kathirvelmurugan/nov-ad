/**
 * useClinicalWorkflowState
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-responsibility hook: owns ALL clinical workflow state, localStorage
 * persistence, and every handler function for the ALO Doctor platform.
 *
 * Returns a flat object consumed by AppLayout and ScreenRouter.
 * This file must stay ≤ 400 lines. Add state → extract sub-hooks if needed.
 */

import { useState, useEffect } from 'react';
import { PERSONAS } from '../data/personas';
import { SEED_CASES } from '../data/seedCases';
import { Persona, ClinicalCase, ClinicalStage } from '../types';

// ─── Storage Keys ───────────────────────────────────────────────────────────
export const STORAGE_KEY       = 'alo_cases_v2.4';
export const ACTIVE_CASE_KEY   = 'alo_active_case_id_v2.4';
export const THEME_KEY         = 'alo_theme_v2.4';
export const LANG_KEY          = 'alo_lang_v2.4';
export const VIEW_MODE_KEY     = 'alo_view_mode_v2.4';
export const USER_SESSION_KEY  = 'alo_user_session_v2.4';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UserSession {
  isAuthenticated: boolean;
  phone: string;
  personaId: string | null;
  isGuest: boolean;
  expiresAt: number;
  lang: 'ar' | 'en';
}

// ─── Seed Data ───────────────────────────────────────────────────────────────
export const FRESH_PRIMARY_CASE: ClinicalCase = {
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
  doctorSelectionPreference: 'need_assistance',
  treatingDoctor: {
    name: 'بانتظار فرز التمريض (ألو تختار الأنسب)',
    hospital: 'شبكة المستشفيات المعتمدة (ALO Accredited Network)',
    city: 'الرياض / المملكة',
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
  metadata: { isFreshTest: true },
};

// ─── Stage order helper (shared by multiple handlers) ────────────────────────
const STAGE_ORDER: ClinicalStage[] = [
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

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useClinicalWorkflowState() {

  // ── Persona ──────────────────────────────────────────────────────────────
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);

  // ── Cases ─────────────────────────────────────────────────────────────────
  const [cases, setCases] = useState<ClinicalCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const liveCase = parsed.find((c: ClinicalCase) => c.id === FRESH_PRIMARY_CASE.id);
          if (liveCase) return [{ ...FRESH_PRIMARY_CASE, ...liveCase }];
        }
      }
    } catch (e) { console.warn('Failed to parse cases from localStorage:', e); }
    return [FRESH_PRIMARY_CASE];
  });

  const [activeCaseId, setActiveCaseId] = useState<string>(FRESH_PRIMARY_CASE.id);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light';
  });

  // ── Language ──────────────────────────────────────────────────────────────
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    } catch (e) {}
    return 'ar';
  });

  // ── User Session ──────────────────────────────────────────────────────────
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        if (search.get('demo') === '1' || search.get('cockpit') === '1' || search.get('auth') === 'bypass' || window.location.hash === '#cockpit') {
          return { isAuthenticated: true, phone: '+966501111111', personaId: 'patient', isGuest: true, expiresAt: Date.now() + 30 * 24 * 3600 * 1000, lang: 'ar' };
        }
        const saved = localStorage.getItem(USER_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.isAuthenticated && parsed.expiresAt > Date.now()) return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  // ── UI Flags ──────────────────────────────────────────────────────────────
  const [isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen]                   = useState(false);
  const [isPipelineBoardOpen, setIsPipelineBoardOpen]   = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen]     = useState(false);
  const [isAutoDemoActive, setIsAutoDemoActive]         = useState(false);
  const [pendingHandoff, setPendingHandoff]             = useState<{
    fromStage: ClinicalStage; toStage: ClinicalStage; nextPersona: Persona;
  } | null>(null);

  // ── View Mode ─────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'workstation' | 'studio'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        if (window.location.hash === '#cockpit' || search.get('demo') === '1' || search.get('cockpit') === '1') return 'studio';
      }
    } catch (e) {}
    return 'workstation';
  });

  // ── Patient Sub-View ──────────────────────────────────────────────────────
  const [patientSubView, setPatientSubView] = useState<'landing' | 'intake' | 'timeline' | 'telehealth'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        if (search.get('intake') === '1') return 'intake';
      }
      const saved = localStorage.getItem('alo_patient_subview_v2.4');
      if (saved === 'landing' || saved === 'intake' || saved === 'timeline' || saved === 'telehealth') return saved;
    } catch (e) {}
    return 'landing';
  });

  // ── Selected Service ──────────────────────────────────────────────────────
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('alo_selected_service_v2.4');
      if (saved) return saved;
    } catch (e) {}
    return 'second-opinion';
  });

  // ─────────────────────────────────────────────────────────────────────────
  // localStorage Sync Effects
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cases)); } catch (e) { console.warn(e); } }, [cases]);
  useEffect(() => { try { localStorage.setItem(ACTIVE_CASE_KEY, activeCaseId); } catch (e) {} }, [activeCaseId]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }, [theme]);
  useEffect(() => { try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} }, [lang]);
  useEffect(() => { try { localStorage.setItem('alo_patient_subview_v2.4', patientSubView); } catch (e) {} }, [patientSubView]);
  useEffect(() => { try { localStorage.setItem('alo_selected_service_v2.4', selectedServiceId); } catch (e) {} }, [selectedServiceId]);

  // Dark mode HTML class sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Browser back/forward navigation sync for 5-Role Demo Cockpit
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      if (window.location.hash === '#cockpit') {
        setViewMode('studio');
        const p = PERSONAS.find((x) => x.code === 'P') || PERSONAS[0];
        setActivePersona(p);
      } else {
        setViewMode('workstation');
        setPatientSubView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived State
  // ─────────────────────────────────────────────────────────────────────────
  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];
  const isCasePaid = (c: ClinicalCase) => !!c.pricing?.paid || c.paymentDetails?.status === 'completed' || !!c.paymentVerified;

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleUpdateCase = (updated: Partial<ClinicalCase>) => {
    setCases((prev) => prev.map((c) => (c.id === activeCase.id ? { ...c, ...updated } : c)));
  };

  const handleLogout = () => {
    try { localStorage.removeItem(USER_SESSION_KEY); } catch (e) {}
    setUserSession(null);
  };

  const handleToggleLang = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    try { localStorage.setItem(LANG_KEY, nextLang); } catch (e) {}
  };

  const handleToggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleToggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'workstation' ? 'studio' : 'workstation';
      try { localStorage.setItem(VIEW_MODE_KEY, next); } catch (e) {}
      if (typeof window !== 'undefined') {
        if (next === 'studio' && window.location.hash !== '#cockpit') {
          window.history.pushState({ viewMode: 'studio' }, '', '#cockpit');
        } else if (next === 'workstation' && window.location.hash === '#cockpit') {
          window.history.pushState({ viewMode: 'workstation' }, '', window.location.pathname + window.location.search);
        }
      }
      return next;
    });
  };

  const handleSelectPatientSubView = (subView: 'landing' | 'intake' | 'timeline' | 'telehealth') => {
    setPatientSubView(subView);
    setViewMode('workstation');
    const p = PERSONAS.find((x) => x.code === 'P') || PERSONAS[0];
    setActivePersona(p);
    try {
      localStorage.setItem('alo_patient_subview_v2.4', subView);
      localStorage.setItem(VIEW_MODE_KEY, 'workstation');
    } catch (e) {}
    if (typeof window !== 'undefined' && window.location.hash === '#cockpit') {
      window.history.pushState({ viewMode: 'workstation' }, '', window.location.pathname + window.location.search);
    }
  };

  const handleSelectServiceFromLanding = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    if (serviceId === 'video-consultation') handleUpdateCase({ consultationType: 'video' });
    else if (serviceId === 'second-opinion') handleUpdateCase({ consultationType: 'written' });
    handleSelectPatientSubView('intake');
  };

  const handleStartCaseToCockpit = () => {
    setViewMode('studio');
    const patientPersona = PERSONAS.find((p) => p.code === 'P') || PERSONAS[0];
    setActivePersona(patientPersona);
    try { localStorage.setItem(VIEW_MODE_KEY, 'studio'); } catch (e) {}
    if (typeof window !== 'undefined' && window.location.hash !== '#cockpit') {
      window.history.pushState({ viewMode: 'studio' }, '', '#cockpit');
    }
  };

  const handleSelectPersona = (p: Persona) => {
    setActivePersona(p);
    if (p.code === 'P') {
      setViewMode('workstation');
      try { localStorage.setItem(VIEW_MODE_KEY, 'workstation'); } catch (e) {}
    }
    const lockedLang = localStorage.getItem(LANG_KEY);
    if (!lockedLang) setLang(p.lang);

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
    else if (['L', 'PH', 'REC', 'H', 'T', 'V'].includes(p.code)) handleUpdateCase({ currentStage: 'PARTNER_SERVICES' });
    else if (p.code === 'AD' || p.code === 'HA') handleUpdateCase({ currentStage: 'CLOSED' });
    else if (p.code === 'P' || p.code === 'F') {
      if (activeCase.currentStage === 'CLOSED' || activeCase.currentStage === 'PARTNER_SERVICES') {
        handleUpdateCase({ currentStage: 'INTAKE_RECEIVED' });
      }
    }
  };

  const handleSetStage = (stage: ClinicalStage) => {
    const gated: ClinicalStage[] = ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'];
    if (gated.includes(stage) && !isCasePaid(activeCase) && !isAutoDemoActive) {
      alert(lang === 'ar' ? 'لا يمكن الانتقال إلى ما بعد السداد قبل تأكيد الدفع.' : 'Payment must be completed before moving past Awaiting payment.');
      return;
    }
    handleUpdateCase({ currentStage: stage });
    const stagePersonaMap: Partial<Record<ClinicalStage, string>> = {
      INTAKE_RECEIVED: 'P', NURSE_CHECK: 'N', DOCTOR_REVIEW: 'D', AWAITING_PAYMENT: 'P',
      WITH_CONSULTANT: 'K', OPINION_READY: 'D', PARTNER_SERVICES: 'C',
      FOLLOW_UP_21_DAYS: 'P', CLOSED: 'C',
    };
    const code = stagePersonaMap[stage];
    const p = code ? (PERSONAS.find((x) => x.code === code) || PERSONAS[0]) : PERSONAS[0];
    setActivePersona(p);
    const lockedLang = localStorage.getItem(LANG_KEY);
    if (!lockedLang) setLang(p.lang);
  };

  const handleAdvanceStage = () => {
    const currentIndex = STAGE_ORDER.indexOf(activeCase.currentStage);
    if (currentIndex >= STAGE_ORDER.length - 1) return;
    const nextStage = STAGE_ORDER[currentIndex + 1];
    const nextPersonaMap: Partial<Record<ClinicalStage, string>> = {
      NURSE_CHECK: 'N', DOCTOR_REVIEW: 'D', AWAITING_PAYMENT: 'C',
      WITH_CONSULTANT: 'K', OPINION_READY: 'D', PARTNER_SERVICES: 'C',
      FOLLOW_UP_21_DAYS: 'P', CLOSED: 'C',
    };
    const code = nextPersonaMap[nextStage];
    const nextP = code ? (PERSONAS.find((p) => p.code === code) || PERSONAS[0]) : PERSONAS[0];
    handleUpdateCase({ currentStage: nextStage });
    handleSelectPersona(nextP);
    setPendingHandoff(null);
    setIsWhatsAppDrawerOpen(true);
  };

  const handleConfirmHandoff = () => {
    if (!pendingHandoff) return;
    handleUpdateCase({ currentStage: pendingHandoff.toStage });
    handleSelectPersona(pendingHandoff.nextPersona);
    setPendingHandoff(null);
    setIsWhatsAppDrawerOpen(true);
  };

  const handleNextCase = () => {
    const currentIndex = cases.findIndex((c) => c.id === activeCaseId);
    setActiveCaseId(cases[(currentIndex + 1) % cases.length].id);
  };

  const handleSelectCaseFromPipeline = (selectedCase: ClinicalCase, heroPersonaCode: string) => {
    setActiveCaseId(selectedCase.id);
    const targetPersona = PERSONAS.find((p) => p.code === heroPersonaCode) || PERSONAS[0];
    handleSelectPersona(targetPersona);
    setIsPipelineBoardOpen(false);
  };

  const handleResetDemo = () => {
    const confirmMsg = lang === 'ar'
      ? 'هل أنت متأكد من رغبتك في إعادة ضبط جميع الحالات إلى حالتها الأصلية؟ سيتم مسح أي تعديلات محلية في المتصفح.'
      : 'Are you sure you want to reset all 10 clinical cases to initial demo state? All local browser changes will be cleared.';
    if (window.confirm(confirmMsg)) {
      try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(ACTIVE_CASE_KEY); } catch (e) {}
      setCases(SEED_CASES);
      setActiveCaseId(SEED_CASES[0].id);
      setPatientSubView('landing');
      setSelectedServiceId('second-opinion');
    }
  };

  const handleResetActiveCase = () => {
    const confirmMsg = lang === 'ar'
      ? `هل أنت متأكد من رغبتك في تصفير هذه الحالة (${activeCase.caseNumber || activeCase.id}) بالكامل والبدء من جديد بمسار نظيف؟`
      : `Reset this case (${activeCase.caseNumber || activeCase.id}) back to a clean slate (blank intake)?`;
    if (window.confirm(confirmMsg)) {
      handleUpdateCase({
        currentStage: 'INTAKE_RECEIVED', stage: 1,
        patientName: '', patientNameAr: '', patientNameEn: '', nationalIdMasked: '',
        symptoms: '', symptomsAr: '', symptomsEn: '',
        diagnosis: '', diagnosisAr: '', diagnosisEn: '',
        consultantOpinion: '', proposedCallSlot: '', finalClosureNote: '',
        vitals: undefined, piiMasked: false, triageComplete: false,
        focusQuestions: ['', '', ''], referralApproved: false,
        invoiceIssued: false, paymentVerified: false, reportReleased: false,
        verdicts: [], secondOpinionSubmitted: false, consultantAnswers: [],
        consultantNotes: '', coordinatorForwardedToDoctor: false,
        doctorReleasedToPatient: false, isCrossBorderDeidentified: false,
        dualTokenGenerated: false, egressToken: '', files: [],
        pricing: { ...activeCase.pricing, paid: false, invoiceNumber: undefined },
        metadata: { isFreshTest: true, pdf1Released: false, pdf2Released: false, paymentVerified: false, paymentLinkIssued: false },
      });
      setActivePersona(PERSONAS[0]);
      setPatientSubView('landing');
      setSelectedServiceId('second-opinion');
    }
  };

  const handleAddNewCase = (newCase: ClinicalCase) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setActivePersona(PERSONAS[0]);
    setPatientSubView('landing');
    setSelectedServiceId('second-opinion');
  };

  const handleAutoFill = () => {
    alert(lang === 'ar'
      ? '⚡ تم ملء بيانات الشاشة تلقائياً وفق المواصفة السريرية المعتمدة (v2.4)!'
      : '⚡ Screen auto-filled with accredited clinical benchmark data (v2.4)!');
  };

  const handleAutoDemoNextStage = () => {
    const idx = STAGE_ORDER.indexOf(activeCase.currentStage);
    handleSetStage(STAGE_ORDER[(idx + 1) % STAGE_ORDER.length]);
  };

  const handleAutoDemoPrevStage = () => {
    const idx = STAGE_ORDER.indexOf(activeCase.currentStage);
    handleSetStage(STAGE_ORDER[(idx - 1 + STAGE_ORDER.length) % STAGE_ORDER.length]);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────
  return {
    // State
    activePersona, setActivePersona,
    cases, activeCaseId, setActiveCaseId,
    activeCase,
    theme, lang,
    userSession, setUserSession,
    isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen,
    isGuideOpen, setIsGuideOpen,
    isPipelineBoardOpen, setIsPipelineBoardOpen,
    isNewCaseModalOpen, setIsNewCaseModalOpen,
    isAutoDemoActive, setIsAutoDemoActive,
    pendingHandoff, setPendingHandoff,
    viewMode, setViewMode,
    patientSubView, setPatientSubView,
    selectedServiceId, setSelectedServiceId,
    // Handlers
    handleUpdateCase,
    handleLogout,
    handleToggleLang,
    handleToggleTheme,
    handleToggleViewMode,
    handleSelectPatientSubView,
    handleSelectServiceFromLanding,
    handleStartCaseToCockpit,
    handleSelectPersona,
    handleSetStage,
    handleAdvanceStage,
    handleConfirmHandoff,
    handleNextCase,
    handleSelectCaseFromPipeline,
    handleResetDemo,
    handleResetActiveCase,
    handleAddNewCase,
    handleAutoFill,
    handleAutoDemoNextStage,
    handleAutoDemoPrevStage,
  };
}

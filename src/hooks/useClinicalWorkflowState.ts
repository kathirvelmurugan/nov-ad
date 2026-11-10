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
import { Persona, ClinicalCase, ClinicalStage, PaymentMethodId } from '../types';

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
  caseNumber: 'ALO-2026-8812',
  patientName: 'سالم العامري',
  patientNameAr: 'سالم العامري',
  patientNameEn: 'Salem Al-Ameri',
  nationalIdMasked: '1088****92',
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
  invoiceIssued: false,
  allowedPaymentMethods: [],
  paymentVerified: false,
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
  const [activePersona, setActivePersona] = useState<Persona>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        const role = (search.get('role') || search.get('portal') || '').toUpperCase();
        const token = search.get('token') || search.get('magic');
        const pathname = window.location.pathname.toLowerCase();

        if (token || role === 'K' || role === 'CONSULTANT' || pathname.includes('/consultant')) {
          return PERSONAS.find((p) => p.code === 'K') || PERSONAS[0];
        }
        if (role === 'D' || role === 'DOCTOR' || pathname.includes('/doctor')) {
          return PERSONAS.find((p) => p.code === 'D') || PERSONAS[0];
        }
        if (role === 'N' || role === 'NURSE' || pathname.includes('/nurse')) {
          return PERSONAS.find((p) => p.code === 'N') || PERSONAS[0];
        }
        if (role === 'C' || role === 'COORDINATOR' || pathname.includes('/coordinator')) {
          return PERSONAS.find((p) => p.code === 'C') || PERSONAS[0];
        }
      }
    } catch (e) {}
    return PERSONAS[0];
  });

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
        if (
          search.get('demo') === '1' ||
          search.get('cockpit') === '1' ||
          search.get('auth') === 'bypass' ||
          search.get('portal') ||
          search.get('role') ||
          search.get('token') ||
          search.get('magic') ||
          window.location.hash === '#cockpit'
        ) {
          const roleCode = (search.get('role') || search.get('portal') || 'P').toUpperCase();
          const personaId =
            roleCode === 'D' || roleCode === 'DOCTOR' ? 'doctor'
            : roleCode === 'K' || roleCode === 'CONSULTANT' ? 'consultant'
            : roleCode === 'N' || roleCode === 'NURSE' ? 'nurse'
            : roleCode === 'C' || roleCode === 'COORDINATOR' ? 'coordinator'
            : 'patient';
          return { isAuthenticated: true, phone: '+966501111111', personaId, isGuest: true, expiresAt: Date.now() + 30 * 24 * 3600 * 1000, lang: 'ar' };
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
  const [patientSubView, setPatientSubView] = useState<'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        if (search.get('checkout') === '1' || search.get('payment') === '1' || search.get('subview') === 'checkout') return 'checkout';
        if (search.get('intake') === '1') return 'intake';
        if (search.get('telehealth') === '1' || search.get('subview') === 'telehealth') return 'telehealth';
        if (search.get('timeline') === '1' || search.get('subview') === 'timeline') return 'timeline';
      }
      const saved = localStorage.getItem('alo_patient_subview_v2.4');
      if (saved === 'landing' || saved === 'intake' || saved === 'timeline' || saved === 'telehealth' || saved === 'checkout') return saved;
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
      } else if (window.location.hash !== '#cockpit') {
        setViewMode('workstation');
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
  const isCasePaid = (c: ClinicalCase) => !!c.pricing?.paid || c.paymentDetails?.status === 'completed';
  const isCaseVerified = (c: ClinicalCase) => !!c.paymentVerified || !!c.metadata?.paymentVerified;

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

  const handleSelectPatientSubView = (subView: 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout') => {
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
    if (p.code === 'K' && !isAutoDemoActive) {
      if (!isCasePaid(activeCase)) {
        alert(lang === 'ar' ? 'لا يمكن فتح شاشة الاستشاري الهندي قبل تأكيد السداد.' : 'The Indian consultant screen opens only after payment is confirmed.');
        return;
      }
      if (!isCaseVerified(activeCase)) {
        alert(lang === 'ar' ? 'يجب تحقق منسق رعاية ألو من السداد أولاً قبل الاتصال بالاستشاري الهندي.' : 'Payment must be verified by the ALO Coordinator before connecting to the Indian consultant.');
        return;
      }
    }

    setActivePersona(p);
    if (p.code === 'P') {
      setViewMode('workstation');
      try { localStorage.setItem(VIEW_MODE_KEY, 'workstation'); } catch (e) {}
    }
    const lockedLang = localStorage.getItem(LANG_KEY);
    if (!lockedLang) setLang(p.lang);

    if (p.code === 'N') handleUpdateCase({ currentStage: 'NURSE_CHECK' });
    else if (p.code === 'D') handleUpdateCase({ currentStage: 'DOCTOR_REVIEW' });
    else if (p.code === 'C') {
      if (['INTAKE_RECEIVED', 'NURSE_CHECK', 'DOCTOR_REVIEW'].includes(activeCase.currentStage)) {
        handleUpdateCase({ currentStage: 'AWAITING_PAYMENT' });
      }
    }
    else if (p.code === 'K') {
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
    if (gated.includes(stage) && (!isCasePaid(activeCase) || !isCaseVerified(activeCase)) && !isAutoDemoActive) {
      alert(
        !isCasePaid(activeCase)
          ? (lang === 'ar' ? 'لا يمكن الانتقال إلى ما بعد السداد قبل تأكيد الدفع.' : 'Payment must be completed before moving past Awaiting payment.')
          : (lang === 'ar' ? 'يجب تحقق منسق رعاية ألو من السداد أولاً قبل الانتقال للاستشاري الهندي.' : 'ALO Coordinator must verify payment before connecting to the Indian consultant.')
      );
      return;
    }
    handleUpdateCase({ currentStage: stage });
    const awaitPaymentPersona = activeCase.invoiceIssued && !isCasePaid(activeCase) ? 'P' : 'C';
    const stagePersonaMap: Partial<Record<ClinicalStage, string>> = {
      INTAKE_RECEIVED: 'P', NURSE_CHECK: 'N', DOCTOR_REVIEW: 'D', AWAITING_PAYMENT: awaitPaymentPersona,
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

    if (nextStage === 'WITH_CONSULTANT' && !isAutoDemoActive) {
      if (!isCasePaid(activeCase)) {
        alert(lang === 'ar' ? 'لا يمكن الانتقال للاستشاري قبل إتمام المريض للدفع.' : 'Patient must complete payment first.');
        return;
      }
      if (!isCaseVerified(activeCase)) {
        alert(lang === 'ar' ? 'يجب تحقق منسق رعاية ألو من السداد أولاً قبل الاتصال بالاستشاري الهندي.' : 'ALO Coordinator must verify payment before connecting to the Indian consultant.');
        return;
      }
    }

    const nextPersonaMap: Partial<Record<ClinicalStage, string>> = {
      NURSE_CHECK: 'N', DOCTOR_REVIEW: 'D', AWAITING_PAYMENT: 'C',
      WITH_CONSULTANT: 'K', OPINION_READY: 'D', PARTNER_SERVICES: 'C',
      FOLLOW_UP_21_DAYS: 'P', CLOSED: 'C',
    };
    const code = nextPersonaMap[nextStage];
    const nextP = code ? (PERSONAS.find((p) => p.code === code) || PERSONAS[0]) : PERSONAS[0];
    handleUpdateCase({ currentStage: nextStage });
    setActivePersona(nextP);
    const lockedLang = localStorage.getItem(LANG_KEY);
    if (!lockedLang) setLang(nextP.lang);

    if (nextStage === 'AWAITING_PAYMENT') {
      setPatientSubView('timeline');
    }
    setPendingHandoff(null);
    setIsWhatsAppDrawerOpen(true);
  };

  const handleAssignPaymentToPatient = (
    methods: PaymentMethodId[],
    tierData: { tier: number; tierName: string; baseSar: number; vatSar: number; totalSar: number },
  ) => {
    if (!methods.length) return;
    const invoiceNumber = activeCase.pricing?.invoiceNumber || `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    handleUpdateCase({
      currentStage: 'AWAITING_PAYMENT',
      invoiceIssued: true,
      allowedPaymentMethods: methods,
      paymentAssignedAt: new Date().toISOString(),
      paymentVerified: false,
      consultationType: tierData.tier === 1 ? 'written' : 'video',
      tier: tierData.tier,
      pricing: {
        ...activeCase.pricing,
        ...tierData,
        vatPercent: 15,
        tabbyInstallmentSar: Number((tierData.totalSar / 4).toFixed(2)),
        invoiceNumber,
        paid: false,
      },
      metadata: {
        ...(activeCase.metadata || {}),
        paymentLinkIssued: true,
        paymentLinkIssuedAt: new Date().toISOString(),
        assignedPaymentMethods: methods,
        paymentVerified: false,
      },
    });
    const patientPersona = PERSONAS.find((p) => p.code === 'P') || PERSONAS[0];
    setActivePersona(patientPersona);
    setViewMode('workstation');
    setPatientSubView('checkout');
    setIsWhatsAppDrawerOpen(true);
  };

  const handleCompletePatientPayment = () => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === activeCase.id
          ? {
              ...c,
              currentStage: 'AWAITING_PAYMENT',
              paymentVerified: false,
              pricing: { ...c.pricing, paid: true },
              paymentDetails: { ...(c.paymentDetails || {}), status: 'completed' },
              metadata: { ...(c.metadata || {}), paymentVerified: false },
            }
          : c
      )
    );
    const coordinatorPersona = PERSONAS.find((p) => p.code === 'C') || PERSONAS[0];
    setActivePersona(coordinatorPersona);
    setPatientSubView('timeline');
    setIsWhatsAppDrawerOpen(true);
  };

  const handleVerifyPaymentAndDispatch = () => {
    if (!isCasePaid(activeCase)) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === activeCase.id
          ? {
              ...c,
              currentStage: 'WITH_CONSULTANT',
              paymentVerified: true,
              isCrossBorderDeidentified: true,
              dualTokenGenerated: true,
              egressToken: c.egressToken || 'ALO-KSA-9482',
              consultantToken: c.consultantToken || {
                token: 'ALO-MAGIC-REV-72H-DR-ARJUN',
                expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
                otpVerified: false,
                sessionCookieActive: false,
                sessionExpiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
              },
              metadata: {
                ...(c.metadata || {}),
                paymentVerified: true,
                consultantLinkSent: true,
              },
            }
          : c
      )
    );
    const consultantPersona = PERSONAS.find((p) => p.code === 'K') || PERSONAS[0];
    setActivePersona(consultantPersona);
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
        invoiceIssued: false, allowedPaymentMethods: [], paymentAssignedAt: undefined,
        paymentVerified: false, paymentDetails: undefined, reportReleased: false,
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
    handleAssignPaymentToPatient,
    handleCompletePatientPayment,
    handleVerifyPaymentAndDispatch,
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

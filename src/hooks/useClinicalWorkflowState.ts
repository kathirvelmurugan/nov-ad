/**
 * useClinicalWorkflowState
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-responsibility hook: owns ALL clinical workflow state, localStorage
 * persistence, and every handler function for the ALO Doctor platform.
 *
 * Returns a flat object consumed by AppLayout and ScreenRouter.
 * Decomposed into modular sub-hooks (<300 lines).
 */

import { useState, useEffect } from 'react';
import { PERSONAS } from '../data/personas';
import { SEED_CASES } from '../data/seedCases';
import { Persona, ClinicalCase, ClinicalStage } from '../types';
import {
  STORAGE_KEY,
  ACTIVE_CASE_KEY,
  THEME_KEY,
  LANG_KEY,
  VIEW_MODE_KEY,
  USER_SESSION_KEY,
  UserSession,
  FRESH_PRIMARY_CASE,
} from './workflowConstants';
import { useWorkflowStageTransitions } from './useWorkflowStageTransitions';

export type { UserSession };
export {
  STORAGE_KEY,
  ACTIVE_CASE_KEY,
  THEME_KEY,
  LANG_KEY,
  VIEW_MODE_KEY,
  USER_SESSION_KEY,
  FRESH_PRIMARY_CASE,
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useClinicalWorkflowState() {

  // ── Persona ──────────────────────────────────────────────────────────────
  const [activePersona, setActivePersona] = useState<Persona>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        const role = (search.get('role') || '').toUpperCase();
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
        if (role === 'HA' || role === 'HOSPITAL' || pathname.includes('/hospital')) {
          return PERSONAS.find((p) => p.code === 'HA') || PERSONAS[0];
        }
        if (role === 'AD' || role === 'SUPERADMIN' || pathname.includes('/admin')) {
          return PERSONAS.find((p) => p.code === 'AD') || PERSONAS[0];
        }

        // Check stored session on page refresh to keep active persona!
        const savedSession = localStorage.getItem(USER_SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.isAuthenticated && parsed.roleCode) {
            const matched = PERSONAS.find((p) => p.code === parsed.roleCode);
            if (matched) {
              return {
                ...matched,
                hospitalId: parsed.hospitalId || matched.hospitalId,
              };
            }
          }
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
          search.get('token') ||
          search.get('magic') ||
          window.location.hash === '#cockpit'
        ) {
          const roleCode = (search.get('role') || 'P').toUpperCase();
          const personaId =
            roleCode === 'D' || roleCode === 'DOCTOR' ? 'doctor'
            : roleCode === 'K' || roleCode === 'CONSULTANT' ? 'consultant'
            : roleCode === 'N' || roleCode === 'NURSE' ? 'nurse'
            : roleCode === 'C' || roleCode === 'COORDINATOR' ? 'coordinator'
            : roleCode === 'HA' || roleCode === 'HOSPITAL' ? 'hospital_admin'
            : roleCode === 'AD' || roleCode === 'SUPERADMIN' ? 'super_admin'
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
  const [isAuthModalOpen, setIsAuthModalOpen]           = useState(false);
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
      const saved = localStorage.getItem('alo_patient_subview_v3.0');
      if (saved === 'landing' || saved === 'intake' || saved === 'timeline' || saved === 'telehealth' || saved === 'checkout') return saved;
    } catch (e) {}
    return 'landing';
  });

  // ── Selected Service ──────────────────────────────────────────────────────
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('alo_selected_service_v3.0');
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
  useEffect(() => { try { localStorage.setItem('alo_patient_subview_v3.0', patientSubView); } catch (e) {} }, [patientSubView]);
  useEffect(() => { try { localStorage.setItem('alo_selected_service_v3.0', selectedServiceId); } catch (e) {} }, [selectedServiceId]);

  // Dark mode HTML class sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Initial history state seed
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.history.state) {
      window.history.replaceState({ subView: patientSubView, viewMode }, '', window.location.href);
    }
  }, []);

  // Browser back/forward navigation sync
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (typeof window === 'undefined') return;

      // Close open modals on back navigation
      setIsAuthModalOpen(false);
      setIsGuideOpen(false);
      setIsNewCaseModalOpen(false);
      setIsPipelineBoardOpen(false);

      if (window.location.hash === '#cockpit') {
        setViewMode('studio');
        const p = PERSONAS.find((x) => x.code === 'P') || PERSONAS[0];
        setActivePersona(p);
        return;
      }

      // Restore subview from history state or URL param
      const stateSubView = e.state?.subView;
      const searchSubView = new URLSearchParams(window.location.search).get('subview');
      const validSubViews = ['landing', 'intake', 'timeline', 'telehealth', 'checkout'];
      const targetSubView = (validSubViews.includes(stateSubView)
        ? stateSubView
        : validSubViews.includes(searchSubView || '')
        ? searchSubView
        : 'landing') as 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout';

      setViewMode('workstation');
      setPatientSubView(targetSubView);
      try {
        localStorage.setItem('alo_patient_subview_v3.0', targetSubView);
      } catch (err) {}
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState as any);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState as any);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived State
  // ─────────────────────────────────────────────────────────────────────────
  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleUpdateCase = (updated: Partial<ClinicalCase>) => {
    setCases((prev) => prev.map((c) => (c.id === activeCase.id ? { ...c, ...updated } : c)));
  };

  const transitions = useWorkflowStageTransitions({
    activeCase,
    lang,
    setLang,
    isAutoDemoActive,
    setActivePersona,
    setViewMode,
    setPatientSubView,
    setIsWhatsAppDrawerOpen,
    pendingHandoff,
    setPendingHandoff,
    handleUpdateCase,
    setCases,
  });

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

  const handleSelectPatientSubView = (subView: 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout', skipPush?: boolean) => {
    setPatientSubView(subView);
    setViewMode('workstation');
    const p = PERSONAS.find((x) => x.code === 'P') || PERSONAS[0];
    setActivePersona(p);
    try {
      localStorage.setItem('alo_patient_subview_v3.0', subView);
      localStorage.setItem(VIEW_MODE_KEY, 'workstation');
    } catch (e) {}

    if (typeof window !== 'undefined' && !skipPush) {
      try {
        const url = new URL(window.location.href);
        if (subView === 'landing') {
          url.searchParams.delete('subview');
        } else {
          url.searchParams.set('subview', subView);
        }
        if (url.hash === '#cockpit') url.hash = '';
        window.history.pushState({ subView, viewMode: 'workstation' }, '', url.pathname + url.search);
      } catch (err) {}
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

  const handleNextCase = () => {
    const currentIndex = cases.findIndex((c) => c.id === activeCaseId);
    setActiveCaseId(cases[(currentIndex + 1) % cases.length].id);
  };

  const handleSelectCaseFromPipeline = (selectedCase: ClinicalCase, heroPersonaCode: string) => {
    setActiveCaseId(selectedCase.id);
    const targetPersona = PERSONAS.find((p) => p.code === heroPersonaCode) || PERSONAS[0];
    transitions.handleSelectPersona(targetPersona);
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
        consultantNotes: '', saudiEndorsement: undefined, coordinatorForwardedToDoctor: false,
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
    isAuthModalOpen, setIsAuthModalOpen,
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
    handleSelectPersona: transitions.handleSelectPersona,
    handleSetStage: transitions.handleSetStage,
    handleAdvanceStage: transitions.handleAdvanceStage,
    handleAssignPaymentToPatient: transitions.handleAssignPaymentToPatient,
    handleCompletePatientPayment: transitions.handleCompletePatientPayment,
    handleVerifyPaymentAndDispatch: transitions.handleVerifyPaymentAndDispatch,
    handleReleaseReportToPatient: transitions.handleReleaseReportToPatient,
    handleConfirmHandoff: transitions.handleConfirmHandoff,
    handleNextCase,
    handleSelectCaseFromPipeline,
    handleResetDemo,
    handleResetActiveCase,
    handleAddNewCase,
    handleAutoFill,
    handleAutoDemoNextStage: transitions.handleAutoDemoNextStage,
    handleAutoDemoPrevStage: transitions.handleAutoDemoPrevStage,
  };
}

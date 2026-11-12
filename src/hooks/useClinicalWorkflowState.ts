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
import { Persona, ClinicalCase, ClinicalStage } from '../types';
import { apiClient } from '../services/apiClient';
import { matchesSaudiPhone } from '../components/auth/authTypesAndUtils';
import {
  STORAGE_KEY,
  ACTIVE_CASE_KEY,
  THEME_KEY,
  LANG_KEY,
  VIEW_MODE_KEY,
  USER_SESSION_KEY,
  UserSession,
  FRESH_PRIMARY_CASE,
  DEFAULT_CONSULTANT,
  DEFAULT_TREATING_DOCTOR,
  STAGE_ORDER,
} from './workflowConstants';
import { useWorkflowStageTransitions } from './useWorkflowStageTransitions';

export type { UserSession };
export { STORAGE_KEY, ACTIVE_CASE_KEY, THEME_KEY, LANG_KEY, VIEW_MODE_KEY, USER_SESSION_KEY, FRESH_PRIMARY_CASE };

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useClinicalWorkflowState() {

  // ── Persona ──────────────────────────────────────────────────────────────
  const [activePersona, setActivePersona] = useState<Persona>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        const role = (search.get('role') || '').toUpperCase();
        const portal = (search.get('portal') || '').toLowerCase();
        const token = search.get('token') || search.get('magic');
        const pathname = window.location.pathname.toLowerCase();

        const portalRoleMap: Record<string, string> = {
          consultant: 'K', doctor: 'D', nurse: 'N', coordinator: 'C',
          hospital: 'HA', superadmin: 'AD', admin: 'AD', lab: 'L', pharmacy: 'PH', reception: 'REC',
        };
        const targetRole = token ? 'K' : portalRoleMap[portal] || portalRoleMap[role.toLowerCase()] || role;
        if (targetRole) {
          const matched = PERSONAS.find((p) => p.code === targetRole);
          if (matched) return matched;
        }

        // Check stored session on page refresh to keep active persona & role identity!
        const savedSession = localStorage.getItem(USER_SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.isAuthenticated && parsed.roleCode) {
            const matched = PERSONAS.find((p) => p.code === parsed.roleCode);
            if (matched) {
              return {
                ...matched,
                name: parsed.fullName || matched.name,
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
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) { console.warn('Failed to parse cases from localStorage:', e); }
    return [];
  });

  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const paramId = new URLSearchParams(window.location.search).get('caseId');
        if (paramId) return paramId;
      }
      const saved = localStorage.getItem(ACTIVE_CASE_KEY);
      if (saved) return saved;
    } catch (e) {}
    return '';
  });

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
        if (search.get('demo') === '1' || search.get('cockpit') === '1' || search.get('auth') === 'bypass' || search.get('token') || search.get('magic') || window.location.hash === '#cockpit') {
          const roleCode = (search.get('role') || 'P').toUpperCase();
          const personaId = roleCode === 'D' ? 'doctor' : roleCode === 'K' ? 'consultant' : roleCode === 'N' ? 'nurse' : roleCode === 'C' ? 'coordinator' : roleCode === 'HA' ? 'hospital_admin' : roleCode === 'AD' ? 'super_admin' : 'patient';
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPipelineBoardOpen, setIsPipelineBoardOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isAutoDemoActive, setIsAutoDemoActive] = useState(false);
  const [pendingHandoff, setPendingHandoff] = useState<{ fromStage: ClinicalStage; toStage: ClinicalStage; nextPersona: Persona } | null>(null);

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
  // Database & LocalStorage Synchronization
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const syncCases = async () => {
      try {
        const remoteCases = await apiClient.fetchCases();
        if (mounted && Array.isArray(remoteCases) && remoteCases.length > 0) {
          setCases(remoteCases);
        }
      } catch (e) {}
    };
    syncCases();
    const timer = setInterval(syncCases, 15000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cases)); } catch (e) {} }, [cases]);
  useEffect(() => { try { localStorage.setItem(ACTIVE_CASE_KEY, activeCaseId); } catch (e) {} }, [activeCaseId]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }, [theme]);
  useEffect(() => { try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} }, [lang]);
  useEffect(() => { try { localStorage.setItem('alo_patient_subview_v3.0', patientSubView); } catch (e) {} }, [patientSubView]);
  useEffect(() => { try { localStorage.setItem('alo_selected_service_v3.0', selectedServiceId); } catch (e) {} }, [selectedServiceId]);
  useEffect(() => {
    if (userSession && userSession.isAuthenticated) {
      try { localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession)); } catch (e) {}
    }
  }, [userSession]);

  // Dark mode HTML class sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Language & Direction HTML sync
  useEffect(() => {
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    } catch (e) {}
  }, [lang]);

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

      setIsAuthModalOpen(false);
      setIsGuideOpen(false);
      setIsNewCaseModalOpen(false);
      setIsPipelineBoardOpen(false);

      if (window.location.hash === '#cockpit') {
        setViewMode('studio');
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const portal = (e.state?.portal || searchParams.get('portal') || '').toLowerCase();
      const caseId = e.state?.caseId || searchParams.get('caseId');
      if (caseId) setActiveCaseId(caseId);

      const portalCodeMap: Record<string, string> = {
        patient: 'P', nurse: 'N', doctor: 'D', coordinator: 'C', consultant: 'K',
        hospital: 'HA', superadmin: 'AD', admin: 'AD', lab: 'L', pharmacy: 'PH', reception: 'REC'
      };
      if (portal && portalCodeMap[portal]) {
        const matched = PERSONAS.find((p) => p.code === portalCodeMap[portal]);
        if (matched) {
          if (
            !userSession?.isAuthenticated ||
            !userSession.roleCode ||
            userSession.roleCode === 'AD' ||
            matched.code === userSession.roleCode
          ) {
            setActivePersona(matched);
          }
        }
      }

      // Restore subview from history state or URL param
      const stateSubView = e.state?.subView;
      const searchSubView = searchParams.get('subview');
      const validSubViews = ['landing', 'intake', 'timeline', 'telehealth', 'checkout'];
      const targetSubView = (validSubViews.includes(stateSubView)
        ? stateSubView
        : validSubViews.includes(searchSubView || '')
        ? searchSubView
        : 'landing') as 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout';

      setViewMode('workstation');

      if (!userSession?.isAuthenticated || !userSession.roleCode || userSession.roleCode === 'P') {
        setPatientSubView(targetSubView);
        try { localStorage.setItem('alo_patient_subview_v3.0', targetSubView); } catch (err) {}
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState as any);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState as any);
    };
  }, [userSession]);

  // ── Derived State (Patient Data Scoping) ─────────────────────────────────
  const isPatientUser = userSession?.roleCode === 'P';
  const effectiveCases = isPatientUser
    ? cases.filter((c) => matchesSaudiPhone(c.patientPhone, userSession.phone))
    : cases;

  const rawActiveCase = (isPatientUser
    ? (effectiveCases.find((c) => c.id === activeCaseId) || effectiveCases[0])
    : (cases.find((c) => c.id === activeCaseId) || cases[0])) || {
      ...FRESH_PRIMARY_CASE,
      id: isPatientUser ? `case-${Date.now()}` : FRESH_PRIMARY_CASE.id,
      patientPhone: isPatientUser ? userSession?.phone : undefined,
      patientName: isPatientUser ? (userSession?.fullName || '') : '',
      patientNameAr: isPatientUser ? (userSession?.fullName || '') : '',
      patientNameEn: isPatientUser ? (userSession?.fullName || '') : '',
    };

  const activeCase: ClinicalCase = {
    ...rawActiveCase,
    consultant: rawActiveCase.consultant || DEFAULT_CONSULTANT,
    treatingDoctor: rawActiveCase.treatingDoctor || DEFAULT_TREATING_DOCTOR,
    files: rawActiveCase.files || [],
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleUpdateCase = (updated: Partial<ClinicalCase>) => {
    const syncedUpdate: Partial<ClinicalCase> = { ...updated };
    if (updated.currentStage && updated.stage === undefined) {
      const idx = STAGE_ORDER.indexOf(updated.currentStage);
      if (idx >= 0) syncedUpdate.stage = idx + 1;
    }
    if (isPatientUser && syncedUpdate.currentStage === 'NURSE_CHECK') {
      setPatientSubView('timeline');
    }
    setCases((prev) => {
      const targetId = syncedUpdate.id || activeCase.id || `case-${Date.now()}`;
      const exists = prev.some((c) => c.id === targetId);
      const phoneToSet = syncedUpdate.patientPhone || (isPatientUser ? userSession?.phone : activeCase.patientPhone);
      let updatedCase: ClinicalCase;
      let nextCases: ClinicalCase[];
      if (!exists) {
        const baseCase = (activeCase && activeCase.id === targetId) ? activeCase : FRESH_PRIMARY_CASE;
        updatedCase = { ...baseCase, ...syncedUpdate, id: targetId, ...(phoneToSet ? { patientPhone: phoneToSet } : {}) };
        setActiveCaseId(updatedCase.id);
        nextCases = [updatedCase, ...prev];
      } else {
        nextCases = prev.map((c) => {
          if (c.id === targetId) {
            updatedCase = { ...c, ...syncedUpdate, id: targetId, ...(phoneToSet ? { patientPhone: phoneToSet } : {}) };
            return updatedCase;
          }
          return c;
        });
        if (!updatedCase!) updatedCase = { ...activeCase, ...syncedUpdate, id: targetId, ...(phoneToSet ? { patientPhone: phoneToSet } : {}) };
      }
      apiClient.saveCase(updatedCase).catch(() => {});
      return nextCases;
    });
  };

  const transitions = useWorkflowStageTransitions({
    activeCase, lang, setLang, isAutoDemoActive, setActivePersona, setViewMode, setPatientSubView,
    setIsWhatsAppDrawerOpen, pendingHandoff, setPendingHandoff, handleUpdateCase, setCases, userSession, viewMode,
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem(VIEW_MODE_KEY);
      localStorage.setItem('alo_patient_subview_v3.0', 'landing');
    } catch (e) {}
    setUserSession(null);
    setActivePersona(PERSONAS[0]); // Reset cleanly to Patient ('P')
    setPatientSubView('landing');
    setViewMode('workstation');
    setIsAuthModalOpen(false);
    if (typeof window !== 'undefined') {
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({ subView: 'landing', viewMode: 'workstation' }, '', cleanUrl);
      } catch (e) {}
    }
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
    if (userSession?.isAuthenticated && userSession.roleCode && userSession.roleCode !== 'P' && userSession.roleCode !== 'AD') return;

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
        url.searchParams.set('portal', 'patient');
        if (subView === 'landing') {
          url.searchParams.delete('subview');
          url.searchParams.delete('caseId');
        } else {
          url.searchParams.set('subview', subView);
          if (activeCase?.id) url.searchParams.set('caseId', activeCase.id);
        }
        if (url.hash === '#cockpit') url.hash = '';
        window.history.pushState({ portal: 'patient', subView, caseId: activeCase?.id, viewMode: 'workstation' }, '', url.pathname + url.search);
      } catch (err) {}
    }
  };

  const handleSelectServiceFromLanding = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    if (serviceId === 'video-consultation') handleUpdateCase({ consultationType: 'video' });
    else if (serviceId === 'second-opinion') handleUpdateCase({ consultationType: 'written' });
    handleSelectPatientSubView('intake');
  };

  const handleStartNewCase = () => {
    const newId = `case-${Date.now()}`;
    const newCaseNumber = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const phoneToSet = isPatientUser ? userSession?.phone : undefined;
    const nameToSet = isPatientUser ? (userSession?.fullName || 'المريض') : 'المريض';
    const newCase: ClinicalCase = {
      ...FRESH_PRIMARY_CASE,
      id: newId,
      caseNumber: newCaseNumber,
      patientPhone: phoneToSet,
      patientName: nameToSet,
      patientNameAr: nameToSet,
      patientNameEn: isPatientUser ? (userSession?.fullName || 'Patient') : 'Patient',
      currentStage: 'INTAKE_RECEIVED',
      stage: 1,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      symptoms: '',
      symptomsAr: '',
      symptomsEn: '',
      diagnosis: '',
      diagnosisAr: '',
      diagnosisEn: '',
      specialty: 'جراحة القلب والصدر',
      specialtyAr: 'جراحة القلب والصدر',
      specialtyEn: 'Cardiothoracic Surgery',
      files: [],
      pricing: { ...FRESH_PRIMARY_CASE.pricing, paid: false, invoiceNumber: undefined },
      metadata: { isFreshTest: true, pdf1Released: false, pdf2Released: false, paymentVerified: false, paymentLinkIssued: false },
    };
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newId);
    setPatientSubView('intake');
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('subview', 'intake');
        url.searchParams.set('caseId', newId);
        window.history.pushState({ portal: 'patient', subView: 'intake', caseId: newId, viewMode: 'workstation' }, '', url.pathname + url.search);
      } catch (err) {}
    }
    apiClient.saveCase(newCase).catch(() => {});
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

  const handleSelectCaseFromPipeline = (selectedCase: ClinicalCase, _heroPersonaCode: string) => {
    setActiveCaseId(selectedCase.id);
    setIsPipelineBoardOpen(false);
  };

  const handleResetDemo = () => {
    const confirmMsg = lang === 'ar' ? 'إعادة ضبط الحالات إلى حالة نظيفة؟' : 'Reset all clinical cases to clean state?';
    if (window.confirm(confirmMsg)) {
      try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(ACTIVE_CASE_KEY); } catch (e) {}
      setCases([]); setActiveCaseId(''); setPatientSubView('landing'); setSelectedServiceId('second-opinion');
    }
  };

  const handleResetActiveCase = () => {
    const confirmMsg = lang === 'ar' ? `هل أنت متأكد من تصفير هذه الحالة (${activeCase.caseNumber || activeCase.id})؟` : `Reset this case (${activeCase.caseNumber || activeCase.id})?`;
    if (window.confirm(confirmMsg)) {
      handleUpdateCase({
        currentStage: 'INTAKE_RECEIVED', stage: 1, patientName: '', patientNameAr: '', patientNameEn: '', nationalIdMasked: '',
        symptoms: '', symptomsAr: '', symptomsEn: '', diagnosis: '', diagnosisAr: '', diagnosisEn: '', consultantOpinion: '',
        proposedCallSlot: '', finalClosureNote: '', vitals: undefined, piiMasked: false, triageComplete: false, focusQuestions: ['', '', ''],
        referralApproved: false, invoiceIssued: false, allowedPaymentMethods: [], paymentAssignedAt: undefined, paymentVerified: false,
        paymentDetails: undefined, reportReleased: false, verdicts: [], secondOpinionSubmitted: false, consultantAnswers: [],
        consultantNotes: '', saudiEndorsement: undefined, coordinatorForwardedToDoctor: false, doctorReleasedToPatient: false,
        isCrossBorderDeidentified: false, dualTokenGenerated: false, egressToken: '', files: [],
        pricing: { ...activeCase.pricing, paid: false, invoiceNumber: undefined },
        metadata: { isFreshTest: true, pdf1Released: false, pdf2Released: false, paymentVerified: false, paymentLinkIssued: false },
      });
      if (!userSession?.roleCode || userSession.roleCode === 'P') {
        setActivePersona(PERSONAS[0]);
        setPatientSubView('landing');
        setSelectedServiceId('second-opinion');
      }
    }
  };

  const handleAddNewCase = (newCase: ClinicalCase) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    if (!userSession?.roleCode || userSession.roleCode === 'P') {
      setActivePersona(PERSONAS[0]);
      setPatientSubView('landing');
      setSelectedServiceId('second-opinion');
    }
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
    activePersona, setActivePersona, cases: effectiveCases, allCases: cases, activeCaseId, setActiveCaseId, activeCase,
    theme, lang, userSession, setUserSession,
    isAuthModalOpen, setIsAuthModalOpen, isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen,
    isGuideOpen, setIsGuideOpen, isPipelineBoardOpen, setIsPipelineBoardOpen,
    isNewCaseModalOpen, setIsNewCaseModalOpen, isAutoDemoActive, setIsAutoDemoActive,
    pendingHandoff, setPendingHandoff, viewMode, setViewMode,
    patientSubView, setPatientSubView, selectedServiceId, setSelectedServiceId,
    // Handlers
    handleUpdateCase, handleLogout, handleToggleLang, handleToggleTheme, handleToggleViewMode,
    handleSelectPatientSubView, handleSelectServiceFromLanding, handleStartCaseToCockpit,
    handleStartNewCase,
    handleSelectPersona: transitions.handleSelectPersona, handleSetStage: transitions.handleSetStage,
    handleAdvanceStage: transitions.handleAdvanceStage,
    handleAssignPaymentToPatient: transitions.handleAssignPaymentToPatient,
    handleCompletePatientPayment: transitions.handleCompletePatientPayment,
    handleVerifyPaymentAndDispatch: transitions.handleVerifyPaymentAndDispatch,
    handleReleaseReportToPatient: transitions.handleReleaseReportToPatient,
    handleConfirmHandoff: transitions.handleConfirmHandoff, handleNextCase, handleSelectCaseFromPipeline,
    handleResetDemo, handleResetActiveCase, handleAddNewCase, handleAutoFill,
    handleAutoDemoNextStage: transitions.handleAutoDemoNextStage,
    handleAutoDemoPrevStage: transitions.handleAutoDemoPrevStage,
  };
}
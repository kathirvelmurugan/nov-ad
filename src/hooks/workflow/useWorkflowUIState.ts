import { useState } from 'react';
import { PERSONAS } from '../../data/personas';
import { Persona, ClinicalCase, ClinicalStage } from '../../types';
import { apiClient } from '../../services/apiClient';
import {
  STORAGE_KEY,
  ACTIVE_CASE_KEY,
  THEME_KEY,
  LANG_KEY,
  VIEW_MODE_KEY,
  USER_SESSION_KEY,
  UserSession,
} from '../workflowConstants';

interface UseWorkflowUIStateParams {
  userSession: UserSession | null;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
  activePersona: Persona;
  setActivePersona: React.Dispatch<React.SetStateAction<Persona>>;
  activeCase: ClinicalCase;
  activeCaseId: string;
  setActiveCaseId: (id: string | null) => void;
  cases: ClinicalCase[];
  setCases: React.Dispatch<React.SetStateAction<ClinicalCase[]>>;
  handleUpdateCase: (updatedFields: Partial<ClinicalCase>, isNurseSubmit?: boolean) => void;
  resetIntakeDraft: () => void;
}

export function useWorkflowUIState({
  userSession,
  setUserSession,
  setActivePersona,
  activeCase,
  activeCaseId,
  setActiveCaseId,
  cases,
  setCases,
  handleUpdateCase,
  resetIntakeDraft,
}: UseWorkflowUIStateParams) {
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === 'en' || stored === 'ar') return stored;
    } catch (e) {}
    return 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [viewMode, setViewMode] = useState<'workstation' | 'studio'>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.hash === '#cockpit') return 'studio';
      const stored = localStorage.getItem(VIEW_MODE_KEY);
      if (stored === 'studio' || stored === 'workstation') return stored;
    } catch (e) {}
    return 'workstation';
  });

  const [patientSubView, setPatientSubView] = useState<'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        const sub = search.get('subview');
        if (sub && ['landing', 'intake', 'timeline', 'telehealth', 'checkout'].includes(sub)) {
          return sub as any;
        }
      }
      const stored = localStorage.getItem('alo_patient_subview_v3.0');
      if (stored && ['landing', 'intake', 'timeline', 'telehealth', 'checkout'].includes(stored)) {
        return stored as any;
      }
    } catch (e) {}
    return 'landing';
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string>('second-opinion');

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPipelineBoardOpen, setIsPipelineBoardOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isAutoDemoActive, setIsAutoDemoActive] = useState(false);
  const [pendingHandoff, setPendingHandoff] = useState<{ fromStage: ClinicalStage; toStage: ClinicalStage; nextPersona: Persona } | null>(null);

  const handleLogout = () => {
    try {
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem(VIEW_MODE_KEY);
      localStorage.setItem('alo_patient_subview_v3.0', 'landing');
    } catch (e) {}
    setUserSession(null);
    setActivePersona(PERSONAS[0]);
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
    setActiveCaseId(null);
    resetIntakeDraft();
    setPatientSubView('intake');
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('subview', 'intake');
        url.searchParams.delete('caseId');
        window.history.pushState({ portal: 'patient', subView: 'intake', viewMode: 'workstation' }, '', url.pathname + url.search);
      } catch (err) {}
    }
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
    if (currentIndex >= 0 && cases.length > 0) {
      setActiveCaseId(cases[(currentIndex + 1) % cases.length].id);
    }
  };

  const handleSelectCaseFromPipeline = (selectedCase: ClinicalCase) => {
    setActiveCaseId(selectedCase.id);
    setIsPipelineBoardOpen(false);
  };

  const handleResetDemo = async () => {
    const confirmMsg = lang === 'ar' ? 'إعادة ضبط الحالات إلى حالة نظيفة؟' : 'Reset all clinical cases to clean state?';
    if (window.confirm(confirmMsg)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_CASE_KEY);
        await apiClient.purgeAllCases();
      } catch (e) {}
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

  return {
    lang, setLang, theme, setTheme, viewMode, setViewMode,
    patientSubView, setPatientSubView, selectedServiceId, setSelectedServiceId,
    isAuthModalOpen, setIsAuthModalOpen, isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen,
    isGuideOpen, setIsGuideOpen, isPipelineBoardOpen, setIsPipelineBoardOpen,
    isNewCaseModalOpen, setIsNewCaseModalOpen, isAutoDemoActive, setIsAutoDemoActive,
    pendingHandoff, setPendingHandoff,
    handleLogout, handleToggleLang, handleToggleTheme, handleToggleViewMode,
    handleSelectPatientSubView, handleSelectServiceFromLanding, handleStartNewCase,
    handleStartCaseToCockpit, handleNextCase, handleSelectCaseFromPipeline,
    handleResetDemo, handleResetActiveCase, handleAddNewCase, handleAutoFill,
  };
}

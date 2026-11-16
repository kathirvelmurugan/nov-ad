/**
 * useClinicalWorkflowState
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-responsibility hook: orchestrates clinical workflow state, cases
 * persistence, and delegates to modular sub-hooks:
 *   - useWorkflowUIState (UI flags, view mode, modals, navigation)
 *   - useWorkflowStageTransitions (stage progressions, validations, handoffs)
 */

import { useState, useEffect } from 'react';
import { PERSONAS } from '../data/personas';
import { Persona, ClinicalCase } from '../types';
import { apiClient } from '../services/apiClient';
import { matchesSaudiPhone } from '../components/auth/authTypesAndUtils';
import {
  STORAGE_KEY,
  ACTIVE_CASE_KEY,
  USER_SESSION_KEY,
  UserSession,
  FRESH_PRIMARY_CASE,
  DEFAULT_CONSULTANT,
  DEFAULT_TREATING_DOCTOR,
} from './workflowConstants';
import { useWorkflowStageTransitions } from './useWorkflowStageTransitions';
import { useWorkflowUIState } from './workflow/useWorkflowUIState';

export type { UserSession };
export { STORAGE_KEY, ACTIVE_CASE_KEY, USER_SESSION_KEY, FRESH_PRIMARY_CASE };

const generateAstTimestamp = () => {
  const now = new Date();
  const astTime = new Date(now.getTime() + (3 * 3600000) + (now.getTimezoneOffset() * 60000));
  const hours = astTime.getHours();
  const minutes = astTime.getMinutes().toString().padStart(2, '0');
  const periodEn = hours >= 12 ? 'PM' : 'AM';
  const periodAr = hours >= 12 ? 'م' : 'ص';
  const displayH = hours % 12 || 12;
  return {
    iso: now.toISOString(),
    timeAr: `${displayH.toString().padStart(2, '0')}:${minutes} ${periodAr}`,
    timeEn: `${displayH.toString().padStart(2, '0')}:${minutes} ${periodEn} AST`,
  };
};

const getMilestoneEventForStage = (stage: string, caseId: string, customActor?: string): any => {
  const timeInfo = generateAstTimestamp();
  switch (stage) {
    case 'INTAKE_RECEIVED':
      return {
        id: `evt-${Date.now()}-m01`,
        caseId,
        timestamp: timeInfo.iso,
        formattedTimeAr: timeInfo.timeAr,
        formattedTimeEn: timeInfo.timeEn,
        actionCode: 'M01',
        stage: 'INTAKE_RECEIVED',
        actorRole: 'P',
        actorName: customActor || 'Sami Al-Harbi (سامي الحربي)',
        actorRoleTitleAr: 'المريض',
        actorRoleTitleEn: 'Patient',
        actionSummaryAr: 'تم تسجيل الحالة وتوثيق موافقة الخصوصية',
        actionSummaryEn: 'Case intake registered with MOH verified consent',
        isMilestone: true,
      };
    case 'NURSE_CHECK':
      return {
        id: `evt-${Date.now()}-m02`,
        caseId,
        timestamp: timeInfo.iso,
        formattedTimeAr: timeInfo.timeAr,
        formattedTimeEn: timeInfo.timeEn,
        actionCode: 'M02',
        stage: 'NURSE_CHECK',
        actorRole: 'N',
        actorName: customActor || 'Sara Al-Qahtani (سارة القحطاني)',
        actorRoleTitleAr: 'ممرضة ألو للفرز',
        actorRoleTitleEn: 'ALO Nurse',
        actionSummaryAr: 'تم الفرز السريري ومراجعة المؤشرات الحيوية',
        actionSummaryEn: 'Clinical triage completed and vitals reviewed',
        isMilestone: true,
      };
    case 'DOCTOR_REVIEW':
      return {
        id: `evt-${Date.now()}-m03`,
        caseId,
        timestamp: timeInfo.iso,
        formattedTimeAr: timeInfo.timeAr,
        formattedTimeEn: timeInfo.timeEn,
        actionCode: 'M03',
        stage: 'DOCTOR_REVIEW',
        actorRole: 'D',
        actorName: customActor || 'Dr. Fahad Al-Harbi (د. فهد الحربي)',
        actorRoleTitleAr: 'الطبيب السعودي المعالج',
        actorRoleTitleEn: 'Saudi Treating Doctor',
        actionSummaryAr: 'تمت الموافقة الطبية واعتماد طلب الاستشارة الدولية',
        actionSummaryEn: 'Medical referral endorsed for cross-border consultation',
        isMilestone: true,
      };
    case 'AWAITING_PAYMENT':
    case 'WITH_CONSULTANT':
      return {
        id: `evt-${Date.now()}-m04`,
        caseId,
        timestamp: timeInfo.iso,
        formattedTimeAr: timeInfo.timeAr,
        formattedTimeEn: timeInfo.timeEn,
        actionCode: 'M04',
        stage,
        actorRole: 'C',
        actorName: customActor || 'Emmanuel Arcon Gonzalez',
        actorRoleTitleAr: 'منسق رعاية ألو',
        actorRoleTitleEn: 'ALO Coordinator',
        actionSummaryAr: 'تم التحقق المالي وتأكيد السداد وإحالة الملف للاستشاري',
        actionSummaryEn: 'Payment verified and case dispatched to specialist',
        isMilestone: true,
      };
    case 'OPINION_READY':
    case 'PARTNER_SERVICES':
    case 'CLOSED':
      return {
        id: `evt-${Date.now()}-m05`,
        caseId,
        timestamp: timeInfo.iso,
        formattedTimeAr: timeInfo.timeAr,
        formattedTimeEn: timeInfo.timeEn,
        actionCode: 'M05',
        stage,
        actorRole: 'K',
        actorName: customActor || 'Dr. V. Prasanth',
        actorRoleTitleAr: 'الاستشاري الدولي',
        actorRoleTitleEn: 'International Consultant',
        actionSummaryAr: 'تم تقديم الرأي الطبي الاستشاري واعتماده',
        actionSummaryEn: 'Second opinion clinical report released and certified',
        isMilestone: true,
      };
    default:
      return null;
  }
};

const createFreshDraftIntake = (session?: UserSession | null, _isAr = false): ClinicalCase => ({
  ...FRESH_PRIMARY_CASE,
  id: 'draft-intake',
  caseNumber: '',
  patientName: session?.fullName || '',
  patientNameAr: session?.fullName || '',
  patientNameEn: session?.fullName || '',
  patientPhone: session?.phone || '',
  nationalIdMasked: '',
  age: 0,
  gender: 'M',
  city: '',
  cityAr: '',
  cityEn: '',
  specialty: '',
  specialtyAr: '',
  specialtyEn: '',
  diagnosis: '',
  diagnosisAr: '',
  diagnosisEn: '',
  symptoms: '',
  symptomsAr: '',
  symptomsEn: '',
  consultationType: 'written',
  currentStage: 'INTAKE_RECEIVED',
  stage: 1,
  status: 'draft',
  doctorSelectionPreference: 'need_assistance',
  treatingDoctor: undefined,
  consultant: undefined,
  files: [],
  pricing: {
    tier: 1,
    tierName: 'Written',
    baseSar: 65.22,
    vatSar: 9.78,
    totalSar: 75,
    vatPercent: 15,
    paid: false,
  },
  metadata: {
    isDraft: true,
  },
});

export function useClinicalWorkflowState() {
  const [activePersona, setActivePersona] = useState<Persona>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        const role = (search.get('role') || '').toUpperCase();
        const portal = (search.get('portal') || '').toLowerCase();
        const token = search.get('token') || search.get('magic') || search.get('magic_token');

        const portalRoleMap: Record<string, string> = {
          consultant: 'K', doctor: 'D', nurse: 'N', coordinator: 'C',
          hospital: 'HA', superadmin: 'AD', admin: 'AD', lab: 'L', pharmacy: 'PH', reception: 'REC',
        };
        const targetRole = token ? 'K' : portalRoleMap[portal] || portalRoleMap[role.toLowerCase()] || role;
        if (targetRole) {
          const matched = PERSONAS.find((p) => p.code === targetRole);
          if (matched) return matched;
        }
      }
    } catch (e) {}
    return PERSONAS[0];
  });

  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        const hasConsultantToken = Boolean(search.get('token') || search.get('magic') || search.get('magic_token'));
        if (search.get('demo') === '1' || search.get('cockpit') === '1' || search.get('auth') === 'bypass' || hasConsultantToken || window.location.hash === '#cockpit') {
          const roleCode = (search.get('role') || (hasConsultantToken ? 'K' : 'P')).toUpperCase();
          const personaId = roleCode === 'D' ? 'doctor' : roleCode === 'K' ? 'consultant' : roleCode === 'N' ? 'nurse' : roleCode === 'C' ? 'coordinator' : roleCode === 'HA' ? 'hospital_admin' : roleCode === 'AD' ? 'super_admin' : 'patient';
          const defaultName = roleCode === 'K' ? (search.get('consultant') || 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)') : undefined;
          return { isAuthenticated: true, phone: roleCode === 'K' ? '+919876543210' : '+966501111111', roleCode, fullName: defaultName, personaId, isGuest: true, expiresAt: Date.now() + 30 * 24 * 3600 * 1000, lang: 'ar' };
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

  const [cases, setCases] = useState<ClinicalCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    try {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlCaseId = searchParams?.get('caseId') || searchParams?.get('id');
      if (urlCaseId) return urlCaseId;
      const saved = localStorage.getItem(ACTIVE_CASE_KEY);
      if (saved) return saved;
    } catch (e) {}
    return '';
  });

  const [intakeDraft, setIntakeDraft] = useState<ClinicalCase>(() => createFreshDraftIntake(userSession));

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlCaseId = searchParams.get('caseId') || searchParams.get('id');
      if (urlCaseId && urlCaseId !== activeCaseId) {
        setActiveCaseId(urlCaseId);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (userSession && userSession.phone) {
      setIntakeDraft((prev) => (prev.id === 'draft-intake' ? {
        ...prev,
        patientPhone: userSession.phone,
        patientName: userSession.fullName || prev.patientName,
        patientNameAr: userSession.fullName || prev.patientNameAr,
        patientNameEn: userSession.fullName || prev.patientNameEn,
      } : prev));
    }
  }, [userSession]);

  useEffect(() => {
    let isSubscribed = true;
    apiClient.fetchCases().then((serverCases) => {
      if (isSubscribed && Array.isArray(serverCases)) {
        // Hard Server-Truth: Server response replaces local state completely
        setCases(serverCases);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serverCases)); } catch (e) {}
        try {
          const searchParams = new URLSearchParams(window.location.search);
          const urlCaseId = searchParams.get('caseId') || searchParams.get('id');
          if (urlCaseId && serverCases.some((c) => c.id === urlCaseId)) {
            setActiveCaseId(urlCaseId);
          }
        } catch (e) {}
      }
    }).catch(() => {});
    return () => { isSubscribed = false; };
  }, []);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cases)); } catch (e) {} }, [cases]);
  useEffect(() => { try { localStorage.setItem(ACTIVE_CASE_KEY, activeCaseId); } catch (e) {} }, [activeCaseId]);

  const isPatientPersona = activePersona.code === 'P';
  const isPatientUser = !userSession?.roleCode || userSession.roleCode === 'P';

  const effectiveCases = cases.filter((c) => {
    if (isPatientPersona && isPatientUser) {
      if (c.id === activeCaseId) return true;
      if (userSession?.phone) return matchesSaudiPhone(c.patientPhone, userSession.phone);
      return c.stage > 1 || (!c.patientPhone && c.id !== 'draft-intake');
    }
    return true;
  });

  const activeCase: ClinicalCase =
    (isPatientPersona && isPatientUser
      ? (activeCaseId && activeCaseId !== 'draft-intake' ? effectiveCases.find((c) => c.id === activeCaseId) || effectiveCases[0] : intakeDraft)
      : (activeCaseId ? cases.find((c) => c.id === activeCaseId) : null) || cases[0]) ||
    intakeDraft;

  const handleUpdateCase = (updatedFields: Partial<ClinicalCase>, isNurseSubmit = false) => {
    const syncedUpdate = { ...updatedFields };
    const isPatientUser = !userSession?.roleCode || userSession.roleCode === 'P';

    // If updating draft intake fields prior to explicit submission, mutate intakeDraft in-place without stage jumping
    if (activeCase.id === 'draft-intake' && !isNurseSubmit && syncedUpdate.currentStage !== 'NURSE_CHECK') {
      setIntakeDraft((prev) => ({
        ...prev,
        ...syncedUpdate,
      }));
      return;
    }

    if (activeCase.id === 'draft-intake' || isNurseSubmit || syncedUpdate.currentStage === 'NURSE_CHECK') {
      const freshId = syncedUpdate.id || `case-${Date.now()}`;
      const nameToSet = syncedUpdate.patientName || intakeDraft.patientName || userSession?.fullName || 'Sami Al-Harbi';
      const nameArToSet = syncedUpdate.patientNameAr || intakeDraft.patientNameAr || userSession?.fullName || 'سامي الحربي';
      const nameEnToSet = syncedUpdate.patientNameEn || intakeDraft.patientNameEn || userSession?.fullName || 'Sami Al-Harbi';
      const initialEvt = getMilestoneEventForStage('INTAKE_RECEIVED', freshId, nameToSet);
      const registeredCase: ClinicalCase = {
        ...intakeDraft,
        ...syncedUpdate,
        id: freshId,
        caseNumber: syncedUpdate.caseNumber || `ALO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: nameToSet,
        patientNameAr: nameArToSet,
        patientNameEn: nameEnToSet,
        currentStage: 'NURSE_CHECK',
        stage: 2,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: initialEvt ? [initialEvt] : [],
        metadata: {
          ...(intakeDraft.metadata || {}),
          ...(syncedUpdate.metadata || {}),
          isDraft: false,
        },
      };

      try { localStorage.setItem('alo_active_case_id', freshId); } catch {}
      apiClient.saveCase(registeredCase).catch(() => {});
      setCases((prev) => [registeredCase, ...prev.filter((c) => c.id !== freshId && c.id !== 'draft-intake')]);
      setActiveCaseId(registeredCase.id);
      setIntakeDraft(createFreshDraftIntake(userSession));
      return;
    }

    setCases((prev) => {
      const targetId = syncedUpdate.id || activeCase.id || `case-${Date.now()}`;
      const exists = prev.some((c) => c.id === targetId);
      const phoneToSet = syncedUpdate.patientPhone || (isPatientUser ? userSession?.phone : activeCase.patientPhone);
      let updatedCase: ClinicalCase;
      let nextCases: ClinicalCase[];

      if (!exists) {
        if (!isNurseSubmit) return prev;
        const baseCase = (activeCase && activeCase.id === targetId) ? activeCase : FRESH_PRIMARY_CASE;
        const newEvt = syncedUpdate.currentStage ? getMilestoneEventForStage(syncedUpdate.currentStage, targetId, userSession?.fullName) : null;
        const existingTimeline = Array.isArray(baseCase.timeline) ? baseCase.timeline : [];
        const nextTimeline = newEvt ? [...existingTimeline.filter(e => e.actionCode !== newEvt.actionCode), newEvt] : existingTimeline;
        updatedCase = { ...baseCase, ...syncedUpdate, id: targetId, timeline: nextTimeline, ...(phoneToSet ? { patientPhone: phoneToSet } : {}) };
        setActiveCaseId(updatedCase.id);
        try { localStorage.setItem('alo_active_case_id', updatedCase.id); } catch {}
        nextCases = [updatedCase, ...prev];
      } else {
        nextCases = prev.map((c) => {
          if (c.id === targetId) {
            const newEvt = syncedUpdate.currentStage && syncedUpdate.currentStage !== c.currentStage
              ? getMilestoneEventForStage(syncedUpdate.currentStage, targetId, userSession?.fullName)
              : null;
            const existingTimeline = Array.isArray(c.timeline) ? c.timeline : [];
            const nextTimeline = newEvt ? [...existingTimeline.filter(e => e.actionCode !== newEvt.actionCode), newEvt] : existingTimeline;
            updatedCase = { ...c, ...syncedUpdate, id: targetId, timeline: nextTimeline, ...(phoneToSet ? { patientPhone: phoneToSet } : {}) };
            return updatedCase;
          }
          return c;
        });
        if (!updatedCase!) updatedCase = { ...activeCase, ...syncedUpdate, id: targetId, ...(phoneToSet ? { patientPhone: phoneToSet } : {}) };
      }
      try { localStorage.setItem('alo_active_case_id', targetId); } catch {}
      apiClient.saveCase(updatedCase).catch(() => {});
      return nextCases;
    });
  };

  const ui = useWorkflowUIState({
    userSession,
    setUserSession,
    activePersona,
    setActivePersona,
    activeCase,
    activeCaseId,
    setActiveCaseId,
    cases,
    setCases,
    handleUpdateCase,
    resetIntakeDraft: () => setIntakeDraft(createFreshDraftIntake(userSession)),
  });

  const transitions = useWorkflowStageTransitions({
    activeCase,
    lang: ui.lang,
    setLang: ui.setLang,
    isAutoDemoActive: ui.isAutoDemoActive,
    setActivePersona,
    setViewMode: ui.setViewMode,
    setPatientSubView: ui.setPatientSubView,
    setIsWhatsAppDrawerOpen: ui.setIsWhatsAppDrawerOpen,
    pendingHandoff: ui.pendingHandoff,
    setPendingHandoff: ui.setPendingHandoff,
    handleUpdateCase,
    setCases,
    userSession,
    viewMode: ui.viewMode,
  });

  return {
    activePersona, setActivePersona, cases: effectiveCases, allCases: cases, activeCaseId, setActiveCaseId, activeCase,
    theme: ui.theme, lang: ui.lang, userSession, setUserSession,
    isAuthModalOpen: ui.isAuthModalOpen, setIsAuthModalOpen: ui.setIsAuthModalOpen,
    isWhatsAppDrawerOpen: ui.isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen: ui.setIsWhatsAppDrawerOpen,
    isGuideOpen: ui.isGuideOpen, setIsGuideOpen: ui.setIsGuideOpen,
    isPipelineBoardOpen: ui.isPipelineBoardOpen, setIsPipelineBoardOpen: ui.setIsPipelineBoardOpen,
    isNewCaseModalOpen: ui.isNewCaseModalOpen, setIsNewCaseModalOpen: ui.setIsNewCaseModalOpen,
    isAutoDemoActive: ui.isAutoDemoActive, setIsAutoDemoActive: ui.setIsAutoDemoActive,
    pendingHandoff: ui.pendingHandoff, setPendingHandoff: ui.setPendingHandoff,
    viewMode: ui.viewMode, setViewMode: ui.setViewMode,
    patientSubView: ui.patientSubView, setPatientSubView: ui.setPatientSubView,
    selectedServiceId: ui.selectedServiceId, setSelectedServiceId: ui.setSelectedServiceId,
    handleUpdateCase, handleLogout: ui.handleLogout, handleToggleLang: ui.handleToggleLang,
    handleToggleTheme: ui.handleToggleTheme, handleToggleViewMode: ui.handleToggleViewMode,
    handleSelectPatientSubView: ui.handleSelectPatientSubView,
    handleSelectServiceFromLanding: ui.handleSelectServiceFromLanding,
    handleStartCaseToCockpit: ui.handleStartCaseToCockpit,
    handleStartNewCase: ui.handleStartNewCase,
    handleSelectPersona: transitions.handleSelectPersona, handleSetStage: transitions.handleSetStage,
    handleAdvanceStage: transitions.handleAdvanceStage,
    handleAssignPaymentToPatient: transitions.handleAssignPaymentToPatient,
    handleCompletePatientPayment: transitions.handleCompletePatientPayment,
    handleVerifyPaymentAndDispatch: transitions.handleVerifyPaymentAndDispatch,
    handleReleaseReportToPatient: transitions.handleReleaseReportToPatient,
    handleConfirmHandoff: transitions.handleConfirmHandoff,
    handleNextCase: ui.handleNextCase,
    handleSelectCaseFromPipeline: ui.handleSelectCaseFromPipeline,
    handleResetDemo: ui.handleResetDemo,
    handleResetActiveCase: ui.handleResetActiveCase,
    handleAddNewCase: ui.handleAddNewCase,
    handleAutoFill: ui.handleAutoFill,
    handleAutoDemoNextStage: transitions.handleAutoDemoNextStage,
    handleAutoDemoPrevStage: transitions.handleAutoDemoPrevStage,
  };
}

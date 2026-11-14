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
  treatingDoctor: DEFAULT_TREATING_DOCTOR,
  consultant: DEFAULT_CONSULTANT,
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
        const token = search.get('token') || search.get('magic');

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
      const saved = localStorage.getItem(ACTIVE_CASE_KEY);
      if (saved) return saved;
    } catch (e) {}
    return '';
  });

  const [intakeDraft, setIntakeDraft] = useState<ClinicalCase>(() => createFreshDraftIntake(userSession));

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
      if (isSubscribed && Array.isArray(serverCases) && serverCases.length > 0) {
        setCases((prev) => {
          const merged = [...serverCases];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) merged.push(p);
          });
          return merged;
        });
      }
    }).catch(() => {});
    return () => { isSubscribed = false; };
  }, []);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cases)); } catch (e) {} }, [cases]);
  useEffect(() => { try { localStorage.setItem(ACTIVE_CASE_KEY, activeCaseId); } catch (e) {} }, [activeCaseId]);

  const effectiveCases = cases.filter((c) => {
    const isPatientPersona = activePersona.code === 'P';
    const isPatientUser = !userSession?.roleCode || userSession.roleCode === 'P';
    if (isPatientPersona && isPatientUser) {
      if (userSession?.phone) return matchesSaudiPhone(c.patientPhone, userSession.phone);
      return false;
    }
    return true;
  });

  const activeCase: ClinicalCase =
    cases.find((c) => c.id === activeCaseId) ||
    effectiveCases[0] ||
    intakeDraft;

  const handleUpdateCase = (updatedFields: Partial<ClinicalCase>, isNurseSubmit = false) => {
    const syncedUpdate = { ...updatedFields };
    const isPatientUser = !userSession?.roleCode || userSession.roleCode === 'P';

    if (activeCase.id === 'draft-intake' || isNurseSubmit) {
      const freshId = syncedUpdate.id || `case-${Date.now()}`;
      const nameToSet = syncedUpdate.patientName || intakeDraft.patientName || userSession?.fullName || 'Sami Al-Harbi';
      const nameArToSet = syncedUpdate.patientNameAr || intakeDraft.patientNameAr || userSession?.fullName || 'سامي الحربي';
      const nameEnToSet = syncedUpdate.patientNameEn || intakeDraft.patientNameEn || userSession?.fullName || 'Sami Al-Harbi';
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
        metadata: {
          ...(intakeDraft.metadata || {}),
          ...(syncedUpdate.metadata || {}),
          isDraft: false,
        },
      };

      apiClient.saveCase(registeredCase).catch(() => {});
      setCases((prev) => [registeredCase, ...prev.filter((c) => c.id !== freshId && c.id !== 'draft-intake')]);
      setActiveCaseId(registeredCase.id);
      setIntakeDraft(createFreshDraftIntake(userSession));
      ui.setPatientSubView('timeline');
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

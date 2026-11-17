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
import { priceTier, vatPercent } from '../config/platformConfig';
import { matchesSaudiPhone } from '../components/auth/authTypesAndUtils';
import {
  ACTIVE_CASE_KEY,
  USER_SESSION_KEY,
  UserSession,
  FRESH_PRIMARY_CASE,
  DEFAULT_CONSULTANT,
  DEFAULT_TREATING_DOCTOR,
} from './workflowConstants';
import { useWorkflowStageTransitions } from './useWorkflowStageTransitions';
import { isKnownStage, stageNumberOf } from './stageLogic';
import { useWorkflowUIState } from './workflow/useWorkflowUIState';

export type { UserSession };
export { ACTIVE_CASE_KEY, USER_SESSION_KEY, FRESH_PRIMARY_CASE };

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
        actorName: customActor || '',
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
        actorName: customActor || '',
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
        actorName: customActor || '',
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
        actorName: customActor || '',
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
        actorName: customActor || '',
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

const DRAFT_TIER = priceTier(1);

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
    tier: DRAFT_TIER.id,
    tierName: DRAFT_TIER.tierNameEn,
    baseSar: DRAFT_TIER.baseSar,
    vatSar: DRAFT_TIER.vatSar,
    totalSar: DRAFT_TIER.totalSar,
    vatPercent: vatPercent(),
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

        const portalRoleMap: Record<string, string> = {
          consultant: 'K', doctor: 'D', nurse: 'N', coordinator: 'C',
          hospital: 'HA', superadmin: 'AD', admin: 'AD', lab: 'L', pharmacy: 'PH', reception: 'REC',
        };
        const targetRole = portalRoleMap[portal] || portalRoleMap[role.toLowerCase()] || role;
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
        const saved = localStorage.getItem(USER_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.isAuthenticated && parsed.expiresAt > Date.now()) return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  // Consultant magic link: the URL token is validated by the server, which issues
  // a real session. No identity is ever derived from the query string alone.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    const token = search.get('token') || search.get('magic') || search.get('magic_token');
    const caseId = search.get('caseId') || search.get('id');
    if (!token || !caseId) return;
    if (userSession?.isAuthenticated) return;

    let cancelled = false;
    apiClient.verifyMagicLink(caseId, token)
      .then((session) => {
        if (cancelled) return;
        const consultantSession: UserSession = {
          isAuthenticated: true,
          phone: '',
          roleCode: 'K',
          personaId: 'consultant',
          fullName: search.get('consultant') || 'International Consultant',
          isGuest: true,
          expiresAt: new Date(session.expiresAt).getTime(),
          lang: 'ar',
          token: session.token,
        };
        try { localStorage.setItem(USER_SESSION_KEY, JSON.stringify(consultantSession)); } catch {}
        setUserSession(consultantSession);
        if (session.caseId) setActiveCaseId(session.caseId);
        const consultantPersona = PERSONAS.find((p) => p.code === 'K');
        if (consultantPersona) setActivePersona(consultantPersona);
      })
      .catch(() => {
        // Invalid or expired link: stay signed out and let the auth gate handle it.
      });

    return () => { cancelled = true; };
  }, []);

  // apiClient dispatches this when the server rejects a stale Bearer token;
  // dropping the session re-opens the auth gate instead of looping on retry.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onSessionExpired = () => setUserSession(null);
    window.addEventListener('alo:session-expired', onSessionExpired);
    return () => window.removeEventListener('alo:session-expired', onSessionExpired);
  }, []);

  // Cases start empty and are replaced by the server response; there is no local
  // cache that could outlive a deleted case.
  const [cases, setCases] = useState<ClinicalCase[]>([]);

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

  // Super Admin lands directly on their portal — no persona switching required
  useEffect(() => {
    if (userSession && userSession.roleCode === 'AD' && activePersona.code !== 'AD') {
      const adPersona = PERSONAS.find((p) => p.code === 'AD');
      if (adPersona) {
        setActivePersona({
          ...adPersona,
          name: userSession.fullName || adPersona.name,
        });
      }
    }
  }, [userSession, activePersona.code]);

  useEffect(() => {
    let isSubscribed = true;
    apiClient.fetchCases().then((serverCases) => {
      if (isSubscribed && Array.isArray(serverCases)) {
        // Hard Server-Truth: Server response replaces local state completely
        setCases(serverCases);
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

    // `stage` (1-9) is always derived from currentStage: callers never hand-write it.
    if (isKnownStage(syncedUpdate.currentStage)) {
      syncedUpdate.stage = stageNumberOf(syncedUpdate.currentStage);
    }

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
      const nameToSet = syncedUpdate.patientName || intakeDraft.patientName || userSession?.fullName || '';
      const nameArToSet = syncedUpdate.patientNameAr || intakeDraft.patientNameAr || userSession?.fullName || '';
      const nameEnToSet = syncedUpdate.patientNameEn || intakeDraft.patientNameEn || userSession?.fullName || '';
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

      try { localStorage.setItem(ACTIVE_CASE_KEY, freshId); } catch {}
      apiClient.saveCase(registeredCase)
        .then(() => window.dispatchEvent(new CustomEvent('alo:case-save-ok')))
        .catch((err) => window.dispatchEvent(new CustomEvent('alo:case-save-failed', {
          detail: { caseNumber: registeredCase.caseNumber, message: err?.message || '' },
        })));
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
        updatedCase = { ...baseCase, ...syncedUpdate, id: targetId, timeline: nextTimeline, updatedAt: new Date().toISOString(), ...(phoneToSet ? { patientPhone: phoneToSet } : {}) };
        setActiveCaseId(updatedCase.id);
        try { localStorage.setItem(ACTIVE_CASE_KEY, updatedCase.id); } catch {}
        nextCases = [updatedCase, ...prev];
      } else {
        nextCases = prev.map((c) => {
          if (c.id === targetId) {
            const newEvt = syncedUpdate.currentStage && syncedUpdate.currentStage !== c.currentStage
              ? getMilestoneEventForStage(syncedUpdate.currentStage, targetId, userSession?.fullName)
              : null;
            const existingTimeline = Array.isArray(c.timeline) ? c.timeline : [];
            const nextTimeline = newEvt ? [...existingTimeline.filter(e => e.actionCode !== newEvt.actionCode), newEvt] : existingTimeline;
            updatedCase = { ...c, ...syncedUpdate, id: targetId, timeline: nextTimeline, updatedAt: new Date().toISOString(), ...(phoneToSet ? { patientPhone: phoneToSet } : {}) };
            return updatedCase;
          }
          return c;
        });
        if (!updatedCase!) updatedCase = { ...activeCase, ...syncedUpdate, id: targetId, ...(phoneToSet ? { patientPhone: phoneToSet } : {}) };
      }
      try { localStorage.setItem(ACTIVE_CASE_KEY, targetId); } catch {}
      apiClient.saveCase(updatedCase)
        .then(() => window.dispatchEvent(new CustomEvent('alo:case-save-ok')))
        .catch((err) => window.dispatchEvent(new CustomEvent('alo:case-save-failed', {
          detail: { caseNumber: updatedCase.caseNumber, message: err?.message || '' },
        })));
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
    setPatientSubView: ui.setPatientSubView,
    setIsWhatsAppDrawerOpen: ui.setIsWhatsAppDrawerOpen,
    pendingHandoff: ui.pendingHandoff,
    setPendingHandoff: ui.setPendingHandoff,
    handleUpdateCase,
    setCases,
    userSession,
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
    patientSubView: ui.patientSubView, setPatientSubView: ui.setPatientSubView,
    selectedServiceId: ui.selectedServiceId, setSelectedServiceId: ui.setSelectedServiceId,
    handleUpdateCase, handleLogout: ui.handleLogout, handleToggleLang: ui.handleToggleLang,
    handleToggleTheme: ui.handleToggleTheme,
    handleSelectPatientSubView: ui.handleSelectPatientSubView,
    handleSelectServiceFromLanding: ui.handleSelectServiceFromLanding,
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

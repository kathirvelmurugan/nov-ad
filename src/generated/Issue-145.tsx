import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { useWorkflowStageTransitions } from './useWorkflowStageTransitions';

export type PersonaId =
  | 'patient'
  | 'triage_nurse'
  | 'general_practitioner'
  | 'specialist_physician'
  | 'pharmacist'
  | 'lab_technician'
  | 'radiologist'
  | 'billing_admin'
  | 'clinic_manager'
  | 'system_admin'
  | 'quality_auditor';

export interface ClinicalCase {
  id: string;
  patientId: string;
  status: string;
  stage: string;
  payload: Record<string, unknown>;
  updatedAt: string;
  createdAt: string;
}

export interface WorkflowStateContext {
  cases: ClinicalCase[];
  activeCase: ClinicalCase | null;
  isLoading: boolean;
  error: Error | null;
  activePersona: PersonaId;
  isRtl: boolean;
  currentLanguage: 'ar' | 'en';
  handleSetActivePersona: (persona: PersonaId) => void;
  handleUpdateCase: (caseId: string, updates: Partial<ClinicalCase>) => Promise<void>;
  handleSubmitIntake: (intakePayload: Record<string, unknown>) => Promise<void>;
  handleTransitionStage: (caseId: string, nextStage: string) => Promise<void>;
  draftContent: string;
  handleDraftChange: (content: string) => void;
}

const DRAFT_STORAGE_KEY = 'alo_draft_intake_v4.0_clean';

const RTL_PERSONAS: PersonaId[] = [
  'patient',
  'triage_nurse',
  'general_practitioner',
  'specialist_physician',
  'pharmacist',
  'lab_technician',
  'radiologist',
  'billing_admin',
  'clinic_manager',
  'system_admin',
  'quality_auditor',
];

export function useClinicalWorkflowState(): WorkflowStateContext {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [activeCase, setActiveCase] = useState<ClinicalCase | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [activePersona, setActivePersona] = useState<PersonaId>('patient');
  const [draftContent, setDraftContent] = useState<string>('');

  const isMountedRef = useRef<boolean>(true);

  const { transitionStage } = useWorkflowStageTransitions();

  const isRtl = RTL_PERSONAS.includes(activePersona);
  const currentLanguage: 'ar' | 'en' = isRtl ? 'ar' : 'en';

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadInitialCases = async () => {
      if (!isMountedRef.current) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const fetchedCases = await apiClient.fetchCases();
        
        if (!isMountedRef.current) return;

        if (!Array.isArray(fetchedCases)) {
          throw new Error('Invalid server response: expected an array of clinical cases.');
        }

        setCases(fetchedCases);
      } catch (err) {
        if (!isMountedRef.current) return;
        
        const resolvedError = err instanceof Error 
          ? err 
          : new Error('Failed to synchronize clinical workflow state with backend.');
        
        setError(resolvedError);
        setCases([]);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadInitialCases();
  }, []);

  useEffect(() => {
    try {
      const storedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (storedDraft) {
        setDraftContent(storedDraft);
      }
    } catch {
      // localStorage may be unavailable in certain environments; fail silently for drafts only.
    }
  }, []);

  const handleDraftChange = useCallback((content: string) => {
    setDraftContent(content);
    try {
      if (content.trim().length > 0) {
        localStorage.setItem(DRAFT_STORAGE_KEY, content);
      } else {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      // Draft preservation failure should not interrupt clinical workflow.
    }
  }, []);

  const clearDraft = useCallback(() => {
    setDraftContent('');
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage clearing failures.
    }
  }, []);

  const handleSetActivePersona = useCallback((persona: PersonaId) => {
    setActivePersona(persona);
  }, []);

  const handleSubmitIntake = useCallback(async (intakePayload: Record<string, unknown>) => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const createdCase = await apiClient.createCase({
        ...intakePayload,
        personaOrigin: activePersona,
        language: currentLanguage,
        direction: isRtl ? 'rtl' : 'ltr',
      });

      if (!isMountedRef.current) return;

      setCases((prevCases) => [...prevCases, createdCase]);
      setActiveCase(createdCase);
      clearDraft();
    } catch (err) {
      if (!isMountedRef.current) return;

      const resolvedError = err instanceof Error
        ? err
        : new Error('Failed to submit intake payload to backend.');
      
      setError(resolvedError);
      throw resolvedError;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [activePersona, currentLanguage, isRtl, clearDraft]);

  const handleUpdateCase = useCallback(async (caseId: string, updates: Partial<ClinicalCase>) => {
    if (!isMountedRef.current) return;

    setError(null);

    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) {
      const missingError = new Error(`Case ${caseId} not found in current workflow state.`);
      setError(missingError);
      throw missingError;
    }

    const mergedCase: ClinicalCase = {
      ...targetCase,
      ...updates,
      id: caseId,
      updatedAt: new Date().toISOString(),
    };

    try {
      const serverConfirmedCase = await apiClient.saveCase(mergedCase);

      if (!isMountedRef.current) return;

      setCases((prevCases) =>
        prevCases.map((c) => (c.id === caseId ? serverConfirmedCase : c))
      );

      if (activeCase?.id === caseId) {
        setActiveCase(serverConfirmedCase);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const resolvedError = err instanceof Error
        ? err
        : new Error('Failed to persist case updates to backend.');
      
      setError(resolvedError);
      throw resolvedError;
    }
  }, [cases, activeCase]);

  const handleTransitionStage = useCallback(async (caseId: string, nextStage: string) => {
    if (!isMountedRef.current) return;

    setError(null);

    try {
      const transitionedCase = await transitionStage(caseId, nextStage, activePersona);

      if (!isMountedRef.current) return;

      const serverConfirmedCase = await apiClient.saveCase(transitionedCase);

      if (!isMountedRef.current) return;

      setCases((prevCases) =>
        prevCases.map((c) => (c.id === caseId ? serverConfirmedCase : c))
      );

      if (activeCase?.id === caseId) {
        setActiveCase(serverConfirmedCase);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const resolvedError = err instanceof Error
        ? err
        : new Error(`Failed to transition case ${caseId} to stage ${nextStage}.`);
      
      setError(resolvedError);
      throw resolvedError;
    }
  }, [transitionStage, activePersona, activeCase]);

  return {
    cases,
    activeCase,
    isLoading,
    error,
    activePersona,
    isRtl,
    currentLanguage,
    handleSetActivePersona,
    handleUpdateCase,
    handleSubmitIntake,
    handleTransitionStage,
    draftContent,
    handleDraftChange,
  };
}
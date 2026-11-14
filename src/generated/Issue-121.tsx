import { useState, useEffect, useCallback, useRef } from 'react';

export interface SubStageFlags {
  triageComplete: boolean;
  referralApproved: boolean;
  focusQuestions: string[];
  invoiceIssued: boolean;
  secondOpinionSubmitted: boolean;
  consultantNotes: string;
  saudiEndorsement: any;
}

export interface CaseData {
  case_id: string;
  patient_id?: string;
  stage: string;
  sub_stage_flags: SubStageFlags;
  [key: string]: any;
}

export interface ClinicalWorkflowState {
  case_data: CaseData | null;
  is_syncing: boolean;
  sync_error: string | null;
  last_persisted_at: number | null;
}

const DEFAULT_SUB_STAGE_FLAGS: SubStageFlags = {
  triageComplete: false,
  referralApproved: false,
  focusQuestions: [],
  invoiceIssued: false,
  secondOpinionSubmitted: false,
  consultantNotes: '',
  saudiEndorsement: null,
};

const STORAGE_KEY_PREFIX = 'alo_doctor_workflow_v24_';

function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (
      sourceVal !== undefined &&
      typeof sourceVal === 'object' &&
      sourceVal !== null &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === 'object' &&
      targetVal !== null &&
      !Array.isArray(targetVal)
    ) {
      (output as any)[key] = deepMerge(targetVal as any, sourceVal as any);
    } else if (sourceVal !== undefined) {
      (output as any)[key] = sourceVal;
    }
  }
  return output;
}

function getStorageKey(caseId: string): string {
  return `${STORAGE_KEY_PREFIX}${caseId}`;
}

function loadPersistedState(caseId: string): CaseData | null {
  try {
    const raw = localStorage.getItem(getStorageKey(caseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CaseData;
    return {
      ...parsed,
      sub_stage_flags: {
        ...DEFAULT_SUB_STAGE_FLAGS,
        ...(parsed.sub_stage_flags || {}),
      },
    };
  } catch {
    return null;
  }
}

function persistStateLocally(caseData: CaseData): void {
  try {
    localStorage.setItem(getStorageKey(caseData.case_id), JSON.stringify(caseData));
  } catch {
    // Storage full or unavailable - fail silently in clinical context
  }
}

async function atomicBackendSync(caseData: CaseData): Promise<boolean> {
  try {
    const response = await fetch(`/api/v2/cases/${caseData.case_id}/workflow-state`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-ALO-Version': '2.4-saudi',
      },
      body: JSON.stringify({
        case_data: caseData,
        timestamp: Date.now(),
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function useClinicalWorkflowState(initialCaseId: string | null) {
  const [state, setState] = useState<ClinicalWorkflowState>({
    case_data: null,
    is_syncing: false,
    sync_error: null,
    last_persisted_at: null,
  });

  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!initialCaseId) {
      setState(prev => ({ ...prev, case_data: null }));
      return;
    }

    const persisted = loadPersistedState(initialCaseId);
    if (persisted) {
      setState(prev => ({
        ...prev,
        case_data: persisted,
        last_persisted_at: Date.now(),
      }));
    } else {
      const freshCase: CaseData = {
        case_id: initialCaseId,
        stage: 'intake',
        sub_stage_flags: { ...DEFAULT_SUB_STAGE_FLAGS },
      };
      persistStateLocally(freshCase);
      setState(prev => ({
        ...prev,
        case_data: freshCase,
        last_persisted_at: Date.now(),
      }));
    }
  }, [initialCaseId]);

  const updateSubStageFlag = useCallback(
    <K extends keyof SubStageFlags>(flag: K, value: SubStageFlags[K]) => {
      setState(prev => {
        if (!prev.case_data) return prev;

        const updatedCaseData: CaseData = {
          ...prev.case_data,
          sub_stage_flags: {
            ...prev.case_data.sub_stage_flags,
            [flag]: value,
          },
        };

        persistStateLocally(updatedCaseData);

        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        syncQueueRef.current = syncQueueRef.current.then(async () => {
          setState(s => ({ ...s, is_syncing: true, sync_error: null }));
          const success = await atomicBackendSync(updatedCaseData);
          setState(s => ({
            ...s,
            is_syncing: false,
            sync_error: success ? null : 'SYNC_FAILED',
            last_persisted_at: success ? Date.now() : s.last_persisted_at,
          }));
        });

        return {
          ...prev,
          case_data: updatedCaseData,
          is_syncing: true,
        };
      });
    },
    []
  );

  const updateCaseFields = useCallback((fields: Partial<CaseData>) => {
    setState(prev => {
      if (!prev.case_data) return prev;

      const mergedCaseData: CaseData = deepMerge(prev.case_data, fields);

      if (!mergedCaseData.sub_stage_flags) {
        mergedCaseData.sub_stage_flags = { ...DEFAULT_SUB_STAGE_FLAGS };
      } else {
        mergedCaseData.sub_stage_flags = {
          ...DEFAULT_SUB_STAGE_FLAGS,
          ...mergedCaseData.sub_stage_flags,
        };
      }

      persistStateLocally(mergedCaseData);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      syncQueueRef.current = syncQueueRef.current.then(async () => {
        setState(s => ({ ...s, is_syncing: true, sync_error: null }));
        const success = await atomicBackendSync(mergedCaseData);
        setState(s => ({
          ...s,
          is_syncing: false,
          sync_error: success ? null : 'SYNC_FAILED',
          last_persisted_at: success ? Date.now() : s.last_persisted_at,
        }));
      });

      return {
        ...prev,
        case_data: mergedCaseData,
        is_syncing: true,
      };
    });
  }, []);

  const validateMicroStep = useCallback(
    (requiredFlags: Array<keyof SubStageFlags>): boolean => {
      if (!state.case_data) return false;
      return requiredFlags.every(flag => {
        const val = state.case_data!.sub_stage_flags[flag];
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'string') return val.trim().length > 0;
        return Boolean(val);
      });
    },
    [state.case_data]
  );

  const resetSubStages = useCallback(() => {
    updateCaseFields({
      sub_stage_flags: { ...DEFAULT_SUB_STAGE_FLAGS },
    });
  }, [updateCaseFields]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    case_data: state.case_data,
    is_syncing: state.is_syncing,
    sync_error: state.sync_error,
    last_persisted_at: state.last_persisted_at,
    updateSubStageFlag,
    updateCaseFields,
    validateMicroStep,
    resetSubStages,
  };
}

export type StageTransitionConfig = {
  from: string;
  to: string;
  required_sub_stages: Array<keyof SubStageFlags>;
  allowed_personas: string[];
};

const STAGE_TRANSITION_MAP: StageTransitionConfig[] = [
  {
    from: 'intake',
    to: 'triage',
    required_sub_stages: [],
    allowed_personas: ['nurse', 'admin', 'system'],
  },
  {
    from: 'triage',
    to: 'consultation',
    required_sub_stages: ['triageComplete'],
    allowed_personas: ['nurse', 'doctor', 'system'],
  },
  {
    from: 'consultation',
    to: 'referral',
    required_sub_stages: ['focusQuestions'],
    allowed_personas: ['doctor', 'system'],
  },
  {
    from: 'referral',
    to: 'second_opinion',
    required_sub_stages: ['referralApproved'],
    allowed_personas: ['doctor', 'admin', 'system'],
  },
  {
    from: 'second_opinion',
    to: 'billing',
    required_sub_stages: ['secondOpinionSubmitted', 'consultantNotes'],
    allowed_personas: ['consultant', 'doctor', 'system'],
  },
  {
    from: 'billing',
    to: 'completed',
    required_sub_stages: ['invoiceIssued'],
    allowed_personas: ['billing', 'admin', 'system'],
  },
];

export function useWorkflowStageTransitions(
  workflowState: ReturnType<typeof useClinicalWorkflowState>,
  activePersona: string
) {
  const { case_data, updateCaseFields, validateMicroStep } = workflowState;

  const canTransition = useCallback(
    (targetStage: string): boolean => {
      if (!case_data) return false;

      const transition = STAGE_TRANSITION_MAP.find(
        t => t.from === case_data.stage && t.to === targetStage
      );

      if (!transition) return false;

      if (!transition.allowed_personas.includes(activePersona) && !transition.allowed_personas.includes('system')) {
        return false;
      }

      if (transition.required_sub_stages.length > 0) {
        return validateMicroStep(transition.required_sub_stages);
      }

      return true;
    },
    [case_data, activePersona, validateMicroStep]
  );

  const transitionTo = useCallback(
    (targetStage: string): boolean => {
      if (!canTransition(targetStage)) {
        return false;
      }

      updateCaseFields({ stage: targetStage });
      return true;
    },
    [canTransition, updateCaseFields]
  );

  const getAvailableTransitions = useCallback((): string[] => {
    if (!case_data) return [];
    return STAGE_TRANSITION_MAP
      .filter(t => t.from === case_data.stage)
      .map(t => t.to)
      .filter(to => canTransition(to));
  }, [case_data, canTransition]);

  const getMissingRequirements = useCallback(
    (targetStage: string): Array<keyof SubStageFlags> => {
      if (!case_data) return [];

      const transition = STAGE_TRANSITION_MAP.find(
        t => t.from === case_data.stage && t.to === targetStage
      );

      if (!transition) return [];

      return transition.required_sub_stages.filter(flag => {
        const val = case_data.sub_stage_flags[flag];
        if (Array.isArray(val)) return val.length === 0;
        if (typeof val === 'string') return val.trim().length === 0;
        return !val;
      });
    },
    [case_data]
  );

  const isPersonaAuthorizedForCurrentStage = useCallback((): boolean => {
    if (!case_data) return false;
    const relevantTransitions = STAGE_TRANSITION_MAP.filter(t => t.from === case_data.stage);
    if (relevantTransitions.length === 0) return true;
    return relevantTransitions.some(t => t.allowed_personas.includes(activePersona));
  }, [case_data, activePersona]);

  return {
    canTransition,
    transitionTo,
    getAvailableTransitions,
    getMissingRequirements,
    isPersonaAuthorizedForCurrentStage,
    currentStage: case_data?.stage ?? null,
  };
}
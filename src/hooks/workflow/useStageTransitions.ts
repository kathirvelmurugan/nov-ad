import { useState, useCallback, useMemo } from 'react';

export enum ClinicalStage {
  INTAKE_RECEIVED = 'INTAKE_RECEIVED',
  NURSE_CHECK = 'NURSE_CHECK',
  DOCTOR_REVIEW = 'DOCTOR_REVIEW',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  WITH_CONSULTANT = 'WITH_CONSULTANT',
  OPINION_READY = 'OPINION_READY',
  PARTNER_SERVICES = 'PARTNER_SERVICES',
  FOLLOW_UP_21_DAYS = 'FOLLOW_UP_21_DAYS',
  CLOSED = 'CLOSED',
}

export const CLINICAL_STAGE_HIERARCHY: readonly ClinicalStage[] = [
  ClinicalStage.INTAKE_RECEIVED,
  ClinicalStage.NURSE_CHECK,
  ClinicalStage.DOCTOR_REVIEW,
  ClinicalStage.AWAITING_PAYMENT,
  ClinicalStage.WITH_CONSULTANT,
  ClinicalStage.OPINION_READY,
  ClinicalStage.PARTNER_SERVICES,
  ClinicalStage.FOLLOW_UP_21_DAYS,
  ClinicalStage.CLOSED,
] as const;

export interface TransitionGuardContext {
  isAdminOverride: boolean;
  personaId: string;
  paymentCleared?: boolean;
  consultantAssigned?: boolean;
  opinionDocumented?: boolean;
  followUpCompleted?: boolean;
}

export interface StageTransitionResult {
  success: boolean;
  currentStage: ClinicalStage;
  previousStage: ClinicalStage | null;
  error?: string;
}

export interface UseStageTransitionsOptions {
  initialStage?: ClinicalStage;
  onTransitionSuccess?: (result: StageTransitionResult) => void;
  onTransitionBlocked?: (error: string, attemptedStage: ClinicalStage) => void;
}

export interface UseStageTransitionsReturn {
  currentStage: ClinicalStage;
  advanceStage: (guardContext: TransitionGuardContext) => StageTransitionResult;
  rollbackStage: (guardContext: TransitionGuardContext) => StageTransitionResult;
  canAdvanceTo: (targetStage: ClinicalStage, guardContext: TransitionGuardContext) => boolean;
  getStageIndex: (stage: ClinicalStage) => number;
  setStageDirect: (stage: ClinicalStage, guardContext: TransitionGuardContext) => StageTransitionResult;
  isTerminalStage: boolean;
  progressionPercentage: number;
}

const TRANSITION_GUARDS: Record<ClinicalStage, (ctx: TransitionGuardContext) => string | null> = {
  [ClinicalStage.INTAKE_RECEIVED]: () => null,
  [ClinicalStage.NURSE_CHECK]: () => null,
  [ClinicalStage.DOCTOR_REVIEW]: () => null,
  [ClinicalStage.AWAITING_PAYMENT]: () => null,
  [ClinicalStage.WITH_CONSULTANT]: (ctx) => {
    if (!ctx.paymentCleared && !ctx.isAdminOverride) {
      return 'PAYMENT_REQUIRED_BEFORE_CONSULTANT_ASSIGNMENT';
    }
    return null;
  },
  [ClinicalStage.OPINION_READY]: (ctx) => {
    if (!ctx.consultantAssigned && !ctx.isAdminOverride) {
      return 'CONSULTANT_MUST_BE_ASSIGNED_BEFORE_OPINION';
    }
    return null;
  },
  [ClinicalStage.PARTNER_SERVICES]: (ctx) => {
    if (!ctx.opinionDocumented && !ctx.isAdminOverride) {
      return 'OPINION_MUST_BE_DOCUMENTED_BEFORE_PARTNER_SERVICES';
    }
    return null;
  },
  [ClinicalStage.FOLLOW_UP_21_DAYS]: () => null,
  [ClinicalStage.CLOSED]: (ctx) => {
    if (!ctx.followUpCompleted && !ctx.isAdminOverride) {
      return 'FOLLOW_UP_MUST_BE_COMPLETED_BEFORE_CLOSURE';
    }
    return null;
  },
};

export function useStageTransitions(options: UseStageTransitionsOptions = {}): UseStageTransitionsReturn {
  const {
    initialStage = ClinicalStage.INTAKE_RECEIVED,
    onTransitionSuccess,
    onTransitionBlocked,
  } = options;

  const [currentStage, setCurrentStage] = useState<ClinicalStage>(initialStage);

  const getStageIndex = useCallback((stage: ClinicalStage): number => {
    const index = CLINICAL_STAGE_HIERARCHY.indexOf(stage);
    if (index === -1) {
      throw new Error(`Invalid clinical stage provided: ${stage}`);
    }
    return index;
  }, []);

  const canAdvanceTo = useCallback(
    (targetStage: ClinicalStage, guardContext: TransitionGuardContext): boolean => {
      const currentIndex = getStageIndex(currentStage);
      const targetIndex = getStageIndex(targetStage);

      if (targetIndex <= currentIndex && !guardContext.isAdminOverride) {
        return false;
      }

      if (targetIndex > currentIndex + 1 && !guardContext.isAdminOverride) {
        return false;
      }

      const guardError = TRANSITION_GUARDS[targetStage](guardContext);
      if (guardError !== null) {
        return false;
      }

      return true;
    },
    [currentStage, getStageIndex]
  );

  const advanceStage = useCallback(
    (guardContext: TransitionGuardContext): StageTransitionResult => {
      const currentIndex = getStageIndex(currentStage);
      const nextIndex = currentIndex + 1;

      if (nextIndex >= CLINICAL_STAGE_HIERARCHY.length) {
        const error = 'WORKFLOW_ALREADY_AT_TERMINAL_STAGE';
        onTransitionBlocked?.(error, currentStage);
        return {
          success: false,
          currentStage,
          previousStage: currentIndex > 0 ? CLINICAL_STAGE_HIERARCHY[currentIndex - 1] : null,
          error,
        };
      }

      const nextStage = CLINICAL_STAGE_HIERARCHY[nextIndex];
      const guardError = TRANSITION_GUARDS[nextStage](guardContext);

      if (guardError !== null) {
        onTransitionBlocked?.(guardError, nextStage);
        return {
          success: false,
          currentStage,
          previousStage: currentIndex > 0 ? CLINICAL_STAGE_HIERARCHY[currentIndex - 1] : null,
          error: guardError,
        };
      }

      const previousStage = currentStage;
      setCurrentStage(nextStage);

      const result: StageTransitionResult = {
        success: true,
        currentStage: nextStage,
        previousStage,
      };

      onTransitionSuccess?.(result);
      return result;
    },
    [currentStage, getStageIndex, onTransitionBlocked, onTransitionSuccess]
  );

  const rollbackStage = useCallback(
    (guardContext: TransitionGuardContext): StageTransitionResult => {
      if (!guardContext.isAdminOverride) {
        const error = 'REGRESSION_GUARD_BLOCKED_ADMIN_OVERRIDE_REQUIRED';
        onTransitionBlocked?.(error, currentStage);
        return {
          success: false,
          currentStage,
          previousStage: null,
          error,
        };
      }

      const currentIndex = getStageIndex(currentStage);
      const prevIndex = currentIndex - 1;

      if (prevIndex < 0) {
        const error = 'WORKFLOW_ALREADY_AT_INITIAL_STAGE';
        onTransitionBlocked?.(error, currentStage);
        return {
          success: false,
          currentStage,
          previousStage: null,
          error,
        };
      }

      const previousStage = CLINICAL_STAGE_HIERARCHY[prevIndex];
      const stageBeforePrevious = prevIndex > 0 ? CLINICAL_STAGE_HIERARCHY[prevIndex - 1] : null;

      setCurrentStage(previousStage);

      const result: StageTransitionResult = {
        success: true,
        currentStage: previousStage,
        previousStage: stageBeforePrevious,
      };

      onTransitionSuccess?.(result);
      return result;
    },
    [currentStage, getStageIndex, onTransitionBlocked, onTransitionSuccess]
  );

  const setStageDirect = useCallback(
    (stage: ClinicalStage, guardContext: TransitionGuardContext): StageTransitionResult => {
      if (!guardContext.isAdminOverride) {
        const error = 'DIRECT_STAGE_SET_REQUIRES_ADMIN_OVERRIDE';
        onTransitionBlocked?.(error, stage);
        return {
          success: false,
          currentStage,
          previousStage: null,
          error,
        };
      }

      const guardError = TRANSITION_GUARDS[stage](guardContext);
      if (guardError !== null && !guardContext.isAdminOverride) {
        onTransitionBlocked?.(guardError, stage);
        return {
          success: false,
          currentStage,
          previousStage: null,
          error: guardError,
        };
      }

      const previousStage = currentStage;
      setCurrentStage(stage);

      const result: StageTransitionResult = {
        success: true,
        currentStage: stage,
        previousStage,
      };

      onTransitionSuccess?.(result);
      return result;
    },
    [currentStage, onTransitionBlocked, onTransitionSuccess]
  );

  const isTerminalStage = useMemo(() => {
    return currentStage === ClinicalStage.CLOSED;
  }, [currentStage]);

  const progressionPercentage = useMemo(() => {
    const currentIndex = getStageIndex(currentStage);
    const totalStages = CLINICAL_STAGE_HIERARCHY.length - 1;
    return Math.round((currentIndex / totalStages) * 100);
  }, [currentStage, getStageIndex]);

  return {
    currentStage,
    advanceStage,
    rollbackStage,
    canAdvanceTo,
    getStageIndex,
    setStageDirect,
    isTerminalStage,
    progressionPercentage,
  };
}

export default useStageTransitions;
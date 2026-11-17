import { ClinicalCase, ClinicalStage } from '../types';
import { STAGE_ORDER, isCasePaid, isCaseVerified } from './workflowConstants';

/**
 * Single source of truth for stage arithmetic and stage-entry gating.
 *
 * Both the numeric `stage` field (1-9, see types.ts) and every gate decision are
 * derived from STAGE_ORDER here, so `currentStage` and `stage` can never disagree
 * and no screen needs to hand-write either one.
 */

export type StageGateError = 'PAYMENT_REQUIRED' | 'VERIFICATION_REQUIRED';

export interface StageGateOptions {
  /** Demo walkthroughs are allowed to cross gates. */
  autoDemo?: boolean;
  /** Super Admin forced jumps bypass the payment gate. */
  adminOverride?: boolean;
}

/**
 * The single cut-point where money has to be settled: the case leaves the
 * patient/payment phase and is dispatched to the international consultant.
 *
 * Everything after it is downstream of that clearance, so it must not ask again.
 * Re-checking payment at the 21-day follow-up blocked cases whose money had already
 * been collected and whose report had already been released - usually because a
 * stale verification flag was the only thing missing.
 */
export const PAYMENT_GATED_STAGES: readonly ClinicalStage[] = ['WITH_CONSULTANT'];

export const STAGE_GATE_MESSAGES: Record<StageGateError, { en: string; ar: string }> = {
  PAYMENT_REQUIRED: {
    en: 'Payment must be completed before moving past Awaiting payment.',
    ar: 'لا يمكن الانتقال إلى ما بعد السداد قبل تأكيد الدفع.',
  },
  VERIFICATION_REQUIRED: {
    en: 'ALO Coordinator must verify payment before connecting to the Indian consultant.',
    ar: 'يجب تحقق منسق رعاية ألو من السداد أولاً قبل الانتقال للاستشاري الهندي.',
  },
};

export const isKnownStage = (value: unknown): value is ClinicalStage =>
  typeof value === 'string' && (STAGE_ORDER as string[]).includes(value);

export const stageIndex = (stage: ClinicalStage): number => STAGE_ORDER.indexOf(stage);

/** 1-based position of a stage; mirrors the clinical stage numbering in types.ts. */
export const stageNumberOf = (stage: ClinicalStage): number => {
  const index = stageIndex(stage);
  return index < 0 ? 1 : index + 1;
};

/** Next stage in the chain, or null at CLOSED (never wraps around). */
export const nextStageOf = (stage: ClinicalStage): ClinicalStage | null => {
  const index = stageIndex(stage);
  return index >= 0 && index < STAGE_ORDER.length - 1 ? STAGE_ORDER[index + 1] : null;
};

/** Previous stage in the chain, or null at INTAKE_RECEIVED (never wraps around). */
export const prevStageOf = (stage: ClinicalStage): ClinicalStage | null => {
  const index = stageIndex(stage);
  return index > 0 ? STAGE_ORDER[index - 1] : null;
};

/**
 * The only gate decision in the codebase. Returns null when the transition is
 * allowed, or the blocking reason. Entering the consultant phase requires both
 * `pricing.paid` and the coordinator's verification; later stages inherit it.
 */
export const stageGateError = (
  target: ClinicalStage,
  activeCase: ClinicalCase,
  options: StageGateOptions = {}
): StageGateError | null => {
  if (options.autoDemo || options.adminOverride) return null;
  if (!PAYMENT_GATED_STAGES.includes(target)) return null;
  if (!isCasePaid(activeCase)) return 'PAYMENT_REQUIRED';
  if (!isCaseVerified(activeCase)) return 'VERIFICATION_REQUIRED';
  return null;
};

export const stageGateMessage = (error: StageGateError, lang: 'ar' | 'en'): string =>
  STAGE_GATE_MESSAGES[error][lang];

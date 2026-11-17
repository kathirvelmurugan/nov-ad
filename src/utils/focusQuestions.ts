import { ClinicalCase } from '../types';

/**
 * The Saudi treating doctor's three focus questions are the contract between the
 * doctor's referral (D07) and the international consultant's review (K05). They
 * were previously written by one screen into `treatingDoctor.focusQuestions` and
 * by another into the top-level `focusQuestions`, while each reader picked its
 * own preferred field. A question typed in one place was therefore invisible in
 * the other. Everything now goes through this module.
 *
 * Canonical storage:
 *   treatingDoctor.focusQuestions    — Arabic text
 *   treatingDoctor.focusQuestionsEn  — English text
 *   focusQuestions (top level)       — merged copy for legacy report/PDF code
 */

export type FocusTriple = [string, string, string];

export const EMPTY_FOCUS_QUESTIONS: FocusTriple = ['', '', ''];

const toTriple = (value: unknown): FocusTriple => {
  const arr = Array.isArray(value) ? value : [];
  return [0, 1, 2].map((i) => String(arr[i] ?? '').trim()) as FocusTriple;
};

/** First non-empty value per slot, so a partially translated set still shows. */
const pickPerIndex = (candidates: FocusTriple[]): FocusTriple => {
  const out: FocusTriple = ['', '', ''];
  for (let i = 0; i < 3; i++) {
    const hit = candidates.find((candidate) => candidate[i]);
    if (hit) out[i] = hit[i];
  }
  return out;
};

interface FocusSlots {
  ar: FocusTriple;
  en: FocusTriple;
  legacyTop: FocusTriple;
  legacyMetadata: FocusTriple;
}

export const focusQuestionSlots = (activeCase?: Partial<ClinicalCase> | null): FocusSlots => {
  const doctor = (activeCase?.treatingDoctor || {}) as Record<string, unknown>;
  const rawCase = (activeCase || {}) as Record<string, unknown>;
  const metadata = (rawCase.metadata || {}) as Record<string, unknown>;
  return {
    ar: toTriple(doctor.focusQuestions),
    en: toTriple(doctor.focusQuestionsEn),
    legacyTop: toTriple(rawCase.focusQuestions),
    legacyMetadata: toTriple(metadata.focusQuestions),
  };
};

export interface FocusQuestionsView {
  questions: FocusTriple;
  filled: number;
  complete: boolean;
}

/**
 * The only reader. Resolves in this order per slot: the requested language, then
 * the other language, then the legacy top-level copy, then case metadata.
 */
export const resolveFocusQuestions = (
  activeCase: Partial<ClinicalCase> | null | undefined,
  lang: 'ar' | 'en'
): FocusQuestionsView => {
  const slots = focusQuestionSlots(activeCase);
  const own = lang === 'ar' ? slots.ar : slots.en;
  const other = lang === 'ar' ? slots.en : slots.ar;
  const questions = pickPerIndex([own, other, slots.legacyTop, slots.legacyMetadata]);
  const filled = questions.filter((q) => q.length > 0).length;
  return { questions, filled, complete: filled === 3 };
};

const buildPatch = (activeCase: Partial<ClinicalCase> | null | undefined, ar: FocusTriple, en: FocusTriple): Partial<ClinicalCase> => ({
  // Legacy readers (reports, PDF export, WhatsApp timeline) still read this key.
  focusQuestions: pickPerIndex([ar, en]),
  treatingDoctor: {
    // Never invent a physician here: only the questions are being described.
    ...(activeCase?.treatingDoctor || { name: '', hospital: '', city: '', focusQuestions: EMPTY_FOCUS_QUESTIONS }),
    focusQuestions: ar,
    focusQuestionsEn: en,
  },
});

/** Edits exactly one slot of one language; the other language is left untouched. */
export const writeFocusQuestion = (
  activeCase: Partial<ClinicalCase> | null | undefined,
  lang: 'ar' | 'en',
  index: 0 | 1 | 2,
  value: string
): Partial<ClinicalCase> => {
  const slots = focusQuestionSlots(activeCase);
  const ar = [...slots.ar] as FocusTriple;
  const en = [...slots.en] as FocusTriple;
  const target = lang === 'ar' ? ar : en;
  target[index] = value;
  return buildPatch(activeCase, ar, en);
};

/** Flushes the whole visible set into the language being edited (used on approval). */
export const replaceFocusQuestions = (
  activeCase: Partial<ClinicalCase> | null | undefined,
  lang: 'ar' | 'en',
  questions: FocusTriple
): Partial<ClinicalCase> => {
  const slots = focusQuestionSlots(activeCase);
  const next = toTriple(questions);
  return lang === 'ar'
    ? buildPatch(activeCase, next, slots.en)
    : buildPatch(activeCase, slots.ar, next);
};
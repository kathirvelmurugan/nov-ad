import { ClinicalCase } from '../../types';
import { ScreenStage } from './ConsultantNavTabs';

export const checkCaseAccepted = (c: ClinicalCase): boolean =>
  Boolean(c.metadata?.consultantAccepted || c.secondOpinionSubmitted || (c.stage && c.stage >= 6));

export const checkOpinionSubmitted = (c: ClinicalCase): boolean =>
  Boolean(
    c.secondOpinionSubmitted ||
    (c.consultantOpinion && c.consultantOpinion.trim().length > 0) ||
    c.currentStage === 'OPINION_READY' ||
    (c.stage && c.stage >= 6)
  );

export const checkFollowUpEnabled = (c: ClinicalCase): boolean =>
  Boolean(
    c.currentStage === 'FOLLOW_UP_21_DAYS' ||
    (c.stage && c.stage >= 8) ||
    c.metadata?.followUpEnabled ||
    ((c.metadata?.relayedQuestions as string[]) && (c.metadata?.relayedQuestions as string[]).length > 0)
  );

export const checkCaseClosed = (c: ClinicalCase): boolean =>
  Boolean(
    c.status === 'closed' ||
    c.currentStage === 'CLOSED' ||
    c.metadata?.archived ||
    c.stage === 9 ||
    c.metadata?.pdf2Released
  );

export const getInitialConsultantScreen = (
  isCaseClosed: boolean,
  isCaseAccepted: boolean,
  isOpinionSubmitted: boolean
): ScreenStage => {
  if (isCaseClosed) return 'K10';
  if (!isCaseAccepted) return 'K01_K04';
  if (isOpinionSubmitted) return 'K06';
  return 'K05';
};

// The consultant's answers start empty on purpose. This used to hold three ready
// written answers about TAVR and prosthetic valves: a consultant who only typed
// an opinion still submitted those canned answers, and they were saved as the
// clinical reply to the Saudi doctor's questions.
export const EMPTY_FOCUS_ANSWERS: [string, string, string] = ['', '', ''];

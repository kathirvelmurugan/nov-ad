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

export const DEFAULT_FOCUS_ANSWERS: [string, string, string] = [
  'TAVR is clinically indicated given the high surgical risk and anatomical suitability on aortic root CTA.',
  'Recommend dual antiplatelet therapy (DAPT) with Aspirin 81mg and Clopidogrel 75mg for 3-6 months post-procedure.',
  'Perform transthoracic echocardiogram (TTE) at 30 days and 6 months to evaluate prosthetic valve hemodynamics.',
];

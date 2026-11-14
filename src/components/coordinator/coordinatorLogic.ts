import { ClinicalCase, PaymentMethodId } from '../../types';

export const isActionableForCoordinator = (c: ClinicalCase): boolean =>
  c.currentStage === 'AWAITING_PAYMENT' ||
  (c.currentStage === 'PARTNER_SERVICES' && !c.reportReleased) ||
  c.currentStage === 'FOLLOW_UP_21_DAYS' ||
  (c.saudiEndorsement?.status === 'endorsed' && !c.reportReleased) ||
  (Boolean(c.secondOpinionSubmitted || c.currentStage === 'OPINION_READY') && !c.reportReleased && !c.metadata?.coordinatorDispatched);

export const getTierData = (type: 'written' | 'video', isAr: boolean) =>
  type === 'written'
    ? { tier: 1, tierName: isAr ? 'رأي مكتوب فقط (Tier 1)' : 'Written opinion only (Tier 1)', baseSar: 65.22, vatSar: 9.78, totalSar: 75 }
    : { tier: 2, tierName: isAr ? 'مرئي + رأي مكتوب (Tier 2)' : 'Video + written opinion (Tier 2)', baseSar: 130.43, vatSar: 19.57, totalSar: 150 };

export const getDefaultProposedSlots = (isAr: boolean) => [
  { id: 'slot_1', time: isAr ? 'غداً، 10:00 صباحاً بتوقيت الهند' : 'Tomorrow, 10:00 AM IST' },
  { id: 'slot_2', time: isAr ? 'غداً، 02:00 ظهراً بتوقيت الهند' : 'Tomorrow, 02:00 PM IST' },
  { id: 'slot_3', time: isAr ? 'بعد غد، 11:30 صباحاً بتوقيت الهند' : 'Day After, 11:30 AM IST' },
];

export const getDefaultIncomingQuestions = (isAr: boolean) => [
  isAr ? 'هل يمكنني تناول الدواء مع الحليب؟' : 'Can I take the medication with milk?',
  isAr ? 'متى يجب أن أبدأ العلاج الطبيعي؟' : 'When should I start physical therapy?',
];

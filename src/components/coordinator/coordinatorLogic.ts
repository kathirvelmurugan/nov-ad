import { ClinicalCase, PaymentMethodId } from '../../types';
import { priceTierForType, tierNameFor } from '../../config/platformConfig';

export const isActionableForCoordinator = (c: ClinicalCase): boolean =>
  c.currentStage === 'AWAITING_PAYMENT' ||
  (c.currentStage === 'PARTNER_SERVICES' && !c.reportReleased) ||
  c.currentStage === 'FOLLOW_UP_21_DAYS' ||
  (c.saudiEndorsement?.status === 'endorsed' && !c.reportReleased) ||
  (Boolean(c.secondOpinionSubmitted || c.currentStage === 'OPINION_READY') && !c.reportReleased && !c.metadata?.coordinatorDispatched);

export const getTierData = (type: 'written' | 'video', isAr: boolean) => {
  const tier = priceTierForType(type);
  return {
    tier: tier.id,
    tierName: tierNameFor(tier, isAr),
    baseSar: tier.baseSar,
    vatSar: tier.vatSar,
    totalSar: tier.totalSar,
  };
};

export const getDefaultProposedSlots = (isAr: boolean) => [
  { id: 'slot_1', time: isAr ? 'غداً، 10:00 صباحاً بتوقيت الهند' : 'Tomorrow, 10:00 AM IST' },
  { id: 'slot_2', time: isAr ? 'غداً، 02:00 ظهراً بتوقيت الهند' : 'Tomorrow, 02:00 PM IST' },
  { id: 'slot_3', time: isAr ? 'بعد غد، 11:30 صباحاً بتوقيت الهند' : 'Day After, 11:30 AM IST' },
];

export const getDefaultIncomingQuestions = (isAr: boolean) => [
  isAr ? 'هل يمكنني تناول الدواء مع الحليب؟' : 'Can I take the medication with milk?',
  isAr ? 'متى يجب أن أبدأ العلاج الطبيعي؟' : 'When should I start physical therapy?',
];

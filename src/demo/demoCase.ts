/**
 * Demo seed for the standalone cockpit page (demo.html).
 *
 * This object never reaches the API: the demo shell keeps it in React state and
 * discards it on reload. Fields are filled in so all five device panels have
 * something realistic to show from stage 1.
 */
import { ClinicalCase, ClinicalStage } from '../types';
import {
  DEFAULT_CONSULTANT,
  DEFAULT_TREATING_DOCTOR,
  FRESH_PRIMARY_CASE,
  STAGE_ORDER,
} from '../hooks/workflowConstants';
import { defaultRailIds, priceTierForType, vatPercent } from '../config/platformConfig';

const DEMO_CONSULTANT = {
  ...DEFAULT_CONSULTANT,
  name: 'Dr. Pradeep Kumar',
  center: 'Apollo Hospitals',
  city: 'Chennai',
  specialty: 'Interventional Cardiology',
  subspecialty: 'Structural Heart Disease',
  experienceYears: 22,
  rating: 4.9,
  casesReviewed: 1840,
};

export const createDemoCase = (stage: ClinicalStage = 'INTAKE_RECEIVED'): ClinicalCase => {
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const reached = (target: ClinicalStage) => stageIndex >= STAGE_ORDER.indexOf(target);
  const videoTier = priceTierForType('video');
  const paid = reached('WITH_CONSULTANT');

  return {
    ...FRESH_PRIMARY_CASE,
    id: 'demo-case',
    caseNumber: 'ALO-DEMO-2026-001',
    patientName: 'Noura Al-Qahtani',
    patientNameAr: 'نورة القحطاني',
    patientNameEn: 'Noura Al-Qahtani',
    nationalIdMasked: '10********',
    age: 41,
    gender: 'F',
    city: 'الرياض',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    specialty: 'أمراض القلب',
    specialtyAr: 'أمراض القلب',
    specialtyEn: 'Cardiology',
    diagnosis: 'تضيق شديد في الصمام الأبهري',
    diagnosisAr: 'تضيق شديد في الصمام الأبهري',
    diagnosisEn: 'Severe aortic stenosis',
    symptoms: 'ضيق نفس عند الجهد وإغماء متكرر',
    symptomsAr: 'ضيق نفس عند الجهد وإغماء متكرر',
    symptomsEn: 'Exertional dyspnoea with recurrent syncope',
    redFlags: ['syncope', 'exertional-dyspnoea'],
    currentMedications: ['Atorvastatin 20mg', 'Metoprolol 25mg'],
    consultationType: 'video',
    currentStage: stage,
    stage: stageIndex >= 0 ? stageIndex + 1 : 1,
    treatingDoctor: DEFAULT_TREATING_DOCTOR,
    consultant: DEMO_CONSULTANT as ClinicalCase['consultant'],
    tier: videoTier.id,
    referralApproved: reached('AWAITING_PAYMENT'),
    invoiceIssued: reached('AWAITING_PAYMENT'),
    allowedPaymentMethods: reached('AWAITING_PAYMENT') ? defaultRailIds() : [],
    paymentVerified: paid,
    isCrossBorderDeidentified: paid,
    egressToken: paid ? 'ALO-DEMO-EGRESS' : undefined,
    consultantToken: paid
      ? {
          token: 'K-DEMO-TOKEN',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          otpVerified: true,
          sessionCookieActive: true,
          sessionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      : undefined,
    secondOpinionSubmitted: reached('OPINION_READY'),
    coordinatorForwardedToDoctor: reached('PARTNER_SERVICES'),
    doctorReleasedToPatient: reached('PARTNER_SERVICES'),
    pricing: {
      tier: videoTier.id,
      tierName: videoTier.tierNameEn,
      baseSar: videoTier.baseSar,
      vatPercent: vatPercent(),
      vatSar: videoTier.vatSar,
      totalSar: videoTier.totalSar,
      invoiceNumber: reached('AWAITING_PAYMENT') ? 'INV-DEMO-0001' : undefined,
      paid,
    },
    paymentDetails: paid
      ? {
          status: 'completed',
          method: 'mada',
          amount: videoTier.totalSar,
          currency: 'SAR',
          invoiceNumber: 'INV-DEMO-0001',
        }
      : undefined,
    metadata: { isDemoCase: true },
  } as ClinicalCase;
};

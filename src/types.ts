export type RoleCode = 
  | 'P'   // Patient (Salem / Fatima / etc.)
  | 'N'   // ALO nurse (Sara N.)
  | 'D'   // Saudi treating doctor (Dr. Abdullah)
  | 'C'   // ALO coordinator (Abdulrahman)
  | 'K'   // Indian consultant (Dr. Arjun / Dr. Alok)
  | 'L'   // Diagnostic Lab Partner (Alpha Labs)
  | 'H'   // Home Healthcare Partner (Sanad Health)
  | 'T'   // Travel & Medical Visa Partner (Al-Fursan)
  | 'V'   // Insurance Approvals (Tawuniya / Bupa)
  | 'HA'  // Medical Center Partner Admin (Riyadh Care)
  | 'AD'; // ALO Platform Super Admin

export interface Persona {
  code: RoleCode;
  name: string;
  title: string;
  badge: string;
  avatar: string;
  surface: 'patient-mobile' | 'portal-web' | 'consultant-mobile' | 'partner-portal' | 'admin-portal';
  isRtl: boolean;
  lang: 'ar' | 'en';
}

export type ClinicalStage = 
  | 'INTAKE_RECEIVED'       // Stage 1: P01-P14
  | 'NURSE_CHECK'           // Stage 2: N01-N07
  | 'DOCTOR_REVIEW'         // Stage 3: D01-D10
  | 'AWAITING_PAYMENT'      // Stage 4: P19-P21
  | 'WITH_CONSULTANT'       // Stage 5: K01-K07
  | 'OPINION_READY'          // Stage 6: K08, P23, P25
  | 'PARTNER_SERVICES'      // Stage 7: L01, H01, T01, V01
  | 'FOLLOW_UP_21_DAYS'     // Stage 8: P27-P29
  | 'CLOSED';               // Stage 9: AD01-HA03

export interface CaregiverProxy {
  isProxy: boolean;
  name: string;
  relationship: string;
  nationalId: string;
  phone: string;
  hasLegalConsent: boolean;
}

export interface DiagnosticAsset {
  id: string;
  name: string;
  type: 'pdf' | 'mp4' | 'dicom';
  size: string;
  verified: boolean;
  url: string;
  metrics?: Record<string, string>;
}

export interface ClinicalCase {
  id: string;
  caseNumber: string;
  patientName: string;
  patientNameAr?: string;
  patientNameEn?: string;
  nationalIdMasked: string;
  age: number;
  gender: 'M' | 'F';
  city: string;
  cityAr?: string;
  cityEn?: string;
  specialty: string;
  specialtyAr?: string;
  specialtyEn?: string;
  diagnosis: string;
  diagnosisAr?: string;
  diagnosisEn?: string;
  symptoms: string;
  symptomsAr?: string;
  symptomsEn?: string;
  caregiver?: CaregiverProxy;
  consultationType: 'written' | 'video' | 'voice';
  currentStage: ClinicalStage;
  treatingDoctor: {
    name: string;
    hospital: string;
    city: string;
    focusQuestions: [string, string, string]; // PDF Spec mandates 3 focus questions
    focusQuestionsEn?: [string, string, string];
  };
  consultant: {
    name: string;
    center: string;
    city: string;
    opinionEnglish?: string;
    opinionArabic?: string;
    proposedSlot?: string;
    audioBriefDurationSec?: number;
  };
  pricing: {
    tier: number;
    tierName: string;
    baseSar: number;
    vatPercent: number;
    vatSar: number;
    totalSar: number;
    paid: boolean;
    invoiceNumber?: string;
    tapChargeId?: string;
    tabbyInstallmentSar?: number;
  };
  files: DiagnosticAsset[];
  partnerOrders: {
    lab: { test: string; status: 'pending' | 'collected' | 'completed' };
    pharmacy: { meds: string[]; substituteAllowed: boolean; status: 'pending' | 'ready' };
    homeNurse: { area: string; visits: number; status: 'scheduled' | 'dispatched' | 'completed' };
    physio: { sessions: number; status: 'planned' | 'in_progress' | 'completed' };
  };
  consultantOpinion?: string;
  proposedCallSlot?: string;
  finalClosureNote?: string;
  coordinatorQuestions?: string;
  paymentDetails?: any;
  status?: string;
  metadata?: Record<string, any>;
  stage?: number;
  vitals?: Record<string, string>;
  piiMasked?: boolean;
  triageComplete?: boolean;
  focusQuestions?: string[];
  modality?: string;
  referralApproved?: boolean;
  invoiceIssued?: boolean;
  paymentVerified?: boolean;
  reportReleased?: boolean;
  verdicts?: string[];
  secondOpinionSubmitted?: boolean;
  consultantAnswers?: string[];
  tier?: number;
}

import { ClinicalCase, ClinicalStage, RoleCode } from '../types';

// ─── Storage Keys (v4.0 Clean Slate) ─────────────────────────────────────────
// Only browser-local UI state is persisted. Platform data (tenants, staff, pins,
// audit logs, cases) lives exclusively in Postgres.
export const ACTIVE_CASE_KEY    = 'alo_active_case_id_v4.0_clean';
export const LANG_KEY           = 'alo_lang_preference';
export const USER_SESSION_KEY   = 'alo_user_session_v4.0_clean';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UserSession {
  isAuthenticated: boolean;
  // Account id from platform_users.id. Case ownership is decided on this value;
  // name and phone matching is only a legacy fallback.
  id?: string;
  phone: string;
  personaId: string | null;
  roleCode?: RoleCode;
  hospitalId?: string;
  fullName?: string;
  isGuest: boolean;
  expiresAt: number;
  lang: 'ar' | 'en';
  token?: string;
}

export const DEFAULT_PARTNER_ORDERS = {
  lab: { test: 'None', status: 'pending' as const },
  pharmacy: { meds: [] as string[], substituteAllowed: true, status: 'pending' as const },
  homeNurse: { area: '', visits: 0, status: 'scheduled' as const },
  physio: { sessions: 0, status: 'planned' as const },
};

export const DEFAULT_CONSULTANT = {
  name: '',
  center: '',
  city: '',
  specialty: '',
  subspecialty: '',
  experienceYears: 0,
  rating: 0,
  casesReviewed: 0,
};

// Neutral placeholder — the treating doctor is only ever a real staff row from
// platform_users. It must never be a hardcoded physician identity: anything else
// resurrects a doctor that does not exist in the database.
export const DEFAULT_TREATING_DOCTOR = {
  id: 'doc-unassigned',
  name: 'Awaiting Nurse Triage Selection',
  nameEn: 'Awaiting Nurse Triage Selection',
  hospital: 'ALO Accredited Network',
  hospitalEn: 'ALO Accredited Network',
  city: '',
  cityEn: '',
  specialty: '',
  scfhsNumber: '',
  focusQuestions: ['', '', ''] as [string, string, string],
  focusQuestionsEn: ['', '', ''] as [string, string, string],
};

// ─── Clean-Slate Initial Case (Zero Pre-Filled Data) ─────────────────────────
export const FRESH_PRIMARY_CASE: ClinicalCase = {
  id: 'case-initial-01',
  caseNumber: '',
  patientName: '',
  patientNameAr: '',
  patientNameEn: '',
  nationalIdMasked: '',
  age: 0,
  gender: 'M',
  city: '',
  cityAr: '',
  cityEn: '',
  specialty: '',
  specialtyAr: '',
  specialtyEn: '',
  diagnosis: '',
  diagnosisAr: '',
  diagnosisEn: '',
  symptoms: '',
  symptomsAr: '',
  symptomsEn: '',
  redFlags: [],
  currentMedications: [],
  allergies: [],
  noKnownAllergies: false,
  noCurrentMedications: false,
  consultationType: 'written',
  currentStage: 'INTAKE_RECEIVED',
  stage: 1,
  doctorSelectionPreference: 'need_assistance',
  treatingDoctor: undefined,
  consultant: undefined,
  // Unpriced template: the invoice flow fills these from the active tier.
  pricing: {
    tier: 1,
    tierName: 'Written',
    baseSar: 0,
    vatPercent: 0,
    vatSar: 0,
    totalSar: 0,
    paid: false,
  },
  files: [],
  invoiceIssued: false,
  allowedPaymentMethods: [],
  paymentVerified: false,
  partnerOrders: DEFAULT_PARTNER_ORDERS,
  metadata: { isFreshTest: true },
};

// ─── Stage order helper ──────────────────────────────────────────────────────
export const STAGE_ORDER: ClinicalStage[] = [
  'INTAKE_RECEIVED',
  'NURSE_CHECK',
  'DOCTOR_REVIEW',
  'AWAITING_PAYMENT',
  'WITH_CONSULTANT',
  'OPINION_READY',
  'PARTNER_SERVICES',
  'FOLLOW_UP_21_DAYS',
  'CLOSED',
];

export const isCasePaid = (c: ClinicalCase) => !!c.pricing?.paid || c.paymentDetails?.status === 'completed';
export const isCaseVerified = (c: ClinicalCase) => !!c.paymentVerified || !!c.metadata?.paymentVerified;

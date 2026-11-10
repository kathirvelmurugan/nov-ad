import { ClinicalCase, ClinicalStage, RoleCode } from '../types';

// ─── Storage Keys ───────────────────────────────────────────────────────────
export const STORAGE_KEY       = 'alo_cases_v2.4';
export const ACTIVE_CASE_KEY   = 'alo_active_case_id_v2.4';
export const THEME_KEY         = 'alo_theme_v2.4';
export const LANG_KEY          = 'alo_lang_v2.4';
export const VIEW_MODE_KEY     = 'alo_view_mode_v2.4';
export const USER_SESSION_KEY  = 'alo_user_session_v2.4';
export const TENANTS_KEY       = 'alo_tenants_v2.4';
export const PLATFORM_USERS_KEY = 'alo_platform_users_v2.4';
export const CATALOGS_KEY      = 'alo_catalogs_v2.4';
export const AUDIT_LOGS_KEY    = 'alo_audit_logs_v2.4';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UserSession {
  isAuthenticated: boolean;
  phone: string;
  personaId: string | null;
  roleCode?: RoleCode;
  hospitalId?: string;
  fullName?: string;
  isGuest: boolean;
  expiresAt: number;
  lang: 'ar' | 'en';
}

// ─── Seed Data ───────────────────────────────────────────────────────────────
export const FRESH_PRIMARY_CASE: ClinicalCase = {
  id: 'case-test-01',
  caseNumber: 'ALO-2026-8812',
  patientName: 'سالم العامري',
  patientNameAr: 'سالم العامري',
  patientNameEn: 'Salem Al-Ameri',
  nationalIdMasked: '1088****92',
  age: 48,
  gender: 'M',
  city: 'الرياض (Riyadh)',
  cityAr: 'الرياض',
  cityEn: 'Riyadh',
  specialty: 'أمراض القلب والشرايين (Cardiology)',
  specialtyAr: 'أمراض القلب والشرايين',
  specialtyEn: 'Cardiology',
  diagnosis: '',
  diagnosisAr: '',
  diagnosisEn: '',
  symptoms: '',
  symptomsAr: '',
  symptomsEn: '',
  consultationType: 'video',
  currentStage: 'INTAKE_RECEIVED',
  stage: 1,
  doctorSelectionPreference: 'need_assistance',
  treatingDoctor: {
    name: 'بانتظار فرز التمريض (ألو تختار الأنسب)',
    hospital: 'شبكة المستشفيات المعتمدة (ALO Accredited Network)',
    city: 'الرياض / المملكة',
    focusQuestions: ['', '', ''],
    focusQuestionsEn: ['', '', ''],
  },
  consultant: {
    name: 'Dr. Arjun Menon',
    center: 'Apollo Hospitals',
    city: 'Chennai',
  },
  pricing: {
    tier: 2,
    tierName: 'Video',
    baseSar: 450,
    vatPercent: 15,
    vatSar: 67.5,
    totalSar: 517.5,
    paid: false,
  },
  files: [],
  invoiceIssued: false,
  allowedPaymentMethods: [],
  paymentVerified: false,
  partnerOrders: {
    lab: { test: 'Troponin & Lipid Panel', status: 'pending' },
    pharmacy: { meds: ['Atorvastatin 40mg', 'Aspirin 81mg'], substituteAllowed: false, status: 'pending' },
    homeNurse: { area: 'Riyadh - Al Malqa', visits: 2, status: 'scheduled' },
    physio: { sessions: 4, status: 'planned' },
  },
  metadata: { isFreshTest: true },
};

// ─── Stage order helper (shared by multiple handlers) ────────────────────────
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

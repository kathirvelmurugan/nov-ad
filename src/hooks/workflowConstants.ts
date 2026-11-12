import { ClinicalCase, ClinicalStage, RoleCode } from '../types';

// ─── Storage Keys (v4.0 Clean Slate) ─────────────────────────────────────────
export const STORAGE_KEY        = 'alo_cases_v4.0_clean';
export const ACTIVE_CASE_KEY    = 'alo_active_case_id_v4.0_clean';
export const THEME_KEY          = 'alo_theme_preference';
export const LANG_KEY           = 'alo_lang_preference';
export const VIEW_MODE_KEY      = 'alo_view_mode_v4.0_clean';
export const USER_SESSION_KEY   = 'alo_user_session_v4.0_clean';
export const TENANTS_KEY        = 'alo_tenants_v4.0_clean';
export const PLATFORM_USERS_KEY = 'alo_platform_users_v4.0_clean';
export const CATALOGS_KEY       = 'alo_catalogs_v4.0_clean';
export const AUDIT_LOGS_KEY     = 'alo_audit_logs_v4.0_clean';
export const USER_PINS_KEY      = 'alo_user_pins_v4.0_clean';

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

export const DEFAULT_PARTNER_ORDERS = {
  lab: { test: 'None', status: 'pending' as const },
  pharmacy: { meds: [] as string[], substituteAllowed: true, status: 'pending' as const },
  homeNurse: { area: '', visits: 0, status: 'scheduled' as const },
  physio: { sessions: 0, status: 'planned' as const },
};

export const DEFAULT_CONSULTANT = {
  name: 'Dr. Arjun Mehta',
  center: 'KIMS Heart Institute',
  city: 'Hyderabad, India',
  specialty: 'Interventional Cardiology',
  subspecialty: 'Structural Heart & TAVR',
  experienceYears: 18,
  rating: 4.9,
  casesReviewed: 340,
};

export const DEFAULT_TREATING_DOCTOR = {
  id: 'doc-001',
  name: 'د. عبدالله الشمري',
  nameEn: 'Dr. Abdullah Al-Shammari',
  hospital: 'مستشفى الملك فيصل التخصصي',
  hospitalEn: 'King Faisal Specialist Hospital',
  city: 'الرياض',
  cityEn: 'Riyadh',
  specialty: 'استشاري أمراض القلب وقسطرة الشرايين',
  scfhsNumber: 'SCFHS-2024-KSA-8821',
  focusQuestions: [
    'هل مؤشرات تضيق الصمام الأبهري تستوجب التدخل عبر القسطرة (TAVR)؟',
    'ما هو بروتوكول مضادات التخثر الموصى به بعد العملية؟',
    'ما هو الجدول الزمني الأمثل لمتابعة كفاءة الصمام بالإيكو؟',
  ] as [string, string, string],
  focusQuestionsEn: [
    'Is TAVR indicated based on aortic stenosis severity and CTA?',
    'What is the recommended post-procedure antithrombotic protocol?',
    'What is the optimal echocardiographic follow-up schedule?',
  ] as [string, string, string],
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
  consultationType: 'written',
  currentStage: 'INTAKE_RECEIVED',
  stage: 1,
  doctorSelectionPreference: 'need_assistance',
  treatingDoctor: DEFAULT_TREATING_DOCTOR,
  consultant: DEFAULT_CONSULTANT,
  pricing: {
    tier: 1,
    tierName: 'Written',
    baseSar: 0,
    vatPercent: 15,
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

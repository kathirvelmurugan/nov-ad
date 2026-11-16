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
export const DRAFT_INTAKE_KEY   = 'alo_draft_intake_v4.0_clean';

// ─── Canonical Actors ─────────────────────────────────────────────────────────
export type ActorRole = 
  | 'COORDINATOR'
  | 'DOCTOR'
  | 'CONSULTANT'
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'RECEPTION'
  | 'PATIENT'
  | 'PHARMACIST'
  | 'LAB_TECHNICIAN'
  | 'RADIOLOGIST'
  | 'NURSE';

export interface CanonicalActor {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly role: ActorRole;
  readonly personaIndex: number;
}

export const ACTORS = {
  COORDINATOR: {
    id: 'actor_coord_01',
    name: 'Emmanuel Arcon Gonzalez',
    phone: '+966500000003',
    role: 'COORDINATOR' as ActorRole,
    personaIndex: 0,
  },
  DOCTOR: {
    id: 'actor_doc_01',
    name: 'Dr. Fahad Al-Harbi',
    phone: '+966502222222',
    role: 'DOCTOR' as ActorRole,
    personaIndex: 1,
  },
  CONSULTANT: {
    id: 'actor_cons_01',
    name: 'Dr. V. Prasanth',
    phone: '+919876543210',
    role: 'CONSULTANT' as ActorRole,
    personaIndex: 2,
  },
  SUPER_ADMIN: {
    id: 'actor_superadmin_01',
    name: 'Adrian Lewis',
    phone: '+966500000001',
    role: 'SUPER_ADMIN' as ActorRole,
    personaIndex: 3,
  },
  HOSPITAL_ADMIN: {
    id: 'actor_hospadmin_01',
    name: 'David Nunez',
    phone: '+966504444444',
    role: 'HOSPITAL_ADMIN' as ActorRole,
    personaIndex: 4,
  },
  RECEPTION: {
    id: 'actor_rec_01',
    name: 'Marcus Vance',
    phone: '+966500000009',
    role: 'RECEPTION' as ActorRole,
    personaIndex: 5,
  },
} as const;

export const ALL_ACTORS: ReadonlyArray<CanonicalActor> = Object.values(ACTORS);

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
  name: 'Dr. V. Prasanth',
  center: 'Apollo Cancer & Heart Institute',
  city: 'Hyderabad, India',
  specialty: 'Interventional Cardiology & Oncology',
  subspecialty: 'Complex CAD & TAVR',
  experienceYears: 18,
  rating: 4.9,
  casesReviewed: 340,
};

export const DEFAULT_TREATING_DOCTOR = {
  id: 'doc-001',
  name: 'د. فهد الحربي',
  nameEn: 'Dr. Fahad Al-Harbi',
  hospital: 'مستشفى رعاية الرياض المعتمد',
  hospitalEn: 'Riyadh Care Medical Center',
  city: 'الرياض',
  cityEn: 'Riyadh',
  specialty: 'استشاري جراحة القلب والصدر',
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

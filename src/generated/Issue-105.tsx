import { createContext, useContext } from 'react';

// src/types.ts

export type PersonaId =
  | 'general_practitioner'
  | 'cardiologist'
  | 'pediatrician'
  | 'dermatologist'
  | 'orthopedist'
  | 'neurologist'
  | 'psychiatrist'
  | 'endocrinologist'
  | 'pulmonologist'
  | 'gastroenterologist'
  | 'emergency_physician';

export interface ClinicalCase {
  id: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string[];
  vitalSigns: Record<string, number | string>;
  physicalExam: string;
  assessment: string;
  plan: string[];
  specialty: string;
  createdAt: string;
  updatedAt: string;
  status: 'intake' | 'assessment' | 'plan' | 'reconciled' | 'closed';
  personaId: PersonaId;
  languageDirection: 'rtl' | 'ltr';
  
  // Dynamic clinical intake fields (Issue #105)
  redFlags?: string[];
  currentMedications?: string[];
  allergies?: string[];
  noKnownAllergies?: boolean;
  noCurrentMedications?: boolean;
}

export interface ReconciliationSchema {
  caseId: string;
  reconciledBy: PersonaId;
  timestamp: string;
  discrepancies: string[];
  resolved: boolean;
}

export interface AloDoctorState {
  activeCase: ClinicalCase | null;
  cases: ClinicalCase[];
  activePersona: PersonaId;
  uiLanguage: 'ar' | 'en';
  reconciliationHistory: ReconciliationSchema[];
}

// src/hooks/workflowConstants.ts

export const ALO_DOCTOR_PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
} as const;

export const FONT_FAMILY_AR = 'Cairo, sans-serif';
export const FONT_FAMILY_EN = 'Cairo, system-ui, sans-serif';

export const INITIAL_ACTIVE_CASE: ClinicalCase = {
  id: 'case_init_001',
  patientName: '',
  age: 0,
  gender: 'male',
  chiefComplaint: '',
  historyOfPresentIllness: '',
  pastMedicalHistory: [],
  vitalSigns: {},
  physicalExam: '',
  assessment: '',
  plan: [],
  specialty: 'general',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'intake',
  personaId: 'general_practitioner',
  languageDirection: 'rtl',
  redFlags: [],
  currentMedications: [],
  allergies: [],
  noKnownAllergies: false,
  noCurrentMedications: false,
};

export const SEED_CASES: ClinicalCase[] = [
  {
    id: 'seed_case_001',
    patientName: 'أحمد محمد',
    age: 45,
    gender: 'male',
    chiefComplaint: 'ألم في الصدر',
    historyOfPresentIllness: 'يعاني المريض من ألم في الصدر منذ يومين',
    pastMedicalHistory: ['ارتفاع ضغط الدم', 'السكري'],
    vitalSigns: {
      bloodPressure: '140/90',
      heartRate: 88,
      temperature: 37.0,
      oxygenSaturation: 98,
    },
    physicalExam: 'فحص طبيعي للقلب والرئتين',
    assessment: 'يحتاج إلى تقييم قلبي شامل',
    plan: ['تخطيط قلب', 'تحاليل دم شاملة', 'متابعة مع طبيب القلب'],
    specialty: 'cardiology',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'intake',
    personaId: 'cardiologist',
    languageDirection: 'rtl',
    redFlags: ['ألم صدري مجهود', 'ضيق تنفس'],
    currentMedications: ['أملوديبين 5mg', 'ميتفورمين 500mg'],
    allergies: ['بنسلين'],
    noKnownAllergies: false,
    noCurrentMedications: false,
  },
  {
    id: 'seed_case_002',
    patientName: 'Sarah Johnson',
    age: 32,
    gender: 'female',
    chiefComplaint: 'Persistent headache',
    historyOfPresentIllness: 'Patient reports bilateral tension-type headaches for the past 3 weeks.',
    pastMedicalHistory: ['Migraine without aura'],
    vitalSigns: {
      bloodPressure: '118/76',
      heartRate: 72,
      temperature: 36.8,
      oxygenSaturation: 99,
    },
    physicalExam: 'Neurological exam unremarkable. No papilledema.',
    assessment: 'Tension-type headache vs chronic migraine transformation',
    plan: ['MRI Brain without contrast', 'Start amitriptyline 10mg QHS', 'Headache diary'],
    specialty: 'neurology',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'assessment',
    personaId: 'neurologist',
    languageDirection: 'ltr',
    redFlags: [],
    currentMedications: ['Ibuprofen 400mg PRN'],
    allergies: [],
    noKnownAllergies: true,
    noCurrentMedications: false,
  },
  {
    id: 'seed_case_003',
    patientName: 'فاطمة علي',
    age: 8,
    gender: 'female',
    chiefComplaint: 'طفح جلدي وحكة',
    historyOfPresentIllness: 'طفح جلدي منتشر على الجذع والأطراف منذ ٣ أيام مع حكة شديدة',
    pastMedicalHistory: [],
    vitalSigns: {
      bloodPressure: '100/60',
      heartRate: 95,
      temperature: 37.4,
      oxygenSaturation: 99,
    },
    physicalExam: 'طفح بقعي حطاطي منتشر، لا توجد فقاعات',
    assessment: 'احتمال جدري الماء أو حساسية دوائية',
    plan: ['عزل احترازي', 'مضاد هيستامين', 'غسول كلامين'],
    specialty: 'pediatrics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'intake',
    personaId: 'pediatrician',
    languageDirection: 'rtl',
    redFlags: ['حمى مرتفعة مستمرة'],
    currentMedications: [],
    allergies: [],
    noKnownAllergies: true,
    noCurrentMedications: true,
  },
];

export const PERSONA_PROFILES: Record<PersonaId, { labelAr: string; labelEn: string; color: string }> = {
  general_practitioner: { labelAr: 'طبيب عام', labelEn: 'General Practitioner', color: ALO_DOCTOR_PALETTE.primary },
  cardiologist: { labelAr: 'طبيب قلب', labelEn: 'Cardiologist', color: ALO_DOCTOR_PALETTE.secondary },
  pediatrician: { labelAr: 'طبيب أطفال', labelEn: 'Pediatrician', color: ALO_DOCTOR_PALETTE.primary },
  dermatologist: { labelAr: 'طبيب جلدية', labelEn: 'Dermatologist', color: ALO_DOCTOR_PALETTE.secondary },
  orthopedist: { labelAr: 'طبيب عظام', labelEn: 'Orthopedist', color: ALO_DOCTOR_PALETTE.primary },
  neurologist: { labelAr: 'طبيب أعصاب', labelEn: 'Neurologist', color: ALO_DOCTOR_PALETTE.secondary },
  psychiatrist: { labelAr: 'طبيب نفسي', labelEn: 'Psychiatrist', color: ALO_DOCTOR_PALETTE.primary },
  endocrinologist: { labelAr: 'طبيب غدد صماء', labelEn: 'Endocrinologist', color: ALO_DOCTOR_PALETTE.secondary },
  pulmonologist: { labelAr: 'طبيب صدرية', labelEn: 'Pulmonologist', color: ALO_DOCTOR_PALETTE.primary },
  gastroenterologist: { labelAr: 'طبيب جهاز هضمي', labelEn: 'Gastroenterologist', color: ALO_DOCTOR_PALETTE.secondary },
  emergency_physician: { labelAr: 'طبيب طوارئ', labelEn: 'Emergency Physician', color: ALO_DOCTOR_PALETTE.whatsapp },
};

export const RECONCILIATION_DEFAULTS: Omit<ReconciliationSchema, 'caseId' | 'reconciledBy' | 'timestamp'> = {
  discrepancies: [],
  resolved: false,
};

export function createEmptyClinicalCase(personaId: PersonaId, direction: 'rtl' | 'ltr'): ClinicalCase {
  return {
    ...INITIAL_ACTIVE_CASE,
    id: `case_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    personaId,
    languageDirection: direction,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    redFlags: [],
    currentMedications: [],
    allergies: [],
    noKnownAllergies: false,
    noCurrentMedications: false,
  };
}

const AloDoctorContext = createContext<AloDoctorState>({
  activeCase: INITIAL_ACTIVE_CASE,
  cases: SEED_CASES,
  activePersona: 'general_practitioner',
  uiLanguage: 'ar',
  reconciliationHistory: [],
});

export const useAloDoctor = () => useContext(AloDoctorContext);
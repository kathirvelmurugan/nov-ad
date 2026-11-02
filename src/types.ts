export type RoleCode = 
  | 'P'   // Patient
  | 'D'   // Saudi Treating Doctor
  | 'N'   // ALO Nurse
  | 'C'   // ALO Coordinator
  | 'K'   // Indian Consultant
  | 'L'   // Lab Technician
  | 'H'   // Pharmacist
  | 'T'   // Physiotherapist
  | 'V'   // Home Nursing
  | 'HA'  // Medical Center Partner Admin
  | 'AD'; // ALO Super Admin

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
  | 'INTAKE_RECEIVED'
  | 'NURSE_CHECK'
  | 'DOCTOR_REVIEW'
  | 'AWAITING_PAYMENT'
  | 'WITH_CONSULTANT'
  | 'OPINION_READY'
  | 'PARTNER_SERVICES'
  | 'FOLLOW_UP_21_DAYS'
  | 'CLOSED';

export interface DiagnosticAsset {
  id: string;
  name: string;
  type: 'pdf' | 'mp4' | 'dicom';
  size: string;
  verified: boolean;
  url: string;
}

export interface ClinicalCase {
  id: string;
  caseNumber: string;
  patientName: string;
  nationalIdMasked: string;
  age: number;
  gender: 'M' | 'F';
  city: string;
  specialty: string;
  diagnosis: string;
  symptoms: string;
  consultationType: 'written' | 'video' | 'voice';
  currentStage: ClinicalStage;
  treatingDoctor: {
    name: string;
    hospital: string;
    city: string;
    focusQuestions: [string, string];
  };
  consultant: {
    name: string;
    center: string;
    city: string;
    opinionEnglish?: string;
    opinionArabic?: string;
    proposedSlot?: string;
  };
  pricing: {
    baseSar: number;
    vatPercent: number;
    vatSar: number;
    totalSar: number;
    paid: boolean;
    invoiceNumber?: string;
  };
  files: DiagnosticAsset[];
  partnerOrders: {
    lab: { test: string; status: 'pending' | 'collected' | 'completed' };
    pharmacy: { meds: string[]; substituteAllowed: boolean; status: 'pending' | 'ready' };
    homeNurse: { area: string; visits: number; status: 'scheduled' | 'dispatched' | 'completed' };
    physio: { sessions: number; status: 'planned' | 'in_progress' | 'completed' };
  };
}

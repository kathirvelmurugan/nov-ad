import {
  Activity,
  Building2,
  Droplets,
  FlaskConical,
  HeartPulse,
  Pill,
  Smile,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { ClinicalStage } from '../types';

/**
 * ---------------------------------------------------------------------------
 * MOBILE PATIENT HOME - SEED DATA
 * ---------------------------------------------------------------------------
 * Client brief (Nov 2026):
 *  - Medical opinion is the strongest element and sits on top.
 *  - Doctors and their specialties are shown under it.
 *  - India is the only live destination; its 12 MOU hospitals travel as one line.
 *  - Any destination that is not ready shows a flag, a name and "Coming soon".
 *    No hospital counts, no city lists, no imagery - so nothing distracts.
 *
 * PLACEHOLDER-DATA: every constant marked PLACEHOLDER below is content we do not
 * own yet. They are safe to render in a demo, but must be replaced with client
 * approved values before this page is shown externally.
 * ---------------------------------------------------------------------------
 */

export type HomeLang = 'ar' | 'en';

export interface Bilingual {
  en: string;
  ar: string;
}

/* -------------------------------------------------------------------------- */
/* 1. Heading copy (PLACEHOLDER)                                              */
/* -------------------------------------------------------------------------- */

/**
 * PLACEHOLDER - the client said the title is still to be discussed
 * ("we'll discuss the title first, which is what we are strong at").
 * Until that wording is approved we render the plain service name.
 */
export const HOME_OPINION_TITLE: Bilingual = {
  en: 'International Opinion',
  ar: 'الرأي الطبي الدولي',
};

export const HOME_OPINION_KICKER: Bilingual = {
  en: 'Supervised by your Saudi doctor',
  ar: 'بإشراف طبيبك السعودي',
};

/* -------------------------------------------------------------------------- */
/* 2. Doctors + specialties (names/centres are real, specialties INFERRED)    */
/* -------------------------------------------------------------------------- */

export interface ConsultantProfile {
  id: string;
  name: string;
  specialty: Bilingual;
  center: string;
  city: Bilingual;
}

/**
 * Names and centres already exist in the app (DoctorReviewView.tsx).
 * PLACEHOLDER - specialties were inferred from each centre; the client has not
 * supplied the consultant roster yet.
 */
export const HOME_CONSULTANTS: ConsultantProfile[] = [
  {
    id: 'arjun-mehta',
    name: 'Dr. Arjun Mehta',
    specialty: { en: 'Interventional Cardiology', ar: 'طب القلب التداخلي' },
    center: 'KIMS Heart Institute',
    city: { en: 'Hyderabad', ar: 'حيدر أباد' },
  },
  {
    id: 'suresh-rao',
    name: 'Dr. Suresh Rao',
    specialty: { en: 'Cardiothoracic Surgery', ar: 'جراحة القلب والصدر' },
    center: 'Apollo Hospitals',
    city: { en: 'Chennai', ar: 'تشيناي' },
  },
  {
    id: 'rajesh-deshmukh',
    name: 'Dr. Rajesh Deshmukh',
    specialty: { en: 'Orthopaedics & Spine', ar: 'جراحة العظام والعمود الفقري' },
    center: 'Fortis Memorial Research Institute',
    city: { en: 'Delhi', ar: 'دلهي' },
  },
  {
    id: 'alok-sharma',
    name: 'Dr. Alok Sharma',
    specialty: { en: 'Neurology', ar: 'طب الأعصاب' },
    center: 'NIMHANS / Manipal',
    city: { en: 'Bengaluru', ar: 'بنغالورو' },
  },
  {
    id: 'priya-ramachandran',
    name: 'Dr. Priya Ramachandran',
    specialty: { en: 'Medical Oncology', ar: 'الأورام الطبية' },
    center: 'Tata Memorial / Apollo Cancer Centre',
    city: { en: 'Mumbai', ar: 'مومباي' },
  },
];

/* -------------------------------------------------------------------------- */
/* 3. Destinations - India live, everything else "Coming soon"                */
/* -------------------------------------------------------------------------- */

export interface HomeDestination {
  id: string;
  name: Bilingual;
  flag: string;
  status: 'active' | 'comingSoon';
  hospitalCount?: number;
}

export const HOME_DESTINATIONS: HomeDestination[] = [
  { id: 'india', name: { en: 'India', ar: 'الهند' }, flag: '🇮🇳', status: 'active', hospitalCount: 12 },
  { id: 'thailand', name: { en: 'Thailand', ar: 'تايلاند' }, flag: '🇹🇭', status: 'comingSoon' },
];

/**
 * PLACEHOLDER - the client confirmed 12 Indian hospitals under MOU but the names
 * have not been supplied yet. Replace `name` for all 12 entries; the layout does
 * not need to change (one scrolling line on mobile).
 */
export const HOME_MOU_HOSPITALS: string[] = Array.from(
  { length: 12 },
  (_, i) => `MOU Hospital ${String(i + 1).padStart(2, '0')}`,
);

/* -------------------------------------------------------------------------- */
/* 4. Services 3x3                                                            */
/* -------------------------------------------------------------------------- */

export interface HomeServiceTile {
  id: string;
  label: Bilingual;
  icon: React.ElementType;
  tone: string;
  /** existing service id understood by App.tsx onSelectService */
  routeTo: string;
}

export const HOME_SERVICE_TILES: HomeServiceTile[] = [
  {
    id: 'doctor-appointment',
    label: { en: 'Doctor Appointment', ar: 'موعد طبيب' },
    icon: Stethoscope,
    tone: 'bg-sky-50 text-sky-600',
    routeTo: 'second-opinion',
  },
  {
    id: 'hospital-visit',
    label: { en: 'Hospital Visit', ar: 'زيارة مستشفى' },
    icon: Building2,
    tone: 'bg-violet-50 text-violet-600',
    routeTo: 'hospital-services',
  },
  {
    id: 'pharmacy',
    label: { en: 'Pharmacy', ar: 'صيدلية' },
    icon: Pill,
    tone: 'bg-teal-50 text-teal-600',
    routeTo: 'pharmacy',
  },
  {
    id: 'lab-tests',
    label: { en: 'Lab Tests', ar: 'تحاليل مخبرية' },
    icon: FlaskConical,
    tone: 'bg-indigo-50 text-indigo-600',
    routeTo: 'lab-tests',
  },
  {
    id: 'physiotherapy',
    label: { en: 'Physiotherapy', ar: 'علاج طبيعي' },
    icon: Activity,
    tone: 'bg-emerald-50 text-emerald-600',
    routeTo: 'other-services',
  },
  {
    id: 'dental',
    label: { en: 'Dental', ar: 'أسنان' },
    icon: Smile,
    tone: 'bg-amber-50 text-amber-600',
    routeTo: 'other-services',
  },
  {
    id: 'dermatology',
    label: { en: 'Dermatology & Cosmetics', ar: 'الجلدية والتجميل' },
    icon: Sparkles,
    tone: 'bg-rose-50 text-rose-600',
    routeTo: 'other-services',
  },
  {
    id: 'hijama',
    label: { en: 'Hijama (Cupping)', ar: 'الحجامة' },
    icon: Droplets,
    tone: 'bg-orange-50 text-orange-600',
    routeTo: 'other-services',
  },
  {
    id: 'home-nursing',
    label: { en: 'Home Nursing', ar: 'تمريض منزلي' },
    icon: HeartPulse,
    tone: 'bg-cyan-50 text-cyan-600',
    routeTo: 'other-services',
  },
];

/* -------------------------------------------------------------------------- */
/* 5. Ads carousel (PLACEHOLDER content, from the client mockup)              */
/* -------------------------------------------------------------------------- */

export interface HomeAd {
  id: string;
  tag: Bilingual;
  title: Bilingual;
  subtitle: Bilingual;
  cta: Bilingual;
  serviceId: string;
  isPartnerAd: boolean;
}

export const HOME_ADS: HomeAd[] = [
  {
    id: 'hba1c',
    tag: { en: 'World Diabetes Day · 14 Nov', ar: 'اليوم العالمي للسكري · ١٤ نوفمبر' },
    title: { en: 'Check your HbA1c', ar: 'اطمئن على السكر التراكمي' },
    subtitle: { en: 'Sample collected at home', ar: 'سحب العينة من منزلك' },
    cta: { en: 'Book test', ar: 'احجز التحليل' },
    serviceId: 'lab-tests',
    isPartnerAd: true,
  },
  {
    id: 'home-nursing',
    tag: { en: 'Home care', ar: 'رعاية منزلية' },
    title: { en: 'Nurse visit at home', ar: 'زيارة ممرض إلى منزلك' },
    subtitle: { en: 'Licensed nurses · Riyadh & Jeddah', ar: 'ممرضون مرخصون · الرياض وجدة' },
    cta: { en: 'Book visit', ar: 'احجز زيارة' },
    serviceId: 'other-services',
    isPartnerAd: true,
  },
  {
    id: 'second-opinion',
    tag: { en: 'ALO Doctor', ar: 'ألو دكتور' },
    title: { en: 'One opinion is not always enough', ar: 'رأي واحد لا يكفي دائماً' },
    subtitle: { en: 'Reviewed by an international consultant', ar: 'بمراجعة استشاري دولي' },
    cta: { en: 'Start request', ar: 'ابدأ طلبك' },
    serviceId: 'second-opinion',
    isPartnerAd: false,
  },
];

/* -------------------------------------------------------------------------- */
/* 6. Front-page tracker - the client's FIVE stages                           */
/* -------------------------------------------------------------------------- */

export interface HomeTrackerStage {
  key: string;
  label: Bilingual;
  /** clinical stages that satisfy this customer-facing step */
  mapsFrom: ClinicalStage[];
}

/**
 * The client asked for these five customer-facing stages on the front page.
 * The nine detailed ClinicalStage values remain the source of truth once the
 * patient taps "Track" and enters the case timeline.
 */
export const HOME_TRACKER_STAGES: HomeTrackerStage[] = [
  { key: 'received', label: { en: 'Received', ar: 'الاستلام' }, mapsFrom: ['INTAKE_RECEIVED'] },
  { key: 'nurse', label: { en: 'Nurse', ar: 'التمريض' }, mapsFrom: ['NURSE_CHECK'] },
  {
    key: 'doctor',
    label: { en: 'Doctor', ar: 'الطبيب' },
    mapsFrom: ['DOCTOR_REVIEW', 'AWAITING_PAYMENT'],
  },
  {
    key: 'results',
    label: { en: 'Results', ar: 'النتائج' },
    mapsFrom: ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES'],
  },
  {
    key: 'reply',
    label: { en: 'Reply', ar: 'الرد' },
    mapsFrom: ['FOLLOW_UP_21_DAYS', 'CLOSED'],
  },
];

/** Index (0-4) of the customer-facing step for a given clinical stage. */
export const homeTrackerIndex = (stage: ClinicalStage): number => {
  const idx = HOME_TRACKER_STAGES.findIndex((s) => s.mapsFrom.includes(stage));
  return idx === -1 ? 0 : idx;
};

/* -------------------------------------------------------------------------- */
/* 7. Trust points, offices, notifications                                    */
/* -------------------------------------------------------------------------- */

export interface HomeTrustPoint {
  id: string;
  icon: React.ElementType;
  title: Bilingual;
}

export const HOME_TRUST_POINTS: HomeTrustPoint[] = [
  {
    id: 'certified',
    icon: Stethoscope,
    title: { en: 'Certified doctors', ar: 'أطباء معتمدون' },
  },
  {
    id: 'in-ksa',
    icon: Building2,
    title: { en: 'Your file stays in Saudi Arabia', ar: 'ملفك يبقى في السعودية' },
  },
  {
    id: 'follow-up',
    icon: HeartPulse,
    title: { en: 'Follow-up to the last step', ar: 'متابعة حتى آخر خطوة' },
  },
];

/**
 * PLACEHOLDER - taken from the client mockup; not confirmed against the pilot
 * documents (which use alo@alodoctor.sa). Confirm before external release.
 */
export const HOME_OFFICES: Bilingual = {
  en: 'Riyadh · Bengaluru · New Delhi · Bangkok',
  ar: 'الرياض · بنغالورو · نيودلهي · بانكوك',
};

export const HOME_CONTACT = {
  phone: '+966 56 906 2222',
  email: 'alo@alodoctor.sa',
  handle: '@alodoctor.sa',
};

export interface HomeNotification {
  id: string;
  title: Bilingual;
  body: Bilingual;
  time: Bilingual;
}

/** PLACEHOLDER - no notifications backend exists; seeded for the demo sheet. */
export const HOME_NOTIFICATIONS: HomeNotification[] = [
  {
    id: 'n1',
    title: { en: 'Nurse check completed', ar: 'اكتمل فرز التمريض' },
    body: { en: 'Your file moved to your Saudi doctor for review.', ar: 'تم تحويل ملفك لطبيبك السعودي للمراجعة.' },
    time: { en: '2h ago', ar: 'قبل ساعتين' },
  },
  {
    id: 'n2',
    title: { en: 'Report ready', ar: 'التقرير جاهز' },
    body: { en: 'Your certified bilingual report is available.', ar: 'تقريرك المعتمد ثنائي اللغة متاح الآن.' },
    time: { en: 'Yesterday', ar: 'أمس' },
  },
  {
    id: 'n3',
    title: { en: 'Follow-up chat', ar: 'محادثة المتابعة' },
    body: { en: 'Your coordinator sent a new message.', ar: 'أرسل منسقك رسالة جديدة.' },
    time: { en: '3 days ago', ar: 'قبل ٣ أيام' },
  },
];

/** Destination labels for the sheet-rendered tabs that are not built yet. */
export const HOME_NEXT_PHASE_NOTE: Bilingual = {
  en: 'This section arrives in the next phase.',
  ar: 'هذا القسم سيصل في المرحلة القادمة.',
};

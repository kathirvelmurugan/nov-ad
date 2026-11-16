import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Building2,
  FileCheck2,
  FlaskConical,
  Pill,
  Phone,
  Video,
} from 'lucide-react';

/**
 * The single service catalogue.
 *
 * Previously the landing page kept `HEALTHCARE_SERVICES` in
 * `data/healthcareServices.ts` while patient intake kept a private
 * `INTAKE_SERVICES` array. The two lists disagreed: intake offered a voice
 * consultation that had no price tier, and the landing list offered an
 * "other services" entry intake could not select. Both now read from here.
 *
 * `consultationType: 'none'` means the service is informational only — it must
 * never produce a pricing block on a case.
 */
export type ServiceConsultationType = 'written' | 'video' | 'voice' | 'none';

export interface ServiceItem {
  id: string;
  /** Full marketing title (landing page). */
  titleAr: string;
  titleEn: string;
  /** Short label used by the compact intake service bar. */
  shortTitleAr: string;
  shortTitleEn: string;
  descAr: string;
  descEn: string;
  icon: LucideIcon;
  badgeAr: string;
  badgeEn: string;
  turnaroundAr: string;
  turnaroundEn: string;
  featuresAr: string[];
  featuresEn: string[];
  consultationType: ServiceConsultationType;
  /** Price tier charged for this service. `null` = informational only. */
  priceTierId: number | null;
  enabled: boolean;
  /** Whether the compact selection bar on patient intake lists it. */
  showInIntake: boolean;
}

export const SERVICE_CATALOG: readonly ServiceItem[] = [
  {
    id: 'second-opinion',
    titleAr: 'الرأي الطبي الثاني',
    titleEn: 'Second Medical Opinion',
    shortTitleAr: 'الرأي الطبي الثاني (مكتوب)',
    shortTitleEn: 'Second Opinion (Written)',
    descAr:
      'احصل على مراجعة شاملة لتقاريرك وفحوصاتك الطبية من استشاريين دوليين معتمدين.',
    descEn:
      'Get an expert review of your medical reports and diagnostic scans from accredited international specialists.',
    icon: FileCheck2,
    badgeAr: 'الأكثر طلباً',
    badgeEn: 'Most Popular',
    turnaroundAr: 'خلال 24-48 ساعة',
    turnaroundEn: '24-48 Hours',
    featuresAr: [
      'مراجعة دقيقة لمقاطع الأشعة ونتائج الفحوصات',
      'تقرير طبي معتمد ثنائي اللغة (عربي / إنجليزي)',
      'إشراف طبيب استشاري سعودي معتمد بالمملكة',
    ],
    featuresEn: [
      'Detailed DICOM scan & lab analysis',
      'Certified bilingual report (Arabic & English)',
      'Governed by accredited Saudi treating physician',
    ],
    consultationType: 'written',
    priceTierId: 1,
    enabled: true,
    showInIntake: true,
  },
  {
    id: 'video-consultation',
    titleAr: 'الاستشارة المرئية',
    titleEn: 'Video Consultation',
    shortTitleAr: 'الاستشارة المرئية',
    shortTitleEn: 'Video Consultation',
    descAr:
      'استشر نخبة الاستشاريين الدوليين مباشرة عبر مكالمة مرئية عالية الدقة وآمنة.',
    descEn:
      'Consult with a specialist remotely through an encrypted, high-definition clinical video session.',
    icon: Video,
    badgeAr: 'مباشر وتفاعلي',
    badgeEn: 'Live & Direct',
    turnaroundAr: 'مواعيد مرنة ومجدولة',
    turnaroundEn: 'Scheduled Slots',
    featuresAr: [
      'مكالمة مرئية مشفرة بالكامل (WebRTC آمن)',
      'ترجمة طبية إكلينيكية فورية أثناء الاستشارة',
      'خطة علاجية مكتوبة ورأي طبي نهائي معتمد',
    ],
    featuresEn: [
      'End-to-end encrypted telehealth video',
      'Live Arabic clinical translation during call',
      'Signed treatment roadmap and formal opinion',
    ],
    consultationType: 'video',
    priceTierId: 2,
    enabled: true,
    showInIntake: true,
  },
  {
    id: 'voice-consultation',
    titleAr: 'الاستشارة الصوتية',
    titleEn: 'Voice Consultation',
    shortTitleAr: 'الاستشارة الصوتية',
    shortTitleEn: 'Voice Consultation',
    descAr:
      'تحدث مباشرة مع استشاري دولي معتمد عبر مكالمة صوتية آمنة، مع ملخص طبي مكتوب بعد الجلسة.',
    descEn:
      'Speak directly with an accredited international specialist in a secure voice call, with a written clinical summary afterwards.',
    icon: Phone,
    badgeAr: 'مباشر وسريع',
    badgeEn: 'Live & Quick',
    turnaroundAr: 'مواعيد مرنة ومجدولة',
    turnaroundEn: 'Scheduled Slots',
    featuresAr: [
      'مكالمة صوتية مشفرة من الطرف إلى الطرف',
      'ترجمة طبية إكلينيكية فورية أثناء المكالمة',
      'ملخص طبي مكتوب معتمد بعد الجلسة',
    ],
    featuresEn: [
      'End-to-end encrypted voice call',
      'Live clinical translation during the call',
      'Certified written summary after the session',
    ],
    consultationType: 'voice',
    priceTierId: 2,
    enabled: true,
    showInIntake: true,
  },
  {
    id: 'lab-tests',
    titleAr: 'الفحوصات المخبرية',
    titleEn: 'Lab Tests',
    shortTitleAr: 'الفحوصات المخبرية',
    shortTitleEn: 'Lab Tests',
    descAr:
      'احجز باقات الفحوصات والتحاليل الدقيقة مع كبرى المختبرات المعتمدة بالمملكة.',
    descEn:
      'Book diagnostic tests and blood panels with trusted, accredited laboratory networks across Saudi Arabia.',
    icon: FlaskConical,
    badgeAr: 'سحب منزلي متاح',
    badgeEn: 'Home Draw Available',
    turnaroundAr: 'نفس اليوم / 24 ساعة',
    turnaroundEn: 'Same Day / 24h',
    featuresAr: [
      'خدمة سحب العينات من المنزل أو زيارة الفرع',
      'ربط مباشر وفوري بالملف الطبي للمريض',
      'مختبرات مرجعية معتمدة (ألفا والبرج وغيرها)',
    ],
    featuresEn: [
      'Convenient home phlebotomy or walk-in',
      'Direct synchronization with patient EHR',
      'Accredited reference lab network (Alpha, etc.)',
    ],
    consultationType: 'none',
    priceTierId: null,
    enabled: true,
    showInIntake: true,
  },
  {
    id: 'pharmacy',
    titleAr: 'الصيدلية والدواء',
    titleEn: 'Pharmacy',
    shortTitleAr: 'الصيدلية والدواء',
    shortTitleEn: 'Pharmacy',
    descAr:
      'اصرف أدويتك الموصوفة واحصل على استشارات الصيدلة الإكلينيكية والبدائل المعتمدة.',
    descEn:
      'Access prescribed medication, clinical pharmacy support, and generic substitution under Saudi regulations.',
    icon: Pill,
    badgeAr: 'توصيل مبرد وسريع',
    badgeEn: 'Doorstep Delivery',
    turnaroundAr: 'خلال 2-4 ساعات',
    turnaroundEn: '2-4 Hours',
    featuresAr: [
      'صرف الوصفات الطبية الإلكترونية المعتمدة',
      'تدقيق التداخلات الدوائية مع الأدوية الحالية',
      'توفير البدائل الجنيسة المكافئة (Generic Substitution)',
    ],
    featuresEn: [
      'Fulfillment of validated e-prescriptions',
      'Clinical drug-drug interaction screening',
      'Generic substitution per Saudi MOH guidelines',
    ],
    consultationType: 'none',
    priceTierId: null,
    enabled: true,
    showInIntake: true,
  },
  {
    id: 'hospital-services',
    titleAr: 'خدمات المستشفيات',
    titleEn: 'Hospital Services',
    shortTitleAr: 'خدمات المستشفيات',
    shortTitleEn: 'Hospital Services',
    descAr:
      'استكشف المستشفيات المرجعية المعتمدة والإجراءات التداخلية والتنويم.',
    descEn:
      'Explore partner hospitals and further treatment with leading Saudi medical centers and specialized departments.',
    icon: Building2,
    badgeAr: 'مستشفيات مرجعية',
    badgeEn: 'Tertiary Centers',
    turnaroundAr: 'تنسيق فوري',
    turnaroundEn: 'Priority Referral',
    featuresAr: [
      'إحالة مباشرة لكبرى المستشفيات المعتمدة بالمملكة',
      'تنسيق عمليات القلب، العظام، الأورام، والعمود الفقري',
      'متابعة شاملة للإجراءات التداخلية وقسطرة القلب',
    ],
    featuresEn: [
      'Priority fast-track to top Saudi hospitals',
      'Surgical coordination (Cardiology, Ortho, Oncology)',
      'Continuous post-procedure & inpatient care',
    ],
    consultationType: 'none',
    priceTierId: null,
    enabled: true,
    showInIntake: true,
  },
  {
    id: 'other-services',
    titleAr: 'خدمات الرعاية الصحية الأخرى',
    titleEn: 'Other Healthcare Services',
    shortTitleAr: 'خدمات أخرى',
    shortTitleEn: 'Other Services',
    descAr:
      'التمريض المنزلي، العلاج الطبيعي والتأهيلي، واستشارات ما بعد التدخل الجراحي.',
    descEn:
      'Physiotherapy, home nursing, follow-up care and comprehensive rehabilitation support.',
    icon: Activity,
    badgeAr: 'رعاية متكاملة',
    badgeEn: 'Comprehensive Care',
    turnaroundAr: 'حسب الخطة العلاجية',
    turnaroundEn: 'Custom Plan',
    featuresAr: [
      'زيارات تمريض منزلي مرخصة لمتابعة الجروح والعلامات',
      'جلسات علاج طبيعي وتأهيل حركي في المنزل',
      'نافذة متابعة سريرية مستمرة لمدة 21 يوماً',
    ],
    featuresEn: [
      'Licensed in-home nurse visits & vitals checks',
      'Post-operative physical therapy & rehab',
      'Dedicated 21-day direct clinical follow-up',
    ],
    consultationType: 'none',
    priceTierId: null,
    enabled: true,
    showInIntake: false,
  },
];

/** Lookup by id with a stable fallback to the first entry. */
export const serviceById = (id?: string): ServiceItem =>
  SERVICE_CATALOG.find((service) => service.id === id) || SERVICE_CATALOG[0];

/** Services shown on the landing page (everything enabled). */
export const landingServices = (): ServiceItem[] =>
  SERVICE_CATALOG.filter((service) => service.enabled);

/** Services selectable in the compact patient-intake bar. */
export const intakeServices = (): ServiceItem[] =>
  SERVICE_CATALOG.filter((service) => service.enabled && service.showInIntake);

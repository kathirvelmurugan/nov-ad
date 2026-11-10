import React from 'react';
import {
  FileCheck2,
  Video,
  FlaskConical,
  Pill,
  Building2,
  Activity,
} from 'lucide-react';

export interface HealthcareServiceItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: React.ElementType;
  badgeAr: string;
  badgeEn: string;
  turnaroundAr: string;
  turnaroundEn: string;
  featuresAr: string[];
  featuresEn: string[];
}

export const HEALTHCARE_SERVICES: HealthcareServiceItem[] = [
  {
    id: 'second-opinion',
    titleAr: 'الرأي الطبي الثاني',
    titleEn: 'Second Medical Opinion',
    descAr: 'احصل على مراجعة شاملة لتقاريرك وفحوصاتك الطبية من استشاريين دوليين معتمدين.',
    descEn: 'Get an expert review of your medical reports and diagnostic scans from accredited international specialists.',
    icon: FileCheck2,
    badgeAr: 'الأكثر طلباً',
    badgeEn: 'Most Popular',
    turnaroundAr: 'خلال 24-48 ساعة',
    turnaroundEn: '24-48 Hours',
    featuresAr: [
      'مراجعة دقيقة لمقاطع الأشعة ونتائج الفحوصات',
      'تقرير طبي معتمد ثنائي اللغة (عربي / إنجليزي)',
      'إشراف طبيب استشاري سعودي معتمد بالمملكة'
    ],
    featuresEn: [
      'Detailed DICOM scan & lab analysis',
      'Certified bilingual report (Arabic & English)',
      'Governed by accredited Saudi treating physician'
    ]
  },
  {
    id: 'video-consultation',
    titleAr: 'الاستشارة المرئية',
    titleEn: 'Video Consultation',
    descAr: 'استشر نخبة الاستشاريين الدوليين مباشرة عبر مكالمة مرئية عالية الدقة وآمنة.',
    descEn: 'Consult with a specialist remotely through an encrypted, high-definition clinical video session.',
    icon: Video,
    badgeAr: 'مباشر وتفاعلي',
    badgeEn: 'Live & Direct',
    turnaroundAr: 'مواعيد مرنة ومجدولة',
    turnaroundEn: 'Scheduled Slots',
    featuresAr: [
      'مكالمة مرئية مشفرة بالكامل (WebRTC آمن)',
      'ترجمة طبية إكلينيكية فورية أثناء الاستشارة',
      'خطة علاجية مكتوبة ورأي طبي نهائي معتمد'
    ],
    featuresEn: [
      'End-to-end encrypted telehealth video',
      'Live Arabic clinical translation during call',
      'Signed treatment roadmap and formal opinion'
    ]
  },
  {
    id: 'lab-tests',
    titleAr: 'الفحوصات المخبرية',
    titleEn: 'Lab Tests',
    descAr: 'احجز باقات الفحوصات والتحاليل الدقيقة مع كبرى المختبرات المعتمدة بالمملكة.',
    descEn: 'Book diagnostic tests and blood panels with trusted, accredited laboratory networks across Saudi Arabia.',
    icon: FlaskConical,
    badgeAr: 'سحب منزلي متاح',
    badgeEn: 'Home Draw Available',
    turnaroundAr: 'نفس اليوم / 24 ساعة',
    turnaroundEn: 'Same Day / 24h',
    featuresAr: [
      'خدمة سحب العينات من المنزل أو زيارة الفرع',
      'ربط مباشر وفوري بالملف الطبي للمريض',
      'مختبرات مرجعية معتمدة (ألفا والبرج وغيرها)'
    ],
    featuresEn: [
      'Convenient home phlebotomy or walk-in',
      'Direct synchronization with patient EHR',
      'Accredited reference lab network (Alpha, etc.)'
    ]
  },
  {
    id: 'pharmacy',
    titleAr: 'الصيدلية والدواء',
    titleEn: 'Pharmacy',
    descAr: 'اصرف أدويتك الموصوفة واحصل على استشارات الصيدلة الإكلينيكية والبدائل المعتمدة.',
    descEn: 'Access prescribed medication, clinical pharmacy support, and generic substitution under Saudi regulations.',
    icon: Pill,
    badgeAr: 'توصيل مبرد وسريع',
    badgeEn: 'Doorstep Delivery',
    turnaroundAr: 'خلال 2-4 ساعات',
    turnaroundEn: '2-4 Hours',
    featuresAr: [
      'صرف الوصفات الطبية الإلكترونية المعتمدة',
      'تدقيق التداخلات الدوائية مع الأدوية الحالية',
      'توفير البدائل الجنيسة المكافئة (Generic Substitution)'
    ],
    featuresEn: [
      'Fulfillment of validated e-prescriptions',
      'Clinical drug-drug interaction screening',
      'Generic substitution per Saudi MOH guidelines'
    ]
  },
  {
    id: 'hospital-services',
    titleAr: 'خدمات المستشفيات',
    titleEn: 'Hospital Services',
    descAr: 'استكشف المستشفيات المرجعية المعتمدة والإجراءات التداخلية والتنويم.',
    descEn: 'Explore partner hospitals and further treatment with leading Saudi medical centers and specialized departments.',
    icon: Building2,
    badgeAr: 'مستشفيات مرجعية',
    badgeEn: 'Tertiary Centers',
    turnaroundAr: 'تنسيق فوري',
    turnaroundEn: 'Priority Referral',
    featuresAr: [
      'إحالة مباشرة لكبرى المستشفيات المعتمدة بالمملكة',
      'تنسيق عمليات القلب، العظام، الأورام، والعمود الفقري',
      'متابعة شاملة للإجراءات التداخلية وقسطرة القلب'
    ],
    featuresEn: [
      'Priority fast-track to top Saudi hospitals',
      'Surgical coordination (Cardiology, Ortho, Oncology)',
      'Continuous post-procedure & inpatient care'
    ]
  },
  {
    id: 'other-services',
    titleAr: 'خدمات الرعاية الصحية الأخرى',
    titleEn: 'Other Healthcare Services',
    descAr: 'التمريض المنزلي، العلاج الطبيعي والتأهيلي، واستشارات ما بعد التدخل الجراحي.',
    descEn: 'Physiotherapy, home nursing, follow-up care and comprehensive rehabilitation support.',
    icon: Activity,
    badgeAr: 'رعاية متكاملة',
    badgeEn: 'Comprehensive Care',
    turnaroundAr: 'حسب الخطة العلاجية',
    turnaroundEn: 'Custom Plan',
    featuresAr: [
      'زيارات تمريض منزلي مرخصة لمتابعة الجروح والعلامات',
      'جلسات علاج طبيعي وتأهيل حركي في المنزل',
      'نافذة متابعة سريرية مستمرة لمدة 21 يوماً'
    ],
    featuresEn: [
      'Licensed in-home nurse visits & vitals checks',
      'Post-operative physical therapy & rehab',
      'Dedicated 21-day direct clinical follow-up'
    ]
  }
];

export interface FaqItem {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

export const LANDING_FAQ_ITEMS: FaqItem[] = [
  {
    qAr: 'ما هو الرأي الطبي الثاني ومتى أحتاجه؟',
    qEn: 'What is a second medical opinion and when do I need one?',
    aAr: 'الرأي الطبي الثاني هو تقييم سريري مستقل وشامل لتشخيصك وخطة علاجك من قبل استشاري عالمي متخصص ومستقل. تحتاجه عند تلقي تشخيص لمرض معقد، أو عندما يوصى بإجراء عملية جراحية كبرى، أو في حال عدم استجابة الأعراض للعلاج الحالي.',
    aEn: 'A second medical opinion is an independent, thorough review of your medical diagnosis and proposed treatment plan by an international senior specialist. It is recommended for complex diagnoses, before undergoing major surgery, or when current treatments are not yielding improvement.'
  },
  {
    qAr: 'كيف تضمن منصة ألو دكتور سرية بياناتي الطبية؟',
    qEn: 'How does ALO DOCTOR ensure the confidentiality of my medical records?',
    aAr: 'تلتزم المنصة بأعلى معايير الأمن السيبراني ونظام حماية البيانات الشخصية والبيانات الصحية في المملكة العربية السعودية (SDAIA & MOH). نقوم بحجب البيانات التعريفية الشخصية (PII Masking) وتشفير كافة المرفقات والأشعة ثلاثية الأبعاد (DICOM) قبل مشاركتها مع الاستشاري.',
    aEn: 'ALO DOCTOR strictly complies with Saudi Personal Data Protection Law (SDAIA) and Ministry of Health digital health guidelines. We apply automated PII de-identification and military-grade encryption on all diagnostic files and 3D DICOM scans prior to consultant access.'
  },
  {
    qAr: 'كم يستغرق استلام التقرير الطبي المعتمد؟',
    qEn: 'How long does it take to receive the certified medical report?',
    aAr: 'يستغرق إعداد التقرير الطبي المعتمد ثنائي اللغة ما بين 24 إلى 48 ساعة من اكتمال رفع التقارير وتأكيد الطلب. يشمل التقرير دراسة تفصيلية موقعة من الاستشاري الدولي ومصدقة من الطبيب السعودي المعالج المشرف على الحالة.',
    aEn: 'You will receive your certified bilingual report within 24 to 48 hours following document completion and intake approval. The report includes an in-depth clinical analysis signed by the international consultant and endorsed by your Saudi supervising physician.'
  },
  {
    qAr: 'هل أحتاج للسفر للخارج لتلقي الاستشارة؟',
    qEn: 'Do I need to travel abroad to receive the consultation?',
    aAr: 'لا، تتم جميع الاستشارات والدراسات عن بُعد وأنت في منزلك عبر المنصة، مع إمكانية عقد مكالمة مرئية تفاعلية مباشرة مع الاستشاري بمرافقة مترجم طبي معتمد.',
    aEn: 'No travel is required. The entire second opinion and telehealth consultation takes place securely online from the comfort of your home, with optional live video sessions featuring clinical translation.'
  },
  {
    qAr: 'ما هي خيارات السداد المتاحة؟',
    qEn: 'What payment options are available?',
    aAr: 'نوفر قنوات دفع إلكترونية آمنة ومعتمدة في المملكة، تشمل مدى (Mada)، البطاقات الائتمانية (Visa/Mastercard)، أبل باي (Apple Pay)، وخيارات التقسيط الميسر عبر تابي (Tabby) مع إصدار فاتورة ضريبية رسمية معتمدة من هيئة الزكاة والضريبة والجمارك (ZATCA).',
    aEn: 'We support all accredited Saudi digital payment methods including Mada, Visa, Mastercard, Apple Pay, and installment flexibility via Tabby, backed by ZATCA-compliant official e-invoicing.'
  }
];

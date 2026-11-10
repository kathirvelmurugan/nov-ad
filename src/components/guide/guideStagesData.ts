import { ClinicalStage } from '../../types';

export interface GuideStageItem {
  stage: ClinicalStage;
  num: number;
  titleAr: string;
  titleEn: string;
  role: string;
  descAr: string;
  descEn: string;
  keyPointsAr: string[];
  keyPointsEn: string[];
}

export const STAGES_GUIDE: GuideStageItem[] = [
  {
    stage: 'INTAKE_RECEIVED',
    num: 1,
    titleAr: 'المرحلة 1: استلام الحالة · P01–17',
    titleEn: 'Intake received · P01–17',
    role: 'P (Patient / مريض)',
    descAr: 'يقوم المريض بتعبئة بيانات الشكوى الرئيسية، اختيار التخصص، ورفع التقارير الطبية وملفات الأشعة السابقة.',
    descEn: 'Patient submits chief complaint, selects medical specialty, and uploads previous lab reports and DICOM imaging.',
    keyPointsAr: ['شاشات P01 إلى P14', 'إشعار ترحيبي عبر الواتساب W01', 'دعم الهوية الوطنية / الإقامة'],
    keyPointsEn: ['Screens P01 to P14', 'WhatsApp Welcome trigger W01', 'National ID / Iqama validation']
  },
  {
    stage: 'NURSE_CHECK',
    num: 2,
    titleAr: 'المرحلة 2: فحص التمريض · N01–07',
    titleEn: 'Nurse check · N01–07',
    role: 'N (ALO nurse)',
    descAr: 'مراجعة العلامات الحيوية، التحقق من اكتمال التاريخ المرضي، وحجب البيانات الشخصية (De-Identification) لحماية الخصوصية.',
    descEn: 'Nurse reviews vitals, verifies clinical completeness, and applies HIPAA-compliant de-identification before specialist review.',
    keyPointsAr: ['شاشات N01 إلى N07', 'إخفاء الاسم ورقم الهوية آلياً', 'فحص جاهزية صور الأشعة'],
    keyPointsEn: ['Screens N01 to N07', 'Automated PII masking', 'DICOM imaging readiness check']
  },
  {
    stage: 'DOCTOR_REVIEW',
    num: 3,
    titleAr: 'المرحلة 3: مراجعة الطبيب السعودي المعالج · D01–10',
    titleEn: 'Saudi Doctor review · D01–10',
    role: 'D (Saudi treating doctor)',
    descAr: 'يقوم الطبيب السعودي المعالج بمراجعة السجل المحجوب الهوية (SDAIA)، تدقيق الأشعة والمؤشرات (D02-D04)، اختيار الاستشاري ونمط الاستشارة (D05-D06)، صياغة 3 أسئلة سريرية، وإحالة الملف للمنسق (D10).',
    descEn: 'Saudi treating physician inspects de-identified record (SDAIA compliant), reviews scans & labs (D02–D04), selects Indian specialist & modality (D05–D06), formulates 3 focus questions, and routes to ALO coordinator (D10).',
    keyPointsAr: ['شاشات D01 إلى D10', 'سجل محجوب الهوية متوافق مع سدايا', 'تحديد الاستشاري و3 أسئلة سريرية وإحالة للمنسق'],
    keyPointsEn: ['Screens D01 to D10', 'SDAIA-compliant de-identified dossier', 'Specialist selection, 3 focus questions & route to coordinator']
  },
  {
    stage: 'AWAITING_PAYMENT',
    num: 4,
    titleAr: 'المرحلة 4: بانتظار السداد · P19–21',
    titleEn: 'Awaiting payment · C01–06 · P19–21',
    role: 'P (Patient / مريض)',
    descAr: 'سداد رسوم الاستشارة (150 ر.س للمرئي + المكتوب، 75 ر.س للمكتوب فقط) عبر بوابة Tap (مدى، Apple Pay، STC Pay، البطاقات)، مع فاتورة ZATCA الإلكترونية.',
    descEn: 'Patient pays the consultation fee (150 SAR for video + written, 75 SAR for written only) via Tap Payments (mada, Apple Pay, STC Pay, cards), with ZATCA Phase-2 QR invoice.',
    keyPointsAr: ['شاشات P19 إلى P21', 'رمز الاستجابة السريع ZATCA Phase-2', 'Tap: مدى · Apple Pay · STC Pay · البطاقات'],
    keyPointsEn: ['Screens P19 to P21', 'ZATCA Phase-2 compliant QR code', 'Tap: mada · Apple Pay · STC Pay · cards'],
  },
  {
    stage: 'WITH_CONSULTANT',
    num: 5,
    titleAr: 'المرحلة 5: لدى الاستشاري · K01–04',
    titleEn: 'With consultant · K01–04',
    role: 'K (Indian consultant)',
    descAr: 'مراجعة متخصصة من الاستشاري الهندي، فحص الأشعة عبر عارض DICOM، وإصدار رأي مكتوب · مواعيد المكالمة.',
    descEn: 'Indian consultant reviews de-identified records, inspects DICOM scans, and issues written opinion · call slots.',
    keyPointsAr: ['شاشات K01 إلى K07', 'عارض أشعة DICOM تفاعلي', 'رأي مكتوب · مواعيد المكالمة'],
    keyPointsEn: ['Screens K01 to K07', 'Interactive DICOM viewer with slice controls', 'Written opinion · call slots'],
  },
  {
    stage: 'OPINION_READY',
    num: 6,
    titleAr: 'المرحلة 6: الرأي جاهز · C08 · P25–26',
    titleEn: 'Opinion ready · C08 · P25–26',
    role: 'K + P (Consultant & Patient)',
    descAr: 'جلسة اتصال مرئي WebRTC مباشرة بين المريض والاستشاريين مع ترجمة فورية، وإصدار التقرير الطبي المعتمد ثنائي اللغة.',
    descEn: 'Live WebRTC encrypted video consultation with bilingual clinical translation, followed by download of the digitally stamped PDF report.',
    keyPointsAr: ['شاشة K08 وP25', 'اتصال فيديو WebRTC مشفر', 'تقرير طبي رسمي مختوم باللغتين'],
    keyPointsEn: ['Screens K08 & P25', 'Bilingual WebRTC video call with camera controls', 'Digitally stamped bilingual second-opinion PDF']
  },
  {
    stage: 'PARTNER_SERVICES',
    num: 7,
    titleAr: 'المرحلة 7: اعتماد وإصدار التقرير الطبي بالتوازي · C08',
    titleEn: 'Stage 7: Dual-Parallel Report Release (PDF 1) · C08',
    role: 'C (ALO Coordinator / منسق رعاية ألو)',
    descAr: 'يقوم منسق رعاية ألو بمراجعة مسودة الرأي الطبي الثاني واعتماد وإصدار التقرير الطبي المعتمد PDF 1 في نفس الوقت بالتوازي للطبيب السعودي المعالج وللمريض.',
    descEn: 'ALO coordinator reviews the finalized second opinion report and releases certified PDF 1 simultaneously to both the Saudi treating doctor and the patient in parallel.',
    keyPointsAr: ['بوابة المنسق C08', 'تسليم متزامن للطرفين (طبيب معالج ومريض)', 'تفعيل نافذة المتابعة الطبية لـ 21 يوماً'],
    keyPointsEn: ['Coordinator Portal C08', 'Synchronized dual delivery to Doctor & Patient', '21-day clinical follow-up activation']
  },
  {
    stage: 'FOLLOW_UP_21_DAYS',
    num: 8,
    titleAr: 'المرحلة 8: متابعة 21 يوماً · C09–10 · P27–29',
    titleEn: 'Follow-up 21 days · C09–10 · P27–29',
    role: 'P + C (Patient & Coordinator)',
    descAr: 'قناة متابعة تفاعلية مستمرة لمدة 21 يوماً بعد تسليم التقرير للإجابة عن أسئلة المريض ومتابعة تحسن حالته وتنسيق الفحوصات والأدوية.',
    descEn: '21-day direct asynchronous chat window between the patient, Saudi physician, and ALO coordinator for follow-up questions, labs, and rehab.',
    keyPointsAr: ['شاشات P27 إلى P29', 'محادثة مشفرة مع المنسق والطبيب', 'تنسيق الفحوصات والوصفات المنزلية'],
    keyPointsEn: ['Screens P27 to P29', 'Encrypted async messaging with coordinator & MD', 'Home lab & pharmacy fulfillment coordination']
  },
  {
    stage: 'CLOSED',
    num: 9,
    titleAr: 'المرحلة 9: إغلاق الملف · C10',
    titleEn: 'Closed · C10',
    role: 'C (ALO Coordinator)',
    descAr: 'تقييم رضا المريض النهائي (NPS)، أرشفة الملف المشفر وفق متطلبات المجلس الصحي السعودي وسدايا، وإغلاق دورة الاستشارة رسمياً.',
    descEn: 'Final patient satisfaction survey (NPS), cryptographic archival compliant with Saudi Health Council regulations, and case closure.',
    keyPointsAr: ['شاشة C10', 'استبيان تقييم الرضا NPS', 'أرشفة دائمة مشفرة'],
    keyPointsEn: ['Screen C10', 'Patient NPS satisfaction rating', 'Cryptographic permanent archival']
  }
];

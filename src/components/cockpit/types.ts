import { ClinicalCase } from '../../types';

export type CockpitRole = 
  | 'Patient'
  | 'Alo Nurse'
  | 'Saudi treating doctor'
  | 'Alo Coordinator'
  | 'Indian consultant';

export interface CockpitDeviceProps {
  activeCase: ClinicalCase;
  stageNum: number;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang: 'ar' | 'en';
}

export const TEAL_PRIMARY = '#007B6E';
export const TEAL_SECONDARY = '#00C6AE';
export const TEAL_BG = '#E6FAF7';
export const WHATSAPP_GREEN = '#25D366';

export const PROCESS_CODES: Record<CockpitRole, { code: string; desc: Record<'ar' | 'en', string> }[]> = {
  Patient: [
    { code: 'P01', desc: { ar: 'الاستقبال ورفع التقرير', en: 'Intake & Dossier Upload' } },
    { code: 'P19', desc: { ar: 'بوابة الدفع وسداد الفاتورة', en: 'Payment Checkout & Invoicing' } },
    { code: 'P25', desc: { ar: 'استشارة الفيديو والمترجم', en: 'Video Telehealth & Interpreter' } },
    { code: 'P26', desc: { ar: 'تحميل الرأي الطبي المعتمد', en: 'Certified Second Opinion PDF' } },
    { code: 'P27', desc: { ar: 'المتابعة السريرية لمدة ٢١ يوماً', en: '21-Day Clinical Follow-Up' } },
  ],
  'Alo Nurse': [
    { code: 'N01', desc: { ar: 'طابور فرز الحالات الجديدة', en: 'Triage Inbox & Verification' } },
    { code: 'N02–N03', desc: { ar: 'فحص العلامات الحيوية والشكوى', en: 'Vitals & Chief Complaint Audit' } },
    { code: 'N04', desc: { ar: 'حجب الهوية الوطنية آلياً (SDAIA)', en: 'SDAIA Automated PII Masking' } },
    { code: 'N05–N07', desc: { ar: 'تدقيق مقاطع DICOM وتوجيه الطبيب', en: 'DICOM Audit & Physician Routing' } },
  ],
  'Saudi treating doctor': [
    { code: 'D01', desc: { ar: 'مراجعة السجل المحجوب الهوية', en: 'De-identified Dossier Review' } },
    { code: 'D02–D04', desc: { ar: 'تدقيق الأشعة المقطعية والفحوصات', en: 'Scan & Lab Integrity Audit' } },
    { code: 'D05–D06', desc: { ar: 'اختيار نمط الاستشارة الدولية', en: 'Consultation Modality Selection' } },
    { code: 'D07–D09', desc: { ar: 'صياغة ٣ أسئلة تركيز سريرية', en: 'Framing 3 Clinical Questions' } },
    { code: 'D10', desc: { ar: 'اعتماد الإحالة لمنسق ألو', en: 'Approve International Referral' } },
  ],
  'Alo Coordinator': [
    { code: 'C01', desc: { ar: 'مراجعة اعتماد الطبيب السعودي', en: 'Referral Verification & Lock' } },
    { code: 'C02–C04', desc: { ar: 'تحديد الباقة وإصدار الفاتورة', en: 'Set Pricing & Issue ZATCA Bill' } },
    { code: 'C05–C06', desc: { ar: 'تأكيد السداد وتوجيه الملف للهند', en: 'Verify Payment & Dispatch Dossier' } },
    { code: 'C08', desc: { ar: 'إصدار التقرير النهائي بالتوازي', en: 'Parallel Certified Report Release' } },
  ],
  'Indian consultant': [
    { code: 'K01', desc: { ar: 'استلام وقبول الحالة الدولية', en: 'Accept International Case' } },
    { code: 'K02–K04', desc: { ar: 'فحص مقاطع DICOM ثلاثية الأبعاد', en: '3D DICOM Volumetric Review' } },
    { code: 'K05', desc: { ar: 'تحديد القرارات السريرية المنظمة', en: 'Select Structured Verdicts' } },
    { code: 'K06–K07', desc: { ar: 'الإجابة على الأسئلة وإصدار الرأي', en: 'Answer Questions & Sign Report' } },
  ],
};

export const VERDICTS_EN = [
  'Agree with diagnosis',
  'Partly agree',
  'Disagree',
  'Surgery advised',
  'Surgery not needed',
  'Change medication',
];

export const VERDICTS_AR = [
  'أوافق على التشخيص',
  'أوافق جزئياً',
  'لا أوافق',
  'يُنصح بالجراحة',
  'لا حاجة للجراحة',
  'تغيير الدواء',
];

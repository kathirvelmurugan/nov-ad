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
  onOpenReportModal?: () => void;
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
    { code: 'P26', desc: { ar: 'استلام التقرير المعتمد من طبيبك المعالج', en: 'Receive Approved Dossier from Doctor' } },
    { code: 'P27', desc: { ar: 'المتابعة السريرية لمدة ٢١ يوماً', en: '21-Day Clinical Follow-Up' } },
  ],
  'Alo Nurse': [
    { code: 'N01', desc: { ar: 'طابور فرز الحالات الجديدة', en: 'Triage Inbox & Verification' } },
    { code: 'N02–N03', desc: { ar: 'فحص العلامات الحيوية والشكوى', en: 'Vitals & Chief Complaint Audit' } },
    { code: 'N04', desc: { ar: 'التحقق من الهوية الوطنية المحلية', en: 'Domestic Identity Verification' } },
    { code: 'N05–N07', desc: { ar: 'تدقيق مقاطع DICOM وتوجيه الطبيب', en: 'DICOM Audit & Physician Routing' } },
  ],
  'Saudi treating doctor': [
    { code: 'D01', desc: { ar: 'مراجعة السجل الطبي للمريض بالرياض', en: 'Riyadh Patient Dossier Review' } },
    { code: 'D02–D04', desc: { ar: 'تدقيق الأشعة المقطعية وتعيين الاستشاري', en: 'Scan Audit & Consultant Assignment' } },
    { code: 'D05–D06', desc: { ar: 'اختيار نمط الاستشارة الدولية', en: 'Consultation Modality Selection' } },
    { code: 'D07–D09', desc: { ar: 'صياغة ٣ أسئلة تركيز سريرية', en: 'Framing 3 Clinical Questions' } },
    { code: 'D10', desc: { ar: 'اعتماد الإحالة لمنسق ألو', en: 'Approve International Referral' } },
    { code: 'D11–D12', desc: { ar: 'مصادقة التقرير الدولي وإتاحته للمريض', en: 'Approve Opinion & Release to Patient' } },
  ],
  'Alo Coordinator': [
    { code: 'C01', desc: { ar: 'مراجعة اعتماد الطبيب السعودي', en: 'Referral Verification & Lock' } },
    { code: 'C02–C04', desc: { ar: 'تحديد الباقة وإصدار الفاتورة', en: 'Set Pricing & Issue ZATCA Bill' } },
    { code: 'C05–C06', desc: { ar: 'تأكيد السداد وتجهيل الهوية وتوجيه الملف للهند', en: 'Verify Payment, Tokenize & Dispatch' } },
    { code: 'C08', desc: { ar: 'تعريب التقرير وإحالته للطبيب المعالج للمصادقة', en: 'Translate Dossier & Route to Doctor' } },
  ],
  'Indian consultant': [
    { code: 'K01', desc: { ar: 'استلام وقبول الحالة الدولية (مجهّلة الهوية)', en: 'Accept De-identified International Case' } },
    { code: 'K02–K04', desc: { ar: 'فحص مقاطع DICOM ثلاثية الأبعاد', en: '3D DICOM Volumetric Review' } },
    { code: 'K05', desc: { ar: 'إجابة الأسئلة الثلاثة وتدوين الملاحظات', en: 'Answer 3 Questions & Free-text Notes' } },
    { code: 'K06', desc: { ar: 'توقيع الرأي وإرساله لمنسق ألو للتعريب', en: 'Sign Opinion & Return to Coordinator' } },
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

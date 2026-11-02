import React, { useEffect, useId, useMemo, useState } from 'react';

export type AloLocale = 'ar' | 'en';

export type PersonaId =
  | 'treating_doctor_abdullah'
  | 'consultant_cardiology'
  | 'consultant_neurology'
  | 'consultant_radiology'
  | 'consultant_internal_medicine'
  | 'triage_nurse'
  | 'clinical_pharmacist'
  | 'lab_specialist'
  | 'patient'
  | 'family_caregiver'
  | 'quality_officer';

export interface PersonaOption {
  id: PersonaId;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
}

export interface DiagnosticScan {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  modality: string;
  capturedAt: string;
  status: 'pending_review' | 'reviewed' | 'flagged';
}

export interface ConsultantOption {
  id: string;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  available: boolean;
  slaHours: number;
}

export interface ClinicalFocusQuestion {
  id: string;
  code: string;
  textAr: string;
  textEn: string;
  required: true;
  minLength: number;
}

export interface Stage3SubmitPayload {
  caseId: string;
  personaId: PersonaId;
  consultantId: string;
  reviewedScanIds: string[];
  scanReviewSummary: string;
  clinicalFocusAnswers: Record<string, string>;
  submittedAt: string;
  slaDeadline: string;
}

export interface Stage3SaudiTreatingDoctorReviewProps {
  caseId: string;
  locale: AloLocale;
  personaId: PersonaId;
  createdAt: string;
  onLocaleChange?: (locale: AloLocale) => void;
  onPersonaChange?: (personaId: PersonaId) => void;
  scans?: DiagnosticScan[];
  consultants?: ConsultantOption[];
  focusQuestions?: ClinicalFocusQuestion[];
  initialReviewedScanIds?: string[];
  initialConsultantId?: string;
  initialSummary?: string;
  initialAnswers?: Record<string, string>;
  onSubmit: (payload: Stage3SubmitPayload) => Promise<void> | void;
  onEscalate?: (reason: string, meta: Record<string, unknown>) => void;
}

interface AloCopy {
  [key: string]: string;
}

const PALETTE = {
  primary: '#007B6E',
  accent: '#00C6AE',
  surface: '#E6FAF7',
  whatsapp: '#25D366',
  text: '#0B2E2A',
  border: '#9ED9D2',
  danger: '#B42318',
  warning: '#93370D',
  success: '#067647',
};

export const ALO_PERSONAS: PersonaOption[] = [
  {
    id: 'treating_doctor_abdullah',
    nameAr: 'د. عبدالله',
    nameEn: 'Dr. Abdullah',
    roleAr: 'الطبيب المعالج السعودي',
    roleEn: 'Saudi Treating Doctor',
  },
  {
    id: 'consultant_cardiology',
    nameAr: 'استشاري القلب',
    nameEn: 'Cardiology Consultant',
    roleAr: 'استشارية القلب',
    roleEn: 'Cardiology',
  },
  {
    id: 'consultant_neurology',
    nameAr: 'استشاري الأعصاب',
    nameEn: 'Neurology Consultant',
    roleAr: 'استشارية الأعصاب',
    roleEn: 'Neurology',
  },
  {
    id: 'consultant_radiology',
    nameAr: 'استشاري الأشعة',
    nameEn: 'Radiology Consultant',
    roleAr: 'استشارية الأشعة',
    roleEn: 'Radiology',
  },
  {
    id: 'consultant_internal_medicine',
    nameAr: 'استشاري الباطنة',
    nameEn: 'Internal Medicine Consultant',
    roleAr: 'استشارية الباطنة',
    roleEn: 'Internal Medicine',
  },
  {
    id: 'triage_nurse',
    nameAr: 'ممرض الفرز',
    nameEn: 'Triage Nurse',
    roleAr: 'الفرز السريري',
    roleEn: 'Triage',
  },
  {
    id: 'clinical_pharmacist',
    nameAr: 'الصيدلي السريري',
    nameEn: 'Clinical Pharmacist',
    roleAr: 'الصيدلة السريرية',
    roleEn: 'Clinical Pharmacy',
  },
  {
    id: 'lab_specialist',
    nameAr: 'أخصائي المختبر',
    nameEn: 'Lab Specialist',
    roleAr: 'المختبر',
    roleEn: 'Laboratory',
  },
  {
    id: 'patient',
    nameAr: 'المريض',
    nameEn: 'Patient',
    roleAr: 'ملف المريض',
    roleEn: 'Patient',
  },
  {
    id: 'family_caregiver',
    nameAr: 'مقدم الرعاية',
    nameEn: 'Family Caregiver',
    roleAr: 'رعاية الأسرة',
    roleEn: 'Caregiver',
  },
  {
    id: 'quality_officer',
    nameAr: 'مسؤول الجودة',
    nameEn: 'Quality Officer',
    roleAr: 'الحوكمة والجودة',
    roleEn: 'Quality',
  },
];

export const DEFAULT_SCANS: DiagnosticScan[] = [
  {
    id: 'scan-d01',
    code: 'D01',
    titleAr: 'أشعة مقطعية للدماغ',
    titleEn: 'CT Brain',
    modality: 'CT',
    capturedAt: '',
    status: 'pending_review',
  },
  {
    id: 'scan-d02',
    code: 'D02',
    titleAr: 'رنين مغناطيسي للدماغ',
    titleEn: 'MRI Brain',
    modality: 'MRI',
    capturedAt: '',
    status: 'pending_review',
  },
  {
    id: 'scan-d03',
    code: 'D03',
    titleAr: 'أشعة مقطعية للصدر',
    titleEn: 'CT Chest',
    modality: 'CT',
    capturedAt: '',
    status: 'pending_review',
  },
  {
    id: 'scan-d04',
    code: 'D04',
    titleAr: 'أشعة سينية للصدر',
    titleEn: 'Chest X-Ray',
    modality: 'XR',
    capturedAt: '',
    status: 'pending_review',
  },
  {
    id: 'scan-d05',
    code: 'D05',
    titleAr: 'موجات فوق صوتية للبطن',
    titleEn: 'Abdominal Ultrasound',
    modality: 'US',
    capturedAt: '',
    status: 'pending_review',
  },
  {
    id: 'scan-d06',
    code: 'D06',
    titleAr: 'أشعة مقطعية للبطن والحوض',
    titleEn: 'CT Abdomen and Pelvis',
    modality: 'CT',
    capturedAt: '',
    status: 'pending_review',
  },
  {
    id: 'scan-d07',
    code: 'D07',
    titleAr: 'رنين مغناطيسي للعمود الفقري',
    titleEn: 'MRI Spine',
    modality: 'MRI',
    capturedAt: '',
    status: 'pending_review',
  },
  {
    id: 'scan-d08',
    code: 'D08',
    titleAr: 'إيكو القلب',
    titleEn: 'Echocardiogram',
    modality: 'ECHO',
    capturedAt: '',
    status: 'pending_review',
  },
  {
    id: 'scan-d09',
    code: 'D09',
    titleAr: 'دوبلر للأطراف السفلية',
    titleEn: 'Lower Limb Doppler',
    modality: 'DOPPLER',
    capturedAt: '',
    status: 'pending_review',
  },
  {
    id: 'scan-d10',
    code: 'D10',
    titleAr: 'تصوير شامل بالرنين المغناطيسي',
    titleEn: 'Whole Body MRI',
    modality: 'MRI',
    capturedAt: '',
    status: 'pending_review',
  },
];

export const DEFAULT_CONSULTANTS: ConsultantOption[] = [
  {
    id: 'consultant-cardiology',
    nameAr: 'د. سعود الحربي',
    nameEn: 'Dr. Saud Alharbi',
    specialtyAr: 'استشاري قلب',
    specialtyEn: 'Cardiology Consultant',
    available: true,
    slaHours: 24,
  },
  {
    id: 'consultant-neurology',
    nameAr: 'د. منى القحطاني',
    nameEn: 'Dr. Muna Alqahtani',
    specialtyAr: 'استشارية أعصاب',
    specialtyEn: 'Neurology Consultant',
    available: true,
    slaHours: 24,
  },
  {
    id: 'consultant-radiology',
    nameAr: 'د. فيصل العتيبي',
    nameEn: 'Dr. Faisal Alotaibi',
    specialtyAr: 'استشاري أشعة',
    specialtyEn: 'Radiology Consultant',
    available: true,
    slaHours: 24,
  },
  {
    id: 'consultant-internal-medicine',
    nameAr: 'د. هند الشهري',
    nameEn: 'Dr. Hind Alshehri',
    specialtyAr: 'استشارية باطنة',
    specialtyEn: 'Internal Medicine Consultant',
    available: true,
    slaHours: 24,
  },
  {
    id: 'consultant-surgery',
    nameAr: 'د. خالد الدوسري',
    nameEn: 'Dr. Khalid Aldosari',
    specialtyAr: 'استشاري جراحة',
    specialtyEn: 'Surgery Consultant',
    available: false,
    slaHours: 24,
  },
];

export const DEFAULT_FOCUS_QUESTIONS: ClinicalFocusQuestion[] = [
  {
    id: 'clinical-focus-d01',
    code: 'D01',
    textAr: 'ما التشخيص السريري الحرج الذي يجب استبعاده بعد مراجعة الفحوصات؟',
    textEn: 'What critical clinical diagnosis must be excluded after reviewing the scans?',
    required: true,
    minLength: 20,
  },
  {
    id: 'clinical-focus-d02',
    code: 'D02',
    textAr: 'ما الإجراء العاجل المطلوب خلال 24 ساعة؟',
    textEn: 'What urgent action is required within 24 hours?',
    required: true,
    minLength: 20,
  },
];

const AR_COPY: AloCopy = {
  appTitle: 'ALO DOCTOR — المرحلة 3: مراجعة الطبيب المعالج السعودي',
  persona: 'ملف المستخدم',
  language: 'اللغة',
  arabic: 'العربية',
  english: 'English',
  caseId: 'رقم الحالة',
  status: 'الحالة',
  slaTitle: 'مؤشر اتفاقية مستوى الخدمة (24 ساعة)',
  slaDeadline: 'الموعد النهائي',
  remaining: 'الوقت المتبقي',
  overdue: 'متأخر — تجاوز مهلة 24 ساعة',
  escalated: 'تم التصعيد التلقائي إلى الإشراف السريري بسبب تجاوز مهلة 24 ساعة.',
  urgent: 'قريب من انتهاء المهلة — أقل من ساعتين',
  onTrack: 'ضمن المهلة',
  diagnosticScanReview: 'مراجعة الفحوصات التشخيصية (D01–D10)',
  markAllReviewed: 'تحديد جميع الفحوصات كمراجعة',
  clearAll: 'مسح التحديد',
  reviewed: 'تمت المراجعة',
  pendingReview: 'بانتظار المراجعة',
  consultantSelection: 'اختيار الطبيب الاستشاري',
  consultantRequired: 'اختيار الاستشاري إلزامي.',
  available: 'متاح',
  unavailable: 'غير متاح',
  clinicalFocusQuestions: 'السؤالان السريريان الإلزاميان',
  required: 'هذا الحقل إلزامي.',
  minLengthPrefix: 'الحد الأدنى ',
  minLengthSuffix: ' حرفًا.',
  chars: 'حرف',
  summary: 'ملخص مراجعة الفحوصات (اختياري)',
  summaryPlaceholder: 'اكتب ملاحظات الطبيب المعالج حول الفحوصات، إن وجدت.',
  submit: 'اعتماد وإرسال المرحلة 3',
  submitting: 'جارٍ الإرسال...',
  success: 'تم إرسال مراجعة المرحلة 3 بنجاح.',
  submitError: 'تعذر الإرسال. حاول مرة أخرى.',
  readOnlyNotice: 'أنت تعرض هذا السجل بشخصية مختلفة. الإجراء متاح للطبيب المعالج السعودي.',
  reviewAllScansPrefix: 'يجب مراجعة جميع الفحوصات. المتبقي: ',
  reviewAllScansSuffix: ' فحصًا.',
};

const EN_COPY: AloCopy = {
  appTitle: 'ALO DOCTOR — Stage 3: Saudi Treating Doctor Review',
  persona: 'Persona',
  language: 'Language',
  arabic: 'Arabic',
  english: 'English',
  caseId: 'Case ID',
  status: 'Status',
  slaTitle: '24-hour SLA indicator',
  slaDeadline: 'Deadline',
  remaining: 'Time remaining',
  overdue: 'Overdue — 24-hour SLA exceeded',
  escalated: 'Automatically escalated to clinical supervision because the 24-hour SLA expired.',
  urgent: 'Near SLA expiry — less than 2 hours remaining',
  onTrack: 'Within SLA',
  diagnosticScanReview: 'Diagnostic Scan Review (D01–D10)',
  markAllReviewed: 'Mark all scans reviewed',
  clearAll: 'Clear selection',
  reviewed: 'Reviewed',
  pendingReview: 'Pending review',
  consultantSelection: 'Consultant Selection',
  consultantRequired: 'Consultant selection is required.',
  available: 'Available',
  unavailable: 'Unavailable',
  clinicalFocusQuestions: 'Two Mandatory Clinical Focus Questions',
  required: 'This field is required.',
  minLengthPrefix: 'Minimum ',
  minLengthSuffix: ' characters.',
  chars: 'characters',
  summary: 'Scan review summary (optional)',
  summaryPlaceholder: 'Enter treating doctor notes about the scans, if any.',
  submit: 'Approve and submit Stage 3',
  submitting: 'Submitting...',
  success: 'Stage 3 review submitted successfully.',
  submitError: 'Submission failed. Try again.',
  readOnlyNotice: 'You are viewing this record with a different persona. Action is available to the Saudi treating doctor.',
  reviewAllScansPrefix: 'All scans must be reviewed. Remaining: ',
  reviewAllScansSuffix: ' scan(s).',
};

const SLA_MS = 24 * 60 * 60 * 1000;
const URGENT_MS = 2 * 60 * 60 * 1000;

function ensureCairoFont(): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.getElementById('alo-cairo-font')) {
    return;
  }

  const link = document.createElement('link');
  link.id = 'alo-cairo-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap';
  document.head.appendChild(link);
}

function formatDateTime(iso: string, locale: AloLocale): string {
  if (!iso) {
    return '';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const intlLocale = locale === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-US';

  try {
    return new Intl.DateTimeFormat(intlLocale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function formatCountdown(ms: number, locale: AloLocale): string {
  if (ms <= 0) {
    return locale === 'ar' ? 'متأخر' : 'Overdue';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (locale === 'ar') {
    return hours + ' ساعة ' + minutes + ' دقيقة ' + seconds + ' ثانية';
  }

  return hours + 'h ' + minutes + 'm ' + seconds + 's';
}

function createStyles(locale: AloLocale): Record<string, React.CSSProperties> {
  const align: React.CSSProperties['textAlign'] = locale === 'ar' ? 'right' : 'left';
  const direction: React.CSSProperties['direction'] = locale === 'ar' ? 'rtl' : 'ltr';

  return {
    root: {
      direction,
      textAlign: align,
      fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif",
      background: 'linear-gradient(180deg, ' + PALETTE.surface + ', #FFFFFF 260px)',
      color: PALETTE.text,
      minHeight: '100vh',
      padding: 24,
    },
    shell: {
      maxWidth: 1120,
      margin: '0 auto',
      display: 'grid',
      gap: 18,
    },
    header: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      background: '#FFFFFF',
      border: '1px solid ' + PALETTE.border,
      borderRadius: 16,
      padding: '16px 18px',
      boxShadow: '0 8px 24px rgba(0, 123, 110, 0.08)',
    },
    title: {
      margin: 0,
      fontSize: 24,
      fontWeight: 800,
      color: PALETTE.primary,
    },
    headerControls: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
      alignItems: 'center',
    },
    controlGroup: {
      display: 'grid',
      gap: 4,
    },
    label: {
      fontWeight: 700,
      fontSize: 13,
      color: PALETTE.primary,
    },
    select: {
      fontFamily: 'inherit',
      minHeight: 44,
      minWidth: 210,
      borderRadius: 12,
      border: '1px solid ' + PALETTE.border,
      padding: '0 12px',
      background: '#FFFFFF',
      color: PALETTE.text,
    },
    banner: {
      borderRadius: 14,
      padding: '12px 14px',
      fontWeight: 700,
      lineHeight: 1.7,
      border: '1px solid transparent',
    },
    infoBanner: {
      background: PALETTE.surface,
      borderColor: PALETTE.border,
      color: PALETTE.primary,
    },
    warningBanner: {
      background: '#FFFAEB',
      borderColor: '#FEDF89',
      color: PALETTE.warning,
    },
    dangerBanner: {
      background: '#FEF3F2',
      borderColor: '#FDA29B',
      color: PALETTE.danger,
    },
    successBanner: {
      background: '#ECFDF3',
      borderColor: '#A6F4C5',
      color: PALETTE.success,
    },
    card: {
      background: '#FFFFFF',
      border: '1px solid ' + PALETTE.border,
      borderRadius: 16,
      padding: 18,
      boxShadow: '0 6px 18px rgba(0, 123, 110, 0.06)',
    },
    sectionHeader: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    sectionTitle: {
      margin: 0,
      fontSize: 20,
      fontWeight: 800,
      color: PALETTE.primary,
    },
    sectionSubtle: {
      margin: 0,
      color: '#48605C',
      fontWeight: 600,
    },
    slaMeta: {
      display: 'grid',
      gap: 6,
      margin: '10px 0',
    },
    summaryItem: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
    },
    progressTrack: {
      height: 10,
      borderRadius: 999,
      background: '#D9F2EE',
      overflow: 'hidden',
      border: '1px solid ' + PALETTE.border,
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
      transition: 'width 1s linear',
    },
    rowActions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
    },
    secondaryButton: {
      minHeight: 40,
      borderRadius: 12,
      border: '1px solid ' + PALETTE.primary,
      padding: '0 12px',
      fontWeight: 700,
      fontFamily: 'inherit',
      background: '#FFFFFF',
      color: PALETTE.primary,
      cursor: 'pointer',
    },
    scanList: {
      display: 'grid',
      gap: 10,
    },
    scanItem: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      alignItems: 'flex-start',
      border: '1px solid ' + PALETTE.border,
      borderRadius: 14,
      padding: '12px 14px',
      background: '#FFFFFF',
      cursor: 'pointer',
    },
    scanItemReviewed: {
      background: PALETTE.surface,
      borderColor: PALETTE.accent,
    },
    scanMain: {
      display: 'grid',
      gap: 4,
    },
    scanCode: {
      fontWeight: 800,
      color: PALETTE.primary,
    },
    checkbox: {
      width: 20,
      height: 20,
      marginTop: 2,
      accentColor: PALETTE.primary,
    },
    reviewedChip: {
      background: PALETTE.accent,
      color: '#04332C',
      borderRadius: 999,
      padding: '4px 10px',
      fontWeight: 800,
      fontSize: 12,
      border: '1px solid ' + PALETTE.primary,
      whiteSpace: 'nowrap',
    },
    pendingChip: {
      background: '#FFFAEB',
      color: PALETTE.warning,
      borderRadius: 999,
      padding: '4px 10px',
      fontWeight: 800,
      fontSize: 12,
      border: '1px solid #FEDF89',
      whiteSpace: 'nowrap',
    },
    availableChip: {
      background: PALETTE.whatsapp,
      color: '#FFFFFF',
      borderRadius: 999,
      padding: '2px 8px',
      fontWeight: 800,
      fontSize: 12,
      display: 'inline-flex',
      width: 'fit-content',
    },
    unavailableChip: {
      background: '#F2F4F7',
      color: '#475467',
      borderRadius: 999,
      padding: '2px 8px',
      fontWeight: 800,
      fontSize: 12,
      display: 'inline-flex',
      width: 'fit-content',
    },
    fieldset: {
      border: 'none',
      padding: 0,
      margin: 0,
      display: 'grid',
      gap: 12,
    },
    legend: {
      padding: 0,
      fontWeight: 800,
      color: PALETTE.primary,
      fontSize: 18,
      marginBottom: 8,
    },
    consultantGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: 10,
    },
    consultantCard: {
      border: '2px solid ' + PALETTE.border,
      borderRadius: 14,
      padding: 12,
      background: '#FFFFFF',
      display: 'block',
    },
    consultantCardSelected: {
      border: '2px solid ' + PALETTE.primary,
      background: PALETTE.surface,
    },
    consultantCardUnavailable: {
      opacity: 0.65,
    },
    radioLabel: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
    },
    radio: {
      width: 18,
      height: 18,
      marginTop: 3,
      accentColor: PALETTE.primary,
    },
    questionCard: {
      border: '1px solid ' + PALETTE.border,
      borderRadius: 14,
      padding: 14,
      background: '#FFFFFF',
      display: 'grid',
      gap: 8,
    },
    questionLabel: {
      display: 'grid',
      gap: 6,
      fontWeight: 700,
      color: PALETTE.text,
    },
    textarea: {
      minHeight: 110,
      resize: 'vertical',
      fontFamily: 'inherit',
      borderRadius: 12,
      border: '1px solid ' + PALETTE.border,
      padding: 12,
      width: '100%',
      boxSizing: 'border-box',
      background: '#FFFFFF',
      color: PALETTE.text,
    },
    textareaError: {
      borderColor: PALETTE.danger,
    },
    helpText: {
      color: '#48605C',
      fontSize: 13,
      fontWeight: 600,
    },
    errorText: {
      color: PALETTE.danger,
      fontWeight: 700,
      margin: 0,
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      flexWrap: 'wrap',
    },
    primaryButton: {
      minHeight: 46,
      borderRadius: 12,
      border: 'none',
      padding: '0 18px',
      fontWeight: 800,
      fontFamily: 'inherit',
      background: PALETTE.primary,
      color: '#FFFFFF',
      cursor: 'pointer',
    },
  };
}

export default function Stage3SaudiTreatingDoctorReview({
  caseId,
  locale,
  personaId,
  createdAt,
  onLocaleChange,
  onPersonaChange,
  scans: providedScans,
  consultants: providedConsultants,
  focusQuestions: providedFocusQuestions,
  initialReviewedScanIds = [],
  initialConsultantId = '',
  initialSummary = '',
  initialAnswers = {},
  onSubmit,
  onEscalate,
}: Stage3SaudiTreatingDoctorReviewProps) {
  const rootId = useId();
  const copy = locale === 'ar' ? AR_COPY : EN_COPY;
  const styles = useMemo(() => createStyles(locale), [locale]);

  const [now, setNow] = useState<number>(() => Date.now());
  const [reviewedScanIds, setReviewedScanIds] = useState<string[]>(initialReviewedScanIds);
  const [consultantId, setConsultantId] = useState<string>(initialConsultantId);
  const [summary, setSummary] = useState<string>(initialSummary);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [escalated, setEscalated] = useState<boolean>(false);
  const escalatedRef = React.useRef<boolean>(false);

  const scans = useMemo<DiagnosticScan[]>(() => {
    if (providedScans && providedScans.length > 0) {
      return providedScans;
    }

    return DEFAULT_SCANS.map((scan) => ({
      ...scan,
      capturedAt: createdAt,
    }));
  }, [providedScans, createdAt]);

  const consultants = useMemo<ConsultantOption[]>(() => {
    if (providedConsultants && providedConsultants.length > 0) {
      return providedConsultants;
    }

    return DEFAULT_CONSULTANTS;
  }, [providedConsultants]);

  const focusQuestions = useMemo<ClinicalFocusQuestion[]>(() => {
    if (providedFocusQuestions && providedFocusQuestions.length >= 2) {
      return providedFocusQuestions.slice(0, 2);
    }

    return DEFAULT_FOCUS_QUESTIONS;
  }, [providedFocusQuestions]);

  const createdTime = useMemo<number>(() => {
    const parsed = new Date(createdAt).getTime();
    return Number.isFinite(parsed) ? parsed : Date.now();
  }, [createdAt]);

  const slaDeadline = useMemo<string>(() => {
    return new Date(createdTime + SLA_MS).toISOString();
  }, [createdTime]);

  const deadlineTime = useMemo<number>(() => new Date(slaDeadline).getTime(), [slaDeadline]);
  const remainingMs = deadlineTime - now;
  const isOverdue = remainingMs <= 0;
  const isUrgent = !isOverdue && remainingMs <= URGENT_MS;

  const elapsedMs = Math.max(0, now - createdTime);
  const progress = Math.min(100, Math.max(0, (elapsedMs / SLA_MS) * 100));
  const progressColor = isOverdue ? PALETTE.danger : isUrgent ? '#B54708' : PALETTE.accent;

  const selectedConsultant = consultants.find((consultant) => consultant.id === consultantId && consultant.available);
  const validReviewedScanIds = scans.filter((scan) => reviewedScanIds.includes(scan.id)).map((scan) => scan.id);
  const missingScans = scans.filter((scan) => !reviewedScanIds.includes(scan.id));

  const isTreatingDoctor = personaId === 'treating_doctor_abdullah';
  const readOnly = !isTreatingDoctor || submitState === 'success';

  useEffect(() => {
    ensureCairoFont();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setReviewedScanIds(initialReviewedScanIds);
    setConsultantId(initialConsultantId);
    setSummary(initialSummary);
    setAnswers(initialAnswers);
    setAttemptedSubmit(false);
    setSubmitState('idle');
    setSubmitError(null);
    setEscalated(false);
    escalatedRef.current = false;
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOverdue || escalatedRef.current || submitState === 'success') {
      return;
    }

    escalatedRef.current = true;
    setEscalated(true);

    if (onEscalate) {
      onEscalate('SLA_24H_EXPIRED', {
        caseId,
        personaId,
        slaDeadline,
        missingScans: missingScans.length,
      });
    }
  }, [isOverdue, submitState, caseId, personaId, slaDeadline, missingScans.length, onEscalate]);

  const toggleScan = (scanId: string): void => {
    if (readOnly) {
      return;
    }

    setReviewedScanIds((prev) => {
      if (prev.includes(scanId)) {
        return prev.filter((id) => id !== scanId);
      }

      return [...prev, scanId];
    });
  };

  const markAllScansReviewed = (): void => {
    if (readOnly) {
      return;
    }

    setReviewedScanIds(scans.map((scan) => scan.id));
  };

  const clearAllScans = (): void => {
    if (readOnly) {
      return;
    }

    setReviewedScanIds([]);
  };

  const handleAnswerChange = (questionId: string, value: string): void => {
    if (readOnly) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const consultantError = selectedConsultant ? null : copy.consultantRequired;
  const scanError =
    scans.length > 0 && missingScans.length > 0
      ? copy.reviewAllScansPrefix + missingScans.length + copy.reviewAllScansSuffix
      : null;

  const focusErrors = focusQuestions.flatMap((question) => {
    const value = (answers[question.id] || '').trim();

    if (!value) {
      return [{ id: question.id, message: copy.required }];
    }

    if (value.length < question.minLength) {
      return [
        {
          id: question.id,
          message: copy.minLengthPrefix + question.minLength + copy.minLengthSuffix,
        },
      ];
    }

    return [];
  });

  const isValid = !consultantError && !scanError && focusErrors.length === 0;

  const errorSummary: string[] = [];
  if (attemptedSubmit) {
    if (consultantError) {
      errorSummary.push(consultantError);
    }

    if (scanError) {
      errorSummary.push(scanError);
    }

    focusErrors.forEach((error) => {
      errorSummary.push(error.message);
    });
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (!isValid || readOnly) {
      if (typeof document !== 'undefined') {
        const firstFocusErrorId = focusErrors.length > 0 ? rootId + '-focus-' + focusErrors[0].id : undefined;
        const targetId = consultantError
          ? rootId + '-consultant-group'
          : scanError
            ? rootId + '-scan-group'
            : firstFocusErrorId;

        if (targetId) {
          const element = document.getElementById(targetId);
          if (element) {
            element.focus();
          }
        }
      }

      return;
    }

    setSubmitState('submitting');
    setSubmitError(null);

    const clinicalFocusAnswers = focusQuestions.reduce<Record<string, string>>((acc, question) => {
      acc[question.id] = (answers[question.id] || '').trim();
      return acc;
    }, {});

    const payload: Stage3SubmitPayload = {
      caseId,
      personaId,
      consultantId,
      reviewedScanIds: validReviewedScanIds,
      scanReviewSummary: summary.trim(),
      clinicalFocusAnswers,
      submittedAt: new Date().toISOString(),
      slaDeadline,
    };

    try {
      await Promise.resolve(onSubmit(payload));
      setSubmitState('success');
    } catch (error) {
      setSubmitState('error');
      setSubmitError(error instanceof Error ? error.message : copy.submitError);
    }
  };

  const globalStyles =
    '.alo-stage3 :focus-visible{outline:3px solid #00C6AE;outline-offset:2px;}' +
    '.alo-stage3 button:disabled{cursor:not-allowed;opacity:.65;}' +
    '.alo-stage3 input:disabled,.alo-stage3 textarea:disabled,.alo-stage3 select:disabled{background:#F2F4F7;color:#667085;}';

  return (
    <div className="alo-stage3" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} style={styles.root}>
      <style>{globalStyles}</style>

      <div style={styles.shell}>
        <header style={styles.header}>
          <h1 style={styles.title}>{copy.appTitle}</h1>

          <div style={styles.headerControls}>
            <div style={styles.controlGroup}>
              <label style={styles.label} htmlFor={rootId + '-persona'}>
                {copy.persona}
              </label>
              <select
                id={rootId + '-persona'}
                style={styles.select}
                value={personaId}
                disabled={!onPersonaChange}
                onChange={(event) => {
                  if (onPersonaChange) {
                    onPersonaChange(event.target.value as PersonaId);
                  }
                }}
              >
                {ALO_PERSONAS.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {locale === 'ar' ? persona.nameAr + ' — ' + persona.roleAr : persona.nameEn + ' — ' + persona.roleEn}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label} htmlFor={rootId + '-locale'}>
                {copy.language}
              </label>
              <select
                id={rootId + '-locale'}
                style={styles.select}
                value={locale}
                disabled={!onLocaleChange}
                onChange={(event) => {
                  if (onLocaleChange) {
                    onLocaleChange(event.target.value as AloLocale);
                  }
                }}
              >
                <option value="ar">{copy.arabic}</option>
                <option value="en">{copy.english}</option>
              </select>
            </div>
          </div>
        </header>

        {submitState === 'success' && (
          <div style={{ ...styles.banner, ...styles.successBanner }} role="status">
            {copy.success}
          </div>
        )}

        {submitState === 'error' && (
          <div style={{ ...styles.banner, ...styles.dangerBanner }} role="alert">
            {submitError || copy.submitError}
          </div>
        )}

        {attemptedSubmit && errorSummary.length > 0 && submitState !== 'success' && (
          <div style={{ ...styles.banner, ...styles.dangerBanner }} role="alert">
            <ul style={{ margin: 0, padding: 0, listStylePosition: 'inside' }}>
              {errorSummary.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {readOnly && personaId !== 'treating_doctor_abdullah' && submitState !== 'success' && (
          <div style={{ ...styles.banner, ...styles.infoBanner }} role="status">
            {copy.readOnlyNotice}
          </div>
        )}

        {isOverdue && submitState !== 'success' && (
          <div style={{ ...styles.banner, ...styles.dangerBanner }} role="alert">
            {escalated ? copy.escalated : copy.overdue}
          </div>
        )}

        {isUrgent && !isOverdue && submitState !== 'success' && (
          <div style={{ ...styles.banner, ...styles.warningBanner }} role="status">
            {copy.urgent}
          </div>
        )}

        <section style={styles.card} aria-label={copy.slaTitle}>
          <h2 style={styles.sectionTitle}>{copy.slaTitle}</h2>

          <div style={styles.slaMeta}>
            <div style={styles.summaryItem}>
              <strong>{copy.caseId}:</strong>
              <span>{caseId}</span>
            </div>

            <div style={styles.summaryItem}>
              <strong>{copy.slaDeadline}:</strong>
              <span>{formatDateTime(slaDeadline, locale)}</span>
            </div>

            <div style={styles.summaryItem}>
              <strong>{copy.remaining}:</strong>
              <span aria-live="polite">{formatCountdown(remainingMs, locale)}</span>
            </div>

            <div style={styles.summaryItem}>
              <strong>{copy.status}:</strong>
              <span>{isOverdue ? copy.overdue : isUrgent ? copy.urgent : copy.onTrack}</span>
            </div>
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label={copy.slaTitle}
            style={styles.progressTrack}
          >
            <div
              style={{
                ...styles.progressFill,
                width: progress + '%',
                background: progressColor,
              }}
            />
          </div>
        </section>

        <form noValidate onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
          <section
            id={rootId + '-scan-group'}
            tabIndex={-1}
            style={styles.card}
            aria-label={copy.diagnosticScanReview}
            aria-describedby={attemptedSubmit && scanError ? rootId + '-scan-error' : undefined}
          >
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>{copy.diagnosticScanReview}</h2>
                <p style={styles.sectionSubtle}>
                  {validReviewedScanIds.length} / {scans.length} {copy.reviewed}
                </p>
              </div>

              <div style={styles.rowActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={markAllScansReviewed}
                  disabled={readOnly || scans.length === 0}
                >
                  {copy.markAllReviewed}
                </button>

                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={clearAllScans}
                  disabled={readOnly || reviewedScanIds.length === 0}
                >
                  {copy.clearAll}
                </button>
              </div>
            </div>

            <div style={styles.scanList} role="group" aria-label={copy.diagnosticScanReview}>
              {scans.map((scan) => {
                const reviewed = reviewedScanIds.includes(scan.id);

                return (
                  <label
                    key={scan.id}
                    style={{
                      ...styles.scanItem,
                      ...(reviewed ? styles.scanItemReviewed : {}),
                    }}
                  >
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={reviewed}
                      disabled={readOnly}
                      onChange={() => toggleScan(scan.id)}
                      aria-label={scan.code + ' — ' + (locale === 'ar' ? scan.titleAr : scan.titleEn)}
                    />

                    <span style={styles.scanMain}>
                      <span style={styles.scanCode}>{scan.code}</span>
                      <strong>{locale === 'ar' ? scan.titleAr : scan.titleEn}</strong>
                      <span style={styles.helpText}>
                        {scan.modality}
                        {scan.capturedAt ? ' • ' + formatDateTime(scan.capturedAt, locale) : ''}
                      </span>
                    </span>

                    <span style={reviewed ? styles.reviewedChip : styles.pendingChip}>
                      {reviewed ? copy.reviewed : copy.pendingReview}
                    </span>
                  </label>
                );
              })}
            </div>

            {attemptedSubmit && scanError && (
              <p id={rootId + '-scan-error'} style={styles.errorText}>
                {scanError}
              </p>
            )}
          </section>

          <section style={styles.card}>
            <fieldset
              id={rootId + '-consultant-group'}
              tabIndex={-1}
              style={styles.fieldset}
              aria-describedby={attemptedSubmit && consultantError ? rootId + '-consultant-error' : undefined}
            >
              <legend style={styles.legend}>{copy.consultantSelection}</legend>

              <div style={styles.consultantGrid}>
                {consultants.map((consultant) => {
                  const selected = consultantId === consultant.id;
                  const disabled = readOnly || !consultant.available;

                  return (
                    <label
                      key={consultant.id}
                      style={{
                        ...styles.consultantCard,
                        ...(selected ? styles.consultantCardSelected : {}),
                        ...(!consultant.available ? styles.consultantCardUnavailable : {}),
                        cursor: disabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span style={styles.radioLabel}>
                        <input
                          type="radio"
                          name={rootId + '-consultant'}
                          value={consultant.id}
                          checked={selected}
                          disabled={disabled}
                          onChange={() => {
                            if (!readOnly && consultant.available) {
                              setConsultantId(consultant.id);
                            }
                          }}
                          style={styles.radio}
                        />

                        <span style={styles.scanMain}>
                          <strong>{locale === 'ar' ? consultant.nameAr : consultant.nameEn}</strong>
                          <span style={styles.helpText}>
                            {locale === 'ar' ? consultant.specialtyAr : consultant.specialtyEn}
                          </span>
                          <span style={consultant.available ? styles.availableChip : styles.unavailableChip}>
                            {consultant.available ? copy.available : copy.unavailable}
                          </span>
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {attemptedSubmit && consultantError && (
                <p id={rootId + '-consultant-error'} style={styles.errorText}>
                  {consultantError}
                </p>
              )}
            </fieldset>
          </section>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>{copy.clinicalFocusQuestions}</h2>

            <div style={{ display: 'grid', gap: 12 }}>
              {focusQuestions.map((question, index) => {
                const value = answers[question.id] || '';
                const error = attemptedSubmit ? focusErrors.find((item) => item.id === question.id) : undefined;
                const inputId = rootId + '-focus-' + question.id;
                const errorId = inputId + '-error';
                const helpId = inputId + '-help';

                return (
                  <div key={question.id} style={styles.questionCard}>
                    <label htmlFor={inputId} style={styles.questionLabel}>
                      <span style={styles.scanCode}>{question.code}</span>
                      <span>
                        {index + 1}. {locale === 'ar' ? question.textAr : question.textEn}
                      </span>
                    </label>

                    <textarea
                      id={inputId}
                      style={{
                        ...styles.textarea,
                        ...(error ? styles.textareaError : {}),
                      }}
                      value={value}
                      disabled={readOnly}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? errorId : helpId}
                      minLength={question.minLength}
                      onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                    />

                    <div id={helpId} style={styles.helpText}>
                      {value.trim().length} / {question.minLength} {copy.chars}
                    </div>

                    {error && (
                      <p id={errorId} style={styles.errorText}>
                        {error.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section style={styles.card}>
            <label htmlFor={rootId + '-summary'} style={styles.questionLabel}>
              {copy.summary}
            </label>

            <textarea
              id={rootId + '-summary'}
              style={{ ...styles.textarea, marginTop: 8 }}
              value={summary}
              disabled={readOnly}
              placeholder={copy.summaryPlaceholder}
              onChange={(event) => {
                if (!readOnly) {
                  setSummary(event.target.value);
                }
              }}
            />
          </section>

          <footer style={styles.footer}>
            <button
              type="submit"
              style={styles.primaryButton}
              disabled={readOnly || submitState === 'submitting'}
            >
              {submitState === 'submitting' ? copy.submitting : copy.submit}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
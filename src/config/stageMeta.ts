import type { ClinicalStage } from '../types';

/**
 * The single stage taxonomy.
 *
 * Before this file there were four competing stage maps — Super Admin pills,
 * Super Admin activity badges, the pipeline progress bar and the patient
 * timeline — and they had already drifted: `PARTNER_SERVICES` read "Services"
 * in the admin tab and "Report PDF 1" in the timeline.
 *
 * Three label widths are kept deliberately, because the UI genuinely needs
 * them, but they now live together so a rename is one edit:
 *   - `label`     patient timeline
 *   - `shortLabel` admin pipeline pills
 *   - `longLabel` pipeline progress bar
 */
export interface StageMeta {
  stage: ClinicalStage;
  num: number;
  labelAr: string;
  labelEn: string;
  shortLabelAr: string;
  shortLabelEn: string;
  longLabelAr: string;
  longLabelEn: string;
  color: string;
  bg: string;
  border: string;
}

export const STAGE_ORDER_META: readonly StageMeta[] = [
  {
    stage: 'INTAKE_RECEIVED',
    num: 1,
    labelAr: 'تسجيل الحالة',
    labelEn: 'Intake',
    shortLabelAr: 'استلام',
    shortLabelEn: 'Intake',
    longLabelAr: 'استلام وتفويض',
    longLabelEn: 'Intake received',
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    stage: 'NURSE_CHECK',
    num: 2,
    labelAr: 'فرز التمريض',
    labelEn: 'Nurse Triage',
    shortLabelAr: 'فرز',
    shortLabelEn: 'Triage',
    longLabelAr: 'فرز التمريض',
    longLabelEn: 'Nurse check',
    color: '#06B6D4',
    bg: '#ECFEFF',
    border: '#A5F3FC',
  },
  {
    stage: 'DOCTOR_REVIEW',
    num: 3,
    labelAr: 'الطبيب السعودي',
    labelEn: 'Saudi Doctor',
    shortLabelAr: 'طبيب',
    shortLabelEn: 'Doctor',
    longLabelAr: 'مراجعة الطبيب السعودي',
    longLabelEn: 'Saudi Doctor review',
    color: '#14B8A6',
    bg: '#F0FDFA',
    border: '#99F6E4',
  },
  {
    stage: 'AWAITING_PAYMENT',
    num: 4,
    labelAr: 'السداد والفاتورة',
    labelEn: 'Payment',
    shortLabelAr: 'سداد',
    shortLabelEn: 'Payment',
    longLabelAr: 'سداد الباقة',
    longLabelEn: 'Payment (Tier 1/2)',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    stage: 'WITH_CONSULTANT',
    num: 5,
    labelAr: 'الاستشاري الدولي',
    labelEn: 'Consultant',
    shortLabelAr: 'استشاري',
    shortLabelEn: 'Consultant',
    longLabelAr: 'الاستشاري الدولي',
    longLabelEn: 'International consultant',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#C4B5FD',
  },
  {
    stage: 'OPINION_READY',
    num: 6,
    labelAr: 'الرأي الاستشاري',
    labelEn: 'Second Opinion',
    shortLabelAr: 'رأي',
    shortLabelEn: 'Opinion',
    longLabelAr: 'الرأي الاستشاري والجلسة',
    longLabelEn: 'Opinion ready',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#6EE7B7',
  },
  {
    stage: 'PARTNER_SERVICES',
    num: 7,
    // The historical drift: "Services" (admin) vs "Report PDF 1" (timeline).
    labelAr: 'استلام التقرير',
    labelEn: 'Report',
    shortLabelAr: 'التقرير وخدمات الشركاء',
    shortLabelEn: 'Report & Services',
    longLabelAr: 'إصدار التقرير (PDF 1)',
    longLabelEn: 'Release Report (PDF 1)',
    color: '#6366F1',
    bg: '#EEF2FF',
    border: '#A5B4FC',
  },
  {
    stage: 'FOLLOW_UP_21_DAYS',
    num: 8,
    labelAr: 'المتابعة 21 يوماً',
    labelEn: 'Follow-up',
    shortLabelAr: 'متابعة',
    shortLabelEn: 'Follow-Up',
    longLabelAr: 'متابعة 21 يوماً',
    longLabelEn: 'Follow-up 21 days',
    color: '#EC4899',
    bg: '#FDF2F8',
    border: '#FBCFE8',
  },
  {
    stage: 'CLOSED',
    num: 9,
    labelAr: 'إغلاق الملف',
    labelEn: 'Closed',
    shortLabelAr: 'مغلق',
    shortLabelEn: 'Closed',
    longLabelAr: 'إغلاق والحفظ (PDF 2)',
    longLabelEn: 'Case closed',
    color: '#64748B',
    bg: '#F8FAFC',
    border: '#CBD5E1',
  },
];

export const STAGE_META_BY_STAGE: Record<string, StageMeta> = Object.fromEntries(
  STAGE_ORDER_META.map((meta) => [meta.stage, meta])
);

export const stageMeta = (stage?: string): StageMeta | undefined =>
  stage ? STAGE_META_BY_STAGE[stage] : undefined;

/**
 * Timeline label for a stage. `OPINION_READY` is the only stage whose label
 * depends on the consultation type (a written case never has a video session).
 */
export const timelineLabelFor = (
  stage: ClinicalStage,
  consultationType?: string,
  isAr = false
): string => {
  const meta = STAGE_META_BY_STAGE[stage];
  if (!meta) return stage;
  if (stage === 'OPINION_READY') {
    const written = consultationType === 'written';
    if (isAr) return written ? 'الرأي الاستشاري' : 'الجلسة المرئية';
    return written ? 'Second Opinion' : 'Telehealth';
  }
  return isAr ? meta.labelAr : meta.labelEn;
};

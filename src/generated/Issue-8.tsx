import React, { useEffect, useMemo, useRef, useState } from 'react';

export type AloLocale = 'ar' | 'en';

export const PERSONA_IDS = [
  'system_admin',
  'physician',
  'nurse',
  'pharmacist',
  'lab_specialist',
  'physiotherapist',
  'home_nurse',
  'partner_desk',
  'care_coordinator',
  'billing_specialist',
  'patient_rep',
] as const;

export type PersonaId = (typeof PERSONA_IDS)[number];

export interface PersonaProfile {
  id: PersonaId;
  labelAr: string;
  labelEn: string;
}

export const PERSONA_PROFILES: PersonaProfile[] = [
  { id: 'system_admin', labelAr: 'مدير النظام', labelEn: 'System Administrator' },
  { id: 'physician', labelAr: 'طبيب', labelEn: 'Physician' },
  { id: 'nurse', labelAr: 'ممرض', labelEn: 'Nurse' },
  { id: 'pharmacist', labelAr: 'صيدلي', labelEn: 'Pharmacist' },
  { id: 'lab_specialist', labelAr: 'أخصائي مختبر', labelEn: 'Lab Specialist' },
  { id: 'physiotherapist', labelAr: 'أخصائي علاج طبيعي', labelEn: 'Physiotherapist' },
  { id: 'home_nurse', labelAr: 'ممرض منزلي', labelEn: 'Home Nurse' },
  { id: 'partner_desk', labelAr: 'مكتب الإحالة للشركاء', labelEn: 'Partner Referral Desk' },
  { id: 'care_coordinator', labelAr: 'منسق رعاية', labelEn: 'Care Coordinator' },
  { id: 'billing_specialist', labelAr: 'أخصائي فوترة', labelEn: 'Billing Specialist' },
  { id: 'patient_rep', labelAr: 'ممثل المريض', labelEn: 'Patient Representative' },
];

export type PartnerOrderCode = 'L01' | 'H01' | 'T01' | 'V01';
export type OrderStatus = 'submitted' | 'needs_review';

const ORDER_CODES: readonly PartnerOrderCode[] = ['L01', 'H01', 'T01', 'V01'] as const;

interface BaseOrderDraft {
  patientName: string;
  patientMobile: string;
  partnerReferralId: string;
  clinicalNotes: string;
}

export interface LabOrderDraft extends BaseOrderDraft {
  testType: string;
  fastingRequired: boolean;
  homeCollection: boolean;
  preferredCollectionTime: string;
}

export interface PharmacyOrderDraft extends BaseOrderDraft {
  medicationBrand: string;
  dosage: string;
  durationDays: number;
  allowGenericSubstitution: boolean;
  genericName: string;
}

export interface PhysioOrderDraft extends BaseOrderDraft {
  diagnosis: string;
  sessionsPerWeek: number;
  durationWeeks: number;
  goals: string;
}

export interface HomeNurseOrderDraft extends BaseOrderDraft {
  district: string;
  address: string;
  visitReason: string;
  skillLevel: string;
  preferredStartDate: string;
}

export interface PartnerOrder {
  id: string;
  code: PartnerOrderCode;
  createdAt: string;
  persona: PersonaId;
  locale: AloLocale;
  status: OrderStatus;
  reviewNotes: string[];
  payload: LabOrderDraft | PharmacyOrderDraft | PhysioOrderDraft | HomeNurseOrderDraft;
}

export interface Stage7SaudiPartnerOrdersProps {
  locale?: AloLocale;
  persona?: PersonaId;
  onLocaleChange?: (locale: AloLocale) => void;
  onPersonaChange?: (persona: PersonaId) => void;
  onOrderCreated?: (order: PartnerOrder) => void;
}

const PALETTE = {
  primary: '#007B6E',
  teal: '#00C6AE',
  mist: '#E6FAF7',
  whatsapp: '#25D366',
  softBorder: '#BDEEE6',
  ink: '#06332D',
  subtleInk: '#1D5B51',
};

const ar = {
  appTitle: 'مكتب الإحالة للشركاء — المرحلة 7',
  subtitle: 'إنشاء أوامر المختبر والصيدلية والعلاج الطبيعي والتمريض المنزلي دون بوابات اصطناعية.',
  persona: 'الملف الشخصي',
  locale: 'اللغة',
  arabic: 'العربية',
  english: 'English',
  tabNavigation: 'التنقل بين أوامر الشركاء',
  lab: 'طلب مختبر',
  pharmacy: 'وصفة صيدلية',
  physio: 'علاج طبيعي',
  homeNurse: 'تمريض منزلي',
  patientDetails: 'بيانات المريض',
  patientName: 'اسم المريض',
  patientMobile: 'جوال المريض',
  partnerReferralId: 'رقم الإحالة',
  clinicalNotes: 'ملاحظات سريرية',
  labOrderTitle: 'طلب سحب عينات المختبر (L01)',
  testType: 'نوع التحليل',
  selectTest: 'اختر نوع التحليل',
  fastingRequired: 'يلزم الصيام',
  homeCollection: 'سحب العينة من المنزل',
  preferredCollectionTime: 'وقت السحب المفضل',
  pharmacyOrderTitle: 'وصفة صيدلية مع الاستبدال الجنيس (H01)',
  medicationBrand: 'الاسم التجاري',
  medicationPlaceholder: 'مثال: Panadol',
  dosage: 'الجرعة',
  dosagePlaceholder: 'مثال: 500 ملغ ثلاث مرات يوميًا',
  durationDays: 'مدة العلاج (أيام)',
  allowGenericSubstitution: 'السماح بالاستبدال الجنيس',
  genericName: 'الاسم العلمي',
  genericSuggestion: 'الجنيس المقترح',
  apply: 'تطبيق',
  physioOrderTitle: 'خطة إعادة التأهيل (T01)',
  diagnosis: 'التشخيص',
  sessionsPerWeek: 'جلسات أسبوعيًا',
  durationWeeks: 'مدة الخطة (أسابيع)',
  goals: 'أهداف الخطة',
  goalsPlaceholder: 'تحسين المدى الحركي، تقليل الألم، التدريب على المشي',
  homeNurseOrderTitle: 'إرسال ممرض منزلي إلى حي الملقا، الرياض (V01)',
  dispatchNotice: 'سيتم توجيه الطلب إلى فريق التمريض المنزلي في حي الملقا، الرياض.',
  district: 'الحي',
  address: 'العنوان التفصيلي',
  addressPlaceholder: 'شارع، مبنى، علامة مميزة',
  visitReason: 'سبب الزيارة',
  skillLevel: 'المهارة المطلوبة',
  selectSkill: 'اختر المهارة المطلوبة',
  preferredStartDate: 'تاريخ البدء المفضل',
  submit: 'إنشاء الأمر',
  reset: 'إعادة تعيين',
  submitted: 'تم إنشاء الأمر بنجاح.',
  submittedNeedsReview: 'تم إنشاء الأمر وهو بحاجة إلى مراجعة سريعة.',
  recentOrders: 'الأوامر الأخيرة',
  noOrders: 'لا توجد أوامر بعد.',
  orderCode: 'الرمز',
  patient: 'المريض',
  status: 'الحالة',
  createdAt: 'تاريخ الإنشاء',
  statusSubmitted: 'مُرسل',
  statusReview: 'قيد المراجعة',
  requiredPatientName: 'اسم المريض مطلوب.',
  invalidMobile: 'رقم الجوال يجب أن يكون بصيغة سعودية مثل 05xxxxxxxx.',
  requiredTest: 'نوع التحليل مطلوب.',
  requiredMedication: 'الاسم التجاري مطلوب.',
  requiredDosage: 'الجرعة مطلوبة.',
  invalidDurationDays: 'مدة العلاج يجب أن تكون أكبر من صفر.',
  requiredDiagnosis: 'التشخيص مطلوب.',
  invalidSessions: 'عدد الجلسات الأسبوعية يجب أن يكون أكبر من صفر.',
  invalidDurationWeeks: 'مدة الخطة يجب أن تكون أكبر من صفر.',
  requiredAddress: 'العنوان مطلوب.',
  requiredVisitReason: 'سبب الزيارة مطلوب.',
  dispatchAreaNote: 'يجب أن تكون الوجهة حي الملقا، الرياض.',
  optional: 'اختياري',
  required: 'مطلوب',
  cbc: 'صورة دم كاملة',
  hba1c: 'سكر تراكمي (HbA1c)',
  lipid: 'دهون الدم',
  thyroid: 'وظائف الغدة الدرقية',
  culture: 'مزرعة',
  registeredNurse: 'ممرض مسجل',
  practicalNurse: 'ممرض عملي',
  woundCare: 'عناية بالجروح',
  ivTherapy: 'علاج وريدي',
  mobilePlaceholder: '05xxxxxxxx',
  referralPlaceholder: 'PR-2024-0001',
};

const en: typeof ar = {
  appTitle: 'Partner Referral Desk — Stage 7',
  subtitle: 'Create lab, pharmacy, physiotherapy, and home nursing orders without artificial gates.',
  persona: 'Persona profile',
  locale: 'Language',
  arabic: 'العربية',
  english: 'English',
  tabNavigation: 'Partner orders navigation',
  lab: 'Lab order',
  pharmacy: 'Pharmacy prescription',
  physio: 'Physiotherapy',
  homeNurse: 'Home nursing',
  patientDetails: 'Patient details',
  patientName: 'Patient name',
  patientMobile: 'Patient mobile',
  partnerReferralId: 'Referral ID',
  clinicalNotes: 'Clinical notes',
  labOrderTitle: 'Lab phlebotomy order (L01)',
  testType: 'Test type',
  selectTest: 'Select test type',
  fastingRequired: 'Fasting required',
  homeCollection: 'Home sample collection',
  preferredCollectionTime: 'Preferred collection time',
  pharmacyOrderTitle: 'Pharmacy prescription with generic substitution (H01)',
  medicationBrand: 'Brand name',
  medicationPlaceholder: 'Example: Panadol',
  dosage: 'Dosage',
  dosagePlaceholder: 'Example: 500 mg three times daily',
  durationDays: 'Duration (days)',
  allowGenericSubstitution: 'Allow generic substitution',
  genericName: 'Generic name',
  genericSuggestion: 'Suggested generic',
  apply: 'Apply',
  physioOrderTitle: 'Rehabilitation plan (T01)',
  diagnosis: 'Diagnosis',
  sessionsPerWeek: 'Sessions per week',
  durationWeeks: 'Plan duration (weeks)',
  goals: 'Plan goals',
  goalsPlaceholder: 'Improve range of motion, reduce pain, gait training',
  homeNurseOrderTitle: 'Home nurse dispatch to Riyadh Al-Malqa (V01)',
  dispatchNotice: 'The request will be routed to the home nursing team in Al-Malqa, Riyadh.',
  district: 'District',
  address: 'Detailed address',
  addressPlaceholder: 'Street, building, landmark',
  visitReason: 'Visit reason',
  skillLevel: 'Required skill',
  selectSkill: 'Select required skill',
  preferredStartDate: 'Preferred start date',
  submit: 'Create order',
  reset: 'Reset',
  submitted: 'Order created successfully.',
  submittedNeedsReview: 'Order created and needs quick review.',
  recentOrders: 'Recent orders',
  noOrders: 'No orders yet.',
  orderCode: 'Code',
  patient: 'Patient',
  status: 'Status',
  createdAt: 'Created at',
  statusSubmitted: 'Submitted',
  statusReview: 'Needs review',
  requiredPatientName: 'Patient name is required.',
  invalidMobile: 'Mobile number must be a Saudi format like 05xxxxxxxx.',
  requiredTest: 'Test type is required.',
  requiredMedication: 'Brand name is required.',
  requiredDosage: 'Dosage is required.',
  invalidDurationDays: 'Duration must be greater than zero.',
  requiredDiagnosis: 'Diagnosis is required.',
  invalidSessions: 'Weekly sessions must be greater than zero.',
  invalidDurationWeeks: 'Plan duration must be greater than zero.',
  requiredAddress: 'Address is required.',
  requiredVisitReason: 'Visit reason is required.',
  dispatchAreaNote: 'Destination must be Al-Malqa, Riyadh.',
  optional: 'Optional',
  required: 'Required',
  cbc: 'Complete Blood Count',
  hba1c: 'HbA1c',
  lipid: 'Lipid profile',
  thyroid: 'Thyroid function',
  culture: 'Culture',
  registeredNurse: 'Registered nurse',
  practicalNurse: 'Practical nurse',
  woundCare: 'Wound care',
  ivTherapy: 'IV therapy',
  mobilePlaceholder: '05xxxxxxxx',
  referralPlaceholder: 'PR-2024-0001',
};

const COPY: Record<AloLocale, typeof ar> = { ar, en };
type Copy = typeof ar;

const GENERIC_SUGGESTIONS: Record<string, string> = {
  panadol: 'Paracetamol',
  brufen: 'Ibuprofen',
  augmentin: 'Amoxicillin/Clavulanate',
  zithromax: 'Azithromycin',
  glucophage: 'Metformin',
  concor: 'Bisoprolol',
  lipitor: 'Atorvastatin',
  nexium: 'Esomeprazole',
};

const TEST_OPTIONS: ReadonlyArray<{
  value: string;
  labelKey: 'cbc' | 'hba1c' | 'lipid' | 'thyroid' | 'culture';
}> = [
  { value: 'CBC', labelKey: 'cbc' },
  { value: 'HBA1C', labelKey: 'hba1c' },
  { value: 'LIPID', labelKey: 'lipid' },
  { value: 'THYROID', labelKey: 'thyroid' },
  { value: 'CULTURE', labelKey: 'culture' },
];

const SKILL_OPTIONS: ReadonlyArray<{
  value: string;
  labelKey: 'registeredNurse' | 'practicalNurse' | 'woundCare' | 'ivTherapy';
}> = [
  { value: 'registered_nurse', labelKey: 'registeredNurse' },
  { value: 'practical_nurse', labelKey: 'practicalNurse' },
  { value: 'wound_care', labelKey: 'woundCare' },
  { value: 'iv_therapy', labelKey: 'ivTherapy' },
];

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

  :root {
    color-scheme: light;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  input[type='checkbox'],
  input[type='radio'] {
    accent-color: ${PALETTE.primary};
  }

  .alo-input,
  .alo-select,
  .alo-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid ${PALETTE.softBorder};
    border-radius: 12px;
    font: inherit;
    color: ${PALETTE.ink};
    background: #FFFFFF;
    text-align: start;
  }

  .alo-input:focus-visible,
  .alo-select:focus-visible,
  .alo-textarea:focus-visible,
  .alo-button:focus-visible,
  .alo-tab:focus-visible,
  .alo-status:focus-visible {
    outline: 3px solid ${PALETTE.teal};
    outline-offset: 2px;
  }

  .alo-button {
    border: 0;
    border-radius: 14px;
    padding: 12px 18px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .alo-button-primary {
    background: ${PALETTE.primary};
    color: #FFFFFF;
  }

  .alo-button-secondary {
    background: ${PALETTE.mist};
    color: ${PALETTE.primary};
    border: 1.5px solid ${PALETTE.teal};
  }

  .alo-tab {
    border: 1.5px solid transparent;
    background: transparent;
    color: ${PALETTE.primary};
    border-radius: 999px;
    padding: 10px 16px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .alo-tab[aria-selected='true'] {
    background: ${PALETTE.primary};
    color: #FFFFFF;
  }
`;

function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fallback only
  }

  return `ALO-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function defaultTabForPersona(persona: PersonaId): PartnerOrderCode {
  switch (persona) {
    case 'lab_specialist':
      return 'L01';
    case 'pharmacist':
      return 'H01';
    case 'physiotherapist':
      return 'T01';
    case 'home_nurse':
      return 'V01';
    default:
      return 'L01';
  }
}

function normalizeSaudiMobile(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

function isValidSaudiMobile(value: string): boolean {
  const normalized = normalizeSaudiMobile(value);
  return /^(?:\+?966|00966|0)?5\d{8}$/.test(normalized);
}

function suggestGeneric(brandName: string): string | null {
  const key = brandName.trim().toLowerCase();
  if (!key) {
    return null;
  }

  return GENERIC_SUGGESTIONS[key] ?? null;
}

function validateBase(draft: BaseOrderDraft, copy: Copy): string[] {
  const issues: string[] = [];

  if (!draft.patientName.trim()) {
    issues.push(copy.requiredPatientName);
  }

  if (!isValidSaudiMobile(draft.patientMobile)) {
    issues.push(copy.invalidMobile);
  }

  return issues;
}

function validateLab(draft: LabOrderDraft, copy: Copy): string[] {
  const issues = validateBase(draft, copy);

  if (!draft.testType.trim()) {
    issues.push(copy.requiredTest);
  }

  return issues;
}

function validatePharmacy(draft: PharmacyOrderDraft, copy: Copy): string[] {
  const issues = validateBase(draft, copy);

  if (!draft.medicationBrand.trim()) {
    issues.push(copy.requiredMedication);
  }

  if (!draft.dosage.trim()) {
    issues.push(copy.requiredDosage);
  }

  if (draft.durationDays <= 0) {
    issues.push(copy.invalidDurationDays);
  }

  return issues;
}

function validatePhysio(draft: PhysioOrderDraft, copy: Copy): string[] {
  const issues = validateBase(draft, copy);

  if (!draft.diagnosis.trim()) {
    issues.push(copy.requiredDiagnosis);
  }

  if (draft.sessionsPerWeek <= 0) {
    issues.push(copy.invalidSessions);
  }

  if (draft.durationWeeks <= 0) {
    issues.push(copy.invalidDurationWeeks);
  }

  return issues;
}

function validateHomeNurse(draft: HomeNurseOrderDraft, copy: Copy): string[] {
  const issues = validateBase(draft, copy);

  if (!draft.address.trim()) {
    issues.push(copy.requiredAddress);
  }

  if (!draft.visitReason.trim()) {
    issues.push(copy.requiredVisitReason);
  }

  if (!/ملقا|malqa/i.test(draft.district.trim())) {
    issues.push(copy.dispatchAreaNote);
  }

  return issues;
}

function createBaseDraft(): BaseOrderDraft {
  return {
    patientName: '',
    patientMobile: '',
    partnerReferralId: '',
    clinicalNotes: '',
  };
}

function createInitialLab(): LabOrderDraft {
  return {
    ...createBaseDraft(),
    testType: '',
    fastingRequired: false,
    homeCollection: true,
    preferredCollectionTime: '08:00',
  };
}

function createInitialPharmacy(): PharmacyOrderDraft {
  return {
    ...createBaseDraft(),
    medicationBrand: '',
    dosage: '',
    durationDays: 5,
    allowGenericSubstitution: true,
    genericName: '',
  };
}

function createInitialPhysio(): PhysioOrderDraft {
  return {
    ...createBaseDraft(),
    diagnosis: '',
    sessionsPerWeek: 2,
    durationWeeks: 6,
    goals: '',
  };
}

function createInitialHomeNurse(): HomeNurseOrderDraft {
  return {
    ...createBaseDraft(),
    district: 'حي الملقا، الرياض | Al-Malqa, Riyadh',
    address: '',
    visitReason: '',
    skillLevel: 'registered_nurse',
    preferredStartDate: new Date().toISOString().slice(0, 10),
  };
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  optionalLabel?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ id, label, required, optionalLabel, hint, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: 6,
          fontWeight: 700,
          color: PALETTE.primary,
          textAlign: 'start',
        }}
      >
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
        {!required && optionalLabel ? (
          <span style={{ fontWeight: 400, fontSize: 12, color: PALETTE.subtleInk, margin: '0 6px' }}>
            ({optionalLabel})
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p style={{ margin: '6px 0 0', fontSize: 13, color: PALETTE.primary, fontWeight: 700 }}>{hint}</p>
      ) : null}
    </div>
  );
}

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxField({ id, label, checked, onChange }: CheckboxFieldProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ width: 20, height: 20 }}
      />
      <label htmlFor={id} style={{ margin: 0, fontWeight: 700, color: PALETTE.ink }}>
        {label}
      </label>
    </div>
  );
}

export function Stage7SaudiPartnerOrders({
  locale: controlledLocale,
  persona: controlledPersona,
  onLocaleChange,
  onPersonaChange,
  onOrderCreated,
}: Stage7SaudiPartnerOrdersProps) {
  const [internalLocale, setInternalLocale] = useState<AloLocale>('ar');
  const [internalPersona, setInternalPersona] = useState<PersonaId>('partner_desk');

  const locale = controlledLocale ?? internalLocale;
  const persona = controlledPersona ?? internalPersona;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const copy = COPY[locale];

  const [activeCode, setActiveCode] = useState<PartnerOrderCode>(() => defaultTabForPersona(persona));
  const [lab, setLab] = useState<LabOrderDraft>(createInitialLab);
  const [pharmacy, setPharmacy] = useState<PharmacyOrderDraft>(createInitialPharmacy);
  const [physio, setPhysio] = useState<PhysioOrderDraft>(createInitialPhysio);
  const [homeNurse, setHomeNurse] = useState<HomeNurseOrderDraft>(createInitialHomeNurse);
  const [orders, setOrders] = useState<PartnerOrder[]>([]);
  const [status, setStatus] = useState<{ tone: 'success' | 'warning'; text: string; notes: string[] } | null>(null);

  const tabRefs = useRef<Partial<Record<PartnerOrderCode, HTMLButtonElement | null>>>({});
  const statusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveCode(defaultTabForPersona(persona));
  }, [persona]);

  useEffect(() => {
    setStatus(null);
  }, [locale]);

  useEffect(() => {
    if (status) {
      statusRef.current?.focus();
    }
  }, [status]);

  const styles = useMemo(() => {
    const root: React.CSSProperties = {
      direction: dir,
      fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
      background: `linear-gradient(180deg, ${PALETTE.mist}, #FFFFFF)`,
      color: PALETTE.ink,
      minHeight: '100vh',
      padding: 24,
      lineHeight: 1.65,
    };

    const header: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 20,
      marginBottom: 20,
    };

    const h1: React.CSSProperties = {
      margin: 0,
      fontSize: 30,
      color: PALETTE.primary,
    };

    const subtitle: React.CSSProperties = {
      margin: '6px 0 0',
      color: PALETTE.subtleInk,
      maxWidth: 760,
    };

    const controls: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 12,
      minWidth: 320,
    };

    const label: React.CSSProperties = {
      display: 'block',
      marginBottom: 6,
      fontWeight: 700,
      color: PALETTE.primary,
      textAlign: 'start',
    };

    const tablist: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 18,
    };

    const panel: React.CSSProperties = {
      background: '#FFFFFF',
      border: `1.5px solid ${PALETTE.softBorder}`,
      borderRadius: 24,
      padding: 20,
      boxShadow: '0 12px 30px rgba(0, 123, 110, 0.08)',
      marginBottom: 24,
    };

    const h2: React.CSSProperties = {
      margin: '0 0 16px',
      color: PALETTE.primary,
      fontSize: 22,
    };

    const grid: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: 16,
    };

    const fieldset: React.CSSProperties = {
      border: `1.5px solid ${PALETTE.softBorder}`,
      borderRadius: 18,
      padding: 16,
      margin: '0 0 18px',
    };

    const legend: React.CSSProperties = {
      fontWeight: 800,
      color: PALETTE.primary,
      padding: '0 8px',
    };

    const actions: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 18,
    };

    const notice: React.CSSProperties = {
      background: PALETTE.mist,
      border: `1.5px solid ${PALETTE.teal}`,
      color: PALETTE.primary,
      borderRadius: 14,
      padding: '10px 12px',
      fontWeight: 700,
    };

    const statusBox: React.CSSProperties = {
      marginBottom: 18,
      borderRadius: 14,
      padding: '12px 14px',
      fontWeight: 700,
    };

    const statusSuccess: React.CSSProperties = {
      background: PALETTE.mist,
      color: PALETTE.primary,
      border: `1.5px solid ${PALETTE.teal}`,
    };

    const statusWarning: React.CSSProperties = {
      background: '#FFF7E8',
      color: '#7A4F00',
      border: '1.5px solid #F2C94C',
    };

    const ordersSection: React.CSSProperties = {
      background: '#FFFFFF',
      border: `1.5px solid ${PALETTE.softBorder}`,
      borderRadius: 24,
      padding: 20,
    };

    const orderList: React.CSSProperties = {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'grid',
      gap: 10,
    };

    const orderItem: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 10,
      border: `1.5px solid ${PALETTE.softBorder}`,
      borderRadius: 16,
      padding: '10px 12px',
    };

    const chipSubmitted: React.CSSProperties = {
      background: PALETTE.whatsapp,
      color: '#FFFFFF',
      borderRadius: 999,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 800,
    };

    const chipReview: React.CSSProperties = {
      background: '#F2C94C',
      color: '#4A3200',
      borderRadius: 999,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 800,
    };

    return {
      root,
      header,
      h1,
      subtitle,
      controls,
      label,
      tablist,
      panel,
      h2,
      grid,
      fieldset,
      legend,
      actions,
      notice,
      statusBox,
      statusSuccess,
      statusWarning,
      ordersSection,
      orderList,
      orderItem,
      chipSubmitted,
      chipReview,
    };
  }, [dir]);

  function handleLocaleChange(next: AloLocale) {
    onLocaleChange?.(next);
    if (controlledLocale === undefined) {
      setInternalLocale(next);
    }
  }

  function handlePersonaChange(next: PersonaId) {
    onPersonaChange?.(next);
    if (controlledPersona === undefined) {
      setInternalPersona(next);
    }
  }

  function updateLab<K extends keyof LabOrderDraft>(key: K, value: LabOrderDraft[K]) {
    setLab((prev) => ({ ...prev, [key]: value }));
  }

  function updatePharmacy<K extends keyof PharmacyOrderDraft>(key: K, value: PharmacyOrderDraft[K]) {
    setPharmacy((prev) => ({ ...prev, [key]: value }));
  }

  function updatePhysio<K extends keyof PhysioOrderDraft>(key: K, value: PhysioOrderDraft[K]) {
    setPhysio((prev) => ({ ...prev, [key]: value }));
  }

  function updateHomeNurse<K extends keyof HomeNurseOrderDraft>(key: K, value: HomeNurseOrderDraft[K]) {
    setHomeNurse((prev) => ({ ...prev, [key]: value }));
  }

  function finalizeOrder(order: PartnerOrder) {
    setOrders((prev) => [order, ...prev].slice(0, 8));
    setStatus({
      tone: order.status === 'submitted' ? 'success' : 'warning',
      text: order.status === 'submitted' ? copy.submitted : copy.submittedNeedsReview,
      notes: order.reviewNotes,
    });
    onOrderCreated?.(order);
  }

  function submitActiveOrder() {
    switch (activeCode) {
      case 'L01': {
        const issues = validateLab(lab, copy);
        finalizeOrder({
          id: makeId(),
          code: 'L01',
          createdAt: new Date().toISOString(),
          persona,
          locale,
          status: issues.length ? 'needs_review' : 'submitted',
          reviewNotes: issues,
          payload: { ...lab },
        });
        break;
      }

      case 'H01': {
        const issues = validatePharmacy(pharmacy, copy);
        finalizeOrder({
          id: makeId(),
          code: 'H01',
          createdAt: new Date().toISOString(),
          persona,
          locale,
          status: issues.length ? 'needs_review' : 'submitted',
          reviewNotes: issues,
          payload: { ...pharmacy },
        });
        break;
      }

      case 'T01': {
        const issues = validatePhysio(physio, copy);
        finalizeOrder({
          id: makeId(),
          code: 'T01',
          createdAt: new Date().toISOString(),
          persona,
          locale,
          status: issues.length ? 'needs_review' : 'submitted',
          reviewNotes: issues,
          payload: { ...physio },
        });
        break;
      }

      case 'V01': {
        const issues = validateHomeNurse(homeNurse, copy);
        finalizeOrder({
          id: makeId(),
          code: 'V01',
          createdAt: new Date().toISOString(),
          persona,
          locale,
          status: issues.length ? 'needs_review' : 'submitted',
          reviewNotes: issues,
          payload: { ...homeNurse },
        });
        break;
      }
    }
  }

  function resetActiveForm() {
    switch (activeCode) {
      case 'L01':
        setLab(createInitialLab());
        break;
      case 'H01':
        setPharmacy(createInitialPharmacy());
        break;
      case 'T01':
        setPhysio(createInitialPhysio());
        break;
      case 'V01':
        setHomeNurse(createInitialHomeNurse());
        break;
    }

    setStatus(null);
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, code: PartnerOrderCode) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    const currentIndex = ORDER_CODES.indexOf(code);
    let nextIndex = currentIndex;

    const forwardKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backwardKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

    if (event.key === forwardKey) {
      nextIndex = (currentIndex + 1) % ORDER_CODES.length;
    } else if (event.key === backwardKey) {
      nextIndex = (currentIndex - 1 + ORDER_CODES.length) % ORDER_CODES.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = ORDER_CODES.length - 1;
    }

    const nextCode = ORDER_CODES[nextIndex];
    setActiveCode(nextCode);
    tabRefs.current[nextCode]?.focus();
  }

  const genericSuggestion = useMemo(
    () => suggestGeneric(pharmacy.medicationBrand),
    [pharmacy.medicationBrand],
  );

  const testOptions = TEST_OPTIONS.map((option) => ({
    value: option.value,
    label: copy[option.labelKey],
  }));

  const skillOptions = SKILL_OPTIONS.map((option) => ({
    value: option.value,
    label: copy[option.labelKey],
  }));

  const renderActions = () => (
    <div style={styles.actions}>
      <button type="submit" className="alo-button alo-button-primary">
        {copy.submit}
      </button>
      <button type="button" className="alo-button alo-button-secondary" onClick={resetActiveForm}>
        {copy.reset}
      </button>
    </div>
  );

  const labForm = (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submitActiveOrder();
      }}
      aria-describedby={status ? 'order-status' : undefined}
    >
      <h2 style={styles.h2}>{copy.labOrderTitle}</h2>

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>{copy.patientDetails}</legend>
        <div style={styles.grid}>
          <Field id="lab-patient-name" label={copy.patientName} required>
            <input
              id="lab-patient-name"
              className="alo-input"
              type="text"
              value={lab.patientName}
              onChange={(event) => updateLab('patientName', event.target.value)}
              autoComplete="name"
              aria-required="true"
            />
          </Field>

          <Field id="lab-patient-mobile" label={copy.patientMobile} required>
            <input
              id="lab-patient-mobile"
              className="alo-input"
              type="tel"
              inputMode="tel"
              value={lab.patientMobile}
              onChange={(event) => updateLab('patientMobile', event.target.value)}
              placeholder={copy.mobilePlaceholder}
              aria-required="true"
            />
          </Field>

          <Field id="lab-referral-id" label={copy.partnerReferralId} optionalLabel={copy.optional}>
            <input
              id="lab-referral-id"
              className="alo-input"
              type="text"
              value={lab.partnerReferralId}
              onChange={(event) => updateLab('partnerReferralId', event.target.value)}
              placeholder={copy.referralPlaceholder}
            />
          </Field>
        </div>
      </fieldset>

      <div style={styles.grid}>
        <Field id="lab-test-type" label={copy.testType} required>
          <select
            id="lab-test-type"
            className="alo-select"
            value={lab.testType}
            onChange={(event) => updateLab('testType', event.target.value)}
            aria-required="true"
          >
            <option value="">{copy.selectTest}</option>
            {testOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="lab-collection-time" label={copy.preferredCollectionTime}>
          <input
            id="lab-collection-time"
            className="alo-input"
            type="time"
            value={lab.preferredCollectionTime}
            onChange={(event) => updateLab('preferredCollectionTime', event.target.value)}
          />
        </Field>
      </div>

      <CheckboxField
        id="lab-fasting-required"
        label={copy.fastingRequired}
        checked={lab.fastingRequired}
        onChange={(checked) => updateLab('fastingRequired', checked)}
      />

      <CheckboxField
        id="lab-home-collection"
        label={copy.homeCollection}
        checked={lab.homeCollection}
        onChange={(checked) => updateLab('homeCollection', checked)}
      />

      <Field id="lab-clinical-notes" label={copy.clinicalNotes} optionalLabel={copy.optional}>
        <textarea
          id="lab-clinical-notes"
          className="alo-textarea"
          rows={3}
          value={lab.clinicalNotes}
          onChange={(event) => updateLab('clinicalNotes', event.target.value)}
        />
      </Field>

      {renderActions()}
    </form>
  );

  const pharmacyForm = (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submitActiveOrder();
      }}
      aria-describedby={status ? 'order-status' : undefined}
    >
      <h2 style={styles.h2}>{copy.pharmacyOrderTitle}</h2>

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>{copy.patientDetails}</legend>
        <div style={styles.grid}>
          <Field id="pharmacy-patient-name" label={copy.patientName} required>
            <input
              id="pharmacy-patient-name"
              className="alo-input"
              type="text"
              value={pharmacy.patientName}
              onChange={(event) => updatePharmacy('patientName', event.target.value)}
              autoComplete="name"
              aria-required="true"
            />
          </Field>

          <Field id="pharmacy-patient-mobile" label={copy.patientMobile} required>
            <input
              id="pharmacy-patient-mobile"
              className="alo-input"
              type="tel"
              inputMode="tel"
              value={pharmacy.patientMobile}
              onChange={(event) => updatePharmacy('patientMobile', event.target.value)}
              placeholder={copy.mobilePlaceholder}
              aria-required="true"
            />
          </Field>

          <Field id="pharmacy-referral-id" label={copy.partnerReferralId} optionalLabel={copy.optional}>
            <input
              id="pharmacy-referral-id"
              className="alo-input"
              type="text"
              value={pharmacy.partnerReferralId}
              onChange={(event) => updatePharmacy('partnerReferralId', event.target.value)}
              placeholder={copy.referralPlaceholder}
            />
          </Field>
        </div>
      </fieldset>

      <div style={styles.grid}>
        <Field id="pharmacy-brand-name" label={copy.medicationBrand} required>
          <input
            id="pharmacy-brand-name"
            className="alo-input"
            type="text"
            value={pharmacy.medicationBrand}
            onChange={(event) => updatePharmacy('medicationBrand', event.target.value)}
            placeholder={copy.medicationPlaceholder}
            aria-required="true"
          />
        </Field>

        <Field id="pharmacy-dosage" label={copy.dosage} required>
          <input
            id="pharmacy-dosage"
            className="alo-input"
            type="text"
            value={pharmacy.dosage}
            onChange={(event) => updatePharmacy('dosage', event.target.value)}
            placeholder={copy.dosagePlaceholder}
            aria-required="true"
          />
        </Field>

        <Field id="pharmacy-duration-days" label={copy.durationDays} required>
          <input
            id="pharmacy-duration-days"
            className="alo-input"
            type="number"
            min={1}
            value={pharmacy.durationDays}
            onChange={(event) => updatePharmacy('durationDays', Number(event.target.value) || 0)}
            aria-required="true"
          />
        </Field>
      </div>

      <CheckboxField
        id="pharmacy-generic-substitution"
        label={copy.allowGenericSubstitution}
        checked={pharmacy.allowGenericSubstitution}
        onChange={(checked) => updatePharmacy('allowGenericSubstitution', checked)}
      />

      <Field id="pharmacy-generic-name" label={copy.genericName} optionalLabel={copy.optional}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            id="pharmacy-generic-name"
            className="alo-input"
            type="text"
            value={pharmacy.genericName}
            onChange={(event) => updatePharmacy('genericName', event.target.value)}
            style={{ flex: '1 1 220px' }}
          />
          {genericSuggestion && pharmacy.allowGenericSubstitution ? (
            <button
              type="button"
              className="alo-button alo-button-secondary"
              onClick={() => updatePharmacy('genericName', genericSuggestion)}
            >
              {copy.apply}
            </button>
          ) : null}
        </div>
      </Field>

      {genericSuggestion && pharmacy.allowGenericSubstitution ? (
        <p style={{ marginTop: -8, marginBottom: 16, color: PALETTE.primary, fontWeight: 700 }}>
          {copy.genericSuggestion}: {genericSuggestion}
        </p>
      ) : null}

      <Field id="pharmacy-clinical-notes" label={copy.clinicalNotes} optionalLabel={copy.optional}>
        <textarea
          id="pharmacy-clinical-notes"
          className="alo-textarea"
          rows={3}
          value={pharmacy.clinicalNotes}
          onChange={(event) => updatePharmacy('clinicalNotes', event.target.value)}
        />
      </Field>

      {renderActions()}
    </form>
  );

  const physioForm = (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submitActiveOrder();
      }}
      aria-describedby={status ? 'order-status' : undefined}
    >
      <h2 style={styles.h2}>{copy.physioOrderTitle}</h2>

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>{copy.patientDetails}</legend>
        <div style={styles.grid}>
          <Field id="physio-patient-name" label={copy.patientName} required>
            <input
              id="physio-patient-name"
              className="alo-input"
              type="text"
              value={physio.patientName}
              onChange={(event) => updatePhysio('patientName', event.target.value)}
              autoComplete="name"
              aria-required="true"
            />
          </Field>

          <Field id="physio-patient-mobile" label={copy.patientMobile} required>
            <input
              id="physio-patient-mobile"
              className="alo-input"
              type="tel"
              inputMode="tel"
              value={physio.patientMobile}
              onChange={(event) => updatePhysio('patientMobile', event.target.value)}
              placeholder={copy.mobilePlaceholder}
              aria-required="true"
            />
          </Field>

          <Field id="physio-referral-id" label={copy.partnerReferralId} optionalLabel={copy.optional}>
            <input
              id="physio-referral-id"
              className="alo-input"
              type="text"
              value={physio.partnerReferralId}
              onChange={(event) => updatePhysio('partnerReferralId', event.target.value)}
              placeholder={copy.referralPlaceholder}
            />
          </Field>
        </div>
      </fieldset>

      <div style={styles.grid}>
        <Field id="physio-diagnosis" label={copy.diagnosis} required>
          <input
            id="physio-diagnosis"
            className="alo-input"
            type="text"
            value={physio.diagnosis}
            onChange={(event) => updatePhysio('diagnosis', event.target.value)}
            aria-required="true"
          />
        </Field>

        <Field id="physio-sessions-per-week" label={copy.sessionsPerWeek} required>
          <input
            id="physio-sessions-per-week"
            className="alo-input"
            type="number"
            min={1}
            value={physio.sessionsPerWeek}
            onChange={(event) => updatePhysio('sessionsPerWeek', Number(event.target.value) || 0)}
            aria-required="true"
          />
        </Field>

        <Field id="physio-duration-weeks" label={copy.durationWeeks} required>
          <input
            id="physio-duration-weeks"
            className="alo-input"
            type="number"
            min={1}
            value={physio.durationWeeks}
            onChange={(event) => updatePhysio('durationWeeks', Number(event.target.value) || 0)}
            aria-required="true"
          />
        </Field>
      </div>

      <Field id="physio-goals" label={copy.goals} optionalLabel={copy.optional}>
        <textarea
          id="physio-goals"
          className="alo-textarea"
          rows={3}
          value={physio.goals}
          onChange={(event) => updatePhysio('goals', event.target.value)}
          placeholder={copy.goalsPlaceholder}
        />
      </Field>

      <Field id="physio-clinical-notes" label={copy.clinicalNotes} optionalLabel={copy.optional}>
        <textarea
          id="physio-clinical-notes"
          className="alo-textarea"
          rows={3}
          value={physio.clinicalNotes}
          onChange={(event) => updatePhysio('clinicalNotes', event.target.value)}
        />
      </Field>

      {renderActions()}
    </form>
  );

  const homeNurseForm = (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submitActiveOrder();
      }}
      aria-describedby={status ? 'order-status' : undefined}
    >
      <h2 style={styles.h2}>{copy.homeNurseOrderTitle}</h2>
      <p style={styles.notice}>{copy.dispatchNotice}</p>

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>{copy.patientDetails}</legend>
        <div style={styles.grid}>
          <Field id="home-nurse-patient-name" label={copy.patientName} required>
            <input
              id="home-nurse-patient-name"
              className="alo-input"
              type="text"
              value={homeNurse.patientName}
              onChange={(event) => updateHomeNurse('patientName', event.target.value)}
              autoComplete="name"
              aria-required="true"
            />
          </Field>

          <Field id="home-nurse-patient-mobile" label={copy.patientMobile} required>
            <input
              id="home-nurse-patient-mobile"
              className="alo-input"
              type="tel"
              inputMode="tel"
              value={homeNurse.patientMobile}
              onChange={(event) => updateHomeNurse('patientMobile', event.target.value)}
              placeholder={copy.mobilePlaceholder}
              aria-required="true"
            />
          </Field>

          <Field id="home-nurse-referral-id" label={copy.partnerReferralId} optionalLabel={copy.optional}>
            <input
              id="home-nurse-referral-id"
              className="alo-input"
              type="text"
              value={homeNurse.partnerReferralId}
              onChange={(event) => updateHomeNurse('partnerReferralId', event.target.value)}
              placeholder={copy.referralPlaceholder}
            />
          </Field>
        </div>
      </fieldset>

      <div style={styles.grid}>
        <Field id="home-nurse-district" label={copy.district} required>
          <input
            id="home-nurse-district"
            className="alo-input"
            type="text"
            value={homeNurse.district}
            onChange={(event) => updateHomeNurse('district', event.target.value)}
            aria-required="true"
          />
        </Field>

        <Field id="home-nurse-skill-level" label={copy.skillLevel} required>
          <select
            id="home-nurse-skill-level"
            className="alo-select"
            value={homeNurse.skillLevel}
            onChange={(event) => updateHomeNurse('skillLevel', event.target.value)}
            aria-required="true"
          >
            <option value="">{copy.selectSkill}</option>
            {skillOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="home-nurse-start-date" label={copy.preferredStartDate}>
          <input
            id="home-nurse-start-date"
            className="alo-input"
            type="date"
            value={homeNurse.preferredStartDate}
            onChange={(event) => updateHomeNurse('preferredStartDate', event.target.value)}
          />
        </Field>
      </div>

      <Field id="home-nurse-address" label={copy.address} required>
        <textarea
          id="home-nurse-address"
          className="alo-textarea"
          rows={2}
          value={homeNurse.address}
          onChange={(event) => updateHomeNurse('address', event.target.value)}
          placeholder={copy.addressPlaceholder}
          aria-required="true"
        />
      </Field>

      <Field id="home-nurse-visit-reason" label={copy.visitReason} required>
        <textarea
          id="home-nurse-visit-reason"
          className="alo-textarea"
          rows={3}
          value={homeNurse.visitReason}
          onChange={(event) => updateHomeNurse('visitReason', event.target.value)}
          aria-required="true"
        />
      </Field>

      <Field id="home-nurse-clinical-notes" label={copy.clinicalNotes} optionalLabel={copy.optional}>
        <textarea
          id="home-nurse-clinical-notes"
          className="alo-textarea"
          rows={3}
          value={homeNurse.clinicalNotes}
          onChange={(event) => updateHomeNurse('clinicalNotes', event.target.value)}
        />
      </Field>

      {renderActions()}
    </form>
  );

  return (
    <section dir={dir} style={styles.root}>
      <style>{globalCss}</style>

      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>{copy.appTitle}</h1>
          <p style={styles.subtitle}>{copy.subtitle}</p>
        </div>

        <div style={styles.controls}>
          <div>
            <label htmlFor="persona-select" style={styles.label}>
              {copy.persona}
            </label>
            <select
              id="persona-select"
              className="alo-select"
              value={persona}
              onChange={(event) => handlePersonaChange(event.target.value as PersonaId)}
            >
              {PERSONA_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {locale === 'ar' ? profile.labelAr : profile.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="locale-select" style={styles.label}>
              {copy.locale}
            </label>
            <select
              id="locale-select"
              className="alo-select"
              value={locale}
              onChange={(event) => handleLocaleChange(event.target.value as AloLocale)}
            >
              <option value="ar">{copy.arabic}</option>
              <option value="en">{copy.english}</option>
            </select>
          </div>
        </div>
      </header>

      <nav aria-label={copy.tabNavigation}>
        <div role="tablist" aria-label={copy.tabNavigation} style={styles.tablist}>
          {ORDER_CODES.map((code) => (
            <button
              key={code}
              ref={(element) => {
                tabRefs.current[code] = element;
              }}
              type="button"
              role="tab"
              id={`tab-${code}`}
              aria-selected={activeCode === code}
              aria-controls={`panel-${code}`}
              tabIndex={activeCode === code ? 0 : -1}
              className="alo-tab"
              onClick={() => setActiveCode(code)}
              onKeyDown={(event) => handleTabKeyDown(event, code)}
            >
              {code === 'L01' && copy.lab}
              {code === 'H01' && copy.pharmacy}
              {code === 'T01' && copy.physio}
              {code === 'V01' && copy.homeNurse}
            </button>
          ))}
        </div>
      </nav>

      {status ? (
        <div
          id="order-status"
          ref={statusRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="alo-status"
          style={{
            ...styles.statusBox,
            ...(status.tone === 'success' ? styles.statusSuccess : styles.statusWarning),
          }}
        >
          <p style={{ margin: 0 }}>{status.text}</p>
          {status.notes.length > 0 ? (
            <ul style={{ margin: '8px 0 0', paddingInlineStart: 20 }}>
              {status.notes.map((note, index) => (
                <li key={`${note}-${index}`}>{note}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {ORDER_CODES.map((code) => (
        <div
          key={code}
          role="tabpanel"
          id={`panel-${code}`}
          aria-labelledby={`tab-${code}`}
          hidden={activeCode !== code}
          style={styles.panel}
        >
          {code === 'L01' && labForm}
          {code === 'H01' && pharmacyForm}
          {code === 'T01' && physioForm}
          {code === 'V01' && homeNurseForm}
        </div>
      ))}

      <section aria-label={copy.recentOrders} style={styles.ordersSection}>
        <h2 style={styles.h2}>{copy.recentOrders}</h2>

        {orders.length === 0 ? (
          <p style={{ margin: 0 }}>{copy.noOrders}</p>
        ) : (
          <ul style={styles.orderList}>
            {orders.map((order) => (
              <li key={order.id} style={styles.orderItem}>
                <strong>{order.code}</strong>
                <span>{order.payload.patientName || copy.patient}</span>
                <span style={order.status === 'submitted' ? styles.chipSubmitted : styles.chipReview}>
                  {order.status === 'submitted' ? copy.statusSubmitted : copy.statusReview}
                </span>
                <time dateTime={order.createdAt}>
                  {new Date(order.createdAt).toLocaleString(locale === 'ar' ? 'ar' : 'en-US')}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

export default Stage7SaudiPartnerOrders;
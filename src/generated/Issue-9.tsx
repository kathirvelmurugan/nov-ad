import React, { useCallback, useEffect, useMemo, useReducer, useRef, useId } from 'react';

export type AloDoctorLocale = 'ar' | 'en';

export type AloDoctorPersonaId =
  | 'patient'
  | 'guardian'
  | 'physician'
  | 'nurse'
  | 'pharmacist'
  | 'care_team_lead'
  | 'care_coordinator'
  | 'quality_officer'
  | 'compliance_officer'
  | 'support_agent'
  | 'admin';

export interface AloDoctorPersonaProfile {
  id: AloDoctorPersonaId;
  displayName?: string;
}

export const PERSONA_IDS: AloDoctorPersonaId[] = [
  'patient',
  'guardian',
  'physician',
  'nurse',
  'pharmacist',
  'care_team_lead',
  'care_coordinator',
  'quality_officer',
  'compliance_officer',
  'support_agent',
  'admin',
];

export const PERSONA_LABELS: Record<AloDoctorPersonaId, Record<AloDoctorLocale, string>> = {
  patient: { ar: 'المريض', en: 'Patient' },
  guardian: { ar: 'ولي الأمر', en: 'Guardian' },
  physician: { ar: 'الطبيب', en: 'Physician' },
  nurse: { ar: 'التمريض', en: 'Nurse' },
  pharmacist: { ar: 'الصيدلي', en: 'Pharmacist' },
  care_team_lead: { ar: 'قائد فريق الرعاية', en: 'Care Team Lead' },
  care_coordinator: { ar: 'منسق الرعاية', en: 'Care Coordinator' },
  quality_officer: { ar: 'مسؤول الجودة', en: 'Quality Officer' },
  compliance_officer: { ar: 'مسؤول الالتزام', en: 'Compliance Officer' },
  support_agent: { ar: 'وكيل الدعم', en: 'Support Agent' },
  admin: { ar: 'مدير النظام', en: 'Administrator' },
};

export type CaseClosureOutcome =
  | 'resolved'
  | 'improved'
  | 'referred'
  | 'escalated'
  | 'self_managed'
  | 'no_further_follow_up_needed';

export const CLOSURE_OUTCOMES: CaseClosureOutcome[] = [
  'resolved',
  'improved',
  'referred',
  'escalated',
  'self_managed',
  'no_further_follow_up_needed',
];

export const CLOSURE_OUTCOME_LABELS: Record<CaseClosureOutcome, Record<AloDoctorLocale, string>> = {
  resolved: { ar: 'تم الحل', en: 'Resolved' },
  improved: { ar: 'تحسن', en: 'Improved' },
  referred: { ar: 'تمت الإحالة', en: 'Referred' },
  escalated: { ar: 'تم التصعيد', en: 'Escalated' },
  self_managed: { ar: 'إدارة ذاتية', en: 'Self-managed' },
  no_further_follow_up_needed: { ar: 'لا حاجة لمتابعة إضافية', en: 'No further follow-up needed' },
};

export type StarRating = 1 | 2 | 3 | 4 | 5;
export type NpsScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type NpsSegment = 'promoter' | 'passive' | 'detractor';

export interface FollowUpChatMessage {
  id: string;
  senderPersona: AloDoctorPersonaId;
  senderName: string;
  body: string;
  sentAt: string;
}

export interface CaseClosureRecord {
  outcome: CaseClosureOutcome;
  clinicalSummary: string;
  patientInstructions: string;
  archiveConsent: boolean;
  closedAt: string;
  closedBy?: string;
}

export interface CaseClosureInput {
  outcome: CaseClosureOutcome;
  clinicalSummary: string;
  patientInstructions: string;
  archiveConsent: boolean;
}

export interface SurveyInput {
  starRating: StarRating;
  npsScore?: NpsScore;
  comments: string;
  whatsappConsent: boolean;
}

export interface FollowUpSurveyRecord extends SurveyInput {
  submittedAt: string;
  whatsappSentAt?: string | null;
}

export interface FollowUpCaseRecord {
  id: string;
  patientId: string;
  patientName: string;
  whatsappPhone?: string;
  careTeamName?: string;
  followUpStartAt: string;
  status: 'active' | 'closed' | 'archived';
  closedAt?: string | null;
  archivedAt?: string | null;
  closure?: CaseClosureRecord | null;
  survey?: FollowUpSurveyRecord | null;
}

export interface FollowUpWindow {
  startedAt: Date;
  endsAt: Date;
  isActive: boolean;
  daysRemaining: number;
  expired: boolean;
}

export interface WhatsAppW20TemplatePayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: 'alo_doctor_followup_w20';
    language: { code: AloDoctorLocale };
    components: Array<{
      type: 'body';
      parameters: Array<{ type: 'text'; text: string }>;
    }>;
  };
}

export interface FollowUpCaseClosureProps {
  locale: AloDoctorLocale;
  persona: AloDoctorPersonaProfile;
  caseRecord: FollowUpCaseRecord;
  messages: FollowUpChatMessage[];
  now?: Date;
  onSendMessage?: (body: string) => Promise<void> | void;
  onCloseCase?: (input: CaseClosureInput) => Promise<void> | void;
  onArchiveCase?: () => Promise<void> | void;
  onSubmitSurvey?: (input: SurveyInput) => Promise<void> | void;
  onPersonaChange?: (personaId: AloDoctorPersonaId) => void;
  onWhatsAppSurveyOpen?: (url: string) => void;
}

export const FOLLOW_UP_WINDOW_DAYS = 21;
const DAY_MS = 86_400_000;

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function getFollowUpWindow(startAt: string | Date, now: Date): FollowUpWindow {
  const startedAt = typeof startAt === 'string' ? new Date(startAt) : startAt;

  if (Number.isNaN(startedAt.getTime())) {
    const invalid = new Date(0);
    return {
      startedAt: invalid,
      endsAt: invalid,
      isActive: false,
      daysRemaining: 0,
      expired: true,
    };
  }

  const endsAt = addDays(startedAt, FOLLOW_UP_WINDOW_DAYS);
  const msRemaining = endsAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / DAY_MS));
  const isActive = msRemaining >= 0;

  return {
    startedAt,
    endsAt,
    isActive,
    daysRemaining,
    expired: !isActive,
  };
}

export function formatDateTime(value: string | Date, locale: AloDoctorLocale): string {
  const date = typeof value === 'string' ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function normalizeSaudiWhatsAppPhone(phone?: string): string | undefined {
  if (!phone) {
    return undefined;
  }

  let digits = phone.replace(/[^\d]/g, '');

  if (!digits) {
    return undefined;
  }

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0')) {
    digits = `966${digits.slice(1)}`;
  }

  if (digits.startsWith('5') && digits.length === 9) {
    digits = `966${digits}`;
  }

  return digits;
}

export function deriveNpsSegment(starRating: StarRating, npsScore?: NpsScore): NpsSegment {
  if (typeof npsScore === 'number') {
    if (npsScore >= 9) {
      return 'promoter';
    }

    if (npsScore >= 7) {
      return 'passive';
    }

    return 'detractor';
  }

  if (starRating >= 5) {
    return 'promoter';
  }

  if (starRating >= 4) {
    return 'passive';
  }

  return 'detractor';
}

export function buildWhatsAppW20SurveyMessage(args: {
  locale: AloDoctorLocale;
  caseId: string;
  patientName: string;
  rating?: StarRating;
  careTeamName?: string;
}): string {
  const team = args.careTeamName ?? 'ALO DOCTOR';

  if (args.locale === 'ar') {
    const lines = [
      `السلام عليكم ${args.patientName}،`,
      `مع فريق ${team} بخصوص متابعة الحالة رقم ${args.caseId} خلال 21 يوماً (استبيان W20).`,
      'نرجو تقييم رضاك عن الخدمة من 5 نجوم:',
      '5 = ممتاز ⭐⭐⭐⭐⭐',
      '4 = جيد جداً ⭐⭐⭐⭐',
      '3 = جيد ⭐⭐⭐',
      '2 = مقبول ⭐⭐',
      '1 = ضعيف ⭐',
    ];

    if (args.rating) {
      lines.push(`التقييم المحدد: ${args.rating} من 5.`);
    } else {
      lines.push('أرسل رقم التقييم فقط من 1 إلى 5.');
    }

    lines.push('شكراً لك.');
    return lines.join('\n');
  }

  const lines = [
    `Hello ${args.patientName},`,
    `${team} follow-up for case ${args.caseId} within the 21-day window (survey W20).`,
    'Please rate your satisfaction from 5 stars:',
    '5 = Excellent ⭐⭐⭐⭐⭐',
    '4 = Very good ⭐⭐⭐⭐',
    '3 = Good ⭐⭐⭐',
    '2 = Fair ⭐⭐',
    '1 = Poor ⭐',
  ];

  if (args.rating) {
    lines.push(`Selected rating: ${args.rating} out of 5.`);
  } else {
    lines.push('Reply with a number from 1 to 5.');
  }

  lines.push('Thank you.');
  return lines.join('\n');
}

export function buildWhatsAppW20SurveyUrl(args: {
  phone?: string;
  locale: AloDoctorLocale;
  caseId: string;
  patientName: string;
  rating?: StarRating;
  careTeamName?: string;
}): string {
  const phone = normalizeSaudiWhatsAppPhone(args.phone);
  const text = encodeURIComponent(buildWhatsAppW20SurveyMessage(args));

  if (phone) {
    return `https://wa.me/${phone}?text=${text}`;
  }

  return `https://wa.me/?text=${text}`;
}

export function buildWhatsAppW20TemplatePayload(args: {
  to: string;
  locale: AloDoctorLocale;
  caseId: string;
  patientName: string;
  rating?: StarRating;
  careTeamName?: string;
}): WhatsAppW20TemplatePayload {
  const phone = normalizeSaudiWhatsAppPhone(args.to) ?? args.to;

  return {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'alo_doctor_followup_w20',
      language: { code: args.locale },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: args.patientName },
            { type: 'text', text: args.caseId },
            { type: 'text', text: args.rating ? String(args.rating) : '_' },
            { type: 'text', text: args.careTeamName ?? 'ALO DOCTOR' },
          ],
        },
      ],
    },
  };
}

export function isCaseClosed(caseRecord: FollowUpCaseRecord): boolean {
  return Boolean(caseRecord.closedAt) || caseRecord.status === 'closed' || caseRecord.status === 'archived';
}

export function canUseFollowUpChat(
  personaId: AloDoctorPersonaId,
  caseRecord: FollowUpCaseRecord,
  followUpWindow: FollowUpWindow
): boolean {
  if (caseRecord.status === 'archived' || !followUpWindow.isActive) {
    return false;
  }

  const allowed: AloDoctorPersonaId[] = [
    'patient',
    'guardian',
    'physician',
    'nurse',
    'pharmacist',
    'care_team_lead',
    'care_coordinator',
    'support_agent',
  ];

  return allowed.includes(personaId);
}

export function canCloseCase(personaId: AloDoctorPersonaId): boolean {
  return [
    'physician',
    'nurse',
    'pharmacist',
    'care_team_lead',
    'care_coordinator',
    'admin',
  ].includes(personaId);
}

export function canArchiveCase(personaId: AloDoctorPersonaId): boolean {
  return canCloseCase(personaId) || personaId === 'quality_officer';
}

export function canSubmitSurvey(personaId: AloDoctorPersonaId): boolean {
  return [
    'patient',
    'guardian',
    'physician',
    'nurse',
    'care_coordinator',
    'support_agent',
    'admin',
  ].includes(personaId);
}

type View = 'chat' | 'closure' | 'survey';
type LocalStarRating = 0 | StarRating;
type LocalNpsScore = '' | NpsScore;

type MessageKey =
  | 'messageSent'
  | 'closureSaved'
  | 'surveySaved'
  | 'archived'
  | 'messageRequired'
  | 'chatUnavailable'
  | 'closureSummaryRequired'
  | 'closureConsentRequired'
  | 'surveyRatingRequired'
  | 'sendFailed'
  | 'closureFailed'
  | 'surveyFailed'
  | 'archiveFailed'
  | 'handlerMissing';

const MESSAGES: Record<MessageKey, Record<AloDoctorLocale, string>> = {
  messageSent: { ar: 'تم إرسال الرسالة.', en: 'Message sent.' },
  closureSaved: { ar: 'تم إغلاق الحالة وحفظ التفاصيل.', en: 'Case closed and details saved.' },
  surveySaved: { ar: 'تم حفظ استبيان W20.', en: 'W20 survey saved.' },
  archived: { ar: 'تمت أرشفة الحالة.', en: 'Case archived.' },
  messageRequired: { ar: 'لا يمكن إرسال رسالة فارغة.', en: 'Cannot send an empty message.' },
  chatUnavailable: { ar: 'المحادثة غير متاحة حالياً.', en: 'Chat is currently unavailable.' },
  closureSummaryRequired: { ar: 'الملخص السريري مطلوب.', en: 'Clinical summary is required.' },
  closureConsentRequired: { ar: 'موافقة الأرشفة مطلوبة.', en: 'Archive consent is required.' },
  surveyRatingRequired: { ar: 'يرجى اختيار تقييم من 5 نجوم.', en: 'Please select a 5-star rating.' },
  sendFailed: { ar: 'تعذر إرسال الرسالة.', en: 'The message could not be sent.' },
  closureFailed: { ar: 'تعذر إغلاق الحالة.', en: 'The case could not be closed.' },
  surveyFailed: { ar: 'تعذر حفظ الاستبيان.', en: 'The survey could not be saved.' },
  archiveFailed: { ar: 'تعذر أرشفة الحالة.', en: 'The case could not be archived.' },
  handlerMissing: { ar: 'خدمة الحفظ غير متوفرة.', en: 'Save service is unavailable.' },
};

interface LocalClosureState {
  outcome: CaseClosureOutcome;
  clinicalSummary: string;
  patientInstructions: string;
  archiveConsent: boolean;
}

interface LocalSurveyState {
  starRating: LocalStarRating;
  npsScore: LocalNpsScore;
  comments: string;
  whatsappConsent: boolean;
}

interface FollowUpUiState {
  view: View;
  draft: string;
  sending: boolean;
  submittingClosure: boolean;
  submittingSurvey: boolean;
  archiving: boolean;
  errorKey: MessageKey | null;
  noticeKey: MessageKey | null;
  closure: LocalClosureState;
  survey: LocalSurveyState;
}

type FollowUpUiAction =
  | { type: 'RESET'; state: FollowUpUiState }
  | { type: 'SET_VIEW'; view: View }
  | { type: 'SET_DRAFT'; draft: string }
  | { type: 'SET_CLOSURE'; patch: Partial<LocalClosureState> }
  | { type: 'SET_SURVEY'; patch: Partial<LocalSurveyState> }
  | { type: 'SET_SENDING'; value: boolean }
  | { type: 'SET_SUBMITTING_CLOSURE'; value: boolean }
  | { type: 'SET_SUBMITTING_SURVEY'; value: boolean }
  | { type: 'SET_ARCHIVING'; value: boolean }
  | { type: 'MESSAGE_SENT' }
  | { type: 'CLOSURE_SAVED'; view: View }
  | { type: 'SURVEY_SAVED' }
  | { type: 'ARCHIVE_SAVED' }
  | { type: 'SET_ERROR'; key: MessageKey }
  | { type: 'SET_NOTICE'; key: MessageKey };

function createInitialState(caseRecord: FollowUpCaseRecord): FollowUpUiState {
  return {
    view: caseRecord.survey ? 'survey' : isCaseClosed(caseRecord) ? 'survey' : 'chat',
    draft: '',
    sending: false,
    submittingClosure: false,
    submittingSurvey: false,
    archiving: false,
    errorKey: null,
    noticeKey: null,
    closure: {
      outcome: caseRecord.closure?.outcome ?? 'resolved',
      clinicalSummary: caseRecord.closure?.clinicalSummary ?? '',
      patientInstructions: caseRecord.closure?.patientInstructions ?? '',
      archiveConsent: Boolean(caseRecord.closure?.archiveConsent ?? false),
    },
    survey: {
      starRating: caseRecord.survey?.starRating ?? 0,
      npsScore: caseRecord.survey?.npsScore ?? '',
      comments: caseRecord.survey?.comments ?? '',
      whatsappConsent: false,
    },
  };
}

function reducer(state: FollowUpUiState, action: FollowUpUiAction): FollowUpUiState {
  switch (action.type) {
    case 'RESET':
      return action.state;
    case 'SET_VIEW':
      return { ...state, view: action.view, errorKey: null };
    case 'SET_DRAFT':
      return {
        ...state,
        draft: action.draft,
        errorKey: state.errorKey === 'messageRequired' ? null : state.errorKey,
      };
    case 'SET_CLOSURE':
      return {
        ...state,
        closure: { ...state.closure, ...action.patch },
        errorKey: null,
      };
    case 'SET_SURVEY':
      return {
        ...state,
        survey: { ...state.survey, ...action.patch },
        errorKey: state.errorKey === 'surveyRatingRequired' ? null : state.errorKey,
      };
    case 'SET_SENDING':
      return { ...state, sending: action.value };
    case 'SET_SUBMITTING_CLOSURE':
      return { ...state, submittingClosure: action.value };
    case 'SET_SUBMITTING_SURVEY':
      return { ...state, submittingSurvey: action.value };
    case 'SET_ARCHIVING':
      return { ...state, archiving: action.value };
    case 'MESSAGE_SENT':
      return { ...state, sending: false, draft: '', noticeKey: 'messageSent', errorKey: null };
    case 'CLOSURE_SAVED':
      return {
        ...state,
        submittingClosure: false,
        view: action.view,
        noticeKey: 'closureSaved',
        errorKey: null,
      };
    case 'SURVEY_SAVED':
      return { ...state, submittingSurvey: false, noticeKey: 'surveySaved', errorKey: null };
    case 'ARCHIVE_SAVED':
      return { ...state, archiving: false, noticeKey: 'archived', errorKey: null };
    case 'SET_ERROR':
      return {
        ...state,
        sending: false,
        submittingClosure: false,
        submittingSurvey: false,
        archiving: false,
        errorKey: action.key,
        noticeKey: null,
      };
    case 'SET_NOTICE':
      return { ...state, noticeKey: action.key, errorKey: null };
    default:
      return state;
  }
}

const STYLES = `
.alodoctor-stage89 {
  --alo-primary:#007B6E;
  --alo-accent:#00C6AE;
  --alo-surface:#E6FAF7;
  --alo-whatsapp:#25D366;
  --alo-text:#0B2E2A;
  --alo-border:#9ED8CF;
  --alo-danger:#B42318;
  --alo-success:#067647;
  font-family:'Cairo','Segoe UI',Tahoma,sans-serif;
  color:var(--alo-text);
  background:linear-gradient(180deg,#FFFFFF, var(--alo-surface));
  border:1px solid rgba(0,123,110,0.14);
  border-radius:20px;
  padding:16px;
  display:grid;
  gap:14px;
}
.alodoctor-stage89 *,
.alodoctor-stage89 *::before,
.alodoctor-stage89 *::after {
  box-sizing:border-box;
}
.alodoctor-stage89 [hidden] {
  display:none !important;
}
.alodoctor-header {
  display:flex;
  flex-wrap:wrap;
  gap:12px;
  justify-content:space-between;
  align-items:flex-start;
}
.alodoctor-title {
  margin:0;
  font-size:1.35rem;
  font-weight:800;
  color:var(--alo-primary);
}
.alodoctor-subtitle {
  margin:4px 0 0;
  color:#3E5D58;
  font-size:0.95rem;
}
.alodoctor-meta {
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin:10px 0 0;
  padding:0;
  list-style:none;
}
.alodoctor-chip {
  border:1px solid var(--alo-border);
  background:#FFFFFF;
  color:var(--alo-primary);
  border-radius:999px;
  padding:6px 10px;
  font-size:0.85rem;
  font-weight:700;
}
.alodoctor-chip-success {
  background:#ECFDF3;
  color:var(--alo-success);
  border-color:#A6F4C5;
}
.alodoctor-chip-warning {
  background:#FFFAEB;
  color:#B54708;
  border-color:#FEDF89;
}
.alodoctor-persona {
  min-width:230px;
  display:grid;
  gap:6px;
  align-content:start;
}
.alodoctor-label {
  font-weight:800;
  font-size:0.92rem;
}
.alodoctor-select,
.alodoctor-textarea {
  width:100%;
  border:1px solid var(--alo-border);
  border-radius:12px;
  padding:10px 12px;
  font:inherit;
  color:inherit;
  background:#FFFFFF;
  min-height:44px;
}
.alodoctor-textarea {
  min-height:96px;
  resize:vertical;
}
.alodoctor-select:focus-visible,
.alodoctor-textarea:focus-visible,
.alodoctor-tab:focus-visible,
.alodoctor-button:focus-visible,
.alodoctor-star-input:focus-visible + .alodoctor-star {
  outline:3px solid var(--alo-accent);
  outline-offset:2px;
  border-color:var(--alo-primary);
}
.alodoctor-tabs {
  display:flex;
  flex-wrap:wrap;
  gap:8px;
}
.alodoctor-tab {
  border:1px solid var(--alo-border);
  background:#FFFFFF;
  color:var(--alo-primary);
  border-radius:999px;
  padding:10px 16px;
  font-weight:800;
  cursor:pointer;
  min-height:44px;
  font:inherit;
}
.alodoctor-tab[aria-selected="true"] {
  background:var(--alo-primary);
  border-color:var(--alo-primary);
  color:#FFFFFF;
}
.alodoctor-card {
  background:#FFFFFF;
  border:1px solid rgba(0,123,110,0.16);
  border-radius:16px;
  padding:16px;
  box-shadow:0 8px 24px rgba(0,75,68,0.08);
}
.alodoctor-panel {
  display:grid;
  gap:12px;
}
.alodoctor-alert {
  border-radius:12px;
  padding:10px 12px;
  font-weight:700;
  margin:0;
}
.alodoctor-alert-error {
  background:#FEF3F2;
  color:var(--alo-danger);
  border:1px solid #FDA29B;
}
.alodoctor-alert-success {
  background:#ECFDF3;
  color:var(--alo-success);
  border:1px solid #A6F4C5;
}
.alodoctor-alert-info {
  background:var(--alo-surface);
  color:#075A50;
  border:1px solid var(--alo-border);
}
.alodoctor-chat-log {
  max-height:360px;
  overflow:auto;
  display:grid;
  gap:10px;
  padding:12px;
  background:linear-gradient(180deg,#FFFFFF, var(--alo-surface));
  border:1px solid var(--alo-border);
  border-radius:12px;
}
.alodoctor-message {
  max-width:min(82%, 52ch);
  display:grid;
  gap:4px;
  padding:10px 12px;
  border-radius:14px;
  border:1px solid var(--alo-border);
  background:#FFFFFF;
}
.alodoctor-message.is-mine {
  background:var(--alo-surface);
  border-color:var(--alo-accent);
  justify-self:end;
}
.alodoctor-message.is-other {
  justify-self:start;
}
.alodoctor-message-sender {
  font-size:0.8rem;
  font-weight:800;
  color:var(--alo-primary);
}
.alodoctor-message-body {
  margin:0;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
}
.alodoctor-message time {
  font-size:0.75rem;
  color:#5B7B76;
}
.alodoctor-composer,
.alodoctor-field,
.alodoctor-definition {
  display:grid;
  gap:8px;
}
.alodoctor-definition div {
  display:grid;
  gap:2px;
}
.alodoctor-definition dt {
  font-weight:800;
  color:var(--alo-primary);
}
.alodoctor-definition dd {
  margin:0;
}
.alodoctor-actions {
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  align-items:center;
}
.alodoctor-button {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:44px;
  border-radius:12px;
  border:1px solid var(--alo-primary);
  background:var(--alo-primary);
  color:#FFFFFF;
  padding:10px 14px;
  font:inherit;
  font-weight:800;
  cursor:pointer;
  text-decoration:none;
}
.alodoctor-button:disabled {
  opacity:0.55;
  cursor:not-allowed;
}
.alodoctor-button-secondary {
  background:#FFFFFF;
  color:var(--alo-primary);
}
.alodoctor-button-whatsapp {
  background:var(--alo-whatsapp);
  border-color:var(--alo-whatsapp);
  color:#083B24;
}
.alodoctor-fieldset {
  border:1px solid var(--alo-border);
  border-radius:12px;
  padding:12px;
  margin:0;
  display:grid;
  gap:8px;
}
.alodoctor-fieldset legend {
  font-weight:800;
  color:var(--alo-primary);
  padding-inline:6px;
}
.alodoctor-stars {
  display:flex;
  gap:6px;
  direction:ltr;
  justify-content:flex-start;
  align-items:center;
}
.alodoctor-star {
  font-size:2rem;
  line-height:1;
  color:#B9D9D4;
  cursor:pointer;
  padding:4px;
  border-radius:8px;
  user-select:none;
}
.alodoctor-star.is-selected {
  color:var(--alo-primary);
}
.alodoctor-fieldset:disabled .alodoctor-star {
  opacity:0.6;
  cursor:not-allowed;
}
.alodoctor-checkbox {
  display:flex;
  gap:8px;
  align-items:flex-start;
  font-weight:600;
}
.alodoctor-checkbox input {
  width:20px;
  height:20px;
  margin-top:2px;
  accent-color:var(--alo-primary);
}
.alodoctor-whatsapp-preview {
  margin:0;
  background:#F4FFFB;
  border:1px dashed var(--alo-whatsapp);
  border-radius:12px;
  padding:12px;
  white-space:pre-wrap;
  font-size:0.9rem;
  font-family:inherit;
}
.alodoctor-muted {
  color:#41625D;
  font-size:0.9rem;
  margin:0;
}
.alodoctor-small {
  font-size:0.85rem;
}
.alodoctor-required {
  color:var(--alo-danger);
  font-weight:900;
}
.alodoctor-visually-hidden {
  position:absolute !important;
  width:1px;
  height:1px;
  margin:-1px;
  padding:0;
  overflow:hidden;
  clip:rect(0 0 0 0);
  white-space:nowrap;
  border:0;
}
@media (max-width: 720px) {
  .alodoctor-header {
    align-items:stretch;
  }
  .alodoctor-persona {
    width:100%;
  }
}
`;

export function FollowUpCaseClosure({
  locale,
  persona,
  caseRecord,
  messages,
  now: providedNow,
  onSendMessage,
  onCloseCase,
  onArchiveCase,
  onSubmitSurvey,
  onPersonaChange,
  onWhatsAppSurveyOpen,
}: FollowUpCaseClosureProps) {
  const rawId = useId();
  const idBase = useMemo(() => `alo-followup-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [rawId]);
  const chatLogRef = useRef<HTMLDivElement | null>(null);

  const [state, dispatch] = useReducer(reducer, caseRecord, createInitialState);

  const t = useCallback((value: Record<AloDoctorLocale, string>) => value[locale], [locale]);
  const translateMessage = useCallback(
    (key: MessageKey | null) => (key ? MESSAGES[key][locale] : null),
    [locale]
  );

  const now = useMemo(() => providedNow ?? new Date(), [providedNow]);
  const followUpWindow = useMemo(
    () => getFollowUpWindow(caseRecord.followUpStartAt, now),
    [caseRecord.followUpStartAt, now]
  );

  const sortedMessages = useMemo(() => {
    const toTime = (value: string) => {
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    return [...messages].sort((a, b) => toTime(a.sentAt) - toTime(b.sentAt));
  }, [messages]);

  const closed = isCaseClosed(caseRecord);
  const chatAllowed = canUseFollowUpChat(persona.id, caseRecord, followUpWindow);
  const canCompose = chatAllowed && Boolean(onSendMessage);
  const closureAllowed = canCloseCase(persona.id);
  const archiveAllowed = canArchiveCase(persona.id);
  const surveyAllowed = canSubmitSurvey(persona.id);
  const surveyAvailable = closed || followUpWindow.expired || Boolean(caseRecord.survey);
  const existingSurvey = caseRecord.survey ?? null;

  useEffect(() => {
    dispatch({ type: 'RESET', state: createInitialState(caseRecord) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseRecord.id]);

  useEffect(() => {
    const node = chatLogRef.current;

    if (node && state.view === 'chat') {
      node.scrollTop = node.scrollHeight;
    }
  }, [sortedMessages.length, state.view]);

  const handlePersonaChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextPersona = event.target.value as AloDoctorPersonaId;
      onPersonaChange?.(nextPersona);
    },
    [onPersonaChange]
  );

  const handleSendMessage = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      const body = state.draft.trim();

      if (!canCompose) {
        dispatch({ type: 'SET_ERROR', key: 'chatUnavailable' });
        return;
      }

      if (!body) {
        dispatch({ type: 'SET_ERROR', key: 'messageRequired' });
        return;
      }

      if (!onSendMessage) {
        dispatch({ type: 'SET_ERROR', key: 'handlerMissing' });
        return;
      }

      dispatch({ type: 'SET_SENDING', value: true });

      try {
        await onSendMessage(body);
        dispatch({ type: 'MESSAGE_SENT' });
      } catch {
        dispatch({ type: 'SET_ERROR', key: 'sendFailed' });
      }
    },
    [state.draft, canCompose, onSendMessage]
  );

  const handleComposerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        void handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleClosureSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!closureAllowed) {
        return;
      }

      if (!state.closure.clinicalSummary.trim()) {
        dispatch({ type: 'SET_ERROR', key: 'closureSummaryRequired' });
        return;
      }

      if (!state.closure.archiveConsent) {
        dispatch({ type: 'SET_ERROR', key: 'closureConsentRequired' });
        return;
      }

      if (!onCloseCase) {
        dispatch({ type: 'SET_ERROR', key: 'handlerMissing' });
        return;
      }

      dispatch({ type: 'SET_SUBMITTING_CLOSURE', value: true });

      const input: CaseClosureInput = {
        outcome: state.closure.outcome,
        clinicalSummary: state.closure.clinicalSummary.trim(),
        patientInstructions: state.closure.patientInstructions.trim(),
        archiveConsent: state.closure.archiveConsent,
      };

      try {
        await onCloseCase(input);
      } catch {
        dispatch({ type: 'SET_ERROR', key: 'closureFailed' });
        return;
      }

      if (input.archiveConsent && onArchiveCase) {
        try {
          await onArchiveCase();
        } catch {
          dispatch({ type: 'SET_ERROR', key: 'archiveFailed' });
          return;
        }
      }

      dispatch({ type: 'CLOSURE_SAVED', view: 'survey' });
    },
    [closureAllowed, state.closure, onCloseCase, onArchiveCase]
  );

  const handleArchive = useCallback(async () => {
    if (!archiveAllowed || !onArchiveCase) {
      return;
    }

    dispatch({ type: 'SET_ARCHIVING', value: true });

    try {
      await onArchiveCase();
      dispatch({ type: 'ARCHIVE_SAVED' });
    } catch {
      dispatch({ type: 'SET_ERROR', key: 'archiveFailed' });
    }
  }, [archiveAllowed, onArchiveCase]);

  const handleSurveySubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!surveyAllowed) {
        return;
      }

      if (state.survey.starRating === 0) {
        dispatch({ type: 'SET_ERROR', key: 'surveyRatingRequired' });
        return;
      }

      if (!onSubmitSurvey) {
        dispatch({ type: 'SET_ERROR', key: 'handlerMissing' });
        return;
      }

      dispatch({ type: 'SET_SUBMITTING_SURVEY', value: true });

      const input: SurveyInput = {
        starRating: state.survey.starRating as StarRating,
        npsScore: state.survey.npsScore === '' ? undefined : state.survey.npsScore,
        comments: state.survey.comments.trim(),
        whatsappConsent: state.survey.whatsappConsent,
      };

      try {
        await onSubmitSurvey(input);
        dispatch({ type: 'SURVEY_SAVED' });
      } catch {
        dispatch({ type: 'SET_ERROR', key: 'surveyFailed' });
      }
    },
    [surveyAllowed, state.survey, onSubmitSurvey]
  );

  const whatsappUrl = useMemo(
    () =>
      buildWhatsAppW20SurveyUrl({
        phone: caseRecord.whatsappPhone,
        locale,
        caseId: caseRecord.id,
        patientName: caseRecord.patientName,
        rating: state.survey.starRating === 0 ? undefined : (state.survey.starRating as StarRating),
        careTeamName: caseRecord.careTeamName,
      }),
    [
      caseRecord.whatsappPhone,
      locale,
      caseRecord.id,
      caseRecord.patientName,
      state.survey.starRating,
      caseRecord.careTeamName,
    ]
  );

  const whatsappMessage = useMemo(
    () =>
      buildWhatsAppW20SurveyMessage({
        locale,
        caseId: caseRecord.id,
        patientName: caseRecord.patientName,
        rating: state.survey.starRating === 0 ? undefined : (state.survey.starRating as StarRating),
        careTeamName: caseRecord.careTeamName,
      }),
    [locale, caseRecord.id, caseRecord.patientName, state.survey.starRating, caseRecord.careTeamName]
  );

  const tabs: Array<{ id: View; label: string }> = [
    { id: 'chat', label: t({ ar: 'المحادثة', en: 'Chat' }) },
    { id: 'closure', label: t({ ar: 'الإغلاق والأرشفة', en: 'Closure & Archival' }) },
    { id: 'survey', label: t({ ar: 'استبيان W20', en: 'W20 Survey' }) },
  ];

  const statusLabel =
    caseRecord.status === 'archived'
      ? t({ ar: 'مؤرشفة', en: 'Archived' })
      : caseRecord.status === 'closed'
        ? t({ ar: 'مغلقة', en: 'Closed' })
        : followUpWindow.isActive
          ? t({ ar: 'نشطة', en: 'Active' })
          : t({ ar: 'منتهية', en: 'Expired' });

  const windowLabel = followUpWindow.isActive
    ? `${followUpWindow.daysRemaining} ${t({ ar: 'يوم متبقٍ', en: 'day(s) left' })}`
    : t({ ar: 'انتهت نافذة المتابعة', en: 'Follow-up window ended' });

  let chatNotice = '';

  if (caseRecord.status === 'archived') {
    chatNotice = t({
      ar: 'هذه الحالة مؤرشفة ولا يمكن إرسال رسائل جديدة.',
      en: 'This case is archived and new messages cannot be sent.',
    });
  } else if (!followUpWindow.isActive) {
    chatNotice = t({
      ar: 'انتهت نافذة المتابعة لمدة 21 يوماً. يمكن عرض السجل فقط.',
      en: 'The 21-day follow-up window has ended. The record is view-only.',
    });
  } else if (!chatAllowed) {
    chatNotice = t({
      ar: 'هذا الملف الشخصي غير مصرح له بإرسال رسائل في هذه الحالة.',
      en: 'This persona is not authorized to send messages for this case.',
    });
  } else if (!onSendMessage) {
    chatNotice = t({
      ar: 'خدمة إرسال الرسائل غير متوفرة.',
      en: 'Message sending service is unavailable.',
    });
  }

  return (
    <section className="alodoctor-stage89" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <style>{STYLES}</style>

      <header className="alodoctor-header">
        <div>
          <h2 className="alodoctor-title">
            {t({ ar: 'المتابعة لمدة 21 يوماً وإغلاق الحالة', en: '21-Day Follow-Up & Case Closure' })}
          </h2>
          <p className="alodoctor-subtitle">
            {t({
              ar: 'نافذة تواصل مباشرة بين المريض وفريق الرعاية، مع إغلاق الحالة وأرشفتها واستبيان رضا عبر WhatsApp.',
              en: 'A direct patient-care-team communication window with case closure, archival, and WhatsApp satisfaction survey.',
            })}
          </p>
          <ul className="alodoctor-meta">
            <li key="status" className="alodoctor-chip">
              {t({ ar: 'الحالة', en: 'Status' })}: {statusLabel}
            </li>
            <li key="case" className="alodoctor-chip">
              {t({ ar: 'رقم الحالة', en: 'Case ID' })}: {caseRecord.id}
            </li>
            <li key="start" className="alodoctor-chip">
              {t({ ar: 'بداية المتابعة', en: 'Follow-up start' })}: {formatDateTime(caseRecord.followUpStartAt, locale)}
            </li>
            <li key="end" className="alodoctor-chip">
              {t({ ar: 'نهاية المتابعة', en: 'Follow-up end' })}: {formatDateTime(followUpWindow.endsAt, locale)}
            </li>
            <li
              key="window"
              className={`alodoctor-chip ${followUpWindow.isActive ? 'alodoctor-chip-success' : 'alodoctor-chip-warning'}`}
            >
              {windowLabel}
            </li>
          </ul>
        </div>

        <div className="alodoctor-field alodoctor-persona">
          <label className="alodoctor-label" htmlFor={`${idBase}-persona`}>
            {t({ ar: 'تبديل الملف الشخصي', en: 'Persona switcher' })}
          </label>
          <select
            id={`${idBase}-persona`}
            className="alodoctor-select"
            value={persona.id}
            onChange={handlePersonaChange}
            disabled={!onPersonaChange}
          >
            {PERSONA_IDS.map((personaId) => (
              <option key={personaId} value={personaId}>
                {PERSONA_LABELS[personaId][locale]}
              </option>
            ))}
          </select>
          <p className="alodoctor-muted alodoctor-small">
            {t({ ar: 'الملف الحالي', en: 'Current persona' })}:{' '}
            {persona.displayName || PERSONA_LABELS[persona.id][locale]}
          </p>
        </div>
      </header>

      <nav aria-label={t({ ar: 'أقسام المتابعة', en: 'Follow-up sections' })}>
        <div role="tablist" className="alodoctor-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${idBase}-tab-${tab.id}`}
              aria-selected={state.view === tab.id}
              aria-controls={`${idBase}-panel-${tab.id}`}
              className="alodoctor-tab"
              onClick={() => dispatch({ type: 'SET_VIEW', view: tab.id })}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div aria-live="polite" role="status">
        {state.noticeKey && (
          <p className="alodoctor-alert alodoctor-alert-success">{translateMessage(state.noticeKey)}</p>
        )}
      </div>

      {state.errorKey && (
        <p className="alodoctor-alert alodoctor-alert-error" role="alert">
          {translateMessage(state.errorKey)}
        </p>
      )}

      <div
        role="tabpanel"
        id={`${idBase}-panel-chat`}
        aria-labelledby={`${idBase}-tab-chat`}
        hidden={state.view !== 'chat'}
        className="alodoctor-card alodoctor-panel"
      >
        <h3>{t({ ar: 'محادثة المتابعة', en: 'Follow-up chat' })}</h3>

        <div
          ref={chatLogRef}
          className="alodoctor-chat-log"
          role="log"
          aria-live="polite"
          aria-label={t({ ar: 'سجل المحادثة', en: 'Chat log' })}
        >
          {sortedMessages.length === 0 ? (
            <p className="alodoctor-muted">{t({ ar: 'لا توجد رسائل بعد.', en: 'No messages yet.' })}</p>
          ) : (
            sortedMessages.map((message) => {
              const isMine = message.senderPersona === persona.id;

              return (
                <article key={message.id} className={`alodoctor-message ${isMine ? 'is-mine' : 'is-other'}`}>
                  <span className="alodoctor-message-sender">{message.senderName}</span>
                  <p className="alodoctor-message-body">{message.body}</p>
                  <time dateTime={message.sentAt}>{formatDateTime(message.sentAt, locale)}</time>
                </article>
              );
            })
          )}
        </div>

        {canCompose ? (
          <form className="alodoctor-composer" onSubmit={(event) => void handleSendMessage(event)}>
            <label className="alodoctor-label" htmlFor={`${idBase}-composer`}>
              {t({ ar: 'رسالتك', en: 'Your message' })}
            </label>
            <textarea
              id={`${idBase}-composer`}
              className="alodoctor-textarea"
              value={state.draft}
              maxLength={2000}
              rows={3}
              onChange={(event) => dispatch({ type: 'SET_DRAFT', draft: event.target.value })}
              onKeyDown={handleComposerKeyDown}
              placeholder={t({
                ar: 'اكتب رسالة للمريض أو فريق الرعاية...',
                en: 'Write a message to the patient or care team...',
              })}
              disabled={state.sending}
            />
            <div className="alodoctor-actions">
              <button
                type="submit"
                className="alodoctor-button"
                disabled={state.sending || !state.draft.trim() || !onSendMessage}
              >
                {state.sending
                  ? t({ ar: 'جارٍ الإرسال...', en: 'Sending...' })
                  : t({ ar: 'إرسال الرسالة', en: 'Send message' })}
              </button>
              <p className="alodoctor-muted alodoctor-small">
                {t({
                  ar: 'اضغط Enter للإرسال وShift+Enter لسطر جديد.',
                  en: 'Press Enter to send and Shift+Enter for a new line.',
                })}
              </p>
            </div>
          </form>
        ) : (
          <p className="alodoctor-alert alodoctor-alert-info">{chatNotice}</p>
        )}
      </div>

      <div
        role="tabpanel"
        id={`${idBase}-panel-closure`}
        aria-labelledby={`${idBase}-tab-closure`}
        hidden={state.view !== 'closure'}
        className="alodoctor-card alodoctor-panel"
      >
        <h3>{t({ ar: 'إغلاق الحالة والأرشفة', en: 'Case closure & archival' })}</h3>

        {closed ? (
          <>
            <dl className="alodoctor-definition">
              <div>
                <dt>{t({ ar: 'تاريخ الإغلاق', en: 'Closed at' })}</dt>
                <dd>
                  {caseRecord.closedAt
                    ? formatDateTime(caseRecord.closedAt, locale)
                    : t({ ar: 'مغلقة', en: 'Closed' })}
                </dd>
              </div>

              {caseRecord.closure && (
                <div>
                  <dt>{t({ ar: 'النتيجة', en: 'Outcome' })}</dt>
                  <dd>
                    {CLOSURE_OUTCOME_LABELS[caseRecord.closure.outcome]?.[locale] ?? caseRecord.closure.outcome}
                  </dd>
                </div>
              )}

              {caseRecord.closure?.clinicalSummary && (
                <div>
                  <dt>{t({ ar: 'الملخص السريري', en: 'Clinical summary' })}</dt>
                  <dd>{caseRecord.closure.clinicalSummary}</dd>
                </div>
              )}

              {caseRecord.closure?.patientInstructions && (
                <div>
                  <dt>{t({ ar: 'تعليمات المريض', en: 'Patient instructions' })}</dt>
                  <dd>{caseRecord.closure.patientInstructions}</dd>
                </div>
              )}

              {caseRecord.archivedAt && (
                <div>
                  <dt>{t({ ar: 'تاريخ الأرشفة', en: 'Archived at' })}</dt>
                  <dd>{formatDateTime(caseRecord.archivedAt, locale)}</dd>
                </div>
              )}
            </dl>

            {!caseRecord.archivedAt && archiveAllowed && onArchiveCase && (
              <div className="alodoctor-actions">
                <button
                  type="button"
                  className="alodoctor-button alodoctor-button-secondary"
                  onClick={() => void handleArchive()}
                  disabled={state.archiving}
                >
                  {state.archiving
                    ? t({ ar: 'جارٍ الأرشفة...', en: 'Archiving...' })
                    : t({ ar: 'أرشفة الحالة', en: 'Archive case' })}
                </button>
              </div>
            )}
          </>
        ) : closureAllowed ? (
          <form className="alodoctor-panel" onSubmit={(event) => void handleClosureSubmit(event)}>
            {followUpWindow.expired && (
              <p className="alodoctor-alert alodoctor-alert-info">
                {t({
                  ar: 'انتهت نافذة المتابعة. يرجى إغلاق الحالة وأرشفتها.',
                  en: 'The 21-day follow-up window has ended. Please close and archive the case.',
                })}
              </p>
            )}

            <div className="alodoctor-field">
              <label className="alodoctor-label" htmlFor={`${idBase}-outcome`}>
                {t({ ar: 'نتيجة المتابعة', en: 'Follow-up outcome' })}
                <span className="alodoctor-required" aria-hidden="true">*</span>
              </label>
              <select
                id={`${idBase}-outcome`}
                className="alodoctor-select"
                value={state.closure.outcome}
                onChange={(event) =>
                  dispatch({
                    type: 'SET_CLOSURE',
                    patch: { outcome: event.target.value as CaseClosureOutcome },
                  })
                }
                disabled={state.submittingClosure}
              >
                {CLOSURE_OUTCOMES.map((outcome) => (
                  <option key={outcome} value={outcome}>
                    {CLOSURE_OUTCOME_LABELS[outcome][locale]}
                  </option>
                ))}
              </select>
            </div>

            <div className="alodoctor-field">
              <label className="alodoctor-label" htmlFor={`${idBase}-summary`}>
                {t({ ar: 'الملخص السريري', en: 'Clinical summary' })}
                <span className="alodoctor-required" aria-hidden="true">*</span>
              </label>
              <textarea
                id={`${idBase}-summary`}
                className="alodoctor-textarea"
                value={state.closure.clinicalSummary}
                maxLength={2000}
                required
                aria-required="true"
                onChange={(event) =>
                  dispatch({ type: 'SET_CLOSURE', patch: { clinicalSummary: event.target.value } })
                }
                disabled={state.submittingClosure}
              />
            </div>

            <div className="alodoctor-field">
              <label className="alodoctor-label" htmlFor={`${idBase}-instructions`}>
                {t({ ar: 'تعليمات المريض بعد الإغلاق', en: 'Post-closure patient instructions' })}
              </label>
              <textarea
                id={`${idBase}-instructions`}
                className="alodoctor-textarea"
                value={state.closure.patientInstructions}
                maxLength={2000}
                onChange={(event) =>
                  dispatch({ type: 'SET_CLOSURE', patch: { patientInstructions: event.target.value } })
                }
                disabled={state.submittingClosure}
              />
            </div>

            <label className="alodoctor-checkbox">
              <input
                type="checkbox"
                checked={state.closure.archiveConsent}
                onChange={(event) =>
                  dispatch({ type: 'SET_CLOSURE', patch: { archiveConsent: event.target.checked } })
                }
                disabled={state.submittingClosure}
              />
              <span>
                {t({
                  ar: 'أؤكد الموافقة على أرشفة السجل بعد الإغلاق وفق سياسة الاحتفاظ.',
                  en: 'I confirm consent to archive the record after closure per retention policy.',
                })}
              </span>
            </label>

            <div className="alodoctor-actions">
              <button
                type="submit"
                className="alodoctor-button"
                disabled={state.submittingClosure || !onCloseCase}
              >
                {state.submittingClosure
                  ? t({ ar: 'جارٍ الإغلاق...', en: 'Closing...' })
                  : t({ ar: 'إغلاق الحالة', en: 'Close case' })}
              </button>
            </div>
          </form>
        ) : (
          <p className="alodoctor-alert alodoctor-alert-info">
            {t({
              ar: 'يمكن لفريق الرعاية إغلاق الحالة بعد اكتمال المتابعة.',
              en: 'The care team can close the case after follow-up is complete.',
            })}
          </p>
        )}
      </div>

      <div
        role="tabpanel"
        id={`${idBase}-panel-survey`}
        aria-labelledby={`${idBase}-tab-survey`}
        hidden={state.view !== 'survey'}
        className="alodoctor-card alodoctor-panel"
      >
        <h3>{t({ ar: 'استبيان الرضا W20', en: 'W20 satisfaction survey' })}</h3>

        {!surveyAvailable ? (
          <p className="alodoctor-alert alodoctor-alert-info">
            {t({
              ar: 'سيكون استبيان W20 متاحاً بعد إغلاق الحالة أو انتهاء نافذة المتابعة.',
              en: 'The W20 survey will be available after case closure or when the follow-up window ends.',
            })}
          </p>
        ) : existingSurvey ? (
          <dl className="alodoctor-definition">
            <div>
              <dt>{t({ ar: 'التقييم', en: 'Rating' })}</dt>
              <dd aria-label={`${existingSurvey.starRating}/5`}>
                {'★'.repeat(existingSurvey.starRating)}
                {'☆'.repeat(5 - existingSurvey.starRating)}
              </dd>
            </div>

            {typeof existingSurvey.npsScore === 'number' && (
              <div>
                <dt>{t({ ar: 'درجة NPS', en: 'NPS score' })}</dt>
                <dd>{existingSurvey.npsScore}/10</dd>
              </div>
            )}

            {existingSurvey.comments && (
              <div>
                <dt>{t({ ar: 'التعليقات', en: 'Comments' })}</dt>
                <dd>{existingSurvey.comments}</dd>
              </div>
            )}

            <div>
              <dt>{t({ ar: 'تاريخ الإرسال', en: 'Submitted at' })}</dt>
              <dd>{formatDateTime(existingSurvey.submittedAt, locale)}</dd>
            </div>

            {existingSurvey.whatsappSentAt && (
              <div>
                <dt>{t({ ar: 'WhatsApp', en: 'WhatsApp' })}</dt>
                <dd>{formatDateTime(existingSurvey.whatsappSentAt, locale)}</dd>
              </div>
            )}
          </dl>
        ) : (
          <form className="alodoctor-panel" onSubmit={(event) => void handleSurveySubmit(event)}>
            {!surveyAllowed && (
              <p className="alodoctor-alert alodoctor-alert-info">
                {t({
                  ar: 'يمكن للمريض أو ولي الأمر إرسال التقييم، ويمكن لفريق الرعاية إرسال رابط WhatsApp.',
                  en: 'The patient or guardian can submit the rating; the care team can send the WhatsApp link.',
                })}
              </p>
            )}

            <fieldset className="alodoctor-fieldset" disabled={!surveyAllowed || state.submittingSurvey}>
              <legend>
                {t({ ar: 'تقييم الرضا من 5 نجوم', en: '5-star satisfaction rating' })}
                <span className="alodoctor-required" aria-hidden="true">*</span>
              </legend>
              <div className="alodoctor-stars" dir="ltr">
                {[1, 2, 3, 4, 5].map((value) => {
                  const inputId = `${idBase}-star-${value}`;
                  const checked = state.survey.starRating === value;

                  return (
                    <React.Fragment key={value}>
                      <input
                        id={inputId}
                        name={`${idBase}-star-rating`}
                        type="radio"
                        className="alodoctor-star-input alodoctor-visually-hidden"
                        checked={checked}
                        onChange={() =>
                          dispatch({ type: 'SET_SURVEY', patch: { starRating: value as StarRating } })
                        }
                        aria-label={t({ ar: `${value} من 5`, en: `${value} out of 5` })}
                      />
                      <label
                        htmlFor={inputId}
                        className={`alodoctor-star ${state.survey.starRating >= value ? 'is-selected' : ''}`}
                        aria-hidden="true"
                      >
                        {state.survey.starRating >= value ? '★' : '☆'}
                      </label>
                    </React.Fragment>
                  );
                })}
              </div>
              <p className="alodoctor-muted alodoctor-small">
                {state.survey.starRating > 0
                  ? `${state.survey.starRating}/5`
                  : t({ ar: 'اختر عدد النجوم.', en: 'Select a star rating.' })}
              </p>
            </fieldset>

            <div className="alodoctor-field">
              <label className="alodoctor-label" htmlFor={`${idBase}-nps`}>
                {t({
                  ar: 'مدى احتمالية التوصية (0-10) - اختياري',
                  en: 'Likelihood to recommend (0-10) - optional',
                })}
              </label>
              <select
                id={`${idBase}-nps`}
                className="alodoctor-select"
                value={state.survey.npsScore}
                onChange={(event) => {
                  const value = event.target.value;

                  dispatch({
                    type: 'SET_SURVEY',
                    patch: { npsScore: value === '' ? '' : (Number(value) as NpsScore) },
                  });
                }}
                disabled={!surveyAllowed || state.submittingSurvey}
              >
                <option value="">{t({ ar: 'غير محدد', en: 'Not specified' })}</option>
                {Array.from({ length: 11 }, (_, index) => index).map((score) => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </select>
            </div>

            <div className="alodoctor-field">
              <label className="alodoctor-label" htmlFor={`${idBase}-comments`}>
                {t({ ar: 'التعليقات - اختياري', en: 'Comments - optional' })}
              </label>
              <textarea
                id={`${idBase}-comments`}
                className="alodoctor-textarea"
                value={state.survey.comments}
                maxLength={1000}
                onChange={(event) => dispatch({ type: 'SET_SURVEY', patch: { comments: event.target.value } })}
                disabled={!surveyAllowed || state.submittingSurvey}
              />
            </div>

            <label className="alodoctor-checkbox">
              <input
                type="checkbox"
                checked={state.survey.whatsappConsent}
                onChange={(event) =>
                  dispatch({ type: 'SET_SURVEY', patch: { whatsappConsent: event.target.checked } })
                }
                disabled={!surveyAllowed || state.submittingSurvey}
              />
              <span>
                {t({
                  ar: 'الموافقة على إرسال/تسجيل استبيان W20 عبر WhatsApp.',
                  en: 'Consent to send/record the W20 survey via WhatsApp.',
                })}
              </span>
            </label>

            <div className="alodoctor-field">
              <span className="alodoctor-label">
                {t({ ar: 'معاينة رسالة WhatsApp W20', en: 'WhatsApp W20 message preview' })}
              </span>
              <pre className="alodoctor-whatsapp-preview">{whatsappMessage}</pre>
              <div className="alodoctor-actions">
                <a
                  className="alodoctor-button alodoctor-button-whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onWhatsAppSurveyOpen?.(whatsappUrl)}
                >
                  {t({ ar: 'فتح WhatsApp', en: 'Open WhatsApp' })}
                </a>
              </div>
            </div>

            <div className="alodoctor-actions">
              <button
                type="submit"
                className="alodoctor-button"
                disabled={!surveyAllowed || state.submittingSurvey || state.survey.starRating === 0 || !onSubmitSurvey}
              >
                {state.submittingSurvey
                  ? t({ ar: 'جارٍ الحفظ...', en: 'Saving...' })
                  : t({ ar: 'حفظ الاستبيان', en: 'Save survey' })}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default FollowUpCaseClosure;
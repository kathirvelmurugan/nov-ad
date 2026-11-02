import React, { useEffect, useMemo, useState } from 'react';

type Locale = 'en' | 'ar';
type Priority = 'routine' | 'urgent';
type ProposalStatus = 'idle' | 'proposed';

interface PersonaProfile {
  id: string;
  code: string;
  name: string;
  specialty: string;
  locale: Locale;
  timeZone: string;
}

interface Vitals {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
}

interface Attachment {
  id: string;
  label: string;
  type: string;
}

interface ClinicalReviewCase {
  id: string;
  queueCode: string;
  receivedAt: string;
  ageBand: string;
  sex: string;
  priority: Priority;
  chiefComplaint: string;
  summary: string;
  vitals: Vitals;
  findings: string[];
  attachments: Attachment[];
  assignedPersonaIds: string[];
}

interface ConsultationSlot {
  id: string;
  startsAt: string;
  label: string;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const MAX_SLOT_SELECTIONS = 3;
const SLA_HOURS = 48;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

const PERSONA_PROFILES: PersonaProfile[] = [
  {
    id: 'persona-k01',
    code: 'K01',
    name: 'Dr. Arjun Mehta',
    specialty: 'Cardiology',
    locale: 'en',
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'persona-k02',
    code: 'K02',
    name: 'Dr. Zainab Al-Farsi',
    specialty: 'Oncology',
    locale: 'ar',
    timeZone: 'Asia/Riyadh',
  },
  {
    id: 'persona-k03',
    code: 'K03',
    name: 'Dr. Vikram Rao',
    specialty: 'Neurology',
    locale: 'en',
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'persona-k04',
    code: 'K04',
    name: 'Dr. Priya Nair',
    specialty: 'Pediatrics',
    locale: 'en',
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'persona-k05',
    code: 'K05',
    name: 'Dr. Rahul Kapoor',
    specialty: 'Orthopedics',
    locale: 'en',
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'persona-k06',
    code: 'K06',
    name: 'Dr. Meera Pillai',
    specialty: 'Endocrinology',
    locale: 'en',
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'persona-k07',
    code: 'K07',
    name: 'Dr. Aditya Sharma',
    specialty: 'Radiology',
    locale: 'en',
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'persona-w07',
    code: 'W07',
    name: 'Nurse Lina Thomas',
    specialty: 'Wound Care',
    locale: 'en',
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'persona-w08',
    code: 'W08',
    name: 'Pharmacist Omar Khalid',
    specialty: 'Clinical Pharmacy',
    locale: 'ar',
    timeZone: 'Asia/Riyadh',
  },
  {
    id: 'persona-w09',
    code: 'W09',
    name: 'Fatima Noor',
    specialty: 'Care Coordination',
    locale: 'ar',
    timeZone: 'Asia/Riyadh',
  },
  {
    id: 'persona-w10',
    code: 'W10',
    name: 'Sanjay Gupta',
    specialty: 'Quality & Safety',
    locale: 'en',
    timeZone: 'Asia/Kolkata',
  },
];

const MOCK_NOW = Date.now();

const hoursAgo = (hours: number): string =>
  new Date(MOCK_NOW - hours * HOUR_MS).toISOString();

type CaseSeed = Omit<
  ClinicalReviewCase,
  'id' | 'queueCode' | 'receivedAt' | 'assignedPersonaIds'
>;

function createCase(
  queueCode: string,
  receivedHoursAgo: number,
  seed: CaseSeed,
): ClinicalReviewCase {
  return {
    id: `review-${queueCode}`,
    queueCode,
    receivedAt: hoursAgo(receivedHoursAgo),
    assignedPersonaIds: [],
    ...seed,
  };
}

const REVIEW_CASES: ClinicalReviewCase[] = [
  createCase('K01', 5.2, {
    ageBand: '45-54',
    sex: 'Male',
    priority: 'urgent',
    chiefComplaint: 'Exertional chest pressure with borderline troponin',
    summary:
      'De-identified episode of exertional chest pressure radiating to the left arm. The bundle contains no name, MRN, contact details, or exact address.',
    vitals: {
      bloodPressure: '138/88 mmHg',
      heartRate: '92 bpm',
      temperature: '36.8°C',
      oxygenSaturation: '97% on room air',
    },
    findings: [
      'ECG: nonspecific ST-T changes',
      'High-sensitivity troponin T: 0.045 ng/mL',
      'Echocardiogram pending',
    ],
    attachments: [
      { id: 'k01-ecg', label: 'ECG strip', type: 'PDF' },
      { id: 'k01-lab', label: 'Cardiac panel', type: 'FHIR' },
    ],
  }),
  createCase('K02', 18.6, {
    ageBand: '55-64',
    sex: 'Female',
    priority: 'routine',
    chiefComplaint: 'Breast lesion imaging review before oncology board',
    summary:
      'De-identified imaging summary for a BI-RADS 4 lesion. All DICOM identifiers have been replaced with study-level aliases.',
    vitals: {
      bloodPressure: '126/80 mmHg',
      heartRate: '76 bpm',
      temperature: '36.6°C',
      oxygenSaturation: '98% on room air',
    },
    findings: [
      'Mammography: irregular density, upper outer quadrant',
      'Ultrasound: hypoechoic lesion, 14 mm',
      'Biopsy scheduled',
    ],
    attachments: [
      { id: 'k02-mammo', label: 'Mammography set', type: 'DICOM' },
      { id: 'k02-us', label: 'Ultrasound report', type: 'PDF' },
    ],
  }),
  createCase('K03', 30.4, {
    ageBand: '65-74',
    sex: 'Male',
    priority: 'urgent',
    chiefComplaint: 'Transient right-sided weakness, suspected TIA',
    summary:
      'De-identified neurological review for transient right-sided weakness lasting 25 minutes. No patient-facing identifiers are included.',
    vitals: {
      bloodPressure: '152/90 mmHg',
      heartRate: '84 bpm',
      temperature: '37.0°C',
      oxygenSaturation: '96% on room air',
    },
    findings: [
      'NIHSS at presentation: 3',
      'CT head: no acute hemorrhage',
      'MRI requested',
    ],
    attachments: [
      { id: 'k03-ct', label: 'CT head', type: 'DICOM' },
      { id: 'k03-note', label: 'Neuro note', type: 'PDF' },
    ],
  }),
  createCase('K04', 9.8, {
    ageBand: '5-9',
    sex: 'Female',
    priority: 'routine',
    chiefComplaint: 'Recurrent wheeze, pediatric respiratory review',
    summary:
      'De-identified pediatric review for recurrent wheeze with nighttime symptoms. Guardian details removed from the exchange payload.',
    vitals: {
      bloodPressure: '102/64 mmHg',
      heartRate: '108 bpm',
      temperature: '37.2°C',
      oxygenSaturation: '95% on room air',
    },
    findings: [
      'Auscultation: bilateral end-expiratory wheeze',
      'No chest indrawing',
      'Trial of inhaled corticosteroid discussed',
    ],
    attachments: [
      { id: 'k04-chart', label: 'Growth chart', type: 'PDF' },
      { id: 'k04-rx', label: 'Medication history', type: 'FHIR' },
    ],
  }),
  createCase('K05', 50.2, {
    ageBand: '35-44',
    sex: 'Male',
    priority: 'routine',
    chiefComplaint: 'Knee pain after sports injury, MRI review',
    summary:
      'De-identified orthopedic review for suspected meniscal injury. The imaging metadata has been scrubbed for direct identifiers.',
    vitals: {
      bloodPressure: '130/82 mmHg',
      heartRate: '72 bpm',
      temperature: '36.5°C',
      oxygenSaturation: '99% on room air',
    },
    findings: [
      'Positive McMurray test',
      'MRI: possible medial meniscus tear',
      'No joint effusion',
    ],
    attachments: [{ id: 'k05-mri', label: 'Knee MRI', type: 'DICOM' }],
  }),
  createCase('K06', 14.1, {
    ageBand: '25-34',
    sex: 'Female',
    priority: 'routine',
    chiefComplaint: 'Newly detected hyperthyroid symptoms',
    summary:
      'De-identified endocrinology review for palpitations, heat intolerance, and weight loss. No contact information is present.',
    vitals: {
      bloodPressure: '118/72 mmHg',
      heartRate: '104 bpm',
      temperature: '36.9°C',
      oxygenSaturation: '98% on room air',
    },
    findings: [
      'TSH suppressed',
      'Free T4 elevated',
      'Thyroid ultrasound pending',
    ],
    attachments: [
      { id: 'k06-thyroid', label: 'Thyroid panel', type: 'FHIR' },
      { id: 'k06-ecg', label: 'ECG', type: 'PDF' },
    ],
  }),
  createCase('K07', 26.7, {
    ageBand: '55-64',
    sex: 'Male',
    priority: 'urgent',
    chiefComplaint: 'Incidental lung nodule, radiology second opinion',
    summary:
      'De-identified radiology bundle for an incidental pulmonary nodule. All acquisition identifiers replaced with study aliases.',
    vitals: {
      bloodPressure: '134/84 mmHg',
      heartRate: '78 bpm',
      temperature: '36.7°C',
      oxygenSaturation: '97% on room air',
    },
    findings: [
      'CT chest: 9 mm spiculated nodule',
      'No pleural effusion',
      'PET-CT advised',
    ],
    attachments: [{ id: 'k07-ct', label: 'CT chest', type: 'DICOM' }],
  }),
  createCase('W07', 47.3, {
    ageBand: '65-74',
    sex: 'Female',
    priority: 'urgent',
    chiefComplaint: 'Post-operative wound review, wound care opinion',
    summary:
      'De-identified wound review with photograph set. Facial features and identifying marks are cropped or obscured.',
    vitals: {
      bloodPressure: '142/86 mmHg',
      heartRate: '88 bpm',
      temperature: '37.6°C',
      oxygenSaturation: '96% on room air',
    },
    findings: [
      'Wound edge erythema',
      'Mild serous discharge',
      'No crepitus',
    ],
    attachments: [
      { id: 'w07-photo', label: 'Wound photograph', type: 'JPEG' },
      { id: 'w07-chart', label: 'Wound chart', type: 'PDF' },
    ],
  }),
  createCase('W08', 2.4, {
    ageBand: '75-84',
    sex: 'Male',
    priority: 'routine',
    chiefComplaint: 'Medication reconciliation after polypharmacy alert',
    summary:
      'De-identified medication review for renal dosing and interaction risk. No national ID, phone number, or address is included.',
    vitals: {
      bloodPressure: '128/76 mmHg',
      heartRate: '68 bpm',
      temperature: '36.4°C',
      oxygenSaturation: '97% on room air',
    },
    findings: [
      'eGFR reduced',
      'Duplicate antihypertensive risk',
      'Renal dosing check required',
    ],
    attachments: [
      { id: 'w08-meds', label: 'Medication list', type: 'FHIR' },
      { id: 'w08-renal', label: 'Renal panel', type: 'FHIR' },
    ],
  }),
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

  .alo-app {
    --primary: #007B6E;
    --primary-bright: #00C6AE;
    --surface: #E6FAF7;
    --whatsapp: #25D366;
    --ink: #0B3B36;
    --muted: #486E69;
    --danger: #B42318;
    --warning: #B54708;
    --ok: #067647;
    min-height: 100vh;
    background:
      radial-gradient(circle at top right, rgba(0, 198, 174, 0.18), transparent 30%),
      linear-gradient(180deg, #F7FFFE 0%, var(--surface) 100%);
    color: var(--ink);
    font-family: 'Cairo', 'Segoe UI', system-ui, -apple-system, sans-serif;
  }

  .alo-shell {
    max-width: 430px;
    margin: 0 auto;
    padding: 16px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .alo-header,
  .panel {
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(0, 123, 110, 0.14);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 123, 110, 0.08);
  }

  .alo-header {
    padding: 14px;
  }

  .alo-brand {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .alo-title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--primary);
  }

  .alo-subtitle {
    margin: 4px 0 0;
    font-size: 0.8rem;
    color: var(--muted);
  }

  .persona-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 12px;
  }

  .persona-label {
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--muted);
  }

  .persona-select {
    width: 100%;
    min-height: 48px;
    border-radius: 14px;
    border: 1px solid rgba(0, 123, 110, 0.25);
    padding: 10px 12px;
    font: inherit;
    color: inherit;
    background: #fff;
  }

  .case-list,
  .detail-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .case-card {
    width: 100%;
    text-align: start;
    background: rgba(255, 255, 255, 0.96);
    border-radius: 20px;
    border: 1px solid rgba(0, 123, 110, 0.14);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    cursor: pointer;
    font: inherit;
    color: inherit;
    box-shadow: 0 8px 24px rgba(0, 123, 110, 0.06);
  }

  .case-card:hover {
    border-color: var(--primary-bright);
  }

  .case-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 5px 10px;
    font-size: 0.72rem;
    font-weight: 800;
    white-space: nowrap;
  }

  .badge-queue {
    background: rgba(0, 198, 174, 0.16);
    color: var(--primary);
  }

  .badge-deid {
    background: rgba(37, 211, 102, 0.16);
    color: var(--ok);
  }

  .badge-priority-urgent {
    background: rgba(180, 35, 24, 0.12);
    color: var(--danger);
  }

  .badge-priority-routine {
    background: rgba(0, 123, 110, 0.12);
    color: var(--primary);
  }

  .case-card h2 {
    margin: 0;
    font-size: 1rem;
    line-height: 1.4;
  }

  .case-meta {
    margin: 0;
    color: var(--muted);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .sla {
    border-radius: 16px;
    padding: 10px 12px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-weight: 700;
  }

  .sla strong {
    font-size: 1.05rem;
  }

  .sla-ok {
    background: rgba(0, 123, 110, 0.12);
    color: var(--primary);
  }

  .sla-warning {
    background: rgba(181, 71, 8, 0.14);
    color: var(--warning);
  }

  .sla-critical,
  .sla-overdue {
    background: rgba(180, 35, 24, 0.12);
    color: var(--danger);
  }

  .panel {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  .panel h1 {
    margin: 0;
    font-size: 1.2rem;
    line-height: 1.35;
  }

  .panel h2 {
    margin: 0;
    font-size: 1rem;
  }

  .muted {
    color: var(--muted);
    margin: 0;
  }

  .detail-grid {
    display: grid;
    gap: 10px;
    margin: 0;
  }

  .detail-grid div {
    display: grid;
    gap: 2px;
  }

  .detail-grid dt {
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--muted);
  }

  .detail-grid dd {
    margin: 0;
    font-weight: 600;
    line-height: 1.5;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .chip {
    background: var(--surface);
    border: 1px solid rgba(0, 123, 110, 0.18);
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .slot-grid {
    display: grid;
    gap: 8px;
  }

  .slot-button {
    border: 1px solid rgba(0, 123, 110, 0.28);
    background: #fff;
    border-radius: 14px;
    min-height: 52px;
    padding: 10px 12px;
    font: inherit;
    font-weight: 700;
    color: inherit;
    cursor: pointer;
    text-align: start;
  }

  .slot-button[aria-pressed='true'] {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
  }

  .slot-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .alo-button {
    min-height: 48px;
    border-radius: 16px;
    border: 0;
    background: var(--primary);
    color: #fff;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    padding: 12px 16px;
  }

  .alo-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .alo-button-secondary {
    background: #fff;
    color: var(--primary);
    border: 1px solid rgba(0, 123, 110, 0.35);
  }

  .textarea {
    width: 100%;
    min-height: 100px;
    border-radius: 14px;
    border: 1px solid rgba(0, 123, 110, 0.25);
    padding: 10px 12px;
    font: inherit;
    color: inherit;
    resize: vertical;
    background: #fff;
  }

  .status {
    margin: 0;
    font-weight: 800;
    color: var(--ok);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .alo-app :focus-visible {
    outline: 3px solid var(--primary-bright);
    outline-offset: 2px;
  }

  [dir='rtl'] .case-card,
  [dir='rtl'] .slot-button {
    text-align: right;
  }

  @media (min-width: 768px) {
    .alo-shell {
      max-width: 560px;
    }
  }
`;

function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

function getDatePartsInTimeZone(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const lookup: Record<string, string> = {};

  formatter.formatToParts(date).forEach((part) => {
    if (part.type !== 'literal') {
      lookup[part.type] = part.value;
    }
  });

  const hour = Number(lookup.hour ?? '0');

  return {
    year: Number(lookup.year ?? 1970),
    month: Number(lookup.month ?? 1),
    day: Number(lookup.day ?? 1),
    hour: hour === 24 ? 0 : hour,
    minute: Number(lookup.minute ?? '0'),
    second: Number(lookup.second ?? '0'),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const utcParts = getDatePartsInTimeZone(date, 'UTC');
  const timeZoneParts = getDatePartsInTimeZone(date, timeZone);

  const utcAsMs = Date.UTC(
    utcParts.year,
    utcParts.month - 1,
    utcParts.day,
    utcParts.hour,
    utcParts.minute,
    utcParts.second,
  );

  const timeZoneAsMs = Date.UTC(
    timeZoneParts.year,
    timeZoneParts.month - 1,
    timeZoneParts.day,
    timeZoneParts.hour,
    timeZoneParts.minute,
    timeZoneParts.second,
  );

  return timeZoneAsMs - utcAsMs;
}

function zonedTimeToUtc(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, monthIndex, day, hour, minute, 0, 0);
  const firstOffset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  const adjusted = utcGuess - firstOffset;
  const secondOffset = getTimeZoneOffsetMs(new Date(adjusted), timeZone);

  return new Date(utcGuess - secondOffset);
}

function formatDateTime(isoString: string, timeZone: string): string {
  const date = new Date(isoString);
  const safeTimeZone = isValidTimeZone(timeZone) ? timeZone : 'UTC';

  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: safeTimeZone,
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

function formatSlotLabel(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function generateConsultationSlots(now: number, timeZone: string): ConsultationSlot[] {
  const safeTimeZone = isValidTimeZone(timeZone) ? timeZone : 'UTC';
  const nowParts = getDatePartsInTimeZone(new Date(now), safeTimeZone);
  const normalizedCurrentDay = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);

  const proposedTimes = [
    { hour: 9, minute: 0 },
    { hour: 13, minute: 30 },
    { hour: 18, minute: 0 },
  ];

  const slots: ConsultationSlot[] = [];

  for (let dayOffset = 1; dayOffset <= 3; dayOffset += 1) {
    const candidateDay = new Date(normalizedCurrentDay + dayOffset * DAY_MS);

    for (const time of proposedTimes) {
      const slotDate = zonedTimeToUtc(
        candidateDay.getUTCFullYear(),
        candidateDay.getUTCMonth(),
        candidateDay.getUTCDate(),
        time.hour,
        time.minute,
        safeTimeZone,
      );

      if (slotDate.getTime() > now + 2 * HOUR_MS) {
        slots.push({
          id: slotDate.toISOString(),
          startsAt: slotDate.toISOString(),
          label: formatSlotLabel(slotDate, safeTimeZone),
        });
      }
    }
  }

  return slots.slice(0, 6);
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(Math.abs(ms) / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

type SlaTone = 'ok' | 'warning' | 'critical' | 'overdue';

function getSlaTone(remainingMs: number): SlaTone {
  if (remainingMs <= 0) return 'overdue';
  if (remainingMs <= 2 * HOUR_MS) return 'critical';
  if (remainingMs <= 8 * HOUR_MS) return 'warning';
  return 'ok';
}

function SlaTimer({ receivedAt, now }: { receivedAt: string; now: number }) {
  const deadline = useMemo(
    () => new Date(receivedAt).getTime() + SLA_HOURS * HOUR_MS,
    [receivedAt],
  );

  const remainingMs = deadline - now;
  const tone = getSlaTone(remainingMs);
  const duration = formatDuration(remainingMs);
  const message =
    remainingMs <= 0
      ? `48 hour SLA overdue by ${duration}`
      : `48 hour SLA time remaining ${duration}`;

  return (
    <div className={`sla sla-${tone}`} role="timer" aria-label={message}>
      <span>48h SLA</span>
      <strong>{duration}</strong>
      <span>{remainingMs <= 0 ? 'overdue' : 'remaining'}</span>
    </div>
  );
}

interface CaseQueueProps {
  cases: ClinicalReviewCase[];
  now: number;
  onSelectCase: (caseId: string) => void;
}

function CaseQueue({ cases, now, onSelectCase }: CaseQueueProps) {
  if (cases.length === 0) {
    return (
      <section className="panel" aria-label="Review queue empty state">
        <h2>No de-identified cases available</h2>
        <p className="muted">New consultation requests will appear here automatically.</p>
      </section>
    );
  }

  return (
    <section className="case-list" aria-label="De-identified consultation review queue">
      {cases.map((caseItem) => (
        <button
          key={caseItem.id}
          type="button"
          className="case-card"
          onClick={() => onSelectCase(caseItem.id)}
        >
          <div className="case-card-top">
            <span className="badge badge-queue">{caseItem.queueCode}</span>
            <span className="badge badge-deid">De-identified</span>
          </div>

          <h2>{caseItem.chiefComplaint}</h2>

          <p className="case-meta">
            {caseItem.ageBand} • {caseItem.sex} • {caseItem.priority}
          </p>

          <SlaTimer receivedAt={caseItem.receivedAt} now={now} />
        </button>
      ))}
    </section>
  );
}

interface CaseDetailProps {
  caseItem: ClinicalReviewCase;
  now: number;
  persona: PersonaProfile;
  selectedSlots: string[];
  proposalStatus: ProposalStatus;
  notes: string;
  onBack: () => void;
  onToggleSlot: (slotId: string) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
}

function CaseDetail({
  caseItem,
  now,
  persona,
  selectedSlots,
  proposalStatus,
  notes,
  onBack,
  onToggleSlot,
  onNotesChange,
  onSubmit,
}: CaseDetailProps) {
  const slots = useMemo(
    () => generateConsultationSlots(Date.now(), persona.timeZone),
    [caseItem.id, persona.timeZone],
  );

  const maxReached = selectedSlots.length >= MAX_SLOT_SELECTIONS;

  return (
    <div className="detail-stack">
      <section className="panel" aria-labelledby="case-heading">
        <button type="button" className="alo-button alo-button-secondary" onClick={onBack}>
          Back to queue
        </button>

        <header className="panel-header">
          <div>
            <h1 id="case-heading">Clinical Review {caseItem.queueCode}</h1>
            <p className="muted">De-identified record • English interface</p>
          </div>
          <span className={`badge badge-priority-${caseItem.priority}`}>
            {caseItem.priority}
          </span>
        </header>

        <SlaTimer receivedAt={caseItem.receivedAt} now={now} />

        <dl className="detail-grid">
          <div>
            <dt>Case reference</dt>
            <dd>ALO-{caseItem.queueCode}</dd>
          </div>
          <div>
            <dt>Received</dt>
            <dd>{formatDateTime(caseItem.receivedAt, persona.timeZone)}</dd>
          </div>
          <div>
            <dt>Demographics</dt>
            <dd>
              {caseItem.ageBand}, {caseItem.sex}
            </dd>
          </div>
          <div>
            <dt>Chief complaint</dt>
            <dd>{caseItem.chiefComplaint}</dd>
          </div>
          <div>
            <dt>De-identified summary</dt>
            <dd>{caseItem.summary}</dd>
          </div>
        </dl>

        <section aria-label="Vitals">
          <h2>Vitals</h2>
          <ul className="chip-row">
            <li className="chip">BP {caseItem.vitals.bloodPressure}</li>
            <li className="chip">HR {caseItem.vitals.heartRate}</li>
            <li className="chip">Temp {caseItem.vitals.temperature}</li>
            <li className="chip">SpO2 {caseItem.vitals.oxygenSaturation}</li>
          </ul>
        </section>

        <section aria-label="Clinical findings">
          <h2>Findings</h2>
          <ul className="chip-row">
            {caseItem.findings.map((finding) => (
              <li key={finding} className="chip">
                {finding}
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Attachments">
          <h2>Attachments</h2>
          <ul className="chip-row">
            {caseItem.attachments.map((attachment) => (
              <li key={attachment.id} className="chip">
                {attachment.label} • {attachment.type}
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="panel" aria-labelledby="slots-heading">
        <h2 id="slots-heading">Consultation slot proposals</h2>
        <p className="muted" id="slot-limit">
          Select up to {MAX_SLOT_SELECTIONS} slots in {persona.timeZone}. Proposals are shared
          with the Saudi care team without patient identifiers.
        </p>

        <div
          className="slot-grid"
          role="group"
          aria-label="Available consultation slots"
          aria-describedby="slot-limit"
        >
          {slots.map((slot) => {
            const isSelected = selectedSlots.includes(slot.id);

            return (
              <button
                key={slot.id}
                type="button"
                className="slot-button"
                aria-pressed={isSelected}
                disabled={!isSelected && maxReached}
                onClick={() => onToggleSlot(slot.id)}
              >
                {slot.label}
                <span className="visually-hidden">
                  {isSelected ? 'Selected slot' : 'Available slot'}
                </span>
              </button>
            );
          })}
        </div>

        <p className="muted" role="status" aria-live="polite">
          {selectedSlots.length}/{MAX_SLOT_SELECTIONS} slots selected
        </p>

        <label htmlFor="consultation-notes">Consultation notes</label>
        <textarea
          id="consultation-notes"
          className="textarea"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Add preparation notes, required investigations, or interpreter needs."
        />

        <button
          type="button"
          className="alo-button"
          disabled={selectedSlots.length === 0}
          onClick={onSubmit}
        >
          {proposalStatus === 'proposed'
            ? 'Update consultation proposal'
            : 'Propose consultation'}
        </button>

        <p className="status" role="status" aria-live="polite">
          {proposalStatus === 'proposed'
            ? `Proposal recorded for ${caseItem.queueCode}. The care team will confirm the selected slot.`
            : ''}
        </p>
      </section>
    </div>
  );
}

export default function IndianConsultantReviewApp() {
  const now = useNow(1000);

  const [activePersonaId, setActivePersonaId] = useState<string>(
    PERSONA_PROFILES[0].id,
  );
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<Record<string, string[]>>({});
  const [proposalStatusById, setProposalStatusById] = useState<
    Record<string, ProposalStatus>
  >({});
  const [notesByCaseId, setNotesByCaseId] = useState<Record<string, string>>({});

  const activePersona =
    PERSONA_PROFILES.find((persona) => persona.id === activePersonaId) ??
    PERSONA_PROFILES[0];

  const visibleCases = useMemo(() => {
    return REVIEW_CASES.filter(
      (caseItem) =>
        caseItem.assignedPersonaIds.length === 0 ||
        caseItem.assignedPersonaIds.includes(activePersonaId),
    );
  }, [activePersonaId]);

  const selectedCase =
    visibleCases.find((caseItem) => caseItem.id === selectedCaseId) ?? null;

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  const handleBack = () => {
    setSelectedCaseId(null);
  };

  const handleToggleSlot = (caseId: string, slotId: string) => {
    setSelectedSlotIds((previous) => {
      const current = previous[caseId] ?? [];

      if (current.includes(slotId)) {
        return {
          ...previous,
          [caseId]: current.filter((id) => id !== slotId),
        };
      }

      if (current.length >= MAX_SLOT_SELECTIONS) {
        return previous;
      }

      return {
        ...previous,
        [caseId]: [...current, slotId],
      };
    });
  };

  const handleNotesChange = (caseId: string, notes: string) => {
    setNotesByCaseId((previous) => ({
      ...previous,
      [caseId]: notes,
    }));
  };

  const handleSubmit = (caseId: string) => {
    setProposalStatusById((previous) => ({
      ...previous,
      [caseId]: 'proposed',
    }));
  };

  return (
    <div
      className="alo-app"
      lang="en"
      dir={activePersona.locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <style>{styles}</style>

      <div className="alo-shell">
        <header className="alo-header">
          <div className="alo-brand">
            <div>
              <h1 className="alo-title">ALO DOCTOR Consultant Review</h1>
              <p className="alo-subtitle">
                Stage 5 • Indian consultant mobile review • English
              </p>
            </div>
            <span className="badge badge-deid">De-identified</span>
          </div>

          <div className="persona-field">
            <label className="persona-label" htmlFor="persona-switcher">
              Persona profile
            </label>
            <select
              id="persona-switcher"
              className="persona-select"
              value={activePersonaId}
              onChange={(event) => setActivePersonaId(event.target.value)}
            >
              {PERSONA_PROFILES.map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.code} • {persona.name} • {persona.specialty}
                </option>
              ))}
            </select>
          </div>
        </header>

        <main id="main-content">
          {selectedCase ? (
            <CaseDetail
              caseItem={selectedCase}
              now={now}
              persona={activePersona}
              selectedSlots={selectedSlotIds[selectedCase.id] ?? []}
              proposalStatus={proposalStatusById[selectedCase.id] ?? 'idle'}
              notes={notesByCaseId[selectedCase.id] ?? ''}
              onBack={handleBack}
              onToggleSlot={(slotId) => handleToggleSlot(selectedCase.id, slotId)}
              onNotesChange={(nextNotes) =>
                handleNotesChange(selectedCase.id, nextNotes)
              }
              onSubmit={() => handleSubmit(selectedCase.id)}
            />
          ) : (
            <CaseQueue cases={visibleCases} now={now} onSelectCase={handleSelectCase} />
          )}
        </main>
      </div>
    </div>
  );
}
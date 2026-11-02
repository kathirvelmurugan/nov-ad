import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type AloPersonaId =
  | 'patient'
  | 'physician'
  | 'consultant'
  | 'interpreter'
  | 'nurse'
  | 'pharmacist'
  | 'radiologist'
  | 'admin'
  | 'billing'
  | 'compliance'
  | 'caregiver';

export type Stage6CallStatus = 'idle' | 'connecting' | 'live' | 'paused' | 'ended';
export type Stage6ParticipantId = 'patient' | 'consultant' | 'interpreter';

export interface Stage6PersonaOption {
  id: AloPersonaId;
  labelAr: string;
  labelEn: string;
}

export interface Stage6Participant {
  id: Stage6ParticipantId;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  language: string;
}

export interface Stage6ScriptLine {
  id: string;
  speakerId: Stage6ParticipantId;
  originalLanguage: 'ar' | 'en';
  originalAr: string;
  originalEn: string;
  translatedAr?: string;
  translatedEn?: string;
  interpreterActive: boolean;
}

export interface Stage6OpinionNote {
  chiefComplaintAr: string;
  chiefComplaintEn: string;
  assessmentAr: string;
  assessmentEn: string;
  planAr: string;
  planEn: string;
  followUpAr: string;
  followUpEn: string;
  urgency: string;
}

export interface Stage6Certification {
  translatorNameAr: string;
  translatorNameEn: string;
  licenseNo: string;
  certificationAr: string;
  certificationEn: string;
}

export interface Stage6ReportPayload {
  referenceId: string;
  generatedAt: string;
  personaId: AloPersonaId;
  participants: Stage6Participant[];
  script: Stage6ScriptLine[];
  opinion: Stage6OpinionNote;
  certification: Stage6Certification;
}

export interface Stage6TelehealthProps {
  personaId?: AloPersonaId;
  onPersonaChange?: (persona: AloPersonaId) => void;
  referenceId?: string;
  patientNameAr?: string;
  patientNameEn?: string;
  consultantNameAr?: string;
  consultantNameEn?: string;
  interpreterNameAr?: string;
  interpreterNameEn?: string;
  onCompleted?: (payload: Stage6ReportPayload) => void;
}

const PALETTE = {
  primary: '#007B6E',
  accent: '#00C6AE',
  soft: '#E6FAF7',
  whatsapp: '#25D366',
  ink: '#083A34',
  line: '#BFEDE6',
  paper: '#FFFFFF',
} as const;

const PERSONAS: Stage6PersonaOption[] = [
  { id: 'patient', labelAr: 'المريض', labelEn: 'Patient' },
  { id: 'physician', labelAr: 'الطبيب المعالج', labelEn: 'Treating Physician' },
  { id: 'consultant', labelAr: 'الاستشاري', labelEn: 'Consultant' },
  { id: 'interpreter', labelAr: 'المترجم الطبي', labelEn: 'Medical Interpreter' },
  { id: 'nurse', labelAr: 'التمريض', labelEn: 'Nurse' },
  { id: 'pharmacist', labelAr: 'الصيدلي', labelEn: 'Pharmacist' },
  { id: 'radiologist', labelAr: 'أشعة', labelEn: 'Radiologist' },
  { id: 'admin', labelAr: 'الإدارة', labelEn: 'Administration' },
  { id: 'billing', labelAr: 'الفوترة', labelEn: 'Billing' },
  { id: 'compliance', labelAr: 'الامتثال', labelEn: 'Compliance' },
  { id: 'caregiver', labelAr: 'مرافق', labelEn: 'Caregiver' },
];

const DEFAULT_PARTICIPANTS: Record<Stage6ParticipantId, Stage6Participant> = {
  patient: {
    id: 'patient',
    nameAr: 'سلمى الحربي',
    nameEn: 'Salma Alharbi',
    roleAr: 'مريضة',
    roleEn: 'Patient',
    language: 'العربية / Arabic',
  },
  consultant: {
    id: 'consultant',
    nameAr: 'د. خالد العتيبي',
    nameEn: 'Dr. Khalid Alotaibi',
    roleAr: 'استشاري طب الأسرة',
    roleEn: 'Family Medicine Consultant',
    language: 'English / الإنجليزية',
  },
  interpreter: {
    id: 'interpreter',
    nameAr: 'أ. نورة القحطاني',
    nameEn: 'Noura Alqahtani',
    roleAr: 'مترجمة طبية معتمدة',
    roleEn: 'Certified Medical Interpreter',
    language: 'العربية ↔ English',
  },
};

const DEFAULT_SCRIPT: Stage6ScriptLine[] = [
  {
    id: 'stage6-line-1',
    speakerId: 'patient',
    originalLanguage: 'ar',
    originalAr: 'السلام عليكم، أشعر بألم في الصدر وضيق في التنفس منذ يومين.',
    originalEn: '',
    translatedEn: 'Peace be upon you. I have had chest pain and shortness of breath for two days.',
    interpreterActive: true,
  },
  {
    id: 'stage6-line-2',
    speakerId: 'consultant',
    originalLanguage: 'en',
    originalAr: '',
    originalEn: 'Thank you. Please ask whether the chest pain worsens with exertion, breathing, or lying flat.',
    translatedAr: 'شكرًا لكِ. من فضلك اسألي ما إذا كان ألم الصدر يزداد مع المجهود أو التنفس أو الاستلقاء.',
    interpreterActive: true,
  },
  {
    id: 'stage6-line-3',
    speakerId: 'patient',
    originalLanguage: 'ar',
    originalAr: 'يزداد مع المشي وصعود الدرج، ويخف قليلًا عند الراحة، ولا يوجد سعال أو حمى.',
    originalEn: '',
    translatedEn: 'It increases with walking and climbing stairs, improves slightly at rest, and there is no cough or fever.',
    interpreterActive: true,
  },
  {
    id: 'stage6-line-4',
    speakerId: 'consultant',
    originalLanguage: 'en',
    originalAr: '',
    originalEn: 'Based on the history, we should treat this as potentially cardiac until excluded. Please arrange same-day vitals, ECG, and urgent review.',
    translatedAr: 'بناءً على التاريخ المرضي، يجب التعامل مع الحالة على أنها قلبية محتملة حتى يتم استبعادها. يرجى ترتيب العلامات الحيوية وتخطيط القلب ومراجعة عاجلة في نفس اليوم.',
    interpreterActive: true,
  },
  {
    id: 'stage6-line-5',
    speakerId: 'interpreter',
    originalLanguage: 'ar',
    originalAr: 'أؤكد أنني قمت بالترجمة الطبية بين العربية والإنجليزية بدقة وحياد وفق أخلاقيات المهنة.',
    originalEn: 'I confirm that I performed the medical interpretation between Arabic and English accurately and impartially in accordance with professional ethics.',
    interpreterActive: false,
  },
  {
    id: 'stage6-line-6',
    speakerId: 'consultant',
    originalLanguage: 'en',
    originalAr: '',
    originalEn: 'Consultant opinion: urgent ECG and troponin if indicated, review within 24 hours, safety-net for worsening symptoms, and bilingual stamped report issued.',
    translatedAr: 'رأي الاستشاري: تخطيط قلب عاجل وفحص إنزيمات القلب إذا لزم، ومراجعة خلال 24 ساعة، وتعليمات السلامة عند تفاقم الأعراض، وإصدار تقرير ثنائي اللغة مختوم.',
    interpreterActive: true,
  },
];

const DEFAULT_OPINION: Stage6OpinionNote = {
  chiefComplaintAr: 'ألم في الصدر وضيق تنفس منذ يومين، يزداد مع المجهود ويخف عند الراحة.',
  chiefComplaintEn: 'Chest pain and shortness of breath for two days, worse on exertion and improved at rest.',
  assessmentAr: 'ألم صدري مجهود مع ضيق تنفس؛ يلزم استبعاد أسباب قلبية ورئوية عاجلة.',
  assessmentEn: 'Exertional chest pain with dyspnea; urgent cardiac and pulmonary causes must be excluded.',
  planAr: 'تخطيط قلب عاجل، فحص إنزيمات القلب إذا لزم، مراجعة عيادة خلال 24 ساعة، وتعليمات سلامة واضحة.',
  planEn: 'Urgent ECG, troponin if indicated, clinic review within 24 hours, and clear safety-netting advice.',
  followUpAr: 'مراجعة عاجلة خلال 24 ساعة أو التوجه للطوارئ عند تفاقم الأعراض.',
  followUpEn: 'Urgent follow-up within 24 hours or emergency department if symptoms worsen.',
  urgency: 'urgent_24h',
};

const DEFAULT_CERTIFICATION: Stage6Certification = {
  translatorNameAr: 'نورة القحطاني',
  translatorNameEn: 'Noura Alqahtani',
  licenseNo: 'MOH-TI-88421',
  certificationAr: 'أقر بأن الترجمة الطبية بين العربية والإنجليزية تمت بدقة وأمانة وحياد وفق أخلاقيات المهنة ومتطلبات الاعتماد.',
  certificationEn: 'I certify that the medical interpretation between Arabic and English was performed accurately, faithfully, and impartially in accordance with professional and accreditation requirements.',
};

const CALL_STATUS_COPY: Record<Stage6CallStatus, { ar: string; en: string }> = {
  idle: {
    ar: 'جاهز لبدء المكالمة الثلاثية المحاكاة.',
    en: 'Ready to start the simulated 3-party call.',
  },
  connecting: {
    ar: 'جارٍ الاتصال بالمشاركين وتفعيل قناة الترجمة.',
    en: 'Connecting participants and interpretation channel.',
  },
  live: {
    ar: 'المكالمة نشطة مع الترجمة الفورية العربية-الإنجليزية.',
    en: 'Call live with Arabic-English interpretation.',
  },
  paused: {
    ar: 'المكالمة متوقفة مؤقتًا مع الحفاظ على الحالة.',
    en: 'Call paused while preserving state.',
  },
  ended: {
    ar: 'انتهت المكالمة. التقرير الرسمي ثنائي اللغة جاهز للختم.',
    en: 'Call ended. Official bilingual report is ready for stamping.',
  },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

.alo-stage6 {
  font-family: 'Cairo', sans-serif;
  color: ${PALETTE.ink};
  background: linear-gradient(180deg, ${PALETTE.soft}, #FFFFFF);
  min-height: 100vh;
  padding: 24px;
}

.alo-stage6 * {
  box-sizing: border-box;
}

.alo-stage6 button,
.alo-stage6 input,
.alo-stage6 select,
.alo-stage6 textarea {
  font: inherit;
  color: inherit;
}

.alo-card {
  background: ${PALETTE.paper};
  border: 1px solid ${PALETTE.line};
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 12px 30px rgba(0, 123, 110, 0.08);
}

.alo-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.95fr);
  gap: 20px;
  align-items: start;
}

.alo-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.alo-participants {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.alo-participant {
  border: 1px solid ${PALETTE.line};
  border-radius: 16px;
  padding: 12px;
  background: #FFFFFF;
}

.alo-participant-speaking {
  border-color: ${PALETTE.accent};
  box-shadow: 0 0 0 2px rgba(0, 198, 174, 0.2);
}

.alo-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 4px 10px;
  background: ${PALETTE.soft};
  color: ${PALETTE.primary};
  border: 1px solid ${PALETTE.accent};
  font-size: 12px;
  font-weight: 700;
}

.alo-button {
  border: 0;
  border-radius: 14px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  background: ${PALETTE.primary};
  color: #FFFFFF;
}

.alo-button-secondary {
  background: ${PALETTE.soft};
  color: ${PALETTE.primary};
  border: 1px solid ${PALETTE.accent};
}

.alo-button-whatsapp {
  background: ${PALETTE.whatsapp};
  color: #053B2E;
}

.alo-button:focus-visible,
.alo-input:focus-visible,
.alo-select:focus-visible,
.alo-textarea:focus-visible {
  outline: 3px solid ${PALETTE.accent};
  outline-offset: 2px;
}

.alo-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 700;
  color: ${PALETTE.primary};
  font-size: 14px;
}

.alo-field {
  margin-bottom: 14px;
}

.alo-input,
.alo-select,
.alo-textarea {
  width: 100%;
  border: 1px solid ${PALETTE.line};
  border-radius: 14px;
  padding: 10px 12px;
  background: #FFFFFF;
}

.alo-textarea {
  min-height: 84px;
  resize: vertical;
}

.alo-transcript {
  max-height: 340px;
  overflow: auto;
  display: grid;
  gap: 12px;
  padding-inline-start: 0;
  margin: 0;
  list-style: none;
}

.alo-transcript-item {
  border: 1px solid ${PALETTE.line};
  border-radius: 16px;
  padding: 12px;
  background: #FFFFFF;
}

.alo-report-preview {
  overflow: auto;
  background: #F4FFFD;
  border: 1px dashed ${PALETTE.accent};
  border-radius: 18px;
  padding: 18px;
}

.alo-pdf-page {
  width: 794px;
  min-height: 1123px;
  margin: 0 auto;
  background: #FFFFFF;
  padding: 42px;
  position: relative;
  border: 1px solid #D7F4EE;
}

.alo-pdf-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: ${PALETTE.primary};
}

.alo-pdf-subtitle {
  margin: 4px 0 0;
  color: #2C5F57;
}

.alo-pdf-section {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid #D7F4EE;
}

.alo-pdf-label {
  font-size: 12px;
  font-weight: 800;
  color: ${PALETTE.primary};
  margin-bottom: 6px;
}

.alo-pdf-text-ar {
  direction: rtl;
  text-align: right;
  unicode-bidi: plaintext;
}

.alo-pdf-text-en {
  direction: ltr;
  text-align: left;
  unicode-bidi: plaintext;
}

.alo-stamp {
  position: absolute;
  right: 64px;
  bottom: 96px;
  width: 220px;
  height: 220px;
  border: 4px double ${PALETTE.primary};
  border-radius: 50%;
  color: ${PALETTE.primary};
  transform: rotate(-7deg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(230, 250, 247, 0.25);
}

.alo-stamp-inner {
  position: absolute;
  inset: 10px;
  border: 1px solid ${PALETTE.accent};
  border-radius: 50%;
}

.alo-stamp-content {
  position: relative;
  z-index: 1;
  padding: 18px;
  font-size: 11px;
  line-height: 1.4;
}

.alo-stamp-content strong {
  display: block;
  font-size: 17px;
  letter-spacing: 0.08em;
}

.alo-signature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 48px;
}

.alo-signature {
  border-top: 1px solid ${PALETTE.primary};
  padding-top: 8px;
  font-size: 12px;
}

@media (max-width: 980px) {
  .alo-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .alo-form-grid {
    grid-template-columns: 1fr;
  }
}

@media print {
  .alo-no-print {
    display: none !important;
  }

  .alo-stage6 {
    padding: 0;
    background: #FFFFFF;
  }

  .alo-report-preview {
    border: 0;
    padding: 0;
    overflow: visible;
  }

  .alo-pdf-page {
    width: auto;
    min-height: auto;
    border: 0;
  }
}
`;

const pdfCell: React.CSSProperties = {
  border: '1px solid #D7F4EE',
  padding: '8px 10px',
  verticalAlign: 'top',
};

const pdfLabelCell: React.CSSProperties = {
  ...pdfCell,
  fontWeight: 700,
  color: PALETTE.primary,
  width: '20%',
};

const pdfValueCell: React.CSSProperties = {
  ...pdfCell,
  width: '30%',
};

function personaHint(persona: AloPersonaId): { ar: string; en: string } {
  switch (persona) {
    case 'patient':
      return {
        ar: 'يمكن للمريض متابعة الترجمة والرأي الاستشاري بلغة واضحة.',
        en: 'Patient can follow interpretation and consultant opinion in clear language.',
      };
    case 'physician':
      return {
        ar: 'يمكن للطبيب المعالج مراجعة الملخص والخطة الاستشارية.',
        en: 'Treating physician can review the summary and consultant plan.',
      };
    case 'consultant':
      return {
        ar: 'يمكن للاستشاري تحرير الرأي الطبي واعتماد التقرير.',
        en: 'Consultant can edit the medical opinion and approve the report.',
      };
    case 'interpreter':
      return {
        ar: 'يمكن للمترجم اعتماد دقة الترجمة الثنائية.',
        en: 'Interpreter can certify the accuracy of the bilingual translation.',
      };
    case 'nurse':
      return {
        ar: 'يمكن للتمريض متابعة التعليمات وترتيب المتابعة.',
        en: 'Nursing can follow instructions and arrange follow-up.',
      };
    case 'pharmacist':
      return {
        ar: 'يمكن للصيدلي مراجعة السلامة الدوائية ضمن الخطة.',
        en: 'Pharmacist can review medication safety within the plan.',
      };
    case 'radiologist':
      return {
        ar: 'يمكن للأشعة مراجعة الطلبات التشخيصية المرتبطة.',
        en: 'Radiology can review associated diagnostic requests.',
      };
    case 'admin':
      return {
        ar: 'يمكن للإدارة متابعة المرجع والأختام الرسمية.',
        en: 'Administration can track reference and official stamping.',
      };
    case 'billing':
      return {
        ar: 'يمكن للفوترة ربط التقرير بمرجع الخدمة.',
        en: 'Billing can link the report to the service reference.',
      };
    case 'compliance':
      return {
        ar: 'يمكن للامتثال مراجعة الاعتمادات واللغة الرسمية.',
        en: 'Compliance can review certification and official language.',
      };
    case 'caregiver':
      return {
        ar: 'يمكن للمرافق فهم التعليمات بلغة واضحة.',
        en: 'Caregiver can understand instructions in clear language.',
      };
    default:
      return {
        ar: 'واجهة متوافقة مع جميع الملفات الشخصية.',
        en: 'Interface compatible with all personas.',
      };
  }
}

async function generateStampedPdf(node: HTMLElement, fileName: string): Promise<void> {
  const fonts = (document as any).fonts;
  if (fonts?.ready) {
    await fonts.ready;
  }

  const dynamicImport = async (specifier: string): Promise<any> => {
    try {
      return await import(specifier);
    } catch {
      return null;
    }
  };

  const [html2canvasModule, jsPdfModule] = await Promise.all([
    dynamicImport('html2canvas'),
    dynamicImport('jspdf'),
  ]);

  if (!html2canvasModule || !jsPdfModule) {
    window.print();
    return;
  }

  const html2canvas = html2canvasModule.default ?? html2canvasModule;
  const jsPDFConstructor = jsPdfModule.jsPDF ?? jsPdfModule.default?.jsPDF;

  if (typeof html2canvas !== 'function' || typeof jsPDFConstructor !== 'function') {
    window.print();
    return;
  }

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  });

  const pdf = new jsPDFConstructor({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/png');

  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    pdf.addPage();
    position = margin - (imgHeight - heightLeft);
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save(fileName);
}

export default function Stage6Telehealth({
  personaId,
  onPersonaChange,
  referenceId,
  patientNameAr,
  patientNameEn,
  consultantNameAr,
  consultantNameEn,
  interpreterNameAr,
  interpreterNameEn,
  onCompleted,
}: Stage6TelehealthProps) {
  const [internalPersona, setInternalPersona] = useState<AloPersonaId>('consultant');
  const activePersona = personaId ?? internalPersona;

  const [callStatus, setCallStatus] = useState<Stage6CallStatus>('idle');
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [opinion, setOpinion] = useState<Stage6OpinionNote>(DEFAULT_OPINION);
  const [certification, setCertification] = useState<Stage6Certification>(DEFAULT_CERTIFICATION);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [reportDate] = useState(() => new Date());

  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const participants = useMemo(
    () => ({
      patient: {
        ...DEFAULT_PARTICIPANTS.patient,
        nameAr: patientNameAr ?? DEFAULT_PARTICIPANTS.patient.nameAr,
        nameEn: patientNameEn ?? DEFAULT_PARTICIPANTS.patient.nameEn,
      },
      consultant: {
        ...DEFAULT_PARTICIPANTS.consultant,
        nameAr: consultantNameAr ?? DEFAULT_PARTICIPANTS.consultant.nameAr,
        nameEn: consultantNameEn ?? DEFAULT_PARTICIPANTS.consultant.nameEn,
      },
      interpreter: {
        ...DEFAULT_PARTICIPANTS.interpreter,
        nameAr: interpreterNameAr ?? DEFAULT_PARTICIPANTS.interpreter.nameAr,
        nameEn: interpreterNameEn ?? DEFAULT_PARTICIPANTS.interpreter.nameEn,
      },
    }),
    [
      patientNameAr,
      patientNameEn,
      consultantNameAr,
      consultantNameEn,
      interpreterNameAr,
      interpreterNameEn,
    ]
  );

  const participantList = useMemo(() => Object.values(participants) as Stage6Participant[], [participants]);

  const serial = useMemo(
    () => referenceId ?? `ALO-K08-P25-C08-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    [referenceId]
  );

  const dateInfo = useMemo(() => {
    const gregorianEn = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(reportDate);

    const gregorianAr = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(reportDate);

    let hijriAr = '';
    try {
      hijriAr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        dateStyle: 'long',
      }).format(reportDate);
    } catch {
      hijriAr = '';
    }

    return { gregorianEn, gregorianAr, hijriAr };
  }, [reportDate]);

  const visibleLines = useMemo(() => {
    if (callStatus !== 'live' && callStatus !== 'paused' && callStatus !== 'ended') {
      return [];
    }

    const count = Math.max(0, Math.min(activeLineIndex + 1, DEFAULT_SCRIPT.length));
    return DEFAULT_SCRIPT.slice(0, count);
  }, [callStatus, activeLineIndex]);

  const currentLine = visibleLines.length > 0 ? visibleLines[visibleLines.length - 1] : null;

  useEffect(() => {
    if (callStatus !== 'connecting') return;

    const timer = setTimeout(() => {
      setCallStatus('live');
    }, 1200);

    return () => clearTimeout(timer);
  }, [callStatus]);

  useEffect(() => {
    if (callStatus !== 'live') return;

    if (activeLineIndex >= DEFAULT_SCRIPT.length) {
      setCallStatus('ended');
      return;
    }

    const timer = setTimeout(() => {
      setActiveLineIndex((index) => index + 1);
    }, 4200);

    return () => clearTimeout(timer);
  }, [callStatus, activeLineIndex]);

  useEffect(() => {
    if (!transcriptRef.current) return;
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [visibleLines.length, callStatus]);

  const handlePersonaChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = event.target.value as AloPersonaId;
      setInternalPersona(next);
      onPersonaChange?.(next);
    },
    [onPersonaChange]
  );

  const startCall = useCallback(() => {
    setActiveLineIndex(0);
    setCallStatus('connecting');
    setPdfStatus('idle');
  }, []);

  const togglePause = useCallback(() => {
    setCallStatus((prev) => (prev === 'live' ? 'paused' : prev === 'paused' ? 'live' : prev));
  }, []);

  const endCall = useCallback(() => {
    setActiveLineIndex(DEFAULT_SCRIPT.length);
    setCallStatus('ended');
  }, []);

  const skipToEnd = useCallback(() => {
    setActiveLineIndex(DEFAULT_SCRIPT.length);
    setCallStatus('ended');
  }, []);

  const restartCall = useCallback(() => {
    setActiveLineIndex(0);
    setCallStatus('idle');
    setPdfStatus('idle');
  }, []);

  const updateOpinion = useCallback((key: keyof Stage6OpinionNote, value: string) => {
    setOpinion((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateCertification = useCallback((key: keyof Stage6Certification, value: string) => {
    setCertification((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reportPayload = useMemo<Stage6ReportPayload>(
    () => ({
      referenceId: serial,
      generatedAt: reportDate.toISOString(),
      personaId: activePersona,
      participants: participantList,
      script: DEFAULT_SCRIPT,
      opinion,
      certification,
    }),
    [serial, reportDate, activePersona, participantList, opinion, certification]
  );

  const handleDownloadPdf = useCallback(async () => {
    if (!reportRef.current) return;

    setPdfStatus('generating');

    try {
      await generateStampedPdf(reportRef.current, `ALO-DOCTOR-Stage6-${serial}.pdf`);
      setPdfStatus('ready');
      onCompleted?.(reportPayload);
    } catch (error) {
      console.error(error);
      setPdfStatus('error');
      window.print();
    }
  }, [serial, reportPayload, onCompleted]);

  const isSpeaking = useCallback(
    (participantId: Stage6ParticipantId) => {
      if (callStatus !== 'live' || !currentLine) return false;
      return currentLine.speakerId === participantId || (participantId === 'interpreter' && currentLine.interpreterActive);
    },
    [callStatus, currentLine]
  );

  const hint = personaHint(activePersona);
  const statusCopy = CALL_STATUS_COPY[callStatus];

  return (
    <div className="alo-stage6" dir="ltr">
      <style>{css}</style>

      <header className="alo-no-print" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, color: PALETTE.primary, fontSize: 28, fontWeight: 800 }}>
            ALO DOCTOR | Stage 6
          </h1>
          <p style={{ margin: '6px 0 0', color: '#2C5F57', fontWeight: 600 }}>
            3-Party Telehealth Call & Stamped Bilingual PDF Report | K08, P25, C08
          </p>
        </div>

        <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="alo-badge">K08</span>
            <span className="alo-badge">P25</span>
            <span className="alo-badge">C08</span>
            <span className="alo-badge">{serial}</span>
          </div>

          <div style={{ minWidth: 260 }}>
            <label htmlFor="alo-persona-select" className="alo-label">
              Persona / الملف الشخصي
            </label>
            <select
              id="alo-persona-select"
              className="alo-select"
              value={activePersona}
              onChange={handlePersonaChange}
              aria-label="Switch persona profile"
            >
              {PERSONAS.map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.labelEn} | {persona.labelAr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="alo-grid alo-no-print">
        <section className="alo-card" aria-label="Simulated 3-party telehealth call">
          <h2 style={{ marginTop: 0, color: PALETTE.primary }}>Telehealth Call / المكالمة الثلاثية</h2>

          <div className="alo-participants">
            {participantList.map((participant) => (
              <article
                key={participant.id}
                className={`alo-participant ${isSpeaking(participant.id) ? 'alo-participant-speaking' : ''}`}
                aria-label={`${participant.nameEn}, ${participant.nameAr}`}
              >
                <strong style={{ display: 'block', color: PALETTE.primary }}>{participant.nameEn}</strong>
                <strong style={{ display: 'block', color: PALETTE.primary }} dir="rtl" lang="ar">
                  {participant.nameAr}
                </strong>
                <span style={{ display: 'block', fontSize: 13, marginTop: 6 }}>{participant.roleEn}</span>
                <span style={{ display: 'block', fontSize: 13 }} dir="rtl" lang="ar">
                  {participant.roleAr}
                </span>
                <span className="alo-badge" style={{ marginTop: 8 }}>{participant.language}</span>
              </article>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <button type="button" className="alo-button" onClick={startCall}>
              Start Call / بدء المكالمة
            </button>
            <button type="button" className="alo-button alo-button-secondary" onClick={togglePause}>
              Pause / Resume
            </button>
            <button type="button" className="alo-button alo-button-secondary" onClick={skipToEnd}>
              Skip to Report
            </button>
            <button type="button" className="alo-button alo-button-secondary" onClick={endCall}>
              End Call
            </button>
            <button type="button" className="alo-button alo-button-secondary" onClick={restartCall}>
              Reset
            </button>
            <button type="button" className="alo-button alo-button-whatsapp" onClick={handleDownloadPdf}>
              Download Stamped PDF
            </button>
            <button type="button" className="alo-button alo-button-secondary" onClick={() => window.print()}>
              Print
            </button>
          </div>

          <p role="status" aria-live="polite" style={{ fontWeight: 700, color: PALETTE.primary }}>
            {statusCopy.en} | {statusCopy.ar}
          </p>

          <p style={{ margin: '6px 0 14px', color: '#2C5F57' }}>
            {hint.en} | {hint.ar}
          </p>

          <div ref={transcriptRef} role="log" aria-live="polite" className="alo-transcript">
            {visibleLines.length === 0 ? (
              <div className="alo-transcript-item">
                <p style={{ margin: 0 }} dir="ltr" lang="en">
                  The simulated transcript will appear here once the call starts.
                </p>
                <p style={{ margin: '6px 0 0' }} dir="rtl" lang="ar">
                  سيظهر نص المكالمة المحاكاة هنا بعد بدء الاتصال.
                </p>
              </div>
            ) : (
              visibleLines.map((line) => (
                <article key={line.id} className="alo-transcript-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <strong>
                      {participants[line.speakerId].nameEn} • {participants[line.speakerId].nameAr}
                    </strong>
                    <span className="alo-badge">
                      {line.originalLanguage === 'ar' ? 'AR → EN' : 'EN → AR'}
                    </span>
                  </div>

                  {line.originalAr ? (
                    <p dir="rtl" lang="ar" style={{ margin: '8px 0 0', textAlign: 'right' }}>
                      {line.originalAr}
                    </p>
                  ) : null}

                  {line.originalEn ? (
                    <p dir="ltr" lang="en" style={{ margin: '8px 0 0', textAlign: 'left' }}>
                      {line.originalEn}
                    </p>
                  ) : null}

                  {line.translatedEn ? (
                    <p dir="ltr" lang="en" style={{ margin: '8px 0 0', textAlign: 'left', color: '#2C5F57' }}>
                      <span className="alo-badge" style={{ marginRight: 8 }}>Interpreter</span>
                      {line.translatedEn}
                    </p>
                  ) : null}

                  {line.translatedAr ? (
                    <p dir="rtl" lang="ar" style={{ margin: '8px 0 0', textAlign: 'right', color: '#2C5F57' }}>
                      <span className="alo-badge" style={{ marginLeft: 8 }}>مترجم</span>
                      {line.translatedAr}
                    </p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="alo-card" aria-label="Consultant opinion note">
          <h2 style={{ marginTop: 0, color: PALETTE.primary }}>Consultant Opinion / رأي الاستشاري</h2>

          <div className="alo-form-grid">
            <div className="alo-field">
              <label htmlFor="alo-opinion-chief-ar" className="alo-label">Chief Complaint (Arabic)</label>
              <textarea
                id="alo-opinion-chief-ar"
                className="alo-textarea"
                dir="rtl"
                lang="ar"
                value={opinion.chiefComplaintAr}
                onChange={(event) => updateOpinion('chiefComplaintAr', event.target.value)}
              />
            </div>

            <div className="alo-field">
              <label htmlFor="alo-opinion-chief-en" className="alo-label">Chief Complaint (English)</label>
              <textarea
                id="alo-opinion-chief-en"
                className="alo-textarea"
                dir="ltr"
                lang="en"
                value={opinion.chiefComplaintEn}
                onChange={(event) => updateOpinion('chiefComplaintEn', event.target.value)}
              />
            </div>

            <div className="alo-field">
              <label htmlFor="alo-opinion-assessment-ar" className="alo-label">Assessment (Arabic)</label>
              <textarea
                id="alo-opinion-assessment-ar"
                className="alo-textarea"
                dir="rtl"
                lang="ar"
                value={opinion.assessmentAr}
                onChange={(event) => updateOpinion('assessmentAr', event.target.value)}
              />
            </div>

            <div className="alo-field">
              <label htmlFor="alo-opinion-assessment-en" className="alo-label">Assessment (English)</label>
              <textarea
                id="alo-opinion-assessment-en"
                className="alo-textarea"
                dir="ltr"
                lang="en"
                value={opinion.assessmentEn}
                onChange={(event) => updateOpinion('assessmentEn', event.target.value)}
              />
            </div>

            <div className="alo-field">
              <label htmlFor="alo-opinion-plan-ar" className="alo-label">Plan (Arabic)</label>
              <textarea
                id="alo-opinion-plan-ar"
                className="alo-textarea"
                dir="rtl"
                lang="ar"
                value={opinion.planAr}
                onChange={(event) => updateOpinion('planAr', event.target.value)}
              />
            </div>

            <div className="alo-field">
              <label htmlFor="alo-opinion-plan-en" className="alo-label">Plan (English)</label>
              <textarea
                id="alo-opinion-plan-en"
                className="alo-textarea"
                dir="ltr"
                lang="en"
                value={opinion.planEn}
                onChange={(event) => updateOpinion('planEn', event.target.value)}
              />
            </div>

            <div className="alo-field">
              <label htmlFor="alo-opinion-followup-ar" className="alo-label">Follow-up (Arabic)</label>
              <textarea
                id="alo-opinion-followup-ar"
                className="alo-textarea"
                dir="rtl"
                lang="ar"
                value={opinion.followUpAr}
                onChange={(event) => updateOpinion('followUpAr', event.target.value)}
              />
            </div>

            <div className="alo-field">
              <label htmlFor="alo-opinion-followup-en" className="alo-label">Follow-up (English)</label>
              <textarea
                id="alo-opinion-followup-en"
                className="alo-textarea"
                dir="ltr"
                lang="en"
                value={opinion.followUpEn}
                onChange={(event) => updateOpinion('followUpEn', event.target.value)}
              />
            </div>

            <div className="alo-field">
              <label htmlFor="alo-opinion-urgency" className="alo-label">Urgency / درجة الاستعجال</label>
              <select
                id="alo-opinion-urgency"
                className="alo-select"
                value={opinion.urgency}
                onChange={(event) => updateOpinion('urgency', event.target.value)}
              >
                <option value="routine">Routine / روتيني</option>
                <option value="urgent_24h">Urgent within 24 hours / عاجل خلال 24 ساعة</option>
                <option value="emergency">Emergency / طارئ</option>
              </select>
            </div>
          </div>
        </section>
      </main>

      <section className="alo-card alo-no-print" aria-label="Certified translation" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0, color: PALETTE.primary }}>Certified Translation / الترجمة المعتمدة</h2>

        <div className="alo-form-grid">
          <div className="alo-field">
            <label htmlFor="alo-cert-name-ar" className="alo-label">Interpreter Name (Arabic)</label>
            <input
              id="alo-cert-name-ar"
              className="alo-input"
              dir="rtl"
              lang="ar"
              value={certification.translatorNameAr}
              onChange={(event) => updateCertification('translatorNameAr', event.target.value)}
            />
          </div>

          <div className="alo-field">
            <label htmlFor="alo-cert-name-en" className="alo-label">Interpreter Name (English)</label>
            <input
              id="alo-cert-name-en"
              className="alo-input"
              dir="ltr"
              lang="en"
              value={certification.translatorNameEn}
              onChange={(event) => updateCertification('translatorNameEn', event.target.value)}
            />
          </div>

          <div className="alo-field">
            <label htmlFor="alo-cert-license" className="alo-label">License Number / رقم الترخيص</label>
            <input
              id="alo-cert-license"
              className="alo-input"
              dir="ltr"
              value={certification.licenseNo}
              onChange={(event) => updateCertification('licenseNo', event.target.value)}
            />
          </div>

          <div className="alo-field">
            <label htmlFor="alo-cert-statement-ar" className="alo-label">Certification Statement (Arabic)</label>
            <textarea
              id="alo-cert-statement-ar"
              className="alo-textarea"
              dir="rtl"
              lang="ar"
              value={certification.certificationAr}
              onChange={(event) => updateCertification('certificationAr', event.target.value)}
            />
          </div>

          <div className="alo-field">
            <label htmlFor="alo-cert-statement-en" className="alo-label">Certification Statement (English)</label>
            <textarea
              id="alo-cert-statement-en"
              className="alo-textarea"
              dir="ltr"
              lang="en"
              value={certification.certificationEn}
              onChange={(event) => updateCertification('certificationEn', event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="alo-card" aria-label="Official bilingual stamped report" style={{ marginTop: 20 }}>
        <div className="alo-no-print" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: PALETTE.primary }}>Official Report Preview / معاينة التقرير الرسمي</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="alo-badge" aria-live="polite">
              {pdfStatus === 'generating'
                ? 'Generating PDF...'
                : pdfStatus === 'ready'
                  ? 'PDF ready'
                  : pdfStatus === 'error'
                    ? 'Fallback print mode'
                    : 'Stamped bilingual PDF'}
            </span>
            <button type="button" className="alo-button alo-button-whatsapp" onClick={handleDownloadPdf}>
              Generate Official PDF
            </button>
          </div>
        </div>

        <div className="alo-report-preview">
          <div ref={reportRef} className="alo-pdf-page" aria-label="Stamped bilingual PDF content">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ direction: 'ltr', textAlign: 'left' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: PALETTE.primary }}>ALO DOCTOR</div>
                <div style={{ color: '#2C5F57' }}>Saudi Edition v2.4</div>
                <div style={{ color: '#2C5F57' }}>Stage 6: 3-Party Telehealth</div>
              </div>

              <div dir="rtl" lang="ar" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: PALETTE.primary }}>ألو دكتور</div>
                <div style={{ color: '#2C5F57' }}>النسخة السعودية 2.4</div>
                <div style={{ color: '#2C5F57' }}>المرحلة السادسة: الاستشارة الثلاثية</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <h2 className="alo-pdf-title">Official Stamped Bilingual Telehealth Report</h2>
              <p className="alo-pdf-subtitle" dir="rtl" lang="ar">
                تقرير رسمي مختوم ثنائي اللغة للاستشارة الطبية عن بُعد
              </p>
            </div>

            <table style={{ width: '100%', marginTop: 18, borderCollapse: 'collapse', fontSize: 12 }}>
              <tbody>
                <tr>
                  <td style={pdfLabelCell}>Reference / المرجع</td>
                  <td style={pdfValueCell}>{serial}</td>
                  <td style={pdfLabelCell}>Case IDs / معرفات الحالة</td>
                  <td style={pdfValueCell}>K08, P25, C08</td>
                </tr>
                <tr>
                  <td style={pdfLabelCell}>Gregorian Date</td>
                  <td style={pdfValueCell}>{dateInfo.gregorianEn}</td>
                  <td style={pdfLabelCell}>التاريخ الميلادي</td>
                  <td style={{ ...pdfValueCell, direction: 'rtl', textAlign: 'right' }}>{dateInfo.gregorianAr}</td>
                </tr>
                {dateInfo.hijriAr ? (
                  <tr>
                    <td style={pdfLabelCell}>Hijri / الهجري</td>
                    <td colSpan={3} style={{ ...pdfValueCell, direction: 'rtl', textAlign: 'right' }}>
                      {dateInfo.hijriAr}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            <div className="alo-pdf-section">
              <div className="alo-pdf-label">Participants / المشاركون</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={pdfLabelCell}>Name (EN)</th>
                    <th style={pdfLabelCell}>Name (AR)</th>
                    <th style={pdfLabelCell}>Role (EN)</th>
                    <th style={pdfLabelCell}>Role (AR)</th>
                    <th style={pdfLabelCell}>Language</th>
                  </tr>
                </thead>
                <tbody>
                  {participantList.map((participant) => (
                    <tr key={participant.id}>
                      <td style={pdfValueCell}>{participant.nameEn}</td>
                      <td style={{ ...pdfValueCell, direction: 'rtl', textAlign: 'right' }}>{participant.nameAr}</td>
                      <td style={pdfValueCell}>{participant.roleEn}</td>
                      <td style={{ ...pdfValueCell, direction: 'rtl', textAlign: 'right' }}>{participant.roleAr}</td>
                      <td style={pdfValueCell}>{participant.language}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="alo-pdf-section">
              <div className="alo-pdf-label">Consultation Summary / ملخص الاستشارة</div>
              {DEFAULT_SCRIPT.map((line) => (
                <div key={line.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: PALETTE.primary }}>
                    {participants[line.speakerId].nameEn} | {participants[line.speakerId].nameAr}
                  </div>

                  {line.originalAr ? (
                    <p className="alo-pdf-text-ar" lang="ar" style={{ margin: '4px 0' }}>
                      {line.originalAr}
                    </p>
                  ) : null}

                  {line.originalEn ? (
                    <p className="alo-pdf-text-en" lang="en" style={{ margin: '4px 0' }}>
                      {line.originalEn}
                    </p>
                  ) : null}

                  {line.translatedAr ? (
                    <p className="alo-pdf-text-ar" lang="ar" style={{ margin: '4px 0', color: '#2C5F57' }}>
                      Interpretation AR: {line.translatedAr}
                    </p>
                  ) : null}

                  {line.translatedEn ? (
                    <p className="alo-pdf-text-en" lang="en" style={{ margin: '4px 0', color: '#2C5F57' }}>
                      Interpretation EN: {line.translatedEn}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="alo-pdf-section">
              <div className="alo-pdf-label">Consultant Opinion Note / رأي الاستشاري</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 12 }}>
                <div className="alo-pdf-text-ar" lang="ar">
                  <p style={{ margin: '0 0 8px' }}>الشكوى الرئيسية: {opinion.chiefComplaintAr}</p>
                  <p style={{ margin: '0 0 8px' }}>التقييم: {opinion.assessmentAr}</p>
                  <p style={{ margin: '0 0 8px' }}>الخطة: {opinion.planAr}</p>
                  <p style={{ margin: '0 0 8px' }}>المتابعة: {opinion.followUpAr}</p>
                  <p style={{ margin: 0 }}>درجة الاستعجال: {opinion.urgency === 'urgent_24h' ? 'عاجل خلال 24 ساعة' : opinion.urgency === 'emergency' ? 'طارئ' : 'روتيني'}</p>
                </div>

                <div className="alo-pdf-text-en" lang="en">
                  <p style={{ margin: '0 0 8px' }}>Chief complaint: {opinion.chiefComplaintEn}</p>
                  <p style={{ margin: '0 0 8px' }}>Assessment: {opinion.assessmentEn}</p>
                  <p style={{ margin: '0 0 8px' }}>Plan: {opinion.planEn}</p>
                  <p style={{ margin: '0 0 8px' }}>Follow-up: {opinion.followUpEn}</p>
                  <p style={{ margin: 0 }}>
                    Urgency: {opinion.urgency === 'urgent_24h' ? 'Urgent within 24 hours' : opinion.urgency === 'emergency' ? 'Emergency' : 'Routine'}
                  </p>
                </div>
              </div>
            </div>

            <div className="alo-pdf-section">
              <div className="alo-pdf-label">Certified Translation / الترجمة المعتمدة</div>
              <p className="alo-pdf-text-ar" lang="ar" style={{ margin: '0 0 8px' }}>
                {certification.certificationAr}
              </p>
              <p className="alo-pdf-text-en" lang="en" style={{ margin: '0 0 12px' }}>
                {certification.certificationEn}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                <div className="alo-pdf-text-ar" lang="ar">
                  اسم المترجم: {certification.translatorNameAr}
                  <br />
                  رقم الترخيص: {certification.licenseNo}
                </div>
                <div className="alo-pdf-text-en" lang="en">
                  Interpreter: {certification.translatorNameEn}
                  <br />
                  License: {certification.licenseNo}
                </div>
              </div>
            </div>

            <div className="alo-signature-grid">
              <div className="alo-signature">
                Consultant / الاستشاري
                <br />
                {participants.consultant.nameEn}
                <br />
                {participants.consultant.nameAr}
              </div>

              <div className="alo-signature">
                Interpreter / المترجم
                <br />
                {participants.interpreter.nameEn}
                <br />
                {participants.interpreter.nameAr}
              </div>

              <div className="alo-signature">
                Generated by / تم الإنشاء بواسطة
                <br />
                ALO DOCTOR System
                <br />
                {dateInfo.gregorianEn}
              </div>
            </div>

            <div className="alo-stamp" aria-hidden="true">
              <div className="alo-stamp-inner" />
              <div className="alo-stamp-content">
                <strong>ALO DOCTOR</strong>
                <span>Saudi Edition v2.4</span>
                <span>Official Telehealth Report</span>
                <span>{serial}</span>
                <span>{dateInfo.gregorianEn}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
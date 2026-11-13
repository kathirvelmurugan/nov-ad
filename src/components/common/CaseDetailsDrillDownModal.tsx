import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Stethoscope,
  Eye,
  FileText,
  QrCode,
  ShieldCheck,
  Receipt,
  Activity,
  Layers,
  Calendar,
  MessageSquare,
  FileCheck2,
} from 'lucide-react';
import { ClinicalCase } from '../../types';
import { getStageBadgeMeta } from './PortalCaseTrackerPanel';
import { BilingualReportModal } from '../cockpit/BilingualReportModal';

interface CaseDetailsDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: ClinicalCase | null;
  lang?: 'ar' | 'en';
}

type DrillDownTab = 'journey' | 'clinical' | 'opinions' | 'followup' | 'facility';

export const CaseDetailsDrillDownModal: React.FC<CaseDetailsDrillDownModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  lang = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<DrillDownTab>('journey');
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'pdf1' | 'pdf2'>('pdf1');

  if (!isOpen || !caseItem) return null;

  const isRTL = lang === 'ar';
  const stageMeta = getStageBadgeMeta(caseItem.currentStage, isRTL);

  const patientName = isRTL
    ? caseItem.patientNameAr || caseItem.patientName || 'مريض غير محدد'
    : caseItem.patientNameEn || caseItem.patientName || 'Patient';

  const specialty = isRTL
    ? caseItem.specialtyAr || caseItem.specialty || 'الطب العام'
    : caseItem.specialtyEn || caseItem.specialty || 'General Medicine';

  const diagnosis = isRTL
    ? caseItem.diagnosisAr || caseItem.diagnosis || 'استشارة طبية عامة'
    : caseItem.diagnosisEn || caseItem.diagnosis || 'Clinical Consultation';

  const hospitalName = isRTL
    ? caseItem.treatingDoctor?.hospital || 'مجمع الرعاية الطبية - الرياض'
    : caseItem.treatingDoctor?.hospital || 'Riyadh Care Medical Center';

  const doctorName = caseItem.treatingDoctor?.name || 'د. عبدالله الشمري';
  const consultantName = caseItem.consultant?.name || 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)';

  const patientQuestions = (caseItem.metadata?.patientQuestions as string[]) || [];
  const followUpAnswers =
    (caseItem.metadata?.coordinatorReplies as string[]) ||
    (caseItem.metadata?.followUpAnswers as string[]) ||
    (caseItem.metadata?.consultantAnswers as string[]) ||
    [];

  const isPdf2Available = Boolean(caseItem.metadata?.pdf2Released || caseItem.currentStage === 'CLOSED');

  const tabs: { id: DrillDownTab; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'journey', labelAr: 'المسار والمرحلة الحالية', labelEn: 'Journey & Stage', icon: <Layers className="w-4 h-4" /> },
    { id: 'clinical', labelAr: 'الملف السريري والتشخيص', labelEn: 'Clinical Dossier', icon: <Activity className="w-4 h-4" /> },
    { id: 'opinions', labelAr: 'الرأي الطبي والتقارير', labelEn: 'Specialist Opinions', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'followup', labelAr: 'متابعة 21 يوماً والإغلاق', labelEn: 'Follow-Up & Closure', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'facility', labelAr: 'أوامر المنشأة والفوترة', labelEn: 'Facility Orders & ZATCA', icon: <Receipt className="w-4 h-4" /> },
  ];

  // Pipeline Stages definition for visual stepper
  const pipelineSteps = [
    { key: 'INTAKE', labelAr: 'استلام وفرز', labelEn: 'Intake & Triage', stages: ['INTAKE_RECEIVED', 'NURSE_CHECK'] },
    { key: 'DOCTOR', labelAr: 'الطبيب السعودي', labelEn: 'Saudi Doctor', stages: ['DOCTOR_REVIEW'] },
    { key: 'PAYMENT', labelAr: 'السداد والفوترة', labelEn: 'ZATCA Payment', stages: ['AWAITING_PAYMENT'] },
    { key: 'CONSULTANT', labelAr: 'الاستشاري الدولي', labelEn: 'Consultant', stages: ['WITH_CONSULTANT', 'OPINION_READY'] },
    { key: 'FOLLOWUP', labelAr: 'متابعة 21 يوماً', labelEn: '21-Day Follow-Up', stages: ['PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS'] },
    { key: 'CLOSED', labelAr: 'مغلقة ومؤرشفة', labelEn: 'Closed & Archived', stages: ['CLOSED'] },
  ];

  const getStepStatus = (stepStages: string[]) => {
    if (stepStages.includes(caseItem.currentStage)) return 'current';
    const allStagesOrdered = [
      'INTAKE_RECEIVED',
      'NURSE_CHECK',
      'DOCTOR_REVIEW',
      'AWAITING_PAYMENT',
      'WITH_CONSULTANT',
      'OPINION_READY',
      'PARTNER_SERVICES',
      'FOLLOW_UP_21_DAYS',
      'CLOSED',
    ];
    const currentIndex = allStagesOrdered.indexOf(caseItem.currentStage);
    const maxStepIndex = Math.max(...stepStages.map((s) => allStagesOrdered.indexOf(s)));
    return maxStepIndex < currentIndex ? 'completed' : 'upcoming';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-cairo"
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                {caseItem.caseNumber || caseItem.id}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${stageMeta.colorClass}`}>
                {stageMeta.label}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                {isRTL ? 'أولوية سريرية: عاجلة' : 'Priority: STAT'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
              {patientName}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span>{specialty}</span>
              <span>•</span>
              <span className="font-mono">{isRTL ? 'الهوية الوطنية:' : 'National ID:'} {caseItem.nationalIdMasked || '10********'}</span>
              <span>•</span>
              <span>{isRTL ? `${caseItem.age || 45} سنة · ${caseItem.gender === 'F' ? 'أنثى' : 'ذكر'}` : `${caseItem.age || 45} yrs · ${caseItem.gender === 'F' ? 'Female' : 'Male'}`}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {hospitalName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            aria-label={isRTL ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 overflow-x-auto gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#007B6E] text-[#007B6E] dark:text-[#00C6AE]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{isRTL ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: JOURNEY & STAGE PIPELINE */}
          {activeTab === 'journey' && (
            <div className="space-y-6">
              {/* Stepper Visualization */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  {isRTL ? 'مراحل المسار السريري الموحد (ALO Corridor)' : 'Clinical Pathway Pipeline'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {pipelineSteps.map((step, idx) => {
                    const status = getStepStatus(step.stages);
                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                          status === 'current'
                            ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700 font-extrabold text-emerald-900 dark:text-emerald-300 shadow-xs ring-2 ring-emerald-500/20'
                            : status === 'completed'
                            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            : 'bg-slate-100/60 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] opacity-75">#{idx + 1}</span>
                          {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {status === 'current' && <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
                        </div>
                        <div className="font-bold text-[11px] leading-tight">
                          {isRTL ? step.labelAr : step.labelEn}
                        </div>
                        <div className="text-[10px] mt-1 opacity-70">
                          {status === 'current'
                            ? isRTL ? 'قيد المعالجة' : 'In Progress'
                            : status === 'completed'
                            ? isRTL ? 'مكتملة' : 'Completed'
                            : isRTL ? 'مقبلة' : 'Pending'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status & SLA Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1">
                    {isRTL ? 'المرحلة الحالية' : 'Current Stage'}
                  </span>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {stageMeta.label}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1">
                    {isRTL ? 'رمز النقل المشفر (Egress)' : 'Cross-Border Token'}
                  </span>
                  <div className="text-sm font-mono font-bold text-teal-700 dark:text-teal-400">
                    {caseItem.egressToken || 'ALO-KSA-9482'}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    ✓ {isRTL ? 'معتمد ومحمي من SDAIA' : 'SDAIA NDMO De-identified'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1">
                    {isRTL ? 'تاريخ الإنشاء' : 'Registered At'}
                  </span>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : 'Today'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLINICAL DOSSIER */}
          {activeTab === 'clinical' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  {isRTL ? 'التشخيص المعتمد' : 'Primary Diagnosis'}
                </span>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {diagnosis}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 block mb-2">
                  {isRTL ? 'الأعراض والشكوى السريرية الأولية' : 'Symptoms & Clinical Presentation'}
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isRTL
                    ? caseItem.symptomsAr || caseItem.symptoms || 'ألم مستمر وضيق تنفسي خفيف عند المجهود، مع رغبة في استشارة استشاري جراحة قلب متخصص.'
                    : caseItem.symptomsEn || caseItem.symptoms || 'Exertional dyspnea, mild chest discomfort upon exertion, seeking certified specialist second opinion.'}
                </p>
              </div>

              {/* 3 Mandated Focus Questions */}
              <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
                <span className="text-xs font-bold text-teal-800 dark:text-teal-300 block mb-2.5">
                  📋 {isRTL ? 'أسئلة التركيز الثلاثة للطبيب المعالج (Mandated Questions):' : 'Treating Doctor Mandated Focus Questions:'}
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {(caseItem.treatingDoctor?.focusQuestions || [
                    'هل يوصى بالتدخل الجراحي أم العلاج التداخلي بالقسطرة؟',
                    'ما هو البروتوكول الدوائي الأمثل لمنع التخثر؟',
                    'الجدول الزمني الموصى به للمتابعة وإعادة التقييم؟',
                  ]).map((q, i) => (
                    <li key={i} className="leading-relaxed">
                      {q}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Diagnostic Files List */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 block mb-2">
                  📎 {isRTL ? 'المرفقات والفحوصات التشخيصية المعتمدة' : 'Attached Diagnostic Scans & Reports'}
                </span>
                <div className="space-y-2">
                  {(caseItem.files && caseItem.files.length > 0 ? caseItem.files : [
                    { id: 'f1', name: 'Echocardiogram_Report_Nov2026.pdf', size: '2.4 MB' },
                    { id: 'f2', name: 'Cardiac_CTA_Scan_Deidentified.dcm', size: '18.1 MB' },
                  ]).map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{file.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPECIALIST OPINIONS & CERTIFIED REPORTS */}
          {activeTab === 'opinions' && (
            <div className="space-y-5">
              {/* Indian Consultant Opinion */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    👨‍⚕️ {isRTL ? 'الرأي الطبي الاستشاري الدولي (الهند)' : 'International Specialist Opinion (India)'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{consultantName}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {caseItem.consultantOpinion || caseItem.consultant?.opinionEnglish || 'Transcatheter Aortic Valve Replacement (TAVR) is clinically favored over surgical aortic valve replacement given calculated intermediate-to-high STS score and favorable femoral vascular access geometry. Dual antiplatelet therapy recommended for 3 months.'}
                </p>
              </div>

              {/* Saudi Doctor Endorsement */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {isRTL ? 'اعتماد وختم الطبيب السعودي المعالج (MOH / SCFHS)' : 'Saudi Treating Doctor Endorsement (MOH Sealed)'}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{doctorName}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                  {isRTL
                    ? 'تم تدقيق التقرير السريري ومطابقته للأنظمة الصحية السعودية والموافقة على التوصيات العلاجية مع جدولة فحص متابعة دورية.'
                    : 'Endorsed in alignment with Saudi Ministry of Health clinical practice guidelines and local hospital protocol.'}
                </p>
              </div>

              {/* Certified Reports Preview Action Buttons */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReportType('pdf1');
                    setIsPDFModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#007B6E] text-white text-xs font-bold shadow-xs hover:bg-[#005F55] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isRTL ? 'معاينة التقرير الأول (PDF 1)' : 'Preview Second Opinion (PDF 1)'}</span>
                </button>

                {isPdf2Available && (
                  <button
                    type="button"
                    onClick={() => {
                      setReportType('pdf2');
                      setIsPDFModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>{isRTL ? 'معاينة الملف الشامل النهائي (PDF 2)' : 'Preview Comprehensive Dossier (PDF 2)'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: 21-DAY FOLLOW-UP & CLOSURE */}
          {activeTab === 'followup' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRTL ? 'حالة نافذة المتابعة المجانية:' : '21-Day Follow-Up Window:'}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {caseItem.currentStage === 'CLOSED'
                    ? (isRTL ? 'مغلقة ومكتملة' : 'Completed & Closed')
                    : (isRTL ? 'نشطة ومفتوحة' : 'Active Channel')}
                </span>
              </div>

              {/* Patient Questions & Doctor Answers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {isRTL ? 'سجل الاستفسارات والإجابات السريرية:' : 'Clarification Questions & Answers Log:'}
                </h4>

                {patientQuestions.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    {isRTL ? 'لا توجد استفسارات إضافية مسجلة في هذا الملف.' : 'No additional follow-up questions submitted.'}
                  </div>
                ) : (
                  patientQuestions.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white flex items-start gap-1.5">
                        <span className="text-teal-600 font-mono">Q{idx + 1}:</span>
                        <span>{q}</span>
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-medium pl-4 rtl:pr-4">
                        ↳ <strong>{isRTL ? 'رد وتوجيه منسق رعاية ألو:' : 'ALO Care Coordinator Reply:'}</strong> {followUpAnswers[idx] || (isRTL ? 'تمت الإفادة والمتابعة السريرية المباشرة.' : 'Direct clinical guidance provided.')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Patient Rating */}
              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  {isRTL ? 'تقييم رضا المريض عن الاستشارة:' : 'Patient Satisfaction Score:'}
                </span>
                <span className="font-black text-amber-700 dark:text-amber-300 text-sm">
                  ⭐ {(caseItem.metadata?.rating as number) || 5} / 5
                </span>
              </div>
            </div>
          )}

          {/* TAB 5: FACILITY ORDERS & ZATCA BILLING */}
          {activeTab === 'facility' && (
            <div className="space-y-5">
              {/* Hospital Check-in Code */}
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block mb-0.5">
                    {isRTL ? 'رمز وصول المريض للمستشفى (Reception Check-in)' : 'Hospital Reception Check-in Code'}
                  </span>
                  <span className="text-xs text-purple-700 dark:text-purple-400">
                    {hospitalName}
                  </span>
                </div>
                <span className="font-mono text-base font-black px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-purple-800 dark:text-purple-300 border border-purple-300 shadow-xs flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-600" />
                  {(caseItem.metadata as any)?.checkInCode || 'RC-8842'}
                </span>
              </div>

              {/* ZATCA Tax Invoice */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isRTL ? 'فاتورة ضريبة القيمة المضافة (ZATCA Phase 2)' : 'ZATCA VAT Tax Invoice Record'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {caseItem.pricing?.invoiceNumber || 'INV-2026-LIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isRTL ? 'الباقة' : 'Package'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {caseItem.consultationType === 'video'
                        ? isRTL ? 'مرئي + رأي (Tier 2)' : 'Video + Written (Tier 2)'
                        : isRTL ? 'رأي مكتوب (Tier 1)' : 'Written Only (Tier 1)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isRTL ? 'المبلغ الأساسي' : 'Base SAR'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {(caseItem.pricing?.baseSar || (caseItem.consultationType === 'video' ? 130.43 : 65.22)).toFixed(2)} SAR
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isRTL ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {(caseItem.pricing?.vatSar || (caseItem.consultationType === 'video' ? 19.57 : 9.78)).toFixed(2)} SAR
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isRTL ? 'الإجمالي المسدد' : 'Total Paid'}</span>
                    <span className="font-black text-emerald-600 text-sm">
                      {(caseItem.pricing?.totalSar || (caseItem.consultationType === 'video' ? 150 : 75)).toFixed(2)} SAR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            ALO DOCTOR v2.4 Saudi Edition • Certified Clinical Governance
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

      {/* Embedded Bilingual Report Modal for PDF 1 & PDF 2 */}
      <BilingualReportModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        activeCase={caseItem}
        lang={lang}
        reportType={reportType}
      />
    </div>
  );
};

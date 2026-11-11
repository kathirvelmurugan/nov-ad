import React, { useState } from 'react';
import { ClinicalCase } from '../../../types';
import { BilingualReportModal } from '../../cockpit/BilingualReportModal';
import { Check, Eye, Globe2, HelpCircle, MessageSquareWarning, ShieldCheck, CalendarClock, Send } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang: 'ar' | 'en';
}

export const DoctorOpinionEndorsementPanel: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [localDirectives, setLocalDirectives] = useState<string>(
    activeCase.saudiEndorsement?.localClinicalNotes || ''
  );
  const [showRevisionBox, setShowRevisionBox] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);

  const isEndorsed = activeCase.saudiEndorsement?.status === 'endorsed';
  const isRevisionRequested = activeCase.saudiEndorsement?.status === 'revision_requested';

  const consultantAnswers =
    (activeCase.consultantAnswers && activeCase.consultantAnswers.length > 0
      ? activeCase.consultantAnswers
      : (activeCase.metadata?.consultantAnswers as string[] | undefined) ||
        (activeCase.metadata?.focusAnswers as string[] | undefined)) || [];

  const baseAr = activeCase.treatingDoctor?.focusQuestions || ['', '', ''];
  const focusQuestions = isAr
    ? baseAr
    : activeCase.treatingDoctor?.focusQuestionsEn || baseAr;

  const opinionSummary =
    activeCase.consultantOpinion ||
    activeCase.consultant?.opinionEnglish ||
    '';

  const handleApproveToCoordinator = () => {
    onUpdateCase({
      reportReleased: false,
      doctorReleasedToPatient: false,
      saudiEndorsement: {
        status: 'endorsed',
        doctorName: activeCase.treatingDoctor?.name || 'د. عبدالله الشمري',
        scfhsLicense: 'SCFHS-2024-KSA-8821',
        endorsementDate: new Date().toISOString(),
        localClinicalNotes: localDirectives.trim() || undefined,
        requiresLocalLab: !!activeCase.internalOrders?.lab?.ordered,
        prescriptionIssued: !!activeCase.internalOrders?.pharmacy?.ordered,
        releasedToPatient: false,
      },
      metadata: {
        ...(activeCase.metadata || {}),
        saudiDoctorApprovedOpinion: true,
        saudiApprovedAt: new Date().toISOString(),
        pdf1Released: false,
      },
    });
    onAdvanceStage();
  };

  const handleRequestRevision = () => {
    const query = revisionText.trim() || (isAr ? 'يرجى مراجعة التوصية السريرية وتوضيح الجرعات.' : 'Please clarify clinical recommendations and dosing details.');
    onUpdateCase({
      saudiEndorsement: {
        status: 'revision_requested',
        doctorName: activeCase.treatingDoctor?.name || 'د. عبدالله الشمري',
        scfhsLicense: 'SCFHS-2024-KSA-8821',
        revisionQuery: query,
        requiresLocalLab: false,
        prescriptionIssued: false,
        releasedToPatient: false,
      },
    });
    setShowRevisionBox(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner: Indian Consultant Opinion Ready for Saudi Doctor Review */}
      <div className="card-clinical p-6 border-l-4 border-l-emerald-600 bg-gradient-to-r from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-mono text-[11px] px-2.5 py-1 rounded-md font-extrabold border border-emerald-300 dark:border-emerald-700">
              D11–D12 · {isAr ? 'مراجعة رأي الاستشاري الدولي والاعتماد' : 'Consultant Opinion Review & Endorsement'}
            </span>
            {isEndorsed && (
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                ✓ {isAr ? 'تم الاعتماد والإرسال للمنسق' : 'Approved & Sent to Coordinator'}
              </span>
            )}
            {isRevisionRequested && (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-300">
                🔄 {isAr ? 'بانتظار مراجعة الاستشاري' : 'Revision Requested'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsReportPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-alo-teal bg-white dark:bg-slate-900 hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-300 dark:border-teal-700 shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isAr ? 'معاينة مسودة التقرير (PDF)' : 'Preview Draft Report (PDF)'}</span>
          </button>
        </div>

        {/* Indian Specialist Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 font-bold block mb-1 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-alo-teal" />
              {isAr ? 'الاستشاري الدولي (الهند):' : 'International Consultant (India):'}
            </span>
            <strong className="text-sm text-alo-navy dark:text-white">
              {activeCase.consultant?.name || 'Dr. Arjun Mehta'}
            </strong>
            <div className="text-slate-500 mt-0.5">
              {activeCase.consultant?.center || 'KIMS Heart Institute'} · {activeCase.consultant?.city || 'India'}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 font-bold block mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-alo-teal" />
              {isAr ? 'ملف المريض والاختصاص:' : 'Patient & Specialty:'}
            </span>
            <strong className="text-sm text-alo-navy dark:text-white">
              {isAr ? (activeCase.patientNameAr || activeCase.patientName) : (activeCase.patientNameEn || activeCase.patientName)}
            </strong>
            <div className="text-slate-500 mt-0.5">
              {activeCase.caseNumber} · {isAr ? (activeCase.specialtyAr || activeCase.specialty) : (activeCase.specialtyEn || activeCase.specialty)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 font-bold block mb-1 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-alo-teal" />
              {isAr ? 'نمط الاستشارة والموعد المقترح:' : 'Consultation Type & Slot:'}
            </span>
            <strong className="text-sm text-alo-teal">
              {activeCase.consultationType === 'written'
                ? (isAr ? 'رأي طبي مكتوب فقط' : 'Written Second Opinion')
                : (isAr ? 'استشارة مرئية + رأي مكتوب' : 'Video + Written Opinion')}
            </strong>
            <div className="text-slate-500 mt-0.5">
              {activeCase.proposedCallSlot || activeCase.consultant?.proposedSlot || (activeCase.consultationType === 'written' ? (isAr ? 'لا يتطلب مكالمة' : 'No video call needed') : (isAr ? 'بانتظار جدولة المكالمة' : 'Slot proposed'))}
            </div>
          </div>
        </div>
      </div>

      {/* Indian Consultant Written Opinion */}
      <div className="card-clinical p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
            {isAr ? 'التقييم السريري والرأي الطبي الثاني من الاستشاري الدولي:' : 'Indian Consultant Clinical Assessment & Second Opinion:'}
          </h3>
          <span className="text-[10px] font-mono font-bold bg-teal-50 text-alo-teal px-2 py-0.5 rounded border border-teal-200">
            English Source Verdict
          </span>
        </div>

        <div
          dir="ltr"
          className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium text-left"
        >
          {opinionSummary || (isAr ? 'لم يتم إدخال نص الرأي الطبي بعد.' : 'No written opinion text provided yet.')}
        </div>
      </div>

      {/* 3 Focus Questions & Indian Consultant Answers */}
      <div className="card-clinical p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <HelpCircle className="w-4 h-4 text-alo-teal" />
          <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
            {isAr ? 'إجابات الاستشاري الدولي على أسئلتك السريرية الثلاثة:' : 'Indian Consultant Answers to Your 3 Focus Questions:'}
          </h3>
        </div>

        <div className="space-y-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="text-xs font-extrabold text-alo-teal">
                Q{idx + 1}: {focusQuestions[idx] || (isAr ? `السؤال السريري ${idx + 1}` : `Focus Question ${idx + 1}`)}
              </div>
              <div
                dir="ltr"
                className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 leading-relaxed text-left font-medium"
              >
                {consultantAnswers[idx]?.trim() || (isAr ? 'لا توجد إجابة مسجلة لهذا السؤال.' : 'No specific answer recorded for this question.')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saudi Doctor Endorsement Directives & Approval to Coordinator */}
      <div className="card-clinical p-6 space-y-4 border-t-4 border-t-alo-teal">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
            {isAr ? 'توجيهات ومصادقة الطبيب السعودي المعالج (SCFHS):' : 'Saudi Treating Doctor Endorsement & Clinical Directives:'}
          </h3>
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
            SCFHS-2024-KSA-8821 ✓
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
            {isAr ? 'ملاحظات أو توجيهات محلية إضافية للمنسق والمريض (اختياري):' : 'Local Clinical Directives / Notes for Coordinator & Patient (Optional):'}
          </label>
          <textarea
            rows={3}
            value={localDirectives}
            onChange={(e) => setLocalDirectives(e.target.value)}
            placeholder={
              isAr
                ? 'أدخل أي تعليمات محلية تخص المتابعة، التحاليل، أو صرف الأدوية قبل إرسال التقرير للمنسق...'
                : 'Enter local follow-up instructions, medication notes, or hospital scheduling directives before sending to Coordinator...'
            }
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none shadow-sm font-medium"
          />
        </div>

        {showRevisionBox && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2.5">
            <label className="block text-xs font-bold text-rose-800 dark:text-rose-200">
              {isAr ? 'سبب طلب المراجعة السريرية من الاستشاري الدولي:' : 'Revision Request Note for Indian Consultant:'}
            </label>
            <textarea
              rows={2}
              value={revisionText}
              onChange={(e) => setRevisionText(e.target.value)}
              placeholder={isAr ? 'وضح التعديلات أو الاستفسارات المطلوبة...' : 'Specify what needs clarification or clinical revision...'}
              className="w-full bg-white dark:bg-slate-900 border border-rose-300 rounded-lg p-2.5 text-xs outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowRevisionBox(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-600 border border-slate-300 cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleRequestRevision}
                className="px-4 py-1.5 rounded-lg text-xs font-extrabold bg-rose-600 text-white cursor-pointer"
              >
                {isAr ? 'إرسال طلب المراجعة' : 'Submit Revision Request'}
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          {!isEndorsed && (
            <button
              type="button"
              onClick={() => setShowRevisionBox((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
            >
              <MessageSquareWarning className="w-4 h-4" />
              <span>{isAr ? 'طلب تعديل من الاستشاري' : 'Request Revision'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleApproveToCoordinator}
            className="ms-auto w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-alo-teal hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            {isEndorsed ? <Send className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>
              {isAr
                ? 'D12 · اعتماد رأي الاستشاري وإرساله لمنسق ألو (C08) لإصدار التقرير للمريض'
                : 'D12 · Approve Consultant Opinion & Send to ALO Coordinator (C08)'}
            </span>
            <span>{isAr ? '←' : '→'}</span>
          </button>
        </div>
      </div>

      <BilingualReportModal
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
        activeCase={activeCase}
        lang={lang}
      />
    </div>
  );
};


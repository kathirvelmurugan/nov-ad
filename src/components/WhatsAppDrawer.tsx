import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, ExternalLink, CheckCheck, ShieldCheck, Clock } from 'lucide-react';
import { ClinicalCase } from '../types';

interface Props {
  activeCase: ClinicalCase;
  externalOpen?: boolean;
  onSetExternalOpen?: (open: boolean) => void;
  /** Hide the demo simulator's own floating button (the patient home has its own FAB). */
  hideFloatingToggle?: boolean;
}

interface WhatsAppMessage {
  code: string;
  title: string;
  body: string;
  button: string;
  time: string;
  isLatest?: boolean;
}

export const WhatsAppDrawer: React.FC<Props> = ({
  activeCase,
  externalOpen,
  onSetExternalOpen,
  hideFloatingToggle = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = onSetExternalOpen || setInternalOpen;
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Derive chronological thread of dispatched Meta WhatsApp templates
  const getDispatchedMessages = (): WhatsAppMessage[] => {
    const list: WhatsAppMessage[] = [];

    // Stage 1 (W01) - Sent once patient submits intake
    const intakeSubmitted =
      (activeCase.stage && activeCase.stage >= 2) ||
      activeCase.currentStage !== 'INTAKE_RECEIVED' ||
      (activeCase.patientName && !activeCase.metadata?.isFreshTest);

    if (intakeSubmitted) {
      list.push({
        code: 'W01',
        title: 'تأكيد استلام الطلب السريري (Intake Confirmed)',
        body: `مرحباً بك في ألو دكتور. تم استلام طلب الرأي الطبي الثاني بنجاح لحالة ${activeCase.caseNumber}، وبدأت ممرضة الفرز تدقيق المستندات الطبية وفحص الأشعة.`,
        button: 'تتبع مسار الحالة السريرية (Track Dossier)',
        time: '09:15 AM',
      });
    }

    // Stage 2 (W04) - Nurse Triage & Dual-Token De-identification
    const triageDone =
      activeCase.triageComplete ||
      activeCase.dualTokenGenerated ||
      (activeCase.stage && activeCase.stage >= 3) ||
      ['DOCTOR_REVIEW', 'AWAITING_PAYMENT', 'WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(activeCase.currentStage);

    if (triageDone) {
      list.push({
        code: 'W04',
        title: 'اكتمال تدقيق الفحوصات وحجب الهوية (De-identification Complete)',
        body: `أهلاً بك. أتمت ممرضة ألو دكتور تدقيق الفحوصات ومطابقتها للمعايير السريرية، مع تطبيق نظام حجب الهوية المزدوج (Dual-Token) بموجب نظام حماية البيانات الشخصية السعودي (SDAIA Art. 29). أحيل الملف للطبيب السعودي المعالج.`,
        button: 'عرض بطاقة التدقيق السريري وحجب الهوية',
        time: '09:42 AM',
      });
    }

    // Stage 3 (W05) - Doctor Review & Focus Questions
    const doctorApproved =
      activeCase.referralApproved ||
      (activeCase.focusQuestions && activeCase.focusQuestions.filter(Boolean).length > 0) ||
      (activeCase.stage && activeCase.stage >= 4) ||
      ['AWAITING_PAYMENT', 'WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(activeCase.currentStage);

    if (doctorApproved) {
      list.push({
        code: 'W05',
        title: 'موافقة الطبيب المعالج وصياغة الأسئلة (Doctor Approved)',
        body: `اعتمد ${activeCase.treatingDoctor?.name || 'د. عبدالله الشمري'} في ${activeCase.treatingDoctor?.hospital || 'مستشفى رعاية الرياض'} إحالة حالتك للاستشاري الدولي وصاغ الأسئلة السريرية التخصصية. الفاتورة الضريبية جاهزة للسداد.`,
        button: 'عرض الأسئلة السريرية الموجهة للاستشاري',
        time: '10:20 AM',
      });
    }

    // Stage 4 (W06) - Invoice & Payment Link / Egress Activation
    const isPaid =
      !!activeCase.pricing?.paid ||
      activeCase.paymentDetails?.status === 'completed' ||
      !!activeCase.paymentVerified ||
      ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(activeCase.currentStage);

    if (doctorApproved) {
      list.push({
        code: 'W06',
        title: isPaid ? 'تأكيد السداد وتفعيل الإرسال السيادي (Payment & Egress)' : 'رابط سداد باقة الرأي الطبي الثاني (Invoice Ready)',
        body: isPaid
          ? `تم استلام سداد باقة الرأي الطبي الثاني (${activeCase.pricing?.totalSar || 250} ر.س شامل 15% ضريبة). تم تفعيل الرمز السيادي المشفّر (${activeCase.egressToken || 'ALO-KSA-9482'}) وتوجيه الملف للاستشاري الدولي.`
          : `أصدرت إدارة الرعاية فاتورة الباقة (${activeCase.pricing?.totalSar || 250} ر.س شامل ضريبة القيمة المضافة 15%). يُرجى السداد عبر مدى أو أبل باي لمتابعة الإرسال الدولي.`,
        button: isPaid ? 'تحميل الفاتورة الضريبية المعتمدة (ZATCA)' : 'ادفع بأمان عبر Tap Payments (Mada / Apple Pay)',
        time: '11:05 AM',
      });
    }

    // Stage 5 (W08) - Indian Consultant Reviewing 3D Scans
    const withConsultant =
      isPaid &&
      ((activeCase.stage && activeCase.stage >= 5) ||
        ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(activeCase.currentStage));

    if (withConsultant) {
      list.push({
        code: 'W08',
        title: 'بدء دراسة الملف من الاستشاري الدولي (Consultant Reviewing)',
        body: `تم تعيين ${activeCase.consultant?.name || 'د. براديب كومار'} في ${activeCase.consultant?.center || 'مركز كيمز هيلث'} لدراسة ملفك وفحص صور الأشعة المقطعية ثلاثية الأبعاد (3D DICOM). الاستشارة قيد الإنجاز (SLA 48h).`,
        button: 'متابعة عداد وقت الإنجاز (Consultant SLA)',
        time: '11:45 AM',
      });
    }

    // Stage 6 - Opinion Lifecycle (Sequential: W12 -> W13 -> W14)
    if (activeCase.secondOpinionSubmitted || ['OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(activeCase.currentStage)) {
      list.push({
        code: 'W12',
        title: 'استلام الرأي من الهند وجاري التعريب (In Localization)',
        body: `تم استلام مسودة الرأي الطبي الإنجليزي من الهند بنجاح لحالة ${activeCase.caseNumber}. يقوم منسق رعاية ألو حالياً بإعداد النسخة المعربة وتدقيق المصطلحات الطبية وإحالتها لطبيبك المعالج.`,
        button: 'متابعة مسار التعريب والتدقيق',
        time: '02:15 PM',
      });
    }

    if (activeCase.coordinatorForwardedToDoctor || ['PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'].includes(activeCase.currentStage)) {
      list.push({
        code: 'W13',
        title: 'إحالة الملف المعرب للطبيب المعالج (Treating MD Sign-Off)',
        body: `وصل التقرير الطبي ثنائي اللغة إلى طبيبك السعودي المعالج (${activeCase.treatingDoctor?.name || 'د. عبدالله الشمري'}) للمصادقة السريرية النهائية قبل إتاحته لك.`,
        button: 'بانتظار المصادقة السريرية للطبيب المعالج',
        time: '03:10 PM',
      });
    }

    if (activeCase.doctorReleasedToPatient || activeCase.reportReleased || ['CLOSED'].includes(activeCase.currentStage)) {
      list.push({
        code: 'W14',
        title: 'صدور التقرير الطبي الثاني المعتمد (Bilingual Report Released)',
        body: `اعتمد ${activeCase.treatingDoctor?.name || 'د. عبدالله الشمري'} الرأي الطبي الثاني لحالة ${activeCase.caseNumber}. التقرير الطبي ثنائي اللغة متاح الآن للتحميل بختم المستشفى المعتمد.`,
        button: 'تحميل التقرير الطبي المعتمد (Download PDF)',
        time: '03:45 PM',
      });
    }

    // Mark the last message as isLatest
    if (list.length > 0) {
      list[list.length - 1].isLatest = true;
    }

    return list;
  };

  const messages = getDispatchedMessages();

  // Scroll to bottom whenever drawer opens or messages change
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  return (
    <>
      {/* Floating Toggle Button */}
      {!hideFloatingToggle && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-5 left-5 z-40 bg-[#25D366] hover:bg-emerald-500 text-white p-3 rounded-full shadow-2xl flex items-center gap-2 border-2 border-emerald-400/40 transition-all hover:scale-105"
          title="محاكي إشعارات واتساب الرسمية (Meta WhatsApp Drawer)"
        >
          <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
          <span className="text-xs font-bold hidden sm:inline">
            WhatsApp ({messages.length > 0 ? messages[messages.length - 1].code : 'Meta'})
          </span>
        </button>
      )}

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-88 sm:w-[420px] bg-slate-900/98 backdrop-blur-xl border-r border-slate-700 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-left duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center font-bold text-white shadow-md shrink-0">
                <MessageCircle className="w-6 h-6 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-extrabold text-white">ALO DOCTOR | ألو دكتور</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-mono">+966 50 123 4567</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    متصل الآن (Online)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meta Policy Sub-header */}
          <div className="bg-emerald-950/60 border-b border-emerald-900/50 px-4 py-2 text-[11px] text-emerald-300 flex items-center justify-between">
            <span className="font-semibold">قوالب Meta الرسمية المعتمدة (Cloud API)</span>
            <span className="font-mono text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-200 font-bold">
              {messages.length} إشعارات مرسلة
            </span>
          </div>

          {/* WhatsApp Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/70">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Clock className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-xs font-semibold text-slate-300 mb-1">بانتظار إرسال الملف الطبي</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
                  اضغط على زر "تأكيد وإرسال الملف الطبي (P14)" في شاشة المريض للبدء في تسلسل إشعارات واتساب الرسمية الموثقة.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={`${msg.code}-${idx}`}
                  className={`rounded-2xl rounded-tr-none p-3.5 shadow-lg relative text-right transition-all duration-300 ${
                    msg.isLatest
                      ? 'bg-emerald-950/90 border-2 border-emerald-500 shadow-emerald-950/50'
                      : 'bg-slate-800/80 border border-slate-700/80 opacity-90'
                  }`}
                >
                  {/* Top Bar inside Message Bubble */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-emerald-800/40">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-300">{msg.title}</span>
                      {msg.isLatest && (
                        <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">
                          الآن (Just Sent)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      {msg.code}
                    </span>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs text-slate-100 leading-relaxed">{msg.body}</p>

                  {/* Interactive Quick-Action Button */}
                  <div className="mt-3 pt-2 border-t border-emerald-800/50">
                    <button
                      onClick={() => alert(`تم تفعيل الرابط الذكي: ${msg.button}`)}
                      className="w-full bg-[#25D366] hover:bg-emerald-500 text-slate-950 font-black py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <span>{msg.button}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Timestamp and Double Checkmarks */}
                  <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-emerald-400/90">
                    <span className="font-mono">{msg.time}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
                  </div>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Footer Info */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 text-center">
            قوالب Meta الرسمية تشتمل فقط على روابط سريعة مشفّرة بدون إدراج السجلات الطبية داخل المحادثة التزاماً بنظام سدايا.
          </div>
        </div>
      )}
    </>
  );
};

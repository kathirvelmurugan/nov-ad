import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Activity, 
  X,
  Stethoscope,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { ClinicalStage, Persona } from '../types';

interface StageHandoffInfo {
  completedTitleAr: string;
  completedTitleEn: string;
  completedSummaryAr: string;
  completedSummaryEn: string;
  nextTitleAr: string;
  nextTitleEn: string;
  nextObjectiveAr: string;
  nextObjectiveEn: string;
}

const HANDOFF_MAP: Record<string, StageHandoffInfo> = {
  'INTAKE_RECEIVED->NURSE_CHECK': {
    completedTitleAr: 'المرحلة 1: تسجيل الحالة والأعراض (Intake P01-P14)',
    completedTitleEn: 'Stage 1: Patient Intake & Diagnostics (P01-P14)',
    completedSummaryAr: 'تم تسجيل الشكوى الرئيسية، التحقق من الهوية الوطنية، ورفع التقارير الطبية وفحوصات الأشعة السابقة.',
    completedSummaryEn: 'Chief complaint registered, Saudi National ID verified, and diagnostic lab reports/imaging uploaded.',
    nextTitleAr: 'المرحلة 2: فرز التمريض وحجب الهوية (Nurse Triage N01-N07)',
    nextTitleEn: 'Stage 2: Nurse Triage & De-Identification (N01-N07)',
    nextObjectiveAr: 'مراجعة العلامات الحيوية، تحديد مستوى الأولوية (24h SLA)، وتطبيق الحجب الآلي للبيانات الشخصية لحماية الخصوصية.',
    nextObjectiveEn: 'Review vital signs, assign triage priority (24h SLA), and apply automated de-identification masking patient PII.'
  },
  'NURSE_CHECK->DOCTOR_REVIEW': {
    completedTitleAr: 'المرحلة 2: فرز التمريض وحجب الهوية (Nurse Triage N01-N07)',
    completedTitleEn: 'Stage 2: Nurse Triage & De-Identification (N01-N07)',
    completedSummaryAr: 'اكتمل الفرز السريري، وتم حجب الاسم ورقم الهوية آلياً، وتأكيد جاهزية مقاطع الأشعة DICOM.',
    completedSummaryEn: 'Clinical triage completed, patient PII masked, and DICOM imaging readiness verified.',
    nextTitleAr: 'المرحلة 3: مراجعة الطبيب السعودي المعالج (Doctor Review D01-D10)',
    nextTitleEn: 'Stage 3: Saudi Treating Doctor Review (D01-D10)',
    nextObjectiveAr: 'مراجعة التاريخ المرضي وتحديد سؤالين سريريين دقيقين للاستشاري الدولي واعتماد ملف الإحالة.',
    nextObjectiveEn: 'Review clinical history, formulate 2 focused questions for the international specialist, and sign off referral pack.'
  },
  'DOCTOR_REVIEW->AWAITING_PAYMENT': {
    completedTitleAr: 'المرحلة 3: مراجعة الطبيب السعودي (Doctor Review D01-D10)',
    completedTitleEn: 'Stage 3: Saudi Treating Doctor Review (D01-D10)',
    completedSummaryAr: 'اعتمد الطبيب المعالج ملف الإحالة وصاغ الأسئلة السريرية التخصصية للاستشاري الهندي.',
    completedSummaryEn: 'Treating physician approved referral pack and formulated targeted questions for specialist review.',
    nextTitleAr: 'المرحلة 4: سداد الرسوم والفاتورة الإلكترونية (Tap Payment P19-P21)',
    nextTitleEn: 'Stage 4: Tap Payment Checkout & ZATCA Invoice (P19-P21)',
    nextObjectiveAr: 'سداد رسوم الاستشارة عبر بوابة Tap (مدى، فيزا، أبل باي) وإصدار الفاتورة الضريبية ZATCA Phase-2 QR.',
    nextObjectiveEn: 'Complete consultation checkout via Tap Payments (Mada, Visa, Apple Pay) and generate compliant ZATCA Phase-2 invoice.'
  },
  'AWAITING_PAYMENT->WITH_CONSULTANT': {
    completedTitleAr: 'المرحلة 4: سداد الرسوم والفاتورة (Tap Payment P19-P21)',
    completedTitleEn: 'Stage 4: Tap Payment & ZATCA Invoice (P19-P21)',
    completedSummaryAr: 'تم تأكيد عملية الدفع بنجاح وإصدار إيصال السداد الضريبي المعتمد.',
    completedSummaryEn: 'Payment confirmed successfully via Tap Payments and official ZATCA tax receipt generated.',
    nextTitleAr: 'المرحلة 5: مراجعة الاستشاري الدولي (Consultant Review K01-K07)',
    nextTitleEn: 'Stage 5: Indian Specialist Review (K01-K07)',
    nextObjectiveAr: 'فحص الأشعة عبر عارض DICOM ثلاثي الأبعاد، تسجيل ملخص صوتي 90 ثانية، والإجابة عن أسئلة الطبيب المعالج.',
    nextObjectiveEn: 'Inspect scans in 3D multi-slice DICOM viewer, synthesize 90-sec audio briefing, and answer clinical questions.'
  },
  'WITH_CONSULTANT->OPINION_READY': {
    completedTitleAr: 'المرحلة 5: مراجعة الاستشاري الدولي (Consultant Review K01-K07)',
    completedTitleEn: 'Stage 5: Indian Specialist Review (K01-K07)',
    completedSummaryAr: 'أنجز الاستشاري الدولي فحص الأشعة وسجل الملخص الصوتي واعتمد الرأي الطبي الثاني.',
    completedSummaryEn: 'International specialist completed scan review, voice briefing synthesis, and drafted clinical opinion.',
    nextTitleAr: 'المرحلة 6: الاستشارة المرئية والتقرير المختوم (Telehealth & Opinion K08/P25)',
    nextTitleEn: 'Stage 6: Telehealth Video & Stamped Report (K08/P25)',
    nextObjectiveAr: 'عقد جلسة اتصال مرئي WebRTC مشفرة بين المريض والاستشاريين وتحميل التقرير الطبي المعتمد ثنائي اللغة.',
    nextObjectiveEn: 'Hold encrypted WebRTC video consultation with bilingual translation and download signed medical report PDF.'
  },
  'OPINION_READY->PARTNER_SERVICES': {
    completedTitleAr: 'المرحلة 6: الاستشارة المرئية والتقرير المختوم (Telehealth & Opinion K08/P25)',
    completedTitleEn: 'Stage 6: Telehealth Video & Stamped Report (K08/P25)',
    completedSummaryAr: 'اكتملت الاستشارة المرئية وتم تسليم التقرير الطبي الثاني المعتمد باللغتين العربية والإنجليزية.',
    completedSummaryEn: 'Telehealth video consultation concluded and bilingual stamped second-opinion PDF delivered to patient.',
    nextTitleAr: 'المرحلة 7: خدمات الرعاية السعودية الشريكة (Saudi Partner Care L01, H01, T01)',
    nextTitleEn: 'Stage 7: Saudi Partner Care Orders (L01, H01, T01, V01)',
    nextObjectiveAr: 'تنسيق الخدمات الميدانية الموصى بها: سحب عينات منزلي (مختبرات ألفا)، تمريض منزلي (سند)، وتأشيرات وسفر (الفرسان).',
    nextObjectiveEn: 'Coordinate recommended fulfillment: at-home blood draw (Alpha Labs), home nursing (Sanad), and medical travel (Al-Fursan).'
  },
  'PARTNER_SERVICES->FOLLOW_UP_21_DAYS': {
    completedTitleAr: 'المرحلة 7: خدمات الرعاية السعودية الشريكة (Partner Care)',
    completedTitleEn: 'Stage 7: Saudi Partner Care Orders (L01, H01, T01)',
    completedSummaryAr: 'تم تفعيل أوامر التحاليل المخبرية والرعاية المنزلية وجدولة المواعيد مع الشركاء المعتمدين.',
    completedSummaryEn: 'Partner care orders dispatched for lab collection, home nursing visits, and medical logistics.',
    nextTitleAr: 'المرحلة 8: المتابعة غير المتزامنة 14 يوماً (14-Day Follow-Up P27-P28)',
    nextTitleEn: 'Stage 8: 14-Day Asynchronous Follow-Up Chat (P27-P28)',
    nextObjectiveAr: 'فتح قناة محادثة سريرية آمنة لمدة 14 يوماً بين المريض والطبيب المعالج للإجابة عن الاستفسارات اللاحقة.',
    nextObjectiveEn: 'Open secure 14-day asynchronous clinical messaging window between patient and physician for ongoing inquiries.'
  },
  'FOLLOW_UP_21_DAYS->CLOSED': {
    completedTitleAr: 'المرحلة 8: المتابعة غير المتزامنة (14-Day Follow-Up P27-P28)',
    completedTitleEn: 'Stage 8: 14-Day Asynchronous Follow-Up Chat (P27-P28)',
    completedSummaryAr: 'انتهت فترة المتابعة السريرية واستقرت الخطة العلاجية وتمت الإجابة عن كافة الاستفسارات.',
    completedSummaryEn: 'Clinical follow-up period completed, inquiries answered, and long-term care plan finalized.',
    nextTitleAr: 'المرحلة 9: إغلاق الملف وتقييم الخدمة (Case Closure & NPS P29)',
    nextTitleEn: 'Stage 9: Case Closure & Outcome NPS (P29)',
    nextObjectiveAr: 'اعتماد الإغلاق النهائي للملف الطبي، تسجيل تقييم رضا المريض (NPS)، والأرشفة وفق متطلبات هيئة الصحة.',
    nextObjectiveEn: 'Final medical case sign-off, patient Net Promoter Score (NPS) submission, and regulatory archival.'
  }
};

interface Props {
  isOpen: boolean;
  fromStage: ClinicalStage;
  toStage: ClinicalStage;
  nextPersona: Persona;
  lang: 'ar' | 'en';
  onContinue: () => void;
  onClose: () => void;
}

export const StageHandoffModal: React.FC<Props> = ({
  isOpen,
  fromStage,
  toStage,
  nextPersona,
  lang,
  onContinue,
  onClose,
}) => {
  const isAr = lang === 'ar';
  const [countdown, setCountdown] = useState<number>(6);

  // Auto-countdown timer (6 seconds, with 1-click bypass)
  useEffect(() => {
    if (!isOpen) return;
    setCountdown(6);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, fromStage, toStage]);

  if (!isOpen) return null;

  const transitionKey = `${fromStage}->${toStage}`;
  const info = HANDOFF_MAP[transitionKey] || {
    completedTitleAr: `المرحلة السابقة: ${fromStage}`,
    completedTitleEn: `Completed Stage: ${fromStage}`,
    completedSummaryAr: 'اكتملت الإجراءات السريرية للمرحلة السابقة بنجاح.',
    completedSummaryEn: 'Clinical actions for previous stage completed successfully.',
    nextTitleAr: `المرحلة التالية: ${toStage}`,
    nextTitleEn: `Next Stage: ${toStage}`,
    nextObjectiveAr: 'بدء المهام السريرية للمرحلة الجديدة.',
    nextObjectiveEn: 'Commencing clinical responsibilities for the new stage.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-alo-darkCard border border-slate-200 dark:border-alo-darkBorder rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 dark:from-teal-950/40 dark:via-slate-900 dark:to-teal-950/40 border-b border-teal-200/60 dark:border-teal-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-extrabold text-xs text-alo-teal dark:text-alo-aqua uppercase tracking-wider">
              {isAr ? '🚀 تسليم الحالة السريرية (Clinical Handoff)' : '🚀 Clinical Workflow Handoff'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Section 1: What was just accomplished */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isAr ? 'تم إنجازه بنجاح (Completed Stage):' : 'Stage Successfully Completed:'}</span>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
              {isAr ? info.completedTitleAr : info.completedTitleEn}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isAr ? info.completedSummaryAr : info.completedSummaryEn}
            </p>
          </div>

          {/* Central Handoff Conduit */}
          <div className="flex items-center justify-center gap-3 py-1">
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2 px-3 py-1 bg-alo-mint dark:bg-alo-mintDark text-alo-teal dark:text-alo-aqua text-[11px] font-bold rounded-full border border-teal-200 dark:border-teal-700">
              <span>{isAr ? 'تسليم الملف إلى' : 'Handing off to'}</span>
              <span className="text-sm">{nextPersona.avatar}</span>
              <span className="font-extrabold">{nextPersona.name}</span>
            </div>
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Section 2: What happens on the next screen */}
          <div className="bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-800 dark:text-sky-300 mb-1.5">
              <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>{isAr ? 'الهدف السريري للمرحلة القادمة (Next Objective):' : 'Upcoming Stage Objective:'}</span>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
              {isAr ? info.nextTitleAr : info.nextTitleEn}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isAr ? info.nextObjectiveAr : info.nextObjectiveEn}
            </p>
            <div className="mt-2.5 pt-2 border-t border-sky-200/50 dark:border-sky-800/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{isAr ? 'الدور المكلّف:' : 'Assigned Role:'} <strong>{nextPersona.title}</strong></span>
              <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px]">
                {nextPersona.surface}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-alo-darkCanvas border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-alo-teal animate-spin" />
            <span>
              {isAr
                ? `الانتقال التلقائي خلال ${countdown} ثوانٍ...`
                : `Auto-proceeding in ${countdown}s...`}
            </span>
          </div>

          <button
            onClick={onContinue}
            className="flex items-center gap-2 bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            <span>{isAr ? 'متابعة إلى المرحلة التالية' : 'Proceed to Next Stage'}</span>
            {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

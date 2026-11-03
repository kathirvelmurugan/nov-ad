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
    completedTitleAr: 'المرحلة 1: تسجيل الحالة والأعراض · P01–17',
    completedTitleEn: 'Intake received · P01–17',
    completedSummaryAr: 'تم تسجيل الشكوى الرئيسية، التحقق من الهوية الوطنية، ورفع التقارير الطبية وفحوصات الأشعة السابقة.',
    completedSummaryEn: 'Chief complaint registered, Saudi National ID verified, and diagnostic lab reports/imaging uploaded.',
    nextTitleAr: 'المرحلة 2: فرز التمريض وحجب الهوية · N01–07',
    nextTitleEn: 'Nurse check · N01–07',
    nextObjectiveAr: 'مراجعة العلامات الحيوية، تحديد مستوى الأولوية (24h SLA)، وتطبيق الحجب الآلي للبيانات الشخصية لحماية الخصوصية.',
    nextObjectiveEn: 'ALO nurse: check file · hide identity · nurse line.'
  },
  'NURSE_CHECK->DOCTOR_REVIEW': {
    completedTitleAr: 'المرحلة 2: فرز التمريض وحجب الهوية · N01–07',
    completedTitleEn: 'Nurse check · N01–07',
    completedSummaryAr: 'اكتمل الفرز السريري، وتم حجب الاسم ورقم الهوية آلياً، وتأكيد جاهزية مقاطع الأشعة DICOM.',
    completedSummaryEn: 'Clinical triage completed, patient PII masked, and DICOM imaging readiness verified.',
    nextTitleAr: 'المرحلة 3: مراجعة الطبيب السعودي المعالج · D02–06',
    nextTitleEn: 'Doctor review · D02–06',
    nextObjectiveAr: 'مراجعة التاريخ المرضي وتحديد 3 أسئلة سريرية دقيقة للاستشاري الهندي واعتماد ملف الإحالة.',
    nextObjectiveEn: 'Saudi treating doctor: review patient file, then pick consultant · questions · call type (3 focus questions).'
  },
  'DOCTOR_REVIEW->AWAITING_PAYMENT': {
    completedTitleAr: 'المرحلة 3: مراجعة الطبيب السعودي · D02–06',
    completedTitleEn: 'Doctor review · D02–06',
    completedSummaryAr: 'اعتمد الطبيب المعالج ملف الإحالة وصاغ الأسئلة السريرية التخصصية للاستشاري الهندي.',
    completedSummaryEn: 'Treating physician approved referral pack and formulated targeted questions for specialist review.',
    nextTitleAr: 'المرحلة 4: سداد الرسوم والفاتورة الإلكترونية · P19–21',
    nextTitleEn: 'Awaiting payment · C01–06 · P19–21',
    nextObjectiveAr: 'سداد رسوم الاستشارة عبر بوابة Tap (مدى، فيزا، أبل باي) وإصدار الفاتورة الضريبية ZATCA Phase-2 QR.',
    nextObjectiveEn: 'ALO coordinator: confirm · price · payment link; Patient: pay · receipt.'
  },
  'AWAITING_PAYMENT->WITH_CONSULTANT': {
    completedTitleAr: 'المرحلة 4: سداد الرسوم والفاتورة · P19–21',
    completedTitleEn: 'Awaiting payment · P19–21 · C05–06',
    completedSummaryAr: 'تم تأكيد عملية الدفع بنجاح وإصدار إيصال السداد الضريبي المعتمد.',
    completedSummaryEn: 'Payment confirmed successfully via Tap Payments and official ZATCA tax receipt generated.',
    nextTitleAr: 'المرحلة 5: مراجعة الاستشاري الدولي · K01–04',
    nextTitleEn: 'With consultant · K01–04',
    nextObjectiveAr: 'فحص الأشعة عبر عارض DICOM، وإصدار رأي مكتوب · مواعيد المكالمة، والإجابة عن أسئلة الطبيب المعالج.',
    nextObjectiveEn: 'Indian consultant: accept case · 48h starts.'
  },
  'WITH_CONSULTANT->OPINION_READY': {
    completedTitleAr: 'المرحلة 5: مراجعة الاستشاري الدولي · K01–04',
    completedTitleEn: 'With consultant · K01–04',
    completedSummaryAr: 'أنجز الاستشاري الدولي فحص الأشعة وسجل الملخص الصوتي واعتمد الرأي الطبي الثاني.',
    completedSummaryEn: 'Indian consultant: written opinion · call slots; video / voice call with ALO nurse interpret on call.',
    nextTitleAr: 'المرحلة 6: الاستشارة المرئية والتقرير المختوم · C08 · P25–26',
    nextTitleEn: 'Opinion ready · C08 · P25–26',
    nextObjectiveAr: 'عقد جلسة اتصال مرئي WebRTC مشفرة بين المريض والاستشاريين وتحميل التقرير الطبي المعتمد ثنائي اللغة.',
    nextObjectiveEn: 'ALO coordinator: release report PDF 1; Patient: report · book partners.'
  },
  'OPINION_READY->PARTNER_SERVICES': {
    completedTitleAr: 'المرحلة 6: الاستشارة المرئية والتقرير المختوم · C08 · P25–26',
    completedTitleEn: 'Opinion ready · C08 · P25–26',
    completedSummaryAr: 'اكتملت الاستشارة المرئية وتم تسليم التقرير الطبي الثاني المعتمد باللغتين العربية والإنجليزية.',
    completedSummaryEn: 'Report PDF 1 released to Patient and Saudi treating doctor.',
    nextTitleAr: 'المرحلة 7: خدمات الرعاية السعودية الشريكة · L01 · T01 · H01 · V01',
    nextTitleEn: 'Partner services · L01 · T01 · H01 · V01',
    nextObjectiveAr: 'تنسيق الخدمات الميدانية الموصى بها: سحب عينات منزلي (مختبرات ألفا)، تمريض منزلي (سند)، وتأشيرات وسفر (الفرسان).',
    nextObjectiveEn: 'Orders · bookings · insurance or cash.'
  },
  'PARTNER_SERVICES->FOLLOW_UP_21_DAYS': {
    completedTitleAr: 'المرحلة 7: خدمات الرعاية السعودية الشريكة · L01–V01',
    completedTitleEn: 'Partner services · L01–V01',
    completedSummaryAr: 'تم تفعيل أوامر التحاليل المخبرية والرعاية المنزلية وجدولة المواعيد مع الشركاء المعتمدين.',
    completedSummaryEn: 'Partner orders · bookings placed.',
    nextTitleAr: 'المرحلة 8: المتابعة غير المتزامنة 21 يوماً · C09–10 · P27–29',
    nextTitleEn: 'Follow-up 21 days · C09–10 · P27–29',
    nextObjectiveAr: 'فتح قناة محادثة سريرية آمنة لمدة 21 يوماً بين المريض والطبيب المعالج للإجابة عن الاستفسارات اللاحقة.',
    nextObjectiveEn: 'ALO coordinator: relay follow-up · close case; Indian consultant: answer · final comment; Patient: follow-up · PDF 2 · rating.'
  },
  'FOLLOW_UP_21_DAYS->CLOSED': {
    completedTitleAr: 'المرحلة 8: المتابعة غير المتزامنة · C09–10 · P27–29',
    completedTitleEn: 'Follow-up 21 days · C09–10 · P27–29',
    completedSummaryAr: 'انتهت فترة المتابعة السريرية واستقرت الخطة العلاجية وتمت الإجابة عن كافة الاستفسارات.',
    completedSummaryEn: 'Follow-up relayed and answered within 21 days.',
    nextTitleAr: 'المرحلة 9: إغلاق الملف وتقييم الخدمة · P29',
    nextTitleEn: 'Closed · P29',
    nextObjectiveAr: 'اعتماد الإغلاق النهائي للملف الطبي، تسجيل تقييم رضا المريض (NPS)، والأرشفة وفق متطلبات هيئة الصحة.',
    nextObjectiveEn: 'Case closed; Patient: rating.'
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

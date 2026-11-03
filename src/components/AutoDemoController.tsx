import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Sparkles, 
  Activity, 
  Stethoscope, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { ClinicalStage, Persona } from '../types';

interface StageNarration {
  stageNum: number;
  stageNameAr: string;
  stageNameEn: string;
  roleAr: string;
  roleEn: string;
  headlineAr: string;
  headlineEn: string;
  detailAr: string;
  detailEn: string;
}

const STAGE_NARRATIONS: Record<ClinicalStage, StageNarration> = {
  INTAKE_RECEIVED: {
    stageNum: 1,
    stageNameAr: 'المرحلة 1: تسجيل الحالة والأعراض (Intake)',
    stageNameEn: 'Stage 1: Patient Intake & Diagnostics',
    roleAr: 'المريض (سالم العامري)',
    roleEn: 'Patient (Salem Al-Ameri)',
    headlineAr: 'تسجيل الشكوى الطبية ورفع تقارير الإيكو والرنين',
    headlineEn: 'Patient registers severe aortic stenosis symptoms & uploads DICOM scans',
    detailAr: 'يتم حجب الهوية الوطنية آلياً وإصدار رقم مرجعي موحد للحالة مع إشعار واتساب ترحيبي.',
    detailEn: 'National ID is masked, case reference issued, and WhatsApp welcome trigger dispatched.'
  },
  NURSE_CHECK: {
    stageNum: 2,
    stageNameAr: 'المرحلة 2: فرز التمريض والترميز (Nurse Triage)',
    stageNameEn: 'Stage 2: Nurse Triage & De-Identification',
    roleAr: 'ممرضة الفرز (سارة الدوسري)',
    roleEn: 'Triage Nurse (Sara N.)',
    headlineAr: 'تدقيق العلامات الحيوية وحجب البيانات الشخصية (De-Identification)',
    headlineEn: 'Nurse verifies vitals, establishes 24h SLA, and masks all patient PII',
    detailAr: 'حماية كاملة للخصوصية وفق معايير هيئة الصحة قبل إرسال الملف للأطباء والاستشاريين.',
    detailEn: 'Ensures 100% HIPAA/MOH compliance before the file is routed across borders.'
  },
  DOCTOR_REVIEW: {
    stageNum: 3,
    stageNameAr: 'المرحلة 3: مراجعة الطبيب السعودي (Doctor Review)',
    stageNameEn: 'Stage 3: Saudi Treating Doctor Review',
    roleAr: 'الطبيب المعالج (د. عبدالله الشمري - رعاية الرياض)',
    roleEn: 'Treating Physician (Dr. Abdullah, Riyadh Care)',
    headlineAr: 'صياغة سؤالين سريريين دقيقين للاستشاري واعتماد الإحالة',
    headlineEn: 'Physician validates dossier and frames 2 clinical questions for specialist',
    detailAr: 'الطبيب السعودي المعالج يشرف على الحالة ويحدد نوع الاستشارة (جراحة TAVR أم SAVR).',
    detailEn: 'Saudi doctor governs the care plan and determines exact focus for Indian super-specialist.'
  },
  AWAITING_PAYMENT: {
    stageNum: 4,
    stageNameAr: 'المرحلة 4: تنسيق الرعاية والسداد (ALO Coordinator & Payment)',
    stageNameEn: 'Stage 4: ALO Coordinator Pricing & ZATCA Payment',
    roleAr: 'منسق رعاية ألو (عبدالرحمن) · سداد تابي ومدى',
    roleEn: 'ALO Coordinator (Abdulrahman) · Tabby Split & Mada',
    headlineAr: 'منسق ألو يؤكد الإحالة والتسعير ويرسل رابط السداد الآمن للمريض',
    headlineEn: 'ALO Coordinator confirms specialist referral fee and dispatches ZATCA payment link',
    detailAr: 'إصدار رابط سداد معتمد ومطابق لـ ZATCA مع إمكانية التقسيط عبر تابي على 4 دفعات.',
    detailEn: 'Compliant ZATCA invoice dispatch via WhatsApp with 4-month Tabby interest-free split.'
  },
  WITH_CONSULTANT: {
    stageNum: 5,
    stageNameAr: 'المرحلة 5: مراجعة الاستشاري الدولي (Consultant Review)',
    stageNameEn: 'Stage 5: Indian Super-Specialist Review',
    roleAr: 'الاستشاري الدولي (د. أرجون ميهتا - الهند)',
    roleEn: 'International Consultant (Dr. Arjun, KIMS/Apollo)',
    headlineAr: 'فحص مقاطع الأشعة 3D وتسجيل ملخص صوتي 90 ثانية',
    headlineEn: 'Specialist inspects 3D multi-slice DICOM & records 90-sec audio briefing',
    detailAr: 'تطبيق جوال مخصص باللغة الإنجليزية للاستشاري مع عداد زمني 48 ساعة SLA للالتزام.',
    detailEn: 'Dedicated English physician mobile dashboard with active 48-hour SLA countdown.'
  },
  OPINION_READY: {
    stageNum: 6,
    stageNameAr: 'المرحلة 6: الاستشارة المرئية والتقرير المختوم (Telehealth)',
    stageNameEn: 'Stage 6: Telehealth Video & Bilingual Stamped PDF',
    roleAr: 'المريض والاستشاري (WebRTC)',
    roleEn: 'Patient & Consultant (WebRTC Telehealth)',
    headlineAr: 'مكالمة فيديو ثلاثية مشفرة وتحميل التقرير الطبي المعتمد',
    headlineEn: 'Encrypted 3-way video call & download of digitally stamped opinion PDF',
    detailAr: 'جلسة فيديو مباشرة مع ترجمة طبية فورية وتسليم وثيقة الرأي الثاني المعتمدة رسمياً.',
    detailEn: 'Live consultation with bilingual clinical translation and official PDF report delivery.'
  },
  PARTNER_SERVICES: {
    stageNum: 7,
    stageNameAr: 'المرحلة 7: شبكة الشركاء الميدانيين (Saudi Partner Care)',
    stageNameEn: 'Stage 7: Saudi Partner Care Orders (Lab, Home, Travel)',
    roleAr: 'مختبرات ألفا · سند للتمريض · الفرسان للسياحة',
    roleEn: 'Alpha Labs · Sanad Home Health · Al-Fursan',
    headlineAr: 'تنفيذ التوصيات: سحب دم منزلي، تمريض، وتأشيرة وسفر للعلاج',
    headlineEn: 'Order fulfillment: At-home blood draw, home nursing, and medical travel visas',
    detailAr: 'تنسيق ميداني كامل داخل السعودية مع إمكانية التنسيق للسفر إلى مستشفيات الهند عند الحاجة.',
    detailEn: 'Complete local post-opinion care in Riyadh/Jeddah plus international travel concierge.'
  },
  FOLLOW_UP_21_DAYS: {
    stageNum: 8,
    stageNameAr: 'المرحلة 8: المتابعة غير المتزامنة 14 يوماً (Follow-Up)',
    stageNameEn: 'Stage 8: 14-Day Asynchronous Follow-Up Chat',
    roleAr: 'المريض والطبيب المعالج (P + D)',
    roleEn: 'Patient & Treating Physician (P + D)',
    headlineAr: 'محادثة سريرية آمنة لمدة 14 يوماً للإجابة عن أي استفسارات',
    headlineEn: 'Secure 14-day clinical chat window for lab review and treatment adjustments',
    detailAr: 'تواصل مباشر ومستمر بين المريض وطبيبه في السعودية مع إشعارات واتساب فورية.',
    detailEn: 'Direct ongoing communication ensuring patient recovery with instant WhatsApp alerts.'
  },
  CLOSED: {
    stageNum: 9,
    stageNameAr: 'المرحلة 9: إغلاق الملف وتقييم الخدمة (Case Closure & NPS)',
    stageNameEn: 'Stage 9: Case Closure & Patient NPS Rating',
    roleAr: 'إدارة ألو دكتور والمستشفى (Admin)',
    roleEn: 'ALO Platform & Hospital Admin',
    headlineAr: 'اعتماد الخطة النهائية، تقييم رضا المريض (10/10)، وأرشفة السجل',
    headlineEn: 'Final treatment sign-off, patient NPS score submission, and MOH archival',
    detailAr: 'أرشفة إلكترونية مشفرة طويلة المدى وإصدار تقرير مؤشرات الأداء والكفاءة السريرية.',
    detailEn: 'Permanent regulatory compliance archival and hospital commission reconciliation.'
  }
};

const STAGE_ORDER: ClinicalStage[] = [
  'INTAKE_RECEIVED',
  'NURSE_CHECK',
  'DOCTOR_REVIEW',
  'AWAITING_PAYMENT',
  'WITH_CONSULTANT',
  'OPINION_READY',
  'PARTNER_SERVICES',
  'FOLLOW_UP_21_DAYS',
  'CLOSED'
];

interface Props {
  isActive: boolean;
  currentStage: ClinicalStage;
  activePersona: Persona;
  lang: 'ar' | 'en';
  onNextStage: () => void;
  onPrevStage: () => void;
  onSelectStage: (stage: ClinicalStage) => void;
  onStop: () => void;
  activeCaseNumber: string;
}

export const AutoDemoController: React.FC<Props> = ({
  isActive,
  currentStage,
  activePersona,
  lang,
  onNextStage,
  onPrevStage,
  onSelectStage,
  onStop,
  activeCaseNumber,
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(6);
  const isAr = lang === 'ar';

  const narration = STAGE_NARRATIONS[currentStage] || STAGE_NARRATIONS['INTAKE_RECEIVED'];

  // Pacing Timer: 6-second interval
  useEffect(() => {
    if (!isActive || isPaused) return;

    setSecondsRemaining(6);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance to next stage or loop
          const currentIndex = STAGE_ORDER.indexOf(currentStage);
          const nextIndex = (currentIndex + 1) % STAGE_ORDER.length;
          onSelectStage(STAGE_ORDER[nextIndex]);
          return 6;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, currentStage, onSelectStage]);

  if (!isActive) return null;

  const currentIdx = STAGE_ORDER.indexOf(currentStage) + 1;

  return (
    <div 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-3 animate-in slide-in-from-bottom-6 duration-300 pointer-events-auto"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-emerald-500/80 rounded-2xl shadow-2xl p-4 text-white shadow-emerald-950/40">
        {/* Top Control Ribbon */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? 'العرض التلقائي التفاعلي' : 'Auto-Demo Presentation Mode'}</span>
            </span>
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
              {currentIdx}/9
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPrevStage}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              title={isAr ? 'المرحلة السابقة' : 'Previous Stage'}
            >
              {isAr ? <SkipForward className="w-3.5 h-3.5" /> : <SkipBack className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow transition-all active:scale-95"
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isAr ? 'استئناف' : 'Resume'}</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>{isAr ? 'إيقاف مؤقت' : 'Pause'}</span>
                </>
              )}
            </button>

            <button
              onClick={onNextStage}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              title={isAr ? 'المرحلة التالية' : 'Next Stage'}
            >
              {isAr ? <SkipBack className="w-3.5 h-3.5" /> : <SkipForward className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onStop}
              className="flex items-center gap-1 px-2 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold transition-colors"
              title={isAr ? 'إنهاء الجولة' : 'Exit Auto-Demo'}
            >
              <Square className="w-3 h-3 fill-rose-300" />
              <span>{isAr ? 'إنهاء' : 'Exit'}</span>
            </button>
          </div>
        </div>

        {/* Live Narration Body */}
        <div className="pt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <span>{activePersona.avatar}</span>
              <span>{isAr ? narration.roleAr : narration.roleEn}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-bold">{isAr ? narration.stageNameAr : narration.stageNameEn}</span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{isPaused ? (isAr ? 'موقوف' : 'Paused') : `${secondsRemaining}s`}</span>
            </div>
          </div>

          <h3 className="font-black text-sm text-white">
            {isAr ? narration.headlineAr : narration.headlineEn}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isAr ? narration.detailAr : narration.detailEn}
          </p>
        </div>
      </div>
    </div>
  );
};

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
    stageNameAr: 'المرحلة 1: استلام الحالة · P01–17',
    stageNameEn: 'Intake received · P01–17',
    roleAr: 'المريض المستفيد',
    roleEn: 'Beneficiary Patient',
    headlineAr: 'تسجيل الشكوى الطبية ورفع تقارير الإيكو والرنين',
    headlineEn: 'Patient registers severe aortic stenosis symptoms & uploads DICOM scans',
    detailAr: 'يتم حجب الهوية الوطنية آلياً وإصدار رقم مرجعي موحد للحالة مع إشعار واتساب ترحيبي.',
    detailEn: 'National ID is masked, case reference issued, and WhatsApp welcome trigger dispatched.'
  },
  NURSE_CHECK: {
    stageNum: 2,
    stageNameAr: 'المرحلة 2: فحص التمريض · N01–07',
    stageNameEn: 'Nurse check · N01–07',
    roleAr: 'ممرضة ألو',
    roleEn: 'ALO Nurse',
    headlineAr: 'تدقيق العلامات الحيوية وحجب البيانات الشخصية (De-Identification)',
    headlineEn: 'ALO nurse: check file · hide identity · nurse line',
    detailAr: 'حماية كاملة للخصوصية وفق معايير هيئة الصحة قبل إرسال الملف للأطباء والاستشاريين.',
    detailEn: 'Ensures 100% HIPAA/MOH compliance before the file is routed across borders.'
  },
  DOCTOR_REVIEW: {
    stageNum: 3,
    stageNameAr: 'المرحلة 3: مراجعة الطبيب · D02–06',
    stageNameEn: 'Doctor review · D02–06',
    roleAr: 'الطبيب السعودي المعالج',
    roleEn: 'Saudi Treating Doctor',
    headlineAr: 'صياغة 3 أسئلة سريرية دقيقة للاستشاري الهندي واعتماد الإحالة',
    headlineEn: 'Saudi treating doctor: review patient file, then pick consultant · questions · call type (3 focus questions)',
    detailAr: 'الطبيب السعودي المعالج يشرف على الحالة ويحدد نوع الاستشارة (جراحة TAVR أم SAVR).',
    detailEn: 'Saudi treating doctor confirms the Indian consultant.'
  },
  AWAITING_PAYMENT: {
    stageNum: 4,
    stageNameAr: 'المرحلة 4: بانتظار السداد · P19–21',
    stageNameEn: 'Awaiting payment · C01–06 · P19–21',
    roleAr: 'منسق رعاية ألو · سداد تابي ومدى',
    roleEn: 'ALO Coordinator · Patient',
    headlineAr: 'منسق ألو يؤكد الإحالة والتسعير ويرسل رابط السداد الآمن للمريض',
    headlineEn: 'ALO coordinator: confirm · price · payment link; Patient: pay · receipt',
    detailAr: 'إصدار رابط سداد معتمد ومطابق لـ ZATCA مع إمكانية التقسيط عبر تابي على 4 دفعات.',
    detailEn: 'Compliant ZATCA invoice dispatch via WhatsApp with 4-month Tabby interest-free split.'
  },
  WITH_CONSULTANT: {
    stageNum: 5,
    stageNameAr: 'المرحلة 5: لدى الاستشاري · K01–04',
    stageNameEn: 'With consultant · K01–04',
    roleAr: 'الاستشاري الدولي (الهند)',
    roleEn: 'Indian Consultant',
    headlineAr: 'فحص مقاطع الأشعة 3D، اختيار الموعد، وتسجيل الرأي الطبي المعتمد',
    headlineEn: 'Indian consultant: written opinion · call slots',
    detailAr: 'لوحة تحكم طبية مخصصة للاستشاري باللغة الإنجليزية مع عداد زمني 48 ساعة SLA للالتزام.',
    detailEn: 'Dedicated English physician dashboard with active 48-hour SLA countdown and call slot scheduling.'
  },
  OPINION_READY: {
    stageNum: 6,
    stageNameAr: 'المرحلة 6: الرأي جاهز · C08 · P25–26',
    stageNameEn: 'Opinion ready · C08 · P25–26',
    roleAr: 'المريض والاستشاري وممرضة ألو المترجمة (WebRTC)',
    roleEn: 'Patient · Indian consultant · ALO nurse',
    headlineAr: 'مكالمة استشارية مرئية مع ترجمة طبية فورية وترجمة مكتوبة',
    headlineEn: 'Encrypted multi-disciplinary video call with live medical translation',
    detailAr: 'جلسة فيديو مباشرة مع ترجمة طبية فورية عربية-إنجليزية وترجمة نصوص مباشرة للحالة.',
    detailEn: 'Live consultation with bilingual clinical translation and real-time medical subtitle synthesis.'
  },
  PARTNER_SERVICES: {
    stageNum: 7,
    stageNameAr: 'المرحلة 7: اعتماد وإصدار التقرير الطبي بالتوازي · C08',
    stageNameEn: 'Stage 7: Dual-Parallel Report Release (PDF 1) · C08',
    roleAr: 'منسق رعاية ألو',
    roleEn: 'ALO Coordinator',
    headlineAr: 'مراجعة واعتماد مسودة الرأي وإصدار تقرير PDF 1 المعتمد بالتوازي للطبيب السعودي وللمريض',
    headlineEn: 'Coordinator validates opinion draft and releases certified PDF 1 simultaneously to Saudi doctor & patient',
    detailAr: 'إصدار التقرير الأول مع الختم الرقمي ورمز QR المعتمد، والتسليم الفوري المتزامن للطرفين.',
    detailEn: 'Official PDF 1 release with cryptographic seal, QR verification, and synchronized dual dispatch.'
  },
  FOLLOW_UP_21_DAYS: {
    stageNum: 8,
    stageNameAr: 'المرحلة 8: متابعة 21 يوماً · C09–10 · P27–29',
    stageNameEn: 'Follow-up 21 days · C09–10 · P27–29',
    roleAr: 'المريض ومنسق الرعاية (P + C)',
    roleEn: 'Patient · ALO coordinator',
    headlineAr: 'نافذة متابعة مجانية لمدة 21 يوماً للإجابة عن الأسئلة وتقييم الخدمة',
    headlineEn: 'Secure 21-day clinical follow-up chat window, report download, and patient rating',
    detailAr: 'تواصل مستمر للإجابة عن أي استفسارات تخص تقرير الرأي الأول مع تقييم 5 نجوم للخدمة.',
    detailEn: 'Continuous async guidance for report inquiries with 5-star patient satisfaction survey.'
  },
  CLOSED: {
    stageNum: 9,
    stageNameAr: 'المرحلة 9: مغلقة · P29',
    stageNameEn: 'Closed · P29',
    roleAr: 'منسق رعاية ألو وإدارة المنصة',
    roleEn: 'ALO coordinator',
    headlineAr: 'إصدار التقرير النهائي PDF 2، أرشفة السجل، وإغلاق الحالة بنجاح',
    headlineEn: 'Final PDF 2 dossier generation, permanent encrypted archival, and case closure',
    detailAr: 'حفظ وتشفير شامل لكافة مراحل الرأي الطبي الثاني وإغلاق الحالة وفق معايير الحوكمة الطبية.',
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

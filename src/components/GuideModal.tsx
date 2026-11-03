import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Users,
  Layers,
  Zap,
  RotateCcw,
  MessageCircle,
  CheckCircle2,
  HeartPulse,
  CreditCard,
  Video,
  FlaskConical,
  Building2,
  Plane,
  ShieldCheck,
  Stethoscope,
  Activity,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { PERSONAS } from '../data/personas';
import { ClinicalStage } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  onSelectStage?: (stage: ClinicalStage) => void;
  onSelectPersonaCode?: (code: string) => void;
}

export const GuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onSelectStage,
  onSelectPersonaCode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'stages' | 'tools'>('overview');
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const STAGES_GUIDE: {
    stage: ClinicalStage;
    num: number;
    titleAr: string;
    titleEn: string;
    role: string;
    descAr: string;
    descEn: string;
    keyPointsAr: string[];
    keyPointsEn: string[];
  }[] = [
    {
      stage: 'INTAKE_RECEIVED',
      num: 1,
      titleAr: 'المرحلة 1: استلام الحالة · P01–17',
      titleEn: 'Intake received · P01–17',
      role: 'P (Patient / مريض)',
      descAr: 'يقوم المريض بتعبئة بيانات الشكوى الرئيسية، اختيار التخصص، ورفع التقارير الطبية وملفات الأشعة السابقة.',
      descEn: 'Patient submits chief complaint, selects medical specialty, and uploads previous lab reports and DICOM imaging.',
      keyPointsAr: ['شاشات P01 إلى P14', 'إشعار ترحيبي عبر الواتساب W01', 'دعم الهوية الوطنية / الإقامة'],
      keyPointsEn: ['Screens P01 to P14', 'WhatsApp Welcome trigger W01', 'National ID / Iqama validation']
    },
    {
      stage: 'NURSE_CHECK',
      num: 2,
      titleAr: 'المرحلة 2: فحص التمريض · N01–07',
      titleEn: 'Nurse check · N01–07',
      role: 'N (ALO nurse)',
      descAr: 'مراجعة العلامات الحيوية، التحقق من اكتمال التاريخ المرضي، وحجب البيانات الشخصية (De-Identification) لحماية الخصوصية.',
      descEn: 'Nurse reviews vitals, verifies clinical completeness, and applies HIPAA-compliant de-identification before specialist review.',
      keyPointsAr: ['شاشات N01 إلى N07', 'إخفاء الاسم ورقم الهوية آلياً', 'فحص جاهزية صور الأشعة'],
      keyPointsEn: ['Screens N01 to N07', 'Automated PII masking', 'DICOM imaging readiness check']
    },
    {
      stage: 'DOCTOR_REVIEW',
      num: 3,
      titleAr: 'المرحلة 3: مراجعة الطبيب · D02–06',
      titleEn: 'Doctor review · D02–06',
      role: 'D (Saudi treating doctor)',
      descAr: 'يقوم الاستشاري السعودي بمراجعة الحالة، تحديد الأسئلة الدقيقة للاستشاري الهندي، وتأكيد الحاجة للرأي الثاني.',
      descEn: 'Saudi treating physician validates clinical history, frames targeted questions for the Indian specialist, and confirms eligibility.',
      keyPointsAr: ['شاشات D01 إلى D10', 'تحديد أولوية الحالة والبروتوكول', 'اعتماد ملف الإحالة الدولية'],
      keyPointsEn: ['Screens D01 to D10', 'Clinical priority & protocol triage', 'International referral pack sign-off']
    },
    {
      stage: 'AWAITING_PAYMENT',
      num: 4,
      titleAr: 'المرحلة 4: بانتظار السداد · P19–21',
      titleEn: 'Awaiting payment · C01–06 · P19–21',
      role: 'P (Patient / مريض)',
      descAr: 'سداد رسوم الاستشارة (2,875 ر.س - الفئة 2) عبر بوابة Tap (مدى، فيزا، ماستركارد)، أو تقسيط تابي على 4 دفعات، مع فاتورة ZATCA الإلكترونية.',
      descEn: 'Patient pays consultation fee (2,875 SAR, Tier 2) via Tap Payments (Mada, Visa, Apple Pay) or Tabby 4x split, with ZATCA Phase-2 QR invoice.',
      keyPointsAr: ['شاشات P19 إلى P21', 'رمز الاستجابة السريع ZATCA Phase-2', 'خيار التقسيط تابي 4 دفعات'],
      keyPointsEn: ['Screens P19 to P21', 'ZATCA Phase-2 compliant QR code', 'Tabby 4-installment interest-free split']
    },
    {
      stage: 'WITH_CONSULTANT',
      num: 5,
      titleAr: 'المرحلة 5: لدى الاستشاري · K01–04',
      titleEn: 'With consultant · K01–04',
      role: 'K (Indian consultant)',
      descAr: 'مراجعة متخصصة من الاستشاري الهندي، فحص الأشعة عبر عارض DICOM، وإصدار رأي مكتوب · مواعيد المكالمة.',
      descEn: 'Indian consultant reviews de-identified records, inspects DICOM scans, and issues written opinion · call slots.',
      keyPointsAr: ['شاشات K01 إلى K07', 'عارض أشعة DICOM تفاعلي', 'رأي مكتوب · مواعيد المكالمة'],
      keyPointsEn: ['Screens K01 to K07', 'Interactive DICOM viewer with slice controls', 'Written opinion · call slots'],
    },
    {
      stage: 'OPINION_READY',
      num: 6,
      titleAr: 'المرحلة 6: الرأي جاهز · C08 · P25–26',
      titleEn: 'Opinion ready · C08 · P25–26',
      role: 'K + P (Consultant & Patient)',
      descAr: 'جلسة اتصال مرئي WebRTC مباشرة بين المريض والاستشاريين مع ترجمة فورية، وإصدار التقرير الطبي المعتمد ثنائي اللغة.',
      descEn: 'Live WebRTC encrypted video consultation with bilingual clinical translation, followed by download of the digitally stamped PDF report.',
      keyPointsAr: ['شاشة K08 وP25', 'اتصال فيديو WebRTC مشفر', 'تقرير طبي رسمي مختوم باللغتين'],
      keyPointsEn: ['Screens K08 & P25', 'Bilingual WebRTC video call with camera controls', 'Digitally stamped bilingual second-opinion PDF']
    },
    {
      stage: 'PARTNER_SERVICES',
      num: 7,
      titleAr: 'المرحلة 7: خدمات الشركاء · L01–V01',
      titleEn: 'Partner services · L01 · T01 · H01 · V01',
      role: 'L / H / T / V (Partners / شركاء الرعاية)',
      descAr: 'تنسيق الخدمات الموصى بها في التقرير: تحاليل منزلية عبر مختبرات ألفا، تمريض منزلي سند، وتنسيق سفر وعلاج خارجي الفرسان.',
      descEn: 'Fulfillment of post-opinion recommendations: Alpha Labs at-home blood draws, Sanad home nursing visits, and Al-Fursan medical travel logistics.',
      keyPointsAr: ['شاشات L01، H01، T01، V01', 'تتبع المندوب والفني في الوقت الفعلي', 'الموافقة المسبقة للتأمين الصحي'],
      keyPointsEn: ['Screens L01, H01, T01, V01', 'Live technician dispatch & sample tracking', 'CHI insurance pre-authorization workflows']
    },
    {
      stage: 'FOLLOW_UP_21_DAYS',
      num: 8,
      titleAr: 'المرحلة 8: متابعة 21 يوماً · C09–10 · P27–29',
      titleEn: 'Follow-up 21 days · C09–10 · P27–29',
      role: 'P + D (Patient & Saudi treating doctor)',
      descAr: 'قناة محادثة سريرية آمنة ومفتوحة لمدة 21 يوماً لطرح أي استفسارات لاحقة ومشاركة نتائج التحاليل الإضافية.',
      descEn: 'Secure 21-day asynchronous clinical chat window for patient inquiries and supplemental lab result follow-ups.',
      keyPointsAr: ['شاشات P27 إلى P28', 'إشعارات واتساب عند رد الطبيب', 'تبادل المرفقات الطبية الآمنة'],
      keyPointsEn: ['Screens P27 to P28', 'WhatsApp push on doctor reply', 'Encrypted file and photo sharing']
    },
    {
      stage: 'CLOSED',
      num: 9,
      titleAr: 'المرحلة 9: مغلقة · P29',
      titleEn: 'Closed · P29',
      role: 'P + AD (Patient & Admin)',
      descAr: 'اعتماد الخطة العلاجية النهائية، قياس رضا المريض (NPS)، وإرشفة السجل الطبي وفق متطلبات هيئة الصحة السعودية.',
      descEn: 'Final treatment sign-off, patient Net Promoter Score (NPS) submission, and permanent archival per Saudi health data retention policies.',
      keyPointsAr: ['شاشات P29 وAD01', 'تقييم تجربة المريض من 1 إلى 10', 'أرشفة السجل الإلكتروني النهائي'],
      keyPointsEn: ['Screens P29 & AD01', 'NPS 1-10 clinical rating & feedback', 'Encrypted long-term medical archival']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-alo-darkCard border border-slate-200 dark:border-alo-darkBorder rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-alo-darkCanvas/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-alo-teal to-teal-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'دليل المنصة وخطوات التجربة' : 'Platform Testing Guide & Walkthrough'}
                </h2>
                <span className="bg-alo-mint text-alo-teal dark:bg-alo-mintDark dark:text-alo-aqua text-[10px] px-2 py-0.5 rounded-full font-bold border border-teal-200 dark:border-teal-700">
                  ALO DOCTOR v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'دليل استرشادي تفاعلي خطوة بخطوة لاستعراض تجربة الرأي الطبي الثاني'
                  : 'Step-by-step interactive walkthrough for exploring the cross-border second opinion workflow'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isAr ? '1. نظرة عامة' : '1. Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'roles'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isAr ? '2. الأدوار الـ 11' : '2. 11 Personas'}</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'stages'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? '3. المراحل السريرية الـ 9' : '3. 9 Clinical Stages'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'tools'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? '4. أدوات التجربة السريعة' : '4. Tester Power Tools'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-800 rounded-xl p-5">
                <h3 className="text-base font-bold text-alo-teal dark:text-alo-aqua mb-2 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-alo-teal" />
                  <span>{isAr ? 'ما هي منصة ALO DOCTOR؟' : 'What is ALO DOCTOR?'}</span>
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isAr
                    ? 'منصة الرأي الطبي الثاني العابرة للحدود (المملكة العربية السعودية 🇸🇦 ⇄ الهند 🇮🇳). تتيح للمرضى في السعودية الحصول على استشارة تخصصية دقيقة من كبار الاستشاريين الدوليين في مستشفيات فورتيس وأبولو، مع إشراف طبي محلي من استشاري سعودي مرخص، وتنسيق الرعاية المنزلية والفحوصات في الرياض وجدة.'
                    : 'A cross-border medical second opinion telehealth platform connecting patients in Saudi Arabia (🇸🇦) with top-tier Indian specialists at Apollo and Fortis (🇮🇳). Governed by Saudi treating physicians, the platform features de-identified clinical review, Tap/Tabby payments, WebRTC video consultation, and on-the-ground Saudi partner fulfillment.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-alo-teal flex items-center justify-center font-bold mb-2">
                    10
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                    {isAr ? '10 حالات سريرية حقيقية' : '10 Realistic Seed Cases'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'حالات جاهزة في جراحة القلب، الأورام، العظام، الأعصاب، والأطفال للتنقل الفوري بينها.'
                      : 'Pre-loaded Saudi clinical cases spanning Cardiology, Oncology, Orthopedics, Neurology, and Pediatrics.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold mb-2">
                    11
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                    {isAr ? '11 دوراً بصلاحيات مختلفة' : '11 Interactive Personas'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'يمكنك التبديل بنقرة واحدة بين المريض، الممرض، الطبيب السعودي، الاستشاري الهندي، ومختبرات ألفا.'
                      : 'Switch instantly between Patient, ALO nurse, Saudi treating doctor, Indian consultant, and partner roles.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold mb-2">
                    9
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                    {isAr ? '9 مراحل سير عمل متكاملة' : '9-Stage Complete Journey'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'من التسجيل الأولي وحتى مكالمة الفيديو، التقرير المختوم، محادثة المتابعة 21 يوماً، وإغلاق الملف.'
                      : 'From initial intake to WebRTC video call, stamped bilingual PDF, 21-day chat, and final closure.'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? 'بيئة تجريبية آمنة ومستقلة لكل مستخدم (Isolated Sandbox)' : 'Isolated Local Storage Sandbox'}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isAr
                      ? 'كل ما تقوم بتعديله أو إدخاله يُحفظ في متصفحك فقط عبر التخزين المحلي (LocalStorage). لن يؤثر عملك على أي مستخدم آخر، ويمكنك إعادة تعيين المنصة إلى حالتها الأصلية بضغطة زر واحدة (إعادة ضبط).'
                      : 'All entries and updates are saved locally in your browser sandbox. Different reviewers can test simultaneously without conflicting with each other. Click "Reset Demo" at any time to return to factory state.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 11 PERSONAS */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isAr
                  ? 'اختر أي دور من الشريط العلوي لمشاهدة المنصة من منظور ذلك المستخدم، أو انقر على أي دور أدناه:'
                  : 'Click any role in the top header ribbon to view the platform from that perspective, or click any card below:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERSONAS.map((p) => (
                  <div
                    key={p.code}
                    onClick={() => {
                      if (onSelectPersonaCode) {
                        onSelectPersonaCode(p.code);
                        onClose();
                      }
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 hover:border-alo-teal hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {p.name}
                        </div>
                        <span className="text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                          {p.code}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-alo-teal dark:text-alo-aqua">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {p.badge}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 9 CLINICAL STAGES */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isAr
                  ? 'يمكنك الانتقال لأي مرحلة مباشرة من شريط المراحل العلوي أو استعراض خطوات الرحلة السريرية التسع أدناه:'
                  : 'You can navigate to any stage directly from the top stepper progress bar or inspect the 9 clinical steps below:'}
              </p>

              <div className="space-y-3">
                {STAGES_GUIDE.map((s) => (
                  <div
                    key={s.stage}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-alo-teal/60 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-alo-teal text-white text-xs font-extrabold flex items-center justify-center">
                          {s.num}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {isAr ? s.titleAr : s.titleEn}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                          {s.role}
                        </span>
                        {onSelectStage && (
                          <button
                            onClick={() => {
                              onSelectStage(s.stage);
                              onClose();
                            }}
                            className="text-[11px] font-bold text-alo-teal hover:underline flex items-center gap-0.5"
                          >
                            <span>{isAr ? 'الانتقال للشاشة' : 'Jump here'}</span>
                            {isAr ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                      {isAr ? s.descAr : s.descEn}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {(isAr ? s.keyPointsAr : s.keyPointsEn).map((pt, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] bg-teal-50 dark:bg-teal-950/40 text-alo-teal dark:text-alo-aqua border border-teal-200 dark:border-teal-800/60 px-2 py-0.5 rounded-md"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{pt}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TESTER POWER TOOLS */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tool 1: Auto Fill */}
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-800 dark:text-amber-300 mb-1.5">
                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{isAr ? '⚡ زر التعبئة السريعة (Auto-Fill)' : '⚡ Auto-Fill Screen'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isAr
                      ? 'موجود في الشريط العلوي باللون البرتقالي. بنقرة واحدة يقوم بتعبئة كافة الحقول والنماذج في الشاشة الحالية ببيانات سريرية واقعية، حتى لا تضطر للكتابة اليدوية أثناء الاختبار.'
                      : 'Located in the top header. In 1 click, it fills all form fields on the current screen with realistic clinical dummy data so testers do not need to type manually.'}
                  </p>
                </div>

                {/* Tool 2: Case Rotator */}
                <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20">
                  <div className="flex items-center gap-2 font-bold text-xs text-alo-teal dark:text-alo-aqua mb-1.5">
                    <RotateCcw className="w-4 h-4 text-alo-teal" />
                    <span>{isAr ? '🔄 تدوير الحالات (Next Case)' : '🔄 Next Case Rotator'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isAr
                      ? 'زر تدوير الحالات في الشريط العلوي يتيح لك التنقل السلس بين 10 حالات لمرضى سعوديين مختلفين (سالم، فاطمة، طارق، ريم، نوف، خالد، عبد الله، مشعل، زياد، منى) بمختلف التخصصات.'
                      : 'Cycles through 10 distinct Saudi patient cases (Salem, Fatima, Tariq, Reem, Nouf, Khalid, Abdullah, Mishal, Ziyad, Mona) across various medical sub-specialties.'}
                  </p>
                </div>

                {/* Tool 3: WhatsApp Simulator */}
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300 mb-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    <span>{isAr ? '📱 محاكي رسائل الواتساب (WhatsApp Drawer)' : '📱 WhatsApp Meta Simulator'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isAr
                      ? 'في أسفل الشاشة على اليمين يظهر إشعار الواتساب التفاعلي عند كل تقدم في المرحلة. يمكنك النقر عليه لفتح درج الرسائل المعتمدة من Meta باللغتين العربية والإنجليزية.'
                      : 'Floating pill at the bottom right triggers simulated WhatsApp Meta-approved templates upon stage transitions, showing the exact messages sent to the patient.'}
                  </p>
                </div>

                {/* Tool 4: Reset Demo */}
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-800 dark:text-rose-300 mb-1.5">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>{isAr ? '🔄 إعادة ضبط المنصة (Reset Demo)' : '🔄 Reset Demo Sandbox'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isAr
                      ? 'الزر الوردي في الشريط العلوي. عند الرغبة في مسح أي بيانات أو تعديلات أجريتها والبدء من جديد، انقر عليه لإعادة ضبط كافة الحالات العشر إلى حالتها الأولية فوراً.'
                      : 'Pink button in the top ribbon. If you want to clear your local test data and start fresh, click this to wipe your browser cache and restore seed cases.'}
                  </p>
                </div>
              </div>

              {/* URL Deep Link Guide */}
              <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
                  {isAr ? '💡 نصيحة للاختبار الجماعي على عدة أجهزة:' : '💡 Multi-Device Testing Tip:'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {isAr
                    ? 'يمكنك فتح الرابط على هاتفك المحمول أو إرساله لزملائك الأطباء مباشرة بدون الحاجة لتسجيل دخول أو كلمات مرور. كل جهاز يعمل في مساحة مستقلة تماماً.'
                    : 'Open the link on your mobile phone or share it with colleagues—no login or password credentials are required. Each device runs in its own private sandbox.'}
                </p>
                <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-alo-teal select-all text-center">
                  https://ad.howtostart.in
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-alo-darkCanvas border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {isAr ? 'ALO DOCTOR — تجربة سريرية حية v2.4' : 'ALO DOCTOR — Clinical Demo Experience v2.4'}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-alo-teal hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            {isAr ? 'فهمت، ابدأ التجربة' : 'Got it, Start Testing'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { PERSONAS } from '../data/personas';
import { Persona, ClinicalCase } from '../types';
import { 
  RefreshCw, 
  RotateCcw,
  Zap, 
  ShieldCheck, 
  HeartPulse, 
  Globe, 
  Sun, 
  Moon,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const ROLE_METADATA: Record<string, { labelAr: string; labelEn: string; scopeAr: string; scopeEn: string }> = {
  P: {
    labelAr: 'المريض (سالم)',
    labelEn: 'Patient (Salem)',
    scopeAr: 'تسجيل الأعراض، رفع التقارير، اختيار وسيلة الاستشارة، وسداد الرسوم',
    scopeEn: 'Intake submission, medical reports, consultation preference, and payment'
  },
  F: {
    labelAr: 'المرافقة (فاطمة)',
    labelEn: 'Caregiver (Fatima)',
    scopeAr: 'إدارة طلب الرأي الطبي نيابة عن المريض بموجب الموافقة النظامية',
    scopeEn: 'Authorized caregiver managing second-opinion case on behalf of family member'
  },
  N: {
    labelAr: 'ممرضة الفرز (سارة)',
    labelEn: 'Nurse (Sara)',
    scopeAr: 'صندوق فرز الحالات، تدقيق العلامات الحيوية، وحجب البيانات الشخصية آلياً',
    scopeEn: 'Clinical triage inbox, vitals verification, and automated PII de-identification'
  },
  D: {
    labelAr: 'الطبيب (د. عبدالله)',
    labelEn: 'Doctor (Dr. Abdullah)',
    scopeAr: 'مراجعة التاريخ المرضي، تحديد الأسئلة الدقيقة للاستشاري، واعتماد الإحالة',
    scopeEn: 'Clinical dossier review, framing specialist focus questions, and referral sign-off'
  },
  K: {
    labelAr: 'الاستشاري (د. أرجون)',
    labelEn: 'Consultant (Dr. Arjun)',
    scopeAr: 'مراجعة الأشعة ثلاثية الأبعاد، تسجيل الملخص الصوتي، وإصدار الرأي المعتمد',
    scopeEn: '3D DICOM multi-slice review, voice briefing synthesis, and second opinion sign-off'
  },
  L: {
    labelAr: 'مختبرات ألفا',
    labelEn: 'Alpha Labs',
    scopeAr: 'جدولة السحب المنزلي، تتبع عينات الدم، ورفع نتائج التحاليل المخبرية',
    scopeEn: 'At-home phlebotomist dispatch, sample barcode tracking, and lab result upload'
  },
  H: {
    labelAr: 'رعاية منزلية (سند)',
    labelEn: 'Home Care (Sanad)',
    scopeAr: 'زيارات التمريض المنزلي، متابعة التئام الجروح، وقياس المؤشرات الحيوية',
    scopeEn: 'At-home skilled nursing visits, wound care dressings, and vital sign monitoring'
  },
  T: {
    labelAr: 'سياحة طبية (الفرسان)',
    labelEn: 'Medical Travel',
    scopeAr: 'تنسيق التأشيرات العلاجية، حجوزات الطيران، والاستقبال الطبي في الهند',
    scopeEn: 'International medical visa processing, flights, and hospital transfer logistics'
  },
  V: {
    labelAr: 'التأمين (بوبا)',
    labelEn: 'Insurance (Bupa)',
    scopeAr: 'الموافقة المسبقة للتأمين الصحي، تدقيق التغطية، واعتماد خدمات الرأي الثاني',
    scopeEn: 'CHI insurance pre-authorization, benefits check, and claim approvals'
  },
  HA: {
    labelAr: 'إدارة المستشفى',
    labelEn: 'Hospital Admin',
    scopeAr: 'إدارة جداول الأطباء السعوديين، تسويات العمولات، وكشوف الحساب الشهرية',
    scopeEn: 'Physician scheduling, referral tracking, and monthly hospital statement audits'
  },
  AD: {
    labelAr: 'مدير النظام',
    labelEn: 'Super Admin',
    scopeAr: 'الرقابة الشاملة، إدارة شبكة الاستشاريين، مراقبة SLA، وسياسات الامتثال',
    scopeEn: 'Platform governance, specialist network onboarding, SLA alerts, and compliance'
  }
};

interface Props {
  activePersona: Persona;
  onSelectPersona: (p: Persona) => void;
  activeCase: ClinicalCase;
  onNextCase: () => void;
  onSelectCase: (caseId: string) => void;
  cases: ClinicalCase[];
  onAutoFill: () => void;
  onResetDemo?: () => void;
  onOpenGuide?: () => void;
  onStartAutoDemo?: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const TopProfileSwitcher: React.FC<Props> = ({
  activePersona,
  onSelectPersona,
  activeCase,
  onNextCase,
  onSelectCase,
  cases,
  onAutoFill,
  onResetDemo,
  onOpenGuide,
  onStartAutoDemo,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-alo-darkCard/95 backdrop-blur-md border-b border-slate-200/80 dark:border-alo-darkBorder shadow-sm transition-colors">
      {/* Top Utility Ribbon */}
      <div className="px-4 py-2 bg-slate-50/80 dark:bg-alo-darkCanvas border-b border-slate-200/60 dark:border-alo-darkBorder/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Section: Brand Logo + Case Selector + Next Rotator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-alo-navy dark:text-alo-aqua">
            <HeartPulse className="w-4 h-4 text-alo-teal animate-pulse" />
            <span className="text-sm font-extrabold tracking-wider">ALO DOCTOR</span>
            <span className="bg-alo-mint text-alo-teal dark:bg-alo-mintDark dark:text-alo-aqua text-[10px] px-2 py-0.5 rounded-full font-bold border border-teal-200 dark:border-teal-700">
              v2.4 Saudi
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />

          {/* Active Case Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isAr ? 'الحالة النشطة:' : 'Active Case:'}
            </span>
            <select
              value={activeCase.id}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-2.5 py-1 font-semibold focus:ring-2 focus:ring-alo-teal outline-none text-xs shadow-sm cursor-pointer"
            >
              {cases.map((c, i) => (
                <option key={c.id} value={c.id}>
                  #{i + 1} {c.caseNumber} - {c.patientName} ({c.specialty.split('(')[0].trim()})
                </option>
              ))}
            </select>

            <button
              onClick={onNextCase}
              className="flex items-center gap-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold transition-all shadow-sm active:scale-95"
              title={isAr ? 'تدوير الحالة التالية (Next Case)' : 'Rotate to Next Case'}
            >
              <RefreshCw className="w-3 h-3 text-alo-teal" />
              <span>{isAr ? 'تدوير (Next)' : 'Next Case'}</span>
            </button>
          </div>
        </div>

        {/* Right Section: Auto-Fill + Theme Toggle + Universal Language Pill */}
        <div className="flex items-center gap-2.5">
          {/* 1-Click Executive Auto-Demo Presentation Mode */}
          {onStartAutoDemo && (
            <button
              onClick={onStartAutoDemo}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-3 py-1 rounded-lg shadow-sm transition-all text-xs active:scale-95 animate-pulse"
              title={isAr ? 'بدء جولة العرض التلقائي السريرية' : 'Start interactive auto-demo presentation walkthrough'}
            >
              <span>▶️</span>
              <span>{isAr ? 'جولة تلقائية (Auto-Demo)' : '▶ Auto-Demo'}</span>
            </button>
          )}

          {/* Magic 1-Click Auto-Fill */}
          <button
            onClick={onAutoFill}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-3 py-1 rounded-lg shadow-sm transition-all text-xs active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>{isAr ? '⚡ تعبئة سريعة (Auto-Fill)' : '⚡ Auto-Fill Screen'}</span>
          </button>

          {/* Interactive Platform Guide & Walkthrough */}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 font-bold text-xs transition-all shadow-sm active:scale-95"
              title={isAr ? 'دليل المنصة وخطوات التجربة السريرية' : 'Platform guide & step-by-step walkthrough'}
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{isAr ? 'دليل التجربة' : 'Guide'}</span>
            </button>
          )}

          {/* 1-Click Reset Demo Sandbox */}
          {onResetDemo && (
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 font-bold text-xs transition-all shadow-sm active:scale-95"
              title={isAr ? 'إعادة ضبط الحالات إلى الوضع التجريبي الأصلي' : 'Reset all cases and local storage to initial demo state'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{isAr ? 'إعادة ضبط' : 'Reset Demo'}</span>
            </button>
          )}

          {/* Theme Toggle (Light Clinical Calm / Dark Luminous) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title={theme === 'light' ? 'Switch to Luminous Dark' : 'Switch to Clinical Calm'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-slate-700" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Universal 1-Click Bilingual Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 bg-alo-mint hover:bg-teal-100 text-alo-teal dark:bg-alo-mintDark dark:text-alo-aqua px-3 py-1 rounded-lg border border-teal-300 dark:border-teal-700 font-extrabold text-xs transition-all shadow-sm active:scale-95"
            title={isAr ? 'Switch Interface to English' : 'تحويل الواجهة إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-alo-teal dark:text-alo-aqua" />
            <span>{isAr ? 'English (EN)' : 'العربية (AR)'}</span>
          </button>
        </div>
      </div>

      {/* Main Persona Switcher Bar: 11 Clickable Roles */}
      <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap px-1 flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-alo-teal" />
          <span>{isAr ? 'تبديل الدور (11):' : 'Switch Role (11):'}</span>
        </span>

        {PERSONAS.map((persona) => {
          const isActive = activePersona.code === persona.code;
          const meta = ROLE_METADATA[persona.code];
          const displayLabel = meta 
            ? (isAr ? meta.labelAr : meta.labelEn)
            : (isAr ? persona.name.split(' ')[0] : persona.code);
          const tooltip = `${persona.name} — ${persona.title}\n${isAr ? 'الدور:' : 'Role:'} ${persona.code}\n${isAr ? (meta?.scopeAr || '') : (meta?.scopeEn || '')}\n${isAr ? 'انقر للتحويل إلى هذا الدور' : 'Click to switch to this perspective'}`;

          return (
            <button
              key={persona.code}
              onClick={() => onSelectPersona(persona)}
              title={tooltip}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-alo-teal text-white shadow-md shadow-teal-700/20 ring-2 ring-alo-teal/30 scale-102 font-extrabold'
                  : 'bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <span>{persona.avatar}</span>
              <span>{displayLabel}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {persona.code}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Role Explainer Ribbon */}
      {(() => {
        const activeMeta = ROLE_METADATA[activePersona.code];
        const activeLabel = activeMeta
          ? (isAr ? activeMeta.labelAr : activeMeta.labelEn)
          : activePersona.name;
        const activeScope = activeMeta
          ? (isAr ? activeMeta.scopeAr : activeMeta.scopeEn)
          : activePersona.title;

        return (
          <div className="px-4 py-1.5 bg-gradient-to-r from-teal-50/90 via-emerald-50/70 to-teal-50/90 dark:from-teal-950/40 dark:via-slate-900/50 dark:to-teal-950/40 border-t border-slate-200/60 dark:border-alo-darkBorder/60 flex items-center justify-between gap-3 text-xs transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 font-bold text-alo-teal dark:text-alo-aqua text-[11px] shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                <span>{isAr ? 'الدور النشط:' : 'Active Role:'}</span>
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white shrink-0">
                {activePersona.avatar} {activeLabel}
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate hidden sm:inline">
                {activeScope}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono shrink-0">
              <span className="text-slate-500 dark:text-slate-400 hidden md:inline">
                {isAr ? 'شاشة العرض:' : 'Surface:'}
              </span>
              <span className="bg-white/80 dark:bg-slate-800 text-alo-teal dark:text-alo-aqua px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 font-bold uppercase tracking-wider">
                {activePersona.surface}
              </span>
            </div>
          </div>
        );
      })()}
    </header>
  );
};

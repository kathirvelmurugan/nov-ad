import React from 'react';
import { PERSONAS } from '../data/personas';
import { Persona, ClinicalCase } from '../types';
import { getStageBadgeMeta } from './common/PortalCaseTrackerPanel';
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
  Sparkles,
  UserPlus,
  LogOut,
  Activity
} from 'lucide-react';



const ROLE_METADATA: Record<string, { labelAr: string; labelEn: string; scopeAr: string; scopeEn: string }> = {
  P: {
    labelAr: 'المريض',
    labelEn: 'Patient',
    scopeAr: 'الملف الطبي، متابعة حالة الاستشارة، وتحديد المواعيد',
    scopeEn: 'Medical dossier, second opinion tracking, and appointment scheduling'
  },
  N: {
    labelAr: 'ممرضة ألو',
    labelEn: 'ALO Nurse',
    scopeAr: 'صندوق فرز الحالات، تدقيق الفحوصات ومقاطع الأشعة، وحجب البيانات الشخصية آلياً (SDAIA)',
    scopeEn: 'Clinical triage inbox, diagnostic scan audit, and automated PII de-identification'
  },
  D: {
    labelAr: 'الطبيب السعودي المعالج',
    labelEn: 'Saudi Treating Doctor',
    scopeAr: 'مراجعة التاريخ المرضي، تحديد الفحص الحضوري، وصياغة الأسئلة السريرية للاستشاري',
    scopeEn: 'Clinical review, in-person exam decision, and clinical consultant focus questions'
  },
  C: {
    labelAr: 'منسق رعاية ألو',
    labelEn: 'ALO Coordinator',
    scopeAr: 'مراجعة وتأكيد الإحالة، إصدار الفواتير وروابط السداد للمريض، وتوجيه الملف للاستشاري',
    scopeEn: 'Referral verification, dispatching ZATCA payment links, and international case assignment'
  },
  K: {
    labelAr: 'الاستشاري الدولي',
    labelEn: 'Indian Consultant',
    scopeAr: 'مراجعة الأشعة ثلاثية الأبعاد، الاستشارة المرئية المباشرة، وإصدار التقرير الطبي المعتمد',
    scopeEn: '3D DICOM review, live video consultation, and certified second opinion report'
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
  onOpenPipelineBoard?: () => void;
  onOpenNewCaseModal?: () => void;
  onResetCurrentCase?: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  viewMode?: 'workstation' | 'studio';
  onToggleViewMode?: () => void;
  patientSubView?: 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout';
  onSelectPatientSubView?: (view: 'landing' | 'intake' | 'timeline' | 'telehealth') => void;
  onLogout?: () => void;
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
  onOpenPipelineBoard,
  onOpenNewCaseModal,
  onResetCurrentCase,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  viewMode = 'workstation',
  onToggleViewMode,
  patientSubView = 'landing',
  onSelectPatientSubView,
  onLogout,
}) => {
  const isAr = lang === 'ar';
  const isCustom = activeCase.id.startsWith('TEST-') || activeCase.id.startsWith('REAL-');
  const isDemoMode = false;

  const cleanPatientName = isAr
    ? (activeCase.patientNameAr || activeCase.patientName || '')
    : (activeCase.patientNameEn || activeCase.patientName || '');

  const stageMeta = activeCase?.caseNumber ? getStageBadgeMeta(activeCase.currentStage, isAr) : null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-alo-darkCard/95 backdrop-blur-md border-b border-slate-200/80 dark:border-alo-darkBorder shadow-sm transition-colors">
      {/* Top Utility Ribbon */}
      <div className="px-4 py-2 bg-slate-50/80 dark:bg-alo-darkCanvas border-b border-slate-200/60 dark:border-alo-darkBorder/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Section: Brand Logo + Case Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-alo-navy dark:text-alo-aqua">
            <HeartPulse className="w-4 h-4 text-alo-teal animate-pulse" />
            <span className="text-sm font-extrabold tracking-wider">ALO DOCTOR</span>
            <span className="bg-alo-mint text-alo-teal dark:bg-alo-mintDark dark:text-alo-aqua text-[10px] px-2 py-0.5 rounded-full font-bold border border-teal-200 dark:border-teal-700">
              v3.0 Saudi
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />

          {/* Focused Case Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isAr ? 'ملف الحالة:' : 'Case File:'}
            </span>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-teal-400 dark:border-teal-700 text-slate-800 dark:text-slate-100 rounded-lg px-2.5 py-1 font-bold text-xs shadow-sm">
              <span className={`w-2 h-2 rounded-full ${activeCase.caseNumber ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{activeCase.caseNumber || (isAr ? 'لا توجد حالة نشطة' : 'No Active Case')}</span>
              {cleanPatientName && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="text-alo-teal font-extrabold">
                    {cleanPatientName}
                  </span>
                </>
              )}
              {stageMeta && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stageMeta.colorClass}`}>
                  {stageMeta.label}
                </span>
              )}
            </div>

            {/* QA-Only: Next Case Rotator & Reset */}
            {isDemoMode && onNextCase && (
              <button
                onClick={onNextCase}
                className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-lg border border-teal-300 dark:border-teal-700 font-bold transition-all shadow-sm active:scale-95 text-xs cursor-pointer"
                title={isAr ? 'الانتقال للحالة التالية' : 'Next Case'}
              >
                <RefreshCw className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>{isAr ? 'حالة تالية' : 'Next Case'}</span>
              </button>
            )}

            {isDemoMode && onResetCurrentCase && (
              <button
                onClick={onResetCurrentCase}
                className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-700 font-bold transition-all shadow-sm active:scale-95"
                title={isAr ? 'تصفير المسار بالكامل والعودة للبداية' : 'Reset Flow back to Step 1'}
              >
                <RotateCcw className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                <span>{isAr ? 'تصفير المسار' : 'Reset Flow'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Pipeline Board + Theme + Lang + Logout */}
        <div className="flex items-center gap-2.5">
          {/* Track Cases Pipeline Board Button */}
          {onOpenPipelineBoard && activePersona.code !== 'P' && (
            <button
              onClick={onOpenPipelineBoard}
              className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-alo-teal dark:bg-teal-950/50 dark:text-teal-300 border border-teal-300 dark:border-teal-700 px-2.5 py-1 rounded-lg font-extrabold text-xs cursor-pointer transition-all shadow-sm active:scale-95"
              title={isAr ? 'فتح لوحة تتبع الحالات السريرية' : 'Open Clinical Command Center / Patient Pipeline Board'}
              aria-label={isAr ? 'تتبع الحالات' : 'Track Cases'}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isAr ? 'تتبع الحالات' : 'Track Cases'}</span>
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] bg-alo-teal text-white dark:bg-teal-300 dark:text-teal-950 text-[10px] font-extrabold rounded-full px-1 leading-none">
                {cases.length}
              </span>
            </button>
          )}

          {/* Theme Toggle (Light Clinical Calm / Dark Luminous) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
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
            className="flex items-center gap-1.5 bg-alo-mint hover:bg-teal-100 text-alo-teal dark:bg-alo-mintDark dark:text-alo-aqua px-3 py-1 rounded-lg border border-teal-300 dark:border-teal-700 font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            title={isAr ? 'Switch Interface to English' : 'تحويل الواجهة إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-alo-teal dark:text-alo-aqua" />
            <span>{isAr ? 'English (EN)' : 'العربية (AR)'}</span>
          </button>

          {/* Sign Out to Mobile OTP Login Gate */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
              title={isAr ? 'تسجيل الخروج والعودة لشاشة الدخول والتحقق برقم الجوال' : 'Sign out'}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{isAr ? 'خروج' : 'Logout'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Role Ribbon */}
      {(() => {
        const activeMeta = ROLE_METADATA[activePersona.code];
        let activeLabel = activeMeta
          ? (isAr ? activeMeta.labelAr : activeMeta.labelEn)
          : activePersona.name;

        if (activePersona.code === 'P') {
          activeLabel = isAr ? `المريض (${cleanPatientName})` : `Patient (${cleanPatientName})`;
        } else if (activePersona.code === 'K') {
          activeLabel = isAr ? `الاستشاري الدولي (${activeCase.consultant?.name || activePersona.name})` : `Indian Consultant (${activeCase.consultant?.name || activePersona.name})`;
        } else if (activePersona.code === 'D') {
          activeLabel = isAr ? `الطبيب السعودي المعالج (${activePersona.name || activeCase.treatingDoctor?.name || 'الطبيب المعالج'})` : `Saudi Treating Doctor (${activePersona.name || activeCase.treatingDoctor?.name || 'Treating Doctor'})`;
        } else if (activePersona.code === 'C') {
          activeLabel = isAr ? `منسق رعاية ألو (${activePersona.name})` : `ALO Coordinator (${activePersona.name})`;
        } else if (activePersona.code === 'N') {
          activeLabel = isAr ? `ممرضة ألو (${activePersona.name})` : `ALO Nurse (${activePersona.name})`;
        }

        const activeScope = activeMeta
          ? (isAr ? activeMeta.scopeAr : activeMeta.scopeEn)
          : activePersona.title;

        return (
          <div className="px-4 py-1.5 bg-gradient-to-r from-teal-50/90 via-emerald-50/70 to-teal-50/90 dark:from-teal-950/40 dark:via-slate-900/50 dark:to-teal-950/40 border-t border-slate-200/60 dark:border-alo-darkBorder/60 flex items-center justify-between gap-3 text-xs transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 font-bold text-alo-teal dark:text-alo-aqua text-[11px] shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                <span>{isAr ? 'الحساب الحالي:' : 'Active Role:'}</span>
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white shrink-0">
                {activePersona.avatar} {activeLabel}
              </span>
              {activeCase.caseNumber && (
                <>
                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                  <span className="bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-emerald-300 dark:border-emerald-800 shrink-0">
                    {activeCase.caseNumber}{cleanPatientName ? ` · ${cleanPatientName}` : ''}{stageMeta ? ` · ${stageMeta.label}` : ''}
                  </span>
                </>
              )}
              <span className="text-slate-300 dark:text-slate-700 hidden md:inline">·</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate hidden md:inline">
                {activeScope}
              </span>
            </div>
          </div>
        );
      })()}
    </header>
  );
};
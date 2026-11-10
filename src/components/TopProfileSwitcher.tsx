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
  Sparkles,
  UserPlus,
  LogOut
} from 'lucide-react';

const PATIENT_FIRST_NAMES: Record<string, { ar: string; en: string }> = {
  'case-001': { ar: 'سالم', en: 'Salem' },
  'case-002': { ar: 'فاطمة', en: 'Fatima' },
  'case-003': { ar: 'طارق', en: 'Tariq' },
  'case-004': { ar: 'ريم', en: 'Reem' },
  'case-005': { ar: 'نوف', en: 'Nouf' },
  'case-006': { ar: 'خالد', en: 'Khalid' },
  'case-007': { ar: 'عبدالله', en: 'Abdullah' },
  'case-008': { ar: 'مشعل', en: 'Mishal' },
  'case-009': { ar: 'زياد', en: 'Ziyad' },
  'case-010': { ar: 'منى', en: 'Mona' },
};

const ROLE_METADATA: Record<string, { labelAr: string; labelEn: string; scopeAr: string; scopeEn: string }> = {
  P: {
    labelAr: 'المريض',
    labelEn: 'Patient',
    scopeAr: 'الملف الطبي، متابعة حالة الاستشارة، وتحديد المواعيد',
    scopeEn: 'Medical dossier, second opinion tracking, and appointment scheduling'
  },
  N: {
    labelAr: 'ممرضة ألو (سارة)',
    labelEn: 'ALO Nurse (Sara)',
    scopeAr: 'صندوق فرز الحالات، تدقيق الفحوصات ومقاطع الأشعة، وحجب البيانات الشخصية آلياً (SDAIA)',
    scopeEn: 'Clinical triage inbox, diagnostic scan audit, and automated PII de-identification'
  },
  D: {
    labelAr: 'الطبيب السعودي المعالج (د. عبدالله)',
    labelEn: 'Saudi Treating Doctor (Dr. Abdullah)',
    scopeAr: 'مراجعة التاريخ المرضي، تحديد الفحص الحضوري، وصياغة الأسئلة السريرية للاستشاري',
    scopeEn: 'Clinical review, in-person exam decision, and clinical consultant focus questions'
  },
  C: {
    labelAr: 'منسق رعاية ألو (عبدالرحمن)',
    labelEn: 'ALO Coordinator (Abdulrahman)',
    scopeAr: 'مراجعة وتأكيد الإحالة، إصدار الفواتير وروابط السداد للمريض، وتوجيه الملف للاستشاري',
    scopeEn: 'Referral verification, dispatching ZATCA payment links, and international case assignment'
  },
  K: {
    labelAr: 'الاستشاري الدولي (د. أرجون)',
    labelEn: 'International Consultant (Dr. Arjun)',
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
  const isDemoMode = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('demo') === '1' || window.location.hash === '#cockpit');

  const cleanPatientName = isAr
    ? (activeCase.patientNameAr || activeCase.patientName || 'سالم العامري')
    : (activeCase.patientNameEn || activeCase.patientName || 'Salem Al-Ameri');

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
              v2.4 Saudi
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />

          {/* Focused Case Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isAr ? 'ملف الحالة:' : 'Case File:'}
            </span>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-teal-400 dark:border-teal-700 text-slate-800 dark:text-slate-100 rounded-lg px-2.5 py-1 font-bold text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeCase.caseNumber || 'ALO-2026-8812'}</span>
              <span className="text-slate-400">·</span>
              <span className="text-alo-teal font-extrabold">
                {cleanPatientName}
              </span>
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

        {/* Center: Patient Experience Navigation (Landing Page | Intake Form | Status Tracker) */}
        {onSelectPatientSubView && (
          <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300/80 dark:border-slate-700 shadow-inner">
            <button
              type="button"
              onClick={() => onSelectPatientSubView('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                patientSubView === 'landing' && viewMode !== 'studio'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-400'
                  : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <span>🏠</span>
              <span>{isAr ? 'بوابة المريض' : 'Patient Home'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPatientSubView('intake')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                patientSubView === 'intake' && viewMode !== 'studio'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-400'
                  : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <span>📝</span>
              <span>{isAr ? 'طلب استشارة' : 'New Consultation'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPatientSubView('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                patientSubView === 'timeline' && viewMode !== 'studio'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-400'
                  : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <span>⏱️</span>
              <span>{isAr ? 'متابعة المسار' : 'Track Status'}</span>
            </button>
          </div>
        )}

        {/* Right Section: QA tools (hidden unless ?demo=1) + Theme + Lang + Logout */}
        <div className="flex items-center gap-2.5">
          {/* QA-Only: 5-Role Studio Cockpit Multi-Device Toggle */}
          {isDemoMode && onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-sm transition-all text-xs active:scale-95 border font-extrabold cursor-pointer ${
                viewMode === 'studio'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-teal-300 ring-2 ring-teal-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <span>📱</span>
              <span>
                {viewMode === 'studio'
                  ? (isAr ? '🌐 الخروج لبوابة المريض' : '🌐 Exit to Patient App')
                  : (isAr ? '📱 استوديو ٥ شاشات' : '📱 5-Role Cockpit')}
              </span>
            </button>
          )}

          {/* QA-Only: Magic 1-Click Auto-Fill */}
          {isDemoMode && (
            <button
              onClick={onAutoFill}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-3 py-1 rounded-lg shadow-sm transition-all text-xs active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>{isAr ? '⚡ تعبئة سريعة' : '⚡ Auto-Fill'}</span>
            </button>
          )}

          {/* QA-Only: Interactive Platform Guide */}
          {isDemoMode && onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 font-bold text-xs transition-all shadow-sm active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{isAr ? 'دليل التجربة' : 'Guide'}</span>
            </button>
          )}

          {/* QA-Only: 1-Click Reset Sandbox */}
          {isDemoMode && onResetDemo && (
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 font-bold text-xs transition-all shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          )}

          {/* Theme Toggle (Light Clinical Calm / Dark Luminous) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
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
            className="flex items-center gap-1.5 bg-alo-mint hover:bg-teal-100 text-alo-teal dark:bg-alo-mintDark dark:text-alo-aqua px-3 py-1 rounded-lg border border-teal-300 dark:border-teal-700 font-extrabold text-xs transition-all shadow-sm active:scale-95"
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
          activeLabel = isAr ? `الاستشاري الدولي (${activeCase.consultant?.name || 'د. أرجون'})` : `International Consultant (${activeCase.consultant?.name || 'Dr. Arjun'})`;
        } else if (activePersona.code === 'D') {
          activeLabel = isAr ? `الطبيب السعودي المعالج (${activeCase.treatingDoctor?.name || 'د. عبدالله'})` : `Saudi Treating Doctor (${activeCase.treatingDoctor?.name || 'Dr. Abdullah'})`;
        } else if (activePersona.code === 'C') {
          activeLabel = isAr ? 'منسق رعاية ألو (عبدالرحمن)' : 'ALO Coordinator (Abdulrahman)';
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
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
              <span className="bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-emerald-300 dark:border-emerald-800 shrink-0">
                {activeCase.caseNumber} · {cleanPatientName}
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden md:inline">·</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate hidden md:inline">
                {activeScope}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] shrink-0">
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                {isAr ? 'تبديل الصلاحية:' : 'Switch Role:'}
              </span>
              <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 p-0.5 rounded-lg border border-teal-300/80 dark:border-teal-700 shadow-2xs font-sans">
                {PERSONAS.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => onSelectPersona(p)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      activePersona.code === p.code
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
                    }`}
                    title={p.title}
                  >
                    <span>{p.avatar} {isAr ? p.name.split(' ')[0] : p.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </header>
  );
};

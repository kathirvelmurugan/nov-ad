import React from 'react';
import { LogOut, Globe, Moon, Sun, ShieldCheck, Stethoscope, Building2, User, Activity } from 'lucide-react';
import { Persona, ClinicalCase } from '../types';
import { UserSession } from '../hooks/workflowConstants';

interface UniversalHeaderProps {
  userSession: UserSession;
  activePersona: Persona;
  activeCase?: ClinicalCase | null;
  lang: 'ar' | 'en';
  onToggleLang?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  patientSubView?: 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout';
  onLogout: () => void;
}

const ROLE_DISPLAY: Record<string, { labelAr: string; labelEn: string; icon: string }> = {
  P: { labelAr: 'مريض', labelEn: 'Patient', icon: '👤' },
  D: { labelAr: 'طبيب معالج سعودي', labelEn: 'Saudi Treating Doctor', icon: '🩺' },
  N: { labelAr: 'تمريض الفرز السريري', labelEn: 'Triage Nurse', icon: '💉' },
  C: { labelAr: 'منسق رعاية ألو', labelEn: 'ALO Care Coordinator', icon: '📋' },
  K: { labelAr: 'استشاري دولي', labelEn: 'International Consultant', icon: '🌍' },
  HA: { labelAr: 'مدير المجمع الطبي', labelEn: 'Hospital Admin', icon: '🏥' },
  AD: { labelAr: 'المشرف العام', labelEn: 'Super Admin', icon: '🛡️' },
  L: { labelAr: 'فني المختبر', labelEn: 'Lab Technician', icon: '🧪' },
  PH: { labelAr: 'صيدلي معتمد', labelEn: 'Pharmacist', icon: '💊' },
  REC: { labelAr: 'موظف الاستقبال', labelEn: 'Receptionist', icon: '🏢' },
};

export const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  userSession,
  activePersona,
  activeCase,
  lang,
  onToggleLang,
  theme = 'light',
  onToggleTheme,
  onLogout,
}) => {
  const isAr = lang === 'ar';
  const roleCode = (userSession.roleCode || activePersona.code || 'P').toUpperCase();
  const isPatient = roleCode === 'P';

  const roleMeta = ROLE_DISPLAY[roleCode] || {
    labelAr: activePersona.title || 'مستخدم النظام',
    labelEn: activePersona.title || 'Staff User',
    icon: activePersona.avatar || '🩺',
  };

  const displayName =
    userSession.fullName ||
    (isPatient
      ? (activeCase?.patientName || activeCase?.patientNameAr || activeCase?.patientNameEn || (isAr ? 'المريض' : 'Patient'))
      : activePersona.name);

  const displayPhone = userSession.phone || (isPatient ? activeCase?.patientPhone : undefined);
  // Neutral network label only. A named facility here would advertise a hospital
  // that does not exist in the tenant directory.
  const displayHospital =
    activeCase?.treatingDoctor?.hospital ||
    activePersona.hospitalId ||
    (isAr ? 'شبكة ألو الطبية المعتمدة' : 'ALO Accredited Network');

  // ── Patient Top Navigation Header ───────────────────────────────────────────
  if (isPatient) {
    return (
      <header
        id="alo-patient-top-nav"
        className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#007B6E] to-[#00C6AE] flex items-center justify-center text-white shadow-sm font-black text-lg">
              +
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                {isAr ? 'ألو دكتور' : 'ALO DOCTOR'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {isAr ? 'بوابة المريض والمستفيد' : 'Patient Care Portal'}
              </span>
            </div>

            {activeCase?.caseNumber && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeCase.caseNumber}</span>
              </span>
            )}
          </div>

          {/* Right Action Stack: Profile Badge + Lang + Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Patient Name / Phone Badge */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[120px] sm:max-w-[180px]">
                  {displayName}
                </span>
                {displayPhone && (
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 direction-ltr">
                    {displayPhone}
                  </span>
                )}
              </div>
            </div>

            {/* Language Switcher */}
            {onToggleLang && (
              <button
                type="button"
                onClick={onToggleLang}
                className="p-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title={isAr ? 'Switch to English' : 'التحويل للعربية'}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? 'EN' : 'عربي'}</span>
              </button>
            )}

            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            )}

            {/* Logout Button (Patient) */}
            <button
              id="patient-nav-logout-btn"
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer"
              title={isAr ? 'تسجيل الخروج وإنهاء الجلسة' : 'Log Out and Clear Session'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // ── Clinical & Staff Top Navigation Header ─────────────────────────────────
  return (
    <header
      id="alo-staff-top-nav"
      className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md transition-colors"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: ALO Clinical Ribbon & Hospital Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
            <Stethoscope className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wide text-white shrink-0">
                {isAr ? 'ألو دكتور' : 'ALO DOCTOR'}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                {isAr ? 'المنظومة السريرية' : 'Clinical Ribbon'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-300 truncate">
              <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{displayHospital}</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Staff Identity Badge + Actions + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Staff Full Name + Role Badge */}
          <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center justify-center text-sm shrink-0">
              {roleMeta.icon}
            </div>
            <div className="flex flex-col min-w-0 text-start">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-xs truncate max-w-[130px] sm:max-w-[200px]">
                  {displayName}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400">
                {isAr ? roleMeta.labelAr : roleMeta.labelEn}
              </span>
            </div>
          </div>

          {/* Active Case Badge if applicable */}
          {activeCase?.caseNumber && (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold">
              <span>{activeCase.caseNumber}</span>
            </span>
          )}

          {/* Language Switcher */}
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              className="p-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              title={isAr ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isAr ? 'EN' : 'عربي'}</span>
            </button>
          )}

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          )}

          {/* Prominent Staff Logout Button */}
          <button
            id="staff-nav-logout-btn"
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer border border-rose-500"
            title={isAr ? 'تسجيل الخروج من البوابة السريرية' : 'Sign Out of Clinical Portal'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isAr ? 'تسجيل الخروج' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default UniversalHeader;

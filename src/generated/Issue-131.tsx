import React, { useState, useEffect, useCallback } from 'react';

const PERSONAS = [
  { id: 'adrian-lewis', nameEn: 'Adrian Lewis', nameAr: 'أدريان لويس', roleEn: 'Lead Physician', roleAr: 'طبيب رئيسي' },
  { id: 'emmanuel-arcon-gonzalez', nameEn: 'Emmanuel Arcon Gonzalez', nameAr: 'إيمانويل أركون غونزاليس', roleEn: 'Triage Nurse', roleAr: 'ممرض فرز' },
  { id: 'david-nunez', nameEn: 'David Nunez', nameAr: 'ديفيد نونيز', roleEn: 'Care Coordinator', roleAr: 'منسق رعاية' },
  { id: 'marcus-vance', nameEn: 'Marcus Vance', nameAr: 'ماركوس فانس', roleEn: 'Specialist Surgeon', roleAr: 'جراح متخصص' },
  { id: 'v-prasanth', nameEn: 'V. Prasanth', nameAr: 'في. براسانث', roleEn: 'Clinical Pharmacist', roleAr: 'صيدلاني سريري' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  caseId?: string;
  patientNameEn?: string;
  patientNameAr?: string;
  currentMilestone?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  caseId = 'ALO-2024-88391',
  patientNameEn = 'Patient Record',
  patientNameAr = 'سجل المريض',
  currentMilestone = 'Triage Assessment',
}) => {
  const [activePersonaIndex, setActivePersonaIndex] = useState(0);
  const [isRtl, setIsRtl] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = isRtl ? 'ar-SA' : 'en-US';
    if (isRtl) {
      document.documentElement.style.fontFamily = "'Cairo', sans-serif";
    } else {
      document.documentElement.style.fontFamily = "system-ui, -apple-system, sans-serif";
    }
  }, [isRtl]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handlePersonaSwitch = useCallback((index: number) => {
    setActivePersonaIndex(index);
  }, []);

  const activePersona = PERSONAS[activePersonaIndex];

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 ${isRtl ? 'font-cairo' : ''}`}>
      
      {/* Top Navigation & Persona Switcher */}
      <header className="bg-[#007B6E] text-white shadow-md relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00C6AE] flex items-center justify-center font-bold text-[#007B6E]">
                A
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                {isRtl ? 'ألو دكتور' : 'ALO DOCTOR'}
                <span className="text-xs font-normal opacity-75 ml-2 align-middle">v2.4</span>
              </h1>
            </div>

            {/* 11 Persona Profile Switcher Compatibility (Showing 5 core clinical profiles) */}
            <nav className="hidden md:flex items-center gap-1" aria-label={isRtl ? 'تبديل الملف الشخصي' : 'Persona Switcher'}>
              {PERSONAS.map((persona, index) => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaSwitch(index)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:ring-offset-2 focus:ring-offset-[#007B6E] ${
                    activePersonaIndex === index
                      ? 'bg-[#00C6AE] text-[#007B6E] shadow-inner'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-current={activePersonaIndex === index ? 'page' : undefined}
                >
                  {isRtl ? persona.nameAr : persona.nameEn}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsRtl(!isRtl)}
                className="p-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C6AE]"
                aria-label={isRtl ? 'Switch to English LTR' : 'التبديل إلى العربية RTL'}
              >
                {isRtl ? 'EN' : 'عر'}
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C6AE]"
                aria-label={isRtl ? 'تبديل المظهر' : 'Toggle Theme'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Header Pinning Above Fold: Case Summary & Milestone HUD */}
      <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            
            {/* Case Identity */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#007B6E] dark:text-[#00C6AE]">
                  {isRtl ? 'رقم الحالة' : 'Case Number'}
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {caseId}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
              <div className="flex flex-col hidden sm:flex">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isRtl ? 'هوية المريض' : 'Patient Identity'}
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {isRtl ? patientNameAr : patientNameEn}
                </span>
              </div>
            </div>

            {/* Active Clinician Context */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E6FAF7] dark:bg-[#007B6E]/20 rounded-full border border-[#00C6AE]/30">
              <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-xs font-bold text-[#007B6E] dark:text-[#00C6AE]">
                {isRtl ? activePersona.roleAr : activePersona.roleEn}: {isRtl ? activePersona.nameAr : activePersona.nameEn}
              </span>
            </div>

            {/* Milestone HUD Container */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {isRtl ? 'الحالة الحالية' : 'Current Milestone'}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm">
                <svg className="w-3.5 h-3.5 text-[#007B6E] dark:text-[#00C6AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {currentMilestone}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer / WhatsApp Integration Hint */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} ALO DOCTOR v2.4 Saudi Edition. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <a
            href="https://wa.me/966500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-bold rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label={isRtl ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {isRtl ? 'دعم واتساب' : 'WhatsApp Support'}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ClinicalCase } from '../types';

export interface PatientPipelineBoardProps {
  isOpen: boolean;
  onClose: () => void;
  cases: ClinicalCase[];
  activeCaseId: string;
  onSelectCase: (caseItem: ClinicalCase, heroPersonaCode: string) => void;
  isAr: boolean;
}

type StageKey =
  | 'INTAKE_RECEIVED'
  | 'NURSE_CHECK'
  | 'DOCTOR_REVIEW'
  | 'AWAITING_PAYMENT'
  | 'WITH_CONSULTANT'
  | 'OPINION_READY'
  | 'PARTNER_SERVICES'
  | 'FOLLOW_UP_21_DAYS'
  | 'CLOSED';

type FilterTab = 'ALL' | 'INTAKE_TRIAGE' | 'MEDICAL_REVIEW' | 'DELIVERY_CARE';

interface StageConfig {
  heroCode: string;
  en: string;
  ar: string;
}

const STAGE_MATRIX: Record<StageKey, StageConfig> = {
  INTAKE_RECEIVED: { heroCode: 'P', en: 'Intake Received', ar: 'تم استلام الطلب' },
  NURSE_CHECK: { heroCode: 'N', en: 'Nurse Check', ar: 'فحص التمريض' },
  DOCTOR_REVIEW: { heroCode: 'D', en: 'Doctor Review', ar: 'مراجعة الطبيب' },
  AWAITING_PAYMENT: { heroCode: 'P', en: 'Awaiting Payment', ar: 'بانتظار الدفع' },
  WITH_CONSULTANT: { heroCode: 'K', en: 'With Consultant', ar: 'مع الاستشاري' },
  OPINION_READY: { heroCode: 'P', en: 'Opinion Ready', ar: 'الرأي جاهز' },
  PARTNER_SERVICES: { heroCode: 'L', en: 'Partner Services', ar: 'خدمات الشركاء' },
  FOLLOW_UP_21_DAYS: { heroCode: 'N', en: '21-Day Follow Up', ar: 'متابعة ٢١ يوم' },
  CLOSED: { heroCode: 'HA', en: 'Closed', ar: 'مغلق' },
};

const FILTER_TABS: { key: FilterTab; en: string; ar: string; stages: StageKey[] }[] = [
  {
    key: 'ALL',
    en: 'All',
    ar: 'الكل',
    stages: Object.keys(STAGE_MATRIX) as StageKey[],
  },
  {
    key: 'INTAKE_TRIAGE',
    en: 'Intake & Triage',
    ar: 'الاستقبال والفرز',
    stages: ['INTAKE_RECEIVED', 'NURSE_CHECK'],
  },
  {
    key: 'MEDICAL_REVIEW',
    en: 'Medical Review',
    ar: 'المراجعة الطبية',
    stages: ['DOCTOR_REVIEW', 'AWAITING_PAYMENT', 'WITH_CONSULTANT', 'OPINION_READY'],
  },
  {
    key: 'DELIVERY_CARE',
    en: 'Delivery & Care',
    ar: 'التسليم والرعاية',
    stages: ['PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'],
  },
];

const HERO_COLORS: Record<string, string> = {
  P: '#007B6E',
  N: '#00C6AE',
  D: '#005C53',
  K: '#009688',
  L: '#25D366',
  H: '#25D366',
  HA: '#4A5568',
};

export const PatientPipelineBoard: React.FC<PatientPipelineBoardProps> = ({
  isOpen,
  onClose,
  cases,
  activeCaseId,
  onSelectCase,
  isAr,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredCases = useMemo(() => {
    if (activeFilter === 'ALL') return cases;
    const allowedStages = FILTER_TABS.find((t) => t.key === activeFilter)?.stages || [];
    return cases.filter((c) => allowedStages.includes(c.currentStage as StageKey));
  }, [cases, activeFilter]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelect = (caseItem: ClinicalCase) => {
    const stageKey = caseItem.currentStage as StageKey;
    const config = STAGE_MATRIX[stageKey];
    const heroCode = config ? config.heroCode : 'P';
    onSelectCase(caseItem, heroCode);
    onClose();
  };

  if (!isOpen) return null;

  const fontStack = isAr
    ? "'Cairo', 'Segoe UI', Tahoma, sans-serif"
    : "'Inter', system-ui, -apple-system, sans-serif";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      style={{ direction: isAr ? 'rtl' : 'ltr', fontFamily: fontStack }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'لوحة مسار المرضى السريري' : 'Clinical Patient Pipeline Board'}
    >
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden outline-none border border-[#E6FAF7]"
        style={{ animation: 'pipeline-fade-in 0.25s ease-out' }}
      >
        <style>{`
          @keyframes pipeline-fade-in {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .pipeline-scrollbar::-webkit-scrollbar { width: 6px; }
          .pipeline-scrollbar::-webkit-scrollbar-track { background: #E6FAF7; border-radius: 3px; }
          .pipeline-scrollbar::-webkit-scrollbar-thumb { background: #00C6AE; border-radius: 3px; }
          .pipeline-scrollbar::-webkit-scrollbar-thumb:hover { background: #007B6E; }
        `}</style>

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#E6FAF7] bg-gradient-to-r from-[#E6FAF7] to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#007B6E] flex items-center justify-center shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#007B6E] leading-tight">
                {isAr ? 'مركز القيادة السريرية' : 'Clinical Command Center'}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {isAr ? 'نظرة عامة على مسار المرضى' : 'Patient Pipeline Overview'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-[#007B6E] hover:bg-[#E6FAF7] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C6AE]"
            aria-label={isAr ? 'إغلاق اللوحة' : 'Close board'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Filter Tabs */}
        <nav className="px-6 py-3 border-b border-[#E6FAF7] bg-white shrink-0" aria-label={isAr ? 'تصفية المراحل' : 'Filter stages'}>
          <div className="flex gap-2 overflow-x-auto pb-1 pipeline-scrollbar">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = tab.key === 'ALL' ? cases.length : cases.filter((c) => tab.stages.includes(c.currentStage as StageKey)).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00C6AE]
                    ${isActive
                      ? 'bg-[#007B6E] text-white shadow-md shadow-[#007B6E]/20'
                      : 'bg-[#E6FAF7] text-[#007B6E] hover:bg-[#00C6AE]/20'
                    }
                  `}
                  aria-pressed={isActive}
                >
                  <span>{isAr ? tab.ar : tab.en}</span>
                  <span
                    className={`
                      min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-xs font-bold
                      ${isActive ? 'bg-white/20 text-white' : 'bg-[#007B6E]/10 text-[#007B6E]'}
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Grid Content */}
        <main className="flex-1 overflow-y-auto p-6 pipeline-scrollbar bg-gray-50/50">
          {filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm font-medium">
                {isAr ? 'لا توجد حالات في هذا التصنيف' : 'No cases in this filter'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCases.map((caseItem) => {
                const stageKey = caseItem.currentStage as StageKey;
                const stageConfig = STAGE_MATRIX[stageKey] || STAGE_MATRIX.INTAKE_RECEIVED;
                const isActive = caseItem.id === activeCaseId;
                const heroColor = HERO_COLORS[stageConfig.heroCode] || '#007B6E';

                return (
                  <article
                    key={caseItem.id}
                    className={`
                      relative group bg-white rounded-xl border-2 p-4 transition-all duration-200 flex flex-col
                      ${isActive
                        ? 'border-[#007B6E] shadow-lg shadow-[#007B6E]/10 ring-1 ring-[#007B6E]'
                        : 'border-[#E6FAF7] hover:border-[#00C6AE] hover:shadow-md'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#25D366]" />
                        </span>
                      </div>
                    )}

                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                        style={{ backgroundColor: heroColor }}
                        title={`${isAr ? 'البطل:' : 'Hero:'} ${stageConfig.heroCode}`}
                      >
                        {stageConfig.heroCode}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate leading-tight">
                          {caseItem.patientName || (isAr ? 'مريض غير معروف' : 'Unknown Patient')}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          #{caseItem.id.substring(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Stage Matrix Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#E6FAF7] text-[#007B6E] border border-[#00C6AE]/20">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isAr ? 'ml-1' : 'mr-1'} aria-hidden="true">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        {isAr ? stageConfig.ar : stageConfig.en}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-auto pt-3 border-t border-[#E6FAF7] flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                        {isAr ? 'مرحلة الأنبوب' : 'Pipeline Stage'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(caseItem);
                        }}
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00C6AE]
                          ${isActive
                            ? 'bg-[#007B6E] text-white cursor-default'
                            : 'bg-[#E6FAF7] text-[#007B6E] hover:bg-[#007B6E] hover:text-white active:scale-95'
                          }
                        `}
                        aria-label={isAr ? `فتح حالة ${caseItem.patientName}` : `Open case for ${caseItem.patientName}`}
                        disabled={isActive}
                      >
                        {isActive ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {isAr ? 'نشط' : 'Active'}
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M15 3h6v6" />
                              <path d="M10 14L21 3" />
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            </svg>
                            {isAr ? 'انتقال' : 'Jump In'}
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-[#E6FAF7] bg-white flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-400 font-medium">
            {isAr
              ? `إجمالي الحالات: ${cases.length} | المعروضة: ${filteredCases.length}`
              : `Total Cases: ${cases.length} | Showing: ${filteredCases.length}`
            }
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="text-xs font-semibold text-[#007B6E]">
              {isAr ? 'متصل مباشرة' : 'Live Sync'}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PatientPipelineBoard;
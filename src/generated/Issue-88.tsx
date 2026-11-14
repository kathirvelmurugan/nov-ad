import React from 'react';
import { Building2, X } from 'lucide-react';

export type TabType = 'journey' | 'clinical' | 'opinions' | 'followup' | 'facility';

export interface CaseItem {
  id: string;
  age?: number;
  gender?: string;
  [key: string]: any;
}

export interface DrillDownHeaderTab {
  id: TabType;
  labelEn: string;
  labelAr: string;
  icon: React.ReactNode;
}

export interface DrillDownHeaderProps {
  caseItem: CaseItem;
  lang: 'ar' | 'en';
  patientName: string;
  hospitalName: string;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onClose: () => void;
  tabs: DrillDownHeaderTab[];
}

const DrillDownHeader: React.FC<DrillDownHeaderProps> = ({
  caseItem,
  lang,
  patientName,
  hospitalName,
  activeTab,
  setActiveTab,
  onClose,
  tabs,
}) => {
  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const fontFamily = isRtl ? 'font-[Cairo]' : 'font-sans';

  const formatGender = (gender?: string): string => {
    if (!gender) return '';
    if (isRtl) {
      return gender.toLowerCase() === 'male' ? 'ذكر' : gender.toLowerCase() === 'female' ? 'أنثى' : gender;
    }
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  const ageGenderDisplay = [
    caseItem.age != null ? `${caseItem.age} ${isRtl ? 'سنة' : 'yrs'}` : null,
    formatGender(caseItem.gender),
  ]
    .filter(Boolean)
    .join(isRtl ? ' • ' : ' • ');

  return (
    <div dir={dir} className={`w-full ${fontFamily}`}>
      {/* Top Banner */}
      <div className="relative flex items-start justify-between bg-gradient-to-r from-[#007B6E] to-[#00C6AE] p-5 text-white rounded-t-xl">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {/* Case ID Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide border border-white/30">
              {isRtl ? 'حالة' : 'Case'} #{caseItem.id}
            </span>
          </div>

          {/* Patient Info */}
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold truncate leading-tight" title={patientName}>
              {patientName}
            </h2>
            {ageGenderDisplay && (
              <span className="text-sm text-white/80 font-medium">{ageGenderDisplay}</span>
            )}
          </div>

          {/* Hospital Info */}
          <div className="flex items-center gap-2 text-sm text-white/90 mt-1">
            <Building2 className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
            <span className="truncate font-medium" title={hospitalName}>
              {hospitalName}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={isRtl ? 'إغلاق' : 'Close'}
          className="shrink-0 p-2 rounded-lg hover:bg-white/20 focus:bg-white/20 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 -mt-1 -mr-1 rtl:-ml-1 rtl:-mr-0"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation Tab Bar */}
      <nav
        className="flex overflow-x-auto scrollbar-hide bg-[#E6FAF7] border-b border-[#007B6E]/10 px-2"
        role="tablist"
        aria-label={isRtl ? 'تبويبات تفاصيل الحالة' : 'Case details tabs'}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const label = isRtl ? tab.labelAr : tab.labelEn;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`drilldown-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`drilldown-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap
                transition-all duration-200 ease-in-out shrink-0
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007B6E] focus-visible:ring-inset rounded-md
                ${
                  isActive
                    ? 'text-[#007B6E]'
                    : 'text-[#007B6E]/50 hover:text-[#007B6E]/80 hover:bg-[#007B6E]/5'
                }
              `}
            >
              <span
                className={`w-4 h-4 shrink-0 ${isActive ? 'opacity-100' : 'opacity-60'}`}
                aria-hidden="true"
              >
                {tab.icon}
              </span>
              <span>{label}</span>

              {/* Active Indicator Border */}
              {isActive && (
                <span
                  className="absolute bottom-0 inset-x-2 h-[3px] bg-[#007B6E] rounded-t-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DrillDownHeader;
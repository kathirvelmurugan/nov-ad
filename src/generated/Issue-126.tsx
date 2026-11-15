import React, { useState, useMemo } from 'react';
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Activity } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  milestoneId: string;
  actorName: string;
  actorRole: string;
  actionSummaryAr: string;
  actionSummaryEn: string;
  timestamp: string;
}

export interface MilestoneDefinition {
  id: string;
  labelAr: string;
  labelEn: string;
  pendingRoleAr: string;
  pendingRoleEn: string;
}

export interface ClinicalCase {
  caseId: string;
  patientName?: string;
  status: string;
  currentMilestoneId: string;
  timeline: TimelineEvent[];
}

export interface CaseMilestoneHUDProps {
  activeCase?: ClinicalCase | null;
  lang?: 'ar' | 'en';
  isRTL?: boolean;
  className?: string;
}

const MILESTONES: MilestoneDefinition[] = [
  {
    id: 'M01',
    labelAr: 'تسجيل الحالة والموافقة',
    labelEn: 'Case Registered',
    pendingRoleAr: 'المريض',
    pendingRoleEn: 'Patient',
  },
  {
    id: 'M02',
    labelAr: 'الفرز السريري التمريضي',
    labelEn: 'Clinical Triage',
    pendingRoleAr: 'الممرض/ة',
    pendingRoleEn: 'Nurse',
  },
  {
    id: 'M03',
    labelAr: 'اعتماد الطبيب السعودي',
    labelEn: 'Doctor Endorsement',
    pendingRoleAr: 'الطبيب',
    pendingRoleEn: 'Doctor',
  },
  {
    id: 'M04',
    labelAr: 'التحقق والسداد',
    labelEn: 'Financial Clearance',
    pendingRoleAr: 'المنسق',
    pendingRoleEn: 'Coordinator',
  },
  {
    id: 'M05',
    labelAr: 'الرأي الطبي الاستشاري',
    labelEn: 'Second Opinion Ready',
    pendingRoleAr: 'الاستشاري',
    pendingRoleEn: 'Consultant',
  },
];

const formatTimeAST = (isoString: string, lang: 'ar' | 'en'): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Riyadh',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    if (lang === 'ar') {
      return new Intl.DateTimeFormat('ar-SA', options).format(date);
    }
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return '--:--';
  }
};

const scrubName = (name: string): string => {
  if (!name) return '';
  return name.trim();
};

export const CaseMilestoneHUD: React.FC<CaseMilestoneHUDProps> = ({
  activeCase,
  lang = 'ar',
  isRTL = true,
  className = '',
}) => {
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);

  const isAr = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  const completedEventsMap = useMemo(() => {
    const map = new Map<string, TimelineEvent>();
    if (activeCase?.timeline) {
      activeCase.timeline.forEach((event) => {
        if (!map.has(event.milestoneId)) {
          map.set(event.milestoneId, event);
        }
      });
    }
    return map;
  }, [activeCase?.timeline]);

  const currentMilestoneIndex = useMemo(() => {
    if (!activeCase) return -1;
    return MILESTONES.findIndex((m) => m.id === activeCase.currentMilestoneId);
  }, [activeCase?.currentMilestoneId]);

  const auditCount = activeCase?.timeline?.length || 0;

  const getStepState = (index: number): 'completed' | 'active' | 'upcoming' => {
    if (!activeCase) return 'upcoming';
    if (completedEventsMap.has(MILESTONES[index].id)) return 'completed';
    if (index === currentMilestoneIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div
      dir={dir}
      className={`font-cairo w-full ${className}`}
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <style>{`
        @keyframes alo-pulse-teal {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 198, 174, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(0, 198, 174, 0); }
        }
        .animate-alo-pulse {
          animation: alo-pulse-teal 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E6FAF7] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6FAF7] bg-[#E6FAF7]/30 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#007B6E] flex items-center gap-2">
            <Activity size={20} className="text-[#00C6AE]" />
            {isAr ? 'مستجدات الحالة السريرية' : 'Clinical Case Milestones'}
          </h2>
          {activeCase && (
            <span className="text-xs font-mono bg-white px-3 py-1 rounded-full border border-[#00C6AE] text-[#007B6E]">
              {activeCase.caseId}
            </span>
          )}
        </div>

        {/* Stepper */}
        <div className="p-6">
          <div className="relative flex flex-col gap-0">
            {MILESTONES.map((milestone, index) => {
              const state = getStepState(index);
              const completionEvent = completedEventsMap.get(milestone.id);
              const isLast = index === MILESTONES.length - 1;

              return (
                <div key={milestone.id} className="relative flex gap-4">
                  {/* Vertical Line Connector */}
                  {!isLast && (
                    <div
                      className={`absolute top-10 ${isRTL ? 'right-[19px]' : 'left-[19px]'} w-[2px] h-[calc(100%-16px)] z-0 ${
                        state === 'completed' ? 'bg-[#007B6E]' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Icon Node */}
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    {state === 'completed' && (
                      <div className="w-10 h-10 rounded-full bg-[#007B6E] flex items-center justify-center shadow-md">
                        <CheckCircle2 size={22} className="text-white" />
                      </div>
                    )}
                    {state === 'active' && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C6AE] to-[#007B6E] flex items-center justify-center animate-alo-pulse border-2 border-white shadow-lg">
                        <Clock size={20} className="text-white" />
                      </div>
                    )}
                    {state === 'upcoming' && (
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-slate-400 font-bold text-sm">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 pb-8">
                    <div
                      className={`rounded-xl p-4 transition-all duration-300 border ${
                        state === 'completed'
                          ? 'bg-[#f0fdf4] border-[#007B6E] text-[#065f46]'
                          : state === 'active'
                          ? 'bg-[#E6FAF7] border-[#00C6AE] text-[#007B6E] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono opacity-60">{milestone.id}</span>
                          <h3 className="font-bold text-base">
                            {isAr ? milestone.labelAr : milestone.labelEn}
                          </h3>
                        </div>

                        {state === 'active' && (
                          <span className="text-xs font-semibold bg-[#00C6AE]/20 text-[#007B6E] px-3 py-1 rounded-full whitespace-nowrap">
                            {isAr
                              ? `قيد الإجراء • بانتظار ${milestone.pendingRoleAr}`
                              : `In Progress • Pending ${milestone.pendingRoleEn}`}
                          </span>
                        )}
                      </div>

                      {state === 'completed' && completionEvent && (
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                          <span className="inline-flex items-center gap-1.5 bg-white border border-[#007B6E]/30 px-3 py-1 rounded-full font-semibold text-[#065f46] shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C6AE]" />
                            {scrubName(completionEvent.actorName)}
                          </span>
                          <span className="text-[#065f46]/80 font-medium flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimeAST(completionEvent.timestamp, lang)}
                          </span>
                          <span className="text-xs text-[#065f46]/60 bg-[#007B6E]/5 px-2 py-0.5 rounded">
                            {isAr ? completionEvent.actorRole : completionEvent.actorRole}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Trail Drawer Toggle */}
        <div className="border-t border-[#E6FAF7] bg-slate-50/50">
          <button
            type="button"
            onClick={() => setIsAuditOpen(!isAuditOpen)}
            disabled={!activeCase || auditCount === 0}
            className={`w-full px-6 py-4 flex items-center justify-between text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C6AE] focus-visible:ring-offset-2 ${
              !activeCase || auditCount === 0
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-[#007B6E] hover:bg-[#E6FAF7] cursor-pointer'
            }`}
            aria-expanded={isAuditOpen}
            aria-controls="alo-audit-trail-drawer"
          >
            <span className="flex items-center gap-2">
              <Activity size={16} />
              {isAr
                ? `سجل العمليات والتدقيق (${auditCount} إجراء)`
                : `Audit Trail (${auditCount} events)`}
            </span>
            {isAuditOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* Collapsible Audit Drawer */}
          <div
            id="alo-audit-trail-drawer"
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isAuditOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            }`}
            role="region"
            aria-label={isAr ? 'سجل التدقيق' : 'Audit Trail'}
          >
            <div className="px-6 pb-6 max-h-[400px] overflow-y-auto custom-scrollbar">
              {activeCase?.timeline && activeCase.timeline.length > 0 ? (
                <div className="space-y-3">
                  {[...activeCase.timeline].reverse().map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-[#00C6AE]/40 transition-colors"
                    >
                      <div className="flex-shrink-0 w-16 text-center sm:text-left">
                        <span className="text-xs font-mono bg-[#E6FAF7] text-[#007B6E] px-2 py-1 rounded-md border border-[#00C6AE]/20">
                          {event.milestoneId}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                          {isAr ? event.actionSummaryAr : event.actionSummaryEn}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-[#007B6E] bg-[#E6FAF7] px-2 py-0.5 rounded">
                            {scrubName(event.actorName)}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-600 font-medium">{event.actorRole}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end gap-1.5 pt-1">
                        <span className="text-xs font-medium text-slate-500 tabular-nums">
                          {formatTimeAST(event.timestamp, lang)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 truncate max-w-[140px]">
                          {event.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-400">
                  {isAr ? 'لا توجد سجلات تدقيق متاحة.' : 'No audit trail events available.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseMilestoneHUD;
import React, { useState, useMemo } from 'react';
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Activity, ShieldCheck, User } from 'lucide-react';
import { ClinicalCase, ActivityLogEntry } from '../../types';

export interface CaseMilestoneHUDProps {
  activeCase?: ClinicalCase | null;
  lang?: 'ar' | 'en';
  isRTL?: boolean;
  className?: string;
}

export interface MilestoneDefinition {
  id: string;
  stageTrigger: string[];
  labelAr: string;
  labelEn: string;
  pendingRoleAr: string;
  pendingRoleEn: string;
}

const MILESTONES: MilestoneDefinition[] = [
  {
    id: 'M01',
    stageTrigger: ['INTAKE_RECEIVED'],
    labelAr: 'تسجيل الحالة والموافقة',
    labelEn: 'Case Registered',
    pendingRoleAr: 'المريض',
    pendingRoleEn: 'Patient',
  },
  {
    id: 'M02',
    stageTrigger: ['NURSE_CHECK'],
    labelAr: 'الفرز السريري التمريضي',
    labelEn: 'Clinical Triage',
    pendingRoleAr: 'ممرضة ألو',
    pendingRoleEn: 'ALO Nurse',
  },
  {
    id: 'M03',
    stageTrigger: ['DOCTOR_REVIEW'],
    labelAr: 'اعتماد الطبيب السعودي',
    labelEn: 'Doctor Endorsement',
    pendingRoleAr: 'الطبيب المعالج',
    pendingRoleEn: 'Treating Doctor',
  },
  {
    id: 'M04',
    stageTrigger: ['AWAITING_PAYMENT', 'WITH_CONSULTANT'],
    labelAr: 'التحقق المالي والإرسال',
    labelEn: 'Financial Clearance & Dispatch',
    pendingRoleAr: 'منسق رعاية ألو',
    pendingRoleEn: 'ALO Coordinator',
  },
  {
    id: 'M05',
    stageTrigger: ['OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'],
    labelAr: 'صدور الرأي الطبي الاستشاري',
    labelEn: 'Second Opinion Released',
    pendingRoleAr: 'الاستشاري الدولي',
    pendingRoleEn: 'International Consultant',
  },
];

const formatTimeAST = (isoString?: string, lang: 'ar' | 'en' = 'ar'): string => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Riyadh',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', options).format(date);
  } catch {
    return '--:--';
  }
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
    const map = new Map<string, ActivityLogEntry>();
    if (activeCase?.timeline && Array.isArray(activeCase.timeline)) {
      activeCase.timeline.forEach((event) => {
        if (event.actionCode && !map.has(event.actionCode)) {
          map.set(event.actionCode, event);
        }
      });
    }
    return map;
  }, [activeCase?.timeline]);

  const currentStage = activeCase?.currentStage || 'INTAKE_RECEIVED';

  const getStepState = (milestone: MilestoneDefinition, index: number): 'completed' | 'active' | 'upcoming' => {
    if (!activeCase) return 'upcoming';
    if (completedEventsMap.has(milestone.id)) return 'completed';

    // Map stages sequentially
    const stageOrder: Record<string, number> = {
      INTAKE_RECEIVED: 0,
      NURSE_CHECK: 1,
      DOCTOR_REVIEW: 2,
      AWAITING_PAYMENT: 3,
      WITH_CONSULTANT: 3,
      OPINION_READY: 4,
      PARTNER_SERVICES: 4,
      FOLLOW_UP_21_DAYS: 4,
      CLOSED: 4,
    };

    const currentOrder = stageOrder[currentStage] ?? 0;
    if (index < currentOrder) return 'completed';
    if (index === currentOrder) return 'active';
    return 'upcoming';
  };

  const auditEvents = activeCase?.timeline || [];

  return (
    <div
      id="case-milestone-hud"
      dir={dir}
      className={`font-cairo w-full mb-6 ${className}`}
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-[#00C6AE]/30 overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#00C6AE]/20 bg-[#E6FAF7]/40 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#007B6E] flex items-center justify-center text-white shadow-sm">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#007B6E] dark:text-[#00C6AE]">
                {isAr ? 'مسار المعالم السريرية والشفافية المعتمدة' : 'Clinical Milestone & Transparency HUD'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'توثيق فوري لكافة محطات الحالة السريرية بالوقت والتاريخ'
                  : 'Immutable stage-by-stage audit timestamps across all care personas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeCase?.caseNumber && (
              <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-[#00C6AE] text-[#007B6E] dark:text-[#00C6AE]">
                {activeCase.caseNumber}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsAuditOpen(!isAuditOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#007B6E] dark:text-[#00C6AE] bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-[#E6FAF7] transition-colors cursor-pointer"
            >
              <span>{isAr ? `سجل التدقيق (${auditEvents.length})` : `Audit Ledger (${auditEvents.length})`}</span>
              {isAuditOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* 5-Step Horizontal Stepper Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          {MILESTONES.map((m, idx) => {
            const state = getStepState(m, idx);
            const event = completedEventsMap.get(m.id);
            const timeDisplay = event?.formattedTimeAr || formatTimeAST(event?.timestamp, lang);

            return (
              <div
                key={m.id}
                className={`relative rounded-xl p-3 border transition-all duration-200 flex flex-col justify-between ${
                  state === 'completed'
                    ? 'bg-[#f0fdf4] dark:bg-emerald-950/20 border-[#007B6E] text-emerald-900 dark:text-emerald-300'
                    : state === 'active'
                    ? 'bg-[#E6FAF7] dark:bg-teal-950/30 border-[#00C6AE] animate-alo-pulse text-[#007B6E] dark:text-[#00C6AE]'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
                    {m.id}
                  </span>
                  {state === 'completed' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#007B6E] dark:text-emerald-400">
                      <CheckCircle2 size={14} />
                      {isAr ? 'مكتمل' : 'Done'}
                    </span>
                  )}
                  {state === 'active' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#00C6AE]">
                      <Clock size={14} />
                      {isAr ? 'قيد الإجراء' : 'Active'}
                    </span>
                  )}
                  {state === 'upcoming' && (
                    <span className="text-[11px] font-bold opacity-60">
                      #{idx + 1}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold leading-tight mb-1">
                    {isAr ? m.labelAr : m.labelEn}
                  </h3>

                  {state === 'completed' && (
                    <div className="text-[11px] mt-1 space-y-0.5">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {event?.actorName || (isAr ? m.pendingRoleAr : m.pendingRoleEn)}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        ⏰ {timeDisplay}
                      </p>
                    </div>
                  )}

                  {state === 'active' && (
                    <p className="text-[11px] text-[#007B6E] dark:text-[#00C6AE] font-semibold mt-1">
                      {isAr ? `بانتظار: ${m.pendingRoleAr}` : `Pending: ${m.pendingRoleEn}`}
                    </p>
                  )}

                  {state === 'upcoming' && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isAr ? m.pendingRoleAr : m.pendingRoleEn}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Audit Trail Drawer */}
        {isAuditOpen && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#007B6E]" />
              {isAr ? 'السجل الزمني للعمليات وتدقيق المراحل' : 'Chronological Audit Log of Stage Operations'}
            </h4>
            {auditEvents.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                {isAr ? 'لا توجد إجراءات مسجلة بعد لهذه الحالة.' : 'No recorded activity logs for this case yet.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {auditEvents.map((evt, eIdx) => (
                  <div
                    key={evt.id || eIdx}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E6FAF7] text-[#007B6E] flex items-center justify-center font-bold text-[10px]">
                        {evt.actorRole || 'P'}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {evt.actorName}
                        </span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {isAr ? evt.actionSummaryAr : evt.actionSummaryEn}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                      {evt.formattedTimeAr || evt.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseMilestoneHUD;

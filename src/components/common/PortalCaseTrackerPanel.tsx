import React, { useState, useMemo, useEffect } from 'react';
import { ClinicalCase, ClinicalStage } from '../../types';
import { Activity, Clock, CheckCircle2, CreditCard, Eye, ChevronDown, ChevronUp, Search } from 'lucide-react';

export interface PortalCaseTrackerPanelProps {
  cases: ClinicalCase[];
  activeCaseId?: string;
  onSelectCase?: (caseId: string) => void;
  lang: 'ar' | 'en';
  portalTitleAr: string;
  portalTitleEn: string;
  actionablePredicate: (c: ClinicalCase) => boolean;
}

export function getStageBadgeMeta(stage: ClinicalStage, isAr: boolean): { label: string; colorClass: string } {
  switch (stage) {
    case 'INTAKE_RECEIVED':
      return {
        label: isAr ? '1. استلام الطلب' : '1. Intake',
        colorClass: 'bg-[#E6FAF7] text-[#007B6E] dark:bg-slate-800 dark:text-[#00C6AE]',
      };
    case 'NURSE_CHECK':
      return {
        label: isAr ? '2. فرز التمريض' : '2. Nurse Triage',
        colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      };
    case 'DOCTOR_REVIEW':
      return {
        label: isAr ? '3. الطبيب السعودي' : '3. Saudi Doctor',
        colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      };
    case 'AWAITING_PAYMENT':
      return {
        label: isAr ? '4. بانتظار الدفع' : '4. Awaiting Payment',
        colorClass: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      };
    case 'WITH_CONSULTANT':
      return {
        label: isAr ? '5. الاستشاري الدولي' : '5. Indian Consultant',
        colorClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      };
    case 'OPINION_READY':
      return {
        label: isAr ? '6. الرأي جاهز' : '6. Opinion Ready',
        colorClass: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      };
    case 'PARTNER_SERVICES':
      return {
        label: isAr ? '7. إصدار التقرير' : '7. Report Release',
        colorClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      };
    case 'FOLLOW_UP_21_DAYS':
      return {
        label: isAr ? '8. متابعة 21 يوماً' : '8. 21-Day Follow-Up',
        colorClass: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      };
    case 'CLOSED':
      return {
        label: isAr ? '9. مغلق' : '9. Closed',
        colorClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      };
    default:
      return {
        label: isAr ? 'غير معروف' : 'Unknown',
        colorClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      };
  }
}

const PortalCaseTrackerPanel: React.FC<PortalCaseTrackerPanelProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  lang,
  portalTitleAr,
  portalTitleEn,
  actionablePredicate,
}) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const validCases = useMemo(
    () => cases.filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0)),
    [cases]
  );

  const actionableCases = useMemo(
    () => validCases.filter(actionablePredicate),
    [validCases, actionablePredicate]
  );

  const [tab, setTab] = useState<'actionable' | 'all'>(
    actionableCases.length > 0 ? 'actionable' : 'all'
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (actionableCases.length === 0 && validCases.length > 0) {
      setTab('all');
    }
  }, [actionableCases.length, validCases.length]);

  if (validCases.length === 0) {
    return null;
  }

  const displayedCases = tab === 'actionable' ? actionableCases : validCases;
  const filteredCases = displayedCases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const num = (c.caseNumber || c.id || '').toLowerCase();
    const pName = (c.patientName || (c as any).patientNameAr || (c as any).patientNameEn || '').toLowerCase();
    const spec = (c.specialty || (c as any).specialtyAr || (c as any).specialtyEn || '').toLowerCase();
    return num.includes(q) || pName.includes(q) || spec.includes(q);
  });
  const activeCase = activeCaseId ? validCases.find((c) => c.id === activeCaseId) : undefined;
  const title = isAr ? portalTitleAr : portalTitleEn;

  const getPaymentPill = (c: ClinicalCase) => {
    const anyC = c as any;
    const isVerified = anyC.paymentVerified || anyC.metadata?.paymentVerified;
    const isPaidPending = anyC.pricing?.paid || anyC.paymentDetails?.status === 'completed';
    const isInvoiceSent = anyC.invoiceIssued;

    if (isVerified) {
      return {
        label: isAr ? 'مدفوع ومؤكد' : 'Paid & Verified',
        className: 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20',
        Icon: CheckCircle2,
      };
    }
    if (isPaidPending) {
      return {
        label: isAr ? 'مدفوع · بانتظار التحقق' : 'Paid · Pending Verify',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
        Icon: CreditCard,
      };
    }
    if (isInvoiceSent) {
      return {
        label: isAr ? 'تم إرسال الفاتورة' : 'Invoice Sent',
        className: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
        Icon: CreditCard,
      };
    }
    return {
      label: isAr ? 'قبل الدفع' : 'Pre-Payment',
      className: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      Icon: Clock,
    };
  };

  return (
    <div
      dir={dir}
      className="w-full h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm font-['Cairo',sans-serif]"
    >
      {/* Header with Case Overview & Collapse Toggle */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-[#E6FAF7] dark:bg-slate-900/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-4 h-4 text-[#007B6E] shrink-0" />
          <h2 className="text-sm font-bold text-[#007B6E] dark:text-[#00C6AE] truncate">
            {title}
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#007B6E]/10 text-[#007B6E] dark:bg-[#00C6AE]/20 dark:text-[#00C6AE]">
            {cases.length}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeCase && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeCase.caseNumber || activeCase.id}</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#007B6E] hover:text-[#005a50] bg-white hover:bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#00C6AE]/40 transition-all cursor-pointer shadow-2xs"
            aria-label={isCollapsed ? (isAr ? 'عرض القائمة' : 'Expand queue') : (isAr ? 'طي القائمة' : 'Collapse queue')}
          >
            <span>{isCollapsed ? (isAr ? 'عرض الحالات' : 'Expand') : (isAr ? 'طي القائمة' : 'Collapse')}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={() => setTab('actionable')}
              className={`flex-1 px-3 py-2 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                tab === 'actionable'
                  ? 'text-[#007B6E] dark:text-[#00C6AE] border-b-2 border-[#007B6E] dark:border-[#00C6AE] bg-white dark:bg-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:text-[#007B6E] dark:hover:text-[#00C6AE] hover:bg-white dark:hover:bg-slate-900'
              }`}
              aria-selected={tab === 'actionable'}
              role="tab"
            >
              <Clock className="w-3.5 h-3.5" />
              {isAr ? 'قائمة الإجراءات' : 'Actionable Queue'}
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                  tab === 'actionable'
                    ? 'bg-[#007B6E] text-white dark:bg-[#00C6AE] dark:text-slate-900'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {actionableCases.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`flex-1 px-3 py-2 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                tab === 'all'
                  ? 'text-[#007B6E] dark:text-[#00C6AE] border-b-2 border-[#007B6E] dark:border-[#00C6AE] bg-white dark:bg-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:text-[#007B6E] dark:hover:text-[#00C6AE] hover:bg-white dark:hover:bg-slate-900'
              }`}
              aria-selected={tab === 'all'}
              role="tab"
            >
              <Eye className="w-3.5 h-3.5" />
              {isAr ? 'تتبع جميع الحالات' : 'Track All Cases'}
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                  tab === 'all'
                    ? 'bg-[#007B6E] text-white dark:bg-[#00C6AE] dark:text-slate-900'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {cases.length}
              </span>
            </button>
          </div>

          {/* Quick Search Bar when multiple cases exist */}
          {displayedCases.length > 3 && (
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث برقم الحالة أو اسم المريض...' : 'Filter by case # or patient name...'}
                  className="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-[#007B6E]"
                />
              </div>
            </div>
          )}

          {/* Case List (Max Height with Independent Clean Scroll) */}
          <div className="max-h-[220px] overflow-y-auto p-2 space-y-2 bg-white dark:bg-slate-900 scrollbar-thin">
            {filteredCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-600">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">
                  {isAr ? 'لا توجد حالات تطابق البحث' : 'No cases matching search'}
                </p>
              </div>
            ) : (
              filteredCases.map((c) => {
                const isActive = c.id === activeCaseId;
            const isActionable = actionablePredicate(c);
            const stageMeta = getStageBadgeMeta(c.currentStage, isAr);
            const paymentPill = getPaymentPill(c);
            const patientName = isAr
              ? (c as any).patientNameAr || c.patientName
              : (c as any).patientNameEn || c.patientName;
            const specialty = isAr
              ? (c as any).specialtyAr || (c as any).specialty
              : (c as any).specialtyEn || (c as any).specialty;
            const caseIdentifier = (c as any).caseNumber || c.id;
            const PaymentIcon = paymentPill.Icon;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCase?.(c.id)}
                className={`w-full text-start p-3 rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C6AE] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  isActive
                    ? 'border-[#007B6E] ring-2 ring-[#007B6E]/30 bg-[#E6FAF7] dark:bg-[#007B6E]/10 dark:border-[#00C6AE] dark:ring-[#00C6AE]/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00C6AE]/50 hover:bg-[#E6FAF7]/30 dark:hover:bg-slate-800/50 dark:hover:border-[#00C6AE]/30'
                }`}
                aria-label={`${caseIdentifier} - ${patientName}`}
                aria-current={isActive ? 'true' : undefined}
              >
                {/* Top Row: Case Number + Actionable Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
                    dir="ltr"
                  >
                    {caseIdentifier}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActionable
                        ? 'bg-[#007B6E]/10 text-[#007B6E] dark:bg-[#00C6AE]/15 dark:text-[#00C6AE]'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isActionable ? (
                      <>
                        <Activity className="w-3 h-3" />
                        {isAr ? 'بانتظار إجراءك' : 'Action Needed'}
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        {isAr ? 'تتبع' : 'Tracking'}
                      </>
                    )}
                  </span>
                </div>

                {/* Patient Name */}
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 truncate">
                  {patientName || (isAr ? 'مريض غير معروف' : 'Unknown Patient')}
                </p>

                {/* Specialty */}
                {specialty && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 truncate">
                    {specialty}
                  </p>
                )}

                {/* Bottom Row: Stage Badge + Payment Pill */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded-md ${stageMeta.colorClass}`}
                  >
                    {stageMeta.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md ${paymentPill.className}`}
                  >
                    <PaymentIcon className="w-3 h-3" />
                    {paymentPill.label}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  )}
</div>
  );
};

export { PortalCaseTrackerPanel };
export default PortalCaseTrackerPanel;
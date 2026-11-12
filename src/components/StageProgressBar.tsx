import React from 'react';
import { ClinicalStage } from '../types';
import { 
  FileCheck2, 
  Stethoscope, 
  CreditCard, 
  Globe2, 
  FileText, 
  Layers, 
  MessageSquare, 
  CheckCircle,
  Clock
} from 'lucide-react';

interface Props {
  currentStage: ClinicalStage;
  onSetStage?: (stage: ClinicalStage) => void;
  lang?: 'ar' | 'en';
  readOnly?: boolean;
}

interface StageStep {
  key: ClinicalStage;
  num: number;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
}

const STAGES: StageStep[] = [
  { key: 'INTAKE_RECEIVED', num: 1, labelAr: '1. استلام وتفويض', labelEn: '1. Intake received', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
  { key: 'NURSE_CHECK', num: 2, labelAr: '2. فرز التمريض', labelEn: '2. Nurse check', icon: <Clock className="w-3.5 h-3.5" /> },
  { key: 'DOCTOR_REVIEW', num: 3, labelAr: '3. مراجعة الطبيب السعودي', labelEn: '3. Saudi Doctor review', icon: <Stethoscope className="w-3.5 h-3.5" /> },
  { key: 'AWAITING_PAYMENT', num: 4, labelAr: '4. سداد الباقة (Tap)', labelEn: '4. Payment (Tier 1/2)', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { key: 'WITH_CONSULTANT', num: 5, labelAr: '5. الاستشاري الهندي', labelEn: '5. Indian consultant', icon: <Globe2 className="w-3.5 h-3.5" /> },
  { key: 'OPINION_READY', num: 6, labelAr: '6. مكالمة الاستشارة والمترجمة', labelEn: '6. Opinion ready', icon: <FileText className="w-3.5 h-3.5" /> },
  { key: 'PARTNER_SERVICES', num: 7, labelAr: '7. إصدار التقرير (PDF 1)', labelEn: '7. Release Report (PDF 1)', icon: <Layers className="w-3.5 h-3.5" /> },
  { key: 'FOLLOW_UP_21_DAYS', num: 8, labelAr: '8. متابعة 21 يوماً', labelEn: '8. Follow-up 21 days', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { key: 'CLOSED', num: 9, labelAr: '9. إغلاق والحفظ (PDF 2)', labelEn: '9. Case closed', icon: <CheckCircle className="w-3.5 h-3.5" /> },
];

export const StageProgressBar: React.FC<Props> = ({ currentStage, onSetStage, lang = 'ar', readOnly = false }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const isAr = lang === 'ar';

  return (
    <div
      className="bg-white/80 dark:bg-alo-darkCard/80 border-b border-slate-200/80 dark:border-alo-darkBorder px-4 py-2.5 transition-colors"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-thin pb-1">
        {STAGES.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          const baseClasses = `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shadow-sm`;
          
          const stateClasses = isCurrent
            ? 'bg-[#E6FAF7] text-[#007B6E] border border-[#00C6AE] dark:bg-[#007B6E]/20 dark:text-[#00C6AE] dark:border-[#007B6E] font-extrabold ring-1 ring-[#00C6AE]/40'
            : isPassed
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-50 text-slate-500 hover:text-slate-800 dark:bg-slate-900/40 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800';

          const interactiveClasses = !readOnly ? 'cursor-pointer active:scale-95' : 'cursor-default select-none';

          const combinedClasses = `${baseClasses} ${stateClasses} ${interactiveClasses}`;

          const content = (
            <>
              <span>{step.icon}</span>
              <span>{isAr ? step.labelAr : step.labelEn}</span>
              {isPassed && <span className="text-[10px] text-[#007B6E] dark:text-[#00C6AE]">✓</span>}
            </>
          );

          if (readOnly) {
            return (
              <div
                key={step.key}
                className={combinedClasses}
                aria-current={isCurrent ? 'step' : undefined}
                role="listitem"
              >
                {content}
              </div>
            );
          }

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onSetStage?.(step.key)}
              className={combinedClasses}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};
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
  onSetStage: (stage: ClinicalStage) => void;
}

interface StageStep {
  key: ClinicalStage;
  num: number;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
}

const STAGES: StageStep[] = [
  { key: 'INTAKE_RECEIVED', num: 1, labelAr: 'استلام الحالة', labelEn: 'Intake Received', icon: <FileCheck2 className="w-4 h-4" /> },
  { key: 'NURSE_CHECK', num: 2, labelAr: 'تدقيق التمريض', labelEn: 'Nurse Check', icon: <Clock className="w-4 h-4" /> },
  { key: 'DOCTOR_REVIEW', num: 3, labelAr: 'مراجعة الطبيب السعودي', labelEn: 'Doctor Review', icon: <Stethoscope className="w-4 h-4" /> },
  { key: 'AWAITING_PAYMENT', num: 4, labelAr: 'بانتظار الدفع', labelEn: 'Awaiting Payment', icon: <CreditCard className="w-4 h-4" /> },
  { key: 'WITH_CONSULTANT', num: 5, labelAr: 'لدى الاستشاري الدولي', labelEn: 'With Consultant', icon: <Globe2 className="w-4 h-4" /> },
  { key: 'OPINION_READY', num: 6, labelAr: 'الرأي والتقرير المعتمد', labelEn: 'Opinion & Report', icon: <FileText className="w-4 h-4" /> },
  { key: 'PARTNER_SERVICES', num: 7, labelAr: 'خدمات الشركاء', labelEn: 'Partner Services', icon: <Layers className="w-4 h-4" /> },
  { key: 'FOLLOW_UP_21_DAYS', num: 8, labelAr: 'متابعة 21 يوم', labelEn: '21-Day Follow-Up', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'CLOSED', num: 9, labelAr: 'إغلاق الحالة', labelEn: 'Case Closed', icon: <CheckCircle className="w-4 h-4" /> },
];

export const StageProgressBar: React.FC<Props> = ({ currentStage, onSetStage }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-thin pb-1">
        {STAGES.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={step.key}
              onClick={() => onSetStage(step.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isCurrent
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-sm'
                  : isPassed
                  ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800 border border-slate-700/50'
                  : 'bg-slate-900/50 text-slate-500 hover:text-slate-400 border border-transparent'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent
                    ? 'bg-teal-500 text-slate-950 font-black'
                    : isPassed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step.num}
              </div>
              <div className="flex flex-col text-right">
                <span className="leading-tight">{step.labelAr}</span>
                <span className="text-[9px] opacity-70 font-sans">{step.labelEn}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

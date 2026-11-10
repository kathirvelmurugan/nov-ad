import React from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { ClinicalStage } from '../../types';
import { STAGES_GUIDE } from './guideStagesData';

interface GuideStagesTabProps {
  isAr: boolean;
  onSelectStage?: (stage: ClinicalStage) => void;
  onClose: () => void;
}

export const GuideStagesTab: React.FC<GuideStagesTabProps> = ({
  isAr,
  onSelectStage,
  onClose,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-600 dark:text-slate-400">
        {isAr
          ? 'يمكنك الانتقال لأي مرحلة مباشرة من شريط المراحل العلوي أو استعراض خطوات الرحلة السريرية التسع أدناه:'
          : 'You can navigate to any stage directly from the top stepper progress bar or inspect the 9 clinical steps below:'}
      </p>

      <div className="space-y-3">
        {STAGES_GUIDE.map((s) => (
          <div
            key={s.stage}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-alo-teal/60 transition-all"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-alo-teal text-white text-xs font-extrabold flex items-center justify-center">
                  {s.num}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {isAr ? s.titleAr : s.titleEn}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                  {s.role}
                </span>
                {onSelectStage && (
                  <button
                    onClick={() => {
                      onSelectStage(s.stage);
                      onClose();
                    }}
                    className="text-[11px] font-bold text-alo-teal hover:underline flex items-center gap-0.5"
                  >
                    <span>{isAr ? 'الانتقال للشاشة' : 'Jump here'}</span>
                    {isAr ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
              {isAr ? s.descAr : s.descEn}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {(isAr ? s.keyPointsAr : s.keyPointsEn).map((pt, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] bg-teal-50 dark:bg-teal-950/40 text-alo-teal dark:text-alo-aqua border border-teal-200 dark:border-teal-800/60 px-2 py-0.5 rounded-md"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{pt}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

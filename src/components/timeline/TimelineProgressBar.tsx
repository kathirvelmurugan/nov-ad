import React from 'react';
import { STAGES } from './timelineContent';

interface TimelineProgressBarProps {
  currentIndex: number;
  isAr: boolean;
}

export const TimelineProgressBar: React.FC<TimelineProgressBarProps> = ({
  currentIndex,
  isAr,
}) => {
  return (
    <div className="bg-white dark:bg-alo-darkCard border border-slate-200 dark:border-alo-darkBorder rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {STAGES.map((s, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={s.stage} className="flex items-center shrink-0">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-alo-mint text-alo-teal border border-teal-300 font-extrabold ring-1 ring-teal-400/40 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 text-slate-400 dark:bg-slate-900/30 dark:text-slate-500'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold bg-white dark:bg-slate-800">
                  {isCompleted ? '✓' : s.num}
                </span>
                <span>{isAr ? s.labelAr : s.labelEn}</span>
              </div>
              {idx < STAGES.length - 1 && (
                <span className="text-slate-300 dark:text-slate-600 mx-1">
                  {isAr ? '←' : '→'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

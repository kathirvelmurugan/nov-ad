import React from 'react';
import { PERSONAS } from '../../data/personas';

interface GuideRolesTabProps {
  isAr: boolean;
  onSelectPersonaCode?: (code: string) => void;
  onClose: () => void;
}

export const GuideRolesTab: React.FC<GuideRolesTabProps> = ({
  isAr,
  onSelectPersonaCode,
  onClose,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-600 dark:text-slate-400">
        {isAr
          ? 'اختر أي دور من الشريط العلوي لمشاهدة المنصة من منظور ذلك المستخدم، أو انقر على أي دور أدناه:'
          : 'Click any role in the top header ribbon to view the platform from that perspective, or click any card below:'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PERSONAS.map((p) => (
          <div
            key={p.code}
            onClick={() => {
              if (onSelectPersonaCode) {
                onSelectPersonaCode(p.code);
                onClose();
              }
            }}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 hover:border-alo-teal hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all cursor-pointer flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
              {p.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {p.name}
                </div>
                <span className="text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  {p.code}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-alo-teal dark:text-alo-aqua">
                {p.title}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {p.badge}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

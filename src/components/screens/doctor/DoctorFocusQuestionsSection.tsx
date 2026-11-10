import React from 'react';
import { HelpCircle } from 'lucide-react';

interface Props {
  isAr: boolean;
  questions: [string, string, string];
  onQuestionChange: (index: 0 | 1 | 2, value: string) => void;
}

export const DoctorFocusQuestionsSection: React.FC<Props> = ({
  isAr,
  questions,
  onQuestionChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
            D07 · {isAr ? 'الأسئلة التوجيهية' : '3 Focus Questions'}
          </span>
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
            {isAr ? 'الأسئلة السريرية التوجيهية الإلزامية (3 Focus Questions):' : 'Mandatory Clinical Directives for International Specialist:'}
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">
          {isAr ? 'يجب صياغة 3 أسئلة دقيقة' : '3 precise clinical questions'}
        </span>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {isAr ? 'السؤال الأول (خطة التدخل الجراحي أو العلاجي التخصصي):' : 'Question 1 (Primary Surgical or Interventional Strategy):'}
        </label>
        <textarea
          rows={2}
          value={questions[0]}
          onChange={(e) => onQuestionChange(0, e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {isAr ? 'السؤال الثاني (تقييم المخاطر والمضاعفات المحتملة):' : 'Question 2 (Risk Stratification & Complication Mitigation):'}
        </label>
        <textarea
          rows={2}
          value={questions[1]}
          onChange={(e) => onQuestionChange(1, e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {isAr ? 'السؤال الثالث (بروتوكول العلاج الدوائي والتأهيل والمتابعة):' : 'Question 3 (Post-Procedure Protocol & Long-term Rehabilitation):'}
        </label>
        <textarea
          rows={2}
          value={questions[2]}
          onChange={(e) => onQuestionChange(2, e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
        />
      </div>
    </div>
  );
};

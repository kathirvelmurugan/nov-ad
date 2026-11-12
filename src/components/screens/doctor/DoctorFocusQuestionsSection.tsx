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

      {[
        {
          label: isAr ? 'السؤال الأول (خطة التدخل الجراحي أو العلاجي التخصصي):' : 'Question 1 (Primary Surgical or Interventional Strategy):',
          placeholder: isAr ? 'أدخل السؤال السريري الأول (10 أحرف على الأقل)...' : 'Enter first clinical focus question (min 10 characters)...',
          index: 0 as const,
        },
        {
          label: isAr ? 'السؤال الثاني (تقييم المخاطر والمضاعفات المحتملة):' : 'Question 2 (Risk Stratification & Complication Mitigation):',
          placeholder: isAr ? 'أدخل السؤال السريري الثاني (10 أحرف على الأقل)...' : 'Enter second clinical focus question (min 10 characters)...',
          index: 1 as const,
        },
        {
          label: isAr ? 'السؤال الثالث (بروتوكول العلاج الدوائي والتأهيل والمتابعة):' : 'Question 3 (Post-Procedure Protocol & Long-term Rehabilitation):',
          placeholder: isAr ? 'أدخل السؤال السريري الثالث (10 أحرف على الأقل)...' : 'Enter third clinical focus question (min 10 characters)...',
          index: 2 as const,
        },
      ].map(({ label, placeholder, index }) => {
        const val = questions[index] || '';
        const len = val.trim().length;
        const isValid = len >= 10;
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {label}
              </label>
              <span className={`text-[10px] font-mono font-semibold ${isValid ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500'}`}>
                {len} / 10 {isAr ? 'حرف كحد أدنى' : 'min chars'}
              </span>
            </div>
            <textarea
              rows={2}
              value={val}
              placeholder={placeholder}
              onChange={(e) => onQuestionChange(index, e.target.value)}
              className={`w-full bg-white dark:bg-slate-900 border rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium ${
                !isValid ? 'border-rose-300 dark:border-rose-700' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {!isValid && (
              <p className="text-[10px] text-rose-500 font-medium">
                {isAr ? '⚠️ يجب ألا يقل السؤال السريري عن 10 أحرف.' : '⚠️ Clinical question must be at least 10 characters.'}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

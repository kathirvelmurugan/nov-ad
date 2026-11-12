import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export interface FormErrorItem {
  field: string;
  label: string;
  message: string;
  anchorId?: string;
}

interface Props {
  errors: Record<string, string | undefined>;
  rulesLabels?: Record<string, { ar: string; en: string }>;
  lang?: 'ar' | 'en';
  title?: string;
  className?: string;
}

export const FormErrorSummary: React.FC<Props> = ({
  errors,
  rulesLabels = {},
  lang = 'ar',
  title,
  className = '',
}) => {
  const isAr = lang === 'ar';
  const activeErrors: FormErrorItem[] = Object.entries(errors)
    .filter(([_, msg]) => !!msg)
    .map(([field, msg]) => {
      const labelObj = rulesLabels[field];
      const label = labelObj ? (isAr ? labelObj.ar : labelObj.en) : field;
      return {
        field,
        label,
        message: msg as string,
        anchorId: `field-${field}`,
      };
    });

  if (activeErrors.length === 0) return null;

  const defaultTitle = isAr
    ? `يرجى تصحيح ${activeErrors.length} ${activeErrors.length === 1 ? 'حقل مطلوب' : 'حقول مطلوبة'} قبل المتابعة:`
    : `Please correct ${activeErrors.length} required ${activeErrors.length === 1 ? 'field' : 'fields'} before continuing:`;

  const handleScrollToField = (anchorId?: string) => {
    if (!anchorId) return;
    const elem = document.getElementById(anchorId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      elem.focus();
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      className={`p-4 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-sm transition-all animate-fadeIn ${className}`}
    >
      <div className="flex items-center gap-2 mb-2 font-bold text-sm">
        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
        <h4>{title || defaultTitle}</h4>
      </div>
      <ul className="space-y-1.5 text-xs mr-5 list-disc list-inside">
        {activeErrors.map((item) => (
          <li key={item.field} className="cursor-pointer hover:underline" onClick={() => handleScrollToField(item.anchorId)}>
            <strong className="font-extrabold">{item.label}:</strong> {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

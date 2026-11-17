/**
 * CaseSaveFailureBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Case writes update the UI optimistically, so a rejected write must be
 * announced instead of disappearing. Listens for 'alo:case-save-failed'
 * (dispatched by useClinicalWorkflowState) and clears on 'alo:case-save-ok'.
 *
 * Browser storage never holds clinical data; Postgres does. If Postgres
 * refused the write, the screen is showing something that is not saved yet.
 */
import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface CaseSaveFailureDetail {
  caseNumber?: string;
  message?: string;
}

const CaseSaveFailureBanner: React.FC = () => {
  const [failure, setFailure] = useState<CaseSaveFailureDetail | null>(null);
  const [isAr, setIsAr] = useState(false);

  useEffect(() => {
    const onFailed = (e: Event) => {
      const detail = (e as CustomEvent<CaseSaveFailureDetail>).detail || {};
      setIsAr(document.documentElement.getAttribute('dir') === 'rtl');
      setFailure(detail);
    };
    const onSaved = () => setFailure(null);

    window.addEventListener('alo:case-save-failed', onFailed);
    window.addEventListener('alo:case-save-ok', onSaved);
    return () => {
      window.removeEventListener('alo:case-save-failed', onFailed);
      window.removeEventListener('alo:case-save-ok', onSaved);
    };
  }, []);

  if (!failure) return null;

  return (
    <div
      role="alert"
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-[calc(100%-2rem)] max-w-xl"
    >
      <div className="flex items-start gap-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/90 px-4 py-3 shadow-xl">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
        <div className="flex-1 text-sm">
          <p className="font-bold text-rose-800 dark:text-rose-200">
            {isAr ? 'لم يتم حفظ التغييرات على الخادم' : 'Changes were not saved to the server'}
          </p>
          <p className="mt-1 text-rose-700 dark:text-rose-300">
            {failure.caseNumber ? `${failure.caseNumber} — ` : ''}
            {failure.message || (isAr ? 'أعد المحاولة قبل مغادرة الصفحة.' : 'Retry before leaving this page.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFailure(null)}
          aria-label={isAr ? 'إغلاق' : 'Dismiss'}
          className="shrink-0 rounded-lg p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CaseSaveFailureBanner;
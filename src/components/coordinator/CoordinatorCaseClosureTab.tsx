import React from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_ACCENT, TEAL_BG, getBadgeStyle, getPrimaryButtonStyle } from './coordinatorStyles';

interface Props {
  lang: 'ar' | 'en';
  activeCase: ClinicalCase;
  isArchived?: boolean;
  isProcessing: boolean;
  onIssuePDF2AndClose: () => void;
}

export const CoordinatorCaseClosureTab: React.FC<Props> = ({
  lang,
  activeCase,
  isArchived,
  isProcessing,
  onIssuePDF2AndClose,
}) => {
  const isAr = lang === 'ar';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const t = {
    c10_title: isAr ? 'إغلاق الحالة وإصدار التقرير الثاني' : 'Closed · PDF 2',
    c10_action: isAr ? 'إصدار الملف الشامل النهائي PDF 2 وإغلاق الحالة' : 'Issue Final Comprehensive Dossier PDF 2 & Close Case',
    c10_archived: isAr ? 'الحالة مؤرشفة' : 'Case Archived',
    c10_active: isAr ? 'الحالة نشطة' : 'Case Active',
  };

  return (
    <section aria-labelledby="c10-heading">
      <h2 id="c10-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, marginBottom: '8px', fontFamily }}>
        {t.c10_title}
      </h2>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
        padding: '16px 20px',
        backgroundColor: isArchived ? '#D1FAE5' : TEAL_BG,
        borderRadius: '12px',
        border: `1px solid ${isArchived ? '#6EE7B7' : TEAL_ACCENT}`,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isArchived ? '#065F46' : TEAL_PRIMARY} strokeWidth="2">
          <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
        </svg>
        <span style={{
          fontWeight: 700,
          fontSize: '15px',
          color: isArchived ? '#065F46' : TEAL_PRIMARY,
          fontFamily,
        }}>
          {isArchived ? t.c10_archived : t.c10_active}
        </span>
        <span style={getBadgeStyle(isArchived ? 'success' : 'info', fontFamily)}>
          {activeCase.status === 'closed' 
            ? (isAr ? 'مغلقة' : 'Closed') 
            : (isAr ? 'مفتوحة' : 'Open')}
        </span>
      </div>

      {isArchived ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: `1px solid ${TEAL_BG}`,
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={TEAL_ACCENT} strokeWidth="1.5" style={{ marginBottom: '16px' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3 style={{ margin: '0 0 8px', color: TEAL_PRIMARY, fontFamily, fontSize: '18px' }}>
            {isAr ? 'تم إغلاق الحالة وأرشفتها بنجاح' : 'Case Successfully Closed & Archived'}
          </h3>
          <p style={{ margin: 0, color: '#718096', fontFamily, fontSize: '14px' }}>
            {isAr 
              ? 'الملف الشامل النهائي PDF 2 متاح للتحميل في سجل المريض.' 
              : 'Final Comprehensive Dossier PDF 2 is available for download in patient records.'}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={onIssuePDF2AndClose}
          disabled={isProcessing}
          style={{
            ...getPrimaryButtonStyle(isProcessing, fontFamily),
            backgroundColor: TEAL_PRIMARY,
            padding: '18px 32px',
            fontSize: '17px',
          }}
          aria-busy={isProcessing}
        >
          {isProcessing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          )}
          {t.c10_action}
        </button>
      )}
    </section>
  );
};

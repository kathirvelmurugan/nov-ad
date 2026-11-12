import React from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, WHATSAPP_GREEN } from './followUpConstants';

interface Props {
  activeCase: ClinicalCase;
  isRTL: boolean;
  isDownloading: boolean;
  downloadComplete: boolean;
  onDownloadPDF: () => void;
  onPreviewPDF?: () => void;
}

export const FollowUpReportDownloadCard: React.FC<Props> = ({
  activeCase,
  isRTL,
  isDownloading,
  downloadComplete,
  onDownloadPDF,
  onPreviewPDF,
}) => {
  return (
    <section
      aria-label={isRTL ? 'بطاقة تحميل التقرير الطبي' : 'Medical Report Download Card'}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: `2px solid ${TEAL_SECONDARY}`,
        boxShadow: `0 8px 32px rgba(0, 123, 110, 0.12)`,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          [isRTL ? 'right' : 'left']: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(90deg, ${TEAL_PRIMARY}, ${TEAL_SECONDARY}, ${WHATSAPP_GREEN})`,
        }}
      />

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: TEAL_BG,
          padding: '6px 16px',
          borderRadius: '24px',
          marginBottom: '16px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span style={{ fontSize: '13px', fontWeight: 700, color: TEAL_PRIMARY }}>
          {isRTL ? 'التقرير الطبي المعتمد متاح للتحميل (PDF 1)' : 'Certified Medical Opinion Available (PDF 1)'}
        </span>
      </div>

      <h2
        style={{
          margin: '0 0 8px 0',
          fontSize: '20px',
          fontWeight: 800,
          color: '#1A2E35',
        }}
      >
        {isRTL ? 'تقرير الرأي الطبي الثاني - الهند' : 'Second Medical Opinion Report - India'}
      </h2>
      <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#5F7A84', lineHeight: 1.6 }}>
        {isRTL
          ? `رقم الحالة: ${activeCase.id} | تم الاعتماد من قبل وزارة الصحة السعودية وختم MOH`
          : `Case ID: ${activeCase.id} | Certified by Saudi MOH with official seal`}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onDownloadPDF}
          disabled={isDownloading}
          aria-label={isRTL ? 'تحميل التقرير الطبي PDF' : 'Download Medical Report PDF'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 28px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: isDownloading ? '#9CA3AF' : downloadComplete ? WHATSAPP_GREEN : TEAL_PRIMARY,
            color: '#FFFFFF',
            fontFamily: "'Cairo', sans-serif",
            fontSize: '15px',
            fontWeight: 700,
            cursor: isDownloading ? 'wait' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 14px ${isDownloading ? 'rgba(0,0,0,0.1)' : downloadComplete ? 'rgba(37,211,102,0.3)' : 'rgba(0,123,110,0.3)'}`,
          }}
        >
          {isDownloading ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
              {isRTL ? 'جاري التحميل...' : 'Downloading...'}
            </>
          ) : downloadComplete ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {isRTL ? 'تم التحميل بنجاح' : 'Downloaded Successfully'}
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {isRTL ? 'تحميل التقرير' : 'Download Report'}
            </>
          )}
        </button>

        {onPreviewPDF && (
          <button
            type="button"
            onClick={onPreviewPDF}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: `2px solid ${TEAL_PRIMARY}`,
              backgroundColor: '#FFFFFF',
              color: TEAL_PRIMARY,
              fontFamily: "'Cairo', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span>👁️</span>
            <span>{isRTL ? 'معاينة التقرير (PDF 1)' : 'Preview Report (PDF 1)'}</span>
          </button>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            backgroundColor: '#F0FDF4',
            borderRadius: '8px',
            border: '1px solid #BBF7D0',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHATSAPP_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#166534' }}>
            {isRTL ? 'ختم MOH معتمد | SHA256 محمي' : 'MOH Sealed | SHA256 Protected'}
          </span>
        </div>
      </div>
    </section>
  );
};

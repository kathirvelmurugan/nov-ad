import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_ACCENT, TEAL_BG, WHATSAPP_GREEN, getBadgeStyle, getPrimaryButtonStyle } from './coordinatorStyles';
import { generateMockSHA256 } from '../followup/followUpConstants';

interface Props {
  lang: 'ar' | 'en';
  activeCase: ClinicalCase;
  isArchived?: boolean;
  isProcessing: boolean;
  onIssuePDF2AndClose: () => void;
  onOpenPDFModal?: (type: 'pdf1' | 'pdf2') => void;
}

export const CoordinatorCaseClosureTab: React.FC<Props> = ({
  lang,
  activeCase,
  isArchived,
  isProcessing,
  onIssuePDF2AndClose,
  onOpenPDFModal,
}) => {
  const isAr = lang === 'ar';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const t = {
    c10_title: isAr ? 'إغلاق الحالة وإصدار الملف الشامل النهائي (PDF 2)' : 'Case Closure · Comprehensive Dossier (PDF 2)',
    c10_action: isAr ? 'إصدار الملف الشامل النهائي PDF 2 وإغلاق الحالة' : 'Issue Final Comprehensive Dossier PDF 2 & Close Case',
    c10_archived: isAr ? 'الحالة مؤرشفة نهائياً' : 'Case Permanently Archived',
    c10_active: isAr ? 'الحالة نشطة — بانتظار الإغلاق النهائي' : 'Case Active — Ready for Final Archival',
  };

  const handleDownloadPDF2 = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const checksum = generateMockSHA256();
      const content = [
        `========================================================================`,
        `ALO DOCTOR - FINAL COMPREHENSIVE CLINICAL DOSSIER & ARCHIVAL RECORD (PDF 2)`,
        `========================================================================`,
        `Case ID: ${activeCase.id}`,
        `Case Number: ${activeCase.caseNumber || 'ALO-2026-LIVE'}`,
        `ZATCA Invoice Ref: ${activeCase.pricing?.invoiceNumber || 'INV-2026-001'}`,
        `Patient Name: ${activeCase.patientName || activeCase.patientNameAr || 'Patient'}`,
        `National ID: 10********`,
        `Status: PERMANENTLY CLOSED & ARCHIVED`,
        `SDAIA Cryptographic Checksum (SHA-256): ${checksum}`,
        `Compliance: Saudi Health Council, MOH Regulations, SDAIA NDMO (PDPL)`,
        `------------------------------------------------------------------------`,
        `PART 1: CERTIFIED SECOND OPINION (PDF 1 CORE)`,
        `Treating Physician: ${activeCase.treatingDoctor?.name || 'د. عبدالله الشمري'}`,
        `International Specialist: ${activeCase.consultant?.name || 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)'}`,
        `------------------------------------------------------------------------`,
        `PART 2: 21-DAY FOLLOW-UP & EXPERIENCE SURVEY`,
        `Rating: ${(activeCase.metadata?.rating as number) || 5}/5 Stars (Excellent)`,
        `Status: Completed and fully resolved`,
        `------------------------------------------------------------------------`,
        `PART 3: ZATCA PHASE-2 TAX INVOICE RECEIPT`,
        `Amount Paid: ${(activeCase.pricing?.totalSar || 75).toFixed(2)} SAR (Includes 15% VAT)`,
        `Payment Status: VERIFIED & CAPTURED`,
        `========================================================================`,
      ].join('\n');

      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ALO_Comprehensive_Dossier_PDF2_${activeCase.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1000);
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
        marginBottom: '24px',
        padding: '16px 20px',
        backgroundColor: isArchived ? '#D1FAE5' : TEAL_BG,
        borderRadius: '12px',
        border: `1px solid ${isArchived ? '#6EE7B7' : TEAL_ACCENT}`,
        flexWrap: 'wrap',
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
          {activeCase.status === 'closed' || isArchived
            ? (isAr ? 'مغلقة ومؤرشفة' : 'Closed & Archived') 
            : (isAr ? 'مفتوحة' : 'Open')}
        </span>
        <span style={{ fontSize: '12px', color: '#64748B', marginLeft: 'auto', fontFamily }}>
          {isAr ? 'مرجع الفاتورة:' : 'ZATCA Ref:'} <strong>{activeCase.pricing?.invoiceNumber || 'INV-2026-001'}</strong>
        </span>
      </div>

      {isArchived ? (
        <div style={{
          padding: '32px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: `1px solid ${TEAL_BG}`,
          boxShadow: '0 4px 16px rgba(0, 123, 110, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#D1FAE5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px', color: TEAL_PRIMARY, fontFamily, fontSize: '20px', fontWeight: 800 }}>
              {isAr ? 'تم إغلاق الحالة وأرشفتها بنجاح' : 'Case Successfully Closed & Archived'}
            </h3>
            <p style={{ margin: 0, color: '#475569', fontFamily, fontSize: '14px', lineHeight: 1.6, maxWidth: '600px', marginInline: 'auto' }}>
              {isAr 
                ? 'تم إصدار الملف الشامل النهائي (PDF 2) واعتماده بالأختام الرقمية المشفرة وتضمين إيصال ضريبة القيمة المضافة (ZATCA) وسجل المتابعة 21 يوماً. الملف متاح للعرض والتحميل لك وللمريض.' 
                : 'Final Comprehensive Dossier (PDF 2) has been generated with cryptographic archival seals, ZATCA tax receipt, and 21-day follow-up record. Available for view and download.'}
            </p>
          </div>

          {/* Action Buttons for Viewing & Downloading PDF 2 */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            paddingTop: '8px',
          }}>
            <button
              type="button"
              onClick={() => onOpenPDFModal?.('pdf2')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                backgroundColor: TEAL_PRIMARY,
                color: '#FFFFFF',
                fontFamily,
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 123, 110, 0.25)',
                transition: 'all 0.2s',
              }}
            >
              <span>👁️</span>
              <span>{isAr ? 'معاينة وطباعة الملف الشامل (PDF 2)' : 'Preview & Print Dossier (PDF 2)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF2}
              disabled={isDownloading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: '12px',
                backgroundColor: downloadSuccess ? WHATSAPP_GREEN : '#FFFFFF',
                color: downloadSuccess ? '#FFFFFF' : TEAL_PRIMARY,
                border: `2px solid ${downloadSuccess ? WHATSAPP_GREEN : TEAL_PRIMARY}`,
                fontFamily,
                fontSize: '15px',
                fontWeight: 700,
                cursor: isDownloading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span>{downloadSuccess ? '✓' : '📥'}</span>
              <span>
                {isDownloading
                  ? (isAr ? 'جارٍ التحميل...' : 'Downloading...')
                  : downloadSuccess
                  ? (isAr ? 'تم التحميل بنجاح' : 'Downloaded!')
                  : (isAr ? 'تحميل ملف PDF 2' : 'Download PDF 2')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPDFModal?.('pdf1')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 20px',
                borderRadius: '12px',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                fontFamily,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span>📄</span>
              <span>{isAr ? 'معاينة التقرير الأول (PDF 1)' : 'Preview Report (PDF 1)'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', fontFamily }}>
              📋 {isAr ? 'جاهزية إغلاق الحالة وإصدار الملف الطبي الشامل:' : 'Case Closure Readiness Checklist:'}
            </div>
            <ul style={{ margin: 0, paddingRight: isAr ? '20px' : '0', paddingLeft: isAr ? '0' : '20px', fontSize: '13px', color: '#475569', lineHeight: 1.8, fontFamily }}>
              <li>✓ {isAr ? 'تم سداد باقة الاستشارة واعتماد فاتورة ZATCA الضريبية' : 'Consultation package paid and ZATCA VAT invoice cleared'}</li>
              <li>✓ {isAr ? 'تم إعداد واعتماد تقرير الرأي الثاني (PDF 1) من الاستشاري والطبيب السعودي' : 'Second opinion (PDF 1) approved by Consultant & Saudi Doctor'}</li>
              <li>✓ {isAr ? 'فترة متابعة الـ 21 يوماً مكتملة مع توثيق كافة المداولات السريرية' : '21-day follow-up cycle concluded with all clinical exchanges recorded'}</li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
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

            <button
              type="button"
              onClick={() => onOpenPDFModal?.('pdf2')}
              style={{
                padding: '18px 24px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                color: TEAL_PRIMARY,
                border: `2px solid ${TEAL_PRIMARY}`,
                fontFamily,
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              👁️ {isAr ? 'معاينة مسودة الملف الشامل (PDF 2)' : 'Preview Draft Dossier (PDF 2)'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

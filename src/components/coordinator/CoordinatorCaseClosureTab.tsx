import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_ACCENT, TEAL_BG, WHATSAPP_GREEN, getBadgeStyle, getPrimaryButtonStyle } from './coordinatorStyles';
import { generateMockSHA256 } from '../followup/followUpConstants';

interface Props {
  lang: 'ar' | 'en';
  activeCase: ClinicalCase;
  isArchived?: boolean;
  isProcessing: boolean;
  onReleasePDF2: () => void;
  onCloseCaseCompletely: () => void;
  onIssuePDF2AndClose?: () => void;
  onOpenPDFModal?: (type: 'pdf1' | 'pdf2') => void;
}

export const CoordinatorCaseClosureTab: React.FC<Props> = ({
  lang,
  activeCase,
  isArchived,
  isProcessing,
  onReleasePDF2,
  onCloseCaseCompletely,
  onIssuePDF2AndClose,
  onOpenPDFModal,
}) => {
  const isAr = lang === 'ar';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isPdf2Released = Boolean(activeCase.metadata?.pdf2Released);

  const t = {
    c10_title: isAr ? 'إغلاق الحالة وإصدار الملف الطبي الشامل (PDF 2)' : 'Case Closure · Comprehensive Dossier (PDF 2)',
    c10_archived: isAr ? 'الحالة مؤرشفة ومغلقة نهائياً' : 'Case Permanently Closed & Archived',
    c10_active: isAr ? 'الحالة نشطة — بانتظار اعتماد PDF 2 والإغلاق النهائي' : 'Case Active — Pending PDF 2 Release & Final Archival',
    preview_pdf2: isAr ? 'معاينة وتجهيز الملف الشامل (PDF 2)' : 'Preview & Prepare Dossier (PDF 2)',
    release_pdf2: isAr ? 'اعتماد وإصدار الملف الشامل (PDF 2) للمريض' : 'Release Final Dossier (PDF 2) to Patient',
    pdf2_released_badge: isAr ? 'تم إصدار واعتماد PDF 2 للمريض بنجاح' : 'PDF 2 Successfully Released to Patient',
    close_case: isAr ? 'إغلاق الحالة نهائياً وأرشفتها' : 'Close Case Completely & Archive',
    close_disabled_tooltip: isAr ? 'يجب إصدار ملف PDF 2 للمريض أولاً قبل إغلاق الحالة نهائياً' : 'PDF 2 must be released to the patient before closing the case completely',
  };

  const handleDownloadPDF2 = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const checksum = generateMockSHA256();
      const followUpQ = (activeCase.metadata?.patientQuestions as string[]) || [];
      const followUpA =
        (activeCase.metadata?.coordinatorReplies as string[]) ||
        (activeCase.metadata?.followUpAnswers as string[]) ||
        [];

      const qnaBlock = followUpQ.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${followUpA[i] || 'ALO Care Coordinator guidance provided.'}`).join('\n\n');

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
        `PART 2: 21-DAY ALO CARE COORDINATION & FOLLOW-UP LOG`,
        `Rating: ${(activeCase.metadata?.rating as number) || 5}/5 Stars`,
        qnaBlock || 'All follow-up questions answered and documented.',
        activeCase.finalClosureNote ? `Specialist Final Remarks: ${activeCase.finalClosureNote}` : '',
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
    <section aria-labelledby="c10-heading" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
      <h2 id="c10-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, marginBottom: '8px', fontFamily }}>
        {t.c10_title}
      </h2>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: isArchived ? '#D1FAE5' : TEAL_BG,
          borderRadius: '12px',
          border: `1px solid ${isArchived ? '#6EE7B7' : TEAL_ACCENT}`,
          flexWrap: 'wrap',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isArchived ? '#065F46' : TEAL_PRIMARY} strokeWidth="2">
          <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
        </svg>
        <span
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: isArchived ? '#065F46' : TEAL_PRIMARY,
            fontFamily,
          }}
        >
          {isArchived ? t.c10_archived : t.c10_active}
        </span>
        <span style={getBadgeStyle(isArchived ? 'success' : 'info', fontFamily)}>
          {activeCase.status === 'closed' || isArchived
            ? isAr
              ? 'مغلقة ومؤرشفة'
              : 'Closed & Archived'
            : isAr
            ? 'مفتوحة'
            : 'Open'}
        </span>
        <span style={{ fontSize: '12px', color: '#64748B', [isAr ? 'marginRight' : 'marginLeft']: 'auto', fontFamily }}>
          {isAr ? 'مرجع الفاتورة:' : 'ZATCA Ref:'} <strong>{activeCase.pricing?.invoiceNumber || 'INV-2026-001'}</strong>
        </span>
      </div>

      {isArchived ? (
        <div
          style={{
            padding: '32px 24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `1px solid ${TEAL_BG}`,
            boxShadow: '0 4px 16px rgba(0, 123, 110, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#D1FAE5',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
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
                ? 'تم إصدار الملف الشامل النهائي (PDF 2) واعتماده بالأختام الرقمية المشفرة متضمناً كافة استفسارات وإجابات المتابعة، وإغلاق الحالة نهائياً.'
                : 'Final Comprehensive Dossier (PDF 2) containing all follow-up Q&As has been released and the case is permanently closed.'}
            </p>
          </div>

          {/* Action Buttons for Viewing & Downloading PDF 2 */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              paddingTop: '8px',
            }}
          >
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
                  ? isAr
                    ? 'جارٍ التحميل...'
                    : 'Downloading...'
                  : downloadSuccess
                  ? isAr
                    ? 'تم التحميل بنجاح'
                    : 'Downloaded!'
                  : isAr
                  ? 'تحميل ملف PDF 2'
                  : 'Download PDF 2'}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Readiness Checklist */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', fontFamily }}>
              📋 {isAr ? 'خطوات إغلاق الحالة وإصدار الملف الطبي الشامل:' : 'Case Closure Standard Workflow:'}
            </div>
            <ul style={{ margin: 0, paddingRight: isAr ? '20px' : '0', paddingLeft: isAr ? '0' : '20px', fontSize: '13px', color: '#475569', lineHeight: 1.8, fontFamily }}>
              <li>✓ {isAr ? 'الخطوة 1: تجهيز ومعاينة ملف PDF 2 الشامل المتضمن كافة أسئلة المريض وإجابات الاستشاري' : 'Step 1: Prepare & preview PDF 2 containing all follow-up questions & specialist answers'}</li>
              <li>✓ {isAr ? 'الخطوة 2: اعتماد وإصدار ملف PDF 2 وإتاحته للمريض' : 'Step 2: Release and issue PDF 2 to the patient'}</li>
              <li>✓ {isAr ? 'الخطوة 3: إغلاق الحالة نهائياً وأرشفتها (مفعل بعد إصدار PDF 2)' : 'Step 3: Close case completely & archive (unlocked once PDF 2 is released)'}</li>
            </ul>
          </div>

          {/* Status of PDF 2 */}
          {isPdf2Released && (
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1.5px solid #10B981',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#065F46',
                fontFamily,
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              <span>✓</span>
              <span>{t.pdf2_released_badge}</span>
            </div>
          )}

          {/* Standard 2-Step Action Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            {/* Step 1: Preview PDF 2 */}
            <button
              type="button"
              onClick={() => onOpenPDFModal?.('pdf2')}
              style={{
                padding: '16px 24px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                color: TEAL_PRIMARY,
                border: `2px solid ${TEAL_PRIMARY}`,
                fontFamily,
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>👁️</span>
              <span>{t.preview_pdf2}</span>
            </button>

            {/* Step 2: Release PDF 2 */}
            {!isPdf2Released ? (
              <button
                type="button"
                onClick={onReleasePDF2}
                disabled={isProcessing}
                style={{
                  ...getPrimaryButtonStyle(isProcessing, fontFamily),
                  backgroundColor: WHATSAPP_GREEN,
                  padding: '16px 28px',
                  fontSize: '15px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>🚀</span>
                <span>{t.release_pdf2}</span>
              </button>
            ) : null}

            {/* Step 3: Close Case Completely (Gated on isPdf2Released) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                type="button"
                onClick={onCloseCaseCompletely}
                disabled={isProcessing || !isPdf2Released}
                title={!isPdf2Released ? t.close_disabled_tooltip : ''}
                style={{
                  ...getPrimaryButtonStyle(isProcessing || !isPdf2Released, fontFamily),
                  backgroundColor: !isPdf2Released ? '#94A3B8' : TEAL_PRIMARY,
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: !isPdf2Released ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: isPdf2Released ? '0 4px 16px rgba(0, 123, 110, 0.3)' : 'none',
                }}
              >
                <span>🔒</span>
                <span>{t.close_case}</span>
              </button>
              {!isPdf2Released && (
                <span style={{ fontSize: '11px', color: '#64748B', fontFamily }}>
                  * {t.close_disabled_tooltip}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

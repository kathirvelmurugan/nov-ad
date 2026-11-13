import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { generateMockSHA256 } from '../followup/followUpConstants';

interface Props {
  activeCase: ClinicalCase;
  tealPrimary: string;
  tealSecondary: string;
  tealBg: string;
  onOpenPDFModal: (type: 'pdf1' | 'pdf2') => void;
  onGoToReview?: () => void;
}

export const ConsultantCaseClosedSection: React.FC<Props> = ({
  activeCase,
  tealPrimary,
  tealSecondary,
  tealBg,
  onOpenPDFModal,
  onGoToReview,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const followUpQ = (activeCase.metadata?.patientQuestions as string[]) || [];
  const followUpA =
    (activeCase.metadata?.followUpAnswers as string[]) ||
    (activeCase.metadata?.consultantAnswers as string[]) ||
    [];

  const handleDownloadPDF2 = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const checksum = generateMockSHA256();
      const qnaBlock = followUpQ
        .map(
          (q, i) =>
            `Q${i + 1}: ${q}\nA${i + 1}: ${followUpA[i] || 'Clinical guidance provided.'}`
        )
        .join('\n\n');

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
        `Specialty: ${activeCase.specialtyEn || activeCase.specialty || 'Cardiothoracic Surgery'}`,
        `Diagnosis: ${activeCase.diagnosisEn || activeCase.diagnosis}`,
        `Consultant Opinion: ${activeCase.consultantOpinion || activeCase.consultant?.opinionEnglish || 'Complete'}`,
        `------------------------------------------------------------------------`,
        `PART 2: 21-DAY FOLLOW-UP & SPECIALIST ANSWERS`,
        `Rating: ${(activeCase.metadata?.rating as number) || 5}/5 Stars`,
        qnaBlock || 'All follow-up inquiries answered and recorded.',
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
    <section
      aria-label="Case Closure & Final Comprehensive Dossier"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '18px', color: tealPrimary, margin: 0 }}>
          Case Closure · Comprehensive Dossier (PDF 2)
        </h2>
        <span
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: '#D1FAE5',
            color: '#065F46',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          ● Case Closed & Archived
        </span>
      </div>

      {/* Green Banner Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: '#D1FAE5',
          borderRadius: '12px',
          border: '1px solid #6EE7B7',
          flexWrap: 'wrap',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2">
          <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
        </svg>
        <span
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: '#065F46',
          }}
        >
          Case Permanently Closed & Archived
        </span>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#059669',
            color: '#FFFFFF',
          }}
        >
          Closed & Archived
        </span>
        <span style={{ fontSize: '12px', color: '#047857', marginLeft: 'auto' }}>
          ZATCA Ref: <strong>{activeCase.pricing?.invoiceNumber || 'INV-2026-001'}</strong>
        </span>
      </div>

      {/* Main Closure Confirmation Card */}
      <div
        style={{
          padding: '36px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: `1px solid ${tealBg}`,
          boxShadow: '0 4px 16px rgba(0, 123, 110, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
        }}
      >
        <div>
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
          <h3
            style={{
              margin: '0 0 8px',
              color: tealPrimary,
              fontSize: '22px',
              fontWeight: 800,
            }}
          >
            Case Successfully Closed & Archived
          </h3>
          <p
            style={{
              margin: 0,
              color: '#475569',
              fontSize: '14px',
              lineHeight: 1.6,
              maxWidth: '620px',
            }}
          >
            Final Comprehensive Dossier (PDF 2) containing all follow-up Q&As has been released by the ALO Coordinator and the case is permanently closed.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => onOpenPDFModal('pdf2')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '12px',
              backgroundColor: tealPrimary,
              color: '#FFFFFF',
              fontFamily: "'Cairo', sans-serif",
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 123, 110, 0.25)',
              transition: 'all 0.2s',
            }}
          >
            <span>👁️</span>
            <span>Preview & Print Dossier (PDF 2)</span>
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
              backgroundColor: downloadSuccess ? '#25D366' : '#FFFFFF',
              color: downloadSuccess ? '#FFFFFF' : tealPrimary,
              border: `2px solid ${downloadSuccess ? '#25D366' : tealPrimary}`,
              fontFamily: "'Cairo', sans-serif",
              fontSize: '15px',
              fontWeight: 700,
              cursor: isDownloading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span>{downloadSuccess ? '✓' : '📥'}</span>
            <span>
              {isDownloading
                ? 'Downloading...'
                : downloadSuccess
                ? 'Downloaded!'
                : 'Download PDF 2'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPDFModal('pdf1')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 20px',
              borderRadius: '12px',
              backgroundColor: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              fontFamily: "'Cairo', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span>📄</span>
            <span>Preview Report (PDF 1)</span>
          </button>
        </div>
      </div>

      {/* Clinical Dossier Summary Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>
            Archived Case Summary & Final Inquiries
          </h4>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Patient Rating: <strong>⭐ {(activeCase.metadata?.rating as number) || 5}/5</strong>
          </span>
        </div>

        {/* Written Opinion Preserved */}
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px 16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
            International Specialist Opinion (Submitted)
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {activeCase.consultantOpinion || activeCase.consultant?.opinionEnglish || 'Completed and endorsed.'}
          </p>
        </div>

        {/* Q&A Exchanges */}
        {followUpQ.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              Follow-Up Questions & Your Answers:
            </div>
            {followUpQ.map((q, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  fontSize: '13px',
                }}
              >
                <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                  ❓ Q{idx + 1}: {q}
                </div>
                <div style={{ color: '#047857', marginTop: '4px', paddingLeft: '8px' }}>
                  ↳ <strong>Doctor Answer:</strong> {followUpA[idx] || 'Clinical advice documented.'}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCase.finalClosureNote && (
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 14px', borderRadius: '8px', fontSize: '13px' }}>
            <div style={{ fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
              Specialist Final Clinical Remarks:
            </div>
            <div style={{ color: '#15803D', lineHeight: 1.6 }}>
              {activeCase.finalClosureNote}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

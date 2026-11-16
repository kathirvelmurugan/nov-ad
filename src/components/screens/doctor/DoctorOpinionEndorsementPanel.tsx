import React, { useState, useCallback, useMemo } from 'react';

interface DoctorOpinionEndorsementPanelProps {
  caseId: string;
  specialistOpinion: string;
  onUpdateCase: (caseId: string, payload: CaseUpdatePayload) => Promise<void>;
  currentPersonaId: string;
}

interface CaseUpdatePayload {
  status: string;
  endorsement?: EndorsementRecord;
  nextRole: string;
}

interface EndorsementRecord {
  scfhsLicense: string;
  timestamp: string;
  qrVerificationHash: string;
  concurrence: boolean;
  stampCode: string;
}

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#4A5568',
  border: '#B2DFDB'
};

const SCFHS_LICENSE = 'SCFHS-2024-KSA-8821';
const STAMP_CODE = 'D12';
const ENDORSING_DOCTOR_NAME_AR = 'د. فهد الحربي';
const ENDORSING_DOCTOR_NAME_EN = 'Dr. Fahad Al-Harbi';
const SPECIALIST_NAME_AR = 'د. في. براسانث';
const SPECIALIST_NAME_EN = 'Dr. V. Prasanth';

const generateQrVerificationHash = (caseId: string, license: string, timestamp: string): string => {
  const raw = `${caseId}:${license}:${timestamp}:${STAMP_CODE}:ALO_DOCTOR_V2.4`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `QR-KSA-${hexHash}-${Date.now().toString(36).toUpperCase()}`;
};

const DoctorOpinionEndorsementPanel: React.FC<DoctorOpinionEndorsementPanelProps> = ({
  caseId,
  specialistOpinion,
  onUpdateCase,
  currentPersonaId
}) => {
  const [isConcurred, setIsConcurred] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isStamped, setIsStamped] = useState<boolean>(false);
  const [stampRecord, setStampRecord] = useState<EndorsementRecord | null>(null);

  const isRtl = useMemo(() => {
    const rtlPersonas = ['doctor_ar', 'coordinator_ar', 'patient_ar', 'admin_ar'];
    return rtlPersonas.some(p => currentPersonaId.includes(p)) || currentPersonaId.startsWith('ar-');
  }, [currentPersonaId]);

  const handleConcurrenceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsConcurred(e.target.checked);
  }, []);

  const handleStampEndorsement = useCallback(async () => {
    if (!isConcurred || isSubmitting || isStamped) return;

    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      const qrVerificationHash = generateQrVerificationHash(caseId, SCFHS_LICENSE, timestamp);

      const endorsement: EndorsementRecord = {
        scfhsLicense: SCFHS_LICENSE,
        timestamp,
        qrVerificationHash,
        concurrence: true,
        stampCode: STAMP_CODE
      };

      const payload: CaseUpdatePayload = {
        status: 'ENDORSED_BY_SCFHS_SPECIALIST',
        endorsement,
        nextRole: 'COORDINATOR_FINAL_CLOSURE'
      };

      await onUpdateCase(caseId, payload);

      setStampRecord(endorsement);
      setIsStamped(true);
    } catch (error) {
      console.error('[ALO DOCTOR v2.4] Stamp endorsement failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isConcurred, isSubmitting, isStamped, caseId, onUpdateCase]);

  const containerStyle: React.CSSProperties = {
    direction: isRtl ? 'rtl' : 'ltr',
    fontFamily: '"Cairo", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: PALETTE.background,
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '800px',
    margin: '0 auto',
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `2px solid ${PALETTE.secondary}`,
    paddingBottom: '16px',
    marginBottom: '24px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    color: PALETTE.primary,
    margin: 0
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: PALETTE.primary,
    color: PALETTE.white,
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.5px'
  };

  const opinionBoxStyle: React.CSSProperties = {
    backgroundColor: PALETTE.white,
    borderRight: isRtl ? `4px solid ${PALETTE.secondary}` : 'none',
    borderLeft: !isRtl ? `4px solid ${PALETTE.secondary}` : 'none',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '15px',
    lineHeight: 1.8,
    color: PALETTE.textDark
  };

  const checkboxContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: PALETTE.white,
    padding: '20px',
    borderRadius: '12px',
    border: `1px solid ${PALETTE.border}`,
    marginBottom: '24px',
    cursor: isStamped ? 'default' : 'pointer'
  };

  const checkboxStyle: React.CSSProperties = {
    width: '22px',
    height: '22px',
    accentColor: PALETTE.primary,
    marginTop: '2px',
    cursor: isStamped ? 'default' : 'pointer',
    flexShrink: 0
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: PALETTE.textDark,
    lineHeight: 1.7,
    cursor: isStamped ? 'default' : 'pointer'
  };

  const stampButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 24px',
    backgroundColor: isStamped ? PALETTE.whatsapp : (isConcurred ? PALETTE.primary : PALETTE.border),
    color: PALETTE.white,
    border: 'none',
    borderRadius: '12px',
    fontSize: '17px',
    fontWeight: 700,
    fontFamily: '"Cairo", sans-serif',
    cursor: isConcurred && !isSubmitting && !isStamped ? 'pointer' : 'not-allowed',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    opacity: isSubmitting ? 0.7 : 1,
    boxShadow: isConcurred && !isStamped ? '0 4px 16px rgba(0, 123, 110, 0.3)' : 'none'
  };

  const stampReceiptStyle: React.CSSProperties = {
    marginTop: '24px',
    backgroundColor: PALETTE.white,
    border: `2px dashed ${PALETTE.whatsapp}`,
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center'
  };

  const receiptRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: `1px solid ${PALETTE.background}`,
    fontSize: '14px',
    color: PALETTE.textMuted
  };

  const receiptValueStyle: React.CSSProperties = {
    fontWeight: 700,
    color: PALETTE.primary,
    fontFamily: 'monospace, "Cairo"',
    direction: 'ltr'
  };

  const concurrenceTextAr = 'أوافق على التوصيات السريرية المقدمة من الاستشاري الدولي وأعتمدها ضمن الخطة العلاجية';
  const concurrenceTextEn = 'I agree with the clinical recommendations provided by the international consultant and endorse them within the treatment plan';
  const stampButtonTextAr = 'اعتماد وتوقيع الاستشارة الطبية';
  const stampButtonTextEn = 'Endorse & Sign Medical Consultation';
  const opinionHeaderAr = `الرأي التخصصي المقدم من ${SPECIALIST_NAME_AR}`;
  const opinionHeaderEn = `Specialist Opinion Formulated by ${SPECIALIST_NAME_EN}`;

  return (
    <div style={containerStyle} role="region" aria-label="Doctor Opinion Endorsement Panel">
      <header style={headerStyle}>
        <h2 style={titleStyle}>
          {isRtl ? 'لوحة اعتماد رأي الاستشاري' : 'Specialist Opinion Endorsement Panel'}
        </h2>
        <div style={badgeStyle}>
          {isRtl ? `ترخيص الهيئة: ${SCFHS_LICENSE}` : `SCFHS License: ${SCFHS_LICENSE}`}
        </div>
      </header>

      <section aria-label={isRtl ? 'الرأي التخصصي' : 'Specialist Opinion'}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: PALETTE.textMuted, marginBottom: '12px' }}>
          {isRtl ? opinionHeaderAr : opinionHeaderEn}
        </h3>
        <div style={opinionBoxStyle}>
          {specialistOpinion}
        </div>
      </section>

      <section aria-label={isRtl ? 'الموافقة السريرية' : 'Clinical Concurrence'}>
        <label style={checkboxContainerStyle}>
          <input
            type="checkbox"
            checked={isConcurred}
            onChange={handleConcurrenceChange}
            disabled={isStamped || isSubmitting}
            style={checkboxStyle}
            aria-required="true"
          />
          <span style={labelStyle}>
            {isRtl ? concurrenceTextAr : concurrenceTextEn}
          </span>
        </label>
      </section>

      <section aria-label={isRtl ? 'ختم الاعتماد' : 'Endorsement Stamp'}>
        <button
          type="button"
          onClick={handleStampEndorsement}
          disabled={!isConcurred || isSubmitting || isStamped}
          style={stampButtonStyle}
          aria-busy={isSubmitting}
          aria-label={`${STAMP_CODE}: ${isRtl ? stampButtonTextAr : stampButtonTextEn}`}
        >
          {isSubmitting ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              {isRtl ? 'جاري المعالجة...' : 'Processing...'}
            </>
          ) : isStamped ? (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {isRtl ? 'تم الاعتماد بنجاح' : 'Successfully Endorsed'}
            </>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>{`[${STAMP_CODE}] ${isRtl ? stampButtonTextAr : stampButtonTextEn}`}</span>
            </>
          )}
        </button>
      </section>

      {isStamped && stampRecord && (
        <section style={stampReceiptStyle} aria-label={isRtl ? 'إيصال الاعتماد الرقمي' : 'Digital Endorsement Receipt'}>
          <div style={{ marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={PALETTE.whatsapp} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h4 style={{ color: PALETTE.primary, fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            {isRtl ? 'تم إصدار الختم الرقمي D12' : 'Digital Stamp D12 Issued'}
          </h4>
          
          <div style={receiptRowStyle}>
            <span>{isRtl ? 'الطبيب المعتمد' : 'Endorsing Doctor'}</span>
            <span style={{ fontWeight: 700, color: PALETTE.textDark }}>
              {isRtl ? ENDORSING_DOCTOR_NAME_AR : ENDORSING_DOCTOR_NAME_EN}
            </span>
          </div>
          
          <div style={receiptRowStyle}>
            <span>{isRtl ? 'رقم ترخيص الهيئة السعودية' : 'SCFHS License Number'}</span>
            <span style={receiptValueStyle}>{stampRecord.scfhsLicense}</span>
          </div>
          
          <div style={receiptRowStyle}>
            <span>{isRtl ? 'رمز الختم' : 'Stamp Code'}</span>
            <span style={receiptValueStyle}>{stampRecord.stampCode}</span>
          </div>
          
          <div style={receiptRowStyle}>
            <span>{isRtl ? 'التوقيت الزمني' : 'Timestamp'}</span>
            <span style={receiptValueStyle}>{new Date(stampRecord.timestamp).toLocaleString(isRtl ? 'ar-SA' : 'en-US')}</span>
          </div>
          
          <div style={{ ...receiptRowStyle, borderBottom: 'none' }}>
            <span>{isRtl ? 'رمز التحقق QR' : 'QR Verification Hash'}</span>
            <span style={{ ...receiptValueStyle, fontSize: '12px', wordBreak: 'break-all' }}>
              {stampRecord.qrVerificationHash}
            </span>
          </div>

          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            backgroundColor: PALETTE.background, 
            borderRadius: '8px',
            fontSize: '13px',
            color: PALETTE.textMuted,
            fontWeight: 600
          }}>
            {isRtl 
              ? 'تم تحويل الحالة إلى المنسق لإتمام الإغلاق النهائي' 
              : 'Case advanced to Coordinator for final closure'}
          </div>
        </section>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        button:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        input[type="checkbox"]:focus-visible {
          outline: 2px solid ${PALETTE.secondary};
          outline-offset: 2px;
        }
        button:focus-visible {
          outline: 3px solid ${PALETTE.secondary};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default DoctorOpinionEndorsementPanel;
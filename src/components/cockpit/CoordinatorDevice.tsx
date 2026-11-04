import React from 'react';
import { CockpitDeviceProps, TEAL_PRIMARY, WHATSAPP_GREEN } from './types';

export const CoordinatorDevice: React.FC<CockpitDeviceProps> = ({
  activeCase,
  stageNum,
  onAdvanceStage,
  onUpdateCase,
  lang,
}) => {
  const isAr = lang === 'ar';
  const isReferralApproved = !!activeCase.referralApproved || stageNum >= 4;
  const isInvoiceIssued = !!activeCase.invoiceIssued || !!activeCase.pricing?.invoiceNumber || stageNum >= 5;
  const isPaymentVerified = !!activeCase.paymentVerified || !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed' || stageNum >= 5;
  const currentModality = activeCase.modality || (activeCase.consultationType === 'video' ? 'Video' : 'Written');

  const cardInnerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 800,
    color: TEAL_PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {stageNum < 4 ? (
        <div style={{ ...cardInnerStyle, backgroundColor: '#f8fafc', textAlign: 'center', padding: '36px 16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
            {isAr ? 'مكتب منسق الرعاية (C01) في الانتظار' : 'Care Coordinator Desk (C01) Idle'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
            {isAr
              ? 'في انتظار اعتماد الإحالة الطبية من الطبيب السعودي (D10).'
              : 'Waiting for Saudi Doctor referral approval (D10).'}
          </div>
        </div>
      ) : (
        <>
          {/* C01: Referral Verification */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>C01 · {isAr ? 'مراجعة وتأكيد الإحالة' : 'Referral Review'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: isReferralApproved ? WHATSAPP_GREEN : '#ef4444',
                  boxShadow: `0 0 8px ${isReferralApproved ? WHATSAPP_GREEN : '#ef4444'}`,
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                {isReferralApproved
                  ? (isAr ? 'تم اعتماد التحويل من الطبيب السعودي' : 'Referral Approved by Saudi Doctor')
                  : (isAr ? 'في انتظار اعتماد الطبيب السعودي' : 'Awaiting Physician Approval')}
              </span>
            </div>
          </div>

          {/* C02–C04: Set Pricing & Issue Invoice */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>C02–C04 · {isAr ? 'التسعير وإصدار فاتورة ZATCA' : 'Pricing & ZATCA Invoice'}</span>
            <button
              onClick={() =>
                onUpdateCase({
                  invoiceIssued: true,
                  pricing: {
                    ...(activeCase.pricing || {
                      baseSar: 250,
                      totalSar: 250,
                      vatPercent: 15,
                      vatSar: 0,
                      tierName: 'Standard',
                      paid: false,
                      tier: 1,
                    }),
                    invoiceNumber: 'INV-2026-001',
                  },
                })
              }
              style={{
                width: '100%',
                backgroundColor: isInvoiceIssued ? '#64748b' : TEAL_PRIMARY,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: 800,
                fontSize: '11px',
                cursor: isInvoiceIssued ? 'default' : 'pointer',
                marginTop: '6px',
              }}
              disabled={isInvoiceIssued}
            >
              {isInvoiceIssued
                ? (isAr ? 'تم إصدار الفاتورة الضريبية (INV-2026-001)' : 'ZATCA Invoice Issued (INV-2026-001)')
                : (isAr ? 'إصدار الفاتورة وتفعيل رابط السداد C02-C04' : 'Issue Invoice & Payment Link C02-C04')}
            </button>
          </div>

          {/* C05–C06: Payment Verify & Push to India */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>C05–C06 · {isAr ? 'تحقق السداد وتوجيه الملف للهند' : 'Verify Payment & Dispatch'}</span>
            <button
              onClick={() =>
                onUpdateCase({
                  paymentVerified: true,
                  currentStage: 'WITH_CONSULTANT',
                  stage: 5,
                  pricing: {
                    ...(activeCase.pricing || {
                      baseSar: 250,
                      totalSar: 250,
                      vatPercent: 15,
                      vatSar: 0,
                      tierName: 'Standard',
                      invoiceNumber: 'INV-2026-001',
                      tier: 1,
                    }),
                    paid: true,
                  },
                })
              }
              style={{
                width: '100%',
                backgroundColor: isPaymentVerified ? WHATSAPP_GREEN : TEAL_PRIMARY,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: 800,
                fontSize: '11px',
                cursor: (!isInvoiceIssued || isPaymentVerified) ? 'default' : 'pointer',
                marginTop: '6px',
              }}
              disabled={!isInvoiceIssued || isPaymentVerified}
            >
              {isPaymentVerified
                ? (isAr ? 'تم تأكيد السداد وإحالة الملف للهند' : 'Payment Confirmed & Dispatched')
                : (isAr ? 'تأكيد السداد وتوجيه الملف للاستشاري C05' : 'Verify Payment & Push to Consultant C05')}
            </button>
          </div>

          {/* Video Call Slot Confirmation (Only applicable if Video is selected AND post-payment) */}
          {currentModality === 'Video' && isPaymentVerified && (
            <div style={{ ...cardInnerStyle, borderColor: WHATSAPP_GREEN, borderWidth: '2px', backgroundColor: '#f0fdf4' }}>
              <span style={{ ...labelStyle, color: '#166534' }}>
                P25 · {isAr ? 'تأكيد موعد مكالمة الفيديو (بعد السداد)' : 'Confirmed Video Slot (Post-Payment)'}
              </span>
              <p style={{ fontSize: '11px', color: '#166534', margin: '4px 0 0 0', fontWeight: 600 }}>
                {isAr ? 'تم حجز موعد المكالمة مع المترجم الطبي المعتمد.' : 'WebRTC slot confirmed with accredited medical translator.'}
              </p>
            </div>
          )}

          {/* C08: Release Certified Report in Parallel */}
          <button
            onClick={() => {
              onUpdateCase({ reportReleased: true, currentStage: 'OPINION_READY', stage: 6 });
              onAdvanceStage();
            }}
            style={{
              backgroundColor: TEAL_PRIMARY,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontWeight: 800,
              fontSize: '12px',
              cursor: isPaymentVerified ? 'pointer' : 'not-allowed',
              opacity: isPaymentVerified ? 1 : 0.5,
              boxShadow: '0 4px 10px rgba(0, 123, 110, 0.25)',
            }}
            disabled={!isPaymentVerified}
          >
            C08 · {isAr ? 'إصدار التقرير النهائي بالتوازي للطبيب والمريض' : 'Release Certified Report in Parallel to Doctor & Patient'}
          </button>
        </>
      )}
    </div>
  );
};

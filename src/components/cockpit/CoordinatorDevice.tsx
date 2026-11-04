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
  const isPatientPaid = !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed';
  const isPaymentVerified = !!activeCase.paymentVerified;
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

          {/* C02–C04: Set Pricing & Issue Invoice (Coordinator Gate 1) */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>C02–C04 · {isAr ? 'التسعير وإصدار فاتورة ZATCA' : 'Pricing & ZATCA Invoice'}</span>
            <button
              type="button"
              disabled={isInvoiceIssued || !isReferralApproved}
              onClick={() =>
                onUpdateCase({
                  invoiceIssued: true,
                  pricing: {
                    ...(activeCase.pricing || {
                      baseSar: (activeCase.tier || 1) === 1 ? 250 : 450,
                      totalSar: (activeCase.tier || 1) === 1 ? 250 : 450,
                      vatPercent: 15,
                      vatSar: 0,
                      tierName: (activeCase.tier || 1) === 1 ? 'Written' : 'Video',
                      paid: false,
                      tier: activeCase.tier || 1,
                    }),
                    invoiceNumber: 'INV-2026-001',
                    paid: false,
                  },
                })
              }
              style={{
                width: '100%',
                backgroundColor: isInvoiceIssued ? '#e2e8f0' : TEAL_PRIMARY,
                color: isInvoiceIssued ? '#475569' : '#ffffff',
                border: isInvoiceIssued ? '1px solid #cbd5e1' : 'none',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: 800,
                fontSize: '11px',
                cursor: isInvoiceIssued ? 'not-allowed' : (!isReferralApproved ? 'not-allowed' : 'pointer'),
                marginTop: '6px',
                opacity: (!isReferralApproved || isInvoiceIssued) ? 0.8 : 1,
                boxShadow: (!isReferralApproved || isInvoiceIssued) ? 'none' : '0 4px 12px rgba(0, 123, 110, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {isInvoiceIssued ? (
                <>
                  <span>✓</span>
                  <span>{isAr ? 'C04 · تم إصدار فاتورة ZATCA وتفعيل الدفع للمريض' : 'C04 · Invoice Issued & Checkout Unlocked'}</span>
                </>
              ) : (
                <span>{isAr ? 'C04 · اعتماد التسعير وإصدار الفاتورة الضريبية ZATCA' : 'C04 · Issue ZATCA Invoice & Send Payment Link'}</span>
              )}
            </button>
          </div>

          {/* C05–C06: Payment Verify & Push to India (Coordinator Gate 2) */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>C05–C06 · {isAr ? 'تحقق السداد وتوجيه الملف للهند' : 'Verify Payment & Dispatch'}</span>
            <button
              type="button"
              disabled={isPaymentVerified || !isPatientPaid}
              onClick={() => {
                onUpdateCase({
                  paymentVerified: true,
                  currentStage: 'WITH_CONSULTANT',
                  stage: 5,
                });
                onAdvanceStage();
              }}
              style={{
                width: '100%',
                backgroundColor: isPaymentVerified ? '#e2e8f0' : (isPatientPaid ? WHATSAPP_GREEN : '#f1f5f9'),
                color: isPaymentVerified ? '#475569' : (isPatientPaid ? '#ffffff' : '#94a3b8'),
                border: isPaymentVerified ? '1px solid #cbd5e1' : (isPatientPaid ? 'none' : '1px solid #e2e8f0'),
                borderRadius: '8px',
                padding: '12px',
                fontWeight: 800,
                fontSize: '11px',
                cursor: (isPaymentVerified || !isPatientPaid) ? 'not-allowed' : 'pointer',
                marginTop: '6px',
                opacity: (isPaymentVerified || !isPatientPaid) ? 0.8 : 1,
                boxShadow: (isPaymentVerified || !isPatientPaid) ? 'none' : '0 4px 14px rgba(37, 211, 102, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {isPaymentVerified ? (
                <>
                  <span>✓</span>
                  <span>{isAr ? 'C06 · تم اعتماد السداد وتوجيه الملف للهند بنجاح' : 'C06 · Payment Verified & Dispatched to India'}</span>
                </>
              ) : isPatientPaid ? (
                <span>
                  {isAr 
                    ? `⚡ C06 · اعتماد سداد مدى (${activeCase.pricing?.totalSar || 250} ر.س) وإحالة الملف للاستشاري بالهند` 
                    : `⚡ C06 · Approve Mada Payment (${activeCase.pricing?.totalSar || 250} SAR) & Dispatch to India`}
                </span>
              ) : (
                <span>{isAr ? 'C05 · بانتظار سداد المريض للفاتورة' : 'C05 · Awaiting Patient Payment'}</span>
              )}
            </button>
          </div>

          {/* Received Consultant Opinion Feedback Card */}
          {activeCase.secondOpinionSubmitted && (
            <div style={{ ...cardInnerStyle, backgroundColor: '#f0fdf4', borderColor: WHATSAPP_GREEN, borderWidth: '2px' }}>
              <span style={{ ...labelStyle, color: '#166534' }}>
                K06 · {isAr ? 'تم استلام الرأي الثاني من الهند (مستشفى أبولو)' : 'Second Opinion Received from India'}
              </span>
              <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700, marginTop: '4px', lineHeight: 1.4 }}>
                {activeCase.consultantOpinion || (isAr ? 'تأكيد التشخيص: ارتجاع الصمام التاجي. استمرار العلاج التحفظي وتكرار الإيكو بعد 6 أشهر.' : 'Diagnosis Confirmed: Moderate mitral regurgitation. Continue medical therapy.')}
              </div>
              <div style={{ fontSize: '10px', color: '#166534', marginTop: '4px', fontWeight: 700 }}>
                ✓ {isAr ? 'جاهز للختم والمصادقة المعتمدة والإصدار بالتوازي' : 'Ready for Certified Bilingual Stamping & Parallel Release'}
              </div>
            </div>
          )}

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

          {/* C08: Release Certified Report in Parallel (Strict Button Lock) */}
          <button
            type="button"
            disabled={!activeCase.secondOpinionSubmitted || activeCase.reportReleased}
            onClick={() => {
              onUpdateCase({ reportReleased: true, currentStage: 'CLOSED', stage: 7 });
              onAdvanceStage();
            }}
            style={{
              backgroundColor: activeCase.reportReleased ? '#e2e8f0' : (activeCase.secondOpinionSubmitted ? TEAL_PRIMARY : '#f1f5f9'),
              color: activeCase.reportReleased ? '#475569' : (activeCase.secondOpinionSubmitted ? '#ffffff' : '#94a3b8'),
              border: activeCase.reportReleased ? '1px solid #cbd5e1' : 'none',
              borderRadius: '8px',
              padding: '12px',
              fontWeight: 800,
              fontSize: '11px',
              cursor: (!activeCase.secondOpinionSubmitted || activeCase.reportReleased) ? 'not-allowed' : 'pointer',
              opacity: (!activeCase.secondOpinionSubmitted || activeCase.reportReleased) ? 0.8 : 1,
              boxShadow: (!activeCase.secondOpinionSubmitted || activeCase.reportReleased) ? 'none' : '0 4px 12px rgba(0, 123, 110, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {activeCase.reportReleased ? (
              <>
                <span>✓</span>
                <span>{isAr ? 'C08 · تم إصدار التقرير الطبي المعتمد وتسليمه بالتوازي' : 'C08 · Report Released in Parallel'}</span>
              </>
            ) : (
              <span>{isAr ? 'C08 · إصدار التقرير النهائي بالتوازي للطبيب والمريض' : 'C08 · Release Certified Report in Parallel to Doctor & Patient'}</span>
            )}
          </button>
        </>
      )}
    </div>
  );
};

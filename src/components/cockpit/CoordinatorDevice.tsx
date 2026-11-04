import React from 'react';
import { CockpitDeviceProps, TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from './types';

export const CoordinatorDevice: React.FC<CockpitDeviceProps> = ({
  activeCase,
  stageNum,
  onAdvanceStage,
  onUpdateCase,
  lang,
  onOpenReportModal,
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
                  ? (isAr ? 'تم اعتماد التحويل من الطبيب السعودي المعالج' : 'Referral Approved by Saudi Treating Doctor')
                  : (isAr ? 'في انتظار اعتماد الطبيب السعودي المعالج' : 'Awaiting Saudi Treating Doctor Approval')}
              </span>
            </div>
          </div>

          {/* C02–C04: Set Pricing & Issue Invoice (Coordinator Gate 1) */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>C02–C04 · {isAr ? 'التسعير وإصدار فاتورة ZATCA' : 'Pricing & ZATCA Invoice'}</span>
            <button
              type="button"
              disabled={isInvoiceIssued || !isReferralApproved}
              onClick={() => {
                const prescribedTier = activeCase.tier || (activeCase.modality === 'Video' ? 2 : 1);
                const prescribedAmount = prescribedTier === 2 ? 450 : 250;
                onUpdateCase({
                  invoiceIssued: true,
                  tier: prescribedTier,
                  pricing: {
                    ...(activeCase.pricing || {}),
                    baseSar: prescribedAmount,
                    totalSar: prescribedAmount,
                    vatPercent: 15,
                    vatSar: 0,
                    tierName: prescribedTier === 1 ? 'Written' : 'Video',
                    tier: prescribedTier,
                    invoiceNumber: 'INV-2026-001',
                    paid: false,
                  },
                });
              }}
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

          {/* Received Consultant Opinion & Bilingual Localization Workflow */}
          {activeCase.secondOpinionSubmitted && (
            <div style={{ ...cardInnerStyle, backgroundColor: '#f0fdf4', borderColor: WHATSAPP_GREEN, borderWidth: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ ...labelStyle, color: '#166534', margin: 0 }}>
                  K06 · {isAr ? 'تم استلام الرأي الإنجليزي من الهند' : 'English Second Opinion Received from India'}
                </span>
                <span style={{ fontSize: '9px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  Apollo Hospitals
                </span>
              </div>

              {/* English Original Findings */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '8px 10px', border: '1px solid #cbd5e1', fontSize: '10px', color: '#0f172a', direction: 'ltr', textAlign: 'left', lineHeight: 1.4 }}>
                <div style={{ fontWeight: 800, color: '#475569', marginBottom: '2px' }}>🇬🇧 English Original (Dr. Pradeep Kumar):</div>
                <div>{activeCase.consultantOpinion || 'Surgical Aortic Valve Replacement (SAVR) indicated; no concurrent CABG required based on 3D DICOM.'}</div>
              </div>

              {/* Certified Arabic Localization (C08-TR) */}
              <div style={{ backgroundColor: '#f0fdfa', borderRadius: '6px', padding: '8px 10px', border: `1px solid ${TEAL_SECONDARY}`, fontSize: '10px', color: '#0f172a', direction: 'rtl', textAlign: 'right', lineHeight: 1.4, marginTop: '8px' }}>
                <div style={{ fontWeight: 800, color: TEAL_PRIMARY, marginBottom: '2px' }}>🇸🇦 التعريب والتدقيق الطبي المعتمد (منسق رعاية ألو):</div>
                <div>استبدال الصمام الأبهري جراحياً (SAVR) هو الإجراء الموصى به بشدة؛ مع تأجيل المجازة التاجية.</div>
                <div style={{ fontSize: '9px', color: '#166534', fontWeight: 700, marginTop: '4px' }}>✓ مطابقة المصطلحات الطبية المعتمدة (SDAIA / المجلس الصحي)</div>
              </div>

              {/* Bilingual Draft Preview Button */}
              <button
                type="button"
                onClick={onOpenReportModal}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: TEAL_PRIMARY,
                  border: `1.5px solid ${TEAL_PRIMARY}`,
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>👁️</span>
                <span>{isAr ? 'معاينة مسودة التقرير المعتمد ثنائي اللغة (Bilingual PDF)' : 'Preview Certified Bilingual Dossier (PDF)'}</span>
              </button>
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
                <span>{isAr ? 'C08 · تم اعتماد وتسليم التقرير الطبي ثنائي اللغة بالتوازي' : 'C08 · Bilingual Report Released in Parallel'}</span>
              </>
            ) : (
              <span>
                {isAr
                  ? '⚡ C08 · اعتماد وختم التقرير ثنائي اللغة وإرساله بالتوازي (للطبيب والمريض)'
                  : '⚡ C08 · Certify & Release Bilingual Report in Parallel to Doctor & Patient'}
              </span>
            )}
          </button>

          {/* Final Released PDF Quick Access Button */}
          {activeCase.reportReleased && (
            <button
              type="button"
              onClick={onOpenReportModal}
              style={{
                width: '100%',
                backgroundColor: WHATSAPP_GREEN,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
              }}
            >
              <span>📑</span>
              <span>{isAr ? 'استعراض التقرير المعتمد النهائي (PDF ثنائي اللغة)' : 'Open Released Certified Bilingual Dossier (PDF)'}</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

import React from 'react';
import { ClinicalCase } from '../../../types';
import { TEAL_PRIMARY, TEAL_BG, WHATSAPP_GREEN } from '../types';

interface PatientPaymentGateCardProps {
  activeCase: ClinicalCase;
  isAr: boolean;
  cardInnerStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const PatientPaymentGateCard: React.FC<PatientPaymentGateCardProps> = ({
  activeCase,
  isAr,
  cardInnerStyle,
  labelStyle,
  onUpdateCase,
}) => {
  const prescribedTier = activeCase.tier || (activeCase.modality === 'Video' ? 2 : 1);
  const prescribedAmount = prescribedTier === 2 ? 450 : 250;
  const prescribedLabelAr = prescribedTier === 2 
    ? 'مكالمة فيديو تفاعلية + تقرير استشاري كتابي معتمد (Tier 2)' 
    : 'تقرير استشاري كتابي تخصصي معتمد (Tier 1)';
  const prescribedLabelEn = prescribedTier === 2 
    ? 'Video Telehealth Consultation + Certified Written Report (Tier 2)' 
    : 'Certified Written Second Opinion Report (Tier 1)';

  const allowedLabels = (activeCase.allowedPaymentMethods && activeCase.allowedPaymentMethods.length > 0
    ? activeCase.allowedPaymentMethods
    : ['mada', 'applepay']
  ).map((m) => m === 'mada' ? (isAr ? 'مدى' : 'Mada') : m === 'applepay' ? 'Apple Pay' : m === 'visa' ? 'Visa' : 'Tabby').join(' / ');

  return (
    <div style={{ ...cardInnerStyle, borderColor: WHATSAPP_GREEN, borderWidth: '2px', backgroundColor: '#f0fdf4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ ...labelStyle, color: '#166534' }}>
          P19 · {isAr ? 'بوابة الدفع وسداد الفاتورة' : 'Payment Checkout'}
        </span>
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#166534', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
          {isAr ? 'معتمد من الطبيب' : 'Approved by MD'}
        </span>
      </div>

      {!activeCase.invoiceIssued ? (
        /* Coordinator Gate 1: Waiting for Coordinator to Issue Invoice */
        <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isAr ? 'اعتمد الطبيب السعودي المعالج إحالتك الطبية' : 'Saudi Treating Doctor Approved Referral'}
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                {isAr
                  ? 'منسق رعاية ألو يراجع الآن خطة الإحالة ويصدر الفاتورة الضريبية ZATCA (C02-C04)...'
                  : 'Alo Coordinator is issuing your ZATCA tax invoice (C02-C04)...'}
              </p>
            </div>
          </div>
        </div>
      ) : !activeCase.pricing?.paid ? (
        /* Invoice Issued: Active Payment Form for Doctor's Prescribed Modality ONLY */
        <>
          <div
            style={{
              marginBottom: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              border: `2px solid ${TEAL_PRIMARY}`,
              backgroundColor: TEAL_BG,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: TEAL_PRIMARY, textTransform: 'uppercase' }}>
                {isAr ? 'الباقة المعتمدة من الطبيب السعودي المعالج:' : 'Prescribed by Saudi Treating Doctor:'}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: TEAL_PRIMARY,
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                Tier {prescribedTier} · {prescribedAmount} SAR
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              {isAr ? prescribedLabelAr : prescribedLabelEn}
            </div>

            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
              {isAr ? 'فاتورة ضريبية معتمدة من هيئة الزكاة والضريبة والجمارك (ZATCA)' : 'ZATCA Tax Compliant Invoice (INV-2026-001)'}
            </div>
          </div>

          {/* Action Button: Pay Now for the Prescribed Amount */}
          <button
            type="button"
            onClick={() => {
              onUpdateCase({
                tier: prescribedTier,
                paymentVerified: false,
                pricing: {
                  ...(activeCase.pricing || {}),
                  tier: prescribedTier,
                  baseSar: prescribedAmount,
                  totalSar: prescribedAmount,
                  vatPercent: 15,
                  vatSar: 0,
                  tierName: prescribedTier === 1 ? 'Written' : 'Video',
                  invoiceNumber: activeCase.pricing?.invoiceNumber || 'INV-2026-001',
                  paid: true,
                },
                paymentDetails: {
                  ...(activeCase.paymentDetails || {}),
                  method: (activeCase.allowedPaymentMethods && activeCase.allowedPaymentMethods[0]) || 'mada',
                  status: 'completed',
                  amount: prescribedAmount,
                  invoiceNumber: activeCase.pricing?.invoiceNumber || 'INV-2026-001',
                  currency: 'SAR',
                },
              });
            }}
            style={{
              width: '100%',
              backgroundColor: WHATSAPP_GREEN,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(18, 140, 126, 0.25)',
            }}
          >
            <span>💳</span>
            <span>
              {isAr
                ? `سداد ${prescribedAmount} ر.س عبر ${allowedLabels}`
                : `Pay ${prescribedAmount} SAR via ${allowedLabels}`}
            </span>
          </button>
        </>
      ) : (
        /* Coordinator Gate 2: Paid, Waiting for Coordinator Verification & Dispatch */
        <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: `1.5px solid ${WHATSAPP_GREEN}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#166534', margin: 0 }}>
                {isAr ? '✓ تم استلام سداد الفاتورة (INV-2026-001)' : '✓ Payment Confirmed (INV-2026-001)'}
              </p>
              <p style={{ fontSize: '11px', color: '#334155', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                {isAr
                  ? 'منسق رعاية ألو يتحقق من إشعار السداد ويوجه الملف الآن إلى الاستشاري بالهند (C06)...'
                  : 'Alo Coordinator is verifying transaction & dispatching dossier to India (C06)...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

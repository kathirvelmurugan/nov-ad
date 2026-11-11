import React from 'react';
import { ClinicalCase, PaymentMethodId } from '../../types';
import {
  TEAL_PRIMARY,
  TEAL_ACCENT,
  TEAL_BG,
  WHATSAPP_GREEN,
  ALL_PAYMENT_METHODS,
  getBadgeStyle,
  getPrimaryButtonStyle,
} from './coordinatorStyles';

interface Props {
  activeCase: ClinicalCase;
  lang: 'ar' | 'en';
  isPaid: boolean;
  isPaymentVerified: boolean;
  isInvoiceIssued: boolean;
  selectedConsultationType: 'written' | 'video';
  setSelectedConsultationType: (type: 'written' | 'video') => void;
  selectedMethods: PaymentMethodId[];
  toggleMethod: (id: PaymentMethodId) => void;
  onIssuePaymentLink: () => void;
  onConfirmPaymentAndPush: () => void;
}

export const CoordinatorPaymentGateTab: React.FC<Props> = ({
  activeCase,
  lang,
  isPaid,
  isPaymentVerified,
  isInvoiceIssued,
  selectedConsultationType,
  setSelectedConsultationType,
  selectedMethods,
  toggleMethod,
  onIssuePaymentLink,
  onConfirmPaymentAndPush,
}) => {
  const isAr = lang === 'ar';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";
  const paymentLinkIssued = !!activeCase.metadata?.paymentLinkIssued || isInvoiceIssued;

  return (
    <section aria-labelledby="c01-heading" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 id="c01-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, margin: '0 0 6px', fontFamily }}>
          {isAr ? 'مراجعة ملف الإحالة وتنسيق الفاتورة · C01–C06' : 'Referral Review & Payment Coordination · C01–C06'}
        </h2>
        <p style={{ fontSize: '14px', color: '#4A5568', margin: 0, fontFamily }}>
          {isAr
            ? 'استلم منسق رعاية ألو ملف الإحالة من الطبيب السعودي (D10). الخطوة 1: اختر الباقة وطرق الدفع وأرسلها للمريض. الخطوة 2: تحقق من السداد ثم وصّل الحالة للاستشاري الهندي.'
            : 'ALO Care Coordinator received referral from Saudi Doctor (D10). Gate 1: select package & payment methods and assign to Patient. Gate 2: verify payment and connect Indian Consultant.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>
            {isAr ? 'بيانات المريض والمستشفى المحيل:' : 'Patient & Referring Hospital:'}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
            {isAr ? activeCase.patientNameAr : (activeCase.patientNameEn || activeCase.patientName)} (10********)
          </span>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
            {activeCase.treatingDoctor?.hospital || (isAr ? 'المستشفى المعتمد' : 'Partner Hospital')} · {activeCase.treatingDoctor?.name || (isAr ? 'طبيب معالج' : 'Treating Physician')}
          </p>
        </div>

        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>
            {isAr ? 'الاستشاري الدولي المرشح:' : 'Assigned International Consultant:'}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: TEAL_PRIMARY }}>
            {activeCase.consultant?.name || 'Dr. Arjun Mehta'}
          </span>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
            {activeCase.consultant?.center || 'KIMS Heart Institute'} · {activeCase.consultant?.city || 'India'}
          </p>
        </div>
      </div>

      {/* GATE 1: Package Confirmation + Payment Methods Selection + Assign to Patient */}
      <div style={{
        padding: '20px',
        borderRadius: '14px',
        border: `2px solid ${isInvoiceIssued ? TEAL_ACCENT : '#CBD5E1'}`,
        backgroundColor: isInvoiceIssued ? '#F0FDFA' : '#FFFFFF',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: TEAL_PRIMARY }}>
            {isAr ? 'الخطوة 1 (C01–C04): تحديد الباقة وطرق الدفع وإسنادها للمريض' : 'Gate 1 (C01–C04): Confirm Package, Select Payment Methods & Assign to Patient'}
          </span>
          <span style={getBadgeStyle(isInvoiceIssued ? 'success' : 'info', fontFamily)}>
            {isInvoiceIssued
              ? (isAr ? 'تم إسناد الفاتورة للمريض ✓' : 'Assigned to Patient ✓')
              : (isAr ? 'بانتظار إعداد المنسق' : 'Pending Coordinator Setup')}
          </span>
        </div>

        {/* Tier Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
            {isAr ? 'تأكيد باقة الاستشارة:' : 'Confirm Consultation Package & Fee:'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {(['written', 'video'] as const).map((typeKey) => {
              const active = selectedConsultationType === typeKey;
              const price = typeKey === 'written' ? 75 : 150;
              return (
                <button
                  key={typeKey}
                  type="button"
                  disabled={isPaid}
                  onClick={() => setSelectedConsultationType(typeKey)}
                  style={{
                    textAlign: isAr ? 'right' : 'left',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${active ? TEAL_PRIMARY : '#E2E8F0'}`,
                    backgroundColor: active ? TEAL_BG : '#FFFFFF',
                    cursor: isPaid ? 'not-allowed' : 'pointer',
                    opacity: isPaid ? 0.75 : 1,
                    fontFamily,
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: active ? TEAL_PRIMARY : '#1E293B' }}>
                    {typeKey === 'written'
                      ? (isAr ? 'الفئة 1: رأي مكتوب فقط' : 'Tier 1: Written Opinion Only')
                      : (isAr ? 'الفئة 2: مكالمة مرئية + رأي مكتوب' : 'Tier 2: Video Call + Written Opinion')}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginTop: '4px' }}>
                    {price} {isAr ? 'ر.س (شامل 15% ضريبة)' : 'SAR (incl. 15% VAT)'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
            {isAr
              ? 'اختر طرق الدفع المتاحة للمريض (سيظهر للمريض ما تحدده فقط):'
              : 'Select Allowed Payment Methods for Patient (only checked methods will appear on Checkout):'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {ALL_PAYMENT_METHODS.map((pm) => {
              const checked = selectedMethods.includes(pm.id);
              return (
                <button
                  key={pm.id}
                  type="button"
                  disabled={isPaid}
                  onClick={() => toggleMethod(pm.id)}
                  aria-pressed={checked}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `2px solid ${checked ? TEAL_PRIMARY : '#E2E8F0'}`,
                    backgroundColor: checked ? '#FFFFFF' : '#F8FAFC',
                    cursor: isPaid ? 'not-allowed' : 'pointer',
                    opacity: isPaid ? 0.75 : 1,
                    textAlign: isAr ? 'right' : 'left',
                    fontFamily,
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: checked ? TEAL_PRIMARY : '#FFFFFF',
                    border: `2px solid ${checked ? TEAL_PRIMARY : '#CBD5E1'}`,
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 900,
                    flexShrink: 0,
                  }}>
                    {checked ? '✓' : ''}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: checked ? TEAL_PRIMARY : '#334155' }}>
                      {isAr ? pm.labelAr : pm.labelEn}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {isAr ? pm.descAr : pm.descEn}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedMethods.length === 0 && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', fontWeight: 700, color: '#DC2626' }}>
              {isAr ? '⚠ يرجى اختيار طريقة دفع واحدة على الأقل قبل الإرسال للمريض.' : '⚠ Please select at least one payment method before assigning to the patient.'}
            </p>
          )}
        </div>

        {!isPaid && (
          <button
            type="button"
            onClick={onIssuePaymentLink}
            disabled={selectedMethods.length === 0}
            style={{
              ...getPrimaryButtonStyle(false, fontFamily),
              opacity: selectedMethods.length === 0 ? 0.5 : 1,
              cursor: selectedMethods.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {isInvoiceIssued
              ? (isAr ? 'C04 · تحديث طرق الدفع وإعادة الإرسال للمريض →' : 'C04 · Update Methods & Re-Open Patient Checkout →')
              : (isAr ? 'C04 · اعتماد الفاتورة وإسناد الدفع للمريض →' : 'C04 · Assign Payment Methods & Send Invoice to Patient →')}
          </button>
        )}

        {paymentLinkIssued && !isPaid && (
          <p style={{ margin: '10px 0 0', fontSize: '12px', color: TEAL_PRIMARY, fontWeight: 700 }}>
            {isAr
              ? `✓ تم إسناد الفاتورة (${activeCase.pricing?.invoiceNumber || 'ZATCA'}) للمريض بطرق الدفع المحددة وبانتظار السداد.`
              : `✓ Invoice (${activeCase.pricing?.invoiceNumber || 'ZATCA'}) assigned to Patient with selected methods. Awaiting payment.`}
          </p>
        )}
      </div>

      {/* GATE 2: Payment Confirmation Verification & Indian Consultant Dispatch */}
      <div style={{
        padding: '20px',
        borderRadius: '14px',
        backgroundColor: isPaymentVerified ? '#ECFDF5' : (isPaid ? '#F0FDF4' : '#FFFBEB'),
        border: `2px solid ${isPaid ? WHATSAPP_GREEN : '#FDE68A'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: isPaid ? '#065F46' : '#92400E' }}>
            {isAr ? 'الخطوة 2 (C05–C06): التحقق من الدفع وربط الاستشاري الهندي' : 'Gate 2 (C05–C06): Verify Patient Payment & Connect Indian Consultant'}
          </span>
          <span style={getBadgeStyle(isPaymentVerified ? 'success' : (isPaid ? 'info' : 'warning'), fontFamily)}>
            {isPaymentVerified
              ? (isAr ? 'تم التحقق والإرسال للاستشاري ✓' : 'Verified & Sent to Consultant ✓')
              : isPaid
                ? (isAr ? 'تم الدفع من المريض · بانتظار تحقق المنسق' : 'Paid by Patient · Pending Coordinator Verification')
                : (isAr ? 'مقفل لحين سداد المريض' : 'Locked Until Patient Pays')}
          </span>
        </div>

        {isPaid ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{isAr ? 'المبلغ المدفوع:' : 'Amount Paid:'}</span>
                <strong style={{ fontSize: '14px', color: '#065F46' }}>
                  {activeCase.paymentDetails?.amount || activeCase.pricing?.totalSar || 150} SAR
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{isAr ? 'طريقة الدفع المستخدمة:' : 'Method Used:'}</span>
                <strong style={{ fontSize: '14px', color: '#065F46', textTransform: 'uppercase' }}>
                  {activeCase.paymentDetails?.method || 'mada'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{isAr ? 'رقم الفاتورة الضريبية:' : 'ZATCA Invoice #:'}</span>
                <strong style={{ fontSize: '13px', color: '#0F172A', fontFamily: 'monospace' }}>
                  {activeCase.paymentDetails?.invoiceNumber || activeCase.pricing?.invoiceNumber || 'INV-2026-001'}
                </strong>
              </div>
            </div>

            {!isPaymentVerified && (
              <button
                type="button"
                onClick={onConfirmPaymentAndPush}
                style={{ ...getPrimaryButtonStyle(false, fontFamily), backgroundColor: WHATSAPP_GREEN }}
              >
                {isAr
                  ? 'C05–C06 · تأكيد استلام الدفع وتوصيل الملف للاستشاري الهندي ←'
                  : 'C05–C06 · Verify Payment & Connect to Indian Consultant →'}
              </button>
            )}
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#78350F', fontWeight: 600 }}>
            {isAr
              ? 'لا يمكن ربط الحالة بالاستشاري الهندي إلا بعد إتمام المريض للسداد وظهور تأكيد الدفع هنا للتحقق منه.'
              : 'The Indian Consultant remains locked until the patient completes payment and the Coordinator verifies the confirmation here.'}
          </p>
        )}
      </div>
    </section>
  );
};

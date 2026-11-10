import React from 'react';
import { ClinicalCase } from '../../types';
import { BilingualReportModal } from '../cockpit/BilingualReportModal';
import {
  TEAL_PRIMARY,
  TEAL_ACCENT,
  TEAL_BG,
  WHATSAPP_GREEN,
  getBadgeStyle,
  getPrimaryButtonStyle,
} from './coordinatorStyles';

interface Props {
  lang: 'ar' | 'en';
  activeCase: ClinicalCase;
  isSaudiDoctorApproved: boolean;
  isProcessing: boolean;
  pdf1Released?: boolean;
  onReleasePDF1: () => void;
  isReportPreviewOpen: boolean;
  setIsReportPreviewOpen: (open: boolean) => void;
}

export const CoordinatorReportReleaseTab: React.FC<Props> = ({
  lang,
  activeCase,
  isSaudiDoctorApproved,
  isProcessing,
  pdf1Released,
  onReleasePDF1,
  isReportPreviewOpen,
  setIsReportPreviewOpen,
}) => {
  const isAr = lang === 'ar';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const t = {
    c08_title: isAr ? 'إصدار التقرير الأول' : 'Release Report PDF 1',
    c08_qr: isAr ? 'رمز التحقق QR' : 'QR Verification Code',
  };

  return (
    <section aria-labelledby="c08-heading" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 id="c08-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, margin: 0, fontFamily }}>
          {isAr ? 'اعتماد وإسناد التقرير الطبي للمريض (PDF 1)' : 'Assign & Release Certified Report to Patient (PDF 1)'}
        </h2>
        <button
          type="button"
          onClick={() => setIsReportPreviewOpen(true)}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: `1.5px solid ${TEAL_PRIMARY}`,
            backgroundColor: '#FFFFFF',
            color: TEAL_PRIMARY,
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily,
          }}
        >
          👁️ {isAr ? 'معاينة التقرير المعتمد (PDF)' : 'Preview Certified Report (PDF)'}
        </button>
      </div>

      {!isSaudiDoctorApproved ? (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: '#FFFBEB',
          border: '2px solid #FDE68A',
          color: '#92400E',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px' }}>
            🔒 {isAr ? 'بانتظار اعتماد الطبيب السعودي المعالج لرأي الاستشاري (D12)' : 'Locked — Awaiting Saudi Treating Doctor Endorsement (D12)'}
          </div>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
            {isAr
              ? 'لا يمكن إسناد التقرير النهائي للمريض إلا بعد اطلاع الطبيب السعودي المعالج على رأي الاستشاري الدولي واعتماده رسمياً.'
              : 'The final report cannot be assigned to the patient until the Saudi Treating Doctor reviews the Indian Consultant opinion and submits endorsement.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: '#F0FDF4',
            border: `1.5px solid ${WHATSAPP_GREEN}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                ✓ {isAr ? 'تم اعتماد رأي الاستشاري من الطبيب السعودي المعالج' : 'Endorsed by Saudi Treating Doctor'}
              </span>
              <span style={getBadgeStyle('success', fontFamily)}>
                {activeCase.saudiEndorsement?.doctorName || activeCase.treatingDoctor?.name} · {activeCase.saudiEndorsement?.scfhsLicense || 'SCFHS-2024-KSA-8821'}
              </span>
            </div>
            {activeCase.consultantOpinion && (
              <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #BBF7D0', fontSize: '12px', color: '#1E293B', direction: 'ltr', textAlign: 'left', lineHeight: 1.5 }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: TEAL_PRIMARY }}>
                  Indian Consultant Verdict ({activeCase.consultant?.name || 'Dr. Arjun Mehta'}):
                </strong>
                {activeCase.consultantOpinion}
              </div>
            )}
            {activeCase.saudiEndorsement?.localClinicalNotes && (
              <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #BBF7D0', fontSize: '12px', color: '#065F46' }}>
                <strong>{isAr ? 'توجيهات الطبيب السعودي: ' : 'Saudi Doctor Directives: '}</strong>
                {activeCase.saudiEndorsement.localClinicalNotes}
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: TEAL_BG,
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: isAr ? 'row-reverse' : 'row',
            gap: '20px',
            alignItems: 'center',
            border: `1px solid ${TEAL_ACCENT}30`,
          }}>
            <div style={{
              width: '96px',
              height: '96px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${TEAL_ACCENT}`,
              flexShrink: 0,
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="3" height="3" />
                <rect x="18" y="14" width="3" height="3" />
                <rect x="14" y="18" width="3" height="3" />
                <rect x="18" y="18" width="3" height="3" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '14px', color: TEAL_PRIMARY, fontFamily }}>
                {t.c08_qr}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#4A5568', fontFamily }}>
                {isAr
                  ? 'امسح رمز QR للتحقق من صحة التقرير وأصالة الرأي الطبي الثاني.'
                  : 'Scan QR code to verify report authenticity and second opinion certification.'}
              </p>
            </div>
          </div>

          {pdf1Released || activeCase.reportReleased ? (
            <div style={{ textAlign: 'center', padding: '24px', backgroundColor: TEAL_BG, borderRadius: '12px', border: `1px solid ${TEAL_ACCENT}` }}>
              <span style={getBadgeStyle('success', fontFamily)}>
                {isAr
                  ? '✓ تم إسناد وإتاحة التقرير المعتمد (PDF 1) للمريض بنجاح'
                  : '✓ Certified Report (PDF 1) Assigned & Released to Patient'}
              </span>
              <p style={{ margin: '12px 0 0', fontSize: '13px', color: TEAL_PRIMARY, fontWeight: 700, fontFamily }}>
                {isAr
                  ? 'أصبح بإمكان المريض الآن عرض وطباعة التقرير الطبي المعتمد من شاشته.'
                  : 'The patient can now view and download the certified report on their portal.'}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={onReleasePDF1}
              disabled={isProcessing}
              style={getPrimaryButtonStyle(isProcessing, fontFamily)}
              aria-busy={isProcessing}
            >
              {isProcessing
                ? (isAr ? 'جارٍ إسناد التقرير للمريض...' : 'Assigning Report to Patient...')
                : (isAr
                    ? 'C08 · إسناد وإرسال التقرير المعتمد (PDF 1) إلى المريض ←'
                    : 'C08 · Assign & Release Certified Report (PDF 1) to Patient →')}
            </button>
          )}
        </>
      )}

      <BilingualReportModal
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
        activeCase={activeCase}
        lang={lang}
      />
    </section>
  );
};

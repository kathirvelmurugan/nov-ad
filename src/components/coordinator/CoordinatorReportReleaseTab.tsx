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

  const isDispatched = Boolean(
    activeCase.metadata?.coordinatorDispatched ||
    pdf1Released ||
    activeCase.reportReleased
  );

  const consultantAnswers =
    (activeCase.consultantAnswers && activeCase.consultantAnswers.length > 0
      ? activeCase.consultantAnswers
      : (activeCase.metadata?.consultantAnswers as string[] | undefined) ||
        (activeCase.metadata?.focusAnswers as string[] | undefined)) || [];

  const focusQuestions =
    activeCase.treatingDoctor?.focusQuestions ||
    activeCase.treatingDoctor?.focusQuestionsEn ||
    [];

  const t = {
    c08_heading: isAr
      ? 'اعتماد الرأي الطبي وإرساله إلى المريض والطبيب السعودي معاً (PDF 1)'
      : 'Verify & Dispatch Certified Report to Patient and Saudi Doctor (PDF 1)',
    c08_qr: isAr ? 'رمز التحقق QR' : 'QR Verification Code',
    dispatch_button: isAr
      ? 'C08 · اعتماد وتوزيع الرأي الطبي للمريض والطبيب السعودي معاً ←'
      : 'C08 · Verify & Dispatch Opinion to Patient & Saudi Doctor at once →',
    dispatching: isAr
      ? 'جارٍ اعتماد وتوزيع التقرير للمريض والطبيب...'
      : 'Verifying & Dispatching to Patient and Doctor...',
    dispatched_badge: isAr
      ? '✓ تم اعتماد وتوزيع الرأي الطبي (PDF 1) بنجاح إلى المريض والطبيب السعودي معاً'
      : '✓ Certified Opinion (PDF 1) Verified & Dispatched simultaneously to Patient and Saudi Doctor',
    dispatched_desc: isAr
      ? 'تم إتاحة التقرير الطبي ونافذة المتابعة للمريض، وتم ترحيل الملف في الوقت ذاته إلى الطبيب السعودي المعالج للاعتماد وإصدار الأوامر السريرية.'
      : 'Report released to patient for 21-day follow-up, and simultaneously routed to Saudi Treating Doctor for clinical endorsement and hospital orders.',
  };

  return (
    <section aria-labelledby="c08-heading" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Preview Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 id="c08-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, margin: 0, fontFamily }}>
            {t.c08_heading}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B', fontFamily }}>
            {isAr
              ? 'مرحلة التحقق الإداري والسريري لمنسق رعاية ألو وإرسال التقرير المعتمد إلى المريض والطبيب السعودي في خطوة واحدة متزامنة.'
              : 'ALO Coordinator clinical review and simultaneous dispatch of certified second opinion to both patient and Saudi doctor.'}
          </p>
        </div>
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
          👁️ {isAr ? 'معاينة التقرير المعتمد (PDF 1)' : 'Preview Certified Report (PDF 1)'}
        </button>
      </div>

      {/* Submitted Opinion Review Card (from Indian Consultant) */}
      <div
        style={{
          padding: '18px 20px',
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #CBD5E1',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: TEAL_PRIMARY, fontFamily }}>
            📋 {isAr ? 'تقرير الرأي الطبي المستلم من الاستشاري الدولي:' : 'Clinical Opinion Received from International Consultant:'}
          </span>
          <span style={getBadgeStyle('success', fontFamily)}>
            {activeCase.consultant?.name || 'Dr. Pradeep Kumar (Apollo Hospitals)'} · {isAr ? 'تم الاستلام' : 'Received'}
          </span>
        </div>

        {activeCase.consultantOpinion && (
          <div
            style={{
              backgroundColor: '#F8FAFC',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              color: '#1E293B',
              direction: 'ltr',
              textAlign: 'left',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ display: 'block', marginBottom: '4px', color: TEAL_PRIMARY }}>
              Clinical Second Opinion Summary:
            </strong>
            {activeCase.consultantOpinion}
          </div>
        )}

        {/* Focus Questions Answers */}
        {consultantAnswers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', fontFamily }}>
              {isAr ? 'إجابات الأسئلة التوجيهية للطبيب السعودي:' : 'Responses to Saudi Treating Doctor Focus Questions:'}
            </span>
            {consultantAnswers.map((ans, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                  Q{idx + 1}: {focusQuestions[idx] || (isAr ? `السؤال #${idx + 1}` : `Focus Question #${idx + 1}`)}
                </div>
                <div style={{ color: '#047857', direction: 'ltr', textAlign: 'left' }}>
                  ↳ <strong>Answer:</strong> {ans}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR & Verification Box */}
      <div
        style={{
          backgroundColor: TEAL_BG,
          borderRadius: '12px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: isAr ? 'row-reverse' : 'row',
          gap: '20px',
          alignItems: 'center',
          border: `1px solid ${TEAL_ACCENT}30`,
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${TEAL_ACCENT}`,
            flexShrink: 0,
          }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="1.5">
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
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: TEAL_PRIMARY, fontFamily }}>
            {t.c08_qr}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#4A5568', fontFamily, lineHeight: 1.5 }}>
            {isAr
              ? 'امسح رمز QR للتحقق المعتمد من صحة الرأي الثاني والمطابقة الرقمية وفق معايير المركز السعودي لسلامة المرضى ووزارة الصحة.'
              : 'Scan QR code for cryptographically verified second opinion authentication under MOH and Saudi Patient Safety Center regulations.'}
          </p>
        </div>
      </div>

      {/* Dispatch Action or Success Confirmation */}
      {isDispatched ? (
        <div
          style={{
            textAlign: 'center',
            padding: '24px',
            backgroundColor: '#F0FDF4',
            borderRadius: '12px',
            border: `1.5px solid ${WHATSAPP_GREEN}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <span style={getBadgeStyle('success', fontFamily)}>
            {t.dispatched_badge}
          </span>
          <p style={{ margin: 0, fontSize: '13px', color: '#166534', fontWeight: 700, fontFamily, lineHeight: 1.6 }}>
            {t.dispatched_desc}
          </p>
          {isSaudiDoctorApproved && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #BBF7D0',
                fontSize: '12px',
                color: '#065F46',
                fontWeight: 600,
              }}
            >
              ✓ {isAr ? 'تمت إضافة الاعتماد السريري المحلي من قبل الطبيب السعودي المعالج' : 'Local clinical endorsement appended by Saudi Treating Doctor'}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onReleasePDF1}
          disabled={isProcessing}
          style={getPrimaryButtonStyle(isProcessing, fontFamily)}
          aria-busy={isProcessing}
        >
          {isProcessing ? t.dispatching : t.dispatch_button}
        </button>
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

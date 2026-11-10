import React from 'react';
import { CockpitDeviceProps, TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from './types';
import { PatientJourneyTracker } from './patient/PatientJourneyTracker';
import { PatientIntakeFormCard } from './patient/PatientIntakeFormCard';
import { PatientPaymentGateCard } from './patient/PatientPaymentGateCard';

export const PatientDevice: React.FC<CockpitDeviceProps> = ({
  activeCase,
  stageNum,
  onAdvanceStage,
  onUpdateCase,
  lang,
  onOpenReportModal,
}) => {
  const isAr = lang === 'ar';

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
      {/* 9-Stage Clinical Progress Tracker */}
      <PatientJourneyTracker
        stageNum={stageNum}
        isAr={isAr}
        cardInnerStyle={cardInnerStyle}
        labelStyle={labelStyle}
      />

      {/* STAGE 1: Real-time Patient Intake Form */}
      {stageNum === 1 && (
        <PatientIntakeFormCard
          activeCase={activeCase}
          stageNum={stageNum}
          isAr={isAr}
          cardInnerStyle={cardInnerStyle}
          labelStyle={labelStyle}
          onUpdateCase={onUpdateCase}
          onAdvanceStage={onAdvanceStage}
        />
      )}

      {/* STAGE 2–3: Interactive Waiting Room */}
      {stageNum >= 2 && stageNum <= 3 && (
        <div style={cardInnerStyle}>
          <span style={labelStyle}>P02 · {isAr ? 'قيد المراجعة السريرية' : 'Clinical Triage in Progress'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <span style={{ fontSize: '24px' }}>⏳</span>
            <div>
              <p style={{ fontSize: '12px', color: '#1e293b', margin: 0, fontWeight: 700 }}>
                {stageNum === 2 
                  ? (isAr ? 'ممرضة ألو تدقق الفحوصات وحجب الهوية (N04)' : 'Alo Nurse is auditing vitals & SDAIA masking (N04)')
                  : (isAr ? 'الطبيب السعودي المعالج يصيغ أسئلة الاستشارة (D07)' : 'Saudi Doctor is framing 3 focus questions (D07)')}
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
                {isAr ? 'ستصلك رسالة واتساب فور اكتمال المراجعة.' : 'WhatsApp update will be dispatched upon review.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: P19 Payment Checkout & Coordinator Gates */}
      {stageNum === 4 && (
        <PatientPaymentGateCard
          activeCase={activeCase}
          isAr={isAr}
          cardInnerStyle={cardInnerStyle}
          labelStyle={labelStyle}
          onUpdateCase={onUpdateCase}
        />
      )}

      {/* STAGE 5–6: Waiting for Consultant or Treating Doctor Endorsement */}
      {stageNum >= 5 && !activeCase.doctorReleasedToPatient && (
        <div style={{ ...cardInnerStyle, backgroundColor: '#f0fdf4', borderColor: WHATSAPP_GREEN }}>
          <span style={{ ...labelStyle, color: '#166534' }}>
            {activeCase.coordinatorForwardedToDoctor 
              ? (isAr ? 'P24 · قيد مصادقة واعتماد الطبيب السعودي المعالج' : 'P24 · Awaiting Treating Physician Endorsement')
              : (isAr ? 'P21 · تم تأكيد السداد والملف قيد الدراسة السريرية' : 'P21 · Payment Confirmed & In Clinical Review')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {activeCase.coordinatorForwardedToDoctor
                  ? (isAr ? 'طبيبك المعالج د. عبدالله الشمري يراجع التقرير لاعتماده' : 'Dr. Abdullah Al-Shammari is reviewing the report for sign-off')
                  : (isAr ? 'فاتورة ضريبية مسددة (INV-2026-001)' : 'Paid Tax Invoice (INV-2026-001)')}
              </p>
              <p style={{ fontSize: '11px', color: '#166534', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                {activeCase.coordinatorForwardedToDoctor
                  ? (isAr ? 'الملف الطبي المترجم وصل لطبيبك المعالج بمستشفى رعاية الرياض. سيتاح التقرير لك فور اعتماده رسمياً.' : 'Bilingual dossier submitted to your treating doctor. Download unlocks immediately upon physician sign-off.')
                  : (isAr ? 'الاستشاري د. براديب كومار يراجع الأشعة 3D والأسئلة الثلاثة الآن في الهند.' : 'Dr. Pradeep Kumar is reviewing 3D DICOM & focus questions at Apollo Hospitals.')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 6+: P26 Final Report Released BY SAUDI DOCTOR */}
      {activeCase.doctorReleasedToPatient && (
        <div style={{ ...cardInnerStyle, backgroundColor: '#f0fdfa', borderColor: TEAL_SECONDARY }}>
          <span style={labelStyle}>{isAr ? 'P26 · تم استلام التقرير الطبي المعتمد من طبيبك المعالج' : 'P26 · Approved Opinion Released by Doctor'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '24px' }}>📄</span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {isAr ? 'معتمد رسمياً من د. عبدالله الشمري (مستشفى رعاية الرياض)' : 'Officially endorsed by Dr. Abdullah Al-Shammari'}
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
                ALO-2026-BILINGUAL-SECOND-OPINION.pdf
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenReportModal}
            style={{
              width: '100%',
              backgroundColor: TEAL_PRIMARY,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0, 123, 110, 0.25)',
            }}
          >
            <span>📑</span>
            <span>{isAr ? 'عرض وتحميل التقرير الطبي المعتمد (PDF)' : 'View & Download Certified Dossier (PDF)'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

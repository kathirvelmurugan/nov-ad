import React from 'react';
import { TEAL_PRIMARY, TEAL_SECONDARY } from '../types';

interface PatientJourneyTrackerProps {
  stageNum: number;
  isAr: boolean;
  cardInnerStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

export const PatientJourneyTracker: React.FC<PatientJourneyTrackerProps> = ({
  stageNum,
  isAr,
  cardInnerStyle,
  labelStyle,
}) => {
  const labels: Record<number, { ar: string; en: string }> = {
    1: { ar: '1. استلام وتفويض الملف', en: '1. Intake & Consent' },
    2: { ar: '2. فرز التمريض وحجب الهوية', en: '2. Nurse Triage & PII Masking' },
    3: { ar: '3. مراجعة الطبيب المعالج والأسئلة', en: '3. Doctor Review & Questions' },
    4: { ar: '4. سداد الفاتورة والرمز السيادي', en: '4. Payment & Egress Token' },
    5: { ar: '5. دراسة الاستشاري الدولي (الهند)', en: '5. Indian Specialist Evaluation' },
    6: { ar: '6. تعريب التقرير ومصادقة الطبيب', en: '6. Localization & Sign-Off' },
    7: { ar: '7. اعتماد وتسليم التقرير النهائي', en: '7. Bilingual Report Release' },
    8: { ar: '8. متابعة سريرية مباشرة (21 يوماً)', en: '8. 21-Day Follow-Up Window' },
    9: { ar: '9. إغلاق الملف وحفظ السجل', en: '9. Case Closed & Archival' },
  };
  const s = Math.min(Math.max(stageNum, 1), 9);
  const currentLabel = isAr ? labels[s]?.ar : labels[s]?.en;

  return (
    <div style={cardInnerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={labelStyle}>{isAr ? 'رحلة المريض السريرية' : 'Clinical Patient Journey'}</span>
        <span style={{ fontSize: '10px', fontWeight: 800, color: TEAL_PRIMARY }}>
          {isAr ? `المرحلة ${s} من 9` : `Stage ${s} of 9`}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '3px',
              backgroundColor: step <= stageNum ? TEAL_SECONDARY : '#e2e8f0',
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: '11px', marginTop: '6px', color: '#64748b', fontWeight: 600 }}>
        {currentLabel}
      </div>
    </div>
  );
};

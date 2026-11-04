import React from 'react';
import { CockpitDeviceProps, TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from './types';

export const NurseDevice: React.FC<CockpitDeviceProps> = ({
  activeCase,
  stageNum,
  onAdvanceStage,
  onUpdateCase,
  lang,
}) => {
  const isAr = lang === 'ar';
  const isPiiMasked = activeCase.piiMasked !== undefined 
    ? activeCase.piiMasked 
    : (!!activeCase.nationalIdMasked || stageNum >= 2);

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
      {stageNum < 2 ? (
        <div style={{ ...cardInnerStyle, backgroundColor: '#f8fafc', textAlign: 'center', padding: '36px 16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
            {isAr ? 'طابور فرز التمريض (N01) في الانتظار' : 'Nursing Triage Queue (N01) Idle'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
            {isAr
              ? 'في انتظار قيام المريض بتعبئة نموذج الاستقبال (P01) وإرسال الملف.'
              : 'Waiting for patient to submit clinical intake (P01) on Device 1.'}
          </div>
        </div>
      ) : (
        <>
          {/* N01: Triage Checklist */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>N01 · {isAr ? 'قائمة التحقق وفرز الحالة' : 'Triage Checklist'}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {[
                { en: 'National Identity & Iqama Verified', ar: 'تم التحقق من الهوية والإقامة' },
                { en: 'Chief Complaint & Duration Logged', ar: 'تم تسجيل الشكوى الرئيسية ومدة الأعراض' },
                { en: 'Drug Allergies & Comorbidities Checked', ar: 'تم فحص الحساسية الدوائية والأمراض المزمنة' },
              ].map((item, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    defaultChecked={stageNum > 1}
                    style={{ accentColor: TEAL_PRIMARY, width: '15px', height: '15px' }}
                  />
                  <span>{isAr ? item.ar : item.en}</span>
                </label>
              ))}
            </div>
          </div>

          {/* N02–N03: Vitals Inspection */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>N02–N03 · {isAr ? 'فحص العلامات الحيوية' : 'Vitals Inspection'}</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              {[
                { label: 'BP', val: activeCase.vitals?.['BP'] || '128/82 mmHg' },
                { label: 'HR', val: activeCase.vitals?.['HR'] || '74 bpm' },
                { label: 'Temp', val: activeCase.vitals?.['Temp'] || '36.8 °C' },
                { label: 'SpO2', val: activeCase.vitals?.['SpO2'] || '98%' },
              ].map((v) => (
                <div key={v.label} style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{v.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: TEAL_PRIMARY }}>{v.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* N04: SDAIA PII Masking */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>N04 · {isAr ? 'حجب الهوية الوطنية آلياً (SDAIA)' : 'SDAIA Automated PII Masking'}</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '1px' }}>
                {isPiiMasked ? '10********' : (activeCase.nationalIdMasked || '1089345210')}
              </span>
              <button
                onClick={() => onUpdateCase({ piiMasked: !isPiiMasked })}
                style={{
                  backgroundColor: isPiiMasked ? WHATSAPP_GREEN : '#e2e8f0',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isPiiMasked ? '#ffffff' : '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                {isPiiMasked ? (isAr ? 'مُحجب' : 'Masked') : (isAr ? 'حجب الهوية' : 'Mask PII')}
              </button>
            </div>
          </div>

          {/* Completion Action */}
          <button
            onClick={() => {
              onUpdateCase({ triageComplete: true, currentStage: 'DOCTOR_REVIEW', stage: 3 });
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
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0, 123, 110, 0.25)',
            }}
          >
            N04 · {isAr ? 'إكمال الفرز وتوجيه الملف للطبيب السعودي (D01)' : 'Complete Triage & Route to Saudi Doctor (D01)'}
          </button>
        </>
      )}
    </div>
  );
};

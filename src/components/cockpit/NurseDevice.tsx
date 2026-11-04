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
  const isPiiMasked = !!activeCase.piiMasked || !!activeCase.nationalIdMasked || stageNum >= 2;

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
          {/* Patient Submitted Dossier Summary */}
          <div style={{ ...cardInnerStyle, backgroundColor: '#f0fdfa', borderColor: TEAL_SECONDARY }}>
            <span style={labelStyle}>{isAr ? 'ملف المريض المستلم حديثاً' : 'Live Patient Intake Dossier'}</span>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              {activeCase.patientName || (isAr ? 'سالم العامري' : 'Salem Al-Ameri')}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
              <span style={{ fontWeight: 700 }}>{isAr ? 'التخصص المطلوب:' : 'Specialty:'}</span> {activeCase.specialtyAr || activeCase.specialty || 'Cardiology'}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
              <span style={{ fontWeight: 700 }}>{isAr ? 'الشكوى:' : 'Complaint:'}</span> {activeCase.symptoms || activeCase.symptomsAr || 'Severe exertional dyspnea'}
            </div>
          </div>

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

          {/* N04: Domestic ID Verification & Border Token Prep */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>{isAr ? 'N04 · التحقق من الهوية المحلية وإعداد رمز التجهيل الحدودي' : 'N04 · Domestic ID & Border Token Prep'}</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
                  هوية وطنية: 1089345210
                </span>
                <div style={{ fontSize: '10px', color: '#166534', fontWeight: 600, marginTop: '2px' }}>
                  {isAr ? '🇸🇦 معتمدة داخل المملكة (التجهيل يُطبق عند العبور للهند)' : '🇸🇦 Valid in KSA (SDAIA Token ALO-KSA-9482 staged for export)'}
                </div>
              </div>
              <span
                style={{
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#166534',
                }}
              >
                {isAr ? '✓ سارية وموثقة' : '✓ Verified'}
              </span>
            </div>
          </div>

          {/* Completion Action (Strict Button Lock) */}
          <button
            type="button"
            disabled={activeCase.triageComplete}
            onClick={() => {
              onUpdateCase({ triageComplete: true, currentStage: 'DOCTOR_REVIEW', stage: 3 });
              onAdvanceStage();
            }}
            style={{
              backgroundColor: activeCase.triageComplete ? '#e2e8f0' : TEAL_PRIMARY,
              color: activeCase.triageComplete ? '#475569' : '#ffffff',
              border: activeCase.triageComplete ? '1px solid #cbd5e1' : 'none',
              borderRadius: '8px',
              padding: '12px',
              fontWeight: 800,
              fontSize: '11px',
              cursor: activeCase.triageComplete ? 'not-allowed' : 'pointer',
              opacity: activeCase.triageComplete ? 0.8 : 1,
              boxShadow: activeCase.triageComplete ? 'none' : '0 4px 12px rgba(0, 123, 110, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {activeCase.triageComplete ? (
              <>
                <span>✓</span>
                <span>{isAr ? 'N04 · تم إكمال الفرز والتحويل للطبيب' : 'N04 · Triage Completed & Routed'}</span>
              </>
            ) : (
              <span>{isAr ? 'N04 · إكمال الفرز وتوجيه الملف للطبيب السعودي (D01)' : 'N04 · Complete Triage & Route to Saudi Doctor (D01)'}</span>
            )}
          </button>
        </>
      )}
    </div>
  );
};

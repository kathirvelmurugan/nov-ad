import React, { useState, useEffect } from 'react';
import { CockpitDeviceProps, TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, VERDICTS_AR, VERDICTS_EN } from './types';

export const IndianConsultantDevice: React.FC<CockpitDeviceProps> = ({
  activeCase,
  stageNum,
  onAdvanceStage,
  onUpdateCase,
  lang,
}) => {
  const isAr = lang === 'ar';
  const verdicts = isAr ? VERDICTS_AR : VERDICTS_EN;
  const [selectedVerdicts, setSelectedVerdicts] = useState<string[]>(activeCase.verdicts || []);

  useEffect(() => {
    if (activeCase.verdicts) {
      setSelectedVerdicts(activeCase.verdicts);
    }
  }, [activeCase.verdicts]);

  const toggleVerdict = (v: string) => {
    const updated = selectedVerdicts.includes(v)
      ? selectedVerdicts.filter((item) => item !== v)
      : [...selectedVerdicts, v];
    setSelectedVerdicts(updated);
    onUpdateCase({ verdicts: updated });
  };

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
      {stageNum < 5 ? (
        <div style={{ ...cardInnerStyle, backgroundColor: '#f8fafc', textAlign: 'center', padding: '36px 16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔒</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
            {isAr ? 'شاشة الاستشاري الدولي مغلقة (بانتظار السداد)' : 'Consultant Portal Locked Pending Payment'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
            {isAr
              ? 'تُفتح صلاحية فحص الأشعة وإصدار الرأي الثاني فور تأكيد سداد المريض (P19).'
              : '3D DICOM review & opinion release unlock post patient payment verification (P19).'}
          </div>
        </div>
      ) : (
        <>
          {/* K01 & K02–K04: 3D DICOM Inspection */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>K01–K04 · {isAr ? 'فحص مقاطع DICOM ثلاثية الأبعاد' : '3D DICOM Inspection'}</span>
            <div
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '6px',
                border: `1px solid ${TEAL_PRIMARY}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(circle at center, rgba(0,198,174,0.18) 0%, transparent 70%)',
                }}
              />
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ fontSize: '22px' }}>🩻</div>
                <div style={{ color: TEAL_SECONDARY, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', marginTop: '3px' }}>
                  3D DICOM VOLUMETRIC PREVIEW
                </div>
                <div style={{ color: '#94a3b8', fontSize: '9px', marginTop: '2px' }}>
                  Series #4: Echo Doppler & Annular Calcification
                </div>
              </div>
            </div>
          </div>

          {/* D07–D09: Treating Physician's 3 Focus Questions */}
          <div style={{ ...cardInnerStyle, backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
            <span style={labelStyle}>
              D07–D09 · {isAr ? 'أسئلة الطبيب السعودي المعالج (د. الشمري)' : 'Treating Physician Focus Questions'}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              {(activeCase.focusQuestions && activeCase.focusQuestions.filter(Boolean).length > 0
                ? activeCase.focusQuestions
                : activeCase.treatingDoctor?.focusQuestions && activeCase.treatingDoctor.focusQuestions.filter(Boolean).length > 0
                ? activeCase.treatingDoctor.focusQuestions
                : [
                    isAr ? '1. هل استبدال صمام الميترال مستعجل أم تحفظي؟' : '1. Is surgical intervention urgently indicated?',
                    isAr ? '2. ما هو بروتوكول مضادات التخثر الأنسب؟' : '2. What anticoagulation regimen is recommended?',
                    isAr ? '3. هل يوصى بإجراء تصوير إضافي عبر المريء؟' : '3. Is TEE or repeat 3D echo warranted before surgery?',
                  ]
              ).map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '11px',
                    color: '#1e293b',
                    backgroundColor: '#ffffff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ fontWeight: 800, color: TEAL_PRIMARY }}>Q{idx + 1}: </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* K05: Base44 Tap-to-Choose Structured Verdicts */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>K05 · {isAr ? 'القرارات السريرية المنظمة (اختر المناسب)' : 'Structured Clinical Verdicts'}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              {verdicts.map((v, i) => {
                const isSelected = selectedVerdicts.includes(v);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleVerdict(v)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${TEAL_PRIMARY}` : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? TEAL_BG : '#ffffff',
                      color: isSelected ? TEAL_PRIMARY : '#475569',
                      fontWeight: isSelected ? 800 : 500,
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: isAr ? 'right' : 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '4px',
                        border: isSelected ? `2px solid ${TEAL_PRIMARY}` : '2px solid #cbd5e1',
                        backgroundColor: isSelected ? TEAL_PRIMARY : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '9px',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && '✓'}
                    </span>
                    <span>{v}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* K06: Submit Second Opinion */}
          <button
            onClick={() => {
              onUpdateCase({
                secondOpinionSubmitted: true,
                consultantOpinion: selectedVerdicts.join('; ') || 'Second opinion evaluated and approved based on 3D DICOM.',
                currentStage: 'OPINION_READY',
                stage: 6,
              });
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
              cursor: selectedVerdicts.length > 0 ? 'pointer' : 'not-allowed',
              opacity: selectedVerdicts.length > 0 ? 1 : 0.6,
              boxShadow: '0 4px 10px rgba(0, 123, 110, 0.25)',
            }}
          >
            K06 · {isAr ? 'إرسال الرأي الثاني المعتمد لمنسق ألو (C08)' : 'Submit Second Opinion to Coordinator (C08)'}
          </button>
        </>
      )}
    </div>
  );
};

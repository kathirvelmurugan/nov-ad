import React, { useState, useEffect } from 'react';
import { CockpitDeviceProps, TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG } from './types';

export const SaudiDoctorDevice: React.FC<CockpitDeviceProps> = ({
  activeCase,
  stageNum,
  onAdvanceStage,
  onUpdateCase,
  lang,
}) => {
  const isAr = lang === 'ar';
  const currentModality = activeCase.modality || (activeCase.consultationType === 'video' ? 'Video' : 'Written');
  const isPiiMasked = activeCase.piiMasked !== undefined 
    ? activeCase.piiMasked 
    : (!!activeCase.nationalIdMasked || stageNum >= 2);

  const initialQuestions = activeCase.focusQuestions && activeCase.focusQuestions.length > 0
    ? activeCase.focusQuestions
    : (activeCase.treatingDoctor?.focusQuestions ? [...activeCase.treatingDoctor.focusQuestions] : ['', '', '']);

  const [focusQs, setFocusQs] = useState<string[]>(initialQuestions);

  useEffect(() => {
    if (activeCase.focusQuestions && activeCase.focusQuestions.length > 0) {
      setFocusQs(activeCase.focusQuestions);
    }
  }, [activeCase.focusQuestions]);

  const handleUpdateQuestion = (index: number, val: string) => {
    const updated = [...focusQs];
    updated[index] = val;
    setFocusQs(updated);
    onUpdateCase({ focusQuestions: updated });
  };

  const handleLoadSampleQuestions = () => {
    const samples = isAr
      ? [
          'هل توصي بإجراء استبدال الصمام بالقسطرة (TAVR) أم الجراحة المفتوحة (SAVR)؟',
          'ما هو التقييم الدقيق لتكلس الشريان التاجي وهل يستدعي جراحة مرافقة؟',
          'ما هي خطة مضادات التخثر المقترحة للحفاظ على كفاءة الصمام؟',
        ]
      : [
          'Do you recommend TAVR vs open surgical SAVR given calcification level?',
          'Does the coronary plaque warrant concurrent bypass intervention?',
          'What antithrombotic and anticoagulant regimen is optimal for longevity?',
        ];
    setFocusQs(samples);
    onUpdateCase({ focusQuestions: samples });
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
      {stageNum < 3 ? (
        <div style={{ ...cardInnerStyle, backgroundColor: '#f8fafc', textAlign: 'center', padding: '36px 16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🩺</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
            {isAr ? 'عيادة الطبيب السعودي (D01) في الانتظار' : 'Saudi Physician Workstation (D01) Idle'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
            {isAr
              ? 'في انتظار قيام ممرضة ألو بإكمال الفرز وتدقيق حجب الهوية (N04).'
              : 'Waiting for Alo Nurse to complete triage & SDAIA masking (N04).'}
          </div>
        </div>
      ) : (
        <>
          {/* D01: De-identified Dossier Review */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>D01 · {isAr ? 'مراجعة السجل المحجوب الهوية' : 'Record Inspection'}</span>
            <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{isAr ? 'معرف المريض المحجوب (SDAIA):' : 'De-identified Patient ID:'}</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: TEAL_PRIMARY, letterSpacing: '1px', marginTop: '2px' }}>
                {isPiiMasked ? '10********' : 'UNMASKED WARNING'}
              </div>
            </div>
          </div>

          {/* D05–D06: Modality Selection */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>D05–D06 · {isAr ? 'اختيار نمط الاستشارة الدولية' : 'Modality Selection'}</span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {['Video', 'Audio', 'Chat'].map((m) => (
                <button
                  key={m}
                  onClick={() => onUpdateCase({ modality: m, consultationType: m.toLowerCase() as any })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: currentModality === m ? `2px solid ${TEAL_PRIMARY}` : '2px solid #e2e8f0',
                    backgroundColor: currentModality === m ? TEAL_BG : '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '11px',
                    color: currentModality === m ? TEAL_PRIMARY : '#64748b',
                    transition: 'all 0.15s',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* D07–D09: 3 Focus Questions */}
          <div style={cardInnerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={labelStyle}>D07–D09 · {isAr ? '٣ أسئلة تركيز سريرية' : '3 Focus Questions'}</span>
              <button
                type="button"
                onClick={handleLoadSampleQuestions}
                style={{
                  backgroundColor: '#f0fdfa',
                  color: TEAL_PRIMARY,
                  border: `1px solid ${TEAL_SECONDARY}`,
                  borderRadius: '6px',
                  padding: '2px 7px',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isAr ? '⚡ أسئلة نموذجية' : '⚡ Sample Qs'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`${isAr ? 'السؤال' : 'Focus Question'} ${i + 1}...`}
                  value={focusQs[i] || ''}
                  onChange={(e) => handleUpdateQuestion(i, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* D10: Approve Referral */}
          <button
            onClick={() => {
              onUpdateCase({ referralApproved: true, currentStage: 'AWAITING_PAYMENT', stage: 4 });
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
            D10 · {isAr ? 'اعتماد التحويل وتوجيه الملف لمنسق ألو (C01)' : 'Approve Referral & Route to Alo Coordinator (C01)'}
          </button>
        </>
      )}
    </div>
  );
};

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
  const isPiiMasked = !!activeCase.piiMasked || !!activeCase.nationalIdMasked || stageNum >= 2;

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
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
                <span style={{ fontWeight: 700 }}>{isAr ? 'الأعراض المحولة:' : 'Symptoms:'}</span> {activeCase.symptomsAr || activeCase.symptoms || (isAr ? 'ضيق تنفس تدريجي وألم بالصدر' : 'Exertional dyspnea & angina')}
              </div>
              <div style={{ fontSize: '10px', color: '#166534', fontWeight: 700, marginTop: '4px' }}>
                ✓ {isAr ? 'مرفق الأشعة والتحاليل جاهز للمعاينة الدولية' : '3D DICOM & Lab Reports Verified'}
              </div>
            </div>
          </div>

          {/* D05–D06: Modality Selection (Strictly 2 Choices) */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>D05–D06 · {isAr ? 'اختيار نمط الاستشارة الدولية' : 'Modality Selection'}</span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {[
                { id: 'Written', labelAr: 'تقرير كتابي معتمد', labelEn: 'Written Opinion Only', tier: 1 },
                { id: 'Video', labelAr: 'مكالمة فيديو + تقرير', labelEn: 'Video + Written', tier: 2 },
              ].map((m) => {
                const isSelected = (currentModality === 'Video' ? 'Video' : 'Written') === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={activeCase.referralApproved}
                    onClick={() => onUpdateCase({ modality: m.id, consultationType: m.id === 'Video' ? 'video' : 'written', tier: m.tier })}
                    style={{
                      flex: 1,
                      padding: '8px 6px',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${TEAL_PRIMARY}` : '2px solid #e2e8f0',
                      backgroundColor: isSelected ? TEAL_BG : '#ffffff',
                      cursor: activeCase.referralApproved ? 'default' : 'pointer',
                      fontWeight: 800,
                      fontSize: '10px',
                      color: isSelected ? TEAL_PRIMARY : '#64748b',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                    }}
                  >
                    <div>{isAr ? m.labelAr : m.labelEn}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: isSelected ? TEAL_SECONDARY : '#94a3b8', marginTop: '2px' }}>
                      {m.tier === 1 ? 'Tier 1 (250 SAR)' : 'Tier 2 (450 SAR)'}
                    </div>
                  </button>
                );
              })}
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

          {/* D10: Approve Referral (Strict Single-Action Lock) */}
          <button
            type="button"
            disabled={activeCase.referralApproved}
            onClick={() => {
              onUpdateCase({
                referralApproved: true,
                currentStage: 'AWAITING_PAYMENT',
                stage: 4,
                invoiceIssued: false, // Enforce Alo Coordinator Gate 1!
                treatingDoctor: {
                  ...(activeCase.treatingDoctor || {
                    name: 'د. عبدالله الشمري',
                    hospital: 'مستشفى رعاية الرياض',
                    city: 'الرياض',
                  }),
                  focusQuestions: [focusQs[0], focusQs[1], focusQs[2]],
                },
                focusQuestions: [focusQs[0], focusQs[1], focusQs[2]],
              });
              onAdvanceStage();
            }}
            style={{
              backgroundColor: activeCase.referralApproved ? '#e2e8f0' : TEAL_PRIMARY,
              color: activeCase.referralApproved ? '#475569' : '#ffffff',
              border: activeCase.referralApproved ? '1px solid #cbd5e1' : 'none',
              borderRadius: '8px',
              padding: '12px',
              fontWeight: 800,
              fontSize: '11px',
              cursor: activeCase.referralApproved ? 'not-allowed' : 'pointer',
              opacity: activeCase.referralApproved ? 0.8 : 1,
              boxShadow: activeCase.referralApproved ? 'none' : '0 4px 12px rgba(0, 123, 110, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {activeCase.referralApproved ? (
              <>
                <span>✓</span>
                <span>{isAr ? 'D10 · تم اعتماد التحويل وتوجيهه للمنسق' : 'D10 · Referral Approved & Routed'}</span>
              </>
            ) : (
              <span>{isAr ? 'D10 · اعتماد التحويل وتوجيه الملف لمنسق ألو (C01)' : 'D10 · Approve Referral & Route to Alo Coordinator (C01)'}</span>
            )}
          </button>
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CockpitDeviceProps, TEAL_PRIMARY, TEAL_SECONDARY } from './types';
import { INDIAN_CONSULTANTS } from './doctor/doctorConstants';
import { DoctorReferralSetupSection } from './doctor/DoctorReferralSetupSection';
import { DoctorBilingualEndorsementSection } from './doctor/DoctorBilingualEndorsementSection';

export const SaudiDoctorDevice: React.FC<CockpitDeviceProps> = ({
  activeCase,
  stageNum,
  onAdvanceStage,
  onUpdateCase,
  lang,
  onOpenReportModal,
}) => {
  const isAr = lang === 'ar';
  const currentModality = activeCase.modality || (activeCase.consultationType === 'video' ? 'Video' : 'Written');
  const selectedConsultantName = activeCase.consultant?.name || INDIAN_CONSULTANTS[0].name;

  const initialQuestions = activeCase.focusQuestions && activeCase.focusQuestions.length > 0
    ? activeCase.focusQuestions
    : (activeCase.treatingDoctor?.focusQuestions ? [...(activeCase.treatingDoctor?.focusQuestions || [])] : ['', '', '']);

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
            {isAr ? 'عيادة الطبيب السعودي المعالج (D01) في الانتظار' : 'Saudi Treating Doctor Workstation (D01) Idle'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
            {isAr
              ? 'في انتظار قيام ممرضة ألو بإكمال الفرز وتدقيق حجب الهوية (N04).'
              : 'Waiting for Alo Nurse to complete triage & SDAIA masking (N04).'}
          </div>
        </div>
      ) : (
        <>
          {/* D01: Option B - Dual-Token Sovereignty Inspection */}
          <div style={cardInnerStyle}>
            <span style={labelStyle}>{isAr ? 'D01 · فحص الهوية المزدوجة والمطابقة السريرية' : 'D01 · Dual-Token Sovereignty Review'}</span>
            <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                {/* Domestic identity for doctor */}
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{isAr ? '🇸🇦 المريض المسجل (مستشفى رعاية الرياض):' : '🇸🇦 Domestic Patient Record:'}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {activeCase.patientName || (isAr ? activeCase.patientNameAr : activeCase.patientNameEn) || (isAr ? 'مريض معتمد' : 'Verified Patient')}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px' }}>
                    {isAr ? 'هوية / إقامة' : 'ID / Iqama'}: {activeCase.nationalIdMasked || '1089345210'} · {activeCase.age ? `${activeCase.age}${isAr ? ' سنة' : ' years old'}` : (isAr ? '٤٨ سنة' : '48 years old')}
                  </div>
                </div>

                {/* Sovereign export token */}
                <div style={{ backgroundColor: '#f0fdfa', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${TEAL_SECONDARY}` }}>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: TEAL_PRIMARY }}>
                    {isAr ? 'رمز العبور الدولي المعتمد:' : 'Audited Egress Token:'}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: TEAL_PRIMARY, marginTop: '2px' }}>
                    {activeCase.egressToken || 'ALO-KSA-9482'}
                  </div>
                  <div style={{ fontSize: '9px', color: '#166534', fontWeight: 600, marginTop: '2px' }}>
                    ✓ حجب PII تام عند العبور للهند
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#475569', marginTop: '8px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                <span style={{ fontWeight: 700 }}>{isAr ? 'الأعراض المحولة:' : 'Symptoms:'}</span> {activeCase.symptomsAr || activeCase.symptoms || (isAr ? 'ضيق تنفس تدريجي وألم بالصدر' : 'Exertional dyspnea & angina')}
              </div>
              <div style={{ fontSize: '10px', color: '#166534', fontWeight: 700, marginTop: '4px' }}>
                ✓ {isAr ? 'مرفق الأشعة 3D DICOM والفحوصات مدققة وجاهزة للإحالة' : '3D DICOM & Lab Assets Audited for Export'}
              </div>
            </div>
          </div>

          <DoctorReferralSetupSection
            activeCase={activeCase}
            isAr={isAr}
            selectedConsultantName={selectedConsultantName}
            currentModality={currentModality}
            focusQs={focusQs}
            cardInnerStyle={cardInnerStyle}
            labelStyle={labelStyle}
            handleLoadSampleQuestions={handleLoadSampleQuestions}
            handleUpdateQuestion={handleUpdateQuestion}
            onUpdateCase={onUpdateCase}
            onAdvanceStage={onAdvanceStage}
          />

          <DoctorBilingualEndorsementSection
            activeCase={activeCase}
            isAr={isAr}
            focusQs={focusQs}
            cardInnerStyle={cardInnerStyle}
            labelStyle={labelStyle}
            onOpenReportModal={onOpenReportModal}
            onUpdateCase={onUpdateCase}
            onAdvanceStage={onAdvanceStage}
          />
        </>
      )}
    </div>
  );
};

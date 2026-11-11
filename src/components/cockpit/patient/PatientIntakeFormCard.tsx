import React, { useState, useEffect } from 'react';
import { ClinicalCase } from '../../../types';
import { TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from '../types';

interface PatientIntakeFormCardProps {
  activeCase: ClinicalCase;
  stageNum: number;
  isAr: boolean;
  cardInnerStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onAdvanceStage: () => void;
}

export const PatientIntakeFormCard: React.FC<PatientIntakeFormCardProps> = ({
  activeCase,
  stageNum,
  isAr,
  cardInnerStyle,
  labelStyle,
  onUpdateCase,
  onAdvanceStage,
}) => {
  const [patientName, setPatientName] = useState(activeCase.patientName || '');
  const [nationalId, setNationalId] = useState(activeCase.nationalIdMasked ? '1089****10' : '');
  const [specialty, setSpecialty] = useState(activeCase.specialtyAr || activeCase.specialty || '');
  const [symptoms, setSymptoms] = useState(activeCase.symptomsAr || activeCase.symptoms || '');
  const [selectedDoctor, setSelectedDoctor] = useState(activeCase.treatingDoctor?.name || 'د. عبدالله الشمري (مستشفى رعاية الرياض)');
  const [hasScans, setHasScans] = useState((activeCase.files && activeCase.files.length > 0) || false);

  useEffect(() => {
    setPatientName(activeCase.patientName || '');
    setNationalId(activeCase.nationalIdMasked ? activeCase.nationalIdMasked : '');
    setSpecialty(activeCase.specialtyAr || activeCase.specialty || '');
    setSymptoms(activeCase.symptomsAr || activeCase.symptoms || '');
    setSelectedDoctor(activeCase.treatingDoctor?.name || 'د. عبدالله الشمري (مستشفى رعاية الرياض)');
    setHasScans((activeCase.files && activeCase.files.length > 0) || false);
  }, [activeCase.id, activeCase.patientName, activeCase.nationalIdMasked, activeCase.symptoms, activeCase.stage]);

  const handleLoadSampleData = () => {
    setPatientName(isAr ? 'عبدالعزيز العتيبي' : 'Abdulaziz Al-Otaibi');
    setNationalId('1089345210');
    setSpecialty(isAr ? 'أمراض القلب وجراحة الصمامات' : 'Cardiology & Valvular Heart Disease');
    setSymptoms(
      isAr 
        ? 'ضيق تنفس تدريجي عند بذل الجهد (NYHA III) مع نوبات دوخة وألم ضاغط في الصدر' 
        : 'Progressive exertional dyspnea (NYHA Class III) and angina'
    );
    setSelectedDoctor('د. عبدالله الشمري (مستشفى رعاية الرياض)');
    setHasScans(true);
  };

  const handleSubmitIntake = () => {
    onUpdateCase({
      patientName: patientName || (isAr ? 'مريض جديد' : 'New Patient'),
      nationalIdMasked: nationalId ? `${nationalId.slice(0, 4)}****${nationalId.slice(-2)}` : '1089****10',
      specialty: specialty || 'Cardiology',
      specialtyAr: specialty || 'أمراض القلب والشرايين',
      symptoms: symptoms || 'Severe exertional dyspnea',
      stage: 2,
      currentStage: 'NURSE_CHECK',
    });
    onAdvanceStage();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={cardInnerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={labelStyle}>P01 · {isAr ? 'نموذج الاستقبال الطبي' : 'Clinical Intake Form'}</span>
          <button
            type="button"
            onClick={handleLoadSampleData}
            style={{
              backgroundColor: '#f0fdfa',
              color: TEAL_PRIMARY,
              border: `1px solid ${TEAL_SECONDARY}`,
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isAr ? '⚡ تعبئة عينة سريرية' : '⚡ 1-Click Sample'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
              {isAr ? 'اسم المريض الكامل' : 'Patient Full Name'}
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder={isAr ? 'مثال: الاسم الثلاثي للمريض' : 'e.g. Patient Full Name'}
              style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
              {isAr ? 'رقم الهوية الوطنية / الإقامة' : 'National ID / Iqama'}
            </label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="10XXXXXXXX"
              style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
              {isAr ? 'الأعراض والشكوى الرئيسية' : 'Chief Symptoms'}
            </label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={isAr ? 'وصف الأعراض ومدة حدوثها...' : 'Describe symptoms and onset...'}
              style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
              {isAr ? 'اختيار الطبيب السعودي المعالج' : 'Pick Saudi Treating Doctor'}
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff', outline: 'none' }}
            >
              <option value="د. عبدالله الشمري (مستشفى رعاية الرياض)">
                {isAr ? 'د. عبدالله الشمري (مستشفى رعاية الرياض - قلب)' : 'Dr. Abdullah Al-Shammari (Riyadh Care - Cardiology)'}
              </option>
              <option value="د. منى الغامدي (مدينة الملك فهد الطبية)">
                {isAr ? 'د. منى الغامدي (مدينة الملك فهد الطبية - أورام)' : 'Dr. Mona Al-Ghamdi (KFMC - Oncology)'}
              </option>
            </select>
          </div>

          {/* Scans Dropzone indicator */}
          <div
            onClick={() => setHasScans(!hasScans)}
            style={{
              border: `2px dashed ${hasScans ? WHATSAPP_GREEN : '#cbd5e1'}`,
              borderRadius: '8px',
              padding: '10px',
              textAlign: 'center',
              backgroundColor: hasScans ? '#f0fdf4' : '#f8fafc',
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            <div style={{ fontSize: '18px' }}>{hasScans ? '✅' : '📁'}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: hasScans ? '#166534' : '#475569' }}>
              {hasScans 
                ? (isAr ? 'تم إرفاق مقاطع الأشعة DICOM وملف التقرير (84MB)' : 'Attached 3D DICOM & Lab PDF (84MB)')
                : (isAr ? 'اضغط لإرفاق صور الأشعة والتقارير الطبية' : 'Click to attach DICOM scans & labs')}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={stageNum > 1}
        onClick={handleSubmitIntake}
        style={{
          backgroundColor: stageNum > 1 ? '#e2e8f0' : TEAL_PRIMARY,
          color: stageNum > 1 ? '#475569' : '#ffffff',
          border: stageNum > 1 ? '1px solid #cbd5e1' : 'none',
          borderRadius: '8px',
          padding: '12px',
          fontWeight: 800,
          fontSize: '11px',
          cursor: stageNum > 1 ? 'not-allowed' : 'pointer',
          opacity: stageNum > 1 ? 0.8 : 1,
          boxShadow: stageNum > 1 ? 'none' : '0 4px 12px rgba(0, 123, 110, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        {stageNum > 1 ? (
          <>
            <span>✓</span>
            <span>{isAr ? 'P01 · تم إرسال الملف لممرضة ألو' : 'P01 · Intake Submitted'}</span>
          </>
        ) : (
          <span>{isAr ? 'P01 · إرسال الملف إلى ممرضة ألو (N01)' : 'P01 · Submit Intake to Alo Nurse (N01)'}</span>
        )}
      </button>
    </div>
  );
};

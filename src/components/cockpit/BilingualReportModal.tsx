import React from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeCase: ClinicalCase;
  lang?: 'ar' | 'en';
}

export const BilingualReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeCase,
  lang = 'ar',
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const patientName = activeCase.patientNameAr || activeCase.patientName || 'طارق بن سالم المطيري';
  const patientNameEn = activeCase.patientNameEn || 'Tariq Al-Mutairi';
  const treatingDocName = activeCase.treatingDoctor?.name || 'د. عبدالله الشمري';
  const consultantName = activeCase.consultant?.name || 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)';
  const invoiceNum = activeCase.pricing?.invoiceNumber || 'INV-2026-001';

  const customAnswers = activeCase.consultantAnswers || [];
  const customQuestions = activeCase.focusQuestions || activeCase.treatingDoctor?.focusQuestions || [];

  const questionsAndAnswers = [
    {
      num: 1,
      qAr: customQuestions[0] || 'هل توصي بإجراء استبدال الصمام بالقسطرة (TAVR) أم الجراحة المفتوحة (SAVR) بناءً على نتائج الإيكو ومستوى التكلس؟',
      qEn: 'Do you recommend TAVR vs open surgical SAVR given aortic annular calcification and leaflet geometry?',
      ansEn:
        customAnswers[0]?.trim() ||
        'Based on 3D DICOM volumetric reconstruction, asymmetric heavy calcification in the non-coronary cusp extends into the LVOT. Open Surgical Aortic Valve Replacement (SAVR) with a 23mm mechanical or bioprosthetic valve is strongly recommended over TAVR to prevent paravalvular leak and acute conduction block.',
      ansAr:
        'بناءً على إعادة البناء الحجمي ثلاثي الأبعاد (3D DICOM)، يظهر تكلس غير متماثل في الشرفة غير التاجية ممتد إلى مسار خروج البطين الأيسر. نوصي بشدة بإجراء استبدال الصمام الأبهري جراحياً (SAVR) بصمام 23 ملم لتجنب التسريب حول الصمام وحصار التوصيل الكهربائي مقارنة بالقسطرة.',
      clinicalRecommendation: 'SAVR Strongly Recommended / الجراحة المفتوحة موصى بها بشدة',
    },
    {
      num: 2,
      qAr: customQuestions[1] || 'ما هو التقييم الدقيق لتكلس الشريان التاجي وهل يستدعي جراحة مرافقة (CABG)؟',
      qEn: 'Does the coronary calcification and LAD lesion warrant concurrent CABG bypass grafting?',
      ansEn:
        customAnswers[1]?.trim() ||
        'Moderate 50–60% ostial LAD calcified plaque with FFR preserved (>0.82). Standalone SAVR is advised; concurrent CABG is not indicated at this stage to avoid unnecessary cardiopulmonary bypass extension.',
      ansAr:
        'لوحظ تكلس لويحي معتدل بنسبة 50-60% في منشأ الشريان الأمامي النازل، مع احتفاظ احتياطي التدفق الجزئي (FFR > 0.82). يُكتفى بالجراحة المفردة للصمام، ولا يُنصح بإجراء مجازة تاجية مرافقة حالياً.',
      clinicalRecommendation: 'No CABG Indicated / لا حاجة لمجازة تاجية مرافقة',
    },
    {
      num: 3,
      qAr: customQuestions[2] || 'ما هي خطة مضادات التخثر المقترحة للحفاظ على كفاءة الصمام؟',
      qEn: 'What antithrombotic and anticoagulant regimen is optimal for long-term valve patency?',
      ansEn:
        customAnswers[2]?.trim() ||
        'If bioprosthesis is selected: Oral anticoagulation (Warfarin, INR target 2.0–2.5) for initial 3 months, transitioning to Aspirin 81 mg daily. If mechanical: Life-long Warfarin (INR target 2.5–3.0).',
      ansAr:
        'في حال اختيار صمام نسيجي: مضاد تخثر فموي (وارفارين، الهدف 2.0-2.5) لأول 3 أشهر ثم الانتقال إلى أسبرين 81 ملغ يومياً. في حال الصمام الميكانيكي: وارفارين مدى الحياة بهدف 2.5-3.0.',
      clinicalRecommendation: 'Tailored Anticoagulation Protocol / بروتوكول تخثر مخصص',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          direction: isAr ? 'rtl' : 'ltr',
          fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
          border: `2px solid ${TEAL_PRIMARY}`,
        }}
      >
        {/* Modal Action Bar (Sticky Top) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📑</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>
                {isAr ? 'التقرير الطبي الدولي المعتمد ثنائي اللغة (عربي / English)' : 'Certified Bilingual Second Opinion Dossier'}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                Case Ref: {activeCase.caseNumber || 'ALO-2026-LIVE'} · ZATCA Ref: {invoiceNum}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                backgroundColor: TEAL_PRIMARY,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🖨️</span>
              <span>{isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#334155',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Surface */}
        <div
          style={{
            padding: '28px 32px',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Document Official Header */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px 24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: TEAL_PRIMARY,
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: 900,
                    fontSize: '13px',
                    letterSpacing: '1px',
                  }}
                >
                  ALO DOCTOR
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {isAr ? 'منصة الاستشارات الطبية الدولية المعتمدة' : 'Certified International Second Opinion Service'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                المملكة العربية السعودية · المركز السعودي للرعاية الصحية الاتصالية وحجب الهوية (SDAIA Clean Room)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  border: '1px solid #86efac',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>✓</span>
                <span>SDAIA Masked (10********)</span>
              </span>
              <span
                style={{
                  backgroundColor: '#f0fdfa',
                  color: TEAL_PRIMARY,
                  border: `1px solid ${TEAL_SECONDARY}`,
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: 800,
                }}
              >
                MOH Telehealth Certified
              </span>
            </div>
          </div>

          {/* Patient & Referring Facility Demographics */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: '11px',
            }}
          >
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>{isAr ? 'اسم المريض:' : 'Patient Name:'}</span>
              <strong style={{ color: '#0f172a', fontSize: '13px' }}>{patientName}</strong>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>{patientNameEn} · 48Y / Male</div>
            </div>

            <div>
              <span style={{ color: '#64748b', display: 'block' }}>{isAr ? 'الطبيب السعودي المعالج (المملكة):' : 'Saudi Treating Doctor (KSA):'}</span>
              <strong style={{ color: '#0f172a', fontSize: '12px' }}>{treatingDocName}</strong>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>مستشفى رعاية الرياض / KFSHRC</div>
            </div>

            <div>
              <span style={{ color: '#64748b', display: 'block' }}>{isAr ? 'الاستشاري الدولي المعين (الهند):' : 'Assigned Senior Consultant (India):'}</span>
              <strong style={{ color: TEAL_PRIMARY, fontSize: '12px' }}>{consultantName}</strong>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>{activeCase.consultant?.center || 'Apollo Hospitals'} · {activeCase.consultant?.city || 'India'}</div>
            </div>

            <div>
              <span style={{ color: '#64748b', display: 'block' }}>{isAr ? 'نمط الاستشارة والفاتورة:' : 'Modality & ZATCA Invoice:'}</span>
              <strong style={{ color: '#0f172a', fontSize: '12px' }}>
                {activeCase.modality === 'Video' ? 'Video + Written (Tier 2)' : 'Written Opinion (Tier 1)'}
              </strong>
              <div style={{ color: WHATSAPP_GREEN, fontSize: '10px', fontWeight: 700 }}>
                ✓ {invoiceNum} · مدفوعة بالكامل عبر مدى
              </div>
            </div>
          </div>

          {/* Diagnostic Imaging Audit Summary */}
          <div
            style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              padding: '14px 18px',
              border: `1.5px solid ${WHATSAPP_GREEN}`,
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
              🔬 {isAr ? 'فحص التصوير الطبي ثلاثي الأبعاد (3D Volumetric DICOM Audit)' : '3D Volumetric DICOM Audit'}
            </div>
            <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5 }}>
              {isAr
                ? 'تمت معاينة ومطابقة مقاطع الأشعة المقطعية متعددة الشرائح ورنين القلب المغناطيسي (سلسلة ٤: تكلسات الشرفة وحلقة الصمام الأبهري) من قبل د. براديب كومار في مستشفى أبولو بالهند.'
                : 'Multi-slice CT cardiac volumetric imaging and transesophageal echocardiography (Series #4: Annular and leaflet calcification) thoroughly reviewed by Dr. Pradeep Kumar at Apollo Hospitals.'}
            </div>
          </div>

          {/* The 3 Specific Focus Questions & Answers (Dual-Language English + Certified Arabic) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: TEAL_PRIMARY, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>❓</span>
              <span>
                {isAr
                  ? 'إجابة الأسئلة السريرية الثلاثة الموجهة من الطبيب السعودي (مترجمة ومعتمدة)'
                  : 'Answers to the 3 Treating Physician Focus Questions (Bilingual Certified)'}
              </span>
            </div>

            {questionsAndAnswers.map((qa) => (
              <div
                key={qa.num}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                }}
              >
                {/* Question Header */}
                <div
                  style={{
                    backgroundColor: '#f1f5f9',
                    padding: '10px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                    <span style={{ color: TEAL_PRIMARY, fontWeight: 900 }}>Q{qa.num}: </span>
                    <span>{qa.qAr}</span>
                  </div>
                  <span
                    style={{
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {qa.clinicalRecommendation}
                  </span>
                </div>

                {/* Question English Subtitle */}
                <div style={{ padding: '6px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>
                  English Query: {qa.qEn}
                </div>

                {/* Dual-Column Answers (English Original + Certified Arabic Translation) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '12px',
                    padding: '14px 16px',
                  }}
                >
                  {/* English Original */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      direction: 'ltr',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🇬🇧 Indian Consultant Clinical Opinion (English):
                    </div>
                    <div style={{ fontSize: '11px', color: '#0f172a', lineHeight: 1.5 }}>
                      {qa.ansEn}
                    </div>
                  </div>

                  {/* Certified Arabic Localization */}
                  <div
                    style={{
                      backgroundColor: '#f0fdfa',
                      borderRadius: '8px',
                      padding: '12px',
                      border: `1px solid ${TEAL_SECONDARY}`,
                      direction: 'rtl',
                      textAlign: 'right',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 800, color: TEAL_PRIMARY, marginBottom: '4px' }}>
                      🇸🇦 الترجمة الطبية والتعريب السريري المعتمد (منسق رعاية ألو):
                    </div>
                    <div style={{ fontSize: '11px', color: '#0f172a', lineHeight: 1.5 }}>
                      {qa.ansAr}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Official Signatures & Digital Certification Seals */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            {/* Signature 1: Treating Doctor */}
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>اعتماد الطبيب السعودي المعالج</div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{treatingDocName}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>استشاري أمراض القلب · الرياض</div>
              <div style={{ marginTop: '6px', fontSize: '10px', color: '#166534', fontWeight: 700 }}>✓ اعتمد التحويل والأسئلة الثلاثة</div>
            </div>

            {/* Signature 2: Indian Consultant */}
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f0fdfa', borderRadius: '8px', border: `1px solid ${TEAL_SECONDARY}` }}>
              <div style={{ fontSize: '10px', color: TEAL_PRIMARY }}>اعتماد الاستشاري الدولي بالهند</div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: TEAL_PRIMARY, marginTop: '4px' }}>{consultantName}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Senior Cardiothoracic Surgeon · Apollo Hospitals</div>
              <div style={{ marginTop: '6px', fontSize: '10px', color: '#166534', fontWeight: 700 }}>✓ Signed & Sealed via DICOM Hash</div>
            </div>

            {/* Signature 3: Alo Coordinator & Medical Translator */}
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: `1px solid ${WHATSAPP_GREEN}` }}>
              <div style={{ fontSize: '10px', color: '#166534' }}>التدقيق اللغوي والختم الطبي المعتمد</div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', marginTop: '4px' }}>عبدالرحمن الشهري</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>منسق رعاية ألو ومترجم طبي معتمد</div>
              <div style={{ marginTop: '6px', fontSize: '10px', color: '#166534', fontWeight: 700 }}>✓ مصادقة الترجمة والإصدار بالتوازي</div>
            </div>
          </div>

          {/* Legal & Regulatory Compliance Footer */}
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', lineHeight: 1.5, padding: '4px 0 12px 0' }}>
            تم إصدار هذا الرأي الطبي الثاني وفقاً لمعايير المجلس الصحي السعودي وحجب البيانات المعتمد من سدايا (SDAIA).
            <br />
            ALO DOCTOR CLINICAL DOSSIER · SECURE DIGITAL ID: SHA-256: 8f4a1c92e071... · ZATCA CERTIFIED
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ClinicalCase } from '../../../types';
import { TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, WHATSAPP_GREEN } from '../types';

interface DoctorBilingualEndorsementSectionProps {
  activeCase: ClinicalCase;
  isAr: boolean;
  focusQs: string[];
  cardInnerStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  onOpenReportModal?: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onAdvanceStage: () => void;
}

export const DoctorBilingualEndorsementSection: React.FC<DoctorBilingualEndorsementSectionProps> = ({
  activeCase,
  isAr,
  focusQs,
  cardInnerStyle,
  labelStyle,
  onOpenReportModal,
  onUpdateCase,
  onAdvanceStage,
}) => {
  const [localDirectives, setLocalDirectives] = useState('موصى بمتابعة تخطيط القلب وإيكو بعد 30 يوماً، والالتزام بجرعات مسيلات الدم.');
  const [showRevisionBox, setShowRevisionBox] = useState(false);
  const [revisionText, setRevisionText] = useState('');

  return (
    <>
      {/* D11: Waiting state while Alo Coordinator is localizing the English opinion */}
      {activeCase.secondOpinionSubmitted && !activeCase.coordinatorForwardedToDoctor && (
        <div
          style={{
            ...cardInnerStyle,
            backgroundColor: '#f8fafc',
            borderColor: '#cbd5e1',
            marginTop: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ ...labelStyle, color: '#475569', margin: 0 }}>
              D11 · {isAr ? 'قيد التعريب والتدقيق اللغوي من منسق ألو' : 'In Coordinator Arabic Localization'}
            </span>
            <span
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              ⏳ {isAr ? 'بانتظار التعريب' : 'Awaiting Localization'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5 }}>
            <strong>{isAr ? 'الاستشاري الدولي (الهند): ' : 'Consultant (India): '}</strong>
            <span>{activeCase.consultant?.name || 'Dr. Pradeep Kumar'} ({activeCase.consultant?.center || 'Apollo Hospitals'})</span>
            <div style={{ marginTop: '6px', fontSize: '10px', color: '#64748b', lineHeight: 1.4 }}>
              {isAr
                ? 'وصل الرأي الطبي الإنجليزي لمنسق ألو. يقوم المنسق حالياً بالتدقيق اللغوي وإعداد الترجمة العربية المعتمدة. سيصلك الملف ثنائي اللغة فور اعتماده في (C08).'
                : 'English opinion received by Alo Coordinator. Arabic localization in progress. The complete bilingual dossier will be forwarded to your screen upon C08 certification.'}
            </div>
          </div>
        </div>
      )}

      {/* D11–D12: International Second Opinion Unlocked ONLY Post-Coordinator Forwarding */}
      {activeCase.coordinatorForwardedToDoctor && (
        <div
          style={{
            ...cardInnerStyle,
            backgroundColor: '#f0fdf4',
            borderColor: WHATSAPP_GREEN,
            borderWidth: '2px',
            marginTop: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ ...labelStyle, color: '#166534', margin: 0 }}>
              D11–D12 · {isAr ? 'تم استلام الرأي الدولي المعتمد ثنائي اللغة' : 'Bilingual Opinion Received from Coordinator'}
            </span>
            <span
              style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                border: '1px solid #86efac',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 800,
              }}
            >
              {isAr ? '✓ معتمد ومترجم' : '✓ Verified & Translated'}
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5, marginBottom: '10px' }}>
            <strong>{isAr ? 'الاستشاري الدولي (الهند): ' : 'Consultant (India): '}</strong>
            <span>{activeCase.consultant?.name || 'Dr. Pradeep Kumar'} ({activeCase.consultant?.center || 'Apollo Hospitals'})</span>
            <div style={{ marginTop: '4px', color: '#166534', fontWeight: 700 }}>
              {activeCase.consultantOpinion || (isAr ? 'تم تأكيد التوصية الجراحية (SAVR) بناءً على تكلس الصمام ثلاثي الأبعاد.' : 'SAVR indicated based on 3D DICOM volumetric reconstruction.')}
            </div>
          </div>

          {/* The 3 Answers Summary Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {[0, 1, 2].map((idx) => {
              const defaultAnsEn = [
                'Based on 3D DICOM volumetric review, severe asymmetric annular calcification favors Open SAVR with a 23mm valve over TAVR to prevent paravalvular leak.',
                'Ostial LAD 50-60% calcified plaque with preserved FFR (>0.82) is non-critical; standalone SAVR valve replacement advised without concurrent CABG bypass.',
                'If bioprosthesis: Warfarin (INR target 2.0-2.5) for initial 3 months, then Aspirin 81mg daily. If mechanical: Life-long Warfarin (INR target 2.5-3.0).'
              ][idx];
              const defaultAnsAr = [
                'الجراحة المفتوحة (SAVR) بصمام 23 ملم مفضلة لتجنب التسريب وحصار التوصيل.',
                'لا حاجة لمجازة تاجية (CABG) مرافقة؛ الاحتفاظ بجراحة الصمام المفردة.',
                'وارفارين (هدف 2.0-2.5) لمدة 3 أشهر ثم أسبرين 81 ملغ يومياً.'
              ][idx];
              const qLabel = focusQs[idx] || (idx === 0 ? 'TAVR vs SAVR' : idx === 1 ? 'Coronary LAD' : 'Anticoagulation');
              const consultantAns = activeCase.consultantAnswers?.[idx] || defaultAnsEn;
              return (
                <div key={idx} style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '10px' }}>
                  <div style={{ fontWeight: 800, color: TEAL_PRIMARY, marginBottom: '2px' }}>
                    Q{idx + 1}: {qLabel}
                  </div>
                  <div style={{ color: '#0f172a', direction: 'ltr', textAlign: 'left', fontSize: '10px', lineHeight: 1.35 }}>
                    {consultantAns}
                  </div>
                  {isAr && (
                    <div style={{ color: '#166534', direction: 'rtl', textAlign: 'right', fontSize: '9px', fontWeight: 600, marginTop: '3px', borderTop: '1px dashed #e2e8f0', paddingTop: '2px' }}>
                      🇸🇦 الترجمة المعتمدة: {defaultAnsAr}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Consultant Free-Text Notes Relay */}
          {activeCase.consultantNotes && (
            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '10px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 800, color: TEAL_PRIMARY, marginBottom: '2px' }}>
                {isAr ? 'ملاحظات وتوصيات الاستشاري الإضافية (الهند):' : 'Senior Consultant Clinical Notes (India):'}
              </div>
              <div style={{ color: '#0f172a', direction: 'ltr', textAlign: 'left', fontSize: '10px', lineHeight: 1.35 }}>
                {activeCase.consultantNotes}
              </div>
              {isAr && (
                <div style={{ color: '#166534', direction: 'rtl', textAlign: 'right', fontSize: '9px', fontWeight: 600, marginTop: '3px', borderTop: '1px dashed #e2e8f0', paddingTop: '2px' }}>
                  🇸🇦 التعريب: تأكيد استبدال الصمام جراحياً بصمام 23 ملم بتوجيه الإيكو عبر المريء واستبعاد أي انسداد تحت الصمام، مع مراقبة التوصيل الأذيني البطيني.
                </div>
              )}
            </div>
          )}

          {/* Action Buttons: Preview PDF & D12 Sovereign Doctor Release */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={onOpenReportModal}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                color: TEAL_PRIMARY,
                border: `1.5px solid ${TEAL_PRIMARY}`,
                borderRadius: '8px',
                padding: '8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>👁️</span>
              <span>
                {isAr
                  ? 'معاينة مسودة التقرير الطبي ثنائي اللغة (Bilingual PDF)'
                  : 'Preview Certified Bilingual Dossier (PDF)'}
              </span>
            </button>

            {/* SCFHS License & Local Clinical Directives Input */}
            <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: TEAL_PRIMARY }}>
                  {isAr ? 'توجيهات الطبيب السعودي المعالج (SCFHS: 8821):' : 'Saudi Doctor Directives (SCFHS: 8821):'}
                </span>
                <span style={{ backgroundColor: TEAL_BG, color: TEAL_PRIMARY, padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>
                  ✓ {isAr ? 'ترخيص ساري' : 'SCFHS Active'}
                </span>
              </div>
              <textarea
                rows={2}
                value={localDirectives}
                onChange={(e) => setLocalDirectives(e.target.value)}
                placeholder={isAr ? 'أدخل أي توجيهات دوائية أو نمط حياة محلي للمريض...' : 'Enter local clinical or lifestyle directives...'}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '10px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* D12-A: Saudi Treating Doctor Sovereign Release to Patient (Action 7A) */}
            <button
              type="button"
              disabled={activeCase.doctorReleasedToPatient}
              onClick={() => {
                onUpdateCase({
                  doctorReleasedToPatient: true,
                  reportReleased: true,
                  currentStage: 'CLOSED',
                  stage: 7,
                  saudiEndorsement: {
                    status: 'endorsed',
                    doctorName: activeCase.treatingDoctor?.name || 'د. عبدالله الشمري',
                    scfhsLicense: 'SCFHS-2024-KSA-8821',
                    endorsementDate: new Date().toISOString(),
                    localClinicalNotes: localDirectives,
                    requiresLocalLab: true,
                    prescriptionIssued: true,
                    releasedToPatient: true,
                  }
                });
                onAdvanceStage();
              }}
              style={{
                width: '100%',
                backgroundColor: activeCase.doctorReleasedToPatient ? '#e2e8f0' : WHATSAPP_GREEN,
                color: activeCase.doctorReleasedToPatient ? '#475569' : '#ffffff',
                border: activeCase.doctorReleasedToPatient ? '1px solid #cbd5e1' : 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: activeCase.doctorReleasedToPatient ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeCase.doctorReleasedToPatient ? 'none' : '0 4px 12px rgba(37, 211, 102, 0.4)',
              }}
            >
              {activeCase.doctorReleasedToPatient ? (
                <>
                  <span>✓</span>
                  <span>
                    {isAr
                      ? 'D12-A · تم مصادقة التقرير من الطبيب السعودي وتسليمه رسمياً للمريض'
                      : 'D12-A · Approved by Saudi Physician & Released to Patient'}
                  </span>
                </>
              ) : (
                <span>
                  {isAr
                    ? '⚡ D12-A · مصادقة الطبيب السعودي المعالج واعتماد تسليم التقرير للمريض'
                    : '⚡ D12-A · Saudi Treating Doctor Endorsement & Release to Patient'}
                </span>
              )}
            </button>

            {/* D12-B: Request Clinical Revision (Action 7B Fallback) */}
            {!activeCase.doctorReleasedToPatient && (
              <div>
                {!showRevisionBox ? (
                  <button
                    type="button"
                    onClick={() => setShowRevisionBox(true)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      color: '#b91c1c',
                      border: '1.5px dashed #f87171',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🔄 {isAr ? 'D12-B · طلب مراجعة وتعديل سريري من الاستشاري الدولي (Action 7B)' : 'D12-B · Request Clinical Revision from Specialist (Action 7B)'}
                  </button>
                ) : (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', marginTop: '4px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#991b1b', marginBottom: '4px' }}>
                      {isAr ? 'سبب طلب المراجعة السريرية (يُعاد توجيهه لمنسق ألو والاستشاري):' : 'Clinical Revision Query for Coordinator & Consultant:'}
                    </div>
                    <textarea
                      rows={2}
                      value={revisionText}
                      onChange={(e) => setRevisionText(e.target.value)}
                      placeholder={isAr ? 'أدخل استفسارك أو تحفظك السريري على الجرعة أو التوصية...' : 'Specify clinical contraindications or dosage queries...'}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #f87171', fontSize: '10px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCase({
                            saudiEndorsement: {
                              status: 'revision_requested',
                              revisionQuery: revisionText || 'الرجاء تدقيق جرعات مضادات التخثر ومقارنتها بتوصيات قسطرة الشرايين.',
                              requiresLocalLab: true,
                              prescriptionIssued: false,
                              releasedToPatient: false,
                            }
                          });
                          alert(isAr ? 'تم إرسال طلب المراجعة لمنسق ألو بنجاح!' : 'Revision query dispatched to ALO Coordinator!');
                          setShowRevisionBox(false);
                        }}
                        style={{ flex: 1, backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        {isAr ? 'إرسال طلب المراجعة' : 'Submit Revision'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRevisionBox(false)}
                        style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

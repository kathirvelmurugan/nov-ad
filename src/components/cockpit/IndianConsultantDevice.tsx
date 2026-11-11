import React, { useState, useEffect } from 'react';
import { CockpitDeviceProps, TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, VERDICTS_AR, VERDICTS_EN } from './types';

const DEFAULT_CONSULTANT_ANSWERS = [
  'Based on 3D DICOM volumetric review, severe asymmetric annular calcification favors Open SAVR with a 23mm valve over TAVR to prevent paravalvular leak.',
  'Ostial LAD 50-60% calcified plaque with preserved FFR (>0.82) is non-critical; standalone SAVR valve replacement advised without concurrent CABG bypass.',
  'If bioprosthesis: Warfarin (INR target 2.0-2.5) for initial 3 months, then Aspirin 81mg daily. If mechanical: Life-long Warfarin (INR target 2.5-3.0).'
];

const DEFAULT_CONSULTANT_NOTE =
  'Patient presents with severe symptomatic calcific aortic stenosis. Correlating 3D DICOM reconstructions with clinical hemodynamics, standalone SAVR 23mm valve replacement is strongly endorsed. Intraoperative transesophageal echocardiography (TEE) should guide seating and verify clearance from coronary ostia. Low-threshold monitoring for post-operative transient AV conduction disturbances advised.';

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
  const [consultantAnswers, setConsultantAnswers] = useState<string[]>(() => {
    if (activeCase.consultantAnswers && activeCase.consultantAnswers.length === 3) {
      return activeCase.consultantAnswers;
    }
    return ['', '', ''];
  });
  const [consultantNotes, setConsultantNotes] = useState<string>(activeCase.consultantNotes || '');
  const [viewTab, setViewTab] = useState<'current' | 'portfolio'>('current');

  useEffect(() => {
    if (activeCase.verdicts) setSelectedVerdicts(activeCase.verdicts);
    if (activeCase.consultantAnswers?.length === 3) setConsultantAnswers(activeCase.consultantAnswers);
    if (activeCase.consultantNotes) setConsultantNotes(activeCase.consultantNotes);
  }, [activeCase.verdicts, activeCase.consultantAnswers, activeCase.consultantNotes]);

  const toggleVerdict = (v: string) => {
    const updated = selectedVerdicts.includes(v)
      ? selectedVerdicts.filter((item) => item !== v)
      : [...selectedVerdicts, v];
    setSelectedVerdicts(updated);
    onUpdateCase({ verdicts: updated });
  };

  const handleUpdateAnswer = (idx: number, text: string) => {
    const updated = [...consultantAnswers];
    updated[idx] = text;
    setConsultantAnswers(updated);
    onUpdateCase({ consultantAnswers: updated });
  };

  const handlePreFillSampleAnswers = () => {
    setConsultantAnswers([...DEFAULT_CONSULTANT_ANSWERS]);
    onUpdateCase({ consultantAnswers: [...DEFAULT_CONSULTANT_ANSWERS] });
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
          {/* Dual Navigation: Active Case Review vs Handled Portfolio */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setViewTab('current')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: viewTab === 'current' ? '#ffffff' : 'transparent',
                color: viewTab === 'current' ? TEAL_PRIMARY : '#64748b',
                boxShadow: viewTab === 'current' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {isAr ? `الحالة الحالية (${activeCase.egressToken || 'ALO-KSA-9482'})` : `Active Case (${activeCase.egressToken || 'ALO-KSA-9482'})`}
            </button>
            <button
              type="button"
              onClick={() => setViewTab('portfolio')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: viewTab === 'portfolio' ? '#ffffff' : 'transparent',
                color: viewTab === 'portfolio' ? TEAL_PRIMARY : '#64748b',
                boxShadow: viewTab === 'portfolio' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {isAr ? 'سجل الحالات المكتملة (3)' : 'My Case Portfolio (3)'}
            </button>
          </div>

          {viewTab === 'portfolio' ? (
            <div style={{ ...cardInnerStyle, backgroundColor: '#f8fafc' }}>
              <span style={labelStyle}>{isAr ? 'أرشيف الحالات المكتملة للاستشاري' : 'Handled Cases Portfolio Archive'}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {[
                  { id: 'ALO-KSA-9482', dx: 'Severe Calcific AS', verdict: 'Open SAVR 23mm', date: '2026-11-10', status: 'Active' },
                  { id: 'ALO-KSA-9210', dx: 'Multivessel CAD / LAD Ostial', verdict: 'Hybrid PCI + SAVR', date: '2026-11-04', status: 'Endorsed' },
                  { id: 'ALO-KSA-8842', dx: 'Bicuspid Aortic Root Aneurysm', verdict: 'Valve-Sparing David-V', date: '2026-10-28', status: 'Completed' },
                ].map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>{item.id}</span>
                      <span style={{ fontSize: '10px', backgroundColor: '#ccfbf1', color: TEAL_PRIMARY, padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{item.dx} · {item.verdict}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Reviewed on {item.date} · Apollo Hospitals</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Assigned Consultant Header (Selected by Saudi Treating Doctor) */}
              <div style={{ ...cardInnerStyle, backgroundColor: '#f0fdfa', borderColor: TEAL_SECONDARY }}>
                <span style={{ ...labelStyle, color: TEAL_PRIMARY, margin: 0, fontSize: '10px' }}>
                  {isAr ? 'الاستشاري الدولي المعين من الطبيب السعودي المعالج:' : 'Assigned Consultant by Saudi Treating Doctor:'}
                </span>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                  {activeCase.consultant?.name || 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)'}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px' }}>
                  {activeCase.consultant?.center || 'Apollo Hospitals'} · {activeCase.consultant?.city || 'Bengaluru, India'}
                </div>
              </div>

          {/* SDAIA Cross-Border De-identified Patient Card (Art. 29 Compliance) */}
          <div style={{ ...cardInnerStyle, backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ ...labelStyle, color: '#475569', margin: 0 }}>
                {isAr ? 'ملف الحالة الدولية (مجهّل الهوية حسب اشتراطات سدايا)' : 'SDAIA Cross-Border De-identified Subject'}
              </span>
              <span style={{ fontSize: '9px', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Saudi PDPL Art. 29
              </span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
              {isAr ? `رمز الحالة: ${activeCase.egressToken || 'ALO-KSA-9482'} (٤٨ سنة / ذكر)` : `Subject Token: ${activeCase.egressToken || 'ALO-KSA-9482'} (48Y / Male)`}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
              {isAr
                ? '🔒 تم حجب الاسم الكامل ورقم الهوية الوطنية عند عبور البيانات خارج المملكة وفقاً لنظام حماية البيانات الشخصية.'
                : '🔒 Direct identifiers (Full Name, National ID/Iqama, Phone) redacted prior to export in compliance with Saudi cross-border transfer laws.'}
            </div>
          </div>

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

          {/* D07–D09 & K05-QA: Treating Physician's 3 Focus Questions & Consultant Answers */}
          <div style={{ ...cardInnerStyle, backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ ...labelStyle, margin: 0 }}>
                D07–D09 · {isAr ? 'أسئلة الطبيب السعودي المعالج وإجابات الاستشاري' : 'Treating Physician Focus Questions & Answers'}
              </span>
              {!activeCase.secondOpinionSubmitted && (
                <button
                  type="button"
                  onClick={handlePreFillSampleAnswers}
                  style={{
                    backgroundColor: '#f0fdfa',
                    color: TEAL_PRIMARY,
                    border: `1px solid ${TEAL_SECONDARY}`,
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {isAr ? '⚡ إجابات نموذجية' : '⚡ Sample Answers'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              {(activeCase.focusQuestions && activeCase.focusQuestions.filter(Boolean).length > 0
                ? activeCase.focusQuestions
                : activeCase.treatingDoctor?.focusQuestions && activeCase.treatingDoctor?.focusQuestions.filter(Boolean).length > 0
                ? (activeCase.treatingDoctor?.focusQuestions || [])
                : [
                    isAr ? 'هل استبدال الصمام بالقسطرة (TAVR) أم الجراحة المفتوحة (SAVR) أنسب؟' : 'TAVR vs open SAVR recommendation?',
                    isAr ? 'ما هو تقييم تكلس الشريان التاجي وهل يستدعي مجازة مرافقة (CABG)؟' : 'Does LAD calcification warrant concurrent CABG?',
                    isAr ? 'ما هو بروتوكول مضادات التخثر الموصى به؟' : 'Recommended anticoagulation protocol?',
                  ]
              ).map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 800, color: TEAL_PRIMARY }}>Q{idx + 1}: </span>
                    <span style={{ fontWeight: 600 }}>{q}</span>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '3px',
                      }}
                    >
                      <span>
                        {isAr
                          ? `إجابة الاستشاري السريرية على السؤال ${idx + 1} (English):`
                          : `Consultant Clinical Answer to Q${idx + 1} (English):`}
                      </span>
                      <span style={{ fontSize: '9px', color: consultantAnswers[idx]?.trim() ? TEAL_PRIMARY : '#94a3b8' }}>
                        {consultantAnswers[idx]?.trim() ? '✓ Custom input' : '(Default fallback)'}
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      dir="ltr"
                      disabled={activeCase.secondOpinionSubmitted}
                      placeholder={DEFAULT_CONSULTANT_ANSWERS[idx]}
                      value={consultantAnswers[idx] || ''}
                      onChange={(e) => handleUpdateAnswer(idx, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '10px',
                        lineHeight: 1.4,
                        fontFamily: "'Inter', sans-serif",
                        resize: 'vertical',
                        backgroundColor: activeCase.secondOpinionSubmitted ? '#f8fafc' : '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
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

          {/* K05-NOTES: Free-text Clinical Synthesis & Surgical Notes */}
          <div style={cardInnerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ ...labelStyle, margin: 0 }}>
                K05-NOTES · {isAr ? 'ملاحظات سريرية ورؤى جراحية إضافية (نص حر)' : 'Consultant Notes & Holistic Impressions (Free-text)'}
              </span>
              {!activeCase.secondOpinionSubmitted && (
                <button
                  type="button"
                  onClick={() => {
                    setConsultantNotes(DEFAULT_CONSULTANT_NOTE);
                    onUpdateCase({ consultantNotes: DEFAULT_CONSULTANT_NOTE });
                  }}
                  style={{
                    backgroundColor: '#f0fdfa',
                    color: TEAL_PRIMARY,
                    border: `1px solid ${TEAL_SECONDARY}`,
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {isAr ? '⚡ ملاحظة نموذجية' : '⚡ Sample Note'}
                </button>
              )}
            </div>
            <textarea
              rows={3}
              dir="ltr"
              disabled={activeCase.secondOpinionSubmitted}
              placeholder={DEFAULT_CONSULTANT_NOTE}
              value={consultantNotes}
              onChange={(e) => {
                setConsultantNotes(e.target.value);
                onUpdateCase({ consultantNotes: e.target.value });
              }}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '10px',
                lineHeight: 1.45,
                fontFamily: "'Inter', sans-serif",
                resize: 'vertical',
                backgroundColor: activeCase.secondOpinionSubmitted ? '#f8fafc' : '#ffffff',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px', textAlign: isAr ? 'right' : 'left' }}>
              {isAr
                ? 'تدوين أي اعتبارات تشريحية، تحفظات دوائية أو توصيات مرافقة للجراحة لنقلها لمنسق ألو والطبيب السعودي المعالج.'
                : 'Enter anatomical nuances, intraoperative caveats, or post-operative monitoring advice to relay to Coordinator & Saudi Treating Doctor.'}
            </div>
          </div>

          {/* K06: Submit Second Opinion (Strict Button Lock) */}
          <button
            type="button"
            disabled={activeCase.secondOpinionSubmitted}
            onClick={() => {
              const resolvedAnswers = [
                consultantAnswers[0]?.trim() || DEFAULT_CONSULTANT_ANSWERS[0],
                consultantAnswers[1]?.trim() || DEFAULT_CONSULTANT_ANSWERS[1],
                consultantAnswers[2]?.trim() || DEFAULT_CONSULTANT_ANSWERS[2],
              ];
              const resolvedNotes = consultantNotes.trim() || DEFAULT_CONSULTANT_NOTE;
              onUpdateCase({
                secondOpinionSubmitted: true,
                consultantAnswers: resolvedAnswers,
                consultantNotes: resolvedNotes,
                consultantOpinion: selectedVerdicts.join('; ') || resolvedAnswers.join(' | '),
                currentStage: 'OPINION_READY',
                stage: 6,
              });
              onAdvanceStage();
            }}
            style={{
              backgroundColor: activeCase.secondOpinionSubmitted ? '#e2e8f0' : TEAL_PRIMARY,
              color: activeCase.secondOpinionSubmitted ? '#475569' : '#ffffff',
              border: activeCase.secondOpinionSubmitted ? '1px solid #cbd5e1' : 'none',
              borderRadius: '8px',
              padding: '12px',
              fontWeight: 800,
              fontSize: '11px',
              cursor: activeCase.secondOpinionSubmitted ? 'not-allowed' : 'pointer',
              opacity: activeCase.secondOpinionSubmitted ? 0.8 : 1,
              boxShadow: activeCase.secondOpinionSubmitted ? 'none' : '0 4px 12px rgba(0, 123, 110, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {activeCase.secondOpinionSubmitted ? (
              <>
                <span>✓</span>
                <span>{isAr ? 'K06 · تم اعتماد الرأي الثاني وتوقيعه رقمياً' : 'K06 · Opinion Signed & Submitted'}</span>
              </>
            ) : (
              <span>{isAr ? 'K06 · إرسال الرأي الثاني والملاحظات لمنسق ألو للتعريب (C08)' : 'K06 · Submit Opinion & Notes to Coordinator for Localization (C08)'}</span>
            )}
          </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

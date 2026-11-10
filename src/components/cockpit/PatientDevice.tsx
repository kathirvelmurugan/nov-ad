import React, { useState } from 'react';
import { CockpitDeviceProps, TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, WHATSAPP_GREEN } from './types';
import { 
  FileCheck2, 
  Video, 
  FlaskConical, 
  Pill, 
  Building2, 
  Activity, 
  ArrowRight, 
  ArrowLeft, 
  HeartPulse, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export const PatientDevice: React.FC<CockpitDeviceProps> = ({
  activeCase,
  stageNum,
  onAdvanceStage,
  onUpdateCase,
  lang,
  onOpenReportModal,
}) => {
  const isAr = lang === 'ar';
  const currentTier = activeCase.tier || activeCase.pricing?.tier || 1;
  const [selectedTier, setSelectedTier] = useState<number>(currentTier);

  // Local Intake Form State
  const [patientName, setPatientName] = useState(activeCase.patientName || '');
  const [nationalId, setNationalId] = useState(activeCase.nationalIdMasked ? '1089****10' : '');
  const [specialty, setSpecialty] = useState(activeCase.specialtyAr || activeCase.specialty || '');
  const [symptoms, setSymptoms] = useState(activeCase.symptomsAr || activeCase.symptoms || '');
  const [selectedDoctor, setSelectedDoctor] = useState(activeCase.treatingDoctor?.name || 'د. عبدالله الشمري (مستشفى رعاية الرياض)');
  const [hasScans, setHasScans] = useState((activeCase.files && activeCase.files.length > 0) || false);

  // Synchronize local input state whenever the activeCase updates or resets
  React.useEffect(() => {
    setPatientName(activeCase.patientName || '');
    setNationalId(activeCase.nationalIdMasked ? activeCase.nationalIdMasked : '');
    setSpecialty(activeCase.specialtyAr || activeCase.specialty || '');
    setSymptoms(activeCase.symptomsAr || activeCase.symptoms || '');
    setSelectedDoctor(activeCase.treatingDoctor?.name || 'د. عبدالله الشمري (مستشفى رعاية الرياض)');
    setHasScans((activeCase.files && activeCase.files.length > 0) || false);
  }, [activeCase.id, activeCase.patientName, activeCase.nationalIdMasked, activeCase.symptoms, activeCase.stage]);

  // 1-Click Sample Pre-Seeder for rapid clinical testing
  const handleLoadSampleData = () => {
    setPatientName(isAr ? 'سالم بن عبد العزيز العامري' : 'Salem Abdulaziz Al-Ameri');
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
      patientName: patientName || (isAr ? 'سالم العامري' : 'Salem Al-Ameri'),
      nationalIdMasked: nationalId ? `${nationalId.slice(0, 4)}****${nationalId.slice(-2)}` : '1089****10',
      specialty: specialty || 'Cardiology',
      specialtyAr: specialty || 'أمراض القلب والشرايين',
      symptoms: symptoms || 'Severe exertional dyspnea',
      stage: 2,
      currentStage: 'NURSE_CHECK',
    });
    onAdvanceStage();
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
      {/* 9-Stage Clinical Progress Tracker */}
      <div style={cardInnerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={labelStyle}>{isAr ? 'رحلة المريض السريرية' : 'Clinical Patient Journey'}</span>
          <span style={{ fontSize: '10px', fontWeight: 800, color: TEAL_PRIMARY }}>
            {isAr ? `المرحلة ${Math.min(Math.max(stageNum, 1), 9)} من 9` : `Stage ${Math.min(Math.max(stageNum, 1), 9)} of 9`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                backgroundColor: s <= stageNum ? TEAL_SECONDARY : '#e2e8f0',
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: '11px', marginTop: '6px', color: '#64748b', fontWeight: 600 }}>
          {(() => {
            const labels: Record<number, { ar: string; en: string }> = {
              1: { ar: '1. استلام وتفويض الملف', en: '1. Intake & Consent' },
              2: { ar: '2. فرز التمريض وحجب الهوية', en: '2. Nurse Triage & PII Masking' },
              3: { ar: '3. مراجعة الطبيب المعالج والأسئلة', en: '3. Doctor Review & Questions' },
              4: { ar: '4. سداد الفاتورة والرمز السيادي', en: '4. Payment & Egress Token' },
              5: { ar: '5. دراسة الاستشاري الدولي (الهند)', en: '5. Indian Specialist Evaluation' },
              6: { ar: '6. تعريب التقرير ومصادقة الطبيب', en: '6. Localization & Sign-Off' },
              7: { ar: '7. اعتماد وتسليم التقرير النهائي', en: '7. Bilingual Report Release' },
              8: { ar: '8. متابعة سريرية مباشرة (21 يوماً)', en: '8. 21-Day Follow-Up Window' },
              9: { ar: '9. إغلاق الملف وحفظ السجل', en: '9. Case Closed & Archival' },
            };
            const s = Math.min(Math.max(stageNum, 1), 9);
            return isAr ? labels[s]?.ar : labels[s]?.en;
          })()}
        </div>
      </div>

      {/* STAGE 1: Real-time Patient Intake Form */}
      {stageNum === 1 && (
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
                  placeholder={isAr ? 'مثال: سالم العامري' : 'e.g. Salem Al-Ameri'}
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
      )}

      {/* STAGE 2–3: Interactive Waiting Room */}
      {stageNum >= 2 && stageNum <= 3 && (
        <div style={cardInnerStyle}>
          <span style={labelStyle}>P02 · {isAr ? 'قيد المراجعة السريرية' : 'Clinical Triage in Progress'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <span style={{ fontSize: '24px' }}>⏳</span>
            <div>
              <p style={{ fontSize: '12px', color: '#1e293b', margin: 0, fontWeight: 700 }}>
                {stageNum === 2 
                  ? (isAr ? 'ممرضة ألو تدقق الفحوصات وحجب الهوية (N04)' : 'Alo Nurse is auditing vitals & SDAIA masking (N04)')
                  : (isAr ? 'الطبيب السعودي المعالج يصيغ أسئلة الاستشارة (D07)' : 'Saudi Doctor is framing 3 focus questions (D07)')}
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
                {isAr ? 'ستصلك رسالة واتساب فور اكتمال المراجعة.' : 'WhatsApp update will be dispatched upon review.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: P19 Payment Checkout & Coordinator Gates */}
      {stageNum === 4 && (
        <div style={{ ...cardInnerStyle, borderColor: WHATSAPP_GREEN, borderWidth: '2px', backgroundColor: '#f0fdf4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...labelStyle, color: '#166534' }}>
              P19 · {isAr ? 'بوابة الدفع وسداد الفاتورة' : 'Payment Checkout'}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#166534', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
              {isAr ? 'معتمد من الطبيب' : 'Approved by MD'}
            </span>
          </div>

          {!activeCase.invoiceIssued ? (
            /* Coordinator Gate 1: Waiting for Coordinator to Issue Invoice */
            <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⏳</span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {isAr ? 'اعتمد الطبيب السعودي المعالج إحالتك الطبية' : 'Saudi Treating Doctor Approved Referral'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                    {isAr
                      ? 'منسق رعاية ألو يراجع الآن خطة الإحالة ويصدر الفاتورة الضريبية ZATCA (C02-C04)...'
                      : 'Alo Coordinator is issuing your ZATCA tax invoice (C02-C04)...'}
                  </p>
                </div>
              </div>
            </div>
          ) : !activeCase.pricing?.paid ? (
            /* Invoice Issued: Active Payment Form for Doctor's Prescribed Modality ONLY */
            (() => {
              const prescribedTier = activeCase.tier || (activeCase.modality === 'Video' ? 2 : 1);
              const prescribedAmount = prescribedTier === 2 ? 450 : 250;
              const prescribedLabelAr = prescribedTier === 2 
                ? 'مكالمة فيديو تفاعلية + تقرير استشاري كتابي معتمد (Tier 2)' 
                : 'تقرير استشاري كتابي تخصصي معتمد (Tier 1)';
              const prescribedLabelEn = prescribedTier === 2 
                ? 'Video Telehealth Consultation + Certified Written Report (Tier 2)' 
                : 'Certified Written Second Opinion Report (Tier 1)';

              const allowedLabels = (activeCase.allowedPaymentMethods && activeCase.allowedPaymentMethods.length > 0
                ? activeCase.allowedPaymentMethods
                : ['mada', 'applepay']
              ).map((m) => m === 'mada' ? (isAr ? 'مدى' : 'Mada') : m === 'applepay' ? 'Apple Pay' : m === 'visa' ? 'Visa' : 'Tabby').join(' / ');

              return (
                <>
                  <div
                    style={{
                      marginBottom: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: `2px solid ${TEAL_PRIMARY}`,
                      backgroundColor: TEAL_BG,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: TEAL_PRIMARY, textTransform: 'uppercase' }}>
                        {isAr ? 'الباقة المعتمدة من الطبيب السعودي المعالج:' : 'Prescribed by Saudi Treating Doctor:'}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: TEAL_PRIMARY,
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        Tier {prescribedTier} · {prescribedAmount} SAR
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                      {isAr ? prescribedLabelAr : prescribedLabelEn}
                    </div>

                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
                      {isAr ? 'فاتورة ضريبية معتمدة من هيئة الزكاة والضريبة والجمارك (ZATCA)' : 'ZATCA Tax Compliant Invoice (INV-2026-001)'}
                    </div>
                  </div>

                  {/* Action Button: Pay Now for the Prescribed Amount (Coordinator Gate 2 Bridge) */}
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCase({
                        tier: prescribedTier,
                        paymentVerified: false,
                        pricing: {
                          ...(activeCase.pricing || {}),
                          tier: prescribedTier,
                          baseSar: prescribedAmount,
                          totalSar: prescribedAmount,
                          vatPercent: 15,
                          vatSar: 0,
                          tierName: prescribedTier === 1 ? 'Written' : 'Video',
                          invoiceNumber: activeCase.pricing?.invoiceNumber || 'INV-2026-001',
                          paid: true,
                        },
                        paymentDetails: {
                          ...(activeCase.paymentDetails || {}),
                          method: (activeCase.allowedPaymentMethods && activeCase.allowedPaymentMethods[0]) || 'mada',
                          status: 'completed',
                          amount: prescribedAmount,
                          invoiceNumber: activeCase.pricing?.invoiceNumber || 'INV-2026-001',
                          currency: 'SAR',
                        },
                      });
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: WHATSAPP_GREEN,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(18, 140, 126, 0.25)',
                    }}
                  >
                    <span>💳</span>
                    <span>
                      {isAr
                        ? `سداد ${prescribedAmount} ر.س عبر ${allowedLabels}`
                        : `Pay ${prescribedAmount} SAR via ${allowedLabels}`}
                    </span>
                  </button>
                </>
              );
            })()
          ) : (
            /* Coordinator Gate 2: Paid, Waiting for Coordinator Verification & Dispatch */
            <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: `1.5px solid ${WHATSAPP_GREEN}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⏳</span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#166534', margin: 0 }}>
                    {isAr ? '✓ تم استلام سداد الفاتورة (INV-2026-001)' : '✓ Payment Confirmed (INV-2026-001)'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#334155', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                    {isAr
                      ? 'منسق رعاية ألو يتحقق من إشعار السداد ويوجه الملف الآن إلى الاستشاري بالهند (C06)...'
                      : 'Alo Coordinator is verifying transaction & dispatching dossier to India (C06)...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 5–6: Waiting for Consultant or Treating Doctor Endorsement */}
      {stageNum >= 5 && !activeCase.doctorReleasedToPatient && (
        <div style={{ ...cardInnerStyle, backgroundColor: '#f0fdf4', borderColor: WHATSAPP_GREEN }}>
          <span style={{ ...labelStyle, color: '#166534' }}>
            {activeCase.coordinatorForwardedToDoctor 
              ? (isAr ? 'P24 · قيد مصادقة واعتماد الطبيب السعودي المعالج' : 'P24 · Awaiting Treating Physician Endorsement')
              : (isAr ? 'P21 · تم تأكيد السداد والملف قيد الدراسة السريرية' : 'P21 · Payment Confirmed & In Clinical Review')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {activeCase.coordinatorForwardedToDoctor
                  ? (isAr ? 'طبيبك المعالج د. عبدالله الشمري يراجع التقرير لاعتماده' : 'Dr. Abdullah Al-Shammari is reviewing the report for sign-off')
                  : (isAr ? 'فاتورة ضريبية مسددة (INV-2026-001)' : 'Paid Tax Invoice (INV-2026-001)')}
              </p>
              <p style={{ fontSize: '11px', color: '#166534', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                {activeCase.coordinatorForwardedToDoctor
                  ? (isAr ? 'الملف الطبي المترجم وصل لطبيبك المعالج بمستشفى رعاية الرياض. سيتاح التقرير لك فور اعتماده رسمياً.' : 'Bilingual dossier submitted to your treating doctor. Download unlocks immediately upon physician sign-off.')
                  : (isAr ? 'الاستشاري د. براديب كومار يراجع الأشعة 3D والأسئلة الثلاثة الآن في الهند.' : 'Dr. Pradeep Kumar is reviewing 3D DICOM & focus questions at Apollo Hospitals.')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 6+: P26 Final Report Released BY SAUDI DOCTOR */}
      {activeCase.doctorReleasedToPatient && (
        <div style={{ ...cardInnerStyle, backgroundColor: '#f0fdfa', borderColor: TEAL_SECONDARY }}>
          <span style={labelStyle}>{isAr ? 'P26 · تم استلام التقرير الطبي المعتمد من طبيبك المعالج' : 'P26 · Approved Opinion Released by Doctor'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '24px' }}>📄</span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {isAr ? 'معتمد رسمياً من د. عبدالله الشمري (مستشفى رعاية الرياض)' : 'Officially endorsed by Dr. Abdullah Al-Shammari'}
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
                ALO-2026-BILINGUAL-SECOND-OPINION.pdf
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenReportModal}
            style={{
              width: '100%',
              backgroundColor: TEAL_PRIMARY,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0, 123, 110, 0.25)',
            }}
          >
            <span>📑</span>
            <span>{isAr ? 'عرض وتحميل التقرير الطبي المعتمد (PDF)' : 'View & Download Certified Dossier (PDF)'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

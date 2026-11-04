import React, { useState, useEffect, useCallback, useMemo } from 'react';

export interface ClinicalCase {
  id: string;
  patientName: string;
  stage: number;
  vitals?: Record<string, string>;
  piiMasked?: boolean;
  triageComplete?: boolean;
  focusQuestions?: string[];
  modality?: string;
  referralApproved?: boolean;
  invoiceIssued?: boolean;
  paymentVerified?: boolean;
  reportReleased?: boolean;
  verdicts?: string[];
  secondOpinionSubmitted?: boolean;
  tier?: number;
}

export interface FiveDeviceCockpitProps {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onResetActiveCase?: () => void;
  lang?: 'ar' | 'en';
}

const TEAL_PRIMARY = '#007B6E';
const TEAL_SECONDARY = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const PROCESS_CODES: Record<string, { code: string; desc: Record<'ar' | 'en', string> }[]> = {
  Patient: [
    { code: 'P01', desc: { ar: 'الاستقبال', en: 'Intake' } },
    { code: 'P19', desc: { ar: 'الدفع', en: 'Payment Checkout' } },
    { code: 'P25', desc: { ar: 'الفيديو', en: 'Video Telehealth' } },
    { code: 'P26', desc: { ar: 'التقرير', en: 'Report PDF 1' } },
    { code: 'P27', desc: { ar: 'المتابعة', en: 'Follow-Up' } },
  ],
  'Alo Nurse': [
    { code: 'N01', desc: { ar: 'طابور الاستقبال', en: 'Intake Queue' } },
    { code: 'N02–N03', desc: { ar: 'فحص العلامات', en: 'Vitals Inspection' } },
    { code: 'N04', desc: { ar: 'إخفاء الهوية SDAIA', en: 'SDAIA PII Masking' } },
    { code: 'N05–N07', desc: { ar: 'جاهزية DICOM', en: 'DICOM Readiness' } },
  ],
  'Saudi treating doctor': [
    { code: 'D01', desc: { ar: 'المراجعة', en: 'Review' } },
    { code: 'D02–D04', desc: { ar: 'الفحوصات', en: 'Scans & Labs' } },
    { code: 'D05–D06', desc: { ar: 'النمط', en: 'Modality' } },
    { code: 'D07–D09', desc: { ar: '٣ أسئلة تركيز', en: '3 Focus Questions' } },
    { code: 'D10', desc: { ar: 'اعتماد التحويل', en: 'Approve Referral' } },
  ],
  'Alo Coordinator': [
    { code: 'C01', desc: { ar: 'مراجعة التحويل', en: 'Referral Review' } },
    { code: 'C02–C04', desc: { ar: 'التسعير والفاتورة', en: 'Set Pricing & Issue Invoice' } },
    { code: 'C05–C06', desc: { ar: 'تحقق الدفع', en: 'Payment Verify & Push' } },
    { code: 'C08', desc: { ar: 'إصدار التقرير', en: 'Release Report PDF 1' } },
  ],
  'Indian consultant': [
    { code: 'K01', desc: { ar: 'قبول الحالة', en: 'Accept Case' } },
    { code: 'K02–K04', desc: { ar: 'مراجعة DICOM', en: 'DICOM Review' } },
    { code: 'K05', desc: { ar: 'الأحكام المنظمة', en: 'Structured Verdicts' } },
    { code: 'K06–K07', desc: { ar: 'الإجابة على ٣ أسئلة', en: 'Answer 3 Questions' } },
  ],
};

const VERDICTS_EN = [
  'Agree with diagnosis',
  'Partly agree',
  'Disagree',
  'Surgery advised',
  'Surgery not needed',
  'Change medication',
];

const VERDICTS_AR = [
  'أوافق على التشخيص',
  'أوافق جزئياً',
  'لا أوافق',
  'يُنصح بالجراحة',
  'لا حاجة للجراحة',
  'تغيير الدواء',
];

export const FiveDeviceCockpitView: React.FC<FiveDeviceCockpitProps> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  onResetActiveCase,
  lang = 'en',
}) => {
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [focusQs, setFocusQs] = useState<string[]>(activeCase.focusQuestions || ['', '', '']);
  const [selectedVerdicts, setSelectedVerdicts] = useState<string[]>(activeCase.verdicts || []);
  const isRTL = lang === 'ar';

  useEffect(() => {
    setFocusQs(activeCase.focusQuestions || ['', '', '']);
  }, [activeCase.focusQuestions]);

  useEffect(() => {
    setSelectedVerdicts(activeCase.verdicts || []);
  }, [activeCase.verdicts]);

  const handleToggleExpand = useCallback((device: string) => {
    setExpandedDevice((prev) => (prev === device ? null : device));
  }, []);

  const toggleVerdict = useCallback((verdict: string) => {
    setSelectedVerdicts((prev) => {
      const next = prev.includes(verdict) ? prev.filter((v) => v !== verdict) : [...prev, verdict];
      onUpdateCase({ verdicts: next });
      return next;
    });
  }, [onUpdateCase]);

  const updateFocusQuestion = useCallback((index: number, value: string) => {
    const next = [...focusQs];
    next[index] = value;
    setFocusQs(next);
    onUpdateCase({ focusQuestions: next });
  }, [focusQs, onUpdateCase]);

  const containerStyle: React.CSSProperties = {
    direction: isRTL ? 'rtl' : 'ltr',
    fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif",
    backgroundColor: '#f0fdfa',
    minHeight: '100vh',
    padding: '24px',
    color: '#0f172a',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: expandedDevice ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    maxWidth: '1800px',
    margin: '0 auto',
  };

  const getDeviceFrameType = (role: string): 'mobile' | 'tablet' | 'desktop' => {
    if (role === 'Patient' || role === 'Indian consultant') return 'mobile';
    if (role === 'Alo Nurse') return 'tablet';
    return 'desktop';
  };

  const getActiveProcessCode = (role: string): { code: string; desc: string } => {
    const codes = PROCESS_CODES[role];
    const stage = activeCase.stage;
    let idx = 0;
    if (role === 'Patient') {
      if (stage >= 5) idx = 4;
      else if (stage >= 4) idx = 3;
      else if (stage >= 3) idx = 2;
      else if (stage >= 2) idx = 1;
      else idx = 0;
    } else if (role === 'Alo Nurse') {
      if (stage >= 4) idx = 3;
      else if (stage >= 3) idx = 2;
      else if (stage >= 2) idx = 1;
      else idx = 0;
    } else if (role === 'Saudi treating doctor') {
      if (stage >= 5) idx = 4;
      else if (stage >= 4) idx = 3;
      else if (stage >= 3) idx = 2;
      else if (stage >= 2) idx = 1;
      else idx = 0;
    } else if (role === 'Alo Coordinator') {
      if (stage >= 6) idx = 3;
      else if (stage >= 5) idx = 2;
      else if (stage >= 4) idx = 1;
      else idx = 0;
    } else if (role === 'Indian consultant') {
      if (stage >= 7) idx = 3;
      else if (stage >= 6) idx = 2;
      else if (stage >= 5) idx = 1;
      else idx = 0;
    }
    const item = codes[Math.min(idx, codes.length - 1)];
    return { code: item.code, desc: item.desc[lang] };
  };

  const renderDeviceChrome = (role: string) => {
    const frameType = getDeviceFrameType(role);
    const process = getActiveProcessCode(role);
    const isExpanded = expandedDevice === role;

    const chromeStyle: React.CSSProperties = {
      background: `linear-gradient(135deg, ${TEAL_PRIMARY}, ${TEAL_SECONDARY})`,
      padding: '12px 16px',
      borderRadius: frameType === 'mobile' ? '24px 24px 0 0' : '12px 12px 0 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#ffffff',
      position: 'relative',
    };

    const statusBarStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '11px',
      opacity: 0.85,
      fontWeight: 600,
    };

    const badgeStyle: React.CSSProperties = {
      backgroundColor: 'rgba(255,255,255,0.2)',
      backdropFilter: 'blur(4px)',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      border: '1px solid rgba(255,255,255,0.3)',
    };

    const expandBtnStyle: React.CSSProperties = {
      background: 'rgba(255,255,255,0.15)',
      border: 'none',
      color: '#fff',
      padding: '6px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s ease',
    };

    return (
      <div style={chromeStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={statusBarStyle}>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span>ALO DOCTOR v2.4</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: TEAL_PRIMARY,
              fontWeight: 800,
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {role.charAt(0)}
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.3px' }}>{role}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={badgeStyle}>
            <span style={{ color: WHATSAPP_GREEN, fontWeight: 800 }}>{process.code}</span>
            <span>·</span>
            <span>{process.desc}</span>
          </div>
          <button
            style={expandBtnStyle}
            onClick={() => handleToggleExpand(role)}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            aria-label={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? '⊖ Minimize' : '🔍 Expand'}
          </button>
        </div>
      </div>
    );
  };

  const renderDeviceFrame = (role: string, content: React.ReactNode) => {
    if (expandedDevice && expandedDevice !== role) return null;

    const frameType = getDeviceFrameType(role);
    const isMobile = frameType === 'mobile';
    const isTablet = frameType === 'tablet';

    const frameStyle: React.CSSProperties = {
      backgroundColor: '#ffffff',
      borderRadius: isMobile ? '32px' : '16px',
      boxShadow: expandedDevice === role
        ? `0 25px 50px -12px rgba(0, 123, 110, 0.25), 0 0 0 2px ${TEAL_SECONDARY}`
        : '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      border: `1px solid ${TEAL_BG}`,
      maxWidth: expandedDevice === role ? '100%' : (isMobile ? '380px' : isTablet ? '500px' : '100%'),
      margin: expandedDevice === role ? '0 auto' : '0',
      width: '100%',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
    };

    const bodyStyle: React.CSSProperties = {
      padding: '20px',
      flex: 1,
      overflowY: 'auto',
      backgroundColor: '#fafdfc',
    };

    return (
      <div style={frameStyle} role="region" aria-label={`${role} Device Frame`}>
        {renderDeviceChrome(role)}
        <div style={bodyStyle}>
          {content}
        </div>
        {isMobile && (
          <div style={{
            height: '6px',
            width: '40%',
            backgroundColor: '#cbd5e1',
            borderRadius: '999px',
            margin: '12px auto',
          }} />
        )}
      </div>
    );
  };

  const btnPrimaryStyle: React.CSSProperties = {
    backgroundColor: TEAL_PRIMARY,
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '16px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxShadow: `0 4px 12px rgba(0, 123, 110, 0.2)`,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1.5px solid #e2e8f0`,
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
  };

  const cardInnerStyle: React.CSSProperties = {
    backgroundColor: TEAL_BG,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: `1px solid rgba(0, 198, 174, 0.2)`,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    color: TEAL_PRIMARY,
    marginBottom: '8px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  // --- DEVICE 1: PATIENT ---
  const renderPatient = () => {
    const stage = activeCase.stage;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={cardInnerStyle}>
          <span style={labelStyle}>{lang === 'ar' ? 'رحلة المريض الحية' : 'Live Patient Journey'}</span>
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                backgroundColor: s <= stage ? TEAL_SECONDARY : '#e2e8f0',
                transition: 'background-color 0.3s ease',
              }} />
            ))}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#64748b', fontWeight: 600 }}>
            {lang === 'ar' ? `المرحلة ${stage} من 5` : `Stage ${stage} of 5`}
          </div>
        </div>

        {stage === 1 && (
          <div style={cardInnerStyle}>
            <span style={labelStyle}>P01 · {lang === 'ar' ? 'الاستقبال' : 'Intake'}</span>
            <p style={{ fontSize: '13px', color: '#334155', margin: '8px 0 0 0' }}>
              {lang === 'ar' ? 'مرحباً بك في الو دكتور. جاري تجهيز ملفك الطبي.' : 'Welcome to Alo Doctor. Preparing your clinical intake.'}
            </p>
          </div>
        )}

        {stage >= 2 && stage <= 3 && (
          <div style={cardInnerStyle}>
            <span style={labelStyle}>P25 · {lang === 'ar' ? 'في الانتظار' : 'Waiting Room'}</span>
            <p style={{ fontSize: '13px', color: '#334155', margin: '8px 0 0 0' }}>
              {lang === 'ar' ? 'جاري مراجعة بياناتك من قبل الممرض.' : 'Your data is being reviewed by the nurse.'}
            </p>
          </div>
        )}

        {stage === 4 && (
          <div style={{ ...cardInnerStyle, borderColor: WHATSAPP_GREEN, borderWidth: '2px' }}>
            <span style={{ ...labelStyle, color: WHATSAPP_GREEN }}>P19 · {lang === 'ar' ? 'الدفع' : 'Payment Checkout'}</span>
            <p style={{ fontSize: '13px', color: '#334155', margin: '8px 0 16px 0' }}>
              {lang === 'ar' ? 'اختر باقة الاستشارة:' : 'Select consultation tier:'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2].map((tier) => (
                <button
                  key={tier}
                  onClick={() => onUpdateCase({ tier, stage: 5 })}
                  style={{
                    flex: 1,
                    padding: '16px 12px',
                    borderRadius: '12px',
                    border: activeCase.tier === tier ? `2px solid ${TEAL_PRIMARY}` : '2px solid #e2e8f0',
                    backgroundColor: activeCase.tier === tier ? TEAL_BG : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: 800, color: TEAL_PRIMARY, fontSize: '14px' }}>
                    {lang === 'ar' ? `الفئة ${tier}` : `Tier ${tier}`}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {tier === 1 ? '250 SAR' : '450 SAR'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    {tier === 1 ? (lang === 'ar' ? 'استشارة نصية' : 'Text Consult') : (lang === 'ar' ? 'مكالمة فيديو' : 'Video Call')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {stage >= 5 && (
          <div style={cardInnerStyle}>
            <span style={labelStyle}>P26 · {lang === 'ar' ? 'التقرير' : 'Report'}</span>
            <p style={{ fontSize: '13px', color: '#334155', margin: '8px 0 0 0' }}>
              {lang === 'ar' ? 'تقريرك جاهز للتحميل.' : 'Your report is ready for download.'}
            </p>
          </div>
        )}

        <button
          style={btnPrimaryStyle}
          onClick={onAdvanceStage}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEAL_SECONDARY)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEAL_PRIMARY)}
        >
          {lang === 'ar' ? 'تقدم للمرحلة التالية' : 'Advance Stage'}
        </button>
      </div>
    );
  };

  // --- DEVICE 2: ALO NURSE ---
  const renderAloNurse = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={cardInnerStyle}>
          <span style={labelStyle}>N01 · {lang === 'ar' ? 'طابور الفرز' : 'Triage Checklist'}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {['Identity Verified', 'Chief Complaint Logged', 'Allergies Checked'].map((item, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={activeCase.stage > 1} style={{ accentColor: TEAL_PRIMARY, width: '16px', height: '16px' }} />
                {lang === 'ar' ? ['تم التحقق من الهوية', 'تم تسجيل الشكوى الرئيسية', 'تم فحص الحساسية'][i] : item}
              </label>
            ))}
          </div>
        </div>

        <div style={cardInnerStyle}>
          <span style={labelStyle}>N02–N03 · {lang === 'ar' ? 'العلامات الحيوية' : 'Vitals Inspection'}</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            {['BP', 'HR', 'Temp', 'SpO2'].map((v, i) => (
              <div key={v} style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TEAL_PRIMARY }}>
                  {activeCase.vitals?.[v] || ['120/80', '72', '36.6', '98'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardInnerStyle}>
          <span style={labelStyle}>N04 · {lang === 'ar' ? 'إخفاء الهوية SDAIA' : 'SDAIA PII Masking'}</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', letterSpacing: '1px' }}>
              {activeCase.piiMasked ? '10********' : '1012345678'}
            </span>
            <button
              onClick={() => onUpdateCase({ piiMasked: !activeCase.piiMasked })}
              style={{
                backgroundColor: activeCase.piiMasked ? WHATSAPP_GREEN : '#e2e8f0',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                color: activeCase.piiMasked ? '#ffffff' : '#64748b',
                transition: 'all 0.2s',
              }}
            >
              {activeCase.piiMasked ? (lang === 'ar' ? 'مُخفى' : 'Masked') : (lang === 'ar' ? 'إخفاء' : 'Mask')}
            </button>
          </div>
        </div>

        <button
          style={{
            ...btnPrimaryStyle,
            opacity: activeCase.piiMasked ? 1 : 0.6,
            pointerEvents: activeCase.piiMasked ? 'auto' : 'none',
          }}
          onClick={() => {
            onUpdateCase({ triageComplete: true });
            onAdvanceStage();
          }}
        >
          N04 · {lang === 'ar' ? 'إكمال الفرز والتوجيه للطبيب السعودي' : 'Complete Triage & Route to Saudi Doctor'}
        </button>
      </div>
    );
  };

  // --- DEVICE 3: SAUDI TREATING DOCTOR ---
  const renderSaudiDoctor = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={cardInnerStyle}>
          <span style={labelStyle}>D01 · {lang === 'ar' ? 'مراجعة السجل' : 'Record Inspection'}</span>
          <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{lang === 'ar' ? 'معرف المريض' : 'Patient ID'}</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: TEAL_PRIMARY, letterSpacing: '2px' }}>
              {activeCase.piiMasked ? '10********' : 'UNMASKED WARNING'}
            </div>
          </div>
        </div>

        <div style={cardInnerStyle}>
          <span style={labelStyle}>D05–D06 · {lang === 'ar' ? 'اختيار النمط' : 'Modality Selection'}</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {['Video', 'Audio', 'Chat'].map((m) => (
              <button
                key={m}
                onClick={() => onUpdateCase({ modality: m })}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: activeCase.modality === m ? `2px solid ${TEAL_PRIMARY}` : '2px solid #e2e8f0',
                  backgroundColor: activeCase.modality === m ? TEAL_BG : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: activeCase.modality === m ? TEAL_PRIMARY : '#64748b',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={cardInnerStyle}>
          <span style={labelStyle}>D07–D09 · {lang === 'ar' ? '٣ أسئلة تركيز' : '3 Focus Questions'}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="text"
                placeholder={`${lang === 'ar' ? 'السؤال' : 'Question'} ${i + 1}...`}
                value={focusQs[i] || ''}
                onChange={(e) => updateFocusQuestion(i, e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = TEAL_SECONDARY)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              />
            ))}
          </div>
        </div>

        <button
          style={btnPrimaryStyle}
          onClick={() => {
            onUpdateCase({ referralApproved: true });
            onAdvanceStage();
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEAL_SECONDARY)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEAL_PRIMARY)}
        >
          D10 · {lang === 'ar' ? 'اعتماد التحويل والتوجيه لمنسق الو (C01)' : 'Approve Referral & Route to Alo Coordinator (C01)'}
        </button>
      </div>
    );
  };

  // --- DEVICE 4: ALO COORDINATOR ---
  const renderAloCoordinator = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={cardInnerStyle}>
          <span style={labelStyle}>C01 · {lang === 'ar' ? 'مراجعة التحويل' : 'Referral Review'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              backgroundColor: activeCase.referralApproved ? WHATSAPP_GREEN : '#ef4444',
              boxShadow: `0 0 8px ${activeCase.referralApproved ? WHATSAPP_GREEN : '#ef4444'}`
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              {activeCase.referralApproved
                ? (lang === 'ar' ? 'تم اعتماد التحويل من الطبيب السعودي' : 'Referral approved by Saudi Doctor')
                : (lang === 'ar' ? 'في انتظار الاعتماد' : 'Awaiting approval')}
            </span>
          </div>
        </div>

        <div style={cardInnerStyle}>
          <span style={labelStyle}>C02–C04 · {lang === 'ar' ? 'التسعير وإصدار الفاتورة' : 'Set Pricing & Issue Invoice'}</span>
          <button
            onClick={() => onUpdateCase({ invoiceIssued: true })}
            style={{
              ...btnPrimaryStyle,
              marginTop: '8px',
              backgroundColor: activeCase.invoiceIssued ? '#64748b' : TEAL_PRIMARY,
              boxShadow: 'none',
            }}
            disabled={activeCase.invoiceIssued}
          >
            {activeCase.invoiceIssued
              ? (lang === 'ar' ? 'تم إصدار الفاتورة' : 'Invoice Issued')
              : (lang === 'ar' ? 'إصدار فاتورة C02-C04' : 'Issue Invoice C02-C04')}
          </button>
        </div>

        <div style={cardInnerStyle}>
          <span style={labelStyle}>C05–C06 · {lang === 'ar' ? 'تحقق الدفع' : 'Payment Verify & Push'}</span>
          <button
            onClick={() => onUpdateCase({ paymentVerified: true })}
            style={{
              ...btnPrimaryStyle,
              marginTop: '8px',
              backgroundColor: activeCase.paymentVerified ? WHATSAPP_GREEN : TEAL_PRIMARY,
              boxShadow: 'none',
            }}
            disabled={!activeCase.invoiceIssued || activeCase.paymentVerified}
          >
            {activeCase.paymentVerified
              ? (lang === 'ar' ? 'تم التحقق من الدفع' : 'Payment Verified')
              : (lang === 'ar' ? 'تحقق من الدفع C05' : 'Verify Payment C05')}
          </button>
        </div>

        {activeCase.modality === 'Video' && activeCase.paymentVerified && (
          <div style={{ ...cardInnerStyle, borderColor: WHATSAPP_GREEN, borderWidth: '2px' }}>
            <span style={{ ...labelStyle, color: WHATSAPP_GREEN }}>
              P25 · {lang === 'ar' ? 'تأكيد الموعد (فيديو)' : 'Slot Confirmation (Video)'}
            </span>
            <p style={{ fontSize: '13px', color: '#334155', margin: '8px 0 0 0' }}>
              {lang === 'ar' ? 'تم تأكيد موعد مكالمة الفيديو بعد الدفع.' : 'Video call slot confirmed post-payment.'}
            </p>
          </div>
        )}

        <button
          style={{
            ...btnPrimaryStyle,
            opacity: activeCase.paymentVerified ? 1 : 0.5,
            pointerEvents: activeCase.paymentVerified ? 'auto' : 'none',
          }}
          onClick={() => {
            onUpdateCase({ reportReleased: true });
            onAdvanceStage();
          }}
        >
          C08 · {lang === 'ar' ? 'إصدار التقرير PDF 1 بالتوازي للطبيب والمريض' : 'Release Report PDF 1 in Parallel to Doctor & Patient'}
        </button>
      </div>
    );
  };

  // --- DEVICE 5: INDIAN CONSULTANT ---
  const renderIndianConsultant = () => {
    const verdicts = lang === 'ar' ? VERDICTS_AR : VERDICTS_EN;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={cardInnerStyle}>
          <span style={labelStyle}>K01 · {lang === 'ar' ? 'قبول الحالة' : 'Accept Case'}</span>
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '8px',
            border: `1px solid ${TEAL_PRIMARY}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle at center, rgba(0,198,174,0.15) 0%, transparent 70%)',
            }} />
            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🩻</div>
              <div style={{ color: TEAL_SECONDARY, fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
                K02–K04 · DICOM {lang === 'ar' ? 'معاينة' : 'Preview'}
              </div>
            </div>
          </div>
        </div>

        <div style={cardInnerStyle}>
          <span style={labelStyle}>K05 · {lang === 'ar' ? 'الأحكام السريرية' : 'Clinical Verdicts'}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {verdicts.map((v, i) => {
              const isSelected = selectedVerdicts.includes(v);
              return (
                <button
                  key={i}
                  onClick={() => toggleVerdict(v)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: isSelected ? `2px solid ${TEAL_PRIMARY}` : '2px solid #e2e8f0',
                    backgroundColor: isSelected ? TEAL_BG : '#ffffff',
                    color: isSelected ? TEAL_PRIMARY : '#475569',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: isRTL ? 'right' : 'left',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{
                    width: '16px', height: '16px', borderRadius: '4px',
                    border: isSelected ? `2px solid ${TEAL_PRIMARY}` : '2px solid #cbd5e1',
                    backgroundColor: isSelected ? TEAL_PRIMARY : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', fontSize: '10px', flexShrink: 0,
                  }}>
                    {isSelected && '✓'}
                  </span>
                  {v}
                </button>
              );
            })}
          </div>
        </div>

        <button
          style={{
            ...btnPrimaryStyle,
            opacity: selectedVerdicts.length > 0 ? 1 : 0.5,
            pointerEvents: selectedVerdicts.length > 0 ? 'auto' : 'none',
          }}
          onClick={() => {
            onUpdateCase({ secondOpinionSubmitted: true });
            onAdvanceStage();
          }}
        >
          K06 · {lang === 'ar' ? 'إرسال الرأي الثاني للمنسق' : 'Submit Second Opinion to Coordinator'}
        </button>
      </div>
    );
  };

  const devices = [
    { role: 'Patient', render: renderPatient },
    { role: 'Alo Nurse', render: renderAloNurse },
    { role: 'Saudi treating doctor', render: renderSaudiDoctor },
    { role: 'Alo Coordinator', render: renderAloCoordinator },
    { role: 'Indian consultant', render: renderIndianConsultant },
  ];

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${TEAL_SECONDARY}; border-radius: 3px; }
        button:active { transform: scale(0.98); }
      `}</style>

      <header style={{
        maxWidth: '1800px',
        margin: '0 auto 32px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: TEAL_PRIMARY,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{
              backgroundColor: TEAL_PRIMARY,
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
            }}>
              ALO DOCTOR v2.4
            </span>
            {lang === 'ar' ? 'قمرة القيادة الخماسية' : 'Five Device Cockpit'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0', fontWeight: 500 }}>
            {lang === 'ar'
              ? `الحالة النشطة: ${activeCase.id} · المرحلة: ${activeCase.stage}`
              : `Active Case: ${activeCase.id} · Stage: ${activeCase.stage}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {expandedDevice && (
            <button
              onClick={() => setExpandedDevice(null)}
              style={{
                ...btnPrimaryStyle,
                width: 'auto',
                marginTop: 0,
                backgroundColor: '#0f172a',
                boxShadow: 'none',
              }}
            >
              {lang === 'ar' ? 'عرض الكل' : 'View All 5 Devices'}
            </button>
          )}
          {onResetActiveCase && (
            <button
              onClick={onResetActiveCase}
              style={{
                ...btnPrimaryStyle,
                width: 'auto',
                marginTop: 0,
                backgroundColor: '#ef4444',
                boxShadow: 'none',
              }}
            >
              {lang === 'ar' ? 'إعادة تعيين' : 'Reset Case'}
            </button>
          )}
        </div>
      </header>

      <div style={gridStyle}>
        {devices.map(({ role, render }) => (
          <React.Fragment key={role}>
            {renderDeviceFrame(role, render())}
          </React.Fragment>
        ))}
      </div>

      {/* Live Reactive Sync Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        [isRTL ? 'left' : 'right']: '24px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: 1000,
        fontFamily: 'inherit',
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: WHATSAPP_GREEN,
          boxShadow: `0 0 10px ${WHATSAPP_GREEN}`,
          animation: 'pulse 2s infinite',
        }} />
        {lang === 'ar' ? 'مزامنة تفاعلية حية عبر الأدوار' : 'Live Cross-Role Reactive Sync Active'}
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.5); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
};
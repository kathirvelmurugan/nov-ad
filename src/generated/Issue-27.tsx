import React, { useState, useCallback, useMemo } from 'react';

// --- Types & Interfaces ---
export interface ClinicalCaseData {
  patientName: string;
  maskedId: string;
  specialty: string;
  symptoms: string;
  focusQuestions: string[];
  consultantVerdicts: string[];
  paymentStatus: string;
}

export type Stage = 1 | 2 | 3 | 4 | 5 | 6;

interface FiveDeviceCockpitViewProps {
  initialLang?: 'ar' | 'en';
  activePersona?: string;
}

// --- Constants & Configuration ---
const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A202C',
  textMuted: '#4A5568',
  border: '#CBD5E0',
};

const WHATSAPP_CUES: Record<Stage, { ar: string; en: string }> = {
  1: {
    ar: 'واتساب إلى مكتب التمريض: حالة جديدة ALO-2026-LIVE مقدمة من سالم العامري (أمراض القلب)',
    en: 'WhatsApp to Nurse Desk: New case ALO-2026-LIVE submitted by Salem Al-Ameri (Cardiology)',
  },
  2: {
    ar: 'واتساب إلى د. الشمري: اكتمل الفرز مع العلامات الحيوية ومعرف SDAIA المقنع. جاهز للتدقيق.',
    en: 'WhatsApp to Dr. Al-Shammari: Triage completed with vitals & SDAIA masked ID. Ready for audit.',
  },
  3: {
    ar: 'واتساب إلى المريض: تمت الموافقة على التحويل من قبل د. الشمري. رابط الدفع جاهز.',
    en: 'WhatsApp to Patient: Referral approved by Dr. Al-Shammari. Payment link ready.',
  },
  4: {
    ar: 'واتساب إلى المنسق والهند: تم دفع 250 ريال عبر مدى. تم الإرسال إلى الاستشاري الأول.',
    en: 'WhatsApp to Coordinator & India: 250 SAR paid via Mada. Dispatched to Senior Consultant.',
  },
  5: {
    ar: 'واتساب إلى المنسق: تمت الموافقة على الرأي الثاني مع الأحكام المنظمة. جاهز للإصدار.',
    en: 'WhatsApp to Coordinator: Second opinion approved with structured verdicts. Ready for release.',
  },
  6: {
    ar: 'واتساب إلى المريض والطبيب: تم تسليم التقرير المعتمد ثنائي اللغة (PDF).',
    en: 'WhatsApp to Patient & Doctor: Certified bilingual report (PDF) delivered.',
  },
};

const INITIAL_CASE_DATA: ClinicalCaseData = {
  patientName: '',
  maskedId: '',
  specialty: '',
  symptoms: '',
  focusQuestions: ['', '', ''],
  consultantVerdicts: ['', '', ''],
  paymentStatus: 'PENDING',
};

// --- Sub-Components ---

const WhatsAppBanner: React.FC<{ stage: Stage; lang: 'ar' | 'en' }> = ({ stage, lang }) => {
  const cue = WHATSAPP_CUES[stage][lang];
  const isRTL = lang === 'ar';

  return (
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full shadow-lg transition-all duration-500 animate-bounce"
      style={{
        backgroundColor: PALETTE.whatsapp,
        color: PALETTE.white,
        fontFamily: 'Cairo, sans-serif',
        direction: isRTL ? 'rtl' : 'ltr',
        maxWidth: '90vw',
      }}
      role="alert"
      aria-live="polite"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span className="font-semibold text-sm md:text-base">{cue}</span>
    </div>
  );
};

interface DeviceFrameProps {
  title: string;
  actor: string;
  isActive: boolean;
  isRTL: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ title, actor, isActive, isRTL, children, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col w-full h-[600px] rounded-3xl border-4 transition-all duration-300 overflow-hidden focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
      isActive ? 'scale-105 z-10 shadow-2xl' : 'scale-100 opacity-70 hover:opacity-100 z-0'
    }`}
    style={{
      borderColor: isActive ? PALETTE.primary : PALETTE.border,
      backgroundColor: PALETTE.white,
      direction: isRTL ? 'rtl' : 'ltr',
      fontFamily: 'Cairo, sans-serif',
      focusRingColor: PALETTE.secondary,
    }}
    aria-label={`${title} - ${actor}`}
  >
    <div
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{ backgroundColor: isActive ? PALETTE.background : '#F7FAFC', borderColor: PALETTE.border }}
    >
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
        <h3 className="text-sm font-bold" style={{ color: PALETTE.textDark }}>{title}</h3>
      </div>
      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: PALETTE.primary, color: PALETTE.white }}>
        {actor}
      </span>
    </div>
    <div className="flex-1 p-4 overflow-y-auto text-right" style={{ textAlign: isRTL ? 'right' : 'left' }}>
      {children}
    </div>
  </button>
);

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  isRTL: boolean;
  type?: string;
}> = ({ label, value, onChange, disabled = false, isRTL, type = 'text' }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold mb-1" style={{ color: PALETTE.textMuted }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors"
      style={{
        borderColor: PALETTE.border,
        backgroundColor: disabled ? '#EDF2F7' : PALETTE.white,
        color: PALETTE.textDark,
        focusRingColor: PALETTE.secondary,
      }}
    />
  </div>
);

const TextAreaField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  isRTL: boolean;
  rows?: number;
}> = ({ label, value, onChange, disabled = false, isRTL, rows = 3 }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold mb-1" style={{ color: PALETTE.textMuted }}>
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      dir={isRTL ? 'rtl' : 'ltr'}
      rows={rows}
      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
      style={{
        borderColor: PALETTE.border,
        backgroundColor: disabled ? '#EDF2F7' : PALETTE.white,
        color: PALETTE.textDark,
        focusRingColor: PALETTE.secondary,
      }}
    />
  </div>
);

// --- Main Component ---

const FiveDeviceCockpitView: React.FC<FiveDeviceCockpitViewProps> = ({ initialLang = 'en', activePersona = 'admin' }) => {
  const [lang, setLang] = useState<'ar' | 'en'>(initialLang);
  const [stage, setStage] = useState<Stage>(1);
  const [caseData, setCaseData] = useState<ClinicalCaseData>(INITIAL_CASE_DATA);
  const [activeDevice, setActiveDevice] = useState<number>(0);

  const isRTL = lang === 'ar';

  const updateField = useCallback(<K extends keyof ClinicalCaseData>(field: K, value: ClinicalCaseData[K]) => {
    setCaseData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateArrayField = useCallback((field: 'focusQuestions' | 'consultantVerdicts', index: number, value: string) => {
    setCaseData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  }, []);

  const handleReset = useCallback(() => {
    setStage(1);
    setCaseData(INITIAL_CASE_DATA);
    setActiveDevice(0);
    // Clean state without touching browser cookies or localStorage
  }, []);

  const handleNextStage = useCallback(() => {
    setStage((prev) => (prev < 6 ? ((prev + 1) as Stage) : prev));
    setActiveDevice((prev) => (prev < 4 ? prev + 1 : prev));
  }, []);

  const labels = useMemo(() => ({
    patientName: isRTL ? 'اسم المريض' : 'Patient Name',
    maskedId: isRTL ? 'معرف SDAIA المقنع' : 'SDAIA Masked ID',
    specialty: isRTL ? 'التخصص' : 'Specialty',
    symptoms: isRTL ? 'الأعراض' : 'Symptoms',
    focusQ: isRTL ? 'سؤال التركيز' : 'Focus Question',
    verdict: isRTL ? 'حكم الاستشاري' : 'Consultant Verdict',
    freshRun: isRTL ? 'تشغيل حي جديد' : 'Fresh Live Run',
    nextStage: isRTL ? 'المرحلة التالية' : 'Next Stage',
    author: isRTL ? 'المؤلف: أدريان لويس (قائد العمليات)' : 'Author: Adrian Lewis (Operations Lead)',
  }), [isRTL]);

  const devices = useMemo(() => [
    { id: 0, title: isRTL ? 'جهاز المريض' : 'Patient Device', actor: isRTL ? 'سالم العامري' : 'Salem Al-Ameri', isRTL: true },
    { id: 1, title: isRTL ? 'ممرضة ألو' : 'Alo Nurse', actor: isRTL ? 'سارة الحربي' : 'Sarah Al-Harbi', isRTL: true },
    { id: 2, title: isRTL ? 'طبيب سعودي معالج' : 'Saudi Treating Doctor', actor: isRTL ? 'د. عبدالله الشمري' : 'Dr. Abdullah Al-Shammari', isRTL: true },
    { id: 3, title: isRTL ? 'منسق ألو' : 'Alo Coordinator', actor: isRTL ? 'عبدالرحمن الشهري' : 'Abdulrahman Al-Shehri', isRTL: true },
    { id: 4, title: isRTL ? 'استشاري أول هندي' : 'Indian Senior Consultant', actor: isRTL ? 'د. براديب كومار' : 'Dr. Pradeep Kumar', isRTL: false },
  ], [isRTL]);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: PALETTE.background, fontFamily: 'Cairo, sans-serif', direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <WhatsAppBanner stage={stage} lang={lang} />

      {/* Header & Controls */}
      <header className="pt-20 pb-6 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: PALETTE.primary }}>
            ALO DOCTOR v2.4 {isRTL ? 'النسخة السعودية' : 'Saudi Edition'}
          </h1>
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: PALETTE.secondary, color: PALETTE.white }}>
            {isRTL ? 'شخصية نشطة:' : 'Active Persona:'} {activePersona}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-4 py-2 text-sm font-bold rounded-lg border-2 transition-colors"
            style={{ borderColor: PALETTE.primary, color: PALETTE.primary, backgroundColor: PALETTE.white }}
            aria-label="Toggle Language"
          >
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>

          <button
            onClick={handleNextStage}
            disabled={stage === 6}
            className="px-6 py-2 text-sm font-bold rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            style={{ backgroundColor: PALETTE.primary }}
          >
            {labels.nextStage} ({stage}/6)
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-2 text-sm font-bold rounded-lg text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            style={{ backgroundColor: '#E53E3E' }}
            aria-label={labels.freshRun}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {labels.freshRun}
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="w-full max-w-6xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2" style={{ backgroundColor: PALETTE.border }} />
          <div
            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ backgroundColor: PALETTE.secondary, width: `${((stage - 1) / 5) * 100}%` }}
          />
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                s <= stage ? 'scale-110' : 'scale-100'
              }`}
              style={{
                backgroundColor: s <= stage ? PALETTE.primary : PALETTE.white,
                borderColor: s <= stage ? PALETTE.primary : PALETTE.border,
                color: s <= stage ? PALETTE.white : PALETTE.textMuted,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* 5-Device Cockpit Grid */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-start">
          {devices.map((device) => (
            <DeviceFrame
              key={device.id}
              title={device.title}
              actor={device.actor}
              isActive={activeDevice === device.id}
              isRTL={device.isRTL}
              onClick={() => setActiveDevice(device.id)}
            >
              {/* Device 0: Patient Intake */}
              {device.id === 0 && (
                <div className="space-y-2">
                  <InputField
                    label={labels.patientName}
                    value={caseData.patientName}
                    onChange={(v) => updateField('patientName', v)}
                    disabled={stage > 1}
                    isRTL={device.isRTL}
                  />
                  <InputField
                    label={labels.maskedId}
                    value={caseData.maskedId}
                    onChange={(v) => updateField('maskedId', v)}
                    disabled={stage > 1}
                    isRTL={device.isRTL}
                  />
                  <InputField
                    label={labels.specialty}
                    value={caseData.specialty}
                    onChange={(v) => updateField('specialty', v)}
                    disabled={stage > 1}
                    isRTL={device.isRTL}
                  />
                  <TextAreaField
                    label={labels.symptoms}
                    value={caseData.symptoms}
                    onChange={(v) => updateField('symptoms', v)}
                    disabled={stage > 1}
                    isRTL={device.isRTL}
                  />
                </div>
              )}

              {/* Device 1: Alo Nurse Triage */}
              {device.id === 1 && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: PALETTE.background }}>
                    <p className="text-xs font-bold mb-2" style={{ color: PALETTE.primary }}>{isRTL ? 'بيانات واردة من المريض' : 'Inherited from Patient'}</p>
                    <InputField label={labels.patientName} value={caseData.patientName} onChange={() => {}} disabled isRTL={device.isRTL} />
                    <InputField label={labels.maskedId} value={caseData.maskedId} onChange={() => {}} disabled isRTL={device.isRTL} />
                    <InputField label={labels.specialty} value={caseData.specialty} onChange={() => {}} disabled isRTL={device.isRTL} />
                    <TextAreaField label={labels.symptoms} value={caseData.symptoms} onChange={() => {}} disabled isRTL={device.isRTL} />
                  </div>
                  <div className="text-xs font-bold p-3 rounded-lg border" style={{ borderColor: PALETTE.secondary, color: PALETTE.primary }}>
                    {isRTL ? 'حالة الفرز: مكتملة. تم التحقق من العلامات الحيوية.' : 'Triage Status: Completed. Vitals verified.'}
                  </div>
                </div>
              )}

              {/* Device 2: Saudi Treating Doctor */}
              {device.id === 2 && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: PALETTE.background }}>
                    <p className="text-xs font-bold mb-2" style={{ color: PALETTE.primary }}>{isRTL ? 'ملخص الممرضة' : 'Nurse Summary'}</p>
                    <p className="text-xs mb-1"><strong>{labels.patientName}:</strong> {caseData.patientName || '-'}</p>
                    <p className="text-xs mb-1"><strong>{labels.maskedId}:</strong> {caseData.maskedId || '-'}</p>
                    <p className="text-xs mb-1"><strong>{labels.specialty}:</strong> {caseData.specialty || '-'}</p>
                    <p className="text-xs"><strong>{labels.symptoms}:</strong> {caseData.symptoms || '-'}</p>
                  </div>
                  
                  <div className="border-t pt-4 mt-4" style={{ borderColor: PALETTE.border }}>
                    <p className="text-xs font-bold mb-3" style={{ color: PALETTE.primary }}>
                      {isRTL ? 'أسئلة التركيز للاستشاري الهندي (D07-D09)' : 'Focus Questions for Indian Consultant (D07-D09)'}
                    </p>
                    {[0, 1, 2].map((idx) => (
                      <TextAreaField
                        key={idx}
                        label={`${labels.focusQ} ${idx + 1} (D0${idx + 7})`}
                        value={caseData.focusQuestions[idx]}
                        onChange={(v) => updateArrayField('focusQuestions', idx, v)}
                        disabled={stage > 3}
                        isRTL={device.isRTL}
                        rows={2}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Device 3: Alo Coordinator */}
              {device.id === 3 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: PALETTE.background }}>
                    <p className="text-xs font-bold mb-2" style={{ color: PALETTE.primary }}>{isRTL ? 'تفاصيل الحالة للمتابعة' : 'Case Details for Follow-up'}</p>
                    <p className="text-xs mb-1"><strong>{labels.patientName}:</strong> {caseData.patientName || '-'}</p>
                    <p className="text-xs mb-1"><strong>{labels.maskedId}:</strong> {caseData.maskedId || '-'}</p>
                    <p className="text-xs mb-1"><strong>{labels.specialty}:</strong> {caseData.specialty || '-'}</p>
                  </div>

                  <div className="p-4 rounded-xl border-2 text-center" style={{ borderColor: stage >= 4 ? PALETTE.whatsapp : PALETTE.border }}>
                    <p className="text-sm font-bold mb-2" style={{ color: PALETTE.textDark }}>
                      {isRTL ? 'حالة الدفع (مدى)' : 'Payment Status (Mada)'}
                    </p>
                    <span
                      className="inline-block px-4 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: stage >= 4 ? PALETTE.whatsapp : PALETTE.textMuted }}
                    >
                      {stage >= 4 ? (isRTL ? 'تم دفع 250 ريال' : '250 SAR Paid') : (isRTL ? 'في الانتظار' : 'Pending')}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border" style={{ borderColor: PALETTE.secondary }}>
                    <p className="text-xs font-bold" style={{ color: PALETTE.primary }}>
                      {isRTL ? 'تم الإرسال إلى د. براديب كومار' : 'Dispatched to Dr. Pradeep Kumar'}
                    </p>
                  </div>
                </div>
              )}

              {/* Device 4: Indian Senior Consultant */}
              {device.id === 4 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: PALETTE.background }}>
                    <p className="text-xs font-bold mb-2" style={{ color: PALETTE.primary }}>
                      {isRTL ? 'ملف المريض الوارد (K01-K03)' : 'Incoming Patient File (K01-K03)'}
                    </p>
                    <p className="text-xs mb-1"><strong>{labels.patientName}:</strong> {caseData.patientName || '-'}</p>
                    <p className="text-xs mb-1"><strong>{labels.maskedId}:</strong> {caseData.maskedId || '-'}</p>
                    <p className="text-xs mb-1"><strong>{labels.specialty}:</strong> {caseData.specialty || '-'}</p>
                    <p className="text-xs mt-2"><strong>{labels.symptoms}:</strong> {caseData.symptoms || '-'}</p>
                  </div>

                  <div className="border-t pt-4 mt-4" style={{ borderColor: PALETTE.border }}>
                    <p className="text-xs font-bold mb-3" style={{ color: PALETTE.primary }}>
                      {isRTL ? 'أسئلة الطبيب المعالج السعودي (K04-K06)' : 'Saudi Treating Doctor Questions (K04-K06)'}
                    </p>
                    {caseData.focusQuestions.map((q, idx) => (
                      <div key={idx} className="mb-4 p-3 rounded-lg border" style={{ borderColor: PALETTE.border, backgroundColor: '#FAFAFA' }}>
                        <p className="text-xs font-bold mb-2" style={{ color: PALETTE.textDark }}>
                          Q{idx + 1}: {q || (isRTL ? 'لم يتم طرح سؤال بعد' : 'No question asked yet')}
                        </p>
                        <TextAreaField
                          label={`${labels.verdict} ${idx + 1}`}
                          value={caseData.consultantVerdicts[idx]}
                          onChange={(v) => updateArrayField('consultantVerdicts', idx, v)}
                          disabled={stage > 5}
                          isRTL={device.isRTL}
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DeviceFrame>
          ))}
        </div>
      </main>

      {/* Footer Governance */}
      <footer
        className="w-full py-4 px-6 text-center border-t"
        style={{ backgroundColor: PALETTE.white, borderColor: PALETTE.border, fontFamily: 'Cairo, sans-serif' }}
      >
        <p className="text-xs font-bold" style={{ color: PALETTE.textMuted }}>
          {labels.author}
        </p>
        <p className="text-[10px] mt-1" style={{ color: PALETTE.border }}>
          ALO DOCTOR v2.4 Saudi Edition • Zero Artificial Gates • Accessible State Management
        </p>
      </footer>
    </div>
  );
};

export default FiveDeviceCockpitView;
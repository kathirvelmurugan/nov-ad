import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ClinicalStage {
  id: string;
  titleEn: string;
  titleAr: string;
  narrationEn: string;
  narrationAr: string;
  roleEn: string;
  roleAr: string;
  taskEn: string;
  taskAr: string;
}

const CLINICAL_STAGES: ClinicalStage[] = [
  {
    id: 'triage',
    titleEn: 'Patient Triage & Intake',
    titleAr: 'فرز المرضى والاستقبال',
    narrationEn: 'The system automatically categorizes incoming patients based on acuity and chief complaint.',
    narrationAr: 'يقوم النظام تلقائياً بتصنيف المرضى الوافدين بناءً على شدة الحالة والشكوى الرئيسية.',
    roleEn: 'Triage Nurse',
    roleAr: 'ممرض الفرز',
    taskEn: 'Vital signs recording and initial assessment',
    taskAr: 'تسجيل العلامات الحيوية والتقييم الأولي'
  },
  {
    id: 'history',
    titleEn: 'Clinical History Taking',
    titleAr: 'أخذ التاريخ المرضي',
    narrationEn: 'AI-assisted history taking captures comprehensive patient background seamlessly.',
    narrationAr: 'يساعد الذكاء الاصطناعي في أخذ التاريخ المرضي الشامل للمريض بسلاسة.',
    roleEn: 'General Practitioner',
    roleAr: 'طبيب عام',
    taskEn: 'Reviewing past medical history and allergies',
    taskAr: 'مراجعة التاريخ الطبي السابق والحساسية'
  },
  {
    id: 'examination',
    titleEn: 'Physical Examination',
    titleAr: 'الفحص السريري',
    narrationEn: 'Structured digital examination forms guide the physician through systematic checks.',
    narrationAr: 'نماذج الفحص الرقمية المنظمة توجه الطبيب خلال الفحوصات المنهجية.',
    roleEn: 'Physician',
    roleAr: 'الطبيب المعالج',
    taskEn: 'Documenting physical findings and vitals',
    taskAr: 'توثيق النتائج البدنية والعلامات الحيوية'
  },
  {
    id: 'diagnostics',
    titleEn: 'Diagnostics & Labs',
    titleAr: 'التشخيص والمختبرات',
    narrationEn: 'Orders are routed instantly to integrated laboratory and radiology systems.',
    narrationAr: 'يتم توجيه الطلبات فوراً إلى أنظمة المختبرات والأشعة المتكاملة.',
    roleEn: 'Lab Technician',
    roleAr: 'فني المختبر',
    taskEn: 'Processing blood work and imaging requests',
    taskAr: 'معالجة تحاليل الدم وطلبات التصوير'
  },
  {
    id: 'diagnosis',
    titleEn: 'Diagnosis & Decision Support',
    titleAr: 'التشخيص ودعم القرار',
    narrationEn: 'Clinical decision support highlights potential diagnoses based on gathered evidence.',
    narrationAr: 'يسلط نظام دعم القرار السريري الضوء على التشخيصات المحتملة بناءً على الأدلة المجمعة.',
    roleEn: 'Specialist',
    roleAr: 'الأخصائي',
    taskEn: 'Confirming primary diagnosis via ICD-10 mapping',
    taskAr: 'تأكيد التشخيص الأساسي عبر ربط التصنيف الدولي للأمراض'
  },
  {
    id: 'treatment',
    titleEn: 'Treatment Planning',
    titleAr: 'خطة العلاج',
    narrationEn: 'Evidence-based treatment pathways are suggested tailored to Saudi clinical guidelines.',
    narrationAr: 'يتم اقتراح مسارات علاجية مبنية على الأدلة ومصممة وفقاً للإرشادات السريرية السعودية.',
    roleEn: 'Attending Physician',
    roleAr: 'الطبيب المعالج',
    taskEn: 'Drafting care plan and therapeutic interventions',
    taskAr: 'صياغة خطة الرعاية والتدخلات العلاجية'
  },
  {
    id: 'prescription',
    titleEn: 'E-Prescribing',
    titleAr: 'الوصفات الإلكترونية',
    narrationEn: 'Prescriptions are checked for interactions and sent directly to Wasfaty integration.',
    narrationAr: 'يتم فحص الوصفات الطبية للتفاعلات وإرسالها مباشرة إلى تكامل وصفاتي.',
    roleEn: 'Pharmacist',
    roleAr: 'الصيدلي',
    taskEn: 'Verifying dosage and dispensing medications',
    taskAr: 'التحقق من الجرعات وصرف الأدوية'
  },
  {
    id: 'referral',
    titleEn: 'Referrals & Care Coordination',
    titleAr: 'الإحالات وتنسيق الرعاية',
    narrationEn: 'Seamless electronic referrals ensure continuity of care across departments or facilities.',
    narrationAr: 'تضمن الإحالات الإلكترونية السلسة استمرارية الرعاية عبر الأقسام أو المرافق.',
    roleEn: 'Care Coordinator',
    roleAr: 'منسق الرعاية',
    taskEn: 'Scheduling specialist follow-ups',
    taskAr: 'جدولة مواعيد المتابعة مع الأخصائيين'
  },
  {
    id: 'discharge',
    titleEn: 'Discharge & Follow-up',
    titleAr: 'الخروج والمتابعة',
    narrationEn: 'Automated discharge summaries and WhatsApp follow-ups improve patient compliance.',
    narrationAr: 'ملخصات الخروج الآلية ومتابعات واتساب تحسن التزام المريض.',
    roleEn: 'Discharge Nurse',
    roleAr: 'ممرض الخروج',
    taskEn: 'Finalizing documentation and patient education',
    taskAr: 'إتمام التوثيق وتثقيف المريض'
  }
];

interface AutoDemoControllerProps {
  isActive: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
  currentPersona?: string;
  onStageChange?: (stageId: string) => void;
}

export const AutoDemoController: React.FC<AutoDemoControllerProps> = ({
  isActive,
  onClose,
  lang = 'en',
  currentPersona = 'admin',
  onStageChange
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const isRTL = lang === 'ar';
  const stage = CLINICAL_STAGES[currentStageIndex];

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    
    const STEP_MS = 50;
    const TOTAL_MS = 6000;
    let elapsed = 0;

    progressRef.current = setInterval(() => {
      elapsed += STEP_MS;
      setProgress((elapsed / TOTAL_MS) * 100);
      
      if (elapsed >= TOTAL_MS) {
        elapsed = 0;
        setProgress(0);
        setCurrentStageIndex(prev => {
          const next = (prev + 1) % CLINICAL_STAGES.length;
          if (onStageChange) onStageChange(CLINICAL_STAGES[next].id);
          return next;
        });
      }
    }, STEP_MS);
  }, [clearTimers, onStageChange]);

  useEffect(() => {
    if (isActive && !isPaused) {
      startTimers();
    } else {
      clearTimers();
    }
    return clearTimers;
  }, [isActive, isPaused, startTimers, clearTimers]);

  const handlePauseResume = () => setIsPaused(prev => !prev);

  const handleNextStage = () => {
    setCurrentStageIndex(prev => {
      const next = (prev + 1) % CLINICAL_STAGES.length;
      if (onStageChange) onStageChange(CLINICAL_STAGES[next].id);
      return next;
    });
    setProgress(0);
  };

  const handleExit = () => {
    clearTimers();
    setCurrentStageIndex(0);
    setProgress(0);
    setIsPaused(false);
    onClose();
  };

  if (!isActive) return null;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        fontFamily: "'Cairo', sans-serif",
        pointerEvents: 'none'
      }}
    >
      {/* Top Progress Bar */}
      <div style={{ height: '4px', backgroundColor: '#E6FAF7', width: '100%' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#00C6AE',
            transition: 'width 50ms linear'
          }}
        />
      </div>

      {/* Narration Banner */}
      <div
        style={{
          margin: '12px 16px',
          padding: '20px 24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 123, 110, 0.15)',
          border: '2px solid #007B6E',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#E6FAF7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#007B6E',
                fontWeight: 800,
                fontSize: '16px'
              }}
            >
              {currentStageIndex + 1}/{CLINICAL_STAGES.length}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 700,
                color: '#007B6E'
              }}
            >
              {isRTL ? stage.titleAr : stage.titleEn}
            </h2>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handlePauseResume}
              aria-label={isPaused ? 'Resume Tour' : 'Pause Tour'}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #007B6E',
                backgroundColor: isPaused ? '#007B6E' : '#ffffff',
                color: isPaused ? '#ffffff' : '#007B6E',
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              {isPaused ? (
                <>
                  <span>▶</span>
                  <span>{isRTL ? 'استئناف' : 'Resume'}</span>
                </>
              ) : (
                <>
                  <span>⏸</span>
                  <span>{isRTL ? 'إيقاف مؤقت' : 'Pause'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleNextStage}
              aria-label="Next Stage"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#00C6AE',
                color: '#ffffff',
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{isRTL ? 'التالي' : 'Next'}</span>
              <span>{isRTL ? '←' : '→'}</span>
            </button>

            <button
              onClick={handleExit}
              aria-label="Exit Tour"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #ef4444',
                backgroundColor: '#ffffff',
                color: '#ef4444',
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isRTL ? 'خروج' : 'Exit'}
            </button>
          </div>
        </div>

        {/* Meta Information Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#E6FAF7',
              borderRadius: '10px',
              borderRight: isRTL ? '4px solid #007B6E' : 'none',
              borderLeft: !isRTL ? '4px solid #007B6E' : 'none'
            }}
          >
            <div style={{ fontSize: '11px', color: '#007B6E', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              {isRTL ? 'الدور النشط' : 'Active Role'}
            </div>
            <div style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 600 }}>
              {isRTL ? stage.roleAr : stage.roleEn}
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#E6FAF7',
              borderRadius: '10px',
              borderRight: isRTL ? '4px solid #00C6AE' : 'none',
              borderLeft: !isRTL ? '4px solid #00C6AE' : 'none'
            }}
          >
            <div style={{ fontSize: '11px', color: '#007B6E', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              {isRTL ? 'المهمة السريرية' : 'Clinical Task'}
            </div>
            <div style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 600 }}>
              {isRTL ? stage.taskAr : stage.taskEn}
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '10px',
              borderRight: isRTL ? '4px solid #25D366' : 'none',
              borderLeft: !isRTL ? '4px solid #25D366' : 'none',
              gridColumn: '1 / -1'
            }}
          >
            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>🎙️</span>
              {isRTL ? 'السرد المباشر' : 'Live Narration'}
            </div>
            <p style={{ margin: 0, fontSize: '15px', color: '#1a1a1a', lineHeight: 1.6, fontWeight: 500 }}>
              {isRTL ? stage.narrationAr : stage.narrationEn}
            </p>
          </div>
        </div>

        {/* Persona Indicator */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
            {isRTL ? 'الملف الشخصي:' : 'Persona:'}
          </span>
          <span
            style={{
              fontSize: '12px',
              padding: '2px 10px',
              borderRadius: '999px',
              backgroundColor: '#007B6E',
              color: '#ffffff',
              fontWeight: 700
            }}
          >
            {currentPersona}
          </span>
        </div>
      </div>
    </div>
  );
};

export const AutoDemoTrigger: React.FC<{
  onStart: () => void;
  isActive: boolean;
  lang?: 'ar' | 'en';
}> = ({ onStart, isActive, lang = 'en' }) => {
  const isRTL = lang === 'ar';

  if (isActive) return null;

  return (
    <button
      onClick={onStart}
      aria-label={isRTL ? 'بدء الجولة التلقائية' : 'Start Auto-Demo Tour'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 20px',
        backgroundColor: '#007B6E',
        color: '#ffffff',
        border: 'none',
        borderRadius: '999px',
        fontFamily: "'Cairo', sans-serif",
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 123, 110, 0.3)',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#00C6AE';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#007B6E';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <span style={{ fontSize: '16px' }}>▶️</span>
      <span>{isRTL ? 'جولة تلقائية' : 'Auto-Demo'}</span>
    </button>
  );
};

interface AloDoctorAppProps {
  initialLang?: 'ar' | 'en';
  initialPersona?: string;
}

export const AloDoctorApp: React.FC<AloDoctorAppProps> = ({
  initialLang = 'en',
  initialPersona = 'physician'
}) => {
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [lang, setLang] = useState<'ar' | 'en'>(initialLang);
  const [persona, setPersona] = useState<string>(initialPersona);
  const [activeStageId, setActiveStageId] = useState<string>('');

  const isRTL = lang === 'ar';

  const personas = [
    'admin', 'physician', 'nurse', 'pharmacist', 'lab_tech', 
    'receptionist', 'patient', 'specialist', 'coordinator', 'manager', 'auditor'
  ];

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Cairo', sans-serif",
        transition: 'all 0.3s ease'
      }}
    >
      {/* Top Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#007B6E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '18px'
              }}
            >
              A
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', color: '#007B6E' }}>
              ALO DOCTOR
            </span>
            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, marginTop: '4px' }}>
              v2.4
            </span>
          </div>

          <AutoDemoTrigger
            onStart={() => setIsDemoActive(true)}
            isActive={isDemoActive}
            lang={lang}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Toggle */}
          <button
            onClick={() => setLang(prev => prev === 'en' ? 'ar' : 'en')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {lang === 'en' ? 'عربي' : 'English'}
          </button>

          {/* Persona Switcher */}
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {personas.map(p => (
              <option key={p} value={p}>
                {p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Auto Demo Controller Overlay */}
      <AutoDemoController
        isActive={isDemoActive}
        onClose={() => setIsDemoActive(false)}
        lang={lang}
        currentPersona={persona}
        onStageChange={setActiveStageId}
      />

      {/* Main Content Area */}
      <main
        style={{
          padding: isDemoActive ? '220px 24px 24px' : '24px',
          maxWidth: '1400px',
          margin: '0 auto',
          transition: 'padding 0.3s ease'
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}
        >
          <h1 style={{ color: '#007B6E', fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
            {isRTL ? 'مرحباً بك في ألو دكتور' : 'Welcome to ALO DOCTOR'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.7 }}>
            {isRTL
              ? 'النظام السريري المتكامل المصمم خصيصاً لقطاع الرعاية الصحية في المملكة العربية السعودية.'
              : 'The integrated clinical system purpose-built for the Saudi Arabian healthcare sector.'}
          </p>
          
          {isDemoActive && activeStageId && (
            <div
              style={{
                marginTop: '32px',
                padding: '24px',
                backgroundColor: '#E6FAF7',
                borderRadius: '12px',
                border: '2px dashed #00C6AE'
              }}
            >
              <p style={{ color: '#007B6E', fontWeight: 700, fontSize: '18px', margin: 0 }}>
                {isRTL ? `عرض المرحلة: ${activeStageId}` : `Demonstrating Stage: ${activeStageId}`}
              </p>
              <p style={{ color: '#374151', fontSize: '14px', marginTop: '8px' }}>
                {isRTL ? 'هذا المحتوى يتغير تلقائياً كل 6 ثوانٍ أثناء الجولة التوضيحية.' : 'This content updates automatically every 6 seconds during the guided tour.'}
              </p>
            </div>
          )}

          {!isDemoActive && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginTop: '32px',
                textAlign: isRTL ? 'right' : 'left'
              }}
            >
              {CLINICAL_STAGES.map((s, idx) => (
                <div
                  key={s.id}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#007B6E',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
                      {isRTL ? s.titleAr : s.titleEn}
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.6, paddingRight: isRTL ? 0 : '38px', paddingLeft: isRTL ? '38px' : 0 }}>
                    {isRTL ? s.taskAr : s.taskEn}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* WhatsApp Integration Badge */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          [isRTL ? 'left' : 'right']: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
          cursor: 'pointer',
          zIndex: 900,
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 900
        }}
        aria-label="WhatsApp Integration"
      >
        W
      </div>
    </div>
  );
};

export default AloDoctorApp;
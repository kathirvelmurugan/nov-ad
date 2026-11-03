import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Types & Interfaces ---
export type Language = 'ar' | 'en';
export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Persona {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  orgAr: string;
  orgEn: string;
  avatar: string;
  defaultLang: Language;
}

export interface StageDefinition {
  id: StageId;
  titleAr: string;
  titleEn: string;
  objectiveAr: string;
  objectiveEn: string;
  summaryAr: string;
  summaryEn: string;
}

export interface HandoffData {
  completedStage: StageDefinition;
  nextStage: StageDefinition;
  nextPersona: Persona;
}

interface StageHandoffModalProps {
  isOpen: boolean;
  handoffData: HandoffData | null;
  lang: Language;
  onContinue: () => void;
  countdownSeconds?: number;
}

// --- Constants & Data ---
const LANG_LOCK_KEY = 'alo_user_lang_lock';

export const PERSONAS: Persona[] = [
  { id: 'p1', nameAr: 'د. أحمد الطبي', nameEn: 'Dr. Ahmed', roleAr: 'طبيب عام', roleEn: 'General Practitioner', orgAr: 'مستشفى الملك فيصل', orgEn: 'King Faisal Hospital', avatar: '👨‍⚕️', defaultLang: 'ar' },
  { id: 'p2', nameAr: 'د. سارة', nameEn: 'Dr. Sarah', roleAr: 'أخصائية باطنية', roleEn: 'Internal Medicine', orgAr: 'مدينة الملك فهد الطبية', orgEn: 'King Fahad Medical City', avatar: '👩‍⚕️', defaultLang: 'ar' },
  { id: 'p3', nameAr: 'د. خالد', nameEn: 'Dr. Khalid', roleAr: 'جراح', roleEn: 'Surgeon', orgAr: 'مستشفى الحرس الوطني', orgEn: 'National Guard Hospital', avatar: '🧑‍⚕️', defaultLang: 'ar' },
  { id: 'p4', nameAr: 'د. نورة', nameEn: 'Dr. Nora', roleAr: 'طبيبة أطفال', roleEn: 'Pediatrician', orgAr: 'مستشفى الأطفال', orgEn: 'Children\'s Hospital', avatar: '👩‍⚕️', defaultLang: 'ar' },
  { id: 'p5', nameAr: 'د. فهد', nameEn: 'Dr. Fahad', roleAr: 'طبيب قلب', roleEn: 'Cardiologist', orgAr: 'مركز الأمير سلطان للقلب', orgEn: 'Prince Sultan Cardiac Center', avatar: '👨‍⚕️', defaultLang: 'ar' },
  { id: 'p6', nameAr: 'د. منى', nameEn: 'Dr. Mona', roleAr: 'أخصائية أشعة', roleEn: 'Radiologist', orgAr: 'مستشفى التخصصي', orgEn: 'Specialist Hospital', avatar: '👩‍⚕️', defaultLang: 'ar' },
  { id: 'p7', nameAr: 'د. عبدالله', nameEn: 'Dr. Abdullah', roleAr: 'طبيب طوارئ', roleEn: 'ER Physician', orgAr: 'مستشفى الملك سعود', orgEn: 'King Saud Hospital', avatar: '🧑‍⚕️', defaultLang: 'ar' },
  { id: 'p8', nameAr: 'د. ريم', nameEn: 'Dr. Reem', roleAr: 'طبيبة جلدية', roleEn: 'Dermatologist', orgAr: 'عيادات ألو دكتور', orgEn: 'Alo Doctor Clinics', avatar: '👩‍⚕️', defaultLang: 'ar' },
  { id: 'p9', nameAr: 'د. طارق', nameEn: 'Dr. Tariq', roleAr: 'طبيب أعصاب', roleEn: 'Neurologist', orgAr: 'مستشفى الملك عبدالعزيز', orgEn: 'King Abdulaziz Hospital', avatar: '👨‍⚕️', defaultLang: 'ar' },
  { id: 'p10', nameAr: 'د. هند', nameEn: 'Dr. Hind', roleAr: 'طبيبة عيون', roleEn: 'Ophthalmologist', orgAr: 'مستشفى مغربي', orgEn: 'Magrabi Hospital', avatar: '👩‍⚕️', defaultLang: 'ar' },
  { id: 'p11', nameAr: 'د. عمر', nameEn: 'Dr. Omar', roleAr: 'استشاري أورام', roleEn: 'Oncologist', orgAr: 'مركز الأورام الشامل', orgEn: 'Comprehensive Cancer Center', avatar: '🧑‍⚕️', defaultLang: 'ar' },
];

export const STAGES: Record<StageId, StageDefinition> = {
  1: { id: 1, titleAr: 'التقييم الأولي', titleEn: 'Initial Triage', objectiveAr: 'جمع الأعراض الأساسية وتحديد الأولوية', objectiveEn: 'Gather primary symptoms and determine urgency', summaryAr: 'تم جمع البيانات الأولية للمريض بنجاح.', summaryEn: 'Patient initial data successfully collected.' },
  2: { id: 2, titleAr: 'التاريخ المرضي', titleEn: 'History Taking', objectiveAr: 'توثيق التاريخ الطبي والعائلي', objectiveEn: 'Document medical and family history', summaryAr: 'اكتمل أخذ التاريخ المرضي الشامل.', summaryEn: 'Comprehensive history taking completed.' },
  3: { id: 3, titleAr: 'الفحص السريري', titleEn: 'Clinical Exam', objectiveAr: 'إجراء الفحص البدني الموجه', objectiveEn: 'Perform targeted physical examination', summaryAr: 'تم إجراء الفحص السريري وتسجيل العلامات الحيوية.', summaryEn: 'Clinical exam performed and vitals recorded.' },
  4: { id: 4, titleAr: 'التشخيص التفريقي', titleEn: 'Differential Diagnosis', objectiveAr: 'تحديد الاحتمالات التشخيصية', objectiveEn: 'Identify diagnostic possibilities', summaryAr: 'تم تحديد قائمة التشخيصات التفريقية.', summaryEn: 'Differential diagnosis list established.' },
  5: { id: 5, titleAr: 'الاستقصاءات', titleEn: 'Investigations', objectiveAr: 'طلب التحاليل والأشعة اللازمة', objectiveEn: 'Order necessary labs and imaging', summaryAr: 'تم طلب جميع الاستقصاءات المطلوبة.', summaryEn: 'All required investigations ordered.' },
  6: { id: 6, titleAr: 'تأكيد التشخيص', titleEn: 'Diagnosis Confirmation', objectiveAr: 'مراجعة النتائج وتأكيد التشخيص النهائي', objectiveEn: 'Review results and confirm final diagnosis', summaryAr: 'تم تأكيد التشخيص بناءً على النتائج.', summaryEn: 'Diagnosis confirmed based on results.' },
  7: { id: 7, titleAr: 'خطة العلاج', titleEn: 'Treatment Plan', objectiveAr: 'وضع الخطة العلاجية والدوائية', objectiveEn: 'Develop therapeutic and pharmacological plan', summaryAr: 'تم إعداد خطة العلاج الشاملة.', summaryEn: 'Comprehensive treatment plan prepared.' },
  8: { id: 8, titleAr: 'التثقيف الصحي', titleEn: 'Patient Education', objectiveAr: 'شرح الحالة وخطة العلاج للمريض', objectiveEn: 'Explain condition and plan to patient', summaryAr: 'تم تثقيف المريض وتقديم الإرشادات.', summaryEn: 'Patient educated and instructions provided.' },
  9: { id: 9, titleAr: 'المتابعة والإغلاق', titleEn: 'Follow-up & Closure', objectiveAr: 'جدولة المتابعة وإغلاق الملف الحالي', objectiveEn: 'Schedule follow-up and close current file', summaryAr: 'تم إغلاق المرحلة السريرية وجدولة المتابعة.', summaryEn: 'Clinical stage closed and follow-up scheduled.' },
};

// --- Styles (CSS-in-JS for Pinterest-Teal Palette) ---
const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 123, 110, 0.15)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
    fontFamily: "'Cairo', sans-serif",
  },
  modal: (dir: 'rtl' | 'ltr') => ({
    backgroundColor: '#E6FAF7',
    borderRadius: '24px',
    maxWidth: '560px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 123, 110, 0.1), 0 10px 10px -5px rgba(0, 123, 110, 0.04)',
    border: '1px solid #00C6AE',
    overflow: 'hidden',
    direction: dir,
    textAlign: dir === 'rtl' ? 'right' as const : 'left' as const,
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  }),
  header: {
    backgroundColor: '#007B6E',
    color: '#FFFFFF',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  body: {
    padding: '2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '1.25rem',
    border: '1px solid rgba(0, 198, 174, 0.2)',
  },
  badge: (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: color,
    backgroundColor: `${color}15`,
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    marginBottom: '0.75rem',
  }),
  personaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '0.75rem',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#E6FAF7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    border: '2px solid #00C6AE',
  },
  footer: {
    padding: '1.5rem',
    borderTop: '1px solid rgba(0, 198, 174, 0.2)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: '#25D366',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    padding: '0.875rem 2rem',
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(37, 211, 102, 0.2)',
  },
  h3: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#007B6E',
  },
  p: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    color: '#334155',
  },
  small: {
    fontSize: '0.85rem',
    color: '#64748B',
    margin: '0.25rem 0 0 0',
  }
};

// --- StageHandoffModal Component ---
export const StageHandoffModal: React.FC<StageHandoffModalProps> = ({
  isOpen,
  handoffData,
  lang,
  onContinue,
  countdownSeconds = 5
}) => {
  const [countdown, setCountdown] = useState<number>(countdownSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownSeconds);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            onContinue();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, countdownSeconds, onContinue]);

  if (!isOpen || !handoffData) return null;

  const { completedStage, nextStage, nextPersona } = handoffData;

  const handleManualContinue = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onContinue();
  };

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="handoff-title">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        button:hover { filter: brightness(1.05); transform: translateY(-1px); }
        button:active { transform: translateY(0); }
      `}</style>
      
      <div style={styles.modal(dir)}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ fontSize: '1.5rem' }}>🔄</div>
          <div>
            <h2 id="handoff-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              {isAr ? 'تسليم المرحلة السريرية' : 'Clinical Stage Handoff'}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
              {isAr ? 'نقل آمن لملف المريض' : 'Secure patient file transfer'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          
          {/* Completed Stage */}
          <div style={styles.card}>
            <div style={styles.badge('#007B6E')}>
              <span>✅</span>
              <span>{isAr ? 'المرحلة المكتملة' : 'Completed Stage'}</span>
            </div>
            <h3 style={styles.h3}>
              {isAr ? completedStage.titleAr : completedStage.titleEn}
            </h3>
            <p style={styles.p}>
              {isAr ? completedStage.summaryAr : completedStage.summaryEn}
            </p>
          </div>

          {/* Handoff Target */}
          <div style={styles.card}>
            <div style={styles.badge('#00C6AE')}>
              <span>➡️</span>
              <span>{isAr ? 'التسليم إلى' : 'Handing off to'}</span>
            </div>
            <div style={styles.personaRow}>
              <div style={styles.avatar}>{nextPersona.avatar}</div>
              <div>
                <h3 style={{ ...styles.h3, fontSize: '1rem' }}>
                  {isAr ? nextPersona.nameAr : nextPersona.nameEn}
                </h3>
                <p style={{ ...styles.small, margin: 0 }}>
                  {isAr ? nextPersona.roleAr : nextPersona.roleEn} • {isAr ? nextPersona.orgAr : nextPersona.orgEn}
                </p>
              </div>
            </div>
          </div>

          {/* Next Objective */}
          <div style={styles.card}>
            <div style={styles.badge('#25D366')}>
              <span>🎯</span>
              <span>{isAr ? 'الهدف السريري القادم' : 'Next Clinical Objective'}</span>
            </div>
            <h3 style={styles.h3}>
              {isAr ? nextStage.titleAr : nextStage.titleEn}
            </h3>
            <p style={styles.p}>
              {isAr ? nextStage.objectiveAr : nextStage.objectiveEn}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button 
            onClick={handleManualContinue}
            style={styles.button}
            aria-label={isAr ? 'متابعة' : 'Continue'}
          >
            <span>{isAr ? 'متابعة' : 'Continue'}</span>
            <span style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '6px', 
              padding: '0.125rem 0.5rem',
              fontSize: '0.85rem',
              minWidth: '24px',
              textAlign: 'center'
            }}>
              {countdown}
            </span>
            <span>{isAr ? '←' : '→'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- App.tsx (Core Logic Integration) ---

export const App: React.FC = () => {
  // Initialize language respecting the explicit lock first
  const getInitialLang = (): Language => {
    const lockedLang = localStorage.getItem(LANG_LOCK_KEY) as Language | null;
    if (lockedLang && (lockedLang === 'ar' || lockedLang === 'en')) {
      return lockedLang;
    }
    return 'ar'; // Default fallback
  };

  const [lang, setLang] = useState<Language>(getInitialLang);
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState<number>(0);
  const [currentStageId, setCurrentStageId] = useState<StageId>(1);
  const [isHandoffOpen, setIsHandoffOpen] = useState<boolean>(false);
  const [handoffData, setHandoffData] = useState<HandoffData | null>(null);

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  // Refactored handleSelectPersona: Respects user explicit lock over persona default
  const handleSelectPersona = useCallback((personaId: string) => {
    const index = PERSONAS.findIndex(p => p.id === personaId);
    if (index === -1) return;
    
    setCurrentPersonaIndex(index);
    
    const lockedLang = localStorage.getItem(LANG_LOCK_KEY) as Language | null;
    
    // ONLY change language if there is NO explicit user lock
    if (!lockedLang) {
      const newLang = PERSONAS[index].defaultLang;
      setLang(newLang);
    }
    // If lockedLang exists, we do absolutely nothing to the lang state.
    // This prevents language flapping when switching between Saudi personas.
  }, []);

  // Explicit Language Toggle with Lock
  const handleLanguageToggle = useCallback((newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(LANG_LOCK_KEY, newLang);
  }, []);

  // Clear Language Lock (Utility)
  const handleClearLanguageLock = useCallback(() => {
    localStorage.removeItem(LANG_LOCK_KEY);
    // Optionally revert to current persona's default
    setLang(PERSONAS[currentPersonaIndex].defaultLang);
  }, [currentPersonaIndex]);

  // Stage Advancement Logic
  const handleAdvanceStage = useCallback(() => {
    if (currentStageId >= 9) {
      // End of workflow
      return;
    }

    const completed = STAGES[currentStageId];
    const nextId = (currentStageId + 1) as StageId;
    const next = STAGES[nextId];
    
    // Determine next persona (simple rotation for demonstration, maps to 11 personas)
    const nextPersonaIdx = (currentPersonaIndex + 1) % PERSONAS.length;
    const nextPersona = PERSONAS[nextPersonaIdx];

    setHandoffData({
      completedStage: completed,
      nextStage: next,
      nextPersona: nextPersona,
    });
    setIsHandoffOpen(true);
  }, [currentStageId, currentPersonaIndex]);

  const handleHandoffContinue = useCallback(() => {
    setIsHandoffOpen(false);
    if (currentStageId < 9) {
      setCurrentStageId((currentStageId + 1) as StageId);
      // Advance persona as well if part of the handoff flow
      const nextPersonaIdx = (currentPersonaIndex + 1) % PERSONAS.length;
      setCurrentPersonaIndex(nextPersonaIdx);
    }
    setHandoffData(null);
  }, [currentStageId, currentPersonaIndex]);

  const currentPersona = PERSONAS[currentPersonaIndex];
  const currentStage = STAGES[currentStageId];
  const isLocked = !!localStorage.getItem(LANG_LOCK_KEY);

  return (
    <div 
      dir={dir} 
      style={{ 
        fontFamily: "'Cairo', sans-serif", 
        minHeight: '100vh', 
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        direction: dir,
        padding: '2rem',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header / Controls */}
      <header style={{ 
        maxWidth: '1200px', 
        margin: '0 auto 2rem auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            backgroundColor: '#007B6E', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800
          }}>
            A
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#007B6E', fontWeight: 800 }}>
            {isAr ? 'ألو دكتور' : 'ALO DOCTOR'} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748B' }}>v2.4</span>
          </h1>
        </div>

        {/* Language Preference Lock Control */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          backgroundColor: '#E6FAF7',
          padding: '0.5rem',
          borderRadius: '12px',
          border: '1px solid #00C6AE'
        }}>
          <button
            onClick={() => handleLanguageToggle('en')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: lang === 'en' ? '#007B6E' : 'transparent',
              color: lang === 'en' ? '#FFFFFF' : '#007B6E',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              transition: 'all 0.2s'
            }}
            aria-pressed={lang === 'en'}
          >
            English
          </button>
          <button
            onClick={() => handleLanguageToggle('ar')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: lang === 'ar' ? '#007B6E' : 'transparent',
              color: lang === 'ar' ? '#FFFFFF' : '#007B6E',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              transition: 'all 0.2s'
            }}
            aria-pressed={lang === 'ar'}
          >
            العربية
          </button>
          {isLocked && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: '#007B6E',
              fontWeight: 700,
              padding: isAr ? '0 0.5rem 0 0' : '0 0 0 0.5rem'
            }} title={isAr ? 'اللغة مقفلة بواسطة المستخدم' : 'Language locked by user'}>
              🔒
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Persona Switcher Grid (11 Personas) */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#0F172A' }}>
            {isAr ? 'اختر الشخصية السريرية (١١)' : 'Select Clinical Persona (11)'}
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '1rem' 
          }}>
            {PERSONAS.map((p) => {
              const isActive = p.id === currentPersona.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p.id)}
                  style={{
                    backgroundColor: isActive ? '#E6FAF7' : '#FFFFFF',
                    border: `2px solid ${isActive ? '#007B6E' : '#E2E8F0'}`,
                    borderRadius: '16px',
                    padding: '1.25rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    fontFamily: "'Cairo', sans-serif",
                    boxShadow: isActive ? '0 4px 6px -1px rgba(0, 123, 110, 0.1)' : 'none'
                  }}
                  aria-pressed={isActive}
                >
                  <div style={{ 
                    fontSize: '2.5rem',
                    filter: isActive ? 'none' : 'grayscale(0.5)',
                    transition: 'filter 0.2s'
                  }}>
                    {p.avatar}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: '0.95rem', 
                      color: isActive ? '#007B6E' : '#334155' 
                    }}>
                      {isAr ? p.nameAr : p.nameEn}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748B',
                      marginTop: '0.25rem'
                    }}>
                      {isAr ? p.roleAr : p.roleEn}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Clinical Stage View */}
        <section style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '24px', 
          padding: '2.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#E6FAF7',
                color: '#007B6E',
                padding: '0.375rem 1rem',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1rem'
              }}>
                {isAr ? `المرحلة ${currentStageId} من ٩` : `Stage ${currentStageId} of 9`}
              </div>
              <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
                {isAr ? currentStage.titleAr : currentStage.titleEn}
              </h2>
              <p style={{ margin: '0.75rem 0 0 0', fontSize: '1.05rem', color: '#475569', maxWidth: '600px', lineHeight: 1.7 }}>
                <strong style={{ color: '#007B6E' }}>{isAr ? 'الهدف: ' : 'Objective: '}</strong>
                {isAr ? currentStage.objectiveAr : currentStage.objectiveEn}
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              backgroundColor: '#F8FAFC',
              padding: '1rem',
              borderRadius: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '2rem' }}>{currentPersona.avatar}</div>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>
                  {isAr ? currentPersona.nameAr : currentPersona.nameEn}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {isAr ? currentPersona.orgAr : currentPersona.orgEn}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ 
            height: '8px', 
            backgroundColor: '#E6FAF7', 
            borderRadius: '999px', 
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              height: '100%', 
              width: `${(currentStageId / 9) * 100}%`, 
              backgroundColor: '#00C6AE',
              borderRadius: '999px',
              transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>

          {/* Action Area */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleAdvanceStage}
              disabled={currentStageId >= 9}
              style={{
                backgroundColor: currentStageId >= 9 ? '#CBD5E1' : '#007B6E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: "'Cairo', sans-serif",
                cursor: currentStageId >= 9 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: currentStageId < 9 ? '0 4px 6px -1px rgba(0, 123, 110, 0.2)' : 'none'
              }}
            >
              <span>{isAr ? 'إنهاء المرحلة وتسليم الملف' : 'Complete Stage & Handoff'}</span>
              <span>{isAr ? '←' : '→'}</span>
            </button>
          </div>
        </section>

        {/* Debug/Info Note for Reviewers */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#FEF3C7', 
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: '#92400E',
          border: '1px solid #FDE68A'
        }}>
          <strong>System Note:</strong> Language preference is currently {isLocked ? 'LOCKED' : 'UNLOCKED'} in localStorage under key <code>{LANG_LOCK_KEY}</code>. 
          Switching personas will {isLocked ? 'NOT' : ''} affect the UI language. 
          Current Lang: <strong>{lang.toUpperCase()}</strong> | Direction: <strong>{dir.toUpperCase()}</strong>
        </div>

      </main>

      {/* Interstitial Modal Rendering */}
      <StageHandoffModal
        isOpen={isHandoffOpen}
        handoffData={handoffData}
        lang={lang}
        onContinue={handleHandoffContinue}
        countdownSeconds={5}
      />
    </div>
  );
};

export default App;
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface UserSession {
  id: string;
  nameAr: string;
  nameEn: string;
  role: string;
  personaId: number;
  lang: 'ar' | 'en';
  dir: 'rtl' | 'ltr';
}

export interface ClinicalCase {
  id: string;
  patientName: string;
  status: string;
  lastUpdated: number;
}

export interface WorkflowUIState {
  cases: ClinicalCase[];
  activeCaseId: string;
  userSession: UserSession | null;
  isWiping: boolean;
  handleLogout: () => Promise<void>;
  setCases: React.Dispatch<React.SetStateAction<ClinicalCase[]>>;
  setActiveCaseId: React.Dispatch<React.SetStateAction<string>>;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
}

const SESSION_KEYS_TO_WIPE = [
  'alo_user_session_v3.0',
  'alo_active_case_id_v3.0',
  'alo_patient_subview_v3.0',
  'alo_clinical_cases_v3.0'
] as const;

const DRAFT_INTAKE_PREFIX = 'alo_draft_intake_';

const wipeLocalStorageAtomically = (): void => {
  try {
    const keysToRemove: string[] = [...SESSION_KEYS_TO_WIPE];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_INTAKE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  } catch (error) {
    console.error('[ALO DOCTOR v2.4] Critical failure during workspace cache wipe:', error);
  }
};

export const useWorkflowUIState = (): WorkflowUIState => {
  const navigate = useNavigate();

  const [cases, setCases] = useState<ClinicalCase[]>(() => {
    try {
      const cached = localStorage.getItem('alo_clinical_cases_v3.0');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    try {
      return localStorage.getItem('alo_active_case_id_v3.0') || '';
    } catch {
      return '';
    }
  });

  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const cached = localStorage.getItem('alo_user_session_v3.0');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isWiping, setIsWiping] = useState<boolean>(false);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'alo_user_session_v3.0' && e.newValue === null) {
        setCases([]);
        setActiveCaseId('');
        setUserSession(null);
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleLogout = useCallback(async (): Promise<void> => {
    if (isWiping) return;
    setIsWiping(true);

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });

      wipeLocalStorageAtomically();

      setCases([]);
      setActiveCaseId('');
      setUserSession(null);

      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.style.fontFamily = "'Cairo', sans-serif";

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('[ALO DOCTOR v2.4] Logout sequence interrupted:', error);
    } finally {
      setIsWiping(false);
    }
  }, [isWiping, navigate]);

  return {
    cases,
    activeCaseId,
    userSession,
    isWiping,
    handleLogout,
    setCases,
    setActiveCaseId,
    setUserSession
  };
};

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWorkflowUIState } from './hooks/workflow/useWorkflowUIState';

const ALO_THEME = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  textDark: '#1A3C38',
  textLight: '#FFFFFF'
} as const;

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    font-family: 'Cairo', sans-serif;
    background-color: ${ALO_THEME.background};
    color: ${ALO_THEME.textDark};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  [dir="rtl"] {
    text-align: right;
    direction: rtl;
  }

  [dir="ltr"] {
    text-align: left;
    direction: ltr;
  }

  .alo-btn-logout {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background-color: ${ALO_THEME.primary};
    color: ${ALO_THEME.textLight};
    border: none;
    border-radius: 8px;
    font-family: 'Cairo', sans-serif;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    min-height: 48px;
    min-width: 48px;
  }

  .alo-btn-logout:hover:not(:disabled) {
    background-color: ${ALO_THEME.secondary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 110, 0.2);
  }

  .alo-btn-logout:focus-visible {
    outline: 3px solid ${ALO_THEME.secondary};
    outline-offset: 2px;
  }

  .alo-btn-logout:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .alo-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background-color: ${ALO_THEME.textLight};
    border-bottom: 2px solid ${ALO_THEME.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .alo-logo {
    font-size: 24px;
    font-weight: 700;
    color: ${ALO_THEME.primary};
    letter-spacing: -0.5px;
  }

  .alo-persona-switcher {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .alo-persona-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid ${ALO_THEME.background};
    background-color: ${ALO_THEME.secondary};
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 700;
  }

  .alo-persona-dot.active {
    border-color: ${ALO_THEME.primary};
    transform: scale(1.15);
    box-shadow: 0 0 0 3px ${ALO_THEME.background};
  }

  .alo-login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
  }

  .alo-login-card {
    background: ${ALO_THEME.textLight};
    padding: 48px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 123, 110, 0.08);
    max-width: 420px;
    width: 100%;
    text-align: center;
  }

  .alo-workspace {
    padding: 32px 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .alo-case-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-top: 24px;
  }

  .alo-case-card {
    background: ${ALO_THEME.textLight};
    padding: 20px;
    border-radius: 12px;
    border-right: 4px solid ${ALO_THEME.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  [dir="ltr"] .alo-case-card {
    border-right: none;
    border-left: 4px solid ${ALO_THEME.primary};
  }
`;

interface PersonaProfile {
  id: number;
  labelAr: string;
  labelEn: string;
  icon: string;
}

const PERSONA_PROFILES: PersonaProfile[] = [
  { id: 1, labelAr: 'طبيب عام', labelEn: 'General Physician', icon: 'GP' },
  { id: 2, labelAr: 'ممرض', labelEn: 'Nurse', icon: 'RN' },
  { id: 3, labelAr: 'صيدلي', labelEn: 'Pharmacist', icon: 'PH' },
  { id: 4, labelAr: 'أخصائي مختبر', labelEn: 'Lab Tech', icon: 'LT' },
  { id: 5, labelAr: 'إداري', labelEn: 'Admin', icon: 'AD' },
  { id: 6, labelAr: 'طوارئ', labelEn: 'Emergency', icon: 'ER' },
  { id: 7, labelAr: 'أشعة', labelEn: 'Radiology', icon: 'RD' },
  { id: 8, labelAr: 'جراح', labelEn: 'Surgeon', icon: 'SG' },
  { id: 9, labelAr: 'استشاري', labelEn: 'Consultant', icon: 'CS' },
  { id: 10, labelAr: 'تغذية', labelEn: 'Nutrition', icon: 'NT' },
  { id: 11, labelAr: 'علاج طبيعي', labelEn: 'Physiotherapy', icon: 'PT' }
];

const StyleInjector: React.FC = () => {
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-alo-doctor', 'v2.4-saudi');
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  return null;
};

const PersonaSwitcher: React.FC<{
  activePersonaId: number;
  onSwitch: (id: number) => void;
  lang: 'ar' | 'en';
}> = ({ activePersonaId, onSwitch, lang }) => {
  return (
    <div className="alo-persona-switcher" role="radiogroup" aria-label={lang === 'ar' ? 'تبديل الملف الشخصي' : 'Switch Persona Profile'}>
      {PERSONA_PROFILES.map((persona) => (
        <button
          key={persona.id}
          type="button"
          role="radio"
          aria-checked={activePersonaId === persona.id}
          aria-label={lang === 'ar' ? persona.labelAr : persona.labelEn}
          title={lang === 'ar' ? persona.labelAr : persona.labelEn}
          className={`alo-persona-dot ${activePersonaId === persona.id ? 'active' : ''}`}
          onClick={() => onSwitch(persona.id)}
        >
          {persona.icon}
        </button>
      ))}
    </div>
  );
};

const LoginView: React.FC = () => {
  const lang = document.documentElement.getAttribute('lang') as 'ar' | 'en' || 'ar';
  
  return (
    <div className="alo-login-container">
      <div className="alo-login-card">
        <h1 className="alo-logo" style={{ marginBottom: '24px' }}>
          ALO DOCTOR
        </h1>
        <p style={{ marginBottom: '32px', color: ALO_THEME.primary, fontSize: '18px', fontWeight: 600 }}>
          {lang === 'ar' ? 'محطة العمل السريرية المشتركة' : 'Shared Clinical Workstation'}
        </p>
        <p style={{ marginBottom: '24px', fontSize: '14px', opacity: 0.8 }}>
          {lang === 'ar' 
            ? 'تم مسح بيانات الجلسة السابقة بنجاح. يرجى تسجيل الدخول للمتابعة.' 
            : 'Previous session data successfully wiped. Please log in to continue.'}
        </p>
        <button
          type="button"
          className="alo-btn-logout"
          style={{ width: '100%', backgroundColor: ALO_THEME.whatsapp }}
          onClick={() => window.location.reload()}
          aria-label={lang === 'ar' ? 'تسجيل الدخول' : 'Log In'}
        >
          {lang === 'ar' ? 'تسجيل الدخول' : 'Log In'}
        </button>
      </div>
    </div>
  );
};

const WorkspaceView: React.FC = () => {
  const {
    cases,
    activeCaseId,
    userSession,
    isWiping,
    handleLogout,
    setUserSession
  } = useWorkflowUIState();

  const lang = userSession?.lang || 'ar';
  const dir = userSession?.dir || 'rtl';
  const activePersonaId = userSession?.personaId || 1;

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [dir, lang]);

  const handlePersonaSwitch = useCallback((personaId: number) => {
    setUserSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, personaId };
      localStorage.setItem('alo_user_session_v3.0', JSON.stringify(updated));
      return updated;
    });
  }, [setUserSession]);

  if (!userSession) {
    return <LoginView />;
  }

  return (
    <div className="alo-workspace">
      <header className="alo-header" style={{ margin: '-32px -24px 32px -24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="alo-logo">ALO DOCTOR</span>
          <span style={{ fontSize: '14px', opacity: 0.7 }}>
            v2.4 Saudi Edition
          </span>
        </div>

        <PersonaSwitcher
          activePersonaId={activePersonaId}
          onSwitch={handlePersonaSwitch}
          lang={lang}
        />

        <button
          type="button"
          className="alo-btn-logout"
          onClick={handleLogout}
          disabled={isWiping}
          aria-busy={isWiping}
          aria-label={lang === 'ar' ? 'تسجيل الخروج ومسح المحطة' : 'Logout and Wipe Station'}
        >
          {isWiping ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              {lang === 'ar' ? 'جاري المسح الآمن...' : 'Securely Wiping...'}
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </>
          )}
        </button>
      </header>

      <section aria-label={lang === 'ar' ? 'الحالات السريرية' : 'Clinical Cases'}>
        <h2 style={{ color: ALO_THEME.primary, fontSize: '20px', fontWeight: 700 }}>
          {lang === 'ar' ? 'الحالات النشطة' : 'Active Cases'}
          {activeCaseId && (
            <span style={{ fontSize: '14px', fontWeight: 400, marginLeft: dir === 'ltr' ? '12px' : '0', marginRight: dir === 'rtl' ? '12px' : '0', color: ALO_THEME.secondary }}>
              ({lang === 'ar' ? 'المحدد:' : 'Selected:'} {activeCaseId})
            </span>
          )}
        </h2>

        <div className="alo-case-list" role="list">
          {cases.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: ALO_THEME.primary, opacity: 0.6 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }} aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>
                {lang === 'ar' ? 'لا توجد حالات سريرية نشطة' : 'No active clinical cases'}
              </p>
            </div>
          ) : (
            cases.map((clinicalCase) => (
              <article
                key={clinicalCase.id}
                className="alo-case-card"
                role="listitem"
                aria-current={clinicalCase.id === activeCaseId ? 'true' : undefined}
                style={{
                  borderColor: clinicalCase.id === activeCaseId ? ALO_THEME.primary : 'transparent',
                  boxShadow: clinicalCase.id === activeCaseId ? `0 0 0 2px ${ALO_THEME.secondary}` : undefined
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                  {clinicalCase.patientName}
                </h3>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>
                  {lang === 'ar' ? 'الحالة:' : 'Status:'} {clinicalCase.status}
                </p>
              </article>
            ))
          )}
        </div>
      </section>

      <footer style={{ marginTop: '48px', paddingTop: '24px', borderTop: `1px solid ${ALO_THEME.secondary}`, opacity: 0.5, fontSize: '12px', textAlign: 'center' }}>
        ALO DOCTOR v2.4 Saudi Edition • {lang === 'ar' ? 'محطة سريرية آمنة' : 'Secure Clinical Station'} • {lang === 'ar' ? 'الملف الشخصي' : 'Persona'}: {activePersonaId}/11
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <StyleInjector />
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: ALO_THEME.background }}>
          <div style={{ color: ALO_THEME.primary, fontFamily: "'Cairo', sans-serif", fontSize: '18px', fontWeight: 600 }}>
            جاري تحميل المحطة السريرية...
          </div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/workspace" element={<WorkspaceView />} />
          <Route path="*" element={<Navigate to="/workspace" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
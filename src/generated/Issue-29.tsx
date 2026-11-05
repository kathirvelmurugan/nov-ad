import React, { useState, useCallback } from 'react';
import TopProfileSwitcher from './components/TopProfileSwitcher';
import PatientLandingView from './components/PatientLandingView';
import IntakeForm from './components/IntakeForm';
import StudioCockpit from './components/StudioCockpit';

type PersonaCode = 'P' | 'N' | 'D' | 'C' | 'K';
type ViewMode = 'standard' | 'studio';
type PatientSubView = 'landing' | 'intake';

interface Persona {
  code: PersonaCode;
  labelAr: string;
  labelEn: string;
}

const PERSONAS: Persona[] = [
  { code: 'P', labelAr: 'مريض', labelEn: 'Patient' },
  { code: 'N', labelAr: 'ممرض', labelEn: 'Nurse' },
  { code: 'D', labelAr: 'طبيب', labelEn: 'Doctor' },
  { code: 'C', labelAr: 'صيدلي', labelEn: 'Clinical Pharmacist' },
  { code: 'K', labelAr: 'إدارة', labelEn: 'Admin' },
];

const App: React.FC = () => {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const [patientSubView, setPatientSubView] = useState<PatientSubView>('landing');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const isArabic = lang === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const fontFamily = isArabic ? "'Cairo', sans-serif" : "'Inter', system-ui, sans-serif";

  const isPurePatientLanding =
    activePersona.code === 'P' &&
    patientSubView === 'landing' &&
    viewMode !== 'studio';

  const handleStartConsultation = useCallback(() => {
    setPatientSubView('intake');
  }, []);

  const handleEnterStudio = useCallback(() => {
    setViewMode('studio');
  }, []);

  const handleExitStudio = useCallback(() => {
    setViewMode('standard');
  }, []);

  const handleBackToLanding = useCallback(() => {
    setPatientSubView('landing');
    setViewMode('standard');
  }, []);

  return (
    <div
      dir={dir}
      lang={lang}
      style={{
        fontFamily,
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        backgroundColor: '#E6FAF7',
        color: '#0F172A',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');
        
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body, #root {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          touch-action: manipulation;
        }

        .alo-floating-cockpit-badge {
          position: fixed;
          bottom: 24px;
          ${isArabic ? 'left' : 'right'}: 24px;
          z-index: 9999;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #007B6E 0%, #00C6AE 100%);
          color: #FFFFFF;
          font-family: 'Cairo', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(0, 123, 110, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          text-decoration: none;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .alo-floating-cockpit-badge:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0, 123, 110, 0.45), 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .alo-floating-cockpit-badge:active {
          transform: translateY(0) scale(0.98);
        }

        .alo-floating-cockpit-badge:focus-visible {
          outline: 3px solid #00C6AE;
          outline-offset: 3px;
        }

        .alo-floating-cockpit-badge__icon {
          font-size: 16px;
          line-height: 1;
        }

        .alo-floating-cockpit-badge__text-ar {
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
        }

        .alo-floating-cockpit-badge__divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.4);
        }

        .alo-floating-cockpit-badge__text-en {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 500;
          opacity: 0.9;
        }

        @media (max-width: 480px) {
          .alo-floating-cockpit-badge {
            bottom: 16px;
            ${isArabic ? 'left' : 'right'}: 16px;
            padding: 10px 16px;
            font-size: 11px;
            gap: 6px;
          }
        }
      `}</style>

      {!isPurePatientLanding && (
        <header
          role="banner"
          aria-label={isArabic ? 'شريط أدوات المحاكاة' : 'Simulation Toolbar'}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid rgba(0, 123, 110, 0.12)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <TopProfileSwitcher
            personas={PERSONAS}
            activePersona={activePersona}
            onPersonaChange={setActivePersona}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            lang={lang}
            onLangToggle={() => setLang(prev => (prev === 'ar' ? 'en' : 'ar'))}
            caseId="ALO-2026-TEST01"
            onResetDemo={handleBackToLanding}
          />
        </header>
      )}

      <main
        role="main"
        id="alo-main-content"
        aria-label={isArabic ? 'المحتوى الرئيسي' : 'Main Content'}
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {viewMode === 'studio' ? (
          <StudioCockpit
            personas={PERSONAS}
            activePersona={activePersona}
            onPersonaChange={setActivePersona}
            onExitStudio={handleExitStudio}
            lang={lang}
          />
        ) : activePersona.code === 'P' && patientSubView === 'intake' ? (
          <IntakeForm
            lang={lang}
            onBackToLanding={handleBackToLanding}
            onSubmit={() => {}}
          />
        ) : activePersona.code === 'P' && patientSubView === 'landing' ? (
          <PatientLandingView
            lang={lang}
            onStartConsultation={handleStartConsultation}
            onSelectTier={(tierId: string) => {
              console.log('[ALO DOCTOR v2.4] Tier selected:', tierId);
              setPatientSubView('intake');
            }}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '48px 32px',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
                border: '1px solid rgba(0, 198, 174, 0.15)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '#E6FAF7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: isArabic ? '0 auto 24px auto' : '0 0 24px 0',
                  fontSize: '28px',
                }}
              >
                {activePersona.code === 'N' ? '🩺' : activePersona.code === 'D' ? '⚕️' : activePersona.code === 'C' ? '💊' : '⚙️'}
              </div>
              <h2
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#007B6E',
                  marginBottom: '12px',
                }}
              >
                {isArabic
                  ? `واجهة ${activePersona.labelAr}`
                  : `${activePersona.labelEn} Dashboard`}
              </h2>
              <p
                style={{
                  fontFamily,
                  fontSize: '14px',
                  color: '#64748B',
                  lineHeight: 1.7,
                }}
              >
                {isArabic
                  ? 'قمرة المحاكاة جاهزة. اختر دورك من الشريط العلوي للبدء.'
                  : 'Simulation cockpit ready. Select your role from the toolbar above to begin.'}
              </p>
            </div>
          </div>
        )}
      </main>

      {isPurePatientLanding && (
        <button
          type="button"
          className="alo-floating-cockpit-badge"
          onClick={handleEnterStudio}
          aria-label={
            isArabic
              ? 'فتح قمرة المحاكاة الخماسية'
              : 'Open 5-Role Simulation Cockpit'
          }
          title={
            isArabic
              ? 'قمرة المحاكاة الخماسية / 5-Role Cockpit'
              : '5-Role Cockpit / قمرة المحاكاة الخماسية'
          }
        >
          <span className="alo-floating-cockpit-badge__icon" aria-hidden="true">
            📱
          </span>
          <span className="alo-floating-cockpit-badge__text-ar">
            قمرة المحاكاة الخماسية
          </span>
          <span className="alo-floating-cockpit-badge__divider" aria-hidden="true" />
          <span className="alo-floating-cockpit-badge__text-en">
            5-Role Cockpit
          </span>
        </button>
      )}
    </div>
  );
};

export default App;
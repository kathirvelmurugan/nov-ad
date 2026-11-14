import React from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from './AppLayout';
import FiveDeviceCockpitView from '../components/cockpit/FiveDeviceCockpitView';
import { useWorkflowUIState } from '../hooks/useWorkflowUIState';
import { PersonaProfile } from '../types/persona';

// src/hooks/useWorkflowUIState.ts

import { useState, useCallback } from 'react';

export interface WorkflowUIState {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  activePersona: PersonaProfile;
  setActivePersona: (persona: PersonaProfile) => void;
  currentLanguage: 'ar' | 'en';
  setCurrentLanguage: (lang: 'ar' | 'en') => void;
}

export const useWorkflowUIState = (): WorkflowUIState => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaProfile>('doctor');
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>('ar');

  return {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    activePersona,
    setActivePersona,
    currentLanguage,
    setCurrentLanguage,
  };
};


// src/App.tsx

const App: React.FC = () => {
  const workflowState = useWorkflowUIState();
  const { i18n } = useTranslation();

  React.useEffect(() => {
    document.documentElement.dir = workflowState.currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = workflowState.currentLanguage;
    document.body.style.fontFamily = "'Cairo', sans-serif";
    document.body.style.backgroundColor = '#E6FAF7';
    document.body.style.color = '#007B6E';
  }, [workflowState.currentLanguage]);

  return (
    <ScreenRouter workflowState={workflowState} />
  );
};

export default App;


// src/ScreenRouter.tsx

import React from 'react';
import { WorkflowUIState } from './hooks/useWorkflowUIState';
import AppLayout from './layout/AppLayout';

interface ScreenRouterProps {
  workflowState: WorkflowUIState;
}

const ScreenRouter: React.FC<ScreenRouterProps> = ({ workflowState }) => {
  return (
    <AppLayout
      isSidebarCollapsed={workflowState.isSidebarCollapsed}
      onToggleSidebar={() => workflowState.setIsSidebarCollapsed(!workflowState.isSidebarCollapsed)}
      activePersona={workflowState.activePersona}
      onPersonaChange={workflowState.setActivePersona}
      currentLanguage={workflowState.currentLanguage}
      onLanguageChange={workflowState.setCurrentLanguage}
    >
      <FiveDeviceCockpitView 
        activePersona={workflowState.activePersona} 
      />
    </AppLayout>
  );
};

export default ScreenRouter;


// src/layout/AppLayout.tsx

import React from 'react';
import { PersonaProfile } from '../types/persona';
import PersonaSwitcher from '../components/navigation/PersonaSwitcher';

interface AppLayoutProps {
  children: React.ReactNode;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  activePersona: PersonaProfile;
  onPersonaChange: (persona: PersonaProfile) => void;
  currentLanguage: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  isSidebarCollapsed,
  onToggleSidebar,
  activePersona,
  onPersonaChange,
  currentLanguage,
  onLanguageChange,
}) => {
  const isRTL = currentLanguage === 'ar';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Cairo', sans-serif",
        backgroundColor: '#E6FAF7',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <aside
        style={{
          width: isSidebarCollapsed ? '80px' : '280px',
          backgroundColor: '#FFFFFF',
          borderInlineEnd: '1px solid #00C6AE',
          transition: 'width 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
        }}
      >
        <button
          onClick={onToggleSidebar}
          aria-label={isRTL ? 'تبديل الشريط الجانبي' : 'Toggle Sidebar'}
          style={{
            background: 'none',
            border: 'none',
            color: '#007B6E',
            cursor: 'pointer',
            fontSize: '1.5rem',
            marginBottom: '2rem',
            alignSelf: isRTL ? 'flex-start' : 'flex-end',
          }}
        >
          {isSidebarCollapsed ? (isRTL ? '→' : '←') : (isRTL ? '←' : '→')}
        </button>

        {!isSidebarCollapsed && (
          <PersonaSwitcher
            activePersona={activePersona}
            onPersonaChange={onPersonaChange}
          />
        )}
      </aside>

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
        <header
          style={{
            height: '64px',
            backgroundColor: '#007B6E',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            boxShadow: '0 2px 4px rgba(0, 123, 110, 0.1)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            ALO DOCTOR
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => onLanguageChange(currentLanguage === 'ar' ? 'en' : 'ar')}
              style={{
                backgroundColor: '#00C6AE',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 600,
              }}
            >
              {currentLanguage === 'ar' ? 'English' : 'عربي'}
            </button>
          </div>
        </header>

        <div
          style={{
            flex: 1,
            padding: '2rem',
            overflowY: 'auto',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;


// src/components/cockpit/FiveDeviceCockpitView.tsx

import React from 'react';
import { PersonaProfile } from '../../types/persona';

interface FiveDeviceCockpitViewProps {
  activePersona: PersonaProfile;
}

const personaConfig: Record<PersonaProfile, { titleAr: string; titleEn: string }> = {
  doctor: { titleAr: 'لوحة تحكم الطبيب', titleEn: 'Doctor Cockpit' },
  patient: { titleAr: 'بوابة المريض', titleEn: 'Patient Portal' },
  nurse: { titleAr: 'محطة التمريض', titleEn: 'Nursing Station' },
  admin: { titleAr: 'إدارة العمليات', titleEn: 'Operations Admin' },
  pharmacist: { titleAr: 'الصيدلية السريرية', titleEn: 'Clinical Pharmacy' },
  lab: { titleAr: 'المختبر', titleEn: 'Laboratory' },
  radiology: { titleAr: 'الأشعة', titleEn: 'Radiology' },
  billing: { titleAr: 'الفوترة', titleEn: 'Billing' },
  reception: { titleAr: 'الاستقبال', titleEn: 'Reception' },
  manager: { titleAr: 'الإدارة', titleEn: 'Management' },
  superadmin: { titleAr: 'المسؤول العام', titleEn: 'Super Admin' },
};

const FiveDeviceCockpitView: React.FC<FiveDeviceCockpitViewProps> = ({ activePersona }) => {
  const isRTL = document.documentElement.dir === 'rtl';
  const config = personaConfig[activePersona];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <div
        style={{
          gridColumn: '1 / -1',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #00C6AE',
          boxShadow: '0 4px 6px rgba(0, 198, 174, 0.05)',
        }}
      >
        <h2
          style={{
            margin: '0 0 1rem 0',
            color: '#007B6E',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}
        >
          {isRTL ? config.titleAr : config.titleEn}
        </h2>
        <p style={{ color: '#007B6E', opacity: 0.8, margin: 0 }}>
          {isRTL
            ? 'عرض سريري نظيف وخالي من المشتتات.'
            : 'Clean, distraction-free clinical view.'}
        </p>
      </div>

      {[1, 2, 3, 4, 5].map((deviceIndex) => (
        <div
          key={`device-${deviceIndex}`}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #E6FAF7',
            boxShadow: '0 2px 4px rgba(0, 123, 110, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              height: '8px',
              width: '40%',
              backgroundColor: '#00C6AE',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              height: '12px',
              width: '100%',
              backgroundColor: '#E6FAF7',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              height: '12px',
              width: '80%',
              backgroundColor: '#E6FAF7',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '1rem',
              borderTop: '1px solid #E6FAF7',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              style={{
                backgroundColor: '#007B6E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00C6AE')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007B6E')}
            >
              {isRTL ? 'إجراء' : 'Action'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FiveDeviceCockpitView;
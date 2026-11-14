import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersona } from '../contexts/PersonaContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const PERSONA_PROFILES = [
  'patient',
  'doctor',
  'nurse',
  'pharmacist',
  'lab_technician',
  'radiologist',
  'admin',
  'billing_specialist',
  'receptionist',
  'clinic_manager',
  'system_admin'
] as const;

type PersonaProfile = typeof PERSONA_PROFILES[number];

const AppLayout: React.FC = () => {
  const { dir, locale } = useLanguage();
  const { activePersona, setPersona } = usePersona();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const isRTL = dir === 'rtl';

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    document.body.style.fontFamily = 'Cairo, sans-serif';
    document.body.style.direction = dir;
  }, [dir, locale]);

  const handlePersonaSwitch = (profile: PersonaProfile) => {
    setPersona(profile);
  };

  const layoutStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'row-reverse',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#E6FAF7',
    fontFamily: 'Cairo, sans-serif',
    direction: dir,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }), [dir]);

  const mainContentStyles = useMemo<React.CSSProperties>(() => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    backgroundColor: '#FFFFFF',
    margin: isRTL ? '0 0 0 16px' : '0 16px 0 0',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0, 123, 110, 0.06)',
    transition: 'margin 0.3s ease'
  }), [isRTL]);

  return (
    <div style={layoutStyles} className="alo-doctor-layout-v2-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .alo-persona-switcher {
          display: flex;
          gap: 8px;
          padding: 12px 24px;
          background: #FFFFFF;
          border-bottom: 1px solid #E6FAF7;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .alo-persona-switcher::-webkit-scrollbar {
          display: none;
        }

        .alo-persona-btn {
          font-family: 'Cairo', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 24px;
          border: 1.5px solid #007B6E;
          background: transparent;
          color: #007B6E;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .alo-persona-btn:hover {
          background: #E6FAF7;
        }

        .alo-persona-btn.active {
          background: #007B6E;
          color: #FFFFFF;
          border-color: #007B6E;
          box-shadow: 0 2px 8px rgba(0, 123, 110, 0.25);
        }

        .alo-whatsapp-fab {
          position: fixed;
          bottom: 32px;
          ${isRTL ? 'left' : 'right'}: 32px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4);
          cursor: pointer;
          z-index: 9999;
          border: none;
          transition: transform 0.2s ease;
        }

        .alo-whatsapp-fab:hover {
          transform: scale(1.08);
        }

        .alo-whatsapp-fab svg {
          width: 28px;
          height: 28px;
          fill: #FFFFFF;
        }
      `}</style>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(prev => !prev)} 
        currentPath={location.pathname}
      />

      <div style={mainContentStyles}>
        <TopBar 
          onMenuToggle={() => setIsSidebarOpen(prev => !prev)} 
          isSidebarOpen={isSidebarOpen}
        />

        <nav 
          className="alo-persona-switcher" 
          role="navigation" 
          aria-label={isRTL ? 'تبديل الملف الشخصي' : 'Persona Profile Switcher'}
        >
          {PERSONA_PROFILES.map((profile) => (
            <button
              key={profile}
              type="button"
              className={`alo-persona-btn ${activePersona === profile ? 'active' : ''}`}
              onClick={() => handlePersonaSwitch(profile)}
              aria-pressed={activePersona === profile}
              aria-label={`${isRTL ? 'التبديل إلى' : 'Switch to'} ${profile.replace('_', ' ')}`}
            >
              {profile.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </nav>

        <main
          id="alo-clinical-main"
          role="main"
          aria-label={isRTL ? 'المحتوى السريري الرئيسي' : 'Main Clinical Content'}
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E6FAF7'
          }}
        >
          <Outlet />
        </main>
      </div>

      <button
        type="button"
        className="alo-whatsapp-fab"
        aria-label={isRTL ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
        onClick={() => window.open('https://wa.me/', '_blank', 'noopener,noreferrer')}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>
    </div>
  );
};

export default AppLayout;
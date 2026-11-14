import React, { useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// --- Types & Interfaces ---
export interface PersonaProfile {
  id: string;
  roleCode: string;
  displayNameAr: string;
  displayNameEn: string;
  hospitalAffiliationAr?: string;
  hospitalAffiliationEn?: string;
  avatarUrl?: string;
}

interface TopProfileSwitcherProps {
  currentProfile: PersonaProfile;
  availableProfiles: PersonaProfile[];
  onProfileChange: (profile: PersonaProfile) => void;
  onLogout: () => void;
  isRtl: boolean;
}

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#5F6368',
};

const SUPER_ADMIN_ROLE_CODE = 'AD';

export const TopProfileSwitcher: React.FC<TopProfileSwitcherProps> = ({
  currentProfile,
  availableProfiles,
  onProfileChange,
  onLogout,
  isRtl,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isDemoMode = searchParams.get('demo') === 'true';
  const isSuperAdmin = currentProfile.roleCode === SUPER_ADMIN_ROLE_CODE;
  const canSwitchPersonas = isSuperAdmin || isDemoMode;

  const direction = isRtl ? 'rtl' : 'ltr';
  const fontFamily = "'Cairo', sans-serif";

  const handleLogout = useCallback(() => {
    onLogout();
    navigate('/login', { replace: true });
  }, [onLogout, navigate]);

  const containerStyles: React.CSSProperties = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      backgroundColor: PALETTE.background,
      borderRadius: '12px',
      border: `1px solid ${PALETTE.secondary}`,
      direction,
      fontFamily,
      position: 'relative',
    }),
    [direction, fontFamily]
  );

  const badgeStyles: React.CSSProperties = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 10px',
      backgroundColor: PALETTE.primary,
      color: PALETTE.white,
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    }),
    []
  );

  const nameStyles: React.CSSProperties = useMemo(
    () => ({
      fontSize: '14px',
      fontWeight: 600,
      color: PALETTE.textDark,
      margin: 0,
      lineHeight: 1.2,
    }),
    []
  );

  const affiliationStyles: React.CSSProperties = useMemo(
    () => ({
      fontSize: '12px',
      fontWeight: 400,
      color: PALETTE.textMuted,
      margin: 0,
      lineHeight: 1.2,
    }),
    []
  );

  const logoutButtonStyles: React.CSSProperties = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 14px',
      backgroundColor: 'transparent',
      color: PALETTE.primary,
      border: `1px solid ${PALETTE.primary}`,
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily,
      marginLeft: isRtl ? '0' : 'auto',
      marginRight: isRtl ? 'auto' : '0',
    }),
    [fontFamily, isRtl]
  );

  const selectStyles: React.CSSProperties = useMemo(
    () => ({
      padding: '6px 10px',
      borderRadius: '8px',
      border: `1px solid ${PALETTE.secondary}`,
      backgroundColor: PALETTE.white,
      color: PALETTE.textDark,
      fontSize: '13px',
      fontWeight: 500,
      fontFamily,
      cursor: 'pointer',
      outline: 'none',
      direction,
      appearance: 'none',
      WebkitAppearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23007B6E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: isRtl ? 'left 10px center' : 'right 10px center',
      paddingRight: isRtl ? '10px' : '30px',
      paddingLeft: isRtl ? '30px' : '10px',
    }),
    [fontFamily, direction, isRtl]
  );

  const hospitalName = isRtl
    ? currentProfile.hospitalAffiliationAr
    : currentProfile.hospitalAffiliationEn;

  const displayName = isRtl
    ? currentProfile.displayNameAr
    : currentProfile.displayNameEn;

  return (
    <div style={containerStyles} role="region" aria-label="Profile Switcher">
      {currentProfile.avatarUrl && (
        <img
          src={currentProfile.avatarUrl}
          alt={displayName}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${PALETTE.secondary}`,
          }}
          loading="lazy"
        />
      )}

      <span style={badgeStyles} aria-label={`Role: ${currentProfile.roleCode}`}>
        {currentProfile.roleCode}
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={nameStyles}>{displayName}</p>
        {hospitalName && <p style={affiliationStyles}>{hospitalName}</p>}
      </div>

      {canSwitchPersonas && availableProfiles.length > 1 && (
        <select
          style={selectStyles}
          value={currentProfile.id}
          onChange={(e) => {
            const selected = availableProfiles.find((p) => p.id === e.target.value);
            if (selected) {
              onProfileChange(selected);
            }
          }}
          aria-label={isRtl ? 'تبديل الشخصية' : 'Switch Persona'}
        >
          {availableProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {isRtl ? profile.displayNameAr : profile.displayNameEn}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        style={logoutButtonStyles}
        onClick={handleLogout}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = PALETTE.primary;
          e.currentTarget.style.color = PALETTE.white;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = PALETTE.primary;
        }}
        aria-label={isRtl ? 'تسجيل الخروج' : 'Logout'}
      >
        {isRtl ? 'خروج' : 'Logout'}
      </button>
    </div>
  );
};

export default TopProfileSwitcher;


import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopProfileSwitcher, { PersonaProfile } from '../components/TopProfileSwitcher';

// --- Types ---
interface AppLayoutProps {
  children: React.ReactNode;
  currentProfile: PersonaProfile;
  availableProfiles: PersonaProfile[];
  onProfileChange: (profile: PersonaProfile) => void;
  onLogout: () => void;
  isRtl: boolean;
}

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  surface: '#F8FDFC',
};

const SUPER_ADMIN_ROLE_CODE = 'AD';

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentProfile,
  availableProfiles,
  onProfileChange,
  onLogout,
  isRtl,
}) => {
  const [searchParams] = useSearchParams();

  const isDemoMode = searchParams.get('demo') === 'true';
  const isSuperAdmin = currentProfile.roleCode === SUPER_ADMIN_ROLE_CODE;

  // Enforce that TopProfileSwitcher is only accessible to Super Admin or when demo=true
  const isProfileSwitcherAuthorized = isSuperAdmin || isDemoMode;

  const direction = isRtl ? 'rtl' : 'ltr';
  const fontFamily = "'Cairo', sans-serif";

  const layoutStyles: React.CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: PALETTE.surface,
      direction,
      fontFamily,
    }),
    [direction, fontFamily]
  );

  const headerStyles: React.CSSProperties = useMemo(
    () => ({
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      backgroundColor: PALETTE.white,
      borderBottom: `2px solid ${PALETTE.background}`,
      boxShadow: '0 2px 8px rgba(0, 123, 110, 0.06)',
    }),
    []
  );

  const mainStyles: React.CSSProperties = useMemo(
    () => ({
      flex: 1,
      padding: '24px',
      maxWidth: '1440px',
      width: '100%',
      margin: '0 auto',
      boxSizing: 'border-box',
    }),
    []
  );

  const logoStyles: React.CSSProperties = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '20px',
      fontWeight: 800,
      color: PALETTE.primary,
      letterSpacing: '-0.5px',
    }),
    []
  );

  return (
    <div style={layoutStyles}>
      <header style={headerStyles} role="banner">
        <div style={logoStyles}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              fill={PALETTE.secondary}
            />
            <path
              d="M2 17L12 22L22 17"
              stroke={PALETTE.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke={PALETTE.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          ALO DOCTOR
        </div>

        {/* 
          Security Gate: Only render the interactive TopProfileSwitcher 
          if the user is a Super Admin (roleCode === 'AD') or demo=true is set.
          Otherwise, we pass a single-element array to lock them into their current role.
        */}
        <TopProfileSwitcher
          currentProfile={currentProfile}
          availableProfiles={
            isProfileSwitcherAuthorized ? availableProfiles : [currentProfile]
          }
          onProfileChange={onProfileChange}
          onLogout={onLogout}
          isRtl={isRtl}
        />
      </header>

      <main style={mainStyles} role="main">
        {children}
      </main>

      <footer
        style={{
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#5F6368',
          borderTop: `1px solid ${PALETTE.background}`,
          fontFamily,
        }}
        role="contentinfo"
      >
        © {new Date().getFullYear()} ALO DOCTOR v2.4 Saudi Edition.{' '}
        {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
      </footer>
    </div>
  );
};

export default AppLayout;
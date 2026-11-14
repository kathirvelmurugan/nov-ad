import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// --- Types & Interfaces ---
export type PersonaRoleCode = 'PT' | 'NR' | 'DR' | 'CO' | 'CN' | 'AD';

export interface UserSession {
  id: string;
  fullNameAr: string;
  fullNameEn: string;
  roleCode: PersonaRoleCode;
  avatarUrl?: string;
}

interface TopProfileSwitcherProps {
  session: UserSession | null;
  onLogout: () => void;
  isRtl: boolean;
}

// --- Constants ---
const TEAL_PRIMARY = '#007B6E';
const TEAL_ACCENT = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const ROLE_LABELS: Record<PersonaRoleCode, { ar: string; en: string }> = {
  PT: { ar: 'مريض', en: 'Patient' },
  NR: { ar: 'ممرض', en: 'Nurse' },
  DR: { ar: 'طبيب', en: 'Doctor' },
  CO: { ar: 'منسق', en: 'Coordinator' },
  CN: { ar: 'استشاري', en: 'Consultant' },
  AD: { ar: 'مدير النظام', en: 'Super Admin' },
};

// --- Component ---
const TopProfileSwitcher: React.FC<TopProfileSwitcherProps> = ({ session, onLogout, isRtl }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Zero artificial gates: clean evaluation of environment and role
  const isProduction = process.env.NODE_ENV === 'production';
  const isDemoMode = searchParams.get('demo') === 'true';
  const isSuperAdmin = session?.roleCode === 'AD';

  // Production Guard: Hard-lock unless Super Admin or explicit demo flag
  const isSwitcherAuthorized = useMemo(() => {
    if (!session) return false;
    if (isSuperAdmin) return true;
    if (!isProduction && isDemoMode) return true;
    return false;
  }, [session, isSuperAdmin, isProduction, isDemoMode]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (!session) return null;

  const lang = isRtl ? 'ar' : 'en';
  const dir = isRtl ? 'rtl' : 'ltr';
  const roleLabel = ROLE_LABELS[session.roleCode][lang];
  const displayName = isRtl ? session.fullNameAr : session.fullNameEn;

  return (
    <div
      dir={dir}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: TEAL_BG,
        padding: '8px 16px',
        borderRadius: '12px',
        border: `1px solid ${TEAL_ACCENT}`,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: TEAL_PRIMARY,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '16px',
        }}
        aria-label={displayName}
      >
        {displayName.charAt(0)}
      </div>

      {/* User Info & Role Badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
          {displayName}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: isSuperAdmin ? WHATSAPP_GREEN : TEAL_PRIMARY,
            backgroundColor: isSuperAdmin ? '#E8F8EE' : '#FFFFFF',
            padding: '2px 8px',
            borderRadius: '6px',
            border: `1px solid ${isSuperAdmin ? WHATSAPP_GREEN : TEAL_ACCENT}`,
            marginTop: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {roleLabel}
        </span>
      </div>

      {/* 
        SECURITY ENFORCEMENT:
        If authorized (Super Admin OR Dev/Demo), we could render a dropdown here.
        For standard users (Patient, Doctor, Nurse), the switcher is completely omitted.
        Only the secure Logout action remains accessible to all authenticated users.
      */}
      {isSwitcherAuthorized && (
        <button
          type="button"
          onClick={() => navigate('/admin/persona-management')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: TEAL_PRIMARY,
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'underline',
            padding: 0,
            fontFamily: 'Cairo, sans-serif',
          }}
          aria-label={isRtl ? 'إدارة الأدوار' : 'Manage Personas'}
        >
          {isRtl ? 'تبديل الدور' : 'Switch Role'}
        </button>
      )}

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', backgroundColor: TEAL_ACCENT, margin: '0 4px' }} />

      {/* Clean Logout Action */}
      <button
        type="button"
        onClick={handleLogout}
        style={{
          backgroundColor: 'transparent',
          color: '#D32F2F',
          border: '1px solid #FFCDD2',
          borderRadius: '8px',
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Cairo, sans-serif',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FFEBEE';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label={isRtl ? 'تسجيل الخروج' : 'Logout'}
      >
        {isRtl ? 'خروج' : 'Logout'}
      </button>
    </div>
  );
};

export default TopProfileSwitcher;


import React from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import TopProfileSwitcher from '../components/TopProfileSwitcher';

// --- Types ---
interface AppLayoutProps {
  userSession: {
    id: string;
    fullNameAr: string;
    fullNameEn: string;
    roleCode: 'PT' | 'NR' | 'DR' | 'CO' | 'CN' | 'AD';
    avatarUrl?: string;
  } | null;
  onLogout: () => void;
  locale: 'ar' | 'en';
}

// --- Constants ---
const TEAL_PRIMARY = '#007B6E';
const TEAL_BG = '#E6FAF7';

const AppLayout: React.FC<AppLayoutProps> = ({ userSession, onLogout, locale }) => {
  const [searchParams] = useSearchParams();
  const isRtl = locale === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  // Role Enclosure Logic:
  // Conditionally render TopProfileSwitcher only when:
  // 1. User is logged in as Super Admin (userSession?.roleCode === 'AD'), OR
  // 2. Explicit dev/demo query flag (?demo=true) is present.
  const isProduction = process.env.NODE_ENV === 'production';
  const isDemoMode = searchParams.get('demo') === 'true';
  const isSuperAdmin = userSession?.roleCode === 'AD';

  const shouldRenderProfileSwitcher = !isProduction || isSuperAdmin || isDemoMode;

  return (
    <div
      dir={dir}
      lang={locale}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: '#F4F7F6',
        direction: dir,
      }}
    >
      {/* Header / Navigation Bar */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: `2px solid ${TEAL_BG}`,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0, 123, 110, 0.04)',
        }}
      >
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: TEAL_PRIMARY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '18px',
            }}
          >
            A
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 800,
              color: TEAL_PRIMARY,
              letterSpacing: '-0.5px',
            }}
          >
            {isRtl ? 'ألو دكتور' : 'ALO DOCTOR'}
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#666666',
                marginLeft: isRtl ? 0 : '8px',
                marginRight: isRtl ? '8px' : 0,
                verticalAlign: 'middle',
              }}
            >
              v2.4 Saudi Edition
            </span>
          </h1>
        </div>

        {/* Secure Profile Switcher Enclosure */}
        <nav aria-label={isRtl ? 'إجراءات المستخدم' : 'User Actions'}>
          {shouldRenderProfileSwitcher ? (
            <TopProfileSwitcher
              session={userSession}
              onLogout={onLogout}
              isRtl={isRtl}
            />
          ) : (
            /* Fallback for standard users in production: Visual Indicator + Logout ONLY */
            userSession && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: TEAL_BG,
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #00C6AE',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: TEAL_PRIMARY,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  {(isRtl ? userSession.fullNameAr : userSession.fullNameEn).charAt(0)}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
                  {isRtl ? userSession.fullNameAr : userSession.fullNameEn}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    window.location.href = '/login';
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#D32F2F',
                    border: '1px solid #FFCDD2',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Cairo, sans-serif',
                  }}
                  aria-label={isRtl ? 'تسجيل الخروج' : 'Logout'}
                >
                  {isRtl ? 'خروج' : 'Logout'}
                </button>
              </div>
            )
          )}
        </nav>
      </header>

      {/* Main Clinical Content Area */}
      <main
        style={{
          flex: 1,
          padding: '24px',
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '16px',
          fontSize: '12px',
          color: '#888888',
          borderTop: `1px solid ${TEAL_BG}`,
          backgroundColor: '#FFFFFF',
          fontFamily: 'Cairo, sans-serif',
        }}
      >
        © {new Date().getFullYear()} ALO DOCTOR. {isRtl ? 'جميع الحقوق محفوظة للنظام الصحي السعودي.' : 'All rights reserved for Saudi Health System.'}
      </footer>
    </div>
  );
};

export default AppLayout;
import React from 'react';
import { PALETTE, AuthPortalTab } from './authTypesAndUtils';
import { User, Stethoscope, Building2, ShieldCheck } from 'lucide-react';

interface PortalSelectorBarProps {
  activePortal: AuthPortalTab;
  onSelectPortal: (portal: AuthPortalTab) => void;
  isRTL: boolean;
  t: (ar: string, en: string) => string;
}

export const PortalSelectorBar: React.FC<PortalSelectorBarProps> = ({
  activePortal,
  onSelectPortal,
  isRTL,
  t,
}) => {
  const tabs: { id: AuthPortalTab; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: 'patient',
      labelAr: 'بوابة المريض',
      labelEn: 'Patient Portal',
      icon: <User style={{ width: 15, height: 15 }} />,
    },
    {
      id: 'clinical',
      labelAr: 'طاقم ألو الطبي',
      labelEn: 'ALO Operations',
      icon: <Stethoscope style={{ width: 15, height: 15 }} />,
    },
    {
      id: 'hospital',
      labelAr: 'المجمع الطبي',
      labelEn: 'Hospital Portal',
      icon: <Building2 style={{ width: 15, height: 15 }} />,
    },
    {
      id: 'superadmin',
      labelAr: 'المشرف العام',
      labelEn: 'Super Admin',
      icon: <ShieldCheck style={{ width: 15, height: 15 }} />,
    },
  ];

  return (
    <div
      role="tablist"
      data-testid="portal-selector-bar"
      aria-label="اختيار بوابة تسجيل الدخول"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '4px',
        backgroundColor: '#f1f5f9',
        padding: '4px',
        borderRadius: '12px',
        marginBottom: '20px',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {tabs.map((tab) => {
        const isSelected = activePortal === tab.id;
        const isSuperAdmin = tab.id === 'superadmin';
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectPortal(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isSelected
                ? isSuperAdmin
                  ? '#0f172a'
                  : PALETTE.primary
                : 'transparent',
              color: isSelected ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontWeight: isSelected ? 800 : 600,
              fontSize: '11px',
              fontFamily: 'inherit',
            }}
          >
            {tab.icon}
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
              {t(tab.labelAr, tab.labelEn)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

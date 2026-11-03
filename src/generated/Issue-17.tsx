import { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type RoleCode = 'A' | 'B' | 'C' | 'D' | 'E';

export type SurfaceType = 'portal-web' | 'mobile-app' | 'whatsapp-bot' | 'clinical-dashboard';

export interface PersonaProfile {
  id: string;
  roleCode: RoleCode;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  avatar: string;
  surface: SurfaceType;
  dir: 'rtl' | 'ltr';
  lang: 'ar' | 'en';
  fontFamily: string;
}

export const PERSONAS: PersonaProfile[] = [
  {
    id: 'role-a',
    roleCode: 'A',
    nameEn: 'Dr. Ahmed Al-Farsi',
    nameAr: 'د. أحمد الفارسي',
    titleEn: 'Saudi Treating Doctor',
    titleAr: 'الطبيب المعالج السعودي',
    avatar: '👨‍⚕️',
    surface: 'clinical-dashboard',
    dir: 'rtl',
    lang: 'ar',
    fontFamily: 'Cairo, sans-serif',
  },
  {
    id: 'role-b',
    roleCode: 'B',
    nameEn: 'Nurse Fatima Hassan',
    nameAr: 'الممرضة فاطمة حسن',
    titleEn: 'ALO Nurse',
    titleAr: 'ممرضة آلو دكتور',
    avatar: '👩‍⚕️',
    surface: 'mobile-app',
    dir: 'rtl',
    lang: 'ar',
    fontFamily: 'Cairo, sans-serif',
  },
  {
    id: 'role-c',
    roleCode: 'C',
    nameEn: 'Abdulrahman Al-Shehri',
    nameAr: 'عبدالرحمن الشهري',
    titleEn: 'ALO Coordinator',
    titleAr: 'منسق آلو دكتور',
    avatar: '👔',
    surface: 'portal-web',
    dir: 'rtl',
    lang: 'ar',
    fontFamily: 'Cairo, sans-serif',
  },
  {
    id: 'role-d',
    roleCode: 'D',
    nameEn: 'Dr. Sarah Mitchell',
    nameAr: 'د. سارة ميتشل',
    titleEn: 'International Consultant',
    titleAr: 'استشاري دولي',
    avatar: '👩‍💼',
    surface: 'portal-web',
    dir: 'ltr',
    lang: 'en',
    fontFamily: 'Cairo, sans-serif',
  },
  {
    id: 'role-e',
    roleCode: 'E',
    nameEn: 'Patient Khalid Omar',
    nameAr: 'المريض خالد عمر',
    titleEn: 'Patient',
    titleAr: 'المريض',
    avatar: '🧑',
    surface: 'whatsapp-bot',
    dir: 'rtl',
    lang: 'ar',
    fontFamily: 'Cairo, sans-serif',
  },
];

interface PersonaContextState {
  activePersona: PersonaProfile;
  switchPersona: (roleCode: RoleCode) => void;
  personas: PersonaProfile[];
}

const PersonaContext = createContext<PersonaContextState | null>(null);

export const usePersona = (): PersonaContextState => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};

export const PersonaProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeRoleCode, setActiveRoleCode] = useState<RoleCode>('A');

  const activePersona = useMemo(
    () => PERSONAS.find((p) => p.roleCode === activeRoleCode) || PERSONAS[0],
    [activeRoleCode]
  );

  const switchPersona = useCallback((roleCode: RoleCode) => {
    setActiveRoleCode(roleCode);
  }, []);

  const value = useMemo(
    () => ({
      activePersona,
      switchPersona,
      personas: PERSONAS,
    }),
    [activePersona, switchPersona]
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
};

export const PersonaSwitcher = () => {
  const { activePersona, switchPersona, personas } = usePersona();

  return (
    <div
      dir={activePersona.dir}
      lang={activePersona.lang}
      style={{
        fontFamily: activePersona.fontFamily,
        direction: activePersona.dir,
        backgroundColor: '#E6FAF7',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #00C6AE',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      <h3
        style={{
          margin: 0,
          color: '#007B6E',
          fontSize: '18px',
          fontWeight: 700,
          textAlign: activePersona.dir === 'rtl' ? 'right' : 'left',
        }}
      >
        {activePersona.lang === 'ar' ? 'تبديل الملف الشخصي' : 'Switch Profile'}
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
          gap: '8px',
        }}
      >
        {personas.map((persona) => {
          const isActive = persona.roleCode === activePersona.roleCode;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => switchPersona(persona.roleCode)}
              aria-label={`${persona.nameEn} - ${persona.titleEn}`}
              aria-pressed={isActive}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '12px 8px',
                borderRadius: '8px',
                border: isActive ? '2px solid #007B6E' : '2px solid transparent',
                backgroundColor: isActive ? '#00C6AE' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#007B6E',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                fontFamily: 'Cairo, sans-serif',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 198, 174, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '24px' }} aria-hidden="true">
                {persona.avatar}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                {persona.roleCode}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '12px',
          borderRadius: '8px',
          borderRight: activePersona.dir === 'rtl' ? '4px solid #25D366' : 'none',
          borderLeft: activePersona.dir === 'ltr' ? '4px solid #25D366' : 'none',
        }}
      >
        <p
          style={{
            margin: '0 0 4px 0',
            fontWeight: 700,
            fontSize: '16px',
            color: '#007B6E',
          }}
        >
          {activePersona.avatar} {activePersona.lang === 'ar' ? activePersona.nameAr : activePersona.nameEn}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: '#007B6E',
            opacity: 0.8,
          }}
        >
          {activePersona.lang === 'ar' ? activePersona.titleAr : activePersona.titleEn}
        </p>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: '12px',
            color: '#007B6E',
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {activePersona.surface}
        </p>
      </div>
    </div>
  );
};
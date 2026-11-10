import React, { useState, useMemo, useCallback } from 'react';

// --- Types & Constants ---
export type RoleCode = 'AD' | 'HA' | 'C' | 'N' | 'D' | 'K' | 'L' | 'PH' | 'REC' | 'P' | 'F';
export type Lang = 'ar' | 'en';
export type TabId = 'roles' | 'tenants' | 'staff' | 'catalogs' | 'audit';

interface RoleDefinition {
  code: RoleCode;
  name: Record<Lang, string>;
  tier: string;
  privacyBoundary: Record<Lang, string>;
  capabilities: Record<Lang, string[]>;
}

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textLight: '#4A4A4A',
  border: '#D1E8E5',
};

const ROLES_MATRIX: RoleDefinition[] = [
  {
    code: 'AD',
    name: { ar: 'مدير النظام', en: 'Admin' },
    tier: 'Enterprise',
    privacyBoundary: { ar: 'وصول كامل للنظام', en: 'Full System Access' },
    capabilities: { ar: ['إدارة المستخدمين', 'تكوين النظام'], en: ['User Management', 'System Config'] },
  },
  {
    code: 'HA',
    name: { ar: 'مدير المستشفى', en: 'Hospital Admin' },
    tier: 'Facility',
    privacyBoundary: { ar: 'بيانات المنشأة فقط', en: 'Facility Data Only' },
    capabilities: { ar: ['إدارة الأقسام', 'تقارير المستشفى'], en: ['Dept Management', 'Facility Reports'] },
  },
  {
    code: 'C',
    name: { ar: 'طبيب استشاري', en: 'Consultant' },
    tier: 'Clinical',
    privacyBoundary: { ar: 'السجلات الطبية المعينة', en: 'Assigned Medical Records' },
    capabilities: { ar: ['التشخيص', 'وصف الأدوية'], en: ['Diagnosis', 'Prescribing'] },
  },
  {
    code: 'N',
    name: { ar: 'ممرض/ة', en: 'Nurse' },
    tier: 'Clinical',
    privacyBoundary: { ar: 'العلامات الحيوية والملاحظات', en: 'Vitals & Notes' },
    capabilities: { ar: ['تسجيل العلامات', 'تنفيذ الأوامر'], en: ['Log Vitals', 'Execute Orders'] },
  },
  {
    code: 'D',
    name: { ar: 'طبيب', en: 'Doctor' },
    tier: 'Clinical',
    privacyBoundary: { ar: 'سجلات المرضى النشطة', en: 'Active Patient Records' },
    capabilities: { ar: ['الفحص السريري', 'الإحالات'], en: ['Clinical Exam', 'Referrals'] },
  },
  {
    code: 'K',
    name: { ar: 'أخصائي', en: 'Specialist' },
    tier: 'Clinical',
    privacyBoundary: { ar: 'بيانات التخصص الدقيق', en: 'Specialty Specific Data' },
    capabilities: { ar: ['التدخلات المتخصصة', 'الاستشارات'], en: ['Specialized Procedures', 'Consults'] },
  },
  {
    code: 'L',
    name: { ar: 'فني مختبر', en: 'Lab Tech' },
    tier: 'Ancillary',
    privacyBoundary: { ar: 'عينات المختبر والنتائج', en: 'Lab Samples & Results' },
    capabilities: { ar: ['تحليل العينات', 'إصدار النتائج'], en: ['Analyze Samples', 'Release Results'] },
  },
  {
    code: 'PH',
    name: { ar: 'صيدلي', en: 'Pharmacist' },
    tier: 'Ancillary',
    privacyBoundary: { ar: 'الوصفات الطبية والمخزون', en: 'Prescriptions & Inventory' },
    capabilities: { ar: ['صرف الأدوية', 'مراجعة التفاعلات'], en: ['Dispense Meds', 'Interaction Review'] },
  },
  {
    code: 'REC',
    name: { ar: 'موظف استقبال', en: 'Receptionist' },
    tier: 'Administrative',
    privacyBoundary: { ar: 'البيانات الديموغرافية والمواعيد', en: 'Demographics & Appointments' },
    capabilities: { ar: ['جدولة المواعيد', 'تسجيل المرضى'], en: ['Schedule Appts', 'Register Patients'] },
  },
  {
    code: 'P',
    name: { ar: 'مريض', en: 'Patient' },
    tier: 'Personal',
    privacyBoundary: { ar: 'السجل الشخصي فقط', en: 'Own Record Only' },
    capabilities: { ar: ['عرض التقارير', 'حجز موعد'], en: ['View Reports', 'Book Appointment'] },
  },
  {
    code: 'F',
    name: { ar: 'عائلة المريض', en: 'Family' },
    tier: 'Personal',
    privacyBoundary: { ar: 'سجل المريض المصرح به', en: 'Authorized Patient Record' },
    capabilities: { ar: ['متابعة الحالة', 'دفع الفواتير'], en: ['Track Status', 'Pay Bills'] },
  },
];

const TABS: { id: TabId; label: Record<Lang, string> }[] = [
  { id: 'roles', label: { ar: 'الأدوار والصلاحيات', en: 'Roles & Powers' } },
  { id: 'tenants', label: { ar: 'المستأجرين', en: 'Tenants' } },
  { id: 'staff', label: { ar: 'الموظفين المركزيين', en: 'Central Staff' } },
  { id: 'catalogs', label: { ar: 'الكتالوجات', en: 'Catalogs' } },
  { id: 'audit', label: { ar: 'سجلات التدقيق', en: 'Audit Logs' } },
];

// --- Sub-Components ---

interface ActAsLauncherProps {
  role: RoleDefinition;
  lang: Lang;
  onLaunch: (code: RoleCode) => void;
}

const ActAsLauncher: React.FC<ActAsLauncherProps> = ({ role, lang, onLaunch }) => {
  const isRtl = lang === 'ar';
  return (
    <button
      onClick={() => onLaunch(role.code)}
      aria-label={`${lang === 'ar' ? 'معاينة كـ' : 'Preview as'} ${role.name[lang]}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: PALETTE.whatsapp,
        color: PALETTE.white,
        border: 'none',
        borderRadius: '24px',
        fontFamily: isRtl ? 'Cairo, sans-serif' : 'system-ui, sans-serif',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.3)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {lang === 'ar' ? 'تقمص الدور' : 'Act As'}
    </button>
  );
};

interface RolesPowersTabProps {
  lang: Lang;
  onActAs: (code: RoleCode) => void;
}

export const SuperAdminRolesPowersTab: React.FC<RolesPowersTabProps> = ({ lang, onActAs }) => {
  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  return (
    <div dir={dir} style={{ fontFamily: isRtl ? 'Cairo, sans-serif' : 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: PALETTE.primary, fontSize: '24px', fontWeight: 800, margin: 0 }}>
          {lang === 'ar' ? 'مصفوفة الأدوار والصلاحيات' : 'Roles & Powers Matrix'}
        </h2>
        <p style={{ color: PALETTE.textLight, fontSize: '14px', marginTop: '8px' }}>
          {lang === 'ar' ? 'إدارة 11 دوراً مع حدود الخصوصية وقدرات الوصول.' : 'Manage 11 roles with privacy boundaries and access capabilities.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {ROLES_MATRIX.map((role) => (
          <article
            key={role.code}
            style={{
              backgroundColor: PALETTE.white,
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${PALETTE.border}`,
              boxShadow: '0 4px 6px -1px rgba(0, 123, 110, 0.05)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = PALETTE.secondary;
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 198, 174, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = PALETTE.border;
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 123, 110, 0.05)';
            }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    backgroundColor: PALETTE.background,
                    color: PALETTE.primary,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.5px'
                  }}>
                    {role.code}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: PALETTE.textDark }}>
                    {role.name[lang]}
                  </h3>
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: PALETTE.textLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: PALETTE.secondary, display: 'inline-block' }} />
                  {lang === 'ar' ? 'طبقة المستأجر:' : 'Tenant Tier:'} <strong>{role.tier}</strong>
                </div>
              </div>
            </header>

            <div style={{
              backgroundColor: PALETTE.background,
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              color: PALETTE.primary,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {role.privacyBoundary[lang]}
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: PALETTE.textLight, margin: '0 0 10px 0', fontWeight: 700, letterSpacing: '1px' }}>
                {lang === 'ar' ? 'القدرات المسموحة' : 'Allowed Capabilities'}
              </h4>
              <ul style={{ margin: 0, padding: isRtl ? '0 20px 0 0' : '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {role.capabilities[lang].map((cap, idx) => (
                  <li key={idx} style={{ fontSize: '13px', color: PALETTE.textDark, lineHeight: 1.5 }}>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>

            <footer style={{ borderTop: `1px solid ${PALETTE.border}`, paddingTop: '16px', marginTop: 'auto' }}>
              <ActAsLauncher role={role} lang={lang} onLaunch={onActAs} />
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
};

// --- Main Portal View ---

interface SuperAdminPortalViewProps {
  initialLang?: Lang;
  personaProfileSwitcher?: React.ReactNode;
}

export const SuperAdminPortalView: React.FC<SuperAdminPortalViewProps> = ({
  initialLang = 'ar',
  personaProfileSwitcher
}) => {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [activeTab, setActiveTab] = useState<TabId>('roles');
  const [actAsRole, setActAsRole] = useState<RoleCode | null>(null);

  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  const handleActAs = useCallback((code: RoleCode) => {
    setActAsRole(code);
    // In production, this would trigger a context switch or open a preview modal
    console.log(`[ALO DOCTOR v2.4] Launching Act-As Preview for role: ${code}`);
  }, []);

  const clearActAs = useCallback(() => {
    setActAsRole(null);
  }, []);

  const activeRoleName = useMemo(() => {
    if (!actAsRole) return '';
    return ROLES_MATRIX.find(r => r.code === actAsRole)?.name[lang] || actAsRole;
  }, [actAsRole, lang]);

  return (
    <div
      dir={dir}
      style={{
        minHeight: '100vh',
        backgroundColor: PALETTE.background,
        fontFamily: isRtl ? 'Cairo, sans-serif' : 'system-ui, sans-serif',
        color: PALETTE.textDark,
        padding: '24px',
      }}
    >
      {/* Top Bar */}
      <header style={{
        maxWidth: '1400px',
        margin: '0 auto 32px auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: PALETTE.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: PALETTE.white,
            fontWeight: 900,
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(0, 123, 110, 0.2)'
          }}>
            A
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: PALETTE.primary }}>
              {lang === 'ar' ? 'بوابة المدير الأعلى' : 'Super Admin Portal'}
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: PALETTE.textLight, fontWeight: 600 }}>
              ALO DOCTOR v2.4 Saudi Edition
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {personaProfileSwitcher && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {personaProfileSwitcher}
            </div>
          )}
          
          {/* Clean Language Toggle */}
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            aria-label="Toggle Language"
            style={{
              backgroundColor: PALETTE.white,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              color: PALETTE.primary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </header>

      {/* Act-As Banner */}
      {actAsRole && (
        <div
          role="alert"
          style={{
            maxWidth: '1400px',
            margin: '0 auto 24px auto',
            backgroundColor: PALETTE.whatsapp,
            color: PALETTE.white,
            padding: '12px 24px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {lang === 'ar' ? `أنت الآن تعاين كـ: ${activeRoleName}` : `You are currently previewing as: ${activeRoleName}`}
          </span>
          <button
            onClick={clearActAs}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: PALETTE.white,
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '12px'
            }}
          >
            {lang === 'ar' ? 'إنهاء المعاينة' : 'Exit Preview'}
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav
        aria-label={lang === 'ar' ? 'التنقل في بوابة الإدارة' : 'Admin Portal Navigation'}
        style={{
          maxWidth: '1400px',
          margin: '0 auto 32px auto',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isActive ? PALETTE.primary : PALETTE.white,
                color: isActive ? PALETTE.white : PALETTE.textLight,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 12px rgba(0, 123, 110, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                fontFamily: 'inherit'
              }}
            >
              {tab.label[lang]}
            </button>
          );
        })}
      </nav>

      {/* Content Area */}
      <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'roles' && (
          <SuperAdminRolesPowersTab lang={lang} onActAs={handleActAs} />
        )}

        {activeTab === 'tenants' && (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: PALETTE.white, borderRadius: '16px', border: `1px solid ${PALETTE.border}` }}>
            <h3 style={{ color: PALETTE.primary }}>{lang === 'ar' ? 'إدارة المستأجرين' : 'Tenants Management'}</h3>
            <p style={{ color: PALETTE.textLight }}>{lang === 'ar' ? 'وحدة نمطية قيد التطوير.' : 'Modular unit under development.'}</p>
          </div>
        )}

        {activeTab === 'staff' && (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: PALETTE.white, borderRadius: '16px', border: `1px solid ${PALETTE.border}` }}>
            <h3 style={{ color: PALETTE.primary }}>{lang === 'ar' ? 'الموظفين المركزيين' : 'Central Staff'}</h3>
            <p style={{ color: PALETTE.textLight }}>{lang === 'ar' ? 'وحدة نمطية قيد التطوير.' : 'Modular unit under development.'}</p>
          </div>
        )}

        {activeTab === 'catalogs' && (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: PALETTE.white, borderRadius: '16px', border: `1px solid ${PALETTE.border}` }}>
            <h3 style={{ color: PALETTE.primary }}>{lang === 'ar' ? 'الكتالوجات الطبية' : 'Medical Catalogs'}</h3>
            <p style={{ color: PALETTE.textLight }}>{lang === 'ar' ? 'وحدة نمطية قيد التطوير.' : 'Modular unit under development.'}</p>
          </div>
        )}

        {activeTab === 'audit' && (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: PALETTE.white, borderRadius: '16px', border: `1px solid ${PALETTE.border}` }}>
            <h3 style={{ color: PALETTE.primary }}>{lang === 'ar' ? 'سجلات التدقيق والأمان' : 'Audit & Security Logs'}</h3>
            <p style={{ color: PALETTE.textLight }}>{lang === 'ar' ? 'وحدة نمطية قيد التطوير.' : 'Modular unit under development.'}</p>
          </div>
        )}
      </main>

      {/* Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
      `}} />
    </div>
  );
};

export default SuperAdminPortalView;
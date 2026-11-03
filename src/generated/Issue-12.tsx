import React, { useState, useEffect } from 'react';

interface PersonaProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  orgAr: string;
  orgEn: string;
  compactLabelEn: string;
  compactLabelAr: string;
  scopeAr: string;
  scopeEn: string;
}

const PERSONAS: PersonaProfile[] = [
  {
    id: 'P',
    nameAr: 'سالم',
    nameEn: 'Salem',
    roleAr: 'مريض',
    roleEn: 'Patient',
    orgAr: 'نظام ألو دكتور',
    orgEn: 'ALO DOCTOR System',
    compactLabelEn: 'Patient',
    compactLabelAr: 'سالم',
    scopeAr: 'إدارة المواعيد، السجلات الصحية، التواصل مع مقدمي الرعاية',
    scopeEn: 'Manage appointments, health records, and provider communication'
  },
  {
    id: 'F',
    nameAr: 'فاطمة',
    nameEn: 'Fatima',
    roleAr: 'مقدمة رعاية',
    roleEn: 'Caregiver',
    orgAr: 'أسرة المريض',
    orgEn: 'Patient Family',
    compactLabelEn: 'Caregiver',
    compactLabelAr: 'فاطمة',
    scopeAr: 'متابعة حالة المريض، إدارة الأدوية، التنسيق مع الفريق الطبي',
    scopeEn: 'Monitor patient status, manage medications, coordinate with care team'
  },
  {
    id: 'N',
    nameAr: 'سارة',
    nameEn: 'Sara',
    roleAr: 'ممرضة',
    roleEn: 'Nurse',
    orgAr: 'وزارة الصحة السعودية',
    orgEn: 'Saudi MOH',
    compactLabelEn: 'Nurse',
    compactLabelAr: 'سارة',
    scopeAr: 'تقييم العلامات الحيوية، تنفيذ خطط الرعاية، توثيق التمريض',
    scopeEn: 'Vitals assessment, care plan execution, nursing documentation'
  },
  {
    id: 'D',
    nameAr: 'د. عبدالله',
    nameEn: 'Dr. Abdullah',
    roleAr: 'طبيب سعودي',
    roleEn: 'Saudi Doctor',
    orgAr: 'مستشفى الملك فيصل التخصصي',
    orgEn: 'King Faisal Specialist Hospital',
    compactLabelEn: 'Doctor',
    compactLabelAr: 'عبدالله',
    scopeAr: 'التشخيص السريري، وصف الأدوية، إدارة الحالات الطبية',
    scopeEn: 'Clinical diagnosis, prescribing, medical case management'
  },
  {
    id: 'K',
    nameAr: 'د. أرجون',
    nameEn: 'Dr. Arjun',
    roleAr: 'استشاري',
    roleEn: 'Consultant',
    orgAr: 'الاستشارات الدولية',
    orgEn: 'International Consults',
    compactLabelEn: 'Consult',
    compactLabelAr: 'أرجون',
    scopeAr: 'الاستشارات المتخصصة، الرأي الطبي الثاني، الإحالات المعقدة',
    scopeEn: 'Specialist consults, second opinions, complex referrals'
  },
  {
    id: 'L',
    nameAr: 'مختبرات ألفا',
    nameEn: 'Alpha Labs',
    roleAr: 'مختبر',
    roleEn: 'Laboratory',
    orgAr: 'مختبرات ألفا التشخيصية',
    orgEn: 'Alpha Diagnostics',
    compactLabelEn: 'Labs',
    compactLabelAr: 'ألفا',
    scopeAr: 'تحليل العينات، إصدار النتائج المخبرية، مراقبة الجودة',
    scopeEn: 'Sample analysis, lab results issuance, quality control'
  },
  {
    id: 'H',
    nameAr: 'سند',
    nameEn: 'Sanad',
    roleAr: 'رعاية منزلية',
    roleEn: 'Home Care',
    orgAr: 'خدمات سند للرعاية المنزلية',
    orgEn: 'Sanad Home Services',
    compactLabelEn: 'Home',
    compactLabelAr: 'سند',
    scopeAr: 'الرعاية المنزلية، متابعة ما بعد الخروج، إعادة التأهيل',
    scopeEn: 'Home care visits, post-discharge follow-up, rehabilitation'
  },
  {
    id: 'T',
    nameAr: 'السفر الطبي',
    nameEn: 'Medical Travel',
    roleAr: 'منسق سفر طبي',
    roleEn: 'Travel Coordinator',
    orgAr: 'وكالة السفر الطبي',
    orgEn: 'Medical Travel Agency',
    compactLabelEn: 'Travel',
    compactLabelAr: 'سفر',
    scopeAr: 'تنسيق السفر العلاجي، الترتيبات اللوجستية، التأشيرات الطبية',
    scopeEn: 'Treatment travel coordination, logistics, medical visas'
  },
  {
    id: 'V',
    nameAr: 'التأمين',
    nameEn: 'Insurance',
    roleAr: 'مسؤول تأمين',
    roleEn: 'Insurance Officer',
    orgAr: 'شركة بوبا العربية',
    orgEn: 'Bupa Arabia',
    compactLabelEn: 'Insure',
    compactLabelAr: 'تأمين',
    scopeAr: 'الموافقات المسبقة، التحقق من التغطية، معالجة المطالبات',
    scopeEn: 'Pre-authorizations, coverage verification, claims processing'
  },
  {
    id: 'HA',
    nameAr: 'إدارة المستشفى',
    nameEn: 'Hospital Admin',
    roleAr: 'مدير مستشفى',
    roleEn: 'Hospital Admin',
    orgAr: 'إدارة المنشأة الصحية',
    orgEn: 'Health Facility Management',
    compactLabelEn: 'Admin',
    compactLabelAr: 'إدارة',
    scopeAr: 'إدارة العمليات، تخصيص الموارد، التقارير التشغيلية',
    scopeEn: 'Operations management, resource allocation, operational reports'
  },
  {
    id: 'AD',
    nameAr: 'المدير العام',
    nameEn: 'Super Admin',
    roleAr: 'مدير النظام',
    roleEn: 'Super Admin',
    orgAr: 'نظام ألو دكتور المركزي',
    orgEn: 'ALO DOCTOR Central',
    compactLabelEn: 'Super',
    compactLabelAr: 'نظام',
    scopeAr: 'صلاحيات كاملة، إعدادات النظام، إدارة المستخدمين والتكاملات',
    scopeEn: 'Full privileges, system settings, user & integration management'
  }
];

interface TopProfileSwitcherProps {
  lang: 'ar' | 'en';
  activePersonaId?: string;
  onPersonaChange?: (personaId: string) => void;
}

const TopProfileSwitcher: React.FC<TopProfileSwitcherProps> = ({
  lang = 'ar',
  activePersonaId = 'P',
  onPersonaChange
}) => {
  const [activeId, setActiveId] = useState<string>(activePersonaId);
  const isRtl = lang === 'ar';

  useEffect(() => {
    setActiveId(activePersonaId);
  }, [activePersonaId]);

  const handleSwitch = (id: string) => {
    setActiveId(id);
    if (onPersonaChange) {
      onPersonaChange(id);
    }
  };

  const activePersona = PERSONAS.find(p => p.id === activeId) || PERSONAS[0];

  const tooltipText = (p: PersonaProfile) => {
    if (isRtl) {
      return `${p.nameAr} — ${p.roleAr} — ${p.orgAr}`;
    }
    return `${p.nameEn} — ${p.roleEn} — ${p.orgEn}`;
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isRtl ? "'Cairo', sans-serif" : "'Inter', 'Cairo', sans-serif",
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E6FAF7',
        boxShadow: '0 2px 8px rgba(0, 123, 110, 0.04)'
      }}
    >
      {/* Role Switcher Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 16px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="hide-scrollbar"
      >
        {PERSONAS.map((persona) => {
          const isActive = persona.id === activeId;
          const label = isRtl ? persona.compactLabelAr : persona.compactLabelEn;

          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => handleSwitch(persona.id)}
              title={tooltipText(persona)}
              aria-label={tooltipText(persona)}
              aria-pressed={isActive}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 14px',
                borderRadius: '20px',
                border: isActive ? '2px solid #007B6E' : '1px solid #E6FAF7',
                backgroundColor: isActive ? '#007B6E' : '#E6FAF7',
                color: isActive ? '#FFFFFF' : '#007B6E',
                fontSize: isRtl ? '13px' : '12px',
                fontWeight: isActive ? 700 : 500,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                letterSpacing: isRtl ? '0' : '0.02em',
                outline: 'none',
                minWidth: '48px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#00C6AE';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#00C6AE';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#E6FAF7';
                  e.currentTarget.style.color = '#007B6E';
                  e.currentTarget.style.borderColor = '#E6FAF7';
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 198, 174, 0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Active Role Explainer Banner */}
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          backgroundColor: '#E6FAF7',
          borderTop: '1px solid rgba(0, 198, 174, 0.2)',
          minHeight: '40px'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#25D366',
            flexShrink: 0,
            boxShadow: '0 0 6px rgba(37, 211, 102, 0.5)'
          }}
          aria-hidden="true"
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            flex: 1,
            minWidth: 0
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#007B6E',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {isRtl
              ? `النشط: ${activePersona.nameAr} (${activePersona.roleAr})`
              : `Active: ${activePersona.nameEn} (${activePersona.roleEn})`}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 400,
              color: '#007B6E',
              opacity: 0.75,
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {isRtl ? activePersona.scopeAr : activePersona.scopeEn}
          </span>
        </div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#00C6AE',
            backgroundColor: '#FFFFFF',
            padding: '2px 8px',
            borderRadius: '10px',
            border: '1px solid #00C6AE',
            flexShrink: 0,
            letterSpacing: isRtl ? '0' : '0.05em',
            textTransform: 'uppercase'
          }}
        >
          {activePersona.id}
        </span>
      </div>

      {/* Inline styles for scrollbar hiding */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 640px) {
          button[aria-pressed] {
            padding: 5px 10px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TopProfileSwitcher;
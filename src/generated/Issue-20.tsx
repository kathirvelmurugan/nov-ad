import React, { useMemo } from 'react';
import { Persona, ClinicalCase } from '../types';

interface Props {
  activePersona: Persona;
  onSelectPersona: (p: Persona) => void;
  activeCase: ClinicalCase;
  onNextCase: () => void;
  onSelectCase: (id: string) => void;
  cases: ClinicalCase[];
  onAutoFill: () => void;
  onResetDemo: () => void;
  onOpenGuide: () => void;
  onStartAutoDemo: () => void;
  onOpenPipelineBoard: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const CLEAN_PERSONAS: Persona[] = ['P', 'N', 'D', 'C', 'K'];

const PERSONA_LABELS: Record<Persona, { ar: string; en: string }> = {
  P: { ar: 'المريض', en: 'Patient' },
  N: { ar: 'ممرضة ألو', en: 'ALO Nurse' },
  D: { ar: 'الطبيب السعودي المعالج', en: 'Saudi Treating Doctor' },
  C: { ar: 'منسق رعاية ألو', en: 'ALO Coordinator' },
  K: { ar: 'الاستشاري الهندي', en: 'Indian Consultant' },
};

const TopProfileSwitcher: React.FC<Props> = ({
  activePersona,
  onSelectPersona,
  activeCase,
  onNextCase,
  onSelectCase,
  cases,
  onAutoFill,
  onResetDemo,
  onOpenGuide,
  onStartAutoDemo,
  onOpenPipelineBoard,
  lang,
  onToggleLang,
  theme = 'light',
  onToggleTheme,
}) => {
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  const fontFamily = isRtl
    ? "'Cairo', sans-serif"
    : "'Inter', system-ui, -apple-system, sans-serif";

  const getPersonaLabel = (p: Persona): string => {
    if (p === 'K') {
      return isRtl
        ? 'الاستشاري الهندي (د. أرجون)'
        : 'Indian consultant (Dr. Arjun Mehta)';
    }
    return isRtl ? PERSONA_LABELS[p].ar : PERSONA_LABELS[p].en;
  };

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px 20px',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderBottom: `2px solid ${isDark ? '#1e293b' : '#E6FAF7'}`,
      direction: isRtl ? 'rtl' : 'ltr',
      fontFamily,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }),
    [isDark, isRtl, fontFamily]
  );

  const rowStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '8px',
    }),
    []
  );

  const pillBaseStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 16px',
      borderRadius: '9999px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      whiteSpace: 'nowrap',
      fontFamily,
      userSelect: 'none',
    }),
    [fontFamily]
  );

  const getPillStyle = (p: Persona): React.CSSProperties => {
    const isActive = activePersona === p;
    const isConsultant = p === 'K';

    if (isActive) {
      return {
        ...pillBaseStyle,
        backgroundColor: isConsultant ? '#25D366' : '#007B6E',
        color: '#ffffff',
        boxShadow: isConsultant
          ? '0 4px 14px rgba(37, 211, 102, 0.35)'
          : '0 4px 14px rgba(0, 123, 110, 0.35)',
        transform: 'translateY(-1px)',
      };
    }

    return {
      ...pillBaseStyle,
      backgroundColor: isDark ? '#1e293b' : '#E6FAF7',
      color: isDark ? '#94a3b8' : '#007B6E',
      boxShadow: 'none',
      transform: 'translateY(0)',
    };
  };

  const actionBtnStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      border: `1px solid ${isDark ? '#334155' : '#00C6AE'}`,
      backgroundColor: 'transparent',
      color: isDark ? '#00C6AE' : '#007B6E',
      fontFamily,
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
    }),
    [isDark, fontFamily]
  );

  const selectStyle: React.CSSProperties = useMemo(
    () => ({
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 500,
      border: `1px solid ${isDark ? '#334155' : '#00C6AE'}`,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#007B6E',
      fontFamily,
      cursor: 'pointer',
      outline: 'none',
      direction: isRtl ? 'rtl' : 'ltr',
    }),
    [isDark, isRtl, fontFamily]
  );

  const dividerStyle: React.CSSProperties = useMemo(
    () => ({
      width: '1px',
      height: '24px',
      backgroundColor: isDark ? '#334155' : '#00C6AE',
      opacity: 0.4,
      margin: '0 4px',
    }),
    [isDark]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, p: Persona) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectPersona(p);
    }
  };

  return (
    <div style={containerStyle} role="toolbar" aria-label="ALO Doctor Profile Switcher">
      {/* Persona Pills Row */}
      <div style={rowStyle} role="tablist" aria-label="Persona Selection">
        {CLEAN_PERSONAS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={activePersona === p}
            aria-label={getPersonaLabel(p)}
            style={getPillStyle(p)}
            onClick={() => onSelectPersona(p)}
            onKeyDown={(e) => handleKeyDown(e, p)}
            onMouseEnter={(e) => {
              if (activePersona !== p) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00C6AE';
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (activePersona !== p) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                  ? '#1e293b'
                  : '#E6FAF7';
                (e.currentTarget as HTMLButtonElement).style.color = isDark
                  ? '#94a3b8'
                  : '#007B6E';
              }
            }}
          >
            {getPersonaLabel(p)}
          </button>
        ))}
      </div>

      {/* Controls Row */}
      <div style={{ ...rowStyle, marginTop: '4px' }}>
        {/* Case Selector */}
        <select
          style={selectStyle}
          value={activeCase?.id || ''}
          onChange={(e) => onSelectCase(e.target.value)}
          aria-label={isRtl ? 'اختر الحالة السريرية' : 'Select Clinical Case'}
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {isRtl ? c.titleAr || c.title : c.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          style={actionBtnStyle}
          onClick={onNextCase}
          aria-label={isRtl ? 'الحالة التالية' : 'Next Case'}
        >
          {isRtl ? 'التالي ←' : '→ Next'}
        </button>

        <div style={dividerStyle} aria-hidden="true" />

        <button
          type="button"
          style={actionBtnStyle}
          onClick={onAutoFill}
          aria-label={isRtl ? 'تعبئة تلقائية' : 'Auto Fill'}
        >
          {isRtl ? 'تعبئة تلقائية' : 'Auto Fill'}
        </button>

        <button
          type="button"
          style={actionBtnStyle}
          onClick={onStartAutoDemo}
          aria-label={isRtl ? 'تشغيل العرض التلقائي' : 'Start Auto Demo'}
        >
          {isRtl ? 'عرض تلقائي' : 'Auto Demo'}
        </button>

        <button
          type="button"
          style={actionBtnStyle}
          onClick={onResetDemo}
          aria-label={isRtl ? 'إعادة تعيين' : 'Reset Demo'}
        >
          {isRtl ? 'إعادة تعيين' : 'Reset'}
        </button>

        <div style={dividerStyle} aria-hidden="true" />

        <button
          type="button"
          style={actionBtnStyle}
          onClick={onOpenGuide}
          aria-label={isRtl ? 'فتح الدليل' : 'Open Guide'}
        >
          {isRtl ? 'الدليل' : 'Guide'}
        </button>

        <button
          type="button"
          style={actionBtnStyle}
          onClick={onOpenPipelineBoard}
          aria-label={isRtl ? 'لوحة العمليات' : 'Pipeline Board'}
        >
          {isRtl ? 'لوحة العمليات' : 'Pipeline'}
        </button>

        <div style={{ flex: 1 }} />

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            style={{
              ...actionBtnStyle,
              borderColor: isDark ? '#475569' : '#cbd5e1',
              color: isDark ? '#e2e8f0' : '#475569',
            }}
            onClick={onToggleTheme}
            aria-label={isRtl ? 'تبديل المظهر' : 'Toggle Theme'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        )}

        {/* Language Toggle */}
        <button
          type="button"
          style={{
            ...actionBtnStyle,
            backgroundColor: '#007B6E',
            color: '#ffffff',
            borderColor: '#007B6E',
            fontWeight: 700,
          }}
          onClick={onToggleLang}
          aria-label={isRtl ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          {isRtl ? 'EN' : 'عربي'}
        </button>
      </div>
    </div>
  );
};

export default TopProfileSwitcher;
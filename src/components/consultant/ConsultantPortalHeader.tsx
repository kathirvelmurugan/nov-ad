import React from 'react';

export interface ConsultantPortalHeaderProps {
  activeCase: any;
  validCases: any[];
  isCaseClosed: boolean;
  tealPrimary: string;
  onSelectCase?: (caseId: string) => void;
}

const ConsultantPortalHeader: React.FC<ConsultantPortalHeaderProps> = ({
  activeCase,
  validCases,
  isCaseClosed,
  tealPrimary,
  onSelectCase,
}) => {
  const dir = document.documentElement.dir || 'ltr';
  const isRtl = dir === 'rtl';

  return (
    <header
      style={{
        direction: isRtl ? 'rtl' : 'ltr',
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: '#E6FAF7',
        borderBottom: `2px solid ${tealPrimary}`,
        padding: '16px 24px',
        borderRadius: '8px 8px 0 0',
      }}
      role="banner"
      aria-label={isRtl ? 'رأس بوابة الاستشاري الهندي' : 'Indian Consultant Portal Header'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: tealPrimary }}>
          {isRtl ? 'بوابة الاستشاري السريري الهندي' : 'Indian Consultant Clinical Portal'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeCase?.id && (
            <span style={{ fontSize: '0.875rem', color: '#333', fontWeight: 600 }}>
              {isRtl ? 'رقم الحالة:' : 'Case Ref:'} {activeCase.id}
            </span>
          )}
          {isCaseClosed && (
            <span
              style={{
                backgroundColor: '#007B6E',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
              role="status"
              aria-live="polite"
            >
              {isRtl ? 'أرشيف دائم' : 'Permanent Archive'}
            </span>
          )}
        </div>
      </div>

      {validCases.length > 0 && (
        <nav
          aria-label={isRtl ? 'تبديل الحالات' : 'Case Switcher'}
          style={{
            marginTop: '16px',
            display: 'flex',
            overflowX: 'auto',
            gap: '8px',
            paddingBottom: '4px',
            scrollbarWidth: 'thin',
            scrollbarColor: `${tealPrimary} #E6FAF7`,
          }}
        >
          {validCases.map((c) => {
            const isActive = c.id === activeCase?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCase?.(c.id)}
                disabled={isCaseClosed}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  flexShrink: 0,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: `1px solid ${isActive ? tealPrimary : '#00C6AE'}`,
                  backgroundColor: isActive ? tealPrimary : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : tealPrimary,
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: isCaseClosed ? 'not-allowed' : 'pointer',
                  opacity: isCaseClosed && !isActive ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
              >
                {c.title || c.id}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};

export default ConsultantPortalHeader;
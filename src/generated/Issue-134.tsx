import React, { useState, useEffect, useCallback } from 'react';

interface ApiErrorDetail {
  endpoint: string;
  status: number | string;
  message: string;
}

const ApiErrorModal: React.FC = () => {
  const [errorDetail, setErrorDetail] = useState<ApiErrorDetail | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<'ar' | 'en'>('ar');
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: 'ar' | 'en' }>;
      if (customEvent.detail?.lang) {
        setCurrentLang(customEvent.detail.lang);
      } else {
        const dir = document.documentElement.getAttribute('dir');
        setCurrentLang(dir === 'rtl' ? 'ar' : 'en');
      }
    };

    const handleApiError = (e: Event) => {
      const customEvent = e as CustomEvent<ApiErrorDetail>;
      if (customEvent.detail) {
        setErrorDetail({
          endpoint: customEvent.detail.endpoint || 'Unknown Endpoint',
          status: customEvent.detail.status || 'NetworkError',
          message: customEvent.detail.message || 'Connection failed after 1-shot retry.'
        });
      }
    };

    handleThemeChange();
    const dir = document.documentElement.getAttribute('dir');
    if (dir) setCurrentLang(dir === 'rtl' ? 'ar' : 'en');

    window.addEventListener('alo:api-error', handleApiError);
    window.addEventListener('theme-change', handleThemeChange);
    window.addEventListener('alo:lang-change', handleLangChange);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') handleThemeChange();
        if (mutation.attributeName === 'dir') {
          const newDir = document.documentElement.getAttribute('dir');
          setCurrentLang(newDir === 'rtl' ? 'ar' : 'en');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener('alo:api-error', handleApiError);
      window.removeEventListener('theme-change', handleThemeChange);
      window.removeEventListener('alo:lang-change', handleLangChange);
      observer.disconnect();
    };
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleCheckStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      await fetch('/api/health', { method: 'GET', cache: 'no-store' });
      window.location.reload();
    } catch {
      // Remain halted if health check fails
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  if (!errorDetail) return null;

  const isRtl = currentLang === 'ar';

  const palette = {
    tealPrimary: '#007B6E',
    tealSecondary: '#00C6AE',
    tealLight: '#E6FAF7',
    whatsappGreen: '#25D366',
    warningRose: '#E11D48',
    warningAmber: '#F59E0B',
  };

  const theme = {
    backdrop: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(230, 250, 247, 0.8)',
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#475569',
    border: isDarkMode ? '#1E293B' : palette.tealLight,
    badgeBg: isDarkMode ? 'rgba(225, 29, 72, 0.15)' : 'rgba(225, 29, 72, 0.1)',
    badgeText: palette.warningRose,
    codeBg: isDarkMode ? '#1E293B' : palette.tealLight,
  };

  const copy = {
    title: isRtl ? 'خطأ في الاتصال بالخادم السريري' : 'Clinical Backend Server Unreachable',
    bodyIntegrity: isRtl 
      ? 'تم حماية سلامة البيانات السريرية الخاصة بك. وفقاً لامتثال وزارة الصحة السعودية، تم تعطيل الوضع الوهمي غير المتصل بالشبكة لمنع أي تلف في السجلات الطبية.'
      : 'Your clinical data integrity is fully protected. In strict compliance with Saudi MOH regulations, offline fake mode has been disabled to prevent any medical record corruption.',
    bodyAction: isRtl
      ? 'فشل الاتصال بعد محاولة إعادة المحاولة التلقائية. يرجى التحقق من شبكتك أو الاتصال بفريق الدعم الفني السريري.'
      : 'Connection failed after the automatic 1-shot retry. Please verify your network or contact the clinical support team.',
    endpointLabel: isRtl ? 'نقطة النهاية الفاشلة:' : 'Failed Endpoint:',
    statusLabel: isRtl ? 'حالة HTTP:' : 'HTTP Status:',
    retryBtn: isRtl ? 'إعادة المحاولة' : 'Retry Connection',
    checkBtn: isRtl ? 'التحقق من حالة الاتصال' : 'Check Status',
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alo-api-error-title"
      aria-describedby="alo-api-error-desc"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: theme.backdrop,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        fontFamily: '"Cairo", system-ui, -apple-system, sans-serif',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: theme.modalBg,
          borderRadius: '1.25rem',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${theme.border}`,
          overflow: 'hidden',
          animation: 'alo-modal-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Warning Header Accent */}
        <div
          style={{
            height: '6px',
            background: `linear-gradient(90deg, ${palette.warningRose}, ${palette.warningAmber})`,
            width: '100%',
          }}
        />

        <div style={{ padding: '2rem' }}>
          {/* Icon & Title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: theme.badgeBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={palette.warningRose} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2
              id="alo-api-error-title"
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 800,
                color: theme.textPrimary,
                lineHeight: 1.3,
              }}
            >
              {copy.title}
            </h2>
          </div>

          {/* Error Metadata Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                backgroundColor: theme.codeBg,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <span style={{ color: palette.tealPrimary }}>{copy.endpointLabel}</span>
              <code style={{ fontFamily: 'monospace', color: theme.textPrimary, direction: 'ltr' }}>
                {errorDetail.endpoint}
              </code>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                backgroundColor: theme.badgeBg,
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: theme.badgeText,
                border: `1px solid ${palette.warningRose}33`,
              }}
            >
              <span>{copy.statusLabel}</span>
              <span style={{ fontFamily: 'monospace' }}>{errorDetail.status}</span>
            </div>
          </div>

          {/* Body Text */}
          <div id="alo-api-error-desc" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <p
              style={{
                margin: '0 0 1rem 0',
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: theme.textSecondary,
                fontWeight: 500,
              }}
            >
              {copy.bodyIntegrity}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: theme.textSecondary,
                opacity: 0.8,
              }}
            >
              {copy.bodyAction}
            </p>
            {errorDetail.message && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: theme.codeBg,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: theme.textSecondary,
                  wordBreak: 'break-all',
                  direction: 'ltr',
                  textAlign: 'left',
                }}
              >
                {errorDetail.message}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={handleRetry}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                backgroundColor: palette.tealPrimary,
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: '"Cairo", system-ui, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: `0 4px 14px 0 ${palette.tealPrimary}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = palette.tealSecondary;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = palette.tealPrimary;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {copy.retryBtn}
            </button>

            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                borderRadius: '0.75rem',
                border: `2px solid ${theme.border}`,
                backgroundColor: 'transparent',
                color: theme.textPrimary,
                fontSize: '0.9375rem',
                fontWeight: 700,
                fontFamily: '"Cairo", system-ui, sans-serif',
                cursor: isCheckingStatus ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                opacity: isCheckingStatus ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isCheckingStatus) {
                  e.currentTarget.style.borderColor = palette.tealPrimary;
                  e.currentTarget.style.color = palette.tealPrimary;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.color = theme.textPrimary;
              }}
            >
              {isCheckingStatus ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              )}
              {copy.checkBtn}
            </button>
          </div>
        </div>

        {/* Footer Compliance Badge */}
        <div
          style={{
            padding: '1rem 2rem',
            backgroundColor: isDarkMode ? 'rgba(0, 123, 110, 0.1)' : palette.tealLight,
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={palette.tealPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: palette.tealPrimary,
              letterSpacing: '0.02em',
            }}
          >
            {isRtl ? 'متوافق مع أنظمة وزارة الصحة السعودية' : 'Saudi MOH Compliant System'}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes alo-modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        button:focus-visible {
          outline: 3px solid ${palette.tealSecondary};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default ApiErrorModal;
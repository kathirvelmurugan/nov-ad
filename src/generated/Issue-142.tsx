import React, { useState, useEffect, useCallback } from 'react';

interface ConsultantMagicLinkStepProps {
  token?: string | null;
  magic_token?: string | null;
  caseId?: string | null;
  onAuthSuccess?: (session: ConsultantSession) => void;
  personaId?: string;
}

interface ConsultantSession {
  name: string;
  role: string;
  phone: string;
  caseId: string;
  authenticatedAt: string;
}

interface CaseRecord {
  id: string;
  consultantToken?: string;
  magicToken?: string;
  status: string;
}

const CONSULTANT_PROFILE = {
  nameEn: 'Dr. V. Prasanth',
  nameAr: 'د. ف. براسانث',
  role: 'K',
  phone: '+919876543210',
};

const COORDINATOR_WHATSAPP = '966500000000';

const apiClient = {
  fetchCases: async (): Promise<CaseRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'CASE-001', consultantToken: 'valid-token-123', magicToken: 'magic-456', status: 'ACTIVE' },
          { id: 'CASE-002', consultantToken: 'expired-token-789', magicToken: 'magic-012', status: 'EXPIRED' },
        ]);
      }, 1200);
    });
  },
};

const ConsultantMagicLinkStep: React.FC<ConsultantMagicLinkStepProps> = ({
  token,
  magic_token,
  caseId,
  onAuthSuccess,
  personaId = 'default',
}) => {
  const [isRtl, setIsRtl] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [matchedCaseId, setMatchedCaseId] = useState<string>('');

  useEffect(() => {
    const htmlDir = document.documentElement.getAttribute('dir');
    const lang = document.documentElement.getAttribute('lang');
    setIsRtl(htmlDir === 'rtl' || lang === 'ar');
  }, [personaId]);

  const validateToken = useCallback(async () => {
    if (!token && !magic_token && !caseId) {
      setIsLoading(false);
      setError(isRtl ? 'رابط غير صالح أو مفقود' : 'Invalid or missing link parameters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cases = await apiClient.fetchCases();
      
      const matchedCase = cases.find((c) => {
        const matchesCaseId = caseId && c.id === caseId;
        const matchesToken = token && (c.consultantToken === token || c.magicToken === token);
        const matchesMagic = magic_token && (c.magicToken === magic_token || c.consultantToken === magic_token);
        
        return (matchesCaseId || matchesToken || matchesMagic) && c.status !== 'EXPIRED';
      });

      if (matchedCase) {
        setIsValid(true);
        setMatchedCaseId(matchedCase.id);
        
        const session: ConsultantSession = {
          name: CONSULTANT_PROFILE.nameEn,
          role: CONSULTANT_PROFILE.role,
          phone: CONSULTANT_PROFILE.phone,
          caseId: matchedCase.id,
          authenticatedAt: new Date().toISOString(),
        };

        if (onAuthSuccess) {
          onAuthSuccess(session);
        }
      } else {
        setIsValid(false);
        setError(
          isRtl
            ? 'انتهت صلاحية الرابط أو أنه غير صالح. يرجى التواصل مع المنسق.'
            : 'Token expired or invalid. Please contact the coordinator.'
        );
      }
    } catch (err) {
      setIsValid(false);
      setError(
        isRtl
          ? 'حدث خطأ أثناء التحقق من الرابط. حاول مرة أخرى.'
          : 'An error occurred while validating the token. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, magic_token, caseId, isRtl, onAuthSuccess]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const whatsappLink = `https://wa.me/${COORDINATOR_WHATSAPP}?text=${encodeURIComponent(
    isRtl
      ? `مرحباً، أحتاج مساعدة في رابط الاستشارة لحالة ${caseId || ''}`
      : `Hello, I need assistance with the consultation link for case ${caseId || ''}`
  )}`;

  const styles: Record<string, React.CSSProperties> = {
    container: {
      direction: isRtl ? 'rtl' : 'ltr',
      fontFamily: "'Cairo', sans-serif",
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E6FAF7',
      padding: '24px',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 123, 110, 0.12)',
      padding: '40px',
      maxWidth: '520px',
      width: '100%',
      textAlign: 'center',
      border: '1px solid #00C6AE',
    },
    logo: {
      color: '#007B6E',
      fontSize: '28px',
      fontWeight: 800,
      marginBottom: '8px',
      letterSpacing: isRtl ? '0' : '1px',
    },
    subtitle: {
      color: '#007B6E',
      fontSize: '14px',
      fontWeight: 600,
      marginBottom: '32px',
      opacity: 0.8,
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #E6FAF7',
      borderTop: '4px solid #007B6E',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 24px',
    },
    loadingText: {
      color: '#007B6E',
      fontSize: '16px',
      fontWeight: 600,
    },
    successIcon: {
      width: '64px',
      height: '64px',
      backgroundColor: '#E6FAF7',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      border: '3px solid #00C6AE',
    },
    successTitle: {
      color: '#007B6E',
      fontSize: '22px',
      fontWeight: 700,
      marginBottom: '12px',
    },
    successDetail: {
      color: '#333',
      fontSize: '14px',
      lineHeight: 1.8,
      marginBottom: '8px',
    },
    badge: {
      display: 'inline-block',
      backgroundColor: '#007B6E',
      color: '#FFFFFF',
      padding: '4px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 700,
      marginTop: '12px',
      marginBottom: '24px',
    },
    accessButton: {
      backgroundColor: '#007B6E',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '12px',
      padding: '14px 32px',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      width: '100%',
      fontFamily: "'Cairo', sans-serif",
      transition: 'background-color 0.2s ease',
    },
    errorContainer: {
      backgroundColor: '#FFF5F5',
      border: '1px solid #FC8181',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    },
    errorIcon: {
      fontSize: '40px',
      marginBottom: '12px',
    },
    errorTitle: {
      color: '#C53030',
      fontSize: '18px',
      fontWeight: 700,
      marginBottom: '8px',
    },
    errorMessage: {
      color: '#742A2A',
      fontSize: '14px',
      lineHeight: 1.7,
      marginBottom: '20px',
    },
    whatsappButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      backgroundColor: '#25D366',
      color: '#FFFFFF',
      textDecoration: 'none',
      borderRadius: '12px',
      padding: '14px 28px',
      fontSize: '15px',
      fontWeight: 700,
      fontFamily: "'Cairo', sans-serif",
      width: '100%',
      transition: 'opacity 0.2s ease',
    },
    divider: {
      height: '1px',
      backgroundColor: '#E6FAF7',
      margin: '24px 0',
    },
    footer: {
      color: '#007B6E',
      fontSize: '12px',
      opacity: 0.6,
      marginTop: '24px',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          button:hover { opacity: 0.9; }
          a:hover { opacity: 0.9; }
        `}
      </style>

      <div style={styles.card} role="main" aria-label={isRtl ? 'التحقق من رابط الاستشارة' : 'Consultation Link Verification'}>
        <div style={styles.logo}>ALO DOCTOR</div>
        <div style={styles.subtitle}>
          {isRtl ? 'بوابة الاستشارات عبر الحدود - الإصدار السعودي v2.4' : 'Cross-Border Telehealth Portal - Saudi Edition v2.4'}
        </div>

        {isLoading && (
          <div role="status" aria-live="polite">
            <div style={styles.spinner} aria-hidden="true" />
            <p style={styles.loadingText}>
              {isRtl ? 'جارٍ التحقق من رابط الاستشارة الآمن...' : 'Validating secure consultation link...'}
            </p>
          </div>
        )}

        {!isLoading && isValid && (
          <div role="alert" aria-live="polite">
            <div style={styles.successIcon} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#007B6E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            
            <h2 style={styles.successTitle}>
              {isRtl ? 'تم التحقق بنجاح - تصريح الدخول السحري' : 'Verified Successfully - Magic Pass Granted'}
            </h2>
            
            <p style={styles.successDetail}>
              <strong>{isRtl ? 'الاستشاري:' : 'Consultant:'}</strong>{' '}
              {isRtl ? CONSULTANT_PROFILE.nameAr : CONSULTANT_PROFILE.nameEn}
            </p>
            <p style={styles.successDetail}>
              <strong>{isRtl ? 'رقم التواصل:' : 'Contact:'}</strong> {CONSULTANT_PROFILE.phone}
            </p>
            <p style={styles.successDetail}>
              <strong>{isRtl ? 'ملف الحالة:' : 'Case Dossier:'}</strong> {matchedCaseId}
            </p>
            
            <div style={styles.badge}>
              {isRtl ? `الدور: استشاري (${CONSULTANT_PROFILE.role})` : `Role: Consultant (${CONSULTANT_PROFILE.role})`}
            </div>

            <div style={styles.divider} />

            <p style={{ ...styles.successDetail, fontSize: '13px', color: '#007B6E' }}>
              {isRtl 
                ? 'تم فتح الوصول الفوري لملف الحالة (الخيار أ - التصريح السحري)' 
                : 'Immediate case dossier access unlocked (Option A - Magic Pass)'}
            </p>

            <button
              type="button"
              style={styles.accessButton}
              onClick={() => {
                if (onAuthSuccess) {
                  onAuthSuccess({
                    name: CONSULTANT_PROFILE.nameEn,
                    role: CONSULTANT_PROFILE.role,
                    phone: CONSULTANT_PROFILE.phone,
                    caseId: matchedCaseId,
                    authenticatedAt: new Date().toISOString(),
                  });
                }
              }}
              aria-label={isRtl ? 'فتح ملف الحالة الآن' : 'Open Case Dossier Now'}
            >
              {isRtl ? 'فتح ملف الحالة الآن' : 'Access Case Dossier Now'}
            </button>
          </div>
        )}

        {!isLoading && !isValid && (
          <div role="alert" aria-live="assertive">
            <div style={styles.errorContainer}>
              <div style={styles.errorIcon} aria-hidden="true">⚠️</div>
              <h2 style={styles.errorTitle}>
                {isRtl ? 'رابط منتهي الصلاحية أو غير صالح' : 'Expired or Invalid Token'}
              </h2>
              <p style={styles.errorMessage}>
                {error || (isRtl 
                  ? 'لم نتمكن من التحقق من رابط الاستشارة الخاص بك. قد يكون الرابط منتهي الصلاحية أو تم استخدامه مسبقاً.'
                  : 'We could not verify your consultation link. The token may have expired or been previously used.')}
              </p>
            </div>

            <p style={{ ...styles.successDetail, marginBottom: '16px', fontSize: '14px' }}>
              {isRtl 
                ? 'يرجى التواصل مع منسق الحالات عبر واتساب للحصول على رابط جديد:'
                : 'Please contact the case coordinator via WhatsApp to obtain a new link:'}
            </p>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.whatsappButton}
              aria-label={isRtl ? 'تواصل مع المنسق عبر واتساب' : 'Contact Coordinator via WhatsApp'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {isRtl ? 'تواصل مع المنسق عبر واتساب' : 'Contact Coordinator on WhatsApp'}
            </a>
          </div>
        )}

        <div style={styles.footer}>
          {isRtl ? 'نظام آلو دكتور - بوابة الاستشارات الآمنة © 2024' : 'ALO DOCTOR System - Secure Consultation Portal © 2024'}
        </div>
      </div>
    </div>
  );
};

export default ConsultantMagicLinkStep;
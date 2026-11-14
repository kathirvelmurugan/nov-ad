import React, { useState, useMemo, useCallback } from 'react';

interface Consultant {
  id: string;
  name: string;
  specialty?: string;
}

interface ActiveCase {
  id: string;
  caseNumber?: string;
  stage: string;
  paymentVerified: boolean;
  consultant?: Consultant;
  patientName?: string;
}

interface CoordinatorPortalViewProps {
  activeCase: ActiveCase | null;
  currentLanguage: 'ar' | 'en';
  personaId?: string;
}

const TEAL_PRIMARY = '#007B6E';
const TEAL_SECONDARY = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const CoordinatorPortalView: React.FC<CoordinatorPortalViewProps> = ({
  activeCase,
  currentLanguage,
  personaId
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isRtl = currentLanguage === 'ar';

  const shouldShowDispatch = useMemo(() => {
    if (!activeCase) return false;
    return activeCase.stage === 'WITH_CONSULTANT' || activeCase.paymentVerified === true;
  }, [activeCase]);

  const magicUrl = useMemo(() => {
    if (!activeCase) return '';
    const token = `ML-${activeCase.id}-${Date.now().toString(36)}`;
    const consultantName = encodeURIComponent(activeCase.consultant?.name || (isRtl ? 'استشاري' : 'Consultant'));
    return `${window.location.origin}/?magic_token=${token}&caseId=${activeCase.id}&consultant=${consultantName}`;
  }, [activeCase, isRtl]);

  const whatsappUrl = useMemo(() => {
    if (!activeCase || !magicUrl) return '';
    const caseIdentifier = activeCase.caseNumber || activeCase.id;
    const messageAr = `إرسال ملف الاستشارة عن بعد من ALO: يُرجى مراجعة الحالة ${caseIdentifier} عبر الرابط الآمن: ${magicUrl}`;
    const messageEn = `ALO Telehealth Dossier Dispatch: Please review case ${caseIdentifier} via secure link: ${magicUrl}`;
    const finalMessage = isRtl ? messageAr : messageEn;
    return `https://wa.me/?text=${encodeURIComponent(finalMessage)}`;
  }, [activeCase, magicUrl, isRtl]);

  const handleCopyLink = useCallback(async () => {
    if (!magicUrl) return;
    try {
      await navigator.clipboard.writeText(magicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = magicUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [magicUrl]);

  const handleWhatsAppDispatch = useCallback(() => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  }, [whatsappUrl]);

  if (!activeCase || !shouldShowDispatch) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    direction: isRtl ? 'rtl' : 'ltr',
    fontFamily: "'Cairo', sans-serif",
    backgroundColor: TEAL_BG,
    borderRight: isRtl ? `4px solid ${TEAL_PRIMARY}` : 'none',
    borderLeft: !isRtl ? `4px solid ${TEAL_PRIMARY}` : 'none',
    borderRadius: '12px',
    padding: '24px',
    margin: '20px 0',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    maxWidth: '800px',
    width: '100%'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: TEAL_PRIMARY,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: '20px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '13px',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    border: `1.5px solid ${TEAL_SECONDARY}`,
    borderRadius: '8px',
    outline: 'none',
    direction: 'ltr',
    textAlign: 'left',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  };

  const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center'
  };

  const baseButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    fontFamily: "'Cairo', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  };

  const copyButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: copied ? TEAL_SECONDARY : TEAL_PRIMARY,
    color: '#ffffff'
  };

  const whatsappButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: WHATSAPP_GREEN,
    color: '#ffffff'
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: TEAL_PRIMARY,
    color: '#ffffff',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.5px'
  };

  return (
    <div style={containerStyle} data-persona-id={personaId} role="region" aria-label={isRtl ? "بوابة إرسال رابط الاستشاري" : "Consultant Access Dispatch"}>
      <div style={headerStyle}>
        <span style={{ fontSize: '22px' }}>🔗</span>
        <span>
          {isRtl ? 'بوابة إرسال رابط الاستشاري' : 'Consultant Access Dispatch'}
        </span>
        <span style={{ ...badgeStyle, marginInlineStart: 'auto' }}>
          {isRtl ? 'المرحلة ٥' : 'STAGE 5'}
        </span>
      </div>

      <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '16px', lineHeight: 1.6 }}>
        {isRtl
          ? `تم التحقق من الدفع. يُرجى نسخ الرابط السحري أدناه وإرساله إلى الاستشاري (${activeCase.consultant?.name || 'غير محدد'}) للوصول الفوري لملف الحالة.`
          : `Payment verified. Please copy the magic link below and dispatch it to the consultant (${activeCase.consultant?.name || 'Unassigned'}) for immediate dossier access.`
        }
      </p>

      <div style={inputContainerStyle}>
        <label
          htmlFor="alo-magic-link-input"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: TEAL_PRIMARY,
            marginBottom: '6px'
          }}
        >
          {isRtl ? 'الرابط السحري للاستشاري' : 'Consultant Magic Link'}
        </label>
        <input
          id="alo-magic-link-input"
          type="text"
          value={magicUrl}
          readOnly
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = TEAL_PRIMARY}
          onBlur={(e) => e.target.style.borderColor = TEAL_SECONDARY}
          aria-readonly={true}
        />
      </div>

      <div style={buttonRowStyle}>
        <button
          type="button"
          onClick={handleCopyLink}
          style={copyButtonStyle}
          onMouseEnter={(e) => {
            if (!copied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#005f55';
          }}
          onMouseLeave={(e) => {
            if (!copied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = TEAL_PRIMARY;
          }}
          aria-label={isRtl ? 'نسخ الرابط السحري' : 'Copy Magic Link'}
        >
          <span>{copied ? '✅' : '📋'}</span>
          <span>
            {copied
              ? (isRtl ? 'تم النسخ!' : 'Copied!')
              : (isRtl ? 'نسخ الرابط' : 'Copy Magic Link')
            }
          </span>
        </button>

        <button
          type="button"
          onClick={handleWhatsAppDispatch}
          style={whatsappButtonStyle}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1ebe5d';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = WHATSAPP_GREEN;
          }}
          aria-label={isRtl ? 'إرسال عبر الواتساب' : 'Send via WhatsApp'}
        >
          <span>📲</span>
          <span>
            {isRtl ? 'إرسال عبر الواتساب' : 'Send via WhatsApp'}
          </span>
        </button>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: `1px solid ${TEAL_BG}`,
          fontSize: '12px',
          color: '#718096',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        role="note"
      >
        <span>ℹ️</span>
        <span>
          {isRtl
            ? 'هذا الرابط فريد وآمن. ينتهي صلاحية الرمز المميز تلقائياً بعد الاستخدام الأول أو انتهاء المدة المحددة.'
            : 'This link is unique and secure. The magic token expires automatically after first use or upon timeout.'
          }
        </span>
      </div>
    </div>
  );
};

export default CoordinatorPortalView;
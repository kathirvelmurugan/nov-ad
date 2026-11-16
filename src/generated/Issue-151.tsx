import React, { useState, useEffect, useCallback } from 'react';

interface PaymentDetail {
  transactionId: string;
  method: 'MADA' | 'APPLE_PAY';
  amount: number;
  currency: string;
  timestamp: string;
}

interface Pricing {
  paid: boolean;
  amount: number;
}

interface ConsultationCase {
  caseId: string;
  patientName: string;
  pricing: Pricing;
  paymentVerified: boolean;
  paymentDetails: PaymentDetail;
  stage: string;
  createdAt: string;
}

interface CoordinatorProfile {
  name: string;
  phone: string;
  role: string;
}

interface CoordinatorPortalViewProps {
  personaId?: string;
  lang?: 'ar' | 'en';
  apiClient: any;
}

const TEAL_PRIMARY = '#007B6E';
const TEAL_SECONDARY = '#00C6AE';
const TEAL_BACKGROUND = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const COORDINATOR_PROFILE: CoordinatorProfile = {
  name: 'Emmanuel Arcon Gonzalez',
  phone: '+966500000003',
  role: 'Telehealth Operations Specialist'
};

const I18N = {
  ar: {
    portalTitle: 'بوابة المنسق الطبي',
    awaitingReconciliation: 'الحالات بانتظار التسوية المالية (C04)',
    noCases: 'لا توجد حالات بانتظار التحقق من الدفع.',
    transactionId: 'رقم العملية',
    paymentMethod: 'طريقة الدفع',
    amount: 'المبلغ',
    patient: 'المرضى',
    date: 'التاريخ',
    verifyAndDispatch: 'التحقق والتحويل للاستشاري (C04 / التحقق والتحويل للاستشاري)',
    verifying: 'جاري التحقق...',
    success: 'تم التحقق وتوليد رابط الاستشاري (72 ساعة) - المرحلة M04',
    error: 'حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.',
    mada: 'مدى',
    applePay: 'آبل باي',
    consultantLink: 'رابط الاستشاري السحري',
    copied: 'تم النسخ',
    copyLink: 'نسخ الرابط',
    profile: 'الملف الشخصي',
    stage: 'المرحلة الحالية'
  },
  en: {
    portalTitle: 'Coordinator Portal',
    awaitingReconciliation: 'Cases Awaiting Reconciliation (C04)',
    noCases: 'No cases awaiting payment verification.',
    transactionId: 'Transaction ID',
    paymentMethod: 'Payment Method',
    amount: 'Amount',
    patient: 'Patient',
    date: 'Date',
    verifyAndDispatch: 'Verify Payment & Dispatch to Consultant (C04)',
    verifying: 'Verifying...',
    success: 'Payment verified. 72h magic link generated. Advanced to M04.',
    error: 'Error during verification. Please try again.',
    mada: 'Mada',
    applePay: 'Apple Pay',
    consultantLink: 'Magic Consultant Link',
    copied: 'Copied',
    copyLink: 'Copy Link',
    profile: 'Profile',
    stage: 'Current Stage'
  }
};

const CoordinatorPortalView: React.FC<CoordinatorPortalViewProps> = ({
  personaId = 'coordinator-01',
  lang = 'ar',
  apiClient
}) => {
  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({});
  const [copiedState, setCopiedState] = useState<Record<string, boolean>>({});
  const [errorState, setErrorState] = useState<Record<string, string>>({});

  const isRTL = lang === 'ar';
  const t = I18N[lang];

  const fetchPendingCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getCasesByStage('AWAITING_PAYMENT_VERIFICATION');
      const filtered = response.filter(
        (c: ConsultationCase) => c.pricing.paid === true && c.paymentVerified === false
      );
      setCases(filtered);
    } catch (err) {
      console.error('Failed to fetch C04 cases:', err);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchPendingCases();
  }, [fetchPendingCases]);

  const handleVerifyAndDispatch = async (caseId: string) => {
    setProcessingId(caseId);
    setErrorState((prev) => ({ ...prev, [caseId]: '' }));

    try {
      // Calls apiClient.verifyPayment(caseId)
      // Authoritatively updates PostgreSQL with paymentVerified = true
      const verificationResult = await apiClient.verifyPayment(caseId);

      // Generates 72h magic consultant link
      const magicLink = verificationResult.consultantLink || `https://alo.doctor/c/${caseId}?token=${verificationResult.token}&exp=72h`;

      // Advances stage to WITH_CONSULTANT (M04 milestone)
      setCases((prev) =>
        prev.map((c) =>
          c.caseId === caseId
            ? { ...c, paymentVerified: true, stage: 'WITH_CONSULTANT' }
            : c
        )
      );

      setGeneratedLinks((prev) => ({ ...prev, [caseId]: magicLink }));
    } catch (err: any) {
      setErrorState((prev) => ({
        ...prev,
        [caseId]: err?.message || t.error
      }));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCopyLink = async (caseId: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedState((prev) => ({ ...prev, [caseId]: true }));
      setTimeout(() => {
        setCopiedState((prev) => ({ ...prev, [caseId]: false }));
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency || 'SAR'
    }).format(amount);
  };

  const containerStyle: React.CSSProperties = {
    direction: isRTL ? 'rtl' : 'ltr',
    fontFamily: 'Cairo, sans-serif',
    backgroundColor: TEAL_BACKGROUND,
    minHeight: '100vh',
    padding: '24px',
    color: '#1A1A1A'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: TEAL_PRIMARY,
    margin: 0
  };

  const profileBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#FFFFFF',
    padding: '12px 20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 123, 110, 0.08)',
    border: `1px solid ${TEAL_SECONDARY}`
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 16px rgba(0, 123, 110, 0.06)',
    border: `1px solid ${TEAL_BACKGROUND}`,
    transition: 'all 0.2s ease-in-out'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: TEAL_PRIMARY,
    color: '#FFFFFF',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '10px',
    fontFamily: 'Cairo, sans-serif',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: '16px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#B0BEC5',
    cursor: 'not-allowed'
  };

  const whatsappButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: WHATSAPP_GREEN,
    marginTop: '10px'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#666666',
    fontWeight: 500,
    marginBottom: '4px'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#1A1A1A',
    fontWeight: 600
  };

  const linkBoxStyle: React.CSSProperties = {
    backgroundColor: TEAL_BACKGROUND,
    padding: '16px',
    borderRadius: '10px',
    marginTop: '16px',
    border: `1px solid ${TEAL_SECONDARY}`,
    wordBreak: 'break-all'
  };

  const errorMessageStyle: React.CSSProperties = {
    color: '#D32F2F',
    fontSize: '14px',
    marginTop: '12px',
    fontWeight: 500
  };

  return (
    <div style={containerStyle} data-persona={personaId} role="main" aria-label={t.portalTitle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>{t.portalTitle}</h1>
          <p style={{ margin: '8px 0 0 0', color: TEAL_PRIMARY, fontSize: '16px', fontWeight: 500 }}>
            {t.awaitingReconciliation}
          </p>
        </div>
        
        <div style={profileBadgeStyle} aria-label={t.profile}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: TEAL_PRIMARY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '16px'
          }}>
            {COORDINATOR_PROFILE.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: TEAL_PRIMARY }}>
              {COORDINATOR_PROFILE.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {COORDINATOR_PROFILE.phone} • {COORDINATOR_PROFILE.role}
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: TEAL_PRIMARY }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${TEAL_BACKGROUND}`,
            borderTop: `4px solid ${TEAL_PRIMARY}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: 600 }}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      ) : cases.length === 0 ? (
        <div style={{
          ...cardStyle,
          textAlign: 'center',
          padding: '60px 24px',
          color: '#666'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={TEAL_SECONDARY} strokeWidth="1.5" style={{ margin: '0 auto 16px auto', display: 'block' }}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p style={{ fontSize: '18px', fontWeight: 600 }}>{t.noCases}</p>
        </div>
      ) : (
        <div role="list" aria-label={t.awaitingReconciliation}>
          {cases.map((consultationCase) => {
            const isProcessing = processingId === consultationCase.caseId;
            const hasLink = !!generatedLinks[consultationCase.caseId];
            const errorMsg = errorState[consultationCase.caseId];

            return (
              <article
                key={consultationCase.caseId}
                style={{
                  ...cardStyle,
                  opacity: hasLink ? 0.7 : 1,
                  borderColor: hasLink ? TEAL_SECONDARY : `${TEAL_BACKGROUND}`
                }}
                role="listitem"
                aria-label={`${t.patient}: ${consultationCase.patientName}`}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: TEAL_PRIMARY }}>
                      {consultationCase.patientName}
                    </h2>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '4px 12px',
                      backgroundColor: hasLink ? TEAL_SECONDARY : '#FFF3E0',
                      color: hasLink ? '#FFFFFF' : '#E65100',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {hasLink ? 'WITH_CONSULTANT (M04)' : consultationCase.stage}
                    </span>
                  </div>
                  <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                    <div style={{ fontSize: '13px', color: '#888' }}>{t.date}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                      {new Date(consultationCase.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </div>
                  </div>
                </div>

                <div style={gridStyle}>
                  <div>
                    <div style={labelStyle}>{t.transactionId}</div>
                    <div style={{ ...valueStyle, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                      {consultationCase.paymentDetails.transactionId}
                    </div>
                  </div>
                  
                  <div>
                    <div style={labelStyle}>{t.paymentMethod}</div>
                    <div style={{
                      ...valueStyle,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: consultationCase.paymentDetails.method === 'MADA' ? TEAL_PRIMARY : '#000000',
                        display: 'inline-block'
                      }} />
                      {consultationCase.paymentDetails.method === 'MADA' ? t.mada : t.applePay}
                    </div>
                  </div>

                  <div>
                    <div style={labelStyle}>{t.amount}</div>
                    <div style={{ ...valueStyle, color: TEAL_PRIMARY }}>
                      {formatCurrency(
                        consultationCase.paymentDetails.amount,
                        consultationCase.paymentDetails.currency
                      )}
                    </div>
                  </div>
                </div>

                {!hasLink && (
                  <button
                    type="button"
                    style={isProcessing ? disabledButtonStyle : buttonStyle}
                    onClick={() => handleVerifyAndDispatch(consultationCase.caseId)}
                    disabled={isProcessing}
                    aria-busy={isProcessing}
                    aria-label={t.verifyAndDispatch}
                  >
                    {isProcessing ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                        </svg>
                        {t.verifying}
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t.verifyAndDispatch}
                      </>
                    )}
                  </button>
                )}

                {errorMsg && (
                  <div style={errorMessageStyle} role="alert">
                    {errorMsg}
                  </div>
                )}

                {hasLink && (
                  <div style={linkBoxStyle} role="status" aria-live="polite">
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="2">
                        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span style={{ fontWeight: 700, color: TEAL_PRIMARY, fontSize: '15px' }}>
                        {t.consultantLink} (72h)
                      </span>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      color: '#333',
                      border: `1px solid ${TEAL_SECONDARY}`,
                      marginBottom: '12px',
                      wordBreak: 'break-all'
                    }}>
                      {generatedLinks[consultationCase.caseId]}
                    </div>

                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: '13px',
                      color: TEAL_PRIMARY,
                      fontWeight: 600
                    }}>
                      {t.success}
                    </p>

                    <button
                      type="button"
                      style={{
                        ...(copiedState[consultationCase.caseId] ? { ...whatsappButtonStyle, backgroundColor: TEAL_PRIMARY } : whatsappButtonStyle),
                        padding: '10px 16px',
                        fontSize: '14px'
                      }}
                      onClick={() => handleCopyLink(
                        consultationCase.caseId,
                        generatedLinks[consultationCase.caseId]
                      )}
                      aria-label={t.copyLink}
                    >
                      {copiedState[consultationCase.caseId] ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          {t.copied}
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                          {t.copyLink}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoordinatorPortalView;
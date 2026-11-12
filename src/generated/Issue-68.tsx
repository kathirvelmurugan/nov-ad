import React, { useState, useMemo } from 'react';

// --- Types & Interfaces ---
export type PersonaId = 
  | 'patient' | 'doctor' | 'nurse' | 'lab_tech' | 'pharmacist' 
  | 'receptionist' | 'coordinator' | 'admin' | 'billing' | 'insurance' | 'system';

export interface UserProfile {
  id: string;
  persona: PersonaId;
  nameEn: string;
  nameAr: string;
}

export type LabStatus = 'pending' | 'processing' | 'results_uploaded' | 'cancelled';
export type PharmacyStatus = 'pending' | 'preparing' | 'dispensed' | 'delivered' | 'cancelled';
export type ReceptionStatus = 'pending' | 'checked_in' | 'completed' | 'cancelled';

export interface PartnerServiceState {
  lab: LabStatus;
  pharmacy: PharmacyStatus;
  reception: ReceptionStatus;
}

interface CoordinatorFollowUpTabProps {
  currentLanguage: 'en' | 'ar';
  currentUser: UserProfile;
  onRelaySubmit?: (message: string) => void;
}

interface PartnerServicesViewProps {
  currentLanguage: 'en' | 'ar';
  currentUser: UserProfile;
  serviceStates: PartnerServiceState;
  onD13Activate?: () => void;
}

// --- Constants & Theme ---
const THEME = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  error: '#D32F2F',
  textDark: '#1A1A1A',
  textLight: '#FFFFFF',
};

const I18N = {
  en: {
    relayPlaceholder: 'Enter clinical follow-up details to relay...',
    relayButton: 'Relay Message',
    relayError: 'Please provide clinical follow-up details (minimum 10 characters) before relaying.',
    d13Activate: 'Activate 21-Day Follow-Up',
    d13LockedPrefix: 'Cannot activate 21-day follow-up. Outstanding services:',
    lab: 'Lab Results',
    pharmacy: 'Pharmacy Dispensing',
    reception: 'Reception Checkout',
    statusPending: 'Pending',
    statusCompleted: 'Completed',
    allComplete: 'All partner services are complete. You may proceed with D13 activation.',
  },
  ar: {
    relayPlaceholder: 'أدخل تفاصيل استفسار المتابعة السريرية للترحيل...',
    relayButton: 'ترحيل الرسالة',
    relayError: 'يرجى كتابة تفاصيل استفسار المتابعة السريرية (10 أحرف على الأقل) قبل الترحيل.',
    d13Activate: 'تفعيل نافذة المتابعة الطبية (21 يوم)',
    d13LockedPrefix: 'لا يمكن تفعيل نافذة المتابعة الطبية قبل اكتمال الخدمات التالية:',
    lab: 'نتائج المختبر',
    pharmacy: 'صرف الصيدلية',
    reception: 'إتمام الاستقبال',
    statusPending: 'قيد الانتظار',
    statusCompleted: 'مكتمل',
    allComplete: 'جميع خدمات الشركاء مكتملة. يمكنك المضي قدماً في تفعيل D13.',
  }
};

// --- Shared UI Components ---
const FieldError: React.FC<{ message: string; dir: 'rtl' | 'ltr' }> = ({ message, dir }) => (
  <div
    role="alert"
    aria-live="assertive"
    style={{
      color: THEME.error,
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      fontFamily: 'Cairo, sans-serif',
      direction: dir,
      textAlign: dir === 'rtl' ? 'right' : 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    {message}
  </div>
);

// --- Component 1: Coordinator Follow-up Relay Tab (Gap 9) ---
export const CoordinatorFollowUpTab: React.FC<CoordinatorFollowUpTabProps> = ({
  currentLanguage,
  currentUser,
  onRelaySubmit,
}) => {
  const [relayMessage, setRelayMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRtl = currentLanguage === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const t = I18N[currentLanguage];

  const isValid = relayMessage.trim().length >= 10;
  const showError = touched && !isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      if (onRelaySubmit) {
        await onRelaySubmit(relayMessage.trim());
      }
      setRelayMessage('');
      setTouched(false);
    } catch (error) {
      console.error('[C09] Relay submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label={t.relayButton}
      style={{
        direction: dir,
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: THEME.background,
        padding: '1.5rem',
        borderRadius: '12px',
        border: `1px solid ${THEME.secondary}`,
        maxWidth: '640px',
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          color: THEME.primary,
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '1rem',
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        {t.relayButton}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <label
          htmlFor="c09-relay-message"
          style={{
            display: 'block',
            color: THEME.textDark,
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}
        >
          {currentLanguage === 'ar' ? currentUser.nameAr : currentUser.nameEn}
        </label>

        <textarea
          id="c09-relay-message"
          value={relayMessage}
          onChange={(e) => {
            setRelayMessage(e.target.value);
            if (!touched) setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          placeholder={t.relayPlaceholder}
          dir={dir}
          rows={4}
          aria-invalid={showError}
          aria-describedby={showError ? 'c09-relay-error' : undefined}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            fontFamily: 'Cairo, sans-serif',
            direction: dir,
            textAlign: isRtl ? 'right' : 'left',
            border: `2px solid ${showError ? THEME.error : THEME.secondary}`,
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            color: THEME.textDark,
            outline: 'none',
            transition: 'border-color 0.2s ease',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = showError ? THEME.error : THEME.primary;
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = showError ? THEME.error : THEME.secondary;
          }}
        />

        {showError && (
          <div id="c09-relay-error">
            <FieldError message={t.relayError} dir={dir} />
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          aria-disabled={!isValid || isSubmitting}
          style={{
            marginTop: '1.25rem',
            width: '100%',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'Cairo, sans-serif',
            color: THEME.textLight,
            backgroundColor: isValid && !isSubmitting ? THEME.primary : '#B0BEC5',
            border: 'none',
            borderRadius: '8px',
            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s ease, opacity 0.2s ease',
            opacity: isSubmitting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {isSubmitting ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          {t.relayButton}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

// --- Component 2: Partner Services View (Gap 10 / D13 Gate) ---
export const PartnerServicesView: React.FC<PartnerServicesViewProps> = ({
  currentLanguage,
  currentUser,
  serviceStates,
  onD13Activate,
}) => {
  const [isActivating, setIsActivating] = useState(false);

  const isRtl = currentLanguage === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const t = I18N[currentLanguage];

  // Strict prerequisite checks
  const completionMap = useMemo(() => ({
    lab: serviceStates.lab === 'results_uploaded',
    pharmacy: serviceStates.pharmacy === 'dispensed' || serviceStates.pharmacy === 'delivered',
    reception: serviceStates.reception === 'completed',
  }), [serviceStates]);

  const pendingServices = useMemo(() => {
    const pending: string[] = [];
    if (!completionMap.lab) pendingServices.push(t.lab);
    if (!completionMap.pharmacy) pending.push(t.pharmacy);
    if (!completionMap.reception) pending.push(t.reception);
    return pending;
  }, [completionMap, t]);

  // Fix: properly build the pending array
  const outstandingList = useMemo(() => {
    const list: string[] = [];
    if (!completionMap.lab) list.push(t.lab);
    if (!completionMap.pharmacy) list.push(t.pharmacy);
    if (!completionMap.reception) list.push(t.reception);
    return list;
  }, [completionMap, t]);

  const isD13Unlocked = outstandingList.length === 0;

  const handleD13Activation = async () => {
    if (!isD13Unlocked || isActivating) return;
    
    setIsActivating(true);
    try {
      if (onD13Activate) {
        await onD13Activate();
      }
    } catch (error) {
      console.error('[D13] Activation failed:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const StatusBadge: React.FC<{ isComplete: boolean; label: string }> = ({ isComplete, label }) => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: isComplete ? '#E8F5E9' : '#FFF3E0',
        color: isComplete ? '#2E7D32' : '#E65100',
        border: `1px solid ${isComplete ? '#A5D6A7' : '#FFCC80'}`,
      }}
    >
      {isComplete ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {isComplete ? t.statusCompleted : t.statusPending}
    </span>
  );

  return (
    <section
      aria-label={t.d13Activate}
      style={{
        direction: dir,
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: '#FFFFFF',
        padding: '1.5rem',
        borderRadius: '12px',
        border: `1px solid #E0E0E0`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      <header style={{ marginBottom: '1.5rem', borderBottom: `2px solid ${THEME.background}`, paddingBottom: '1rem' }}>
        <h2
          style={{
            color: THEME.primary,
            fontSize: '1.25rem',
            fontWeight: 700,
            margin: 0,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {t.d13Activate}
        </h2>
        <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', textAlign: isRtl ? 'right' : 'left' }}>
          {currentLanguage === 'ar' ? currentUser.nameAr : currentUser.nameEn}
        </p>
      </header>

      {/* Service Checklist */}
      <div
        role="list"
        aria-label={currentLanguage === 'ar' ? 'حالة الخدمات' : 'Service Status'}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}
      >
        {[
          { key: 'lab', label: t.lab, complete: completionMap.lab, rawStatus: serviceStates.lab },
          { key: 'pharmacy', label: t.pharmacy, complete: completionMap.pharmacy, rawStatus: serviceStates.pharmacy },
          { key: 'reception', label: t.reception, complete: completionMap.reception, rawStatus: serviceStates.reception },
        ].map((service) => (
          <div
            key={service.key}
            role="listitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: service.complete ? THEME.background : '#FAFAFA',
              borderRadius: '8px',
              border: `1px solid ${service.complete ? THEME.secondary : '#EEEEEE'}`,
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 600, color: THEME.textDark, fontSize: '0.95rem' }}>
                {service.label}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {service.rawStatus.replace('_', ' ')}
              </span>
            </div>
            <StatusBadge isComplete={service.complete} label={service.label} />
          </div>
        ))}
      </div>

      {/* Gate Enforcement Banner */}
      {!isD13Unlocked && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            backgroundColor: '#FFF8E1',
            borderRight: isRtl ? `4px solid #F57C00` : 'none',
            borderLeft: !isRtl ? `4px solid #F57C00` : 'none',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F57C00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: '2px' }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#E65100', fontSize: '0.95rem' }}>
                {t.d13LockedPrefix}
              </p>
              <ul
                style={{
                  margin: '0.5rem 0 0 0',
                  padding: isRtl ? '0 1.25rem 0 0' : '0 0 0 1.25rem',
                  color: '#BF360C',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  listStyleType: 'disc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                {outstandingList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isD13Unlocked && (
        <div
          role="status"
          style={{
            backgroundColor: '#E8F5E9',
            borderRight: isRtl ? `4px solid ${THEME.whatsapp}` : 'none',
            borderLeft: !isRtl ? `4px solid ${THEME.whatsapp}` : 'none',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#1B5E20',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {t.allComplete}
        </div>
      )}

      {/* D13 Activation Button */}
      <button
        type="button"
        onClick={handleD13Activation}
        disabled={!isD13Unlocked || isActivating}
        aria-disabled={!isD13Unlocked || isActivating}
        aria-describedby={!isD13Unlocked ? 'd13-gate-description' : undefined}
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          fontSize: '1.05rem',
          fontWeight: 700,
          fontFamily: 'Cairo, sans-serif',
          color: THEME.textLight,
          backgroundColor: isD13Unlocked && !isActivating ? THEME.whatsapp : '#CFD8DC',
          border: 'none',
          borderRadius: '10px',
          cursor: isD13Unlocked && !isActivating ? 'pointer' : 'not-allowed',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          boxShadow: isD13Unlocked ? '0 4px 14px 0 rgba(37, 211, 102, 0.3)' : 'none',
          opacity: isActivating ? 0.8 : 1,
        }}
        onMouseEnter={(e) => {
          if (isD13Unlocked && !isActivating) {
            e.currentTarget.style.backgroundColor = '#20BA5C';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (isD13Unlocked && !isActivating) {
            e.currentTarget.style.backgroundColor = THEME.whatsapp;
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isActivating ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
          </svg>
        )}
        {t.d13Activate}
      </button>

      {!isD13Unlocked && (
        <span id="d13-gate-description" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
          {t.d13LockedPrefix} {outstandingList.join(', ')}
        </span>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </section>
  );
};

export default {
  CoordinatorFollowUpTab,
  PartnerServicesView,
};
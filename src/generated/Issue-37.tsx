import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Types & Interfaces ---
export interface ClinicalCase {
  id: string;
  patientName: string;
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
  createdAt: string; // ISO 8601 timestamp
  assignedAt?: string; // ISO 8601 timestamp
  personaId: string; // e.g., 'D01', 'K05', 'K06'
}

interface SLAState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  alertLevel: 'normal' | 'warning' | 'critical';
}

// --- Constants (Pinterest-Teal Palette) ---
const COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  warning: '#D97706', // Amber for < 6h
  critical: '#DC2626', // Red for < 1h
  textDark: '#111827',
  textLight: '#FFFFFF',
};

const SLA_DURATIONS_MS: Record<string, number> = {
  D01: 24 * 60 * 60 * 1000, // Saudi Doctor: 24 hours
  K05: 48 * 60 * 60 * 1000, // Indian Consultant: 48 hours
  K06: 48 * 60 * 60 * 1000, // Indian Consultant: 48 hours
};

const SIX_HOURS_IN_SECONDS = 6 * 60 * 60;
const ONE_HOUR_IN_SECONDS = 1 * 60 * 60;

// --- Custom Hook: useSLACountdown ---
export function useSLACountdown(clinicalCase: ClinicalCase | null): SLAState {
  const calculateTarget = useCallback((c: ClinicalCase): number => {
    const baseTime = c.assignedAt ? new Date(c.assignedAt).getTime() : new Date(c.createdAt).getTime();
    const duration = SLA_DURATIONS_MS[c.personaId] || SLA_DURATIONS_MS['D01'];
    return baseTime + duration;
  }, []);

  const [targetTimestamp, setTargetTimestamp] = useState<number>(0);
  const [slaState, setSlaState] = useState<SLAState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false,
    alertLevel: 'normal',
  });

  useEffect(() => {
    if (clinicalCase) {
      setTargetTimestamp(calculateTarget(clinicalCase));
    }
  }, [clinicalCase, calculateTarget]);

  useEffect(() => {
    if (!targetTimestamp) return;

    const tick = () => {
      const now = Date.now();
      const diffMs = targetTimestamp - now;
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
      if (totalSeconds <= ONE_HOUR_IN_SECONDS && totalSeconds > 0) {
        alertLevel = 'critical';
      } else if (totalSeconds <= SIX_HOURS_IN_SECONDS && totalSeconds > ONE_HOUR_IN_SECONDS) {
        alertLevel = 'warning';
      }

      setSlaState({
        hours,
        minutes,
        seconds,
        totalSeconds,
        isExpired: totalSeconds === 0,
        alertLevel,
      });
    };

    tick(); // Immediate first render
    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [targetTimestamp]);

  return slaState;
}

// --- Utility: Pad Number ---
const pad = (num: number): string => num.toString().padStart(2, '0');

// --- Shared UI Component: SLABadge ---
interface SLABadgeProps {
  sla: SLAState;
  dir: 'rtl' | 'ltr';
  label: string;
}

export const SLABadge: React.FC<SLABadgeProps> = ({ sla, dir, label }) => {
  const getStyles = (): React.CSSProperties => {
    let backgroundColor = COLORS.background;
    let color = COLORS.primary;
    let borderColor = COLORS.secondary;

    if (sla.isExpired) {
      backgroundColor = '#FEE2E2';
      color = COLORS.critical;
      borderColor = COLORS.critical;
    } else if (sla.alertLevel === 'critical') {
      backgroundColor = '#FEE2E2';
      color = COLORS.critical;
      borderColor = COLORS.critical;
    } else if (sla.alertLevel === 'warning') {
      backgroundColor = '#FEF3C7';
      color = COLORS.warning;
      borderColor = COLORS.warning;
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      borderRadius: '9999px',
      fontFamily: '"Cairo", sans-serif',
      fontSize: '14px',
      fontWeight: 700,
      direction: dir,
      textAlign: dir === 'rtl' ? 'right' : 'left',
      backgroundColor,
      color,
      border: `1.5px solid ${borderColor}`,
      transition: 'all 0.3s ease',
      letterSpacing: '0.5px',
    };
  };

  const formattedTime = sla.isExpired 
    ? (dir === 'rtl' ? 'منتهي' : 'EXPIRED') 
    : `${pad(sla.hours)}:${pad(sla.minutes)}:${pad(sla.seconds)}`;

  return (
    <div style={getStyles()} role="timer" aria-live="polite" aria-label={`${label} ${formattedTime}`}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: '70px', textAlign: 'center' }}>
        {formattedTime}
      </span>
    </div>
  );
};

// --- Target Component 1: DoctorReviewView (Saudi D01 - RTL) ---
interface DoctorReviewViewProps {
  clinicalCase: ClinicalCase;
  currentPersona: string;
}

export const DoctorReviewView: React.FC<DoctorReviewViewProps> = ({ clinicalCase, currentPersona }) => {
  const sla = useSLACountdown(clinicalCase);
  const isArabic = true; // Saudi Edition default
  const dir = isArabic ? 'rtl' : 'ltr';
  const slaLabel = isArabic ? 'الوقت المتبقي' : 'Remaining';

  const containerStyle: React.CSSProperties = {
    fontFamily: '"Cairo", sans-serif',
    direction: dir,
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: `1px solid ${COLORS.background}`,
    maxWidth: '800px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    color: COLORS.textDark,
    margin: 0,
  };

  return (
    <div style={containerStyle} data-persona={currentPersona} data-testid="doctor-review-view">
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          {isArabic ? `مراجعة الحالة: ${clinicalCase.patientName}` : `Case Review: ${clinicalCase.patientName}`}
        </h2>
        <SLABadge sla={sla} dir={dir} label={slaLabel} />
      </div>
      
      <div style={{ borderTop: `1px solid ${COLORS.background}`, paddingTop: '20px' }}>
        {/* Existing Doctor Review Content Placeholder */}
        <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: 1.6 }}>
          {isArabic 
            ? 'يرجى مراجعة السجلات الطبية المرفقة والموافقة على خطة العلاج المقترحة ضمن نافذة الوقت المحددة.' 
            : 'Please review the attached medical records and approve the proposed treatment plan within the designated time window.'}
        </p>
        
        <button
          style={{
            marginTop: '20px',
            backgroundColor: COLORS.primary,
            color: COLORS.textLight,
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontFamily: '"Cairo", sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.secondary)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
        >
          {isArabic ? 'اعتماد الخطة' : 'Approve Plan'}
        </button>
      </div>
    </div>
  );
};

// --- Target Component 2: ConsultantMobileView (Indian K05-K06 - LTR) ---
interface ConsultantMobileViewProps {
  clinicalCase: ClinicalCase;
  currentPersona: string;
}

export const ConsultantMobileView: React.FC<ConsultantMobileViewProps> = ({ clinicalCase, currentPersona }) => {
  const sla = useSLACountdown(clinicalCase);
  const isArabic = false; // Indian Consultant default
  const dir = isArabic ? 'rtl' : 'ltr';
  const slaLabel = 'SLA Remaining';

  const containerStyle: React.CSSProperties = {
    fontFamily: '"Cairo", sans-serif',
    direction: dir,
    backgroundColor: '#F9FAFB',
    minHeight: '100vh',
    padding: '16px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    marginBottom: '16px',
  };

  const topBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  };

  const patientNameStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: COLORS.textDark,
    margin: 0,
  };

  const statusChipStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: COLORS.primary,
    backgroundColor: COLORS.background,
    padding: '4px 10px',
    borderRadius: '12px',
  };

  return (
    <div style={containerStyle} data-persona={currentPersona} data-testid="consultant-mobile-view">
      <div style={cardStyle}>
        <div style={topBarStyle}>
          <h3 style={patientNameStyle}>{clinicalCase.patientName}</h3>
          <span style={statusChipStyle}>{clinicalCase.status.replace('_', ' ')}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <SLABadge sla={sla} dir={dir} label={slaLabel} />
        </div>
      </div>

      <div style={cardStyle}>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: COLORS.textDark, marginTop: 0, marginBottom: '12px' }}>
          Consultation Notes
        </h4>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
          Awaiting specialist review. Ensure all diagnostic reports are verified before finalizing the consultation response.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button
          style={{
            flex: 1,
            backgroundColor: COLORS.whatsapp,
            color: COLORS.textLight,
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            fontFamily: '"Cairo", sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Contact via WhatsApp
        </button>
        <button
          style={{
            flex: 1,
            backgroundColor: COLORS.primary,
            color: COLORS.textLight,
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            fontFamily: '"Cairo", sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};
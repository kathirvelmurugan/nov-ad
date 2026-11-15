import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ActivityLogEntry, ClinicalStage, RoleCode } from '../types';

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  textDark: '#1A2E2C',
  textLight: '#FFFFFF',
  border: '#B2DFDB'
};

const PERSONAS: Array<{ id: string; role: RoleCode; nameAr: string; nameEn: string; dir: 'rtl' | 'ltr' }> = [
  { id: 'p1', role: 'P', nameAr: 'سامي الحربي', nameEn: 'Sami Al-Harbi', dir: 'rtl' },
  { id: 'p2', role: 'N', nameAr: 'سارة القحطاني', nameEn: 'Sara Al-Qahtani', dir: 'rtl' },
  { id: 'p3', role: 'D', nameAr: 'د. فهد الحربي', nameEn: 'Dr. Fahad Al-Harbi', dir: 'rtl' },
  { id: 'p4', role: 'C', nameAr: 'منسق الحالة', nameEn: 'Case Coordinator', dir: 'ltr' },
  { id: 'p5', role: 'K', nameAr: 'Adrian Lewis', nameEn: 'Adrian Lewis', dir: 'ltr' },
  { id: 'p6', role: 'AD', nameAr: 'مدير النظام', nameEn: 'System Admin', dir: 'ltr' },
  { id: 'p7', role: 'D', nameAr: 'Emmanuel Arcon Gonzalez', nameEn: 'Emmanuel Arcon Gonzalez', dir: 'ltr' },
  { id: 'p8', role: 'D', nameAr: 'David Nunez', nameEn: 'David Nunez', dir: 'ltr' },
  { id: 'p9', role: 'D', nameAr: 'Marcus Vance', nameEn: 'Marcus Vance', dir: 'ltr' },
  { id: 'p10', role: 'D', nameAr: 'V. Prasanth', nameEn: 'V. Prasanth', dir: 'ltr' },
  { id: 'p11', role: 'P', nameAr: 'مريض دولي', nameEn: 'International Patient', dir: 'ltr' }
];

const ROLE_TITLES_AR: Record<RoleCode, string> = {
  P: 'مريض',
  N: 'ممرض/ة',
  D: 'طبيب',
  C: 'منسق',
  K: 'استشاري دولي',
  AD: 'مدير نظام'
};

const ROLE_TITLES_EN: Record<RoleCode, string> = {
  P: 'Patient',
  N: 'Nurse',
  D: 'Doctor',
  C: 'Coordinator',
  K: 'Consultant',
  AD: 'Admin'
};

interface AuditLedgerProps {
  caseId: string;
  initialTimeline?: ActivityLogEntry[];
  currentStage: ClinicalStage;
  lang: 'ar' | 'en';
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({
  caseId,
  initialTimeline = [],
  currentStage,
  lang
}) => {
  const [activePersonaId, setActivePersonaId] = useState<string>('p1');
  const [timeline, setTimeline] = useState<ActivityLogEntry[]>(initialTimeline);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const activePersona = useMemo(
    () => PERSONAS.find(p => p.id === activePersonaId) || PERSONAS[0],
    [activePersonaId]
  );

  const isRtl = activePersona.dir === 'rtl';

  const generateAstTimestamps = useCallback(() => {
    const now = new Date();
    const astOffset = 3 * 60 * 60 * 1000;
    const astTime = new Date(now.getTime() + astOffset + (now.getTimezoneOffset() * 60000));
    
    const hours = astTime.getHours();
    const minutes = astTime.getMinutes().toString().padStart(2, '0');
    const periodEn = hours >= 12 ? 'PM' : 'AM';
    const periodAr = hours >= 12 ? 'م' : 'ص';
    const displayHoursEn = hours % 12 || 12;
    const displayHoursAr = hours % 12 || 12;

    return {
      isoUtc: now.toISOString(),
      formattedTimeAr: `${displayHoursAr.toString().padStart(2, '0')}:${minutes} ${periodAr}`,
      formattedTimeEn: `${displayHoursEn.toString().padStart(2, '0')}:${minutes} ${periodEn} AST`
    };
  }, []);

  const mapStageToMilestone = useCallback((stage: ClinicalStage): { actionCode: string; summaryAr: string; summaryEn: string; isMilestone: boolean } | null => {
    switch (stage) {
      case 'INTAKE_RECEIVED':
        return {
          actionCode: 'M01',
          summaryAr: 'تم تسجيل الحالة والموافقة على سياسة الخصوصية',
          summaryEn: 'Case registered with MOH consent verified',
          isMilestone: true
        };
      case 'NURSE_CHECK':
        return {
          actionCode: 'M02',
          summaryAr: 'تم إجراء الفرز التمريضي للحالة',
          summaryEn: 'Nurse triage completed for case',
          isMilestone: true
        };
      case 'DOCTOR_REVIEW':
        return {
          actionCode: 'M03',
          summaryAr: 'تم اعتماد الحالة من قبل الطبيب',
          summaryEn: 'Doctor endorsement completed',
          isMilestone: true
        };
      case 'AWAITING_PAYMENT':
      case 'WITH_CONSULTANT':
        return {
          actionCode: 'M04',
          summaryAr: 'تم تنسيق الدفع وإرسال الحالة للاستشاري',
          summaryEn: 'Coordinator payment & dispatch completed',
          isMilestone: true
        };
      case 'OPINION_READY':
        return {
          actionCode: 'M05',
          summaryAr: 'رأي الاستشاري الدولي جاهز',
          summaryEn: 'International consultant opinion ready',
          isMilestone: true
        };
      default:
        return null;
    }
  }, []);

  const appendAuditEntry = useCallback(async (targetStage: ClinicalStage) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const milestoneData = mapStageToMilestone(targetStage);
      if (!milestoneData) {
        setIsProcessing(false);
        return;
      }

      const timestamps = generateAstTimestamps();
      
      const newEntry: ActivityLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        caseId,
        timestamp: timestamps.isoUtc,
        formattedTimeAr: timestamps.formattedTimeAr,
        formattedTimeEn: timestamps.formattedTimeEn,
        stage: targetStage,
        actorRole: activePersona.role,
        actorName: activePersona.nameEn,
        actorRoleTitleAr: ROLE_TITLES_AR[activePersona.role],
        actorRoleTitleEn: ROLE_TITLES_EN[activePersona.role],
        hospitalId: undefined,
        actionCode: milestoneData.actionCode,
        actionSummaryAr: milestoneData.summaryAr,
        actionSummaryEn: milestoneData.summaryEn,
        notesPreview: undefined,
        isMilestone: milestoneData.isMilestone
      };

      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activePersona.role,
          'x-user-phone': '+966500000000',
          'x-user-id': activePersona.id,
          'x-tenant-id': 'alo-doctor-saudi-v24'
        },
        body: JSON.stringify({
          case_id: caseId,
          target_stage: targetStage,
          timeline_entry: newEntry
        })
      });

      if (!response.ok) {
        throw new Error(`Backend rejected audit entry: ${response.status}`);
      }

      setTimeline(prev => [...prev, newEntry]);
    } catch (error) {
      console.error('Failed to append immutable audit entry:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [caseId, activePersona, isProcessing, generateAstTimestamps, mapStageToMilestone]);

  useEffect(() => {
    if (initialTimeline.length === 0 && currentStage === 'INTAKE_RECEIVED') {
      appendAuditEntry('INTAKE_RECEIVED');
    }
  }, [initialTimeline.length, currentStage, appendAuditEntry]);

  const containerStyle: React.CSSProperties = {
    direction: isRtl ? 'rtl' : 'ltr',
    fontFamily: 'Cairo, system-ui, -apple-system, sans-serif',
    backgroundColor: PALETTE.background,
    minHeight: '100vh',
    padding: '24px',
    color: PALETTE.textDark
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const personaSwitcherStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center'
  };

  const ledgerContainerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: PALETTE.textLight,
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
    overflow: 'hidden',
    border: `1px solid ${PALETTE.border}`
  };

  const entryStyle = (isMilestone: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px 24px',
    borderBottom: `1px solid ${PALETTE.border}`,
    backgroundColor: isMilestone ? 'rgba(0, 198, 174, 0.04)' : 'transparent',
    transition: 'background-color 0.2s ease'
  });

  const milestoneBadgeStyle: React.CSSProperties = {
    backgroundColor: PALETTE.primary,
    color: PALETTE.textLight,
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.5px'
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: `1px solid ${isActive ? PALETTE.primary : PALETTE.border}`,
    backgroundColor: isActive ? PALETTE.primary : PALETTE.textLight,
    color: isActive ? PALETTE.textLight : PALETTE.textDark,
    cursor: 'pointer',
    fontFamily: 'Cairo, sans-serif',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    outline: 'none'
  });

  const actionButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: PALETTE.whatsapp,
    color: PALETTE.textLight,
    cursor: isProcessing ? 'not-allowed' : 'pointer',
    fontFamily: 'Cairo, sans-serif',
    fontSize: '14px',
    fontWeight: 700,
    opacity: isProcessing ? 0.6 : 1,
    transition: 'opacity 0.2s ease'
  };

  const stages: ClinicalStage[] = ['INTAKE_RECEIVED', 'NURSE_CHECK', 'DOCTOR_REVIEW', 'AWAITING_PAYMENT', 'WITH_CONSULTANT', 'OPINION_READY'];

  return (
    <div style={containerStyle} aria-label="ALO DOCTOR Clinical Audit Ledger v2.4">
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: PALETTE.primary, fontWeight: 800 }}>
            {lang === 'ar' ? 'سجل التدقيق السريري' : 'Clinical Audit Ledger'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#5F7A77' }}>
            {lang === 'ar' ? 'دفتر أستاذ غير قابل للتغيير - توقيت السعودية (AST)' : 'Immutable Ledger - Saudi Arabia Standard Time (AST)'}
          </p>
        </div>

        <nav style={personaSwitcherStyle} aria-label="Persona Profile Switcher">
          <span style={{ fontSize: '13px', fontWeight: 600, color: PALETTE.primary }}>
            {lang === 'ar' ? 'تبديل الشخصية:' : 'Switch Persona:'}
          </span>
          {PERSONAS.map(persona => (
            <button
              key={persona.id}
              type="button"
              style={buttonStyle(activePersonaId === persona.id)}
              onClick={() => setActivePersonaId(persona.id)}
              aria-pressed={activePersonaId === persona.id}
              aria-label={`${lang === 'ar' ? 'اختر' : 'Select'} ${persona.nameEn}`}
            >
              {persona.nameEn}
            </button>
          ))}
        </nav>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto 24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {stages.map(stage => (
          <button
            key={stage}
            type="button"
            style={{
              ...actionButtonStyle,
              backgroundColor: currentStage === stage ? PALETTE.primary : PALETTE.secondary
            }}
            onClick={() => appendAuditEntry(stage)}
            disabled={isProcessing}
            aria-label={`Transition to ${stage}`}
          >
            {lang === 'ar' ? `انتقال إلى ${stage}` : `Transition to ${stage}`}
          </button>
        ))}
      </div>

      <main style={ledgerContainerStyle} role="log" aria-live="polite" aria-label="Audit Timeline">
        <div style={{ padding: '20px 24px', borderBottom: `2px solid ${PALETTE.primary}`, backgroundColor: PALETTE.primary }}>
          <h2 style={{ margin: 0, color: PALETTE.textLight, fontSize: '18px', fontWeight: 700 }}>
            {lang === 'ar' ? `سجل الحالة: ${caseId}` : `Case Ledger: ${caseId}`}
          </h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
            {lang === 'ar' ? `الممثل الحالي: ${activePersona.nameAr} (${ROLE_TITLES_AR[activePersona.role]})` : `Active Actor: ${activePersona.nameEn} (${ROLE_TITLES_EN[activePersona.role]})`}
          </p>
        </div>

        {timeline.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#5F7A77' }}>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>
              {lang === 'ar' ? 'لا توجد إدخالات في السجل بعد. قم ببدء انتقال المرحلة.' : 'No ledger entries yet. Initiate a stage transition.'}
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[...timeline].reverse().map(entry => (
              <li key={entry.id} style={entryStyle(entry.isMilestone)}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: entry.isMilestone ? PALETTE.primary : PALETTE.secondary,
                    border: `2px solid ${PALETTE.textLight}`,
                    boxShadow: `0 0 0 2px ${entry.isMilestone ? PALETTE.primary : PALETTE.secondary}`
                  }} />
                  {entry.isMilestone && (
                    <span style={milestoneBadgeStyle}>{entry.actionCode}</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: PALETTE.textDark }}>
                        {entry.actorName}
                      </span>
                      <span style={{ margin: isRtl ? '0 8px' : '0 8px', fontSize: '13px', color: '#5F7A77' }}>
                        {lang === 'ar' ? entry.actorRoleTitleAr : entry.actorRoleTitleEn}
                      </span>
                    </div>
                    <time dateTime={entry.timestamp} style={{ fontSize: '13px', color: PALETTE.primary, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {lang === 'ar' ? entry.formattedTimeAr : entry.formattedTimeEn}
                    </time>
                  </div>

                  <p style={{ margin: '0 0 4px', fontSize: '14px', lineHeight: 1.6, color: PALETTE.textDark }}>
                    {lang === 'ar' ? entry.actionSummaryAr : entry.actionSummaryEn}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#5F7A77' }}>
                    <span>{lang === 'ar' ? 'المرحلة:' : 'Stage:'} {entry.stage}</span>
                    <span>ID: {entry.id.substring(0, 16)}...</span>
                  </div>

                  {entry.notesPreview && (
                    <p style={{ margin: '8px 0 0', fontSize: '13px', fontStyle: 'italic', color: '#5F7A77', backgroundColor: PALETTE.background, padding: '8px 12px', borderRadius: '6px' }}>
                      {entry.notesPreview}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer style={{ maxWidth: '900px', margin: '24px auto 0', textAlign: 'center', fontSize: '12px', color: '#5F7A77' }}>
        <p>
          ALO DOCTOR v2.4 Saudi Edition • SDAIA / NPHIES Compliant Immutable Ledger • Server-Authoritative AST (UTC+3)
        </p>
      </footer>
    </div>
  );
};

export default AuditLedger;
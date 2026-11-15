import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// --- ALO DOCTOR v2.4 Saudi Edition Types & Interfaces ---

export interface ActivityLogEntry {
  id: string;
  actionCode?: string;
  stage?: string;
  timestamp: string | number;
  formattedTimeAr?: string;
  formattedTimeEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  actorName?: string;
  actorRole?: string;
}

export interface CaseRecord {
  id: string;
  status: string;
  currentStage?: string;
  createdAt: string | number;
  updatedAt: string | number;
  timeline?: ActivityLogEntry[];
}

export interface PersonaProfile {
  id: string;
  role: string;
  nameAr: string;
  nameEn: string;
}

interface CaseMilestoneHUDProps {
  activeCase: CaseRecord | null;
  activePersona: PersonaProfile | null;
  milestones: Array<{
    id: string;
    code: string;
    stage: string;
    labelAr: string;
    labelEn: string;
  }>;
}

// --- Utility Functions ---

const formatTimeAST = (timestamp: string | number | undefined | null, lang: string): string => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      timeZone: 'Asia/Riyadh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
};

const formatDateAST = (timestamp: string | number | undefined | null, lang: string): string => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
};

// --- Component ---

const CaseMilestoneHUD: React.FC<CaseMilestoneHUDProps> = ({
  activeCase,
  activePersona,
  milestones,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const isRTL = lang === 'ar';
  const [isLedgerOpen, setIsLedgerOpen] = useState<boolean>(false);

  // Requirement 1: Index events by actionCode AND by stage
  const completedEventsMap = useMemo(() => {
    const map = new Map<string, ActivityLogEntry>();
    if (activeCase?.timeline && Array.isArray(activeCase.timeline)) {
      activeCase.timeline.forEach((event) => {
        if (event.actionCode) map.set(event.actionCode, event);
        if (event.stage) map.set(event.stage, event);
      });
    }
    return map;
  }, [activeCase?.timeline]);

  // Synthesized audit rows for when timeline is empty but case is active
  const synthesizedAuditRows = useMemo((): ActivityLogEntry[] => {
    if (!activeCase) return [];
    if (activeCase.timeline && activeCase.timeline.length > 0) return activeCase.timeline;

    const rows: ActivityLogEntry[] = [];
    
    rows.push({
      id: `syn-created-${activeCase.id}`,
      actionCode: 'CASE_CREATED',
      stage: 'M01_INTAKE',
      timestamp: activeCase.createdAt,
      formattedTimeAr: formatTimeAST(activeCase.createdAt, 'ar'),
      formattedTimeEn: formatTimeAST(activeCase.createdAt, 'en'),
      descriptionAr: 'تم إنشاء الحالة تلقائياً',
      descriptionEn: 'Case auto-initialized',
      actorName: 'ALO System',
      actorRole: 'SYSTEM',
    });

    if (activeCase.currentStage && activeCase.currentStage !== 'M01_INTAKE') {
      rows.push({
        id: `syn-updated-${activeCase.id}`,
        actionCode: 'STAGE_ADVANCED',
        stage: activeCase.currentStage,
        timestamp: activeCase.updatedAt,
        formattedTimeAr: formatTimeAST(activeCase.updatedAt, 'ar'),
        formattedTimeEn: formatTimeAST(activeCase.updatedAt, 'en'),
        descriptionAr: 'تم تحديث المرحلة الحالية',
        descriptionEn: 'Current stage updated',
        actorName: 'ALO System',
        actorRole: 'SYSTEM',
      });
    }

    return rows;
  }, [activeCase]);

  const resolveTimestamp = (
    milestoneId: string,
    milestoneCode: string,
    milestoneStage: string,
    state: 'completed' | 'active' | 'upcoming'
  ): string => {
    const event = completedEventsMap.get(milestoneCode) || completedEventsMap.get(milestoneStage);

    if (event) {
      const resolved = event.formattedTimeAr || event.formattedTimeEn || formatTimeAST(event.timestamp, lang);
      if (resolved) return resolved;
    }

    // Guaranteed Fallback: Never render ⏰ --:-- for a completed milestone
    if (state === 'completed') {
      const fallbackTs = milestoneId === 'M01' || milestoneCode.startsWith('M01') 
        ? activeCase?.createdAt 
        : activeCase?.updatedAt;
      
      if (fallbackTs) {
        const formatted = formatTimeAST(fallbackTs, lang);
        if (formatted) return formatted;
      }
      // Absolute final fallback to prevent blank display
      return lang === 'ar' ? 'مكتمل' : 'Done';
    }

    if (state === 'active') {
      return lang === 'ar' ? 'جاري...' : 'In Progress...';
    }

    return '';
  };

  const getMilestoneState = (milestone: typeof milestones[0]): 'completed' | 'active' | 'upcoming' => {
    if (!activeCase) return 'upcoming';
    
    const event = completedEventsMap.get(milestone.code) || completedEventsMap.get(milestone.stage);
    if (event) return 'completed';

    if (activeCase.currentStage === milestone.stage) return 'active';

    const milestoneIndex = milestones.findIndex(m => m.id === milestone.id);
    const currentIndex = milestones.findIndex(m => m.stage === activeCase.currentStage);
    
    if (currentIndex !== -1 && milestoneIndex < currentIndex) return 'completed';

    return 'upcoming';
  };

  const auditCount = activeCase?.timeline?.length || (activeCase ? synthesizedAuditRows.length : 0);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Cairo', sans-serif",
        backgroundColor: '#E6FAF7',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #00C6AE',
        boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
        maxWidth: '800px',
        margin: '0 auto',
        color: '#0F172A',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '2px solid #00C6AE',
        paddingBottom: '12px',
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: 700,
          color: '#007B6E',
          fontFamily: "'Cairo', sans-serif",
        }}>
          {lang === 'ar' ? 'مستجدات الحالة' : 'Case Milestones'}
        </h2>
        {activePersona && (
          <span style={{
            fontSize: '12px',
            backgroundColor: '#007B6E',
            color: '#FFFFFF',
            padding: '4px 12px',
            borderRadius: '999px',
            fontWeight: 600,
            fontFamily: "'Cairo', sans-serif",
          }}>
            {lang === 'ar' ? activePersona.nameAr : activePersona.nameEn}
          </span>
        )}
      </div>

      {/* Stepper Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {milestones.map((milestone, index) => {
          const state = getMilestoneState(milestone);
          const timestamp = resolveTimestamp(milestone.id, milestone.code, milestone.stage, state);
          
          const isCompleted = state === 'completed';
          const isActive = state === 'active';

          return (
            <div
              key={milestone.id}
              role="listitem"
              aria-label={`${lang === 'ar' ? milestone.labelAr : milestone.labelEn} - ${state}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: isCompleted ? '#FFFFFF' : isActive ? '#E6FAF7' : '#F8FAFC',
                borderRadius: '12px',
                border: `1.5px solid ${isCompleted ? '#00C6AE' : isActive ? '#007B6E' : '#CBD5E1'}`,
                transition: 'all 0.2s ease',
                opacity: state === 'upcoming' ? 0.6 : 1,
              }}
            >
              {/* Step Indicator */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCompleted ? '#00C6AE' : isActive ? '#007B6E' : '#E2E8F0',
                color: isCompleted || isActive ? '#FFFFFF' : '#64748B',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
                fontFamily: "'Cairo', sans-serif",
              }}>
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Label */}
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 600,
                  color: isCompleted || isActive ? '#007B6E' : '#475569',
                  fontFamily: "'Cairo', sans-serif",
                }}>
                  {lang === 'ar' ? milestone.labelAr : milestone.labelEn}
                </p>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '11px',
                  color: '#64748B',
                  fontFamily: "'Cairo', monospace",
                  letterSpacing: '0.5px',
                }}>
                  {milestone.code}
                </p>
              </div>

              {/* Timestamp Display - ZERO FALLBACK GUARANTEE */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: isCompleted ? '#007B6E' : isActive ? '#007B6E' : '#94A3B8',
                fontFamily: "'Cairo', sans-serif",
                whiteSpace: 'nowrap',
              }}>
                <span aria-hidden="true">⏰</span>
                <time dateTime={isCompleted ? activeCase?.updatedAt?.toString() : undefined}>
                  {timestamp}
                </time>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Ledger Accordion */}
      <div style={{
        marginTop: '32px',
        border: '1px solid #00C6AE',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}>
        <button
          type="button"
          onClick={() => setIsLedgerOpen(!isLedgerOpen)}
          aria-expanded={isLedgerOpen}
          aria-controls="audit-ledger-content"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            backgroundColor: isLedgerOpen ? '#007B6E' : '#E6FAF7',
            color: isLedgerOpen ? '#FFFFFF' : '#007B6E',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            fontSize: '15px',
            fontWeight: 700,
            transition: 'all 0.2s ease',
          }}
        >
          <span>
            {lang === 'ar' ? 'سجل التدقيق' : 'Audit Ledger'} ({auditCount})
          </span>
          <span style={{
            transform: isLedgerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            fontSize: '12px',
          }}>
            ▼
          </span>
        </button>

        {isLedgerOpen && (
          <div
            id="audit-ledger-content"
            role="region"
            aria-label={lang === 'ar' ? 'محتوى سجل التدقيق' : 'Audit ledger content'}
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            {synthesizedAuditRows.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: '#64748B',
                fontSize: '14px',
                fontFamily: "'Cairo', sans-serif",
                padding: '24px 0',
              }}>
                {lang === 'ar' ? 'لا توجد سجلات متاحة' : 'No audit records available'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {synthesizedAuditRows.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#F8FFFE',
                      borderRadius: '8px',
                      borderRight: isRTL ? '4px solid #00C6AE' : 'none',
                      borderLeft: !isRTL ? '4px solid #00C6AE' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#007B6E',
                        fontFamily: "'Cairo', monospace",
                        backgroundColor: '#E6FAF7',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}>
                        {entry.actionCode || entry.stage || 'UNKNOWN'}
                      </span>
                      <time style={{
                        fontSize: '12px',
                        color: '#64748B',
                        fontFamily: "'Cairo', sans-serif",
                      }}>
                        {lang === 'ar' 
                          ? (entry.formattedTimeAr || formatDateAST(entry.timestamp, 'ar'))
                          : (entry.formattedTimeEn || formatDateAST(entry.timestamp, 'en'))
                        }
                      </time>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#334155',
                      fontFamily: "'Cairo', sans-serif",
                      lineHeight: 1.6,
                    }}>
                      {lang === 'ar' ? (entry.descriptionAr || 'لا يوجد وصف') : (entry.descriptionEn || 'No description')}
                    </p>
                    {(entry.actorName || entry.actorRole) && (
                      <p style={{
                        margin: 0,
                        fontSize: '11px',
                        color: '#94A3B8',
                        fontFamily: "'Cairo', sans-serif",
                      }}>
                        {lang === 'ar' ? 'بواسطة:' : 'By:'} {entry.actorName || ''} {entry.actorRole ? `(${entry.actorRole})` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Quick Action Integration Hint */}
      {activeCase && (
        <div style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              lang === 'ar' 
                ? `تحديث حالة الطلب ${activeCase.id}` 
                : `Case update for ${activeCase.id}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={lang === 'ar' ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              borderRadius: '999px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: "'Cairo', sans-serif",
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.3)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {lang === 'ar' ? 'مشاركة التحديث' : 'Share Update'}
          </a>
        </div>
      )}
    </div>
  );
};

export default CaseMilestoneHUD;
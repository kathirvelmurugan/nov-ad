import React, { useCallback, useMemo } from 'react';

// --- Types & Interfaces ---
export type CaseStage = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type PersonaId = string;

export interface PatientTimelineRecord {
  id: string;
  patientId: string;
  caseStage: CaseStage;
  reportsReleased: boolean;
  pdf1BlobUrl?: string;
  pdf2BlobUrl?: string;
  fullName?: string;
}

export interface TimelineDossierSummaryCardProps {
  record: PatientTimelineRecord;
  activePersonaId: PersonaId;
  locale: 'ar' | 'en';
}

export interface PatientStatusTimelineViewProps {
  records: PatientTimelineRecord[];
  activePersonaId: PersonaId;
  locale: 'ar' | 'en';
}

// --- Utilities ---
const STRICT_NAME_SCRUB_REGEX = /[\u0600-\u06FFa-zA-Z\s]{2,}/g;

export const scrubPatientName = (name?: string): string => {
  if (!name) return '';
  const matches = name.match(STRICT_NAME_SCRUB_REGEX);
  if (!matches || matches.length === 0) return '***';
  return matches.map(part => {
    if (part.trim().length <= 2) return part[0] + '*';
    return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
  }).join(' ');
};

export const triggerBlobDownload = async (blobUrl: string | undefined, fallbackFileName: string) => {
  if (!blobUrl) {
    console.warn(`[ALO DOCTOR v2.4] Missing blob URL for ${fallbackFileName}`);
    return;
  }
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fallbackFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`[ALO DOCTOR v2.4] Download failed for ${fallbackFileName}:`, error);
  }
};

// --- Styles (Pinterest-Teal Palette + Cairo RTL/LTR) ---
const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "'Cairo', sans-serif",
    backgroundColor: '#E6FAF7',
    minHeight: '100vh',
    padding: '24px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    border: '1px solid #00C6AE',
  },
  headerRtl: {
    direction: 'rtl',
    textAlign: 'right',
    color: '#007B6E',
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '16px',
  },
  headerLtr: {
    direction: 'ltr',
    textAlign: 'left',
    color: '#007B6E',
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '16px',
  },
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '24px',
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#007B6E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 4px 6px rgba(0, 123, 110, 0.2)',
  },
  downloadBtnHover: {
    backgroundColor: '#00C6AE',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 198, 174, 0.3)',
  },
  whatsappAccent: {
    color: '#25D366',
    fontSize: '14px',
    fontWeight: 600,
    marginTop: '8px',
  },
  scrubbedText: {
    color: '#007B6E',
    fontSize: '14px',
    opacity: 0.8,
    letterSpacing: '1px',
  }
};

// --- Component 1: TimelineDossierSummaryCard.tsx ---
export const TimelineDossierSummaryCard: React.FC<TimelineDossierSummaryCardProps> = ({
  record,
  activePersonaId,
  locale
}) => {
  const isArabic = locale === 'ar';
  const isClosedOrReleased = record.caseStage === 'CLOSED' || record.reportsReleased === true;
  const scrubbedName = scrubPatientName(record.fullName);

  const handlePdf1Download = useCallback(() => {
    triggerBlobDownload(record.pdf1BlobUrl, `alo-doctor-executive-report-${record.id}.pdf`);
  }, [record.pdf1BlobUrl, record.id]);

  const handlePdf2Download = useCallback(() => {
    triggerBlobDownload(record.pdf2BlobUrl, `alo-doctor-comprehensive-dossier-${record.id}.pdf`);
  }, [record.pdf2BlobUrl, record.id]);

  const [isHovering1, setIsHovering1] = React.useState(false);
  const [isHovering2, setIsHovering2] = React.useState(false);

  return (
    <article
      style={{
        ...styles.card,
        direction: isArabic ? 'rtl' : 'ltr',
        textAlign: isArabic ? 'right' : 'left',
      }}
      aria-label={isArabic ? 'بطاقة ملخص الملف الطبي' : 'Medical Dossier Summary Card'}
      data-persona-id={activePersonaId}
    >
      <header style={isArabic ? styles.headerRtl : styles.headerLtr}>
        {isArabic ? 'ملف الحالة الطبية' : 'Medical Case Dossier'}
      </header>

      <div style={{ marginBottom: '12px' }}>
        <span style={styles.scrubbedText}>{scrubbedName}</span>
      </div>

      <div style={{ color: '#007B6E', fontSize: '14px', fontWeight: 600 }}>
        {isArabic ? 'مرحلة الحالة: ' : 'Case Stage: '}
        <span style={{ color: isClosedOrReleased ? '#25D366' : '#00C6AE' }}>
          {record.caseStage}
        </span>
      </div>

      {/* Unconditional rendering of prominent download buttons when CLOSED or reportsReleased */}
      {isClosedOrReleased && (
        <div style={styles.actionsContainer} role="group" aria-label={isArabic ? 'إجراءات تحميل التقارير' : 'Report Download Actions'}>
          
          {/* PDF 1 Download Button */}
          <button
            type="button"
            data-testid="patient-pdf1-download-btn"
            onClick={handlePdf1Download}
            onMouseEnter={() => setIsHovering1(true)}
            onMouseLeave={() => setIsHovering1(false)}
            onFocus={() => setIsHovering1(true)}
            onBlur={() => setIsHovering1(false)}
            style={{
              ...styles.downloadBtn,
              ...(isHovering1 ? styles.downloadBtnHover : {}),
            }}
            aria-label={isArabic ? 'تحميل التقرير الطبي التنفيذي بي دي إف 1' : 'Download Executive Medical Report PDF 1'}
          >
            <span aria-hidden="true">📥</span>
            <span>
              {isArabic 
                ? 'تحميل التقرير الطبي التنفيذي (PDF 1)' 
                : 'Download Executive Medical Report (PDF 1)'}
            </span>
          </button>

          {/* PDF 2 Download Button */}
          <button
            type="button"
            data-testid="patient-pdf2-download-btn"
            onClick={handlePdf2Download}
            onMouseEnter={() => setIsHovering2(true)}
            onMouseLeave={() => setIsHovering2(false)}
            onFocus={() => setIsHovering2(true)}
            onBlur={() => setIsHovering2(false)}
            style={{
              ...styles.downloadBtn,
              ...(isHovering2 ? styles.downloadBtnHover : {}),
            }}
            aria-label={isArabic ? 'تحميل الملف الطبي الشامل بي دي إف 2' : 'Download Comprehensive Medical Dossier PDF 2'}
          >
            <span aria-hidden="true">📥</span>
            <span>
              {isArabic 
                ? 'تحميل الملف الطبي الشامل (PDF 2)' 
                : 'Download Comprehensive Medical Dossier (PDF 2)'}
            </span>
          </button>

          <p style={{ ...styles.whatsappAccent, textAlign: isArabic ? 'right' : 'left' }}>
            {isArabic ? 'مدعوم من ALO DOCTOR v2.4 Saudi Edition' : 'Powered by ALO DOCTOR v2.4 Saudi Edition'}
          </p>
        </div>
      )}
    </article>
  );
};

// --- Component 2: PatientStatusTimelineView.tsx ---
export const PatientStatusTimelineView: React.FC<PatientStatusTimelineViewProps> = ({
  records,
  activePersonaId,
  locale
}) => {
  const isArabic = locale === 'ar';

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      // Prioritize closed/released records at the top for immediate access
      const aClosed = a.caseStage === 'CLOSED' || a.reportsReleased ? 1 : 0;
      const bClosed = b.caseStage === 'CLOSED' || b.reportsReleased ? 1 : 0;
      if (aClosed !== bClosed) return bClosed - aClosed;
      return 0;
    });
  }, [records]);

  return (
    <main
      style={{
        ...styles.container,
        direction: isArabic ? 'rtl' : 'ltr',
      }}
      aria-label={isArabic ? 'عرض الجدول الزمني لحالة المريض' : 'Patient Status Timeline View'}
      data-component="PatientStatusTimelineView"
      data-version="2.4-saudi-edition"
    >
      <h1 style={{
        ...styles.headerRtl,
        fontSize: '28px',
        textAlign: isArabic ? 'right' : 'left',
        direction: isArabic ? 'rtl' : 'ltr',
        borderBottom: '2px solid #00C6AE',
        paddingBottom: '16px',
        marginBottom: '32px'
      }}>
        {isArabic ? 'السجل الزمني للحالات والتقارير' : 'Cases & Reports Timeline'}
      </h1>

      {sortedRecords.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#007B6E', padding: '40px', fontFamily: "'Cairo', sans-serif" }}>
          {isArabic ? 'لا توجد سجلات متاحة حالياً.' : 'No records available at this time.'}
        </div>
      ) : (
        <section aria-label={isArabic ? 'قائمة الحالات' : 'Cases List'}>
          {sortedRecords.map((record) => (
            <TimelineDossierSummaryCard
              key={record.id}
              record={record}
              activePersonaId={activePersonaId}
              locale={locale}
            />
          ))}
        </section>
      )}

      <footer style={{
        marginTop: '48px',
        paddingTop: '24px',
        borderTop: '1px solid #00C6AE',
        textAlign: 'center',
        color: '#007B6E',
        fontSize: '12px',
        fontFamily: "'Cairo', sans-serif",
        opacity: 0.7
      }}>
        ALO DOCTOR v2.4 Saudi Edition • Secure Patient Portal • Zero Artificial Gates
      </footer>
    </main>
  );
};

export default PatientStatusTimelineView;
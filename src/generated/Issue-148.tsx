import React, { useState, useEffect, useCallback, useMemo } from 'react';
import NurseDoctorAssignmentSection from './nurse/NurseDoctorAssignmentSection';

export interface MilestoneEvent {
  id: string;
  code: string;
  timestamp: number;
  actorRole: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface CaseRecord {
  id: string;
  patientNameEn: string;
  patientNameAr: string;
  stage: number;
  stageLabel: string;
  symptoms: string[];
  redFlags: string[];
  scanUrls: string[];
  assignedDoctorId?: string;
  milestones: MilestoneEvent[];
  updatedAt: number;
}

export interface NurseTriageViewProps {
  currentPersonaId: string;
  language: 'ar' | 'en';
  cases: CaseRecord[];
  onUpdateCase: (updatedCase: CaseRecord) => void;
  nursePhone: string;
}

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textLight: '#4A4A4A',
  danger: '#D32F2F',
};

const TARGET_DOCTOR = {
  id: 'doc-001',
  nameEn: 'Dr. Fahad Al-Harbi',
  nameAr: 'د. فهد الحربي',
  specialtyEn: 'Cardiology/Surgery',
  specialtyAr: 'طب القلب والجراحة',
  facilityEn: 'Riyadh Care Medical Center',
  facilityAr: 'مركز رعاية الرياض الطبي',
};

const NURSE_TRIAGE_STAGE = 2;
const DOCTOR_REVIEW_STAGE = 3;
const REQUIRED_NURSE_PHONE = '+966500000004';

const NurseTriageView: React.FC<NurseTriageViewProps> = ({
  currentPersonaId,
  language,
  cases,
  onUpdateCase,
  nursePhone,
}) => {
  const [isLiveFetching, setIsLiveFetching] = useState<boolean>(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [assignmentConfirmed, setAssignmentConfirmed] = useState<boolean>(false);

  const isRtl = language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const fontFamily = "'Cairo', sans-serif";

  const triageQueue = useMemo(() => {
    return cases
      .filter((c) => c.stage === NURSE_TRIAGE_STAGE)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [cases]);

  const selectedCase = useMemo(() => {
    return triageQueue.find((c) => c.id === selectedCaseId) || null;
  }, [triageQueue, selectedCaseId]);

  useEffect(() => {
    setIsLiveFetching(true);
    const fetchTimer = setTimeout(() => {
      setIsLiveFetching(false);
    }, 600);
    return () => clearTimeout(fetchTimer);
  }, [cases.length]);

  useEffect(() => {
    if (!selectedCase) {
      setAssignmentConfirmed(false);
    }
  }, [selectedCase]);

  const handleForwardToDoctor = useCallback(() => {
    if (!selectedCase || !assignmentConfirmed) return;
    if (nursePhone !== REQUIRED_NURSE_PHONE) return;

    const m02Milestone: MilestoneEvent = {
      id: `ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: 'M02',
      timestamp: Date.now(),
      actorRole: 'NURSE',
      descriptionEn: 'Case forwarded to Saudi Treating Doctor for clinical review.',
      descriptionAr: 'تمت إحالة الحالة للطبيب المعالج السعودي للمراجعة السريرية.',
    };

    const updatedCase: CaseRecord = {
      ...selectedCase,
      stage: DOCTOR_REVIEW_STAGE,
      stageLabel: 'DOCTOR_REVIEW',
      assignedDoctorId: TARGET_DOCTOR.id,
      milestones: [...selectedCase.milestones, m02Milestone],
      updatedAt: Date.now(),
    };

    onUpdateCase(updatedCase);
    setSelectedCaseId(null);
    setAssignmentConfirmed(false);
  }, [selectedCase, assignmentConfirmed, nursePhone, onUpdateCase]);

  const containerStyle: React.CSSProperties = {
    direction: dir,
    fontFamily,
    backgroundColor: PALETTE.background,
    minHeight: '100vh',
    padding: isRtl ? '24px 32px 24px 24px' : '24px 24px 24px 32px',
    color: PALETTE.textDark,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    borderBottom: `2px solid ${PALETTE.secondary}`,
    paddingBottom: '16px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: PALETTE.primary,
    margin: 0,
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: PALETTE.primary,
    color: PALETTE.white,
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: selectedCase ? '1fr 1.5fr' : '1fr',
    gap: '24px',
    transition: 'all 0.3s ease',
  };

  const queuePanelStyle: React.CSSProperties = {
    backgroundColor: PALETTE.white,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    border: `1px solid ${PALETTE.secondary}33`,
  };

  const caseCardStyle = (isActive: boolean): React.CSSProperties => ({
    backgroundColor: isActive ? `${PALETTE.secondary}1A` : PALETTE.white,
    border: `1px solid ${isActive ? PALETTE.primary : '#E0E0E0'}`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  });

  const detailPanelStyle: React.CSSProperties = {
    backgroundColor: PALETTE.white,
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    border: `1px solid ${PALETTE.secondary}33`,
  };

  const forwardButtonStyle: React.CSSProperties = {
    backgroundColor: assignmentConfirmed ? PALETTE.whatsapp : '#B0BEC5',
    color: PALETTE.white,
    border: 'none',
    borderRadius: '12px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily,
    cursor: assignmentConfirmed ? 'pointer' : 'not-allowed',
    width: '100%',
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'background-color 0.2s ease',
  };

  const symptomTagStyle: React.CSSProperties = {
    backgroundColor: `${PALETTE.secondary}22`,
    color: PALETTE.primary,
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 600,
    display: 'inline-block',
    margin: isRtl ? '0 0 8px 8px' : '0 8px 8px 0',
  };

  const redFlagTagStyle: React.CSSProperties = {
    ...symptomTagStyle,
    backgroundColor: `${PALETTE.danger}15`,
    color: PALETTE.danger,
    border: `1px solid ${PALETTE.danger}44`,
  };

  const renderQueueList = () => {
    if (isLiveFetching) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: PALETTE.primary }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${PALETTE.background}`,
              borderTop: `3px solid ${PALETTE.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ fontFamily, fontWeight: 600 }}>
            {language === 'ar' ? 'جاري تحميل قائمة الفرز...' : 'Loading triage queue...'}
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    if (triageQueue.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: PALETTE.textLight }}>
          <p style={{ fontFamily, fontSize: '16px' }}>
            {language === 'ar' ? 'لا توجد حالات في مرحلة فرز التمريض حالياً.' : 'No cases currently in nurse triage stage.'}
          </p>
        </div>
      );
    }

    return triageQueue.map((caseItem) => (
      <div
        key={caseItem.id}
        role="button"
        tabIndex={0}
        aria-label={`${language === 'ar' ? 'حالة' : 'Case'} ${caseItem.id}`}
        aria-pressed={selectedCaseId === caseItem.id}
        style={caseCardStyle(selectedCaseId === caseItem.id)}
        onClick={() => setSelectedCaseId(caseItem.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedCaseId(caseItem.id);
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: PALETTE.textDark, fontFamily }}>
            {language === 'ar' ? caseItem.patientNameAr : caseItem.patientNameEn}
          </h4>
          <span style={{ fontSize: '12px', color: PALETTE.textLight, fontFamily }}>
            #{caseItem.id.slice(-6).toUpperCase()}
          </span>
        </div>
        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {caseItem.redFlags.length > 0 && (
            <span style={{ fontSize: '12px', color: PALETTE.danger, fontWeight: 700, fontFamily }}>
              {language === 'ar' ? '⚠ علامات تحذيرية' : '⚠ Red Flags Present'}
            </span>
          )}
        </div>
      </div>
    ));
  };

  const renderCaseDetails = () => {
    if (!selectedCase) {
      return (
        <div style={detailPanelStyle}>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: PALETTE.textLight }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={PALETTE.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p style={{ fontFamily, fontSize: '18px', marginTop: '16px', fontWeight: 600 }}>
              {language === 'ar' ? 'اختر حالة من قائمة الفرز لعرض التفاصيل' : 'Select a case from the triage queue to view details'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div style={detailPanelStyle}>
        <header style={{ marginBottom: '24px', borderBottom: `1px solid #EEEEEE`, paddingBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: PALETTE.primary, fontFamily }}>
            {language === 'ar' ? selectedCase.patientNameAr : selectedCase.patientNameEn}
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: PALETTE.textLight, fontFamily }}>
            {language === 'ar' ? 'رقم الحالة: ' : 'Case ID: '} {selectedCase.id}
          </p>
        </header>

        <section aria-labelledby="symptoms-heading" style={{ marginBottom: '24px' }}>
          <h3 id="symptoms-heading" style={{ fontSize: '16px', fontWeight: 700, color: PALETTE.textDark, marginBottom: '12px', fontFamily }}>
            {language === 'ar' ? 'الأعراض المسجلة' : 'Reported Symptoms'}
          </h3>
          <div>
            {selectedCase.symptoms.map((symptom, idx) => (
              <span key={`sym-${idx}`} style={symptomTagStyle}>{symptom}</span>
            ))}
          </div>
        </section>

        {selectedCase.redFlags.length > 0 && (
          <section aria-labelledby="redflags-heading" style={{ marginBottom: '24px' }}>
            <h3 id="redflags-heading" style={{ fontSize: '16px', fontWeight: 700, color: PALETTE.danger, marginBottom: '12px', fontFamily }}>
              {language === 'ar' ? 'العلامات التحذيرية' : 'Red Flags'}
            </h3>
            <div>
              {selectedCase.redFlags.map((flag, idx) => (
                <span key={`flag-${idx}`} style={redFlagTagStyle}>{flag}</span>
              ))}
            </div>
          </section>
        )}

        {selectedCase.scanUrls.length > 0 && (
          <section aria-labelledby="scans-heading" style={{ marginBottom: '32px' }}>
            <h3 id="scans-heading" style={{ fontSize: '16px', fontWeight: 700, color: PALETTE.textDark, marginBottom: '12px', fontFamily }}>
              {language === 'ar' ? 'الفحوصات المرفوعة' : 'Uploaded Scans'}
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {selectedCase.scanUrls.map((url, idx) => (
                <a
                  key={`scan-${idx}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: PALETTE.background,
                    color: PALETTE.primary,
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily,
                    border: `1px solid ${PALETTE.secondary}44`,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {language === 'ar' ? `فحص ${idx + 1}` : `Scan ${idx + 1}`}
                </a>
              ))}
            </div>
          </section>
        )}

        <NurseDoctorAssignmentSection
          language={language}
          doctor={TARGET_DOCTOR}
          onConfirmAssignment={setAssignmentConfirmed}
          isConfirmed={assignmentConfirmed}
        />

        <button
          type="button"
          onClick={handleForwardToDoctor}
          disabled={!assignmentConfirmed || nursePhone !== REQUIRED_NURSE_PHONE}
          style={forwardButtonStyle}
          aria-label={language === 'ar' ? 'إحالة للطبيب المعالج N07' : 'Forward to Saudi Treating Doctor N07'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          {language === 'ar'
            ? 'إحالة للطبيب المعالج السعودي (N07)'
            : 'Forward to Saudi Treating Doctor (N07)'}
        </button>

        {nursePhone !== REQUIRED_NURSE_PHONE && (
          <p style={{ color: PALETTE.danger, fontSize: '13px', textAlign: 'center', marginTop: '12px', fontFamily, fontWeight: 600 }}>
            {language === 'ar' ? 'غير مصرح: رقم هاتف التمريض غير مطابق.' : 'Unauthorized: Nurse phone number mismatch.'}
          </p>
        )}
      </div>
    );
  };

  return (
    <main style={containerStyle} role="main" aria-label={language === 'ar' ? 'واجهة فرز التمريض' : 'Nurse Triage Interface'}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          {language === 'ar' ? 'لوحة فرز التمريض' : 'Nurse Triage Dashboard'}
        </h1>
        <div style={badgeStyle} aria-live="polite">
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isLiveFetching ? '#FFC107' : PALETTE.whatsapp,
            display: 'inline-block',
          }} />
          {language === 'ar'
            ? `قائمة الانتظار (${triageQueue.length})`
            : `Queue Active (${triageQueue.length})`}
        </div>
      </header>

      <div style={gridStyle}>
        <section style={queuePanelStyle} aria-labelledby="queue-heading">
          <h2 id="queue-heading" style={{ fontSize: '18px', fontWeight: 700, color: PALETTE.primary, marginTop: 0, marginBottom: '20px', fontFamily }}>
            {language === 'ar' ? 'حالات مرحلة فحص التمريض' : 'Nurse Check Stage Cases'}
          </h2>
          <div role="listbox" aria-label={language === 'ar' ? 'قائمة الحالات' : 'Case List'}>
            {renderQueueList()}
          </div>
        </section>

        {selectedCase && (
          <section aria-labelledby="details-heading">
            <h2 id="details-heading" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
              {language === 'ar' ? 'تفاصيل الحالة' : 'Case Details'}
            </h2>
            {renderCaseDetails()}
          </section>
        )}
      </div>
    </main>
  );
};

export default NurseTriageView;
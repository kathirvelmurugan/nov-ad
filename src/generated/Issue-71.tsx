import React, { useState, useEffect, useCallback } from 'react';
import NurseTriageSummaryHeader from './nurse/NurseTriageSummaryHeader';
import NurseScanInspectionSection from './nurse/NurseScanInspectionSection';
import NurseDoctorAssignmentSection from './nurse/NurseDoctorAssignmentSection';
import NurseTriageFormSection from './nurse/NurseTriageFormSection';

export interface TriageCase {
  id: string;
  nationalId: string;
  patientNameAr: string;
  patientNameEn: string;
  age: number;
  gender: 'M' | 'F';
  chiefComplaintAr: string;
  chiefComplaintEn: string;
  arrivalTime: number;
  slaDeadline: number;
}

export interface ScanRecord {
  id: string;
  type: 'DICOM' | 'ECHO' | 'XRAY' | 'MRI';
  timestamp: number;
  piiCleared: boolean;
  loopActive: boolean;
}

export interface DoctorCandidate {
  id: string;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  licenseNumber: string;
  isAccreditedSaudi: boolean;
  availabilityScore: number;
}

export interface TriageFormData {
  n05NotesAr: string;
  n05NotesEn: string;
  clinicalObservations: string;
  vitals: Record<string, number>;
  n07RouteApproved: boolean;
}

export interface NurseTriageViewProps {
  caseData: TriageCase;
  scans: ScanRecord[];
  availableDoctors: DoctorCandidate[];
  currentPersonaId: string;
  language: 'ar' | 'en';
  onAssignDoctor: (doctorId: string) => void;
  onSubmitTriage: (formData: TriageFormData) => void;
  onScanAction: (scanId: string, action: string) => void;
}

const NurseTriageView: React.FC<NurseTriageViewProps> = ({
  caseData,
  scans,
  availableDoctors,
  currentPersonaId,
  language,
  onAssignDoctor,
  onSubmitTriage,
  onScanAction,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'scans' | 'assignment' | 'triage'>('summary');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const fontFamily = 'Cairo, sans-serif';

  const handleTabChange = useCallback((tab: 'summary' | 'scans' | 'assignment' | 'triage') => {
    setActiveTab(tab);
  }, []);

  const handleSubmitTriage = useCallback(async (formData: TriageFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmitTriage(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmitTriage]);

  const containerStyle: React.CSSProperties = {
    direction: dir,
    fontFamily,
    backgroundColor: '#E6FAF7',
    minHeight: '100vh',
    padding: isRTL ? '16px 24px 16px 16px' : '16px 16px 16px 24px',
    color: '#007B6E',
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #00C6AE',
    paddingBottom: '8px',
    flexWrap: 'wrap',
  };

  const getTabStyle = (tab: string): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    cursor: 'pointer',
    fontFamily,
    fontWeight: activeTab === tab ? 700 : 400,
    backgroundColor: activeTab === tab ? '#007B6E' : 'transparent',
    color: activeTab === tab ? '#FFFFFF' : '#007B6E',
    transition: 'all 0.2s ease-in-out',
    fontSize: '14px',
  });

  const tabs = [
    { id: 'summary' as const, labelAr: 'الملخص', labelEn: 'Summary' },
    { id: 'scans' as const, labelAr: 'الفحوصات', labelEn: 'Scans' },
    { id: 'assignment' as const, labelAr: 'تعيين الطبيب', labelEn: 'Assignment' },
    { id: 'triage' as const, labelAr: 'الفرز', labelEn: 'Triage' },
  ];

  return (
    <div style={containerStyle} data-testid="nurse-triage-view" data-persona={currentPersonaId}>
      <nav style={navStyle} role="tablist" aria-label={isRTL ? 'تنقل الفرز' : 'Triage Navigation'}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            data-testid={`triage-tab-${tab.id}`}
            style={getTabStyle(tab.id)}
            onClick={() => handleTabChange(tab.id)}
          >
            {language === 'ar' ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </nav>

      <main role="tabpanel" data-testid="triage-active-panel">
        {activeTab === 'summary' && (
          <NurseTriageSummaryHeader
            caseData={caseData}
            language={language}
            data-testid="nurse-triage-summary-header"
          />
        )}

        {activeTab === 'scans' && (
          <NurseScanInspectionSection
            scans={scans}
            language={language}
            onScanAction={onScanAction}
            data-testid="nurse-scan-inspection-section"
          />
        )}

        {activeTab === 'assignment' && (
          <NurseDoctorAssignmentSection
            doctors={availableDoctors}
            language={language}
            onAssignDoctor={onAssignDoctor}
            data-testid="nurse-doctor-assignment-section"
          />
        )}

        {activeTab === 'triage' && (
          <NurseTriageFormSection
            caseData={caseData}
            language={language}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitTriage}
            data-testid="nurse-triage-form-section"
          />
        )}
      </main>

      <footer
        style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#00C6AE' }}
        data-testid="alo-doctor-v2.4-footer"
      >
        ALO DOCTOR v2.4 Saudi Edition | N06 Protocol Active
      </footer>
    </div>
  );
};

export default NurseTriageView;


import React, { useState, useEffect } from 'react';
import type { TriageCase } from '../NurseTriageView';

interface NurseTriageSummaryHeaderProps {
  caseData: TriageCase;
  language: 'ar' | 'en';
  'data-testid'?: string;
}

const NurseTriageSummaryHeader: React.FC<NurseTriageSummaryHeaderProps> = ({
  caseData,
  language,
  'data-testid': testId,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const isRTL = language === 'ar';

  useEffect(() => {
    const calculateSLA = () => {
      const now = Date.now();
      const remaining = Math.max(0, caseData.slaDeadline - now);
      setTimeRemaining(remaining);
    };

    calculateSLA();
    const interval = setInterval(calculateSLA, 1000);
    return () => clearInterval(interval);
  }, [caseData.slaDeadline]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeRemaining < 300000;

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    borderRight: isRTL ? '6px solid #007B6E' : 'none',
    borderLeft: !isRTL ? '6px solid #007B6E' : 'none',
    fontFamily: 'Cairo, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  };

  const slaBadgeStyle: React.CSSProperties = {
    backgroundColor: isUrgent ? '#FF4D4F' : '#00C6AE',
    color: '#FFFFFF',
    padding: '6px 16px',
    borderRadius: '20px',
    fontWeight: 700,
    fontSize: '16px',
    fontVariantNumeric: 'tabular-nums',
    minWidth: '80px',
    textAlign: 'center',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#00C6AE',
    fontWeight: 600,
    textTransform: 'uppercase',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#007B6E',
    fontWeight: 500,
  };

  const labels = {
    ar: {
      title: 'ملخص حالة الفرز',
      nationalId: 'رقم الهوية الوطنية',
      patientName: 'اسم المريض',
      age: 'العمر',
      gender: 'الجنس',
      complaint: 'الشكوى الرئيسية',
      arrival: 'وقت الوصول',
      sla: 'العد التنازلي SLA',
      male: 'ذكر',
      female: 'أنثى',
    },
    en: {
      title: 'Triage Case Summary',
      nationalId: 'National ID',
      patientName: 'Patient Name',
      age: 'Age',
      gender: 'Gender',
      complaint: 'Chief Complaint',
      arrival: 'Arrival Time',
      sla: 'SLA Countdown',
      male: 'Male',
      female: 'Female',
    },
  };

  const t = labels[language];

  return (
    <div style={containerStyle} data-testid={testId || 'nurse-triage-summary-header'}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#007B6E' }}>{t.title}</h2>
        <div
          style={slaBadgeStyle}
          role="timer"
          aria-live="polite"
          aria-label={t.sla}
          data-testid="sla-countdown-timer"
        >
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div style={gridStyle}>
        <div style={fieldStyle}>
          <span style={labelStyle}>{t.nationalId}</span>
          <span style={valueStyle} data-testid="patient-national-id">{caseData.nationalId}</span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>{t.patientName}</span>
          <span style={valueStyle} data-testid="patient-name">
            {language === 'ar' ? caseData.patientNameAr : caseData.patientNameEn}
          </span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>{t.age}</span>
          <span style={valueStyle} data-testid="patient-age">{caseData.age}</span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>{t.gender}</span>
          <span style={valueStyle} data-testid="patient-gender">
            {caseData.gender === 'M' ? t.male : t.female}
          </span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>{t.arrival}</span>
          <span style={valueStyle} data-testid="patient-arrival">
            {new Date(caseData.arrivalTime).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
          </span>
        </div>

        <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
          <span style={labelStyle}>{t.complaint}</span>
          <span style={valueStyle} data-testid="chief-complaint">
            {language === 'ar' ? caseData.chiefComplaintAr : caseData.chiefComplaintEn}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NurseTriageSummaryHeader;


import React, { useState, useCallback } from 'react';
import type { ScanRecord } from '../NurseTriageView';

interface NurseScanInspectionSectionProps {
  scans: ScanRecord[];
  language: 'ar' | 'en';
  onScanAction: (scanId: string, action: string) => void;
  'data-testid'?: string;
}

const NurseScanInspectionSection: React.FC<NurseScanInspectionSectionProps> = ({
  scans,
  language,
  onScanAction,
  'data-testid': testId,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const isRTL = language === 'ar';

  const handleDeidentify = useCallback(async (scanId: string) => {
    setProcessingId(scanId);
    try {
      await onScanAction(scanId, 'DEIDENTIFY_PII');
    } finally {
      setProcessingId(null);
    }
  }, [onScanAction]);

  const handleEchoLoop = useCallback((scanId: string) => {
    onScanAction(scanId, 'TOGGLE_ECHO_LOOP');
  }, [onScanAction]);

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    fontFamily: 'Cairo, sans-serif',
  };

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  };

  const cardStyle = (piiCleared: boolean): React.CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: piiCleared ? '#E6FAF7' : '#FFF9F9',
    border: `1px solid ${piiCleared ? '#00C6AE' : '#FFCCC7'}`,
    flexWrap: 'wrap',
    gap: '12px',
  });

  const badgeStyle = (type: string): React.CSSProperties => ({
    backgroundColor: type === 'DICOM' ? '#007B6E' : '#00C6AE',
    color: '#FFFFFF',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  });

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger'): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Cairo, sans-serif',
    fontWeight: 600,
    fontSize: '13px',
    backgroundColor: variant === 'primary' ? '#007B6E' : variant === 'danger' ? '#FF4D4F' : '#E6FAF7',
    color: variant === 'secondary' ? '#007B6E' : '#FFFFFF',
    transition: 'opacity 0.2s',
  });

  const labels = {
    ar: {
      title: 'فحص الصور الطبية',
      deidentify: 'إخفاء الهوية',
      processing: 'جاري المعالجة...',
      echoLoop: 'حلقة الصدى',
      stopLoop: 'إيقاف الحلقة',
      cleared: 'تم مسح البيانات الشخصية',
      pending: 'بانتظار إخفاء الهوية',
      noScans: 'لا توجد فحوصات متاحة',
      time: 'الوقت',
    },
    en: {
      title: 'Medical Scan Inspection',
      deidentify: 'De-identify PII',
      processing: 'Processing...',
      echoLoop: 'Echo Loop',
      stopLoop: 'Stop Loop',
      cleared: 'PII Cleared',
      pending: 'Pending De-identification',
      noScans: 'No scans available',
      time: 'Time',
    },
  };

  const t = labels[language];

  return (
    <div style={containerStyle} data-testid={testId || 'nurse-scan-inspection-section'}>
      <h2 style={{ margin: 0, fontSize: '20px', color: '#007B6E' }}>{t.title}</h2>

      <div style={listStyle} role="list" data-testid="scan-list">
        {scans.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#00C6AE', padding: '24px' }}>{t.noScans}</p>
        ) : (
          scans.map((scan) => (
            <div
              key={scan.id}
              style={cardStyle(scan.piiCleared)}
              role="listitem"
              data-testid={`scan-card-${scan.id}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <span style={badgeStyle(scan.type)}>{scan.type}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#007B6E' }}>
                    ID: {scan.id.substring(0, 8)}...
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {t.time}: {new Date(scan.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: scan.piiCleared ? '#007B6E' : '#FF4D4F',
                  }}
                  data-testid={`pii-status-${scan.id}`}
                >
                  {scan.piiCleared ? t.cleared : t.pending}
                </span>

                {!scan.piiCleared && (
                  <button
                    style={buttonStyle('danger')}
                    onClick={() => handleDeidentify(scan.id)}
                    disabled={processingId === scan.id}
                    data-testid={`btn-deidentify-${scan.id}`}
                    aria-label={`${t.deidentify} ${scan.id}`}
                  >
                    {processingId === scan.id ? t.processing : t.deidentify}
                  </button>
                )}

                {scan.type === 'ECHO' && (
                  <button
                    style={buttonStyle(scan.loopActive ? 'secondary' : 'primary')}
                    onClick={() => handleEchoLoop(scan.id)}
                    data-testid={`btn-echo-loop-${scan.id}`}
                    aria-label={`${scan.loopActive ? t.stopLoop : t.echoLoop} ${scan.id}`}
                  >
                    {scan.loopActive ? t.stopLoop : t.echoLoop}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NurseScanInspectionSection;


import React, { useState, useMemo, useCallback } from 'react';
import type { DoctorCandidate } from '../NurseTriageView';

interface NurseDoctorAssignmentSectionProps {
  doctors: DoctorCandidate[];
  language: 'ar' | 'en';
  onAssignDoctor: (doctorId: string) => void;
  'data-testid'?: string;
}

const NurseDoctorAssignmentSection: React.FC<NurseDoctorAssignmentSectionProps> = ({
  doctors,
  language,
  onAssignDoctor,
  'data-testid': testId,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const isRTL = language === 'ar';

  const accreditedDoctors = useMemo(() => {
    return doctors
      .filter((doc) => doc.isAccreditedSaudi)
      .sort((a, b) => b.availabilityScore - a.availabilityScore);
  }, [doctors]);

  const handleAssign = useCallback(async () => {
    if (!selectedDoctorId) return;
    setIsAssigning(true);
    try {
      await onAssignDoctor(selectedDoctorId);
    } finally {
      setIsAssigning(false);
    }
  }, [selectedDoctorId, onAssignDoctor]);

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    fontFamily: 'Cairo, sans-serif',
  };

  const listStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  };

  const cardStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '16px',
    borderRadius: '10px',
    border: `2px solid ${isSelected ? '#007B6E' : '#E6FAF7'}`,
    backgroundColor: isSelected ? '#E6FAF7' : '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  });

  const saudiBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#25D366',
    color: '#FFFFFF',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 700,
  };

  const assignBtnStyle: React.CSSProperties = {
    marginTop: '24px',
    width: '100%',
    padding: '14px',
    backgroundColor: selectedDoctorId ? '#007B6E' : '#CCCCCC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    cursor: selectedDoctorId ? 'pointer' : 'not-allowed',
    transition: 'background-color 0.2s',
  };

  const labels = {
    ar: {
      title: 'تعيين طبيب معتمد (بروتوكول N06)',
      selectDoctor: 'اختر طبيباً',
      specialty: 'التخصص',
      license: 'رقم الرخصة',
      availability: 'نسبة التوفر',
      assign: 'تعيين الطبيب وإرسال N06',
      assigning: 'جاري التعيين...',
      accredited: 'معتمد سعودي',
      noDoctors: 'لا يوجد أطباء معتمدون متاحون حالياً',
    },
    en: {
      title: 'Assign Accredited Doctor (N06 Protocol)',
      selectDoctor: 'Select Doctor',
      specialty: 'Specialty',
      license: 'License No.',
      availability: 'Availability',
      assign: 'Assign Doctor & Dispatch N06',
      assigning: 'Assigning...',
      accredited: 'Saudi Accredited',
      noDoctors: 'No accredited doctors currently available',
    },
  };

  const t = labels[language];

  return (
    <div style={containerStyle} data-testid={testId || 'nurse-doctor-assignment-section'}>
      <h2 style={{ margin: 0, fontSize: '20px', color: '#007B6E' }}>{t.title}</h2>

      <div style={listStyle} role="radiogroup" aria-label={t.selectDoctor}>
        {accreditedDoctors.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#00C6AE', padding: '24px' }}>
            {t.noDoctors}
          </p>
        ) : (
          accreditedDoctors.map((doc) => {
            const isSelected = selectedDoctorId === doc.id;
            return (
              <div
                key={doc.id}
                style={cardStyle(isSelected)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                data-testid={`doctor-card-${doc.id}`}
                onClick={() => setSelectedDoctorId(doc.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDoctorId(doc.id);
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#007B6E' }}>
                    {language === 'ar' ? doc.nameAr : doc.nameEn}
                  </h3>
                  {doc.isAccreditedSaudi && (
                    <span style={saudiBadgeStyle} data-testid={`accredited-badge-${doc.id}`}>
                      {t.accredited}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '13px', color: '#555', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span><strong>{t.specialty}:</strong> {language === 'ar' ? doc.specialtyAr : doc.specialtyEn}</span>
                  <span><strong>{t.license}:</strong> {doc.licenseNumber}</span>
                  <span><strong>{t.availability}:</strong> {Math.round(doc.availabilityScore * 100)}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        style={assignBtnStyle}
        disabled={!selectedDoctorId || isAssigning}
        onClick={handleAssign}
        data-testid="btn-assign-doctor-n06"
        aria-label={t.assign}
      >
        {isAssigning ? t.assigning : t.assign}
      </button>
    </div>
  );
};

export default NurseDoctorAssignmentSection;


import React, { useState, useCallback } from 'react';
import type { TriageCase, TriageFormData } from '../NurseTriageView';

interface NurseTriageFormSectionProps {
  caseData: TriageCase;
  language: 'ar' | 'en';
  isSubmitting: boolean;
  onSubmit: (formData: TriageFormData) => void;
  'data-testid'?: string;
}

const NurseTriageFormSection: React.FC<NurseTriageFormSectionProps> = ({
  caseData,
  language,
  isSubmitting,
  onSubmit,
  'data-testid': testId,
}) => {
  const isRTL = language === 'ar';

  const [n05NotesAr, setN05NotesAr] = useState('');
  const [n05NotesEn, setN05NotesEn] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [bloodPressureSys, setBloodPressureSys] = useState<string>('');
  const [bloodPressureDia, setBloodPressureDia] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [spo2, setSpo2] = useState<string>('');
  const [n07RouteApproved, setN07RouteApproved] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: TriageFormData = {
      n05NotesAr,
      n05NotesEn,
      clinicalObservations,
      vitals: {
        hr: parseFloat(heartRate) || 0,
        bpSys: parseFloat(bloodPressureSys) || 0,
        bpDia: parseFloat(bloodPressureDia) || 0,
        temp: parseFloat(temperature) || 0,
        spo2: parseFloat(spo2) || 0,
      },
      n07RouteApproved,
    };

    onSubmit(formData);
  }, [n05NotesAr, n05NotesEn, clinicalObservations, heartRate, bloodPressureSys, bloodPressureDia, temperature, spo2, n07RouteApproved, onSubmit]);

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    fontFamily: 'Cairo, sans-serif',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '16px',
  };

  const fieldGroupStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#007B6E',
    marginBottom: '6px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1.5px solid #00C6AE',
    fontFamily: 'Cairo, sans-serif',
    fontSize: '14px',
    color: '#007B6E',
    backgroundColor: '#E6FAF7',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    direction: isRTL ? 'rtl' : 'ltr',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
  };

  const checkboxContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: n07RouteApproved ? '#E6FAF7' : '#FFF9F9',
    border: `2px solid ${n07RouteApproved ? '#25D366' : '#FFCCC7'}`,
    borderRadius: '8px',
    cursor: 'pointer',
  };

  const submitBtnStyle: React.CSSProperties = {
    padding: '14px',
    backgroundColor: n07RouteApproved && !isSubmitting ? '#007B6E' : '#CCCCCC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    cursor: n07RouteApproved && !isSubmitting ? 'pointer' : 'not-allowed',
    marginTop: '8px',
  };

  const labels = {
    ar: {
      title: 'نموذج الفرز السريري (N05 / N07)',
      n05Notes: 'ملاحظات الفرز N05',
      observations: 'الملاحظات السريرية',
      vitals: 'العلامات الحيوية',
      hr: 'معدل ضربات القلب',
      bpSys: 'ضغط الدم الانقباضي',
      bpDia: 'ضغط الدم الانبساطي',
      temp: 'درجة الحرارة',
      spo2: 'تشبع الأكسجين',
      n07Approval: 'اعتماد مسار التحويل N07',
      n07Desc: 'أؤكد أن حالة المريض تستدعي التحويل وأوافق على بروتوكول N07',
      submit: 'إرسال الفرز واعتماد المسار',
      submitting: 'جاري الإرسال...',
    },
    en: {
      title: 'Clinical Triage Form (N05 / N07)',
      n05Notes: 'N05 Triage Notes',
      observations: 'Clinical Observations',
      vitals: 'Vital Signs',
      hr: 'Heart Rate',
      bpSys: 'BP Systolic',
      bpDia: 'BP Diastolic',
      temp: 'Temperature',
      spo2: 'SpO2',
      n07Approval: 'N07 Route Approval',
      n07Desc: 'I confirm the patient requires routing and approve N07 protocol',
      submit: 'Submit Triage & Approve Route',
      submitting: 'Submitting...',
    },
  };

  const t = labels[language];

  return (
    <div style={containerStyle} data-testid={testId || 'nurse-triage-form-section'}>
      <h2 style={{ margin: 0, fontSize: '20px', color: '#007B6E' }}>{t.title}</h2>

      <form style={formStyle} onSubmit={handleSubmit} data-testid="triage-form">
        <div>
          <label htmlFor="n05-notes" style={labelStyle}>{t.n05Notes}</label>
          <textarea
            id="n05-notes"
            style={textareaStyle}
            value={language === 'ar' ? n05NotesAr : n05NotesEn}
            onChange={(e) => language === 'ar' ? setN05NotesAr(e.target.value) : setN05NotesEn(e.target.value)}
            placeholder={t.n05Notes}
            data-testid="input-n05-notes"
            required
          />
        </div>

        <div>
          <label htmlFor="clinical-obs" style={labelStyle}>{t.observations}</label>
          <textarea
            id="clinical-obs"
            style={textareaStyle}
            value={clinicalObservations}
            onChange={(e) => setClinicalObservations(e.target.value)}
            placeholder={t.observations}
            data-testid="input-clinical-observations"
            required
          />
        </div>

        <fieldset style={{ border: '1px solid #E6FAF7', borderRadius: '8px', padding: '16px', margin: 0 }}>
          <legend style={{ fontSize: '14px', fontWeight: 700, color: '#007B6E', padding: '0 8px' }}>{t.vitals}</legend>
          <div style={fieldGroupStyle}>
            <div>
              <label htmlFor="vital-hr" style={labelStyle}>{t.hr}</label>
              <input id="vital-hr" type="number" style={inputStyle} value={heartRate} onChange={(e) => setHeartRate(e.target.value)} data-testid="input-vital-hr" placeholder="bpm" />
            </div>
            <div>
              <label htmlFor="vital-bp-sys" style={labelStyle}>{t.bpSys}</label>
              <input id="vital-bp-sys" type="number" style={inputStyle} value={bloodPressureSys} onChange={(e) => setBloodPressureSys(e.target.value)} data-testid="input-vital-bp-sys" placeholder="mmHg" />
            </div>
            <div>
              <label htmlFor="vital-bp-dia" style={labelStyle}>{t.bpDia}</label>
              <input id="vital-bp-dia" type="number" style={inputStyle} value={bloodPressureDia} onChange={(e) => setBloodPressureDia(e.target.value)} data-testid="input-vital-bp-dia" placeholder="mmHg" />
            </div>
            <div>
              <label htmlFor="vital-temp" style={labelStyle}>{t.temp}</label>
              <input id="vital-temp" type="number" step="0.1" style={inputStyle} value={temperature} onChange={(e) => setTemperature(e.target.value)} data-testid="input-vital-temp" placeholder="°C" />
            </div>
            <div>
              <label htmlFor="vital-spo2" style={labelStyle}>{t.spo2}</label>
              <input id="vital-spo2" type="number" style={inputStyle} value={spo2} onChange={(e) => setSpo2(e.target.value)} data-testid="input-vital-spo2" placeholder="%" />
            </div>
          </div>
        </fieldset>

        <div
          style={checkboxContainerStyle}
          onClick={() => setN07RouteApproved(!n07RouteApproved)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setN07RouteApproved(!n07RouteApproved); } }}
          role="checkbox"
          aria-checked={n07RouteApproved}
          tabIndex={0}
          data-testid="checkbox-n07-approval"
        >
          <input
            type="checkbox"
            checked={n07RouteApproved}
            onChange={() => setN07RouteApproved(!n07RouteApproved)}
            style={{ width: '20px', height: '20px', accentColor: '#25D366', cursor: 'pointer' }}
            tabIndex={-1}
          />
          <div>
            <div style={{ fontWeight: 700, color: '#007B6E', fontSize: '15px' }}>{t.n07Approval}</div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{t.n07Desc}</div>
          </div>
        </div>

        <button
          type="submit"
          style={submitBtnStyle}
          disabled={!n07RouteApproved || isSubmitting}
          data-testid="btn-submit-triage"
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
};

export default NurseTriageFormSection;
import React, { useState, useCallback } from 'react';

interface SaudiDoctorDeviceProps {
  currentStep: number;
  patientNameAr: string;
  patientNameEn: string;
  bilingualReport: string;
  consultantAnswers: string;
  personaId: string;
  onReleaseToPatient: (payload: ReleasePayload) => void;
  onRequestRevision: (payload: RevisionPayload) => void;
}

interface ReleasePayload {
  localClinicalNotes: string;
  scfhsLicense: string;
  requiresLocalLab: boolean;
  prescriptionIssued: boolean;
  doctorReleasedToPatient: boolean;
  reportReleased: boolean;
}

interface RevisionPayload {
  clinicalConcern: string;
  status: 'revision_requested';
}

type GateAction = 'idle' | 'approve' | 'revise';

const COLORS = {
  primaryTeal: '#007B6E',
  secondaryTeal: '#00C6AE',
  backgroundTeal: '#E6FAF7',
  whatsappGreen: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#4A4A4A',
  border: '#D1E8E5',
  error: '#D32F2F'
};

export const SaudiDoctorDevice: React.FC<SaudiDoctorDeviceProps> = ({
  currentStep,
  patientNameAr,
  patientNameEn,
  bilingualReport,
  consultantAnswers,
  personaId,
  onReleaseToPatient,
  onRequestRevision
}) => {
  const [activeAction, setActiveAction] = useState<GateAction>('idle');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');

  // Form State for Action 7A
  const [localClinicalNotes, setLocalClinicalNotes] = useState('');
  const [scfhsLicense, setScfhsLicense] = useState('');
  const [requiresLocalLab, setRequiresLocalLab] = useState(false);
  const [prescriptionIssued, setPrescriptionIssued] = useState(false);

  // Form State for Action 7B
  const [clinicalConcern, setClinicalConcern] = useState('');

  const isStep7 = currentStep === 7;

  const toggleLanguageDirection = useCallback(() => {
    setDirection(prev => prev === 'rtl' ? 'ltr' : 'rtl');
  }, []);

  const handleApproveClick = () => setActiveAction('approve');
  const handleReviseClick = () => setActiveAction('revise');
  const handleBackToIdle = () => setActiveAction('idle');

  const handleSubmitApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scfhsLicense.trim() || !localClinicalNotes.trim()) return;

    const payload: ReleasePayload = {
      localClinicalNotes,
      scfhsLicense,
      requiresLocalLab,
      prescriptionIssued,
      doctorReleasedToPatient: true,
      reportReleased: true
    };
    onReleaseToPatient(payload);
  };

  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalConcern.trim()) return;

    const payload: RevisionPayload = {
      clinicalConcern,
      status: 'revision_requested'
    };
    onRequestRevision(payload);
  };

  if (!isStep7) {
    return (
      <div style={styles.container} dir={direction}>
        <div style={styles.waitingState}>
          <p style={{ fontFamily: 'Cairo, sans-serif', color: COLORS.textMuted }}>
            {direction === 'rtl' ? 'في انتظار الوصول إلى بوابة المصادقة (الخطوة ٧)...' : 'Waiting to reach Endorsement Gate (Step 7)...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} dir={direction}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>
            {direction === 'rtl' ? 'بوابة مصادقة الطبيب المعالج' : 'Treating Doctor Endorsement Gate'}
          </h1>
          <button 
            onClick={toggleLanguageDirection} 
            style={styles.langToggle}
            aria-label="Toggle Language Direction"
          >
            {direction === 'rtl' ? 'EN / LTR' : 'AR / RTL'}
          </button>
        </div>
        <div style={styles.patientInfo}>
          <span style={styles.badge}>{direction === 'rtl' ? 'ملف المريض' : 'Patient File'}</span>
          <h2 style={styles.patientName}>
            {direction === 'rtl' ? patientNameAr : patientNameEn}
          </h2>
          <span style={styles.personaTag}>Persona ID: {personaId}</span>
        </div>
      </header>

      <main style={styles.mainContent}>
        <section style={styles.reportSection}>
          <h3 style={styles.sectionTitle}>
            {direction === 'rtl' ? 'التقرير ثنائي اللغة وإجابات الاستشاري' : 'Bilingual Report & Consultant Answers'}
          </h3>
          <div style={styles.reportBox}>
            <div style={styles.reportBlock}>
              <strong>{direction === 'rtl' ? 'التقرير السريري:' : 'Clinical Report:'}</strong>
              <p style={styles.reportText}>{bilingualReport}</p>
            </div>
            <div style={{ ...styles.reportBlock, borderTop: `1px solid ${COLORS.border}`, paddingTop: '16px', marginTop: '16px' }}>
              <strong>{direction === 'rtl' ? 'إجابات الاستشاري الهندي:' : 'Indian Consultant Answers:'}</strong>
              <p style={styles.reportText}>{consultantAnswers}</p>
            </div>
          </div>
        </section>

        {activeAction === 'idle' && (
          <section style={styles.actionGate}>
            <h3 style={styles.sectionTitle}>
              {direction === 'rtl' ? 'الإجراء المطلوب' : 'Required Action'}
            </h3>
            <p style={styles.instructionText}>
              {direction === 'rtl' 
                ? 'يرجى مراجعة التقرير أعلاه واختيار أحد المسارين التشغيليين التاليين:' 
                : 'Please review the report above and select one of the following operational paths:'}
            </p>
            
            <div style={styles.buttonGroup}>
              <button
                onClick={handleApproveClick}
                style={styles.primaryButton}
                aria-label={direction === 'rtl' ? 'اعتماد وإصدار التقرير للمريض' : 'Approve & Release Report to Patient'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginInlineEnd: '8px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                {direction === 'rtl' ? 'اعتماد وإصدار التقرير للمريض' : 'Approve & Release Report to Patient'}
              </button>

              <button
                onClick={handleReviseClick}
                style={styles.secondaryButton}
                aria-label={direction === 'rtl' ? 'طلب مراجعة وتدقيق سريري' : 'Request Clinical Revision'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginInlineEnd: '8px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {direction === 'rtl' ? 'طلب مراجعة وتدقيق سريري' : 'Request Clinical Revision'}
              </button>
            </div>
          </section>
        )}

        {activeAction === 'approve' && (
          <section style={styles.formSection}>
            <div style={styles.formHeader}>
              <h3 style={styles.sectionTitle}>
                {direction === 'rtl' ? 'المسار أ: اعتماد وإصدار التقرير' : 'Path A: Approve & Release Report'}
              </h3>
              <button onClick={handleBackToIdle} style={styles.backButton}>
                {direction === 'rtl' ? 'رجوع' : 'Back'}
              </button>
            </div>

            <form onSubmit={handleSubmitApproval} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="scfhs">
                  {direction === 'rtl' ? 'رقم ترخيص الهيئة السعودية للتخصصات الصحية (SCFHS)' : 'SCFHS License Number'}
                </label>
                <input
                  id="scfhs"
                  type="text"
                  value={scfhsLicense}
                  onChange={(e) => setScfhsLicense(e.target.value)}
                  placeholder={direction === 'rtl' ? 'مثال: SCFHS-8821' : 'e.g., SCFHS-8821'}
                  style={styles.input}
                  required
                  dir="ltr"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="notes">
                  {direction === 'rtl' ? 'الملاحظات السريرية المحلية (تعديلات نمط الحياة، النظام الغذائي، الأدوية)' : 'Local Clinical Notes (Lifestyle, Dietary, Medication Adjustments)'}
                </label>
                <textarea
                  id="notes"
                  value={localClinicalNotes}
                  onChange={(e) => setLocalClinicalNotes(e.target.value)}
                  placeholder={direction === 'rtl' ? 'أدخل الملاحظات السريرية...' : 'Enter clinical notes...'}
                  style={styles.textarea}
                  required
                  rows={4}
                />
              </div>

              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={requiresLocalLab}
                    onChange={(e) => setRequiresLocalLab(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>
                    {direction === 'rtl' ? 'يتطلب تحاليل مخبرية داخل المركز' : 'Requires Intra-center Lab Orders'}
                  </span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={prescriptionIssued}
                    onChange={(e) => setPrescriptionIssued(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>
                    {direction === 'rtl' ? 'تم إصدار الوصفة الطبية' : 'Prescription Issued'}
                  </span>
                </label>
              </div>

              <button type="submit" style={styles.whatsappSubmitButton}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginInlineEnd: '10px' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {direction === 'rtl' ? 'إصدار التقرير عبر واتساب للمريض' : 'Release Certified Report via WhatsApp'}
              </button>
            </form>
          </section>
        )}

        {activeAction === 'revise' && (
          <section style={styles.formSection}>
            <div style={styles.formHeader}>
              <h3 style={{ ...styles.sectionTitle, color: COLORS.error }}>
                {direction === 'rtl' ? 'المسار ب: طلب مراجعة وتدقيق سريري' : 'Path B: Request Clinical Revision'}
              </h3>
              <button onClick={handleBackToIdle} style={styles.backButton}>
                {direction === 'rtl' ? 'رجوع' : 'Back'}
              </button>
            </div>

            <div style={styles.warningBox}>
              <p style={styles.warningText}>
                {direction === 'rtl' 
                  ? 'سيتم توجيه هذا الطلب إلى منسق ALO لإعادة الاستعلام من الاستشاري الهندي (الجولة ٢).' 
                  : 'This inquiry will be routed back to the ALO Coordinator to re-query the Indian Consultant (Round 2).'}
              </p>
            </div>

            <form onSubmit={handleSubmitRevision} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="concern">
                  {direction === 'rtl' ? 'وصف المخاوف السريرية أو موانع الجرعات' : 'Describe Clinical Concern or Dosage Contraindications'}
                </label>
                <textarea
                  id="concern"
                  value={clinicalConcern}
                  onChange={(e) => setClinicalConcern(e.target.value)}
                  placeholder={direction === 'rtl' ? 'اشرح سبب طلب المراجعة السريرية بالتفصيل...' : 'Explain the reason for requesting clinical revision in detail...'}
                  style={{ ...styles.textarea, borderColor: COLORS.error }}
                  required
                  rows={5}
                />
              </div>

              <button type="submit" style={styles.revisionSubmitButton}>
                {direction === 'rtl' ? 'إرسال طلب المراجعة والتدقيق السريري' : 'Submit Request for Clinical Revision'}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'Cairo, sans-serif',
    backgroundColor: COLORS.backgroundTeal,
    minHeight: '100vh',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  waitingState: {
    padding: '40px',
    backgroundColor: COLORS.white,
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  header: {
    width: '100%',
    maxWidth: '800px',
    marginBottom: '32px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: COLORS.primaryTeal,
    margin: 0,
  },
  langToggle: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.primaryTeal}`,
    color: COLORS.primaryTeal,
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Cairo, sans-serif',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  patientInfo: {
    backgroundColor: COLORS.white,
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.backgroundTeal,
    color: COLORS.primaryTeal,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    border: `1px solid ${COLORS.secondaryTeal}`,
  },
  patientName: {
    fontSize: '20px',
    fontWeight: 700,
    color: COLORS.textDark,
    margin: 0,
  },
  personaTag: {
    fontSize: '12px',
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  mainContent: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  reportSection: {
    backgroundColor: COLORS.white,
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: COLORS.primaryTeal,
    margin: '0 0 16px 0',
  },
  reportBox: {
    backgroundColor: '#F8FDFD',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '20px',
  },
  reportBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  reportText: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: COLORS.textDark,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  actionGate: {
    backgroundColor: COLORS.white,
    padding: '32px 24px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: '15px',
    color: COLORS.textMuted,
    marginBottom: '24px',
    lineHeight: 1.6,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryTeal,
    color: COLORS.white,
    border: 'none',
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.2)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    color: COLORS.error,
    border: `2px solid ${COLORS.error}`,
    padding: '14px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  formSection: {
    backgroundColor: COLORS.white,
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 123, 110, 0.08)',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: COLORS.primaryTeal,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Cairo, sans-serif',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: COLORS.textDark,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: `1px solid ${COLORS.border}`,
    fontSize: '15px',
    fontFamily: 'Cairo, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: `1px solid ${COLORS.border}`,
    fontSize: '15px',
    fontFamily: 'Cairo, sans-serif',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    lineHeight: 1.6,
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    backgroundColor: COLORS.backgroundTeal,
    borderRadius: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    accentColor: COLORS.primaryTeal,
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '14px',
    fontWeight: 600,
    color: COLORS.textDark,
  },
  whatsappSubmitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.whatsappGreen,
    color: COLORS.white,
    border: 'none',
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
    transition: 'opacity 0.2s ease',
  },
  warningBox: {
    backgroundColor: '#FDEDED',
    border: '1px solid #F5C2C2',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
  },
  warningText: {
    fontSize: '14px',
    color: COLORS.error,
    margin: 0,
    fontWeight: 600,
    lineHeight: 1.6,
  },
  revisionSubmitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    color: COLORS.white,
    border: 'none',
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
  }
};

export default SaudiDoctorDevice;
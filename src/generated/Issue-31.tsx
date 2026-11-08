import React, { useState, useCallback, useMemo } from 'react';

// --- Types & Interfaces ---
export type PersonaId = 
  | 'patient' | 'doctor_sa' | 'consultant_in' | 'coordinator' 
  | 'lab_tech' | 'pharmacist' | 'admin' | 'billing' | 'support' | 'family' | 'guest';

export interface FocusQuestion {
  id: string;
  text: string;
}

export interface InternalOrder {
  labRequisition: boolean;
  selectedTests: string[];
  pharmacyPrescription: boolean;
}

export interface ClinicalCase {
  id: string;
  patientNameAr: string;
  patientNameEn: string;
  status: 'INITIAL_REVIEW' | 'AWAITING_PAYMENT' | 'IN_CONSULTATION' | 'COMPLETED';
  treatingDoctor: string;
  scfhsId: string;
  facilityNameAr: string;
  facilityNameEn: string;
  focusQuestions: FocusQuestion[];
  selectedConsultantId: string | null;
  internalOrders: InternalOrder;
  referralApproved: boolean;
}

interface DoctorReviewViewProps {
  activeCase: ClinicalCase;
  currentPersona: PersonaId;
  onCaseUpdate: (updatedCase: ClinicalCase) => void;
  onAdvanceStage: (caseId: string) => void;
  dir?: 'rtl' | 'ltr';
  lang?: 'ar' | 'en';
}

// --- Constants ---
const TEAL_PRIMARY = '#007B6E';
const TEAL_SECONDARY = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const QUICK_TEST_CHIPS = [
  { id: 'troponin_i', labelAr: 'تروبونين-I', labelEn: 'Troponin-I' },
  { id: 'cbc', labelAr: 'تحليل دم شامل (CBC)', labelEn: 'Complete Blood Count (CBC)' },
  { id: 'renal_function', labelAr: 'وظائف الكلى', labelEn: 'Renal Function' },
  { id: 'lipid_panel', labelAr: 'تحليل الدهون', labelEn: 'Lipid Panel' },
];

const ACCREDITED_CONSULTANTS = [
  { id: 'dr_rajesh_k', nameAr: 'د. راجيش كومار', nameEn: 'Dr. Rajesh Kumar', specialtyAr: 'استشاري أمراض القلب', specialtyEn: 'Cardiology Consultant' },
  { id: 'dr_priya_s', nameAr: 'د. بريا شارما', nameEn: 'Dr. Priya Sharma', specialtyAr: 'استشارية باطنية', specialtyEn: 'Internal Medicine Consultant' },
  { id: 'dr_amit_p', nameAr: 'د. أميت باتيل', nameEn: 'Dr. Amit Patel', specialtyAr: 'استشاري غدد صماء', specialtyEn: 'Endocrinology Consultant' },
];

// --- Component ---
const DoctorReviewView: React.FC<DoctorReviewViewProps> = ({
  activeCase,
  currentPersona,
  onCaseUpdate,
  onAdvanceStage,
  dir = 'rtl',
  lang = 'ar',
}) => {
  const isRtl = dir === 'rtl';
  
  // Local State for Form Management
  const [q1, setQ1] = useState(activeCase.focusQuestions[0]?.text || '');
  const [q2, setQ2] = useState(activeCase.focusQuestions[1]?.text || '');
  const [q3, setQ3] = useState(activeCase.focusQuestions[2]?.text || '');
  const [selectedConsultant, setSelectedConsultant] = useState(activeCase.selectedConsultantId || '');
  const [labRequisition, setLabRequisition] = useState(activeCase.internalOrders.labRequisition);
  const [selectedTests, setSelectedTests] = useState<string[]>(activeCase.internalOrders.selectedTests);
  const [pharmacyPrescription, setPharmacyPrescription] = useState(activeCase.internalOrders.pharmacyPrescription);
  const [referralApproved, setReferralApproved] = useState(activeCase.referralApproved);

  // Memoized Translations / Text
  const t = useMemo(() => ({
    sectionD08Title: isRtl ? 'D08 · الفحوصات والوصفات الطبية الداخلية الفورية (المجمع الطبي / المستشفى)' : 'D08 · Immediate In-House Lab & Pharmacy Orders (Medical Center / Hospital)',
    labToggleLabel: isRtl ? 'طلب فحوصات مخبرية تمهيدية بصيدلية ومختبر المجمع (Facility Lab Requisition)' : 'Request preliminary lab tests via Facility Lab (Facility Lab Requisition)',
    pharmacyToggleLabel: isRtl ? 'إصدار وصفة أدوية مسكنة / علاجية أولية عبر صيدلية المجمع (Facility Pharmacy Prescription)' : 'Issue immediate symptomatic/therapeutic prescription via Facility Pharmacy',
    focusQuestionsTitle: isRtl ? 'الأسئلة السريرية المركزة للاستشاري الدولي (إلزامي - 3 أسئلة)' : 'Clinical Focus Questions for International Consultant (Mandatory - 3)',
    consultantSelectionTitle: isRtl ? 'اختيار الاستشاري الدولي من الشبكة المعتمدة' : 'Select International Specialist from Accredited Network',
    signOffTitle: isRtl ? 'D10 · اعتماد الإحالة وإرسال الملف لمنسق رعاية ألو (C01)' : 'D10 · Approve Referral & Send File to Alo Care Coordinator (C01)',
    approveReferral: isRtl ? 'أوافق على اعتماد الإحالة الدولية' : 'I approve the international referral',
    submitBtn: isRtl ? 'اعتماد الإحالة وإرسال الملف لمنسق رعاية ألو (C01)' : 'Approve Referral & Send to Alo Coordinator (C01)',
    scfhsBadge: isRtl ? 'معتمد من الهيئة السعودية للتخصصات الصحية' : 'SCFHS Accredited',
    qPlaceholder: (n: number) => isRtl ? `السؤال السريري المركز رقم ${n}...` : `Clinical focus question #${n}...`,
  }), [isRtl]);

  // Handlers
  const handleTestToggle = useCallback((testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  }, []);

  const handleSaveAndAdvance = useCallback(() => {
    if (!q1.trim() || !q2.trim() || !q3.trim() || !selectedConsultant || !referralApproved) {
      // In production, trigger accessible toast/alert here
      return;
    }

    const updatedCase: ClinicalCase = {
      ...activeCase,
      focusQuestions: [
        { id: 'fq_1', text: q1.trim() },
        { id: 'fq_2', text: q2.trim() },
        { id: 'fq_3', text: q3.trim() },
      ],
      selectedConsultantId: selectedConsultant,
      internalOrders: {
        labRequisition,
        selectedTests,
        pharmacyPrescription,
      },
      referralApproved: true,
      status: 'AWAITING_PAYMENT',
    };

    onCaseUpdate(updatedCase);
    onAdvanceStage(updatedCase.id);
  }, [q1, q2, q3, selectedConsultant, labRequisition, selectedTests, pharmacyPrescription, referralApproved, activeCase, onCaseUpdate, onAdvanceStage]);

  const isFormValid = q1.trim().length > 0 && q2.trim().length > 0 && q3.trim().length > 0 && selectedConsultant !== '' && referralApproved;

  return (
    <div 
      dir={dir} 
      lang={lang}
      style={{
        fontFamily: "'Cairo', sans-serif",
        backgroundColor: '#F4F7F6',
        minHeight: '100vh',
        padding: isRtl ? '24px 32px' : '24px 32px',
        color: '#1A1A1A',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Header & Doctor Profile */}
        <header style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: TEAL_PRIMARY, margin: 0 }}>
                {isRtl ? 'مراجعة الطبيب المعالج الأولية (المرحلة 3)' : 'Treating Doctor Initial Review (Phase 3)'}
              </h1>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                {isRtl ? 'ملف المريض:' : 'Patient File:'} {isRtl ? activeCase.patientNameAr : activeCase.patientNameEn}
              </p>
            </div>
            
            {/* SCFHS Badge & Facility Info */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              backgroundColor: TEAL_BG,
              padding: '12px 20px',
              borderRadius: '12px',
              border: `1px solid ${TEAL_SECONDARY}`
            }}>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: TEAL_PRIMARY }}>
                  {activeCase.treatingDoctor}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#444' }}>
                  {isRtl ? activeCase.facilityNameAr : activeCase.facilityNameEn}
                </p>
              </div>
              <span style={{
                backgroundColor: TEAL_PRIMARY,
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
                whiteSpace: 'nowrap'
              }}>
                {t.scfhsBadge} ({activeCase.scfhsId})
              </span>
            </div>
          </div>
        </header>

        {/* Section 1: 3 Focus Questions */}
        <section style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #EAEAEA'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEAL_PRIMARY, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ backgroundColor: TEAL_PRIMARY, color: '#FFF', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>3</span>
            {t.focusQuestionsTitle}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[{ val: q1, set: setQ1, n: 1 }, { val: q2, set: setQ2, n: 2 }, { val: q3, set: setQ3, n: 3 }].map((q) => (
              <div key={q.n}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>
                  {isRtl ? `السؤال ${q.n}` : `Question ${q.n}`} *
                </label>
                <textarea
                  value={q.val}
                  onChange={(e) => q.set(e.target.value)}
                  placeholder={t.qPlaceholder(q.n)}
                  rows={3}
                  aria-label={t.qPlaceholder(q.n)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1px solid ${q.val.trim() ? TEAL_SECONDARY : '#D1D5DB'}`,
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    direction: dir,
                    backgroundColor: q.val.trim() ? TEAL_BG : '#FFFFFF'
                  }}
                  onFocus={(e) => e.target.style.borderColor = TEAL_PRIMARY}
                  onBlur={(e) => e.target.style.borderColor = q.val.trim() ? TEAL_SECONDARY : '#D1D5DB'}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Consultant Selection */}
        <section style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #EAEAEA'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEAL_PRIMARY, marginBottom: '20px' }}>
            {t.consultantSelectionTitle}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {ACCREDITED_CONSULTANTS.map((consultant) => {
              const isSelected = selectedConsultant === consultant.id;
              return (
                <button
                  key={consultant.id}
                  type="button"
                  onClick={() => setSelectedConsultant(consultant.id)}
                  aria-pressed={isSelected}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isRtl ? 'flex-end' : 'flex-start',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${isSelected ? TEAL_PRIMARY : '#E5E7EB'}`,
                    backgroundColor: isSelected ? TEAL_BG : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: "'Cairo', sans-serif",
                    textAlign: isRtl ? 'right' : 'left'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 700, color: isSelected ? TEAL_PRIMARY : '#1F2937' }}>
                    {isRtl ? consultant.nameAr : consultant.nameEn}
                  </span>
                  <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                    {isRtl ? consultant.specialtyAr : consultant.specialtyEn}
                  </span>
                  {isSelected && (
                    <span style={{ 
                      marginTop: '12px', 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: '#FFFFFF', 
                      backgroundColor: TEAL_PRIMARY, 
                      padding: '4px 10px', 
                      borderRadius: '20px' 
                    }}>
                      {isRtl ? 'تم الاختيار' : 'Selected'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 3: D08 In-House Lab & Pharmacy Orders */}
        <section style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: `1px solid ${TEAL_SECONDARY}`
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEAL_PRIMARY, marginBottom: '24px' }}>
            {t.sectionD08Title}
          </h2>

          {/* Lab Requisition Toggle */}
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div 
                role="switch"
                aria-checked={labRequisition}
                tabIndex={0}
                onClick={() => setLabRequisition(!labRequisition)}
                onKeyDown={(e) => e.key === 'Enter' && setLabRequisition(!labRequisition)}
                style={{
                  width: '48px',
                  height: '26px',
                  backgroundColor: labRequisition ? TEAL_PRIMARY : '#D1D5DB',
                  borderRadius: '13px',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '22px',
                  height: '22px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  [isRtl ? 'right' : 'left']: labRequisition ? '2px' : '24px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t.labToggleLabel}
              </span>
            </label>

            {/* Quick Test Chips */}
            {labRequisition && (
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {QUICK_TEST_CHIPS.map((chip) => {
                  const isActive = selectedTests.includes(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleTestToggle(chip.id)}
                      aria-pressed={isActive}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: `1px solid ${isActive ? TEAL_PRIMARY : '#D1D5DB'}`,
                        backgroundColor: isActive ? TEAL_BG : '#FFFFFF',
                        color: isActive ? TEAL_PRIMARY : '#4B5563',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Cairo', sans-serif",
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isActive && <span style={{ fontSize: '12px' }}>✓</span>}
                      {isRtl ? chip.labelAr : chip.labelEn}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pharmacy Prescription Toggle */}
          <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div 
                role="switch"
                aria-checked={pharmacyPrescription}
                tabIndex={0}
                onClick={() => setPharmacyPrescription(!pharmacyPrescription)}
                onKeyDown={(e) => e.key === 'Enter' && setPharmacyPrescription(!pharmacyPrescription)}
                style={{
                  width: '48px',
                  height: '26px',
                  backgroundColor: pharmacyPrescription ? WHATSAPP_GREEN : '#D1D5DB',
                  borderRadius: '13px',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '22px',
                  height: '22px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  [isRtl ? 'right' : 'left']: pharmacyPrescription ? '2px' : '24px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {t.pharmacyToggleLabel}
              </span>
            </label>
          </div>
        </section>

        {/* Section 4: D10 Sign-Off & Advance Stage */}
        <section style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '24px', 
          marginBottom: '40px',
          boxShadow: '0 4px 12px rgba(0,123,110,0.08)',
          border: `2px solid ${TEAL_PRIMARY}`
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEAL_PRIMARY, marginBottom: '20px' }}>
            {t.signOffTitle}
          </h2>

          {/* Approval Checkbox */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={referralApproved}
                onChange={(e) => setReferralApproved(e.target.checked)}
                style={{
                  width: '22px',
                  height: '22px',
                  accentColor: TEAL_PRIMARY,
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>
                {t.approveReferral}
              </span>
            </label>
          </div>

          {/* 1-Click Action Button */}
          <button
            type="button"
            onClick={handleSaveAndAdvance}
            disabled={!isFormValid}
            aria-disabled={!isFormValid}
            style={{
              width: '100%',
              padding: '16px 24px',
              backgroundColor: isFormValid ? TEAL_PRIMARY : '#9CA3AF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: "'Cairo', sans-serif",
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: isFormValid ? '0 4px 14px rgba(0,123,110,0.3)' : 'none'
            }}
            onMouseEnter={(e) => { if(isFormValid) e.currentTarget.style.backgroundColor = '#005C52'; }}
            onMouseLeave={(e) => { if(isFormValid) e.currentTarget.style.backgroundColor = TEAL_PRIMARY; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            {t.submitBtn}
          </button>

          {!isFormValid && (
            <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '12px', textAlign: 'center', fontWeight: 600 }}>
              {isRtl ? 'يرجى إكمال الأسئلة الثلاثة، اختيار الاستشاري، واعتماد الإحالة للمتابعة.' : 'Please complete all 3 questions, select a consultant, and approve the referral to proceed.'}
            </p>
          )}
        </section>

      </div>
    </div>
  );
};

export default DoctorReviewView;
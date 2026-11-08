import React, { useState, useMemo, useEffect } from 'react';

// --- Types & Interfaces ---
export type DoctorSelectionPreference = 'need_assistance' | 'specific_center' | 'specific_doctor';
export type TriageStage = 'INTAKE' | 'NURSE_TRIAGE' | 'DOCTOR_REVIEW' | 'COMPLETED';
export type City = 'Riyadh' | 'Jeddah' | 'Dammam' | 'All';

export interface TreatingDoctor {
  id: string;
  nameEn: string;
  nameAr: string;
  specialtyEn: string;
  specialtyAr: string;
  centerEn: string;
  centerAr: string;
  city: City;
  scfhsId: string;
  isOnDuty: boolean;
}

export interface CaseData {
  caseId: string;
  patientNameEn: string;
  patientNameAr: string;
  doctorSelectionPreference: DoctorSelectionPreference;
  selectedCenterId?: string;
  treatingDoctor?: TreatingDoctor;
  stage: TriageStage;
  lang: 'ar' | 'en';
}

interface NurseTriageViewProps {
  caseData: CaseData;
  onAdvanceStage: (updatedCase: CaseData) => void;
  availableDoctors: TreatingDoctor[];
}

// --- Theme Constants ---
const THEME = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#5F6368',
  border: '#D1E8E5',
  error: '#D93025',
};

// --- Mock Data for Demonstration ---
const MOCK_DOCTORS: TreatingDoctor[] = [
  {
    id: 'doc_1',
    nameEn: 'Dr. Abdullah Al-Shammari',
    nameAr: 'د. عبدالله الشمري',
    specialtyEn: 'Interventional Cardiology',
    specialtyAr: 'طب القلب التدخلي',
    centerEn: 'Riyadh Care Hospital',
    centerAr: 'مستشفى رعاية الرياض',
    city: 'Riyadh',
    scfhsId: 'SCFHS-102938',
    isOnDuty: true,
  },
  {
    id: 'doc_2',
    nameEn: 'Dr. Faisal Al-Otaibi',
    nameAr: 'د. فيصل العتيبي',
    specialtyEn: 'Clinical Oncology',
    specialtyAr: 'الأورام السريرية',
    centerEn: 'King Faisal Specialist Hospital',
    centerAr: 'مستشفى الملك فيصل التخصصي',
    city: 'Riyadh',
    scfhsId: 'SCFHS-485729',
    isOnDuty: true,
  },
  {
    id: 'doc_3',
    nameEn: 'Dr. Sarah Al-Ghamdi',
    nameAr: 'د. سارة الغامدي',
    specialtyEn: 'Pediatric Neurology',
    specialtyAr: 'طب أعصاب الأطفال',
    centerEn: 'Jeddah National Hospital',
    centerAr: 'المستشفى الوطني بجدة',
    city: 'Jeddah',
    scfhsId: 'SCFHS-992837',
    isOnDuty: true,
  },
  {
    id: 'doc_4',
    nameEn: 'Dr. Khalid Al-Dosari',
    nameAr: 'د. خالد الدوسري',
    specialtyEn: 'Orthopedic Surgery',
    specialtyAr: 'جراحة العظام',
    centerEn: 'Dammam Medical Center',
    centerAr: 'مركز الدمام الطبي',
    city: 'Dammam',
    scfhsId: 'SCFHS-112233',
    isOnDuty: false,
  },
];

const NurseTriageView: React.FC<NurseTriageViewProps> = ({
  caseData,
  onAdvanceStage,
  availableDoctors = MOCK_DOCTORS,
}) => {
  const isRTL = caseData.lang === 'ar';
  const [selectedCity, setSelectedCity] = useState<City>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [isAssigning, setIsAssigning] = useState(false);

  // Extract unique specialties for filter dropdown
  const specialties = useMemo(() => {
    const specs = new Set(availableDoctors.map(doc => 
      isRTL ? doc.specialtyAr : doc.specialtyEn
    ));
    return ['All', ...Array.from(specs)];
  }, [availableDoctors, isRTL]);

  // Filter doctors based on selection and duty status
  const filteredDoctors = useMemo(() => {
    return availableDoctors.filter(doc => {
      if (!doc.isOnDuty) return false;
      if (selectedCity !== 'All' && doc.city !== selectedCity) return false;
      
      const docSpecialty = isRTL ? doc.specialtyAr : doc.specialtyEn;
      if (selectedSpecialty !== 'All' && docSpecialty !== selectedSpecialty) return false;
      
      return true;
    });
  }, [availableDoctors, selectedCity, selectedSpecialty, isRTL]);

  const handleAssignDoctor = async (doctor: TreatingDoctor) => {
    setIsAssigning(true);
    
    // Simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedCase: CaseData = {
      ...caseData,
      treatingDoctor: doctor,
      stage: 'DOCTOR_REVIEW',
    };

    onAdvanceStage(updatedCase);
    setIsAssigning(false);
  };

  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const cities: City[] = ['All', 'Riyadh', 'Jeddah', 'Dammam'];

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Cairo', sans-serif",
        backgroundColor: THEME.background,
        minHeight: '100vh',
        padding: isRTL ? '24px 24px 24px 24px' : '24px',
        color: THEME.textDark,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <header style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: THEME.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: THEME.white,
              fontWeight: 700,
              fontSize: '18px'
            }}>
              N
            </div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: THEME.primary }}>
              {t('Nurse Triage & Doctor Matching', 'فرز التمريض ومطابقة الأطباء')}
            </h1>
          </div>
          
          <div style={{
            backgroundColor: THEME.white,
            padding: '16px 20px',
            borderRadius: '12px',
            borderRight: isRTL ? `4px solid ${THEME.secondary}` : 'none',
            borderLeft: !isRTL ? `4px solid ${THEME.secondary}` : 'none',
            boxShadow: '0 2px 8px rgba(0, 123, 110, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '12px', color: THEME.textMuted, display: 'block' }}>
                {t('Patient Name', 'اسم المريض')}
              </span>
              <span style={{ fontWeight: 600, fontSize: '16px' }}>
                {isRTL ? caseData.patientNameAr : caseData.patientNameEn}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: THEME.textMuted, display: 'block' }}>
                {t('Case ID', 'رقم الحالة')}
              </span>
              <span style={{ fontWeight: 600, fontSize: '16px', fontFamily: 'monospace' }}>
                {caseData.caseId}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: THEME.textMuted, display: 'block' }}>
                {t('Preference', 'التفضيل')}
              </span>
              <span style={{
                backgroundColor: THEME.background,
                color: THEME.primary,
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 700,
                border: `1px solid ${THEME.secondary}`
              }}>
                {t('ALO Assistance Requested', 'طلب مساعدة ALO')}
              </span>
            </div>
          </div>
        </header>

        {/* Conditional Rendering: Only show matching panel if assistance is needed */}
        {(caseData.doctorSelectionPreference === 'need_assistance' || !caseData.treatingDoctor) ? (
          <main>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: THEME.textDark }}>
              {t('Available On-Duty Saudi Treating Doctors', 'الأطباء السعوديون المعالجون المتاحون حالياً')}
            </h2>

            {/* Filters Panel */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px',
              backgroundColor: THEME.white,
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}>
              {/* City Filter */}
              <div style={{ flex: '1 1 250px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: THEME.textMuted }}>
                  {t('Filter by City', 'تصفية حسب المدينة')}
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      aria-pressed={selectedCity === city}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: `1px solid ${selectedCity === city ? THEME.primary : THEME.border}`,
                        backgroundColor: selectedCity === city ? THEME.primary : THEME.white,
                        color: selectedCity === city ? THEME.white : THEME.textDark,
                        cursor: 'pointer',
                        fontFamily: "'Cairo', sans-serif",
                        fontWeight: 600,
                        fontSize: '13px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {city === 'All' ? t('All Cities', 'جميع المدن') : city === 'Riyadh' ? t('Riyadh', 'الرياض') : city === 'Jeddah' ? t('Jeddah', 'جدة') : t('Dammam', 'الدمام')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialty Filter */}
              <div style={{ flex: '1 1 250px' }}>
                <label htmlFor="specialty-select" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: THEME.textMuted }}>
                  {t('Filter by Specialty', 'تصفية حسب التخصص')}
                </label>
                <select
                  id="specialty-select"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: THEME.white,
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: '14px',
                    color: THEME.textDark,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>
                      {spec === 'All' ? t('All Specialties', 'جميع التخصصات') : spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor List Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px'
            }}>
              {filteredDoctors.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: THEME.white,
                  borderRadius: '12px',
                  color: THEME.textMuted
                }}>
                  {t('No doctors match the current filters.', 'لا يوجد أطباء يطابقون معايير البحث الحالية.')}
                </div>
              ) : (
                filteredDoctors.map(doctor => (
                  <article
                    key={doctor.id}
                    style={{
                      backgroundColor: THEME.white,
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 4px 12px rgba(0, 123, 110, 0.06)',
                      border: `1px solid ${THEME.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 123, 110, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 110, 0.06)';
                    }}
                  >
                    {/* Doctor Info Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: THEME.primary }}>
                          {isRTL ? doctor.nameAr : doctor.nameEn}
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: THEME.textMuted, fontWeight: 500 }}>
                          {isRTL ? doctor.specialtyAr : doctor.specialtyEn}
                        </p>
                      </div>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: THEME.background,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: THEME.primary,
                        fontWeight: 700,
                        fontSize: '20px'
                      }}>
                        {isRTL ? doctor.nameAr.charAt(2) : doctor.nameEn.charAt(4)}
                      </div>
                    </div>

                    {/* Badges Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {/* SCFHS Badge */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#F0FDF4',
                        color: '#166534',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: '1px solid #BBF7D0'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        SCFHS
                      </span>

                      {/* Medical Center Badge */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: THEME.background,
                        color: THEME.primary,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: `1px solid ${THEME.border}`
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        {isRTL ? doctor.centerAr : doctor.centerEn}
                      </span>

                      {/* City Badge */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        {doctor.city === 'Riyadh' ? t('Riyadh', 'الرياض') : doctor.city === 'Jeddah' ? t('Jeddah', 'جدة') : t('Dammam', 'الدمام')}
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAssignDoctor(doctor)}
                      disabled={isAssigning}
                      aria-label={t(`Assign ${doctor.nameEn} and route to initial review`, `تعيين ${doctor.nameAr} وتحويل للمراجعة الأولية`)}
                      style={{
                        marginTop: 'auto',
                        width: '100%',
                        padding: '14px 20px',
                        backgroundColor: THEME.primary,
                        color: THEME.white,
                        border: 'none',
                        borderRadius: '10px',
                        fontFamily: "'Cairo', sans-serif",
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: isAssigning ? 'not-allowed' : 'pointer',
                        opacity: isAssigning ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isAssigning) e.currentTarget.style.backgroundColor = '#005C53';
                      }}
                      onMouseLeave={(e) => {
                        if (!isAssigning) e.currentTarget.style.backgroundColor = THEME.primary;
                      }}
                    >
                      {isAssigning ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                          </svg>
                          {t('Assigning...', 'جاري التعيين...')}
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <line x1="20" y1="8" x2="20" y2="14"/>
                            <line x1="23" y1="11" x2="17" y2="11"/>
                          </svg>
                          {t('Assign Doctor & Route to Initial Review', 'تعيين الطبيب وتحويل للمراجعة الأولية')}
                        </>
                      )}
                    </button>
                  </article>
                ))
              )}
            </div>
          </main>
        ) : (
          /* State when doctor is already assigned or preference doesn't require matching */
          <div style={{
            backgroundColor: THEME.white,
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 123, 110, 0.06)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: THEME.whatsapp
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 style={{ color: THEME.primary, fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              {t('Doctor Already Assigned', 'تم تعيين الطبيب مسبقاً')}
            </h3>
            <p style={{ color: THEME.textMuted, fontSize: '15px' }}>
              {t('This case has been routed to the treating doctor for review.', 'تم تحويل هذه الحالة إلى الطبيب المعالج للمراجعة.')}
            </p>
            {caseData.treatingDoctor && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: THEME.background,
                borderRadius: '12px',
                display: 'inline-block'
              }}>
                <strong style={{ color: THEME.primary }}>
                  {isRTL ? caseData.treatingDoctor.nameAr : caseData.treatingDoctor.nameEn}
                </strong>
                <br />
                <span style={{ fontSize: '14px', color: THEME.textMuted }}>
                  {isRTL ? caseData.treatingDoctor.centerAr : caseData.treatingDoctor.centerEn}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Styles for Animations and Cairo Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'Cairo', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        select:focus, button:focus-visible {
          outline: 2px solid ${THEME.secondary};
          outline-offset: 2px;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${THEME.background};
        }

        ::-webkit-scrollbar-thumb {
          background: ${THEME.secondary};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${THEME.primary};
        }
      `}</style>
    </div>
  );
};

export default NurseTriageView;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

interface NurseTriageViewProps {
  activeCase: any;
  onUpdateCase: (payload: any) => void;
  onAdvanceStage?: () => void;
  currentPersona?: string;
}

interface StaffUser {
  id: string;
  fullName: string;
  roleCode: string;
  tenantId?: string;
  isActive?: boolean;
}

interface TenantHospital {
  id: string;
  name: string;
  nameAr?: string;
}

const NurseTriageView: React.FC<NurseTriageViewProps> = ({
  activeCase,
  onUpdateCase,
  onAdvanceStage,
  currentPersona = 'nurse'
}) => {
  const [liveStaff, setLiveStaff] = useState<StaffUser[]>([]);
  const [liveHospitals, setLiveHospitals] = useState<TenantHospital[]>([]);
  const [isSubmittingN07, setIsSubmittingN07] = useState(false);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [triageNotes, setTriageNotes] = useState('');

  const isRTL = useMemo(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
    }
    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrateLiveDirectory = async () => {
      try {
        setIsLoadingDirectory(true);
        const [staffResponse, tenantsResponse] = await Promise.all([
          apiClient.fetchUsers(),
          apiClient.fetchTenants()
        ]);

        if (isMounted) {
          const staffData = Array.isArray(staffResponse) ? staffResponse : (staffResponse?.data || []);
          const tenantsData = Array.isArray(tenantsResponse) ? tenantsResponse : (tenantsResponse?.data || []);
          
          setLiveStaff(staffData);
          setLiveHospitals(tenantsData);
        }
      } catch (error) {
        console.error('[ALO DOCTOR v2.4] Failed to hydrate live directory for nurse triage:', error);
        if (isMounted) {
          try {
            const cachedStaff = localStorage.getItem('alo_cached_staff');
            const cachedHospitals = localStorage.getItem('alo_cached_hospitals');
            if (cachedStaff) setLiveStaff(JSON.parse(cachedStaff));
            if (cachedHospitals) setLiveHospitals(JSON.parse(cachedHospitals));
          } catch (cacheError) {
            console.error('[ALO DOCTOR v2.4] Cache fallback failed:', cacheError);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingDirectory(false);
        }
      }
    };

    hydrateLiveDirectory();

    return () => {
      isMounted = false;
    };
  }, []);

  const availableDoctors = useMemo(() => {
    const hospitalMap = new Map<string, TenantHospital>();
    liveHospitals.forEach((hospital) => {
      hospitalMap.set(hospital.id, hospital);
    });

    const localCachedDoctors: StaffUser[] = (() => {
      try {
        const cached = localStorage.getItem('availableDoctors');
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    })();

    const combinedStaff = [...localCachedDoctors, ...liveStaff];
    const uniqueDoctorsMap = new Map<string, StaffUser & { hospitalName?: string; hospitalNameAr?: string }>();

    combinedStaff.forEach((user) => {
      if (user.roleCode === 'D' && user.isActive !== false) {
        const hospital = user.tenantId ? hospitalMap.get(user.tenantId) : undefined;
        uniqueDoctorsMap.set(user.id, {
          ...user,
          hospitalName: hospital?.name,
          hospitalNameAr: hospital?.nameAr
        });
      }
    });

    return Array.from(uniqueDoctorsMap.values());
  }, [liveStaff, liveHospitals]);

  const handleAtomicN07Submit = useCallback(async () => {
    if (!activeCase || isSubmittingN07) return;

    setIsSubmittingN07(true);

    try {
      const existingMetadata = activeCase.metadata || {};

      const atomicPayload = {
        currentStage: 'SAUDI_DOCTOR_REVIEW',
        metadata: {
          ...existingMetadata,
          nurseVerified: true,
          deidentifiedAt: new Date().toISOString(),
          assignedDoctorId: selectedDoctorId || existingMetadata.assignedDoctorId,
          triageNotes: triageNotes || existingMetadata.triageNotes,
          lastUpdatedBy: currentPersona,
          updatedAt: new Date().toISOString()
        }
      };

      await onUpdateCase(atomicPayload);

    } catch (error) {
      console.error('[ALO DOCTOR v2.4] Atomic N07 stage transition failed:', error);
    } finally {
      setIsSubmittingN07(false);
    }
  }, [activeCase, isSubmittingN07, onUpdateCase, selectedDoctorId, triageNotes, currentPersona]);

  const containerStyle: React.CSSProperties = {
    direction: isRTL ? 'rtl' : 'ltr',
    fontFamily: "'Cairo', sans-serif",
    backgroundColor: '#E6FAF7',
    minHeight: '100vh',
    padding: '24px',
    color: '#1A1A1A'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
    marginBottom: '24px',
    border: '1px solid #00C6AE22'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#007B6E',
    marginBottom: '8px',
    textAlign: isRTL ? 'right' : 'left'
  };

  const subHeaderStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#555555',
    marginBottom: '24px',
    textAlign: isRTL ? 'right' : 'left'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#007B6E',
    marginBottom: '8px',
    textAlign: isRTL ? 'right' : 'left'
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #00C6AE',
    backgroundColor: '#FFFFFF',
    fontFamily: "'Cairo', sans-serif",
    fontSize: '14px',
    color: '#1A1A1A',
    outline: 'none',
    direction: isRTL ? 'rtl' : 'ltr',
    appearance: 'none',
    WebkitAppearance: 'none'
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #00C6AE',
    backgroundColor: '#FFFFFF',
    fontFamily: "'Cairo', sans-serif",
    fontSize: '14px',
    color: '#1A1A1A',
    outline: 'none',
    minHeight: '120px',
    resize: 'vertical',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  const primaryButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 32px',
    backgroundColor: isSubmittingN07 ? '#999999' : '#007B6E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontFamily: "'Cairo', sans-serif",
    fontSize: '16px',
    fontWeight: 700,
    cursor: isSubmittingN07 ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    maxWidth: '400px'
  };

  const doctorCardStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: '#E6FAF7',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid #00C6AE33',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  return (
    <div style={containerStyle} role="main" aria-label={isRTL ? 'فرز التمريض' : 'Nurse Triage'}>
      <div style={cardStyle}>
        <h1 style={headerStyle}>
          {isRTL ? 'فرز التمريض - ALO DOCTOR' : 'Nurse Triage - ALO DOCTOR'}
        </h1>
        <p style={subHeaderStyle}>
          {isRTL 
            ? 'الإصدار 2.4 السعودي | مرحلة المراجعة والتحويل' 
            : 'v2.4 Saudi Edition | Review & Transfer Stage'}
        </p>

        {activeCase && (
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F8FFFE', borderRadius: '8px', border: '1px solid #00C6AE22' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#007B6E', margin: 0 }}>
              {isRTL ? 'رقم الحالة:' : 'Case ID:'}{' '}
              <span style={{ color: '#1A1A1A', fontWeight: 400 }}>{activeCase.id || activeCase.caseId}</span>
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#007B6E', margin: '8px 0 0 0' }}>
              {isRTL ? 'المرحلة الحالية:' : 'Current Stage:'}{' '}
              <span style={{ color: '#1A1A1A', fontWeight: 400 }}>{activeCase.currentStage || activeCase.stage}</span>
            </p>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h2 style={{ ...headerStyle, fontSize: '18px', marginBottom: '16px' }}>
          {isRTL ? 'N05-B: الأطباء المتاحون للمراجعة' : 'N05-B: Available Treating Doctors'}
        </h2>

        {isLoadingDirectory ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#007B6E' }}>
            <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: '14px' }}>
              {isRTL ? 'جاري تحميل الأطباء من النظام...' : 'Hydrating doctors from live directory...'}
            </p>
          </div>
        ) : availableDoctors.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFF5F5', borderRadius: '8px' }}>
            <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: '14px', color: '#CC0000' }}>
              {isRTL ? 'لا يوجد أطباء متاحون حالياً' : 'No treating doctors currently available'}
            </p>
          </div>
        ) : (
          <>
            <label htmlFor="doctor-select" style={labelStyle}>
              {isRTL ? 'اختر طبيب معالج سعودي' : 'Select Saudi Treating Doctor'}
            </label>
            <select
              id="doctor-select"
              style={selectStyle}
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              aria-label={isRTL ? 'قائمة الأطباء المتاحين' : 'Available doctors list'}
            >
              <option value="">
                {isRTL ? '-- اختر طبيب --' : '-- Select Doctor --'}
              </option>
              {availableDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName} {doctor.hospitalName ? `(${isRTL ? doctor.hospitalNameAr || doctor.hospitalName : doctor.hospitalName})` : ''}
                </option>
              ))}
            </select>

            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                {isRTL ? 'الأطباء المتاحون للتأكيد:' : 'Available doctors for verification:'}
              </p>
              {availableDoctors.slice(0, 5).map((doctor) => (
                <div key={`preview-${doctor.id}`} style={doctorCardStyle}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#007B6E' }}>
                    {doctor.fullName}
                  </span>
                  {(doctor.hospitalName || doctor.hospitalNameAr) && (
                    <span style={{ fontSize: '12px', color: '#555' }}>
                      {isRTL ? (doctor.hospitalNameAr || doctor.hospitalName) : doctor.hospitalName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={cardStyle}>
        <h2 style={{ ...headerStyle, fontSize: '18px', marginBottom: '16px' }}>
          {isRTL ? 'ملاحظات الفرز' : 'Triage Notes'}
        </h2>
        <label htmlFor="triage-notes" style={labelStyle}>
          {isRTL ? 'أدخل ملاحظات الفرز السريري' : 'Enter clinical triage notes'}
        </label>
        <textarea
          id="triage-notes"
          style={textareaStyle}
          value={triageNotes}
          onChange={(e) => setTriageNotes(e.target.value)}
          placeholder={isRTL ? 'اكتب ملاحظاتك هنا...' : 'Write your notes here...'}
          aria-label={isRTL ? 'حقل ملاحظات الفرز' : 'Triage notes field'}
        />
      </div>

      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
        <h2 style={{ ...headerStyle, fontSize: '18px', marginBottom: '16px', width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
          {isRTL ? 'N07: التحويل للمراجعة الطبية' : 'N07: Transfer to Doctor Review'}
        </h2>
        
        <button
          type="button"
          style={primaryButtonStyle}
          onClick={handleAtomicN07Submit}
          disabled={isSubmittingN07 || !activeCase}
          aria-busy={isSubmittingN07}
          aria-label={isRTL ? 'تأكيد التحويل إلى مراجعة الطبيب السعودي' : 'Confirm transfer to Saudi doctor review'}
        >
          {isSubmittingN07 ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              {isRTL ? 'جاري التحويل الآمن...' : 'Atomically transitioning...'}
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
              {isRTL ? 'تأكيد التحويل (N07)' : 'Confirm Transfer (N07)'}
            </>
          )}
        </button>

        <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', textAlign: isRTL ? 'right' : 'left', width: '100%' }}>
          {isRTL 
            ? 'سيتم تحديث المرحلة بشكل ذري إلى SAUDI_DOCTOR_REVIEW مع التحقق من التمريض.' 
            : 'This will atomically update the stage to SAUDI_DOCTOR_REVIEW with nurse verification metadata.'}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Cairo', sans-serif;
          margin: 0;
          padding: 0;
        }
        
        select:focus, textarea:focus {
          border-color: #007B6E;
          box-shadow: 0 0 0 3px rgba(0, 198, 174, 0.2);
        }
        
        button:hover:not(:disabled) {
          background-color: #005F55 !important;
          transform: translateY(-1px);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default NurseTriageView;
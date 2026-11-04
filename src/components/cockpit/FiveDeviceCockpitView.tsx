import React, { useState, useCallback } from 'react';
import { ClinicalCase } from '../../types';
import { CockpitRole, TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from './types';
import { DeviceChrome } from './DeviceChrome';
import { PatientDevice } from './PatientDevice';
import { NurseDevice } from './NurseDevice';
import { SaudiDoctorDevice } from './SaudiDoctorDevice';
import { CoordinatorDevice } from './CoordinatorDevice';
import { IndianConsultantDevice } from './IndianConsultantDevice';

export interface FiveDeviceCockpitProps {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onResetActiveCase?: () => void;
  lang?: 'ar' | 'en';
  onSwitchToWorkstation?: () => void;
}

export const FiveDeviceCockpitView: React.FC<FiveDeviceCockpitProps> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  onResetActiveCase,
  lang = 'en',
  onSwitchToWorkstation,
}) => {
  const isAr = lang === 'ar';
  const [expandedDevice, setExpandedDevice] = useState<CockpitRole | null>(null);

  const stageNum = activeCase.stage ?? (
    activeCase.currentStage === 'INTAKE_RECEIVED' ? 1 :
    activeCase.currentStage === 'NURSE_CHECK' ? 2 :
    activeCase.currentStage === 'DOCTOR_REVIEW' ? 3 :
    activeCase.currentStage === 'AWAITING_PAYMENT' ? 4 :
    activeCase.currentStage === 'WITH_CONSULTANT' ? 5 :
    activeCase.currentStage === 'OPINION_READY' ? 6 :
    activeCase.currentStage === 'PARTNER_SERVICES' ? 7 :
    activeCase.currentStage === 'FOLLOW_UP_21_DAYS' ? 8 : 9
  );

  const handleToggleExpand = useCallback((role: CockpitRole) => {
    setExpandedDevice((prev) => (prev === role ? null : role));
  }, []);

  const deviceProps = {
    activeCase,
    stageNum,
    onAdvanceStage,
    onUpdateCase,
    lang,
  };

  const devices: { role: CockpitRole; component: React.ReactNode }[] = [
    { role: 'Patient', component: <PatientDevice {...deviceProps} /> },
    { role: 'Alo Nurse', component: <NurseDevice {...deviceProps} /> },
    { role: 'Saudi treating doctor', component: <SaudiDoctorDevice {...deviceProps} /> },
    { role: 'Alo Coordinator', component: <CoordinatorDevice {...deviceProps} /> },
    { role: 'Indian consultant', component: <IndianConsultantDevice {...deviceProps} /> },
  ];

  const visibleDevices = expandedDevice 
    ? devices.filter((d) => d.role === expandedDevice) 
    : devices;

  return (
    <div
      style={{
        direction: isAr ? 'rtl' : 'ltr',
        fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
        backgroundColor: '#f0fdfa',
        minHeight: '100vh',
        padding: '20px 24px 80px 24px',
        color: '#0f172a',
      }}
    >
      {/* Cockpit Top Header */}
      <header
        style={{
          maxWidth: '1800px',
          margin: '0 auto 24px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: TEAL_PRIMARY,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                backgroundColor: TEAL_PRIMARY,
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              ALO DOCTOR
            </span>
            <span>{isAr ? 'استوديو قمرة القيادة الخماسية' : '5-Role Studio Cockpit'}</span>
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 600 }}>
            {isAr
              ? `الحالة النشطة: ${activeCase.caseNumber || activeCase.id} · ${activeCase.patientNameAr || activeCase.patientName} · المرحلة السريرية: ${stageNum} من 5`
              : `Active Case: ${activeCase.caseNumber || activeCase.id} · ${activeCase.patientNameEn || activeCase.patientName} · Stage: ${stageNum} of 5`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onSwitchToWorkstation && (
            <button
              onClick={onSwitchToWorkstation}
              style={{
                backgroundColor: '#ffffff',
                color: TEAL_PRIMARY,
                border: `1px solid ${TEAL_PRIMARY}`,
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isAr ? '🖥️ وضع المحطة الفردية' : '🖥️ Single Workstation'}
            </button>
          )}

          {expandedDevice && (
            <button
              onClick={() => setExpandedDevice(null)}
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isAr ? 'عرض كافة الشاشات الخمس' : 'View All 5 Devices'}
            </button>
          )}

          {onResetActiveCase && (
            <button
              onClick={onResetActiveCase}
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title={isAr ? 'تصفير بيانات الحالة والبدء من جديد' : 'Reset case data back to clean slate'}
            >
              {isAr ? '🔄 تصفير الحالة والبدء من جديد' : '🔄 Reset Case to Blank Slate'}
            </button>
          )}
        </div>
      </header>

      {/* Responsive Grid of 5 Device Frames */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: expandedDevice ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          maxWidth: '1800px',
          margin: '0 auto',
          alignItems: 'start',
        }}
      >
        {visibleDevices.map(({ role, component }) => (
          <DeviceChrome
            key={role}
            role={role}
            stageNum={stageNum}
            lang={lang}
            isExpanded={expandedDevice === role}
            onToggleExpand={() => handleToggleExpand(role)}
          >
            {component}
          </DeviceChrome>
        ))}
      </div>

      {/* Floating Live Reactive Sync Indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          [isAr ? 'left' : 'right']: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          zIndex: 1000,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: WHATSAPP_GREEN,
            boxShadow: `0 0 10px ${WHATSAPP_GREEN}`,
            animation: 'pulse 2s infinite',
          }}
        />
        <span>{isAr ? 'مزامنة تفاعلية حية عبر الشاشات الخمس' : 'Live Cross-Device Reactive Sync Active'}</span>
      </div>
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import { ClinicalCase } from '../../types';
import { CockpitRole, WHATSAPP_GREEN } from './types';
import { DeviceChrome } from './DeviceChrome';
import { PatientDevice } from './PatientDevice';
import { NurseDevice } from './NurseDevice';
import { SaudiDoctorDevice } from './SaudiDoctorDevice';
import { CoordinatorDevice } from './CoordinatorDevice';
import { IndianConsultantDevice } from './IndianConsultantDevice';
import { BilingualReportModal } from './BilingualReportModal';
import { WHATSAPP_CUES, SLOTS, deriveStageNum, getCurrentCue } from './cockpitConstants';
import { CockpitHeader } from './CockpitHeader';
import { CockpitWhatsAppCueBanner } from './CockpitWhatsAppCueBanner';
import { CockpitLockedSlotPlaceholder } from './CockpitLockedSlotPlaceholder';

export interface FiveDeviceCockpitProps {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onResetActiveCase?: () => void;
  lang?: 'ar' | 'en';
  onSwitchToWorkstation?: () => void;
  onOpenWhatsAppDrawer?: () => void;
}

export const FiveDeviceCockpitView: React.FC<FiveDeviceCockpitProps> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  onResetActiveCase,
  lang = 'en',
  onSwitchToWorkstation,
  onOpenWhatsAppDrawer,
}) => {
  const isAr = lang === 'ar';
  const [expandedDevice, setExpandedDevice] = useState<CockpitRole | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const stageNum = deriveStageNum(activeCase);
  const currentCue = getCurrentCue(stageNum, activeCase);

  const handleToggleExpand = useCallback((role: CockpitRole) => {
    setExpandedDevice((prev) => (prev === role ? null : role));
  }, []);

  const deviceProps = {
    activeCase,
    stageNum,
    onAdvanceStage,
    onUpdateCase,
    lang,
    onOpenReportModal: () => setIsReportModalOpen(true),
  };

  const devicesMap: Record<CockpitRole, React.ReactNode> = {
    'Patient': <PatientDevice {...deviceProps} />,
    'Alo Nurse': <NurseDevice {...deviceProps} />,
    'Saudi treating doctor': <SaudiDoctorDevice {...deviceProps} />,
    'Alo Coordinator': <CoordinatorDevice {...deviceProps} />,
    'Indian consultant': <IndianConsultantDevice {...deviceProps} />,
  };

  return (
    <div
      style={{
        direction: isAr ? 'rtl' : 'ltr',
        fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
        backgroundColor: '#f0fdfa',
        minHeight: '100vh',
        padding: '12px 14px 60px 14px',
        color: '#0f172a',
      }}
    >
      {/* Cockpit Top Header */}
      <CockpitHeader
        activeCase={activeCase}
        stageNum={stageNum}
        isAr={isAr}
        expandedDevice={expandedDevice}
        onResetActiveCase={onResetActiveCase}
        onSwitchToWorkstation={onSwitchToWorkstation}
        onCollapseExpandedDevice={() => setExpandedDevice(null)}
      />

      {/* Live Handoff WhatsApp Simulation Pill */}
      {WHATSAPP_CUES[stageNum] && (
        <CockpitWhatsAppCueBanner
          cue={currentCue}
          isAr={isAr}
          onOpenWhatsAppDrawer={onOpenWhatsAppDrawer}
        />
      )}

      {/* Responsive Viewport Surface with Panoramic 5-Screen Horizontal Fit */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          paddingBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: expandedDevice
              ? '1fr'
              : 'minmax(280px, 1fr) minmax(320px, 1.2fr) minmax(360px, 1.4fr) minmax(360px, 1.4fr) minmax(280px, 1fr)',
            gap: '12px',
            width: '100%',
            minWidth: expandedDevice ? '100%' : '1420px',
            boxSizing: 'border-box',
            alignItems: 'stretch',
          }}
        >
          {expandedDevice ? (
            <DeviceChrome
              key={expandedDevice}
              role={expandedDevice}
              stageNum={stageNum}
              lang={lang}
              isExpanded={true}
              onToggleExpand={() => handleToggleExpand(expandedDevice)}
            >
              {devicesMap[expandedDevice]}
            </DeviceChrome>
          ) : (
            SLOTS.map((slot) => {
              const isUnlocked = stageNum >= slot.unlockStage;
              if (isUnlocked) {
                return (
                  <DeviceChrome
                    key={slot.role}
                    role={slot.role}
                    stageNum={stageNum}
                    lang={lang}
                    isExpanded={false}
                    onToggleExpand={() => handleToggleExpand(slot.role)}
                  >
                    {devicesMap[slot.role]}
                  </DeviceChrome>
                );
              }

              return (
                <CockpitLockedSlotPlaceholder
                  key={slot.role}
                  slot={slot}
                  isAr={isAr}
                />
              );
            })
          )}
        </div>
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

      {/* Interactive Bilingual Second Opinion PDF Viewer Modal */}
      <BilingualReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeCase={activeCase}
        lang={lang}
      />
    </div>
  );
};

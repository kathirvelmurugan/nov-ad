import React from 'react';
import { CockpitSlotItem } from './cockpitConstants';

interface CockpitLockedSlotPlaceholderProps {
  slot: CockpitSlotItem;
  isAr: boolean;
}

export const CockpitLockedSlotPlaceholder: React.FC<CockpitLockedSlotPlaceholderProps> = ({
  slot,
  isAr,
}) => {
  return (
    <div
      style={{
        height: 'calc(100vh - 190px)',
        minHeight: '520px',
        backgroundColor: 'rgba(248, 250, 252, 0.7)',
        border: '2px dashed #cbd5e1',
        borderRadius:
          slot.deviceType === 'mobile'
            ? '28px'
            : slot.deviceType === 'tablet'
            ? '22px'
            : '14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        textAlign: 'center',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '16px',
          [isAr ? 'right' : 'left']: '16px',
          fontSize: '10px',
          fontWeight: 800,
          color: '#94a3b8',
          letterSpacing: '0.5px',
        }}
      >
        {isAr ? `الموقع المخصص ٠${slot.slotNum}` : `SLOT 0${slot.slotNum}`}
      </div>

      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px',
          marginBottom: '16px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
        }}
      >
        {slot.icon}
      </div>

      <h3
        style={{
          fontSize: '14px',
          fontWeight: 800,
          color: '#475569',
          margin: '0 0 6px 0',
        }}
      >
        {isAr ? slot.titleAr : slot.titleEn}
      </h3>

      <p
        style={{
          fontSize: '11px',
          color: '#64748b',
          margin: '0 0 16px 0',
          maxWidth: '220px',
          lineHeight: 1.4,
          fontWeight: 500,
        }}
      >
        {isAr ? slot.descAr : slot.descEn}
      </p>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 12px',
          borderRadius: '999px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          color: '#64748b',
          fontSize: '11px',
          fontWeight: 700,
        }}
      >
        <span>🔒</span>
        <span>{isAr ? `يُفتح عند مرحلة ${slot.unlockStage}` : `Unlocks at Stage ${slot.unlockStage}`}</span>
      </span>
    </div>
  );
};

import React from 'react';
import { CockpitRole, PROCESS_CODES, TEAL_PRIMARY, TEAL_SECONDARY } from './types';

interface Props {
  role: CockpitRole;
  stageNum: number;
  lang: 'ar' | 'en';
  isExpanded: boolean;
  onToggleExpand: () => void;
  children: React.ReactNode;
}

export const DeviceChrome: React.FC<Props> = ({
  role,
  stageNum,
  lang,
  isExpanded,
  onToggleExpand,
  children,
}) => {
  const isAr = lang === 'ar';

  const getDeviceFrameType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (role === 'Patient' || role === 'Indian consultant') return 'mobile';
    if (role === 'Alo Nurse') return 'tablet';
    return 'desktop';
  };

  const getActiveProcessCode = (): { code: string; desc: string } => {
    const codes = PROCESS_CODES[role];
    let idx = 0;
    if (role === 'Patient') {
      if (stageNum >= 5) idx = 4;
      else if (stageNum >= 4) idx = 3;
      else if (stageNum >= 3) idx = 2;
      else if (stageNum >= 2) idx = 1;
      else idx = 0;
    } else if (role === 'Alo Nurse') {
      if (stageNum >= 4) idx = 3;
      else if (stageNum >= 3) idx = 2;
      else if (stageNum >= 2) idx = 1;
      else idx = 0;
    } else if (role === 'Saudi treating doctor') {
      if (stageNum >= 5) idx = 4;
      else if (stageNum >= 4) idx = 3;
      else if (stageNum >= 3) idx = 2;
      else if (stageNum >= 2) idx = 1;
      else idx = 0;
    } else if (role === 'Alo Coordinator') {
      if (stageNum >= 6) idx = 3;
      else if (stageNum >= 5) idx = 2;
      else if (stageNum >= 4) idx = 1;
      else idx = 0;
    } else if (role === 'Indian consultant') {
      if (stageNum >= 7) idx = 3;
      else if (stageNum >= 6) idx = 2;
      else if (stageNum >= 5) idx = 1;
      else idx = 0;
    }
    const item = codes[Math.min(idx, codes.length - 1)];
    return { code: item.code, desc: item.desc[lang] };
  };

  const frameType = getDeviceFrameType();
  const process = getActiveProcessCode();

  const getFrameWidth = () => {
    if (isExpanded) return '100%';
    if (frameType === 'mobile') return '320px';
    if (frameType === 'tablet') return '420px';
    return '480px';
  };

  const getRoleIcon = () => {
    if (role === 'Patient') return '📱';
    if (role === 'Alo Nurse') return '🩺';
    if (role === 'Saudi treating doctor') return '🇸🇦';
    if (role === 'Alo Coordinator') return '📋';
    return '🇮🇳';
  };

  return (
    <div
      style={{
        flex: isExpanded ? '1 1 100%' : '1 1 0',
        minWidth: 0,
        width: isExpanded ? '100%' : '100%',
        maxWidth: isExpanded ? '1200px' : 'none',
        margin: '0',
        backgroundColor: '#ffffff',
        borderRadius: frameType === 'mobile' ? '28px' : frameType === 'tablet' ? '22px' : '14px',
        border: '2.5px solid #0f172a',
        boxShadow: '0 16px 24px -10px rgba(0,0,0,0.12), 0 6px 10px -6px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        height: isExpanded ? 'auto' : 'calc(100vh - 190px)',
        minHeight: '520px',
      }}
    >
      {/* Device Hardware Top Bezel */}
      {frameType === 'mobile' && (
        <div style={{ height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '40px', height: '3.5px', backgroundColor: '#cbd5e1', borderRadius: '2px' }} />
        </div>
      )}
      {frameType === 'tablet' && (
        <div style={{ height: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '6px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '50%' }} />
        </div>
      )}

      {/* Role Title Bar & Milestone Process Pill */}
      <div
        style={{
          padding: '8px 10px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span style={{ fontSize: '16px' }}>{getRoleIcon()}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {role}
            </div>
            <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>
              {frameType.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Milestone Process Code Badge */}
          <div
            style={{
              backgroundColor: TEAL_PRIMARY,
              color: '#ffffff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
            }}
            title={process.desc}
          >
            {process.code}
          </div>

          {/* Expand / Minimize Button */}
          <button
            onClick={onToggleExpand}
            style={{
              backgroundColor: isExpanded ? '#0f172a' : '#f1f5f9',
              color: isExpanded ? '#ffffff' : '#64748b',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 5px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
            title={isExpanded ? (isAr ? 'تصغير' : 'Collapse') : (isAr ? 'تكبير' : 'Expand')}
          >
            {isExpanded ? '⤢' : '⤡'}
          </button>
        </div>
      </div>

      {/* Screen Body Content (Internal Smooth Scroll) */}
      <div style={{ padding: '10px', overflowY: 'auto', flex: 1, backgroundColor: '#fcfdfd', scrollbarWidth: 'thin' }}>
        {children}
      </div>
    </div>
  );
};

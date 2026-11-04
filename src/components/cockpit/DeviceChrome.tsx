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
        width: isExpanded ? '100%' : 'auto',
        maxWidth: isExpanded ? '1100px' : getFrameWidth(),
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: frameType === 'mobile' ? '36px' : frameType === 'tablet' ? '28px' : '16px',
        border: '3px solid #0f172a',
        boxShadow: '0 20px 30px -10px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        minHeight: '620px',
      }}
    >
      {/* Device Hardware Top Bezel */}
      {frameType === 'mobile' && (
        <div style={{ height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '48px', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px' }} />
        </div>
      )}
      {frameType === 'tablet' && (
        <div style={{ height: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '6px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '50%' }} />
        </div>
      )}

      {/* Role Title Bar & Milestone Process Pill */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ fontSize: '18px' }}>{getRoleIcon()}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {role}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
              {frameType.toUpperCase()} {isAr ? 'فيو' : 'VIEW'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Milestone Process Code Badge */}
          <div
            style={{
              backgroundColor: TEAL_PRIMARY,
              color: '#ffffff',
              padding: '3px 7px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            title={process.desc}
          >
            <span>{process.code}</span>
            <span style={{ opacity: 0.8, fontSize: '9px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {process.desc}
            </span>
          </div>

          {/* Expand / Minimize Button */}
          <button
            onClick={onToggleExpand}
            style={{
              backgroundColor: isExpanded ? '#0f172a' : '#f1f5f9',
              color: isExpanded ? '#ffffff' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 7px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
            title={isExpanded ? (isAr ? 'تصغير' : 'Collapse') : (isAr ? 'تكبير' : 'Expand')}
          >
            {isExpanded ? '⤢' : '⤡'}
          </button>
        </div>
      </div>

      {/* Screen Body Content */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1, backgroundColor: '#fcfdfd' }}>
        {children}
      </div>
    </div>
  );
};

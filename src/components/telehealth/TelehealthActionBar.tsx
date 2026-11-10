import React from 'react';
import { ActionButton } from './TelehealthControls';

interface Props {
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  isVideoOff: boolean;
  setIsVideoOff: (val: boolean) => void;
  isDicomActive: boolean;
  setIsDicomActive: (val: boolean) => void;
  onAdvanceStage: () => void;
  colors: Record<string, string>;
  isDarkMode: boolean;
  isRtl: boolean;
}

export const TelehealthActionBar: React.FC<Props> = ({
  isMuted,
  setIsMuted,
  isVideoOff,
  setIsVideoOff,
  isDicomActive,
  setIsDicomActive,
  onAdvanceStage,
  colors,
  isDarkMode,
  isRtl,
}) => {
  const tileBg = isDarkMode ? colors.darkTile : colors.lightTile;

  return (
    <div
      style={{
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '1rem',
        backgroundColor: tileBg,
        borderRadius: '9999px',
        maxWidth: '800px',
        width: '100%',
        margin: '1.5rem auto 0 auto',
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <ActionButton
        onClick={() => setIsMuted(!isMuted)}
        isActive={isMuted}
        label={isMuted ? (isRtl ? 'إلغاء الكتم' : 'Unmute') : (isRtl ? 'كتم الصوت' : 'Mute')}
        icon={
          isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          )
        }
        colors={colors}
        isDarkMode={isDarkMode}
      />

      <ActionButton
        onClick={() => setIsVideoOff(!isVideoOff)}
        isActive={isVideoOff}
        label={isVideoOff ? (isRtl ? 'تشغيل الكاميرا' : 'Camera On') : (isRtl ? 'إيقاف الكاميرا' : 'Camera Off')}
        icon={
          isVideoOff ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          )
        }
        colors={colors}
        isDarkMode={isDarkMode}
      />

      <ActionButton
        onClick={() => setIsDicomActive(!isDicomActive)}
        isActive={isDicomActive}
        label={isRtl ? 'عرض DICOM متعدد الشرائح' : 'DICOM Multi-Slice'}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        }
        colors={colors}
        isDarkMode={isDarkMode}
        accentColor={colors.secondary}
      />

      <button
        type="button"
        onClick={onAdvanceStage}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: 'none',
          borderRadius: '9999px',
          padding: '0.75rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: 700,
          fontFamily: "'Cairo', sans-serif",
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label={isRtl ? 'إنهاء الجلسة متعددة التخصصات' : 'Conclude Multi-Disciplinary Session'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6Z"/></svg>
        {isRtl ? 'إنهاء الجلسة' : 'Conclude Session'}
      </button>
    </div>
  );
};

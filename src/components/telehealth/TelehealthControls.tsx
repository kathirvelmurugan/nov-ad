import React from 'react';

export const TELEHEALTH_COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  light: '#E6FAF7',
  whatsapp: '#25D366',
  darkBg: '#0f172a',
  darkTile: '#1e293b',
  darkText: '#f8fafc',
  lightBg: '#f8fafc',
  lightTile: '#ffffff',
  lightText: '#0f172a',
};

export interface VideoTileProps {
  name: string;
  role: string;
  isActive: boolean;
  isDarkMode: boolean;
  colors: Record<string, string>;
  isRtl: boolean;
  children?: React.ReactNode;
}

export const VideoTile: React.FC<VideoTileProps> = ({ name, role, isActive, isDarkMode, colors, isRtl, children }) => {
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: isDarkMode ? colors.darkTile : colors.lightTile,
        borderRadius: '12px',
        overflow: 'hidden',
        border: isActive ? `3px solid ${colors.primary}` : `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        boxShadow: isActive ? `0 0 15px ${colors.primary}40` : 'none',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '220px',
      }}
    >
      {/* Simulated Video Background / Avatar */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: `${colors.primary}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', color: isDarkMode ? colors.darkText : colors.lightText }}>
        {name}
      </h3>
      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', opacity: 0.7, textAlign: 'center', color: isDarkMode ? colors.darkText : colors.lightText }}>
        {role}
      </p>

      {/* Active Speaker Indicator */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: isRtl ? 'auto' : '0.75rem',
            right: isRtl ? '0.75rem' : 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            backgroundColor: `${colors.primary}E6`,
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '0.65rem', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>
            {isRtl ? 'متحدث' : 'Speaking'}
          </span>
        </div>
      )}

      {children}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export interface ActionButtonProps {
  onClick: () => void;
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  colors: Record<string, string>;
  isDarkMode: boolean;
  accentColor?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, isActive, label, icon, colors, isDarkMode, accentColor }) => {
  const baseColor = accentColor || colors.primary;
  
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        backgroundColor: isActive ? `${baseColor}20` : 'transparent',
        color: isActive ? baseColor : (isDarkMode ? colors.darkText : colors.lightText),
        border: 'none',
        borderRadius: '12px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: "'Cairo', sans-serif",
        minWidth: '70px',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${baseColor}10`)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isActive ? `${baseColor}20` : 'transparent')}
    >
      {icon}
      <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{label}</span>
    </button>
  );
};

import React from 'react';
import { VideoTile } from './TelehealthControls';

interface Props {
  activeSpeaker: 'consultant' | 'treating' | 'nurse' | 'patient';
  isDarkMode: boolean;
  colors: Record<string, string>;
  isRtl: boolean;
  isDicomActive: boolean;
  patientNameAr: string;
}

export const TelehealthParticipantGrid: React.FC<Props> = ({
  activeSpeaker,
  isDarkMode,
  colors,
  isRtl,
  isDicomActive,
  patientNameAr,
}) => {
  const tileBg = isDarkMode ? colors.darkTile : colors.lightTile;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        flex: 1,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* Tile 1: Indian Consultant */}
      <VideoTile
        name="Dr. Arjun Mehta"
        role={isRtl ? 'استشاري هندي' : 'Indian consultant'}
        isActive={activeSpeaker === 'consultant'}
        isDarkMode={isDarkMode}
        colors={colors}
        isRtl={isRtl}
      >
        {isDicomActive && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              right: isRtl ? 'auto' : '0.5rem',
              left: isRtl ? '0.5rem' : 'auto',
              width: '80px',
              height: '60px',
              backgroundColor: '#000',
              border: `2px solid ${colors.secondary}`,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            3D DICOM
          </div>
        )}
      </VideoTile>

      {/* Tile 2: Saudi Treating Doctor */}
      <VideoTile
        name="Dr. Abdullah Al-Shammari"
        role={isRtl ? 'الطبيب المعالج' : 'Saudi treating doctor'}
        isActive={activeSpeaker === 'treating'}
        isDarkMode={isDarkMode}
        colors={colors}
        isRtl={isRtl}
      />

      {/* Tile 3: ALO Triage Nurse - Interpreter */}
      <div
        style={{
          position: 'relative',
          backgroundColor: tileBg,
          borderRadius: '12px',
          overflow: 'hidden',
          border: activeSpeaker === 'nurse' ? `3px solid ${colors.whatsapp}` : `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
          boxShadow: activeSpeaker === 'nurse' ? `0 0 15px ${colors.whatsapp}40` : 'none',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          minHeight: '220px',
        }}
      >
        {/* Avatar Placeholder */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: colors.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            border: `2px solid ${colors.primary}`,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, textAlign: 'center' }}>
          {isRtl ? 'ممرضة ألو المناوبة' : 'ALO Triage Nurse'}
        </h3>
        <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>
          {isRtl ? 'تمريض الرعاية الافتراضية' : 'Virtual Care Nursing'}
        </p>

        {/* Interpreter Badge */}
        <div
          style={{
            marginTop: '0.5rem',
            backgroundColor: `${colors.primary}20`,
            color: colors.primary,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.65rem',
            fontWeight: 700,
            textAlign: 'center',
            border: `1px solid ${colors.primary}40`,
            lineHeight: 1.4,
          }}
        >
          {isRtl ? 'مترجمة طبية معتمدة | Certified Medical Interpreter (EN ↔ AR)' : 'Certified Medical Interpreter (EN ↔ AR) | مترجمة طبية معتمدة'}
        </div>

        {/* Live Audio Translation Wave */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1rem', height: '20px' }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                backgroundColor: colors.whatsapp,
                borderRadius: '2px',
                animation: `wave 1s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          <span style={{ fontSize: '0.65rem', marginLeft: isRtl ? 0 : '0.5rem', marginRight: isRtl ? '0.5rem' : 0, color: colors.whatsapp, fontWeight: 600 }}>
            {isRtl ? 'ترجمة مباشرة' : 'Live Translating'}
          </span>
        </div>

        {activeSpeaker === 'nurse' && (
          <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.whatsapp }} />
        )}
      </div>

      {/* Tile 4: Patient */}
      <VideoTile
        name={patientNameAr}
        role={isRtl ? 'المريض' : 'Patient'}
        isActive={activeSpeaker === 'patient'}
        isDarkMode={isDarkMode}
        colors={colors}
        isRtl={isRtl}
      />
    </div>
  );
};

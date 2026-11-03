import React, { useState, useEffect } from 'react';
import { ClinicalCase } from '../../types';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

const OpinionTelehealthView: React.FC<Props> = ({ activeCase, onAdvanceStage, onUpdateCase }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isDicomActive, setIsDicomActive] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'consultant' | 'treating' | 'nurse' | 'patient'>('consultant');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const patientNameAr = activeCase.patientNameAr || 'سالم';
  const isRtl = typeof document !== 'undefined' ? document.dir === 'rtl' : true;

  const colors = {
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

  const bg = isDarkMode ? colors.darkBg : colors.lightBg;
  const tileBg = isDarkMode ? colors.darkTile : colors.lightTile;
  const textColor = isDarkMode ? colors.darkText : colors.lightText;
  const subtitleBg = isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Cairo', sans-serif",
        backgroundColor: bg,
        color: textColor,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: colors.primary }}>
            {isRtl ? 'جلسة الرأي الطبي المتعدد التخصصات' : 'Multi-Disciplinary Telehealth Session'}
          </h1>
          <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>
            {isRtl ? `حالة المريض: ${patientNameAr}` : `Patient Case: ${patientNameAr}`}
          </p>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle Dark Mode"
          style={{
            background: 'transparent',
            border: `1px solid ${colors.secondary}`,
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            color: textColor,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 600,
          }}
        >
          {isDarkMode ? (isRtl ? 'الوضع الفاتح' : 'Light Mode') : (isRtl ? 'الوضع الداكن' : 'Dark Mode')}
        </button>
      </header>

      {/* Video Grid */}
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
          role={isRtl ? 'استشاري هندي' : 'Indian Consultant'}
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
          role={isRtl ? 'الطبيب المعالج' : 'Saudi Treating Doctor'}
          isActive={activeSpeaker === 'treating'}
          isDarkMode={isDarkMode}
          colors={colors}
          isRtl={isRtl}
        />

        {/* Tile 3: ALO Nurse (Sara) - Interpreter */}
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

          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, textAlign: 'center' }}>Sara Al-Dosari</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>
            {isRtl ? 'ممرضة ألو' : 'ALO Nurse'}
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

      {/* Real-Time Translation Subtitle Banner */}
      <div
        style={{
          marginTop: '1.5rem',
          backgroundColor: subtitleBg,
          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          maxWidth: '1200px',
          width: '100%',
          margin: '1.5rem auto 0 auto',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.primary, textTransform: 'uppercase' }}>
              Dr. Arjun (EN):
            </span>
            <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.9 }}>
              "Based on the 3D DICOM reconstruction, I recommend we proceed with a minimally invasive approach for the cardiac intervention."
            </p>
          </div>
          <div style={{ height: '1px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', width: '100%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.whatsapp, textTransform: 'uppercase' }}>
              Sara (AR):
            </span>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
              "بناءً على إعادة البناء ثلاثية الأبعاد لصور الدايكوم، أوصي بأن نمضي قدماً في نهج التدخل الجراحي المحدود للقلب."
            </p>
          </div>
        </div>
      </div>

      {/* Call Action Bar */}
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

      {/* Keyframes for translation wave */}
      <style>{`
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </div>
  );
};

interface VideoTileProps {
  name: string;
  role: string;
  isActive: boolean;
  isDarkMode: boolean;
  colors: Record<string, string>;
  isRtl: boolean;
  children?: React.ReactNode;
}

const VideoTile: React.FC<VideoTileProps> = ({ name, role, isActive, isDarkMode, colors, isRtl, children }) => {
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

interface ActionButtonProps {
  onClick: () => void;
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  colors: Record<string, string>;
  isDarkMode: boolean;
  accentColor?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, isActive, label, icon, colors, isDarkMode, accentColor }) => {
  const baseColor = accentColor || colors.primary;
  
  return (
    <button
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

export default OpinionTelehealthView;
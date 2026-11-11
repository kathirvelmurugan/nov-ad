import React, { useState, useEffect } from 'react';
import { ClinicalCase } from '../../types';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { LIVEKIT_CONFIG, createLiveKitToken } from '../../services/livekit';
import {
  TELEHEALTH_COLORS as colors,
} from '../telehealth/TelehealthControls';
import { TelehealthParticipantGrid } from '../telehealth/TelehealthParticipantGrid';
import { TelehealthActionBar } from '../telehealth/TelehealthActionBar';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onBackToTimeline?: () => void;
}

const OpinionTelehealthView: React.FC<Props> = ({ activeCase, onAdvanceStage, onBackToTimeline }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isDicomActive, setIsDicomActive] = useState(false);
  const [activeSpeaker] = useState<'consultant' | 'treating' | 'nurse' | 'patient'>('consultant');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const patientNameAr = activeCase.patientNameAr || activeCase.patientName || 'سالم';
  const patientNameEn = activeCase.patientNameEn || activeCase.patientName || 'Salem';
  const isRtl = typeof document !== 'undefined' ? document.dir === 'rtl' : true;
  const patientDisplayName = isRtl ? patientNameAr : patientNameEn;

  const bg = isDarkMode ? colors.darkBg : colors.lightBg;
  const textColor = isDarkMode ? colors.darkText : colors.lightText;
  const subtitleBg = isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)';

  const handleConnectLiveKit = async () => {
    setIsGeneratingToken(true);
    try {
      const token = await createLiveKitToken({
        roomName: activeCase.caseNumber || 'ALO-2026-LIVE',
        participantName: patientDisplayName,
        participantRole: 'patient',
      });
      setLiveKitToken(token);
      setIsLiveKitConnected(true);
    } catch (err) {
      console.error('Failed to generate LiveKit token:', err);
    } finally {
      setIsGeneratingToken(false);
    }
  };

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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: colors.primary }}>
            {isRtl ? 'جلسة الرأي الطبي المتعدد التخصصات (LiveKit WebRTC)' : 'Multi-Disciplinary Telehealth Session (LiveKit)'}
          </h1>
          <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>
            {isRtl ? `حالة المريض: ${patientDisplayName} (${activeCase.diagnosisAr || activeCase.diagnosis})` : `Patient Case: ${patientDisplayName} (${activeCase.diagnosis})`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBackToTimeline && (
            <button
              type="button"
              onClick={onBackToTimeline}
              style={{
                background: 'transparent',
                border: `1px solid ${colors.primary}`,
                borderRadius: '9999px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                color: colors.primary,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              {isRtl ? '← رجوع لمسار المريض' : '← Back to Timeline'}
            </button>
          )}
          <button
            type="button"
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
        </div>
      </header>

      {/* LiveKit Cloud Connection Control Ribbon */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        backgroundColor: isDarkMode ? '#1e293b' : '#f0fdfa',
        border: `1px solid ${colors.secondary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.whatsapp }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            {isRtl ? 'غرفة LiveKit السحابية المشفرة' : 'Encrypted LiveKit Cloud Room'}
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.7 }}>
            ({activeCase.caseNumber || 'ALO-2026-LIVE'})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isLiveKitConnected ? (
            <button
              type="button"
              onClick={handleConnectLiveKit}
              disabled={isGeneratingToken}
              style={{
                backgroundColor: colors.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.9rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontFamily: "'Cairo', sans-serif"
              }}
            >
              {isGeneratingToken ? (isRtl ? 'جاري تجهيز الاتصال...' : 'Connecting...') : (isRtl ? '📹 تشغيل البث المباشر (LiveKit WebRTC)' : '📹 Start Live WebRTC Room')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsLiveKitConnected(false)}
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.9rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontFamily: "'Cairo', sans-serif"
              }}
            >
              {isRtl ? 'إنهاء البث المباشر' : 'Exit Live WebRTC'}
            </button>
          )}

          <button
            type="button"
            onClick={onAdvanceStage}
            style={{
              backgroundColor: colors.whatsapp,
              color: '#064e3b',
              border: 'none',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: "'Cairo', sans-serif"
            }}
          >
            {isRtl ? 'إنهاء الجلسة والانتقال لاعتماد التقرير المكتوب ←' : 'Finish Call & Endorse Written Report →'}
          </button>
        </div>
      </div>

      {/* Main Video Body: Live LiveKit VideoConference OR Clinical Simulator */}
      {isLiveKitConnected && liveKitToken ? (
        <div style={{ flex: 1, minHeight: '520px', borderRadius: '16px', overflow: 'hidden', border: `2px solid ${colors.secondary}`, marginBottom: '1rem' }}>
          <LiveKitRoom
            video={!isVideoOff}
            audio={!isMuted}
            token={liveKitToken}
            serverUrl={LIVEKIT_CONFIG.url}
            data-lk-theme="default"
            style={{ height: '520px' }}
            onDisconnected={() => {
              setIsLiveKitConnected(false);
              onAdvanceStage();
            }}
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      ) : null}

      {/* Clinical Multi-Party Grid */}
      {!isLiveKitConnected && (
        <TelehealthParticipantGrid
          activeSpeaker={activeSpeaker}
          isDarkMode={isDarkMode}
          colors={colors}
          isRtl={isRtl}
          isDicomActive={isDicomActive}
          patientNameAr={patientNameAr}
        />
      )}

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
              Consultant (EN):
            </span>
            <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.9 }}>
              "{activeCase.consultant?.opinionEnglish || `Based on the 3D DICOM reconstruction for ${activeCase.diagnosis}, I recommend proceeding with the certified intervention plan.`}"
            </p>
          </div>
          <div style={{ height: '1px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', width: '100%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.whatsapp, textTransform: 'uppercase' }}>
              Clinical Team (AR):
            </span>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
              "{activeCase.consultant?.opinionArabic || `بناءً على إعادة البناء ثلاثية الأبعاد لـ ${activeCase.diagnosisAr || activeCase.diagnosis}، أوصي بالمضي قدماً وفق الخطة العلاجية المعتمدة.`}"
            </p>
          </div>
        </div>
      </div>

      {/* Call Action Bar */}
      <TelehealthActionBar
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isVideoOff={isVideoOff}
        setIsVideoOff={setIsVideoOff}
        isDicomActive={isDicomActive}
        setIsDicomActive={setIsDicomActive}
        onAdvanceStage={onAdvanceStage}
        colors={colors}
        isDarkMode={isDarkMode}
        isRtl={isRtl}
      />
    </div>
  );
};

export default OpinionTelehealthView;
export { OpinionTelehealthView };

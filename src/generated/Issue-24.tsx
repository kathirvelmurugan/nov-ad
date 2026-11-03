import React, { useState } from 'react';
import { ClinicalCase } from '../../types';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

type ScreenStage = 'K05_K07' | 'K08' | 'K09';

const ConsultantMobileView: React.FC<Props> = ({ activeCase, onAdvanceStage, onUpdateCase }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenStage>('K05_K07');
  const [opinionText, setOpinionText] = useState<string>(activeCase.consultantOpinion || '');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [finalRemarks, setFinalRemarks] = useState<string>(activeCase.finalClosureNote || '');

  const tealPrimary = '#007B6E';
  const tealSecondary = '#00C6AE';
  const tealBg = '#E6FAF7';
  const whatsappGreen = '#25D366';

  const callSlots = [
    { id: 'slot_a', label: 'Slot A: Tomorrow 16:00 AST' },
    { id: 'slot_b', label: 'Slot B: Thursday 11:30 AST' },
  ];

  const handleSaveOpinionAndSlots = () => {
    onUpdateCase({
      consultantOpinion: opinionText,
      proposedCallSlot: selectedSlot,
    });
    setCurrentScreen('K08');
    onAdvanceStage();
  };

  const handleJoinTeleconsultation = () => {
    setCurrentScreen('K09');
    onAdvanceStage();
  };

  const handleSubmitFinalRemarks = () => {
    onUpdateCase({
      finalClosureNote: finalRemarks,
      status: 'closed',
    });
    onAdvanceStage();
  };

  return (
    <div
      dir="ltr"
      style={{
        fontFamily: "'Cairo', sans-serif",
        direction: 'ltr',
        textAlign: 'left',
        backgroundColor: tealBg,
        minHeight: '100vh',
        padding: '16px',
        color: '#1A1A1A',
      }}
    >
      <header
        style={{
          backgroundColor: tealPrimary,
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 123, 110, 0.15)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
          Indian Consultant Clinical Portal
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
          Case ID: {activeCase.id || 'N/A'}
        </p>
      </header>

      {currentScreen === 'K05_K07' && (
        <section
          aria-label="Opinion and Slots Proposal"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <h2 style={{ fontSize: '18px', color: tealPrimary, marginTop: 0, marginBottom: '16px' }}>
            Clinical Opinion & Call Slots Proposal
          </h2>

          <div
            style={{
              backgroundColor: '#0D1B2A',
              borderRadius: '8px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: `2px solid ${tealSecondary}`,
              position: 'relative',
              overflow: 'hidden',
            }}
            aria-label="Multi-slice DICOM Viewer Preview"
          >
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                backgroundColor: 'rgba(0, 198, 174, 0.8)',
                color: '#FFF',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              DICOM PREVIEW
            </div>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00C6AE" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>

          <label
            htmlFor="consultant-opinion"
            style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#333' }}
          >
            Written Clinical Opinion
          </label>
          <textarea
            id="consultant-opinion"
            value={opinionText}
            onChange={(e) => setOpinionText(e.target.value)}
            placeholder="Enter your detailed clinical findings and recommendations here..."
            rows={5}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${tealSecondary}`,
              fontFamily: "'Cairo', sans-serif",
              fontSize: '14px',
              resize: 'vertical',
              marginBottom: '24px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = tealPrimary)}
            onBlur={(e) => (e.target.style.borderColor = tealSecondary)}
          />

          <fieldset
            style={{
              border: 'none',
              padding: 0,
              margin: '0 0 24px 0',
            }}
          >
            <legend style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>
              Propose Teleconsultation Call Slot
            </legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {callSlots.map((slot) => (
                <label
                  key={slot.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: `2px solid ${selectedSlot === slot.id ? tealPrimary : '#E0E0E0'}`,
                    backgroundColor: selectedSlot === slot.id ? tealBg : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="callSlot"
                    value={slot.id}
                    checked={selectedSlot === slot.id}
                    onChange={() => setSelectedSlot(slot.id)}
                    style={{ marginRight: '12px', accentColor: tealPrimary, width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: selectedSlot === slot.id ? 600 : 400 }}>
                    {slot.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            onClick={handleSaveOpinionAndSlots}
            disabled={!selectedSlot || !opinionText.trim()}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: !selectedSlot || !opinionText.trim() ? '#B0BEC5' : tealPrimary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: !selectedSlot || !opinionText.trim() ? 'not-allowed' : 'pointer',
              fontFamily: "'Cairo', sans-serif",
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedSlot && opinionText.trim()) e.currentTarget.style.backgroundColor = '#005C52';
            }}
            onMouseLeave={(e) => {
              if (selectedSlot && opinionText.trim()) e.currentTarget.style.backgroundColor = tealPrimary;
            }}
          >
            Submit Opinion & Proposed Slots
          </button>
        </section>
      )}

      {currentScreen === 'K08' && (
        <section
          aria-label="Multi-Disciplinary Video Call"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '18px', color: tealPrimary, marginTop: 0, marginBottom: '8px' }}>
            Multi-Disciplinary Video Call
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            Join the secure teleconsultation room with the Saudi primary care team.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#FFF3E0',
              color: '#E65100',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '24px',
              border: '1px solid #FFE0B2',
            }}
            role="status"
            aria-label="SLA Status Badge"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            48h SLA Active
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>Selected Slot:</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: tealPrimary }}>
              {callSlots.find(s => s.id === selectedSlot)?.label || 'Not specified'}
            </p>
          </div>

          <button
            onClick={handleJoinTeleconsultation}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: whatsappGreen,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
              transition: 'transform 0.1s ease, box-shadow 0.2s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Join Teleconsultation Room
          </button>
        </section>
      )}

      {currentScreen === 'K09' && (
        <section
          aria-label="Follow-Up Response and Final Closure Note"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <h2 style={{ fontSize: '18px', color: tealPrimary, marginTop: 0, marginBottom: '20px' }}>
            Follow-Up & Final Closure
          </h2>

          <div
            style={{
              backgroundColor: tealBg,
              borderLeft: `4px solid ${tealSecondary}`,
              padding: '16px',
              borderRadius: '0 8px 8px 0',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tealPrimary} strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: tealPrimary }}>
                Relayed Questions from ALO Coordinator
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: 1.6 }}>
              {activeCase.coordinatorQuestions ||
                'Please confirm if the suggested dosage adjustments for the pediatric patient align with the latest WHO guidelines, and advise on the follow-up imaging schedule.'}
            </p>
          </div>

          <label
            htmlFor="final-closure-remarks"
            style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#333' }}
          >
            Final Clinical Closure Remarks
          </label>
          <textarea
            id="final-closure-remarks"
            value={finalRemarks}
            onChange={(e) => setFinalRemarks(e.target.value)}
            placeholder="Provide your final clinical assessment, answers to coordinator questions, and closure recommendations..."
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${tealSecondary}`,
              fontFamily: "'Cairo', sans-serif",
              fontSize: '14px',
              resize: 'vertical',
              marginBottom: '24px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = tealPrimary)}
            onBlur={(e) => (e.target.style.borderColor = tealSecondary)}
          />

          <button
            onClick={handleSubmitFinalRemarks}
            disabled={!finalRemarks.trim()}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: !finalRemarks.trim() ? '#B0BEC5' : tealPrimary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: !finalRemarks.trim() ? 'not-allowed' : 'pointer',
              fontFamily: "'Cairo', sans-serif",
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (finalRemarks.trim()) e.currentTarget.style.backgroundColor = '#005C52';
            }}
            onMouseLeave={(e) => {
              if (finalRemarks.trim()) e.currentTarget.style.backgroundColor = tealPrimary;
            }}
          >
            Submit Final Comment & Close Case
          </button>
        </section>
      )}

      <footer
        style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '11px',
          color: '#888',
          paddingBottom: '16px',
        }}
      >
        ALO DOCTOR v2.4 Saudi Edition • Secure Clinical Environment
      </footer>
    </div>
  );
};

export default ConsultantMobileView;
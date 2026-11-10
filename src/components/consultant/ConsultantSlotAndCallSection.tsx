import React from 'react';

interface Slot {
  id: string;
  label: string;
}

interface Props {
  currentScreen: 'K07' | 'K08';
  callSlots: Slot[];
  selectedSlot: string;
  setSelectedSlot: (val: string) => void;
  consultantSlaFormatted: string;
  tealPrimary: string;
  tealBg: string;
  whatsappGreen: string;
  onSaveSlots: () => void;
  onJoinTeleconsultation: () => void;
}

export const ConsultantSlotAndCallSection: React.FC<Props> = ({
  currentScreen,
  callSlots,
  selectedSlot,
  setSelectedSlot,
  consultantSlaFormatted,
  tealPrimary,
  tealBg,
  whatsappGreen,
  onSaveSlots,
  onJoinTeleconsultation,
}) => {
  if (currentScreen === 'K07') {
    return (
      <section aria-label="Offer call slots" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', color: tealPrimary, marginTop: 0, marginBottom: '16px' }}>
          K07 · Offer call slots (IST)
        </h2>
        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
          <legend style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>
            Propose Teleconsultation Call Slot
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {callSlots.map((slot) => (
              <label
                key={slot.id}
                style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', border: `2px solid ${selectedSlot === slot.id ? tealPrimary : '#E0E0E0'}`, backgroundColor: selectedSlot === slot.id ? tealBg : '#FFFFFF', cursor: 'pointer' }}
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
          type="button"
          onClick={onSaveSlots}
          disabled={!selectedSlot}
          style={{ width: '100%', padding: '14px', backgroundColor: !selectedSlot ? '#B0BEC5' : tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: !selectedSlot ? 'not-allowed' : 'pointer', fontFamily: "'Cairo', sans-serif" }}
        >
          Submit proposed slots
        </button>
      </section>
    );
  }

  return (
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
        data-testid="consultant-sla-badge"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        48h SLA Active: {consultantSlaFormatted}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>Selected Slot:</p>
        <p style={{ fontSize: '15px', fontWeight: 600, color: tealPrimary }}>
          {callSlots.find(s => s.id === selectedSlot)?.label || 'Not specified'}
        </p>
      </div>

      <button
        type="button"
        onClick={onJoinTeleconsultation}
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
  );
};

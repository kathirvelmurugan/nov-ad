import React from 'react';

interface Props {
  relayed: string[];
  answers: string[];
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  finalRemarks: string;
  setFinalRemarks: (val: string) => void;
  tealPrimary: string;
  tealSecondary: string;
  tealBg: string;
  onSubmitFinalRemarks: () => void;
}

export const ConsultantFollowUpSection: React.FC<Props> = ({
  relayed,
  answers,
  setAnswers,
  finalRemarks,
  setFinalRemarks,
  tealPrimary,
  tealSecondary,
  tealBg,
  onSubmitFinalRemarks,
}) => {
  return (
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {relayed.length === 0 && (
            <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: 1.6 }}>
              No relayed follow-up questions yet.
            </p>
          )}
          {relayed.map((q, idx) => (
            <div key={idx} style={{ backgroundColor: '#FFFFFF', border: `1px solid ${tealSecondary}`, borderRadius: '8px', padding: '12px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#333', lineHeight: 1.5 }}>Q{idx + 1}: {q}</p>
              <textarea
                value={answers[idx] || ''}
                onChange={(e) => setAnswers((prev) => { const next = [...prev]; next[idx] = e.target.value; return next; })}
                rows={2}
                placeholder="Your answer to this question..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${tealSecondary}`, fontFamily: "'Cairo', sans-serif", fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
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
        type="button"
        onClick={onSubmitFinalRemarks}
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
  );
};

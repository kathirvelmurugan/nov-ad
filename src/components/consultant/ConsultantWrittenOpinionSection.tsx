import React from 'react';

interface Props {
  focusQuestionsEn: string[];
  focusAnswers: [string, string, string];
  setFocusAnswers: (answers: [string, string, string]) => void;
  opinionText: string;
  setOpinionText: (val: string) => void;
  tealPrimary: string;
  tealSecondary: string;
  tealBg: string;
  isWritten: boolean;
  onSaveOpinion: () => void;
}

export const ConsultantWrittenOpinionSection: React.FC<Props> = ({
  focusQuestionsEn,
  focusAnswers,
  setFocusAnswers,
  opinionText,
  setOpinionText,
  tealPrimary,
  tealSecondary,
  tealBg,
  isWritten,
  onSaveOpinion,
}) => {
  return (
    <section aria-label="Written opinion" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '18px', color: tealPrimary, marginTop: 0, marginBottom: '16px' }}>
        K06 · Written opinion
      </h2>

      {/* Answers to Saudi Doctor's 3 Focus Questions */}
      <div style={{ backgroundColor: tealBg, borderRadius: '8px', padding: '16px', marginBottom: '20px', border: `1px solid ${tealSecondary}` }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: tealPrimary, marginTop: 0, marginBottom: '12px' }}>
          Direct Answers to Saudi Treating Doctor Focus Questions:
        </h3>
        {focusQuestionsEn.map((q, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '4px' }}>
              Q{i+1}: {q}
            </div>
            <textarea
              rows={2}
              value={focusAnswers[i]}
              onChange={(e) => {
                const next = [...focusAnswers] as [string, string, string];
                next[i] = e.target.value;
                setFocusAnswers(next);
              }}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Cairo', sans-serif" }}
            />
          </div>
        ))}
      </div>

      <label htmlFor="consultant-opinion" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#333' }}>
        Written Clinical Opinion / Synthesis
      </label>
      <textarea
        id="consultant-opinion"
        value={opinionText}
        onChange={(e) => setOpinionText(e.target.value)}
        placeholder="Enter your detailed clinical findings and recommendations here..."
        rows={5}
        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${tealSecondary}`, fontFamily: "'Cairo', sans-serif", fontSize: '14px', resize: 'vertical', marginBottom: '24px', outline: 'none', boxSizing: 'border-box' }}
      />
      <button
        type="button"
        onClick={onSaveOpinion}
        disabled={!opinionText.trim()}
        style={{ width: '100%', padding: '14px', backgroundColor: !opinionText.trim() ? '#B0BEC5' : tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: !opinionText.trim() ? 'not-allowed' : 'pointer', fontFamily: "'Cairo', sans-serif" }}
      >
        {isWritten ? 'Submit written opinion (no call)' : 'Save opinion · continue to slots (K07)'}
      </button>
    </section>
  );
};

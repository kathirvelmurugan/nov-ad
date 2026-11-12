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
  const isOpinionValid = (opinionText || '').trim().length >= 50;
  const areAnswersValid = (focusAnswers || []).every(
    (ans) => (ans || '').trim().length >= 15
  );
  const canSubmit = isOpinionValid && areAnswersValid;

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
        {focusQuestionsEn.map((q, i) => {
          const ans = focusAnswers[i] || '';
          const isAnsValid = ans.trim().length >= 15;
          return (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>
                  Q{i + 1}: {q}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: isAnsValid ? tealPrimary : '#D32F2F', fontWeight: 600 }}>
                  {ans.trim().length} / 15 min chars
                </span>
              </div>
              <textarea
                rows={2}
                value={ans}
                placeholder="Provide a detailed clinical answer (minimum 15 characters)..."
                onChange={(e) => {
                  const next = [...focusAnswers] as [string, string, string];
                  next[i] = e.target.value;
                  setFocusAnswers(next);
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: isAnsValid ? '1px solid #CBD5E1' : '1.5px solid #D32F2F',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: "'Cairo', sans-serif"
                }}
              />
              {!isAnsValid && (
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#D32F2F', fontWeight: 500 }}>
                  ⚠️ Each focus question answer must be at least 15 characters long.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label htmlFor="consultant-opinion" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333' }}>
          Written Clinical Opinion / Synthesis
        </label>
        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: isOpinionValid ? tealPrimary : '#D32F2F', fontWeight: 600 }}>
          {(opinionText || '').trim().length} / 50 min chars
        </span>
      </div>
      <textarea
        id="consultant-opinion"
        value={opinionText}
        onChange={(e) => setOpinionText(e.target.value)}
        placeholder="Enter your comprehensive clinical findings and recommendations here (minimum 50 characters)..."
        rows={5}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: isOpinionValid ? `1px solid ${tealSecondary}` : '1.5px solid #D32F2F',
          fontFamily: "'Cairo', sans-serif",
          fontSize: '14px',
          resize: 'vertical',
          marginBottom: '8px',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
      {!isOpinionValid && (
        <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#D32F2F', fontWeight: 500 }}>
          ⚠️ Comprehensive second opinion must be at least 50 characters long.
        </p>
      )}

      <button
        type="button"
        onClick={onSaveOpinion}
        disabled={!canSubmit}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: !canSubmit ? '#B0BEC5' : tealPrimary,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: !canSubmit ? 'not-allowed' : 'pointer',
          fontFamily: "'Cairo', sans-serif",
          transition: 'background-color 0.2s ease',
        }}
      >
        {isWritten ? 'Submit written opinion (no call)' : 'Save opinion · continue to slots (K07)'}
      </button>
      {!canSubmit && (
        <p style={{ textAlign: 'center', margin: '8px 0 0 0', fontSize: '11px', color: '#D32F2F', fontWeight: 500 }}>
          {!isOpinionValid
            ? '⚠️ Please write at least 50 characters for the clinical opinion.'
            : '⚠️ Please provide at least 15 characters for each focus question answer.'}
        </p>
      )}
    </section>
  );
};

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
  isOpinionSubmitted: boolean;
  isFollowUpEnabled: boolean;
  isCaseClosed?: boolean;
  onSaveOpinion: () => void;
  onGoToFollowUp?: () => void;
  onGoToClosure?: () => void;
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
  isOpinionSubmitted,
  isFollowUpEnabled,
  isCaseClosed = false,
  onSaveOpinion,
  onGoToFollowUp,
  onGoToClosure,
}) => {
  const isOpinionValid = (opinionText || '').trim().length >= 50;
  const areAnswersValid = (focusAnswers || []).every(
    (ans) => (ans || '').trim().length >= 15
  );
  const canSubmit = isOpinionValid && areAnswersValid;

  // ── Submitted State View ──────────────────────────────────────────────────
  if (isOpinionSubmitted) {
    return (
      <section
        aria-label="Written opinion submitted"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        {/* Prominent Confirmation Banner */}
        <div
          role="status"
          style={{
            backgroundColor: '#F0FDF4',
            border: '2px solid #22C55E',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#22C55E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 900,
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: '0 0 6px',
                fontSize: '16px',
                fontWeight: 800,
                color: '#15803D',
              }}
            >
              {isCaseClosed
                ? 'Case Successfully Closed & Archived'
                : 'Written Opinion submitted successfully and forwarded to the ALO Care Coordinator'}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#166534',
                lineHeight: 1.5,
              }}
            >
              {isCaseClosed
                ? 'The ALO Care Coordinator has finalized all follow-up inquiries and released the Final Comprehensive Dossier (PDF 2). The case is officially closed and archived.'
                : 'Written Opinion submitted successfully and forwarded to the ALO Care Coordinator.'}
            </p>
          </div>
        </div>

        {/* Closed Case Callout with button to K10 */}
        {isCaseClosed ? (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: `1.5px solid #10B981`,
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#065F46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#059669',
                  }}
                />
                Case Closed & Final Comprehensive Dossier (PDF 2) Released
              </span>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#047857' }}>
                All follow-up inquiries have been completed. You can preview, print, or download the final dossier.
              </p>
            </div>
            {onGoToClosure && (
              <button
                type="button"
                onClick={onGoToClosure}
                style={{
                  padding: '10px 18px',
                  backgroundColor: tealPrimary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                View Case Closure (PDF 2) →
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#334155',
            }}
          >
            <span style={{ fontSize: '16px' }}>✓</span>
            <div>
              <strong>Specialist Duty Concluded:</strong> Your clinical second opinion is delivered. Patient follow-up is directly handled between the patient and the ALO Care Coordinator.
            </div>
          </div>
        )}

        {/* Read-Only Summary of Submitted Opinion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: tealPrimary,
                margin: '0 0 12px',
              }}
            >
              Submitted Focus Question Answers:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {focusQuestionsEn.map((q, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Q{i + 1}: {q}
                  </div>
                  <div style={{ fontSize: '13px', color: '#0F172A', lineHeight: 1.5 }}>
                    {focusAnswers[i] || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: tealPrimary,
                margin: '0 0 8px',
              }}
            >
              Submitted Clinical Opinion Synthesis:
            </h4>
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                lineHeight: 1.7,
                color: '#1E293B',
                whiteSpace: 'pre-line',
              }}
            >
              {opinionText}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Authoring Form View ───────────────────────────────────────────────────
  return (
    <section
      aria-label="Submit written opinion"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          color: tealPrimary,
          marginTop: 0,
          marginBottom: '16px',
          fontWeight: 700,
        }}
      >
        K06 · Formulate Clinical Opinion & Recommendations
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: '#333',
          lineHeight: 1.6,
          marginBottom: '20px',
        }}
      >
        Provide comprehensive clinical findings, surgical assessments, and direct answers to the focus questions posed by the Saudi treating doctor.
      </p>

      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: tealPrimary,
            marginBottom: '12px',
          }}
        >
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
                  fontFamily: "'Cairo', sans-serif",
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
          boxSizing: 'border-box',
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
          boxShadow: canSubmit ? '0 4px 12px rgba(0, 123, 110, 0.2)' : 'none',
          transition: 'background-color 0.2s ease',
        }}
      >
        {isWritten ? 'Submit Written Opinion' : 'Save opinion · continue to slots (K07)'}
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

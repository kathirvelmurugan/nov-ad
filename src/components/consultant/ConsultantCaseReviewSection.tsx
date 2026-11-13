import React from 'react';
import { ClinicalCase } from '../../types';

interface Props {
  currentScreen: 'K01_K04' | 'K05';
  activeCase: ClinicalCase;
  focusQuestionsEn: string[];
  tealPrimary: string;
  tealSecondary: string;
  onAcceptCase: () => void;
  onContinueToK05?: () => void;
  onContinueToK06: () => void;
}

export const ConsultantCaseReviewSection: React.FC<Props> = ({
  currentScreen,
  activeCase,
  focusQuestionsEn,
  tealPrimary,
  tealSecondary,
  onAcceptCase,
  onContinueToK05,
  onContinueToK06,
}) => {
  const isAccepted = Boolean(
    activeCase.metadata?.consultantAccepted ||
    activeCase.secondOpinionSubmitted ||
    (activeCase.stage && activeCase.stage >= 6)
  );

  if (currentScreen === 'K01_K04') {
    return (
      <section aria-label="Accept case" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', color: tealPrimary, margin: 0, fontWeight: 700 }}>
            K01–04 · Accept case · 48h starts
          </h2>
          {isAccepted && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: '#DCFCE7',
              color: '#166534',
              fontSize: '12px',
              fontWeight: 800,
              border: '1px solid #86EFAC',
            }}>
              ✓ Case Accepted
            </span>
          )}
        </div>

        <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, marginBottom: '8px' }}>
          De-identified case · <strong>{activeCase.specialtyEn || activeCase.specialty || 'Cardiothoracic Surgery'}</strong> · {activeCase.diagnosisEn || activeCase.diagnosis || 'Clinical Second Opinion'}
        </p>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>
          Nurse-verified summary · {(activeCase.files || []).length} file(s). Patient identity hidden.
        </p>

        {isAccepted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              disabled={true}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'not-allowed',
                fontFamily: "'Cairo', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>✓ Case Accepted · 48h SLA Running</span>
            </button>
            <button
              type="button"
              onClick={onContinueToK05 || onContinueToK06}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: tealPrimary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                transition: 'background-color 0.2s',
              }}
            >
              Proceed to K05 Review →
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAcceptCase}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: tealPrimary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              boxShadow: '0 4px 12px rgba(0, 123, 110, 0.2)',
            }}
          >
            Accept case · start 48h SLA
          </button>
        )}
      </section>
    );
  }

  return (
    <section aria-label="Review the case" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', color: tealPrimary, margin: 0, fontWeight: 700 }}>
          K05 · Review the case (English)
        </h2>
        <span style={{ fontSize: '12px', color: '#166534', backgroundColor: '#DCFCE7', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
          SLA Active
        </span>
      </div>

      <div
        style={{ backgroundColor: '#0D1B2A', borderRadius: '8px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: `2px solid ${tealSecondary}`, position: 'relative', overflow: 'hidden' }}
        aria-label="Multi-slice DICOM Viewer Preview"
      >
        <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(0, 198, 174, 0.8)', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
          DICOM PREVIEW
        </div>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00C6AE" strokeWidth="1.5">
          <rect x="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
        Focus questions from the Saudi treating doctor
      </h3>
      <ul style={{ margin: '0 0 24px 18px', padding: 0, fontSize: '14px', color: '#333', lineHeight: 1.7 }}>
        {focusQuestionsEn.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onContinueToK06}
        style={{ width: '100%', padding: '14px', backgroundColor: tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}
      >
        Continue to written opinion (K06) →
      </button>
    </section>
  );
};

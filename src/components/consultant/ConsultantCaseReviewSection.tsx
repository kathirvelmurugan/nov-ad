import React from 'react';
import { ClinicalCase } from '../../types';

interface Props {
  currentScreen: 'K01_K04' | 'K05';
  activeCase: ClinicalCase;
  focusQuestionsEn: string[];
  tealPrimary: string;
  tealSecondary: string;
  onAcceptCase: () => void;
  onContinueToK06: () => void;
}

export const ConsultantCaseReviewSection: React.FC<Props> = ({
  currentScreen,
  activeCase,
  focusQuestionsEn,
  tealPrimary,
  tealSecondary,
  onAcceptCase,
  onContinueToK06,
}) => {
  if (currentScreen === 'K01_K04') {
    return (
      <section aria-label="Accept case" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', color: tealPrimary, marginTop: 0, marginBottom: '16px' }}>
          K01–04 · Accept case · 48h starts
        </h2>
        <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, marginBottom: '8px' }}>
          De-identified case · {activeCase.specialtyEn || activeCase.specialty} · {activeCase.diagnosisEn || activeCase.diagnosis}
        </p>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px' }}>
          Nurse-verified summary · {(activeCase.files || []).length} file(s). Patient identity hidden.
        </p>
        <button
          type="button"
          onClick={onAcceptCase}
          style={{ width: '100%', padding: '14px', backgroundColor: tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}
        >
          Accept case · start 48h SLA
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Review the case" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '18px', color: tealPrimary, marginTop: 0, marginBottom: '16px' }}>
        K05 · Review the case (English)
      </h2>
      <div
        style={{ backgroundColor: '#0D1B2A', borderRadius: '8px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: `2px solid ${tealSecondary}`, position: 'relative', overflow: 'hidden' }}
        aria-label="Multi-slice DICOM Viewer Preview"
      >
        <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(0, 198, 174, 0.8)', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
          DICOM PREVIEW
        </div>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00C6AE" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
        Focus questions from the Saudi treating doctor
      </h3>
      <ul style={{ margin: '0 0 20px 18px', padding: 0, fontSize: '14px', color: '#333', lineHeight: 1.7 }}>
        {focusQuestionsEn.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onContinueToK06}
        style={{ width: '100%', padding: '14px', backgroundColor: tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}
      >
        Continue to written opinion (K06)
      </button>
    </section>
  );
};

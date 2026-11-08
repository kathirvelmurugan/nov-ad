import React, { useState } from 'react';
import { ClinicalCase } from '../../types';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

type ScreenStage = 'K01_K04' | 'K05' | 'K06' | 'K07' | 'K08' | 'K09';

const ConsultantMobileView: React.FC<Props> = ({ activeCase, onAdvanceStage, onUpdateCase }) => {
  const isWritten = activeCase.consultationType === 'written';
  const accepted = !!activeCase.metadata?.consultantAccepted;
  const isOtpVerified = !!activeCase.consultantToken?.otpVerified;
  const [currentScreen, setCurrentScreen] = useState<ScreenStage>(accepted ? 'K05' : 'K01_K04');
  const [otpCode, setOtpCode] = useState<string>('123456');
  const [opinionText, setOpinionText] = useState<string>(activeCase.consultantOpinion || '');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [finalRemarks, setFinalRemarks] = useState<string>(activeCase.finalClosureNote || '');
  const relayed = (activeCase.metadata?.relayedQuestions as string[]) || [];
  const [answers, setAnswers] = useState<string[]>(relayed.map(() => ''));
  const focusQuestionsEn = activeCase.treatingDoctor.focusQuestionsEn || activeCase.treatingDoctor.focusQuestions;
  const [focusAnswers, setFocusAnswers] = useState<[string, string, string]>([
    'TAVR is clinically indicated given the high surgical risk and anatomical suitability on aortic root CTA.',
    'Recommend dual antiplatelet therapy (DAPT) with Aspirin 81mg and Clopidogrel 75mg for 3-6 months post-procedure.',
    'Perform transthoracic echocardiogram (TTE) at 30 days and 6 months to evaluate prosthetic valve hemodynamics.'
  ]);

  const tealPrimary = '#007B6E';
  const tealSecondary = '#00C6AE';
  const tealBg = '#E6FAF7';
  const whatsappGreen = '#25D366';

  const callSlots = [
    { id: 'slot_a', label: 'Slot A: Tomorrow 16:00 AST' },
    { id: 'slot_b', label: 'Slot B: Thursday 11:30 AST' },
  ];

  const handleVerifyOtp = () => {
    onUpdateCase({
      consultantToken: {
        token: 'ALO-MAGIC-REV-72H-TOKEN',
        expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        otpVerified: true,
        sessionCookieActive: true,
        sessionExpiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      }
    });
  };

  const handleAcceptCase = () => {
    onUpdateCase({
      metadata: { ...(activeCase.metadata || {}), consultantAccepted: true, acceptedAt: new Date().toISOString() },
    });
    setCurrentScreen('K05');
  };

  const handleSaveOpinion = () => {
    const combinedOpinion = `${opinionText}\n\n--- ANSWERS TO SAUDI DOCTOR FOCUS QUESTIONS ---\nQ1: ${focusQuestionsEn[0]}\nA1: ${focusAnswers[0]}\n\nQ2: ${focusQuestionsEn[1]}\nA2: ${focusAnswers[1]}\n\nQ3: ${focusQuestionsEn[2]}\nA3: ${focusAnswers[2]}`;
    onUpdateCase({ 
      consultantOpinion: combinedOpinion,
      metadata: { 
        ...(activeCase.metadata || {}), 
        focusAnswers,
        consultantAnswers: focusAnswers
      } 
    });
    if (isWritten) {
      onAdvanceStage();
    } else {
      setCurrentScreen('K07');
    }
  };

  const handleSaveSlots = () => {
    onUpdateCase({
      proposedCallSlot: selectedSlot,
      metadata: { ...(activeCase.metadata || {}), proposedSlots: [{ id: selectedSlot, time: selectedSlot }] },
    });
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
      metadata: { ...(activeCase.metadata || {}), consultantAnswers: answers },
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
          Case Ref: {activeCase.caseNumber || activeCase.id || 'N/A'} · Tokenized Access
        </p>
      </header>

      {!isOtpVerified ? (
        /* K00: Magic Link OTP Ingress Challenge & 30-Day Session */
        <section aria-label="Magic link OTP challenge" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: `2px solid ${tealSecondary}` }}>
          <div style={{ display: 'inline-block', backgroundColor: tealBg, color: tealPrimary, fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', marginBottom: '12px', border: `1px solid ${tealSecondary}` }}>
            K00 · MAGIC LINK ACCESS CONTROL
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', marginTop: 0, marginBottom: '8px' }}>
            Verify Identity to Unlock Clinical File
          </h2>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, marginBottom: '16px' }}>
            A temporary magic link was dispatched to your registered specialist credentials. Enter the 6-digit WhatsApp OTP to authenticate your session.
          </p>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Active Magic Token:</div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: tealPrimary }}>
              {activeCase.consultantToken?.token || 'ALO-TOKEN-72H-DR-ARJUN-KIMS'}
            </div>
          </div>

          <label htmlFor="otp-input" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
            6-Digit Verification OTP (WhatsApp / SMS):
          </label>
          <input
            id="otp-input"
            type="text"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '18px', fontWeight: 800, textAlign: 'center', letterSpacing: '4px', borderRadius: '8px', border: `2px solid ${tealPrimary}`, marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: tealBg, borderRadius: '8px', marginBottom: '20px', border: `1px solid ${tealSecondary}` }}>
            <span style={{ color: whatsappGreen, fontSize: '16px', fontWeight: 800 }}>✓</span>
            <span style={{ fontSize: '12px', color: tealPrimary, fontWeight: 700 }}>
              Encrypted 30-day session cookie will be established on this browser.
            </span>
          </div>

          <button
            onClick={handleVerifyOtp}
            style={{ width: '100%', padding: '14px', backgroundColor: tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,123,110,0.2)' }}
          >
            Verify OTP & Unlock Case Dossier (K01) →
          </button>
        </section>
      ) : (
        <>
      <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        {[
          { id: 'K05' as ScreenStage, label: 'K05 Review' },
          { id: 'K06' as ScreenStage, label: 'K06 Opinion' },
          ...(isWritten
            ? []
            : [
                { id: 'K07' as ScreenStage, label: 'K07 Slots' },
                { id: 'K08' as ScreenStage, label: 'K08 Call' },
              ]),
          { id: 'K09' as ScreenStage, label: 'K09 Follow-up' },
        ].map((b) => (
          <button
            key={b.id}
            disabled={!accepted}
            onClick={() => setCurrentScreen(b.id)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${tealSecondary}`,
              backgroundColor: currentScreen === b.id ? tealPrimary : '#FFFFFF',
              color: currentScreen === b.id ? '#FFFFFF' : tealPrimary,
              fontSize: '12px',
              fontWeight: 700,
              cursor: accepted ? 'pointer' : 'not-allowed',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            {b.label}
          </button>
        ))}
        <span style={{ fontSize: '12px', fontWeight: 700, color: tealPrimary }}>
          {accepted ? '48h SLA running' : '48h SLA starts on accept'}
        </span>
      </nav>

      {currentScreen === 'K01_K04' && (
        <section aria-label="Accept case" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', color: tealPrimary, marginTop: 0, marginBottom: '16px' }}>
            K01–04 · Accept case · 48h starts
          </h2>
          <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, marginBottom: '8px' }}>
            De-identified case · {activeCase.specialtyEn || activeCase.specialty} · {activeCase.diagnosisEn || activeCase.diagnosis}
          </p>
          <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px' }}>
            Nurse-verified summary · {activeCase.files.length} file(s). Patient identity hidden.
          </p>
          <button
            onClick={handleAcceptCase}
            style={{ width: '100%', padding: '14px', backgroundColor: tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}
          >
            Accept case · start 48h SLA
          </button>
        </section>
      )}

      {currentScreen === 'K05' && (
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
            onClick={() => setCurrentScreen('K06')}
            style={{ width: '100%', padding: '14px', backgroundColor: tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}
          >
            Continue to written opinion (K06)
          </button>
        </section>
      )}

      {currentScreen === 'K06' && (
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
            onClick={handleSaveOpinion}
            disabled={!opinionText.trim()}
            style={{ width: '100%', padding: '14px', backgroundColor: !opinionText.trim() ? '#B0BEC5' : tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: !opinionText.trim() ? 'not-allowed' : 'pointer', fontFamily: "'Cairo', sans-serif" }}
          >
            {isWritten ? 'Submit written opinion (no call)' : 'Save opinion · continue to slots (K07)'}
          </button>
        </section>
      )}

      {currentScreen === 'K07' && !isWritten && (
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
            onClick={handleSaveSlots}
            disabled={!selectedSlot}
            style={{ width: '100%', padding: '14px', backgroundColor: !selectedSlot ? '#B0BEC5' : tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: !selectedSlot ? 'not-allowed' : 'pointer', fontFamily: "'Cairo', sans-serif" }}
          >
            Submit proposed slots
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
      </>
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

export default ConsultantMobileView;export { ConsultantMobileView };

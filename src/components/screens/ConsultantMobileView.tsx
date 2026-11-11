import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { useSlaCountdown } from '../../hooks/useSlaCountdown';
import { ConsultantOtpChallenge } from '../consultant/ConsultantOtpChallenge';
import { ConsultantCaseReviewSection } from '../consultant/ConsultantCaseReviewSection';
import { ConsultantWrittenOpinionSection } from '../consultant/ConsultantWrittenOpinionSection';
import { ConsultantSlotAndCallSection } from '../consultant/ConsultantSlotAndCallSection';
import { ConsultantFollowUpSection } from '../consultant/ConsultantFollowUpSection';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

type ScreenStage = 'K01_K04' | 'K05' | 'K06' | 'K07' | 'K08' | 'K09';

const ConsultantMobileView: React.FC<Props> = ({ activeCase, onAdvanceStage, onUpdateCase }) => {
  const isWritten = activeCase.consultationType === 'written';
  const accepted = !!activeCase.metadata?.consultantAccepted;

  const { formatted: consultantSlaFormatted } = useSlaCountdown({
    storageKey: `alo_sla_consultant_${activeCase.id}`,
    initialHours: 47,
    initialMinutes: 58,
    initialSeconds: 30,
    active: accepted,
  });
  const isOtpVerified = !!activeCase.consultantToken?.otpVerified || !!activeCase.consultantToken?.sessionCookieActive || activeCase.currentStage === 'WITH_CONSULTANT' || accepted;
  const [currentScreen, setCurrentScreen] = useState<ScreenStage>(accepted ? 'K06' : 'K05');
  const [otpCode, setOtpCode] = useState<string>('');
  const [opinionText, setOpinionText] = useState<string>(activeCase.consultantOpinion || '');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [finalRemarks, setFinalRemarks] = useState<string>(activeCase.finalClosureNote || '');
  const relayed = (activeCase.metadata?.relayedQuestions as string[]) || [];
  const [answers, setAnswers] = useState<string[]>(relayed.map(() => ''));
  const baseAr = activeCase.treatingDoctor?.focusQuestions || ['', '', ''];
  const focusQuestionsEn = activeCase.treatingDoctor?.focusQuestionsEn || baseAr;
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
      },
      metadata: { ...(activeCase.metadata || {}), consultantAccepted: true, acceptedAt: new Date().toISOString() },
    });
    setCurrentScreen('K06');
  };

  const handleAcceptCase = () => {
    onUpdateCase({
      metadata: { ...(activeCase.metadata || {}), consultantAccepted: true, acceptedAt: new Date().toISOString() },
    });
    setCurrentScreen('K05');
  };

  const handleSaveOpinion = () => {
    const cleanOpinion = opinionText.trim();
    const cleanedAnswers: [string, string, string] = [
      focusAnswers[0] || '',
      focusAnswers[1] || '',
      focusAnswers[2] || '',
    ];
    onUpdateCase({
      secondOpinionSubmitted: true,
      consultantOpinion: cleanOpinion,
      consultantAnswers: cleanedAnswers,
      reportReleased: false,
      doctorReleasedToPatient: false,
      consultant: {
        ...activeCase.consultant,
        opinionEnglish: cleanOpinion,
      },
      saudiEndorsement: {
        status: 'pending',
        requiresLocalLab: false,
        prescriptionIssued: false,
        releasedToPatient: false,
      },
      metadata: {
        ...(activeCase.metadata || {}),
        focusAnswers: cleanedAnswers,
        consultantAnswers: cleanedAnswers,
        saudiDoctorApprovedOpinion: false,
        pdf1Released: false,
      },
    });
    if (isWritten) {
      onAdvanceStage();
    } else {
      setCurrentScreen('K07');
    }
  };

  const handleSaveSlots = () => {
    onUpdateCase({
      secondOpinionSubmitted: true,
      proposedCallSlot: selectedSlot,
      consultant: {
        ...activeCase.consultant,
        proposedSlot: selectedSlot,
      },
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
        <ConsultantOtpChallenge
          activeCase={activeCase}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          onVerifyOtp={handleVerifyOtp}
          tealPrimary={tealPrimary}
          tealSecondary={tealSecondary}
          tealBg={tealBg}
          whatsappGreen={whatsappGreen}
        />
      ) : (
        <>
          <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
            {[
              { id: 'K01_K04' as ScreenStage, label: 'K01 Accept' },
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
                type="button"
                onClick={() => {
                  if ((b.id === 'K05' || b.id === 'K06') && !accepted) {
                    onUpdateCase({
                      metadata: { ...(activeCase.metadata || {}), consultantAccepted: true, acceptedAt: new Date().toISOString() },
                    });
                  }
                  setCurrentScreen(b.id);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${tealSecondary}`,
                  backgroundColor: currentScreen === b.id ? tealPrimary : '#FFFFFF',
                  color: currentScreen === b.id ? '#FFFFFF' : tealPrimary,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {b.label}
              </button>
            ))}
            <span style={{ fontSize: '12px', fontWeight: 700, color: tealPrimary }} data-testid="consultant-sla-timer">
              {accepted ? `48h SLA running: ${consultantSlaFormatted}` : '48h SLA starts on accept'}
            </span>
          </nav>

          {(currentScreen === 'K01_K04' || currentScreen === 'K05') && (
            <ConsultantCaseReviewSection
              currentScreen={currentScreen}
              activeCase={activeCase}
              focusQuestionsEn={focusQuestionsEn}
              tealPrimary={tealPrimary}
              tealSecondary={tealSecondary}
              onAcceptCase={handleAcceptCase}
              onContinueToK06={() => setCurrentScreen('K06')}
            />
          )}

          {currentScreen === 'K06' && (
            <ConsultantWrittenOpinionSection
              focusQuestionsEn={focusQuestionsEn}
              focusAnswers={focusAnswers}
              setFocusAnswers={setFocusAnswers}
              opinionText={opinionText}
              setOpinionText={setOpinionText}
              tealPrimary={tealPrimary}
              tealSecondary={tealSecondary}
              tealBg={tealBg}
              isWritten={isWritten}
              onSaveOpinion={handleSaveOpinion}
            />
          )}

          {(currentScreen === 'K07' || currentScreen === 'K08') && !isWritten && (
            <ConsultantSlotAndCallSection
              currentScreen={currentScreen}
              callSlots={callSlots}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              consultantSlaFormatted={consultantSlaFormatted}
              tealPrimary={tealPrimary}
              tealBg={tealBg}
              whatsappGreen={whatsappGreen}
              onSaveSlots={handleSaveSlots}
              onJoinTeleconsultation={handleJoinTeleconsultation}
            />
          )}

          {currentScreen === 'K09' && (
            <ConsultantFollowUpSection
              relayed={relayed}
              answers={answers}
              setAnswers={setAnswers}
              finalRemarks={finalRemarks}
              setFinalRemarks={setFinalRemarks}
              tealPrimary={tealPrimary}
              tealSecondary={tealSecondary}
              tealBg={tealBg}
              onSubmitFinalRemarks={handleSubmitFinalRemarks}
            />
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

export default ConsultantMobileView;
export { ConsultantMobileView };

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ClinicalCase } from '../../types';
import { useSlaCountdown } from '../../hooks/useSlaCountdown';
import { ConsultantOtpChallenge } from '../consultant/ConsultantOtpChallenge';
import { ConsultantCaseReviewSection } from '../consultant/ConsultantCaseReviewSection';
import { ConsultantWrittenOpinionSection } from '../consultant/ConsultantWrittenOpinionSection';
import { ConsultantSlotAndCallSection } from '../consultant/ConsultantSlotAndCallSection';
import { ConsultantFollowUpSection } from '../consultant/ConsultantFollowUpSection';

interface Props {
  activeCase: ClinicalCase;
  cases?: ClinicalCase[];
  onSelectCase?: (caseId: string) => void;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

type ScreenStage = 'K01_K04' | 'K05' | 'K06' | 'K07' | 'K08' | 'K09';

export const ConsultantMobileView: React.FC<Props> = ({
  activeCase,
  cases = [],
  onSelectCase,
  onAdvanceStage,
  onUpdateCase,
}) => {
  const isWritten = activeCase.consultationType === 'written';
  const isCaseAccepted = Boolean(
    activeCase.metadata?.consultantAccepted ||
    activeCase.secondOpinionSubmitted ||
    (activeCase.stage && activeCase.stage >= 6)
  );

  const isOpinionSubmitted = Boolean(
    activeCase.secondOpinionSubmitted ||
    (activeCase.consultantOpinion && activeCase.consultantOpinion.trim().length > 0) ||
    activeCase.currentStage === 'OPINION_READY' ||
    (activeCase.stage && activeCase.stage >= 6)
  );

  const isFollowUpEnabled = Boolean(
    activeCase.currentStage === 'FOLLOW_UP_21_DAYS' ||
    (activeCase.stage && activeCase.stage >= 8) ||
    activeCase.metadata?.followUpEnabled ||
    ((activeCase.metadata?.relayedQuestions as string[]) &&
      (activeCase.metadata?.relayedQuestions as string[]).length > 0)
  );

  const validCases = useMemo(
    () => cases.filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0)),
    [cases]
  );

  const didAutoFocusConsultantRef = useRef(false);
  useEffect(() => {
    if (!didAutoFocusConsultantRef.current && onSelectCase && validCases.length > 0) {
      if (activeCase.currentStage !== 'WITH_CONSULTANT') {
        const actionable = validCases.find((c) => c.currentStage === 'WITH_CONSULTANT');
        if (actionable) {
          didAutoFocusConsultantRef.current = true;
          onSelectCase(actionable.id);
        }
      }
    }
  }, [validCases, activeCase.currentStage, onSelectCase]);

  const { formatted: consultantSlaFormatted } = useSlaCountdown({
    storageKey: `alo_sla_consultant_${activeCase.id}`,
    initialHours: 47,
    initialMinutes: 58,
    initialSeconds: 30,
    active: isCaseAccepted,
  });

  const isOtpVerified =
    !!activeCase.consultantToken?.otpVerified ||
    !!activeCase.consultantToken?.sessionCookieActive ||
    activeCase.currentStage === 'WITH_CONSULTANT' ||
    isCaseAccepted;

  // Determine initial screen based on workflow progress
  const getInitialScreen = (): ScreenStage => {
    if (!isCaseAccepted) return 'K01_K04';
    if (isFollowUpEnabled) return 'K09';
    if (isOpinionSubmitted) return 'K06';
    return 'K05';
  };

  const [currentScreen, setCurrentScreen] = useState<ScreenStage>(getInitialScreen);
  const [otpCode, setOtpCode] = useState<string>('');
  const [opinionText, setOpinionText] = useState<string>(activeCase.consultantOpinion || '');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [finalRemarks, setFinalRemarks] = useState<string>(activeCase.finalClosureNote || '');
  const relayed = (activeCase.metadata?.relayedQuestions as string[]) || [];
  const [answers, setAnswers] = useState<string[]>(relayed.map(() => ''));

  const baseAr = activeCase.treatingDoctor?.focusQuestions || ['', '', ''];
  const focusQuestionsEn = activeCase.treatingDoctor?.focusQuestionsEn || baseAr;
  const [focusAnswers, setFocusAnswers] = useState<[string, string, string]>(() => {
    if (activeCase.consultantAnswers && activeCase.consultantAnswers.length === 3) {
      return [
        activeCase.consultantAnswers[0] || '',
        activeCase.consultantAnswers[1] || '',
        activeCase.consultantAnswers[2] || '',
      ];
    }
    if (activeCase.metadata?.focusAnswers && (activeCase.metadata.focusAnswers as string[]).length === 3) {
      const fa = activeCase.metadata.focusAnswers as string[];
      return [fa[0] || '', fa[1] || '', fa[2] || ''];
    }
    return [
      'TAVR is clinically indicated given the high surgical risk and anatomical suitability on aortic root CTA.',
      'Recommend dual antiplatelet therapy (DAPT) with Aspirin 81mg and Clopidogrel 75mg for 3-6 months post-procedure.',
      'Perform transthoracic echocardiogram (TTE) at 30 days and 6 months to evaluate prosthetic valve hemodynamics.',
    ];
  });

  // Sync state whenever active case changes
  useEffect(() => {
    setOpinionText(activeCase.consultantOpinion || activeCase.consultant?.opinionEnglish || '');
    if (activeCase.consultantAnswers && activeCase.consultantAnswers.length === 3) {
      setFocusAnswers([
        activeCase.consultantAnswers[0] || '',
        activeCase.consultantAnswers[1] || '',
        activeCase.consultantAnswers[2] || '',
      ]);
    }
    if (!isCaseAccepted) {
      setCurrentScreen('K01_K04');
    } else if (currentScreen === 'K01_K04') {
      setCurrentScreen(isOpinionSubmitted ? 'K06' : 'K05');
    } else if (currentScreen === 'K09' && !isFollowUpEnabled) {
      setCurrentScreen('K06');
    }
  }, [activeCase.id, isCaseAccepted, isOpinionSubmitted, isFollowUpEnabled]);

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
      metadata: {
        ...(activeCase.metadata || {}),
        consultantAccepted: true,
        acceptedAt: new Date().toISOString(),
      },
    });
    setCurrentScreen('K05');
  };

  // 1. Accept Case -> Disable Accept Case button & Move to K05 Review
  const handleAcceptCase = () => {
    onUpdateCase({
      metadata: {
        ...(activeCase.metadata || {}),
        consultantAccepted: true,
        acceptedAt: new Date().toISOString(),
      },
    });
    setCurrentScreen('K05');
  };

  // 2. Submit Written Opinion -> Save & Show Submitted confirmation in K06
  const handleSaveOpinion = () => {
    const cleanOpinion = opinionText.trim();
    const cleanedAnswers: [string, string, string] = [
      focusAnswers[0] || '',
      focusAnswers[1] || '',
      focusAnswers[2] || '',
    ];
    if (cleanOpinion.length < 50 || cleanedAnswers.some((ans) => ans.trim().length < 15)) {
      return;
    }
    onUpdateCase({
      currentStage: isWritten ? 'OPINION_READY' : activeCase.currentStage,
      stage: isWritten ? 6 : activeCase.stage,
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
    if (!isWritten) {
      setCurrentScreen('K07');
    } else {
      setCurrentScreen('K06');
    }
  };

  const handleSaveSlots = () => {
    onUpdateCase({
      currentStage: 'OPINION_READY',
      stage: 6,
      secondOpinionSubmitted: true,
      proposedCallSlot: selectedSlot,
      consultant: {
        ...activeCase.consultant,
        proposedSlot: selectedSlot,
      },
      metadata: {
        ...(activeCase.metadata || {}),
        proposedSlots: [{ id: selectedSlot, time: selectedSlot }],
      },
    });
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

  // Navigation tab definitions: K09 Follow-up is strictly visible ONLY when isFollowUpEnabled is true
  const navButtons = [
    { id: 'K01_K04' as ScreenStage, label: 'K01 Accept' },
    { id: 'K05' as ScreenStage, label: 'K05 Review' },
    { id: 'K06' as ScreenStage, label: 'K06 Opinion' },
    ...(isWritten
      ? []
      : [
          { id: 'K07' as ScreenStage, label: 'K07 Slots' },
          { id: 'K08' as ScreenStage, label: 'K08 Call' },
        ]),
    ...(isFollowUpEnabled ? [{ id: 'K09' as ScreenStage, label: 'K09 Follow-up' }] : []),
  ];

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

      {/* Specialist Cases Switcher (Clean Horizontal Scroll Strip) */}
      {validCases && validCases.length > 1 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            border: '1px solid #D1E3E1',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: tealPrimary }}>
              Assigned Specialist Cases ({validCases.length})
            </span>
            <span style={{ fontSize: '11px', color: '#5F6368' }}>Select dossier to review</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
            {validCases.map((c) => {
              const isSelected = c.id === activeCase.id;
              const isAcceptedThisCase = Boolean(c.metadata?.consultantAccepted);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCase?.(c.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    border: isSelected ? `2px solid ${tealPrimary}` : '1px solid #CBD5E0',
                    backgroundColor: isSelected ? tealPrimary : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#2D3748',
                  }}
                >
                  {c.caseNumber || c.id} · {c.specialtyEn || c.specialty || 'General'}
                  {isAcceptedThisCase && <span style={{ marginLeft: '4px', opacity: 0.8 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
          {/* Main Stage Navigation Bar */}
          <nav
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '16px',
              alignItems: 'center',
            }}
          >
            {navButtons.map((b) => {
              const isLockedBeforeAccept = !isCaseAccepted && b.id !== 'K01_K04';
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    if (isLockedBeforeAccept) {
                      alert('Please accept the case first to start the 48h SLA review.');
                      setCurrentScreen('K01_K04');
                      return;
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
                    cursor: isLockedBeforeAccept ? 'not-allowed' : 'pointer',
                    opacity: isLockedBeforeAccept ? 0.6 : 1,
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.15s ease',
                  }}
                >
                  {b.label}
                  {isLockedBeforeAccept && <span style={{ marginLeft: '4px' }}>🔒</span>}
                </button>
              );
            })}
            <span
              style={{ fontSize: '12px', fontWeight: 700, color: tealPrimary }}
              data-testid="consultant-sla-timer"
            >
              {isCaseAccepted
                ? `48h SLA running: ${consultantSlaFormatted}`
                : '48h SLA starts on accept'}
            </span>
          </nav>

          {/* Screen Content */}
          {(currentScreen === 'K01_K04' || currentScreen === 'K05') && (
            <ConsultantCaseReviewSection
              currentScreen={currentScreen}
              activeCase={activeCase}
              focusQuestionsEn={focusQuestionsEn}
              tealPrimary={tealPrimary}
              tealSecondary={tealSecondary}
              onAcceptCase={handleAcceptCase}
              onContinueToK05={() => setCurrentScreen('K05')}
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
              isOpinionSubmitted={isOpinionSubmitted}
              isFollowUpEnabled={isFollowUpEnabled}
              onSaveOpinion={handleSaveOpinion}
              onGoToFollowUp={() => setCurrentScreen('K09')}
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

          {currentScreen === 'K09' && isFollowUpEnabled && (
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

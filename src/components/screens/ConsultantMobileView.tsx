import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ClinicalCase } from '../../types';
import { useSlaCountdown } from '../../hooks/useSlaCountdown';
import ConsultantPortalHeader from '../consultant/ConsultantPortalHeader';
import ConsultantNavTabs, { ScreenStage } from '../consultant/ConsultantNavTabs';
import { ConsultantOtpChallenge } from '../consultant/ConsultantOtpChallenge';
import { ConsultantCaseReviewSection } from '../consultant/ConsultantCaseReviewSection';
import { ConsultantWrittenOpinionSection } from '../consultant/ConsultantWrittenOpinionSection';
import { ConsultantSlotAndCallSection } from '../consultant/ConsultantSlotAndCallSection';
import { ConsultantCaseClosedSection } from '../consultant/ConsultantCaseClosedSection';
import { BilingualReportModal } from '../cockpit/BilingualReportModal';
import {
  checkCaseAccepted,
  checkOpinionSubmitted,
  checkCaseClosed,
  getInitialConsultantScreen,
  DEFAULT_FOCUS_ANSWERS,
} from '../consultant/consultantLogic';

interface Props {
  activeCase: ClinicalCase;
  cases?: ClinicalCase[];
  onSelectCase?: (caseId: string) => void;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const ConsultantMobileView: React.FC<Props> = ({
  activeCase,
  cases = [],
  onSelectCase,
  onAdvanceStage,
  onUpdateCase,
}) => {
  const isWritten = activeCase.consultationType === 'written';
  const isCaseAccepted = checkCaseAccepted(activeCase);
  const isOpinionSubmitted = checkOpinionSubmitted(activeCase);
  const isCaseClosed = checkCaseClosed(activeCase);

  const validCases = useMemo(
    () => cases.filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0)),
    [cases]
  );

  const didAutoFocusRef = useRef(false);
  useEffect(() => {
    if (!didAutoFocusRef.current && onSelectCase && validCases.length > 0) {
      if (activeCase.currentStage !== 'WITH_CONSULTANT') {
        const actionable = validCases.find((c) => c.currentStage === 'WITH_CONSULTANT');
        if (actionable) {
          didAutoFocusRef.current = true;
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

  const [currentScreen, setCurrentScreen] = useState<ScreenStage>(() =>
    getInitialConsultantScreen(isCaseClosed, isCaseAccepted, isOpinionSubmitted)
  );
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<'pdf1' | 'pdf2'>('pdf2');
  const [otpCode, setOtpCode] = useState('');
  const [opinionText, setOpinionText] = useState(activeCase.consultantOpinion || '');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [finalRemarks, setFinalRemarks] = useState(activeCase.finalClosureNote || '');

  const baseAr = activeCase.treatingDoctor?.focusQuestions || ['', '', ''];
  const focusQuestionsEn = activeCase.treatingDoctor?.focusQuestionsEn || baseAr;

  const [focusAnswers, setFocusAnswers] = useState<[string, string, string]>(() => {
    if (activeCase.consultantAnswers && activeCase.consultantAnswers.length === 3) {
      return [activeCase.consultantAnswers[0] || '', activeCase.consultantAnswers[1] || '', activeCase.consultantAnswers[2] || ''];
    }
    if (activeCase.metadata?.focusAnswers && (activeCase.metadata.focusAnswers as string[]).length === 3) {
      const fa = activeCase.metadata.focusAnswers as string[];
      return [fa[0] || '', fa[1] || '', fa[2] || ''];
    }
    return DEFAULT_FOCUS_ANSWERS;
  });

  useEffect(() => {
    setOpinionText(activeCase.consultantOpinion || activeCase.consultant?.opinionEnglish || '');
    if (activeCase.consultantAnswers && activeCase.consultantAnswers.length === 3) {
      setFocusAnswers([activeCase.consultantAnswers[0] || '', activeCase.consultantAnswers[1] || '', activeCase.consultantAnswers[2] || '']);
    }
    if (isCaseClosed) setCurrentScreen('K10');
    else if (!isCaseAccepted) setCurrentScreen('K01_K04');
    else if (currentScreen === 'K01_K04' || currentScreen === 'K09') setCurrentScreen(isOpinionSubmitted ? 'K06' : 'K05');
  }, [activeCase.id, isCaseAccepted, isOpinionSubmitted, isCaseClosed]);

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
    setCurrentScreen('K05');
  };

  const handleAcceptCase = () => {
    onUpdateCase({
      metadata: { ...(activeCase.metadata || {}), consultantAccepted: true, acceptedAt: new Date().toISOString() },
    });
    setCurrentScreen('K05');
  };

  const handleSaveOpinion = () => {
    const cleanOpinion = opinionText.trim();
    const cleanedAnswers: [string, string, string] = [focusAnswers[0] || '', focusAnswers[1] || '', focusAnswers[2] || ''];
    if (cleanOpinion.length < 50 || cleanedAnswers.some((ans) => ans.trim().length < 15)) return;

    onUpdateCase({
      currentStage: isWritten ? 'OPINION_READY' : activeCase.currentStage,
      stage: isWritten ? 6 : activeCase.stage,
      secondOpinionSubmitted: true,
      consultantOpinion: cleanOpinion,
      consultantAnswers: cleanedAnswers,
      reportReleased: false,
      doctorReleasedToPatient: false,
      consultant: { ...activeCase.consultant, opinionEnglish: cleanOpinion },
      saudiEndorsement: { status: 'pending', requiresLocalLab: false, prescriptionIssued: false, releasedToPatient: false },
      metadata: {
        ...(activeCase.metadata || {}),
        focusAnswers: cleanedAnswers,
        consultantAnswers: cleanedAnswers,
        saudiDoctorApprovedOpinion: false,
        pdf1Released: false,
      },
    });
    setCurrentScreen(isWritten ? 'K06' : 'K07');
  };

  const handleSaveSlots = () => {
    onUpdateCase({
      currentStage: 'OPINION_READY',
      stage: 6,
      secondOpinionSubmitted: true,
      proposedCallSlot: selectedSlot,
      consultant: { ...activeCase.consultant, proposedSlot: selectedSlot },
      metadata: { ...(activeCase.metadata || {}), proposedSlots: [{ id: selectedSlot, time: selectedSlot }] },
    });
  };

  const handleJoinTeleconsultation = () => {
    onAdvanceStage();
    setCurrentScreen('K06');
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
      <ConsultantPortalHeader
        activeCase={activeCase}
        validCases={validCases}
        isCaseClosed={isCaseClosed}
        tealPrimary={tealPrimary}
        onSelectCase={onSelectCase}
      />

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
        <div style={{ marginTop: '16px' }}>
          <ConsultantNavTabs
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            isWritten={isWritten}
            isCaseAccepted={isCaseAccepted}
            isCaseClosed={isCaseClosed}
            tealPrimary={tealPrimary}
          />

          <div style={{ marginTop: '16px' }}>
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
                isFollowUpEnabled={checkCaseAccepted(activeCase)}
                isCaseClosed={isCaseClosed}
                onSaveOpinion={handleSaveOpinion}
                onGoToClosure={() => setCurrentScreen('K10')}
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

            {currentScreen === 'K10' && isCaseClosed && (
              <ConsultantCaseClosedSection
                activeCase={activeCase}
                tealPrimary={tealPrimary}
                tealSecondary={tealSecondary}
                tealBg={tealBg}
                onOpenPDFModal={(type) => {
                  setReportModalType(type);
                  setIsPDFModalOpen(true);
                }}
              />
            )}
          </div>
        </div>
      )}

      <BilingualReportModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        activeCase={activeCase}
        lang="en"
        reportType={reportModalType}
      />
    </div>
  );
};

export default ConsultantMobileView;

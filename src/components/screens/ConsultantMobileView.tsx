import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, WHATSAPP_GREEN } from '../../theme/brandColors';
import { ClinicalCase } from '../../types';
import { useSlaCountdown } from '../../hooks/useSlaCountdown';
import ConsultantPortalHeader from '../consultant/ConsultantPortalHeader';
import ConsultantNavTabs, { ScreenStage } from '../consultant/ConsultantNavTabs';
import { ConsultantOtpChallenge } from '../consultant/ConsultantOtpChallenge';
import { ConsultantCaseReviewSection } from '../consultant/ConsultantCaseReviewSection';
import { ConsultantWrittenOpinionSection } from '../consultant/ConsultantWrittenOpinionSection';
import { ConsultantSlotAndCallSection } from '../consultant/ConsultantSlotAndCallSection';
import { ConsultantCaseClosedSection } from '../consultant/ConsultantCaseClosedSection';
import { BilingualReportModal } from '../reports/BilingualReportModal';
import { CaseMilestoneHUD } from '../common/CaseMilestoneHUD';
import { OpinionTelehealthView } from './OpinionTelehealthView';
import { resolveFocusQuestions } from '../../utils/focusQuestions';
import {
  checkCaseAccepted,
  checkOpinionSubmitted,
  checkCaseClosed,
  getInitialConsultantScreen,
  EMPTY_FOCUS_ANSWERS,
} from '../consultant/consultantLogic';

interface Props {
  activeCase: ClinicalCase;
  cases?: ClinicalCase[];
  onSelectCase?: (caseId: string) => void;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onLogout?: () => void;
}

export const ConsultantMobileView: React.FC<Props> = ({
  activeCase,
  cases = [],
  onSelectCase,
  onAdvanceStage,
  onUpdateCase,
  onLogout: _onLogout,
}) => {
  const hasMagicToken = typeof window !== 'undefined' && Boolean(
    new URLSearchParams(window.location.search).get('token') ||
    new URLSearchParams(window.location.search).get('magic_token')
  );

  const isWritten = activeCase.consultationType === 'written';
  const isCaseAccepted = hasMagicToken || checkCaseAccepted(activeCase);
  const isOpinionSubmitted = checkOpinionSubmitted(activeCase);
  const isCaseClosed = checkCaseClosed(activeCase);

  const validCases = useMemo(
    () => cases.filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0)),
    [cases]
  );

  const didAutoFocusRef = useRef(false);
  useEffect(() => {
    if (hasMagicToken) return; // Retain case targeted by magic link
    if (!didAutoFocusRef.current && onSelectCase && validCases.length > 0) {
      if (activeCase.currentStage !== 'WITH_CONSULTANT') {
        const actionable = validCases.find((c) => c.currentStage === 'WITH_CONSULTANT');
        if (actionable) {
          didAutoFocusRef.current = true;
          onSelectCase(actionable.id);
        }
      }
    }
  }, [validCases, activeCase.currentStage, onSelectCase, hasMagicToken]);

  const { formatted: consultantSlaFormatted } = useSlaCountdown({
    storageKey: `alo_sla_consultant_${activeCase.id}`,
    initialHours: 47,
    initialMinutes: 58,
    initialSeconds: 30,
    active: isCaseAccepted,
  });

  const isOtpVerified =
    hasMagicToken ||
    !!activeCase.consultantToken?.otpVerified ||
    !!activeCase.consultantToken?.sessionCookieActive ||
    activeCase.currentStage === 'WITH_CONSULTANT' ||
    isCaseAccepted;

  const [currentScreen, setCurrentScreen] = useState<ScreenStage>(() => {
    if (hasMagicToken && !isCaseClosed && !isOpinionSubmitted) {
      return 'K06';
    }
    return getInitialConsultantScreen(isCaseClosed, isCaseAccepted, isOpinionSubmitted);
  });
  const [isTelehealthActive, setIsTelehealthActive] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<'pdf1' | 'pdf2'>('pdf2');
  const [otpCode, setOtpCode] = useState('');
  const [opinionText, setOpinionText] = useState(activeCase.consultantOpinion || '');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [finalRemarks, setFinalRemarks] = useState(activeCase.finalClosureNote || '');

  // Same resolver the doctor's screen writes through, so a question present on
  // the case is always present here — in English, or in the doctor's original
  // language when no translation exists. Never a silent blank.
  const focusQuestionsEn = resolveFocusQuestions(activeCase, 'en').questions;

  const [focusAnswers, setFocusAnswers] = useState<[string, string, string]>(() => {
    if (activeCase.consultantAnswers && activeCase.consultantAnswers.length === 3) {
      return [activeCase.consultantAnswers[0] || '', activeCase.consultantAnswers[1] || '', activeCase.consultantAnswers[2] || ''];
    }
    if (activeCase.metadata?.focusAnswers && (activeCase.metadata.focusAnswers as string[]).length === 3) {
      const fa = activeCase.metadata.focusAnswers as string[];
      return [fa[0] || '', fa[1] || '', fa[2] || ''];
    }
    return EMPTY_FOCUS_ANSWERS;
  });

  useEffect(() => {
    setOpinionText(activeCase.consultantOpinion || activeCase.consultant?.opinionEnglish || '');
    if (activeCase.consultantAnswers && activeCase.consultantAnswers.length === 3) {
      setFocusAnswers([activeCase.consultantAnswers[0] || '', activeCase.consultantAnswers[1] || '', activeCase.consultantAnswers[2] || '']);
    }
    if (isCaseClosed) setCurrentScreen('K10');
    else if (hasMagicToken) {
      if (isOpinionSubmitted) setCurrentScreen('K06');
      else setCurrentScreen('K06');
    }
    else if (!isCaseAccepted) setCurrentScreen('K01_K04');
    else if (currentScreen === 'K01_K04' || currentScreen === 'K09') setCurrentScreen(isOpinionSubmitted ? 'K06' : 'K05');
  }, [activeCase.id, isCaseAccepted, isOpinionSubmitted, isCaseClosed, hasMagicToken]);

  const tealPrimary = TEAL_PRIMARY;
  const tealSecondary = TEAL_SECONDARY;
  const tealBg = TEAL_BG;
  const whatsappGreen = WHATSAPP_GREEN;

  const callSlots = [
    { id: 'slot_a', label: 'Slot A: Tomorrow 16:00 AST · 18:30 IST (India)' },
    { id: 'slot_b', label: 'Slot B: Thursday 11:30 AST · 14:00 IST (India)' },
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
      secondOpinionSubmitted: true,
      proposedCallSlot: selectedSlot,
      consultant: { ...activeCase.consultant, proposedSlot: selectedSlot },
      metadata: { ...(activeCase.metadata || {}), proposedSlots: [{ id: selectedSlot, time: selectedSlot }] },
    });
  };

  const handleJoinTeleconsultation = () => {
    setIsTelehealthActive(true);
  };

  if (isTelehealthActive) {
    return (
      <OpinionTelehealthView
        activeCase={activeCase}
        onAdvanceStage={() => {
          onAdvanceStage();
          setIsTelehealthActive(false);
          setCurrentScreen('K06');
        }}
        onUpdateCase={onUpdateCase}
        onBackToTimeline={() => setIsTelehealthActive(false)}
        participantRole="consultant"
        participantName={activeCase.consultant?.name || '—'}
      />
    );
  }

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

      {/* Universal Milestone HUD & Audit Ledger */}
      {validCases.length > 0 && (
        <div style={{ maxWidth: '640px', margin: '0 auto 16px auto' }}>
          <CaseMilestoneHUD activeCase={activeCase} lang="en" isRTL={false} />
        </div>
      )}

      {validCases.length === 0 ? (
        <div style={{ maxWidth: '640px', margin: '20px auto', backgroundColor: '#fff', borderRadius: '16px', padding: '36px 24px', textAlign: 'center', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
            No Cases Pending Specialist Review
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '440px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
            Your international consultant queue is up to date. You will receive an alert once an accredited Saudi treating physician refers a case for cross-border opinion.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#059669' }}>
            <span>●</span> Active Specialist Session · Apollo / KIMS Network
          </div>
        </div>
      ) : !isOtpVerified ? (
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

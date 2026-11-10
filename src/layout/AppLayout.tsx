/**
 * AppLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-responsibility: owns the shell HTML, auth gate, and all overlay UI
 * (TopProfileSwitcher, StageProgressBar, WhatsApp*, modals, cockpit view).
 *
 * Receives full workflow state from useClinicalWorkflowState via App.tsx.
 * The main content slot is passed as `children` (output of ScreenRouter).
 *
 * Keep this file ≤ 250 lines. Overlay logic only — no business state here.
 */

import React from 'react';
import { Persona, ClinicalCase, ClinicalStage } from '../types';
import { PERSONAS }                from '../data/personas';
import { UserSession }             from '../hooks/useClinicalWorkflowState';
import { TopProfileSwitcher }      from '../components/TopProfileSwitcher';
import { StageProgressBar }        from '../components/StageProgressBar';
import { WhatsAppDrawer }          from '../components/WhatsAppDrawer';
import { WhatsAppToast }           from '../components/WhatsAppToast';
import { GuideModal }              from '../components/GuideModal';
import { StageHandoffModal }       from '../components/StageHandoffModal';
import { AutoDemoController }      from '../components/AutoDemoController';
import { PatientPipelineBoard }    from '../components/PatientPipelineBoard';
import { FiveDeviceCockpitView }   from '../components/FiveDeviceCockpitView';
import { NewCaseModal }            from '../components/NewCaseModal';
import UnifiedAuthGate             from '../components/auth/UnifiedAuthGate';

// ─── Props ────────────────────────────────────────────────────────────────────
interface AppLayoutProps {
  children: React.ReactNode;
  // Auth
  userSession: UserSession | null;
  setUserSession: (s: UserSession | null) => void;
  lang: 'ar' | 'en';
  // Persona & case
  activePersona: Persona;
  activeCase: ClinicalCase;
  cases: ClinicalCase[];
  activeCaseId: string;
  setActiveCaseId: (id: string) => void;
  // View
  viewMode: 'workstation' | 'studio';
  patientSubView: 'landing' | 'intake' | 'timeline' | 'telehealth' | 'checkout';
  theme: 'light' | 'dark';
  // UI flags
  isWhatsAppDrawerOpen: boolean;
  setIsWhatsAppDrawerOpen: (v: boolean) => void;
  isGuideOpen: boolean;
  setIsGuideOpen: (v: boolean) => void;
  isPipelineBoardOpen: boolean;
  setIsPipelineBoardOpen: (v: boolean) => void;
  isNewCaseModalOpen: boolean;
  setIsNewCaseModalOpen: (v: boolean) => void;
  isAutoDemoActive: boolean;
  setIsAutoDemoActive: (v: boolean) => void;
  pendingHandoff: { fromStage: ClinicalStage; toStage: ClinicalStage; nextPersona: Persona } | null;
  setPendingHandoff: (v: null) => void;
  // Handlers
  handleSelectPersona: (p: Persona) => void;
  handleAdvanceStage: () => void;
  handleUpdateCase: (u: Partial<ClinicalCase>) => void;
  handleNextCase: () => void;
  handleResetDemo: () => void;
  handleResetActiveCase: () => void;
  handleAddNewCase: (c: ClinicalCase) => void;
  handleAutoFill: () => void;
  handleToggleLang: () => void;
  handleToggleTheme: () => void;
  handleToggleViewMode: () => void;
  handleSetStage: (s: ClinicalStage) => void;
  handleSelectPatientSubView: (v: 'landing' | 'intake' | 'timeline' | 'telehealth') => void;
  handleSelectCaseFromPipeline: (c: ClinicalCase, code: string) => void;
  handleAutoDemoNextStage: () => void;
  handleAutoDemoPrevStage: () => void;
  handleConfirmHandoff: () => void;
  handleLogout: () => void;
  handleStartCaseToCockpit: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  userSession, setUserSession,
  lang,
  activePersona, activeCase, cases, activeCaseId, setActiveCaseId,
  viewMode, patientSubView, theme,
  isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen,
  isGuideOpen, setIsGuideOpen,
  isPipelineBoardOpen, setIsPipelineBoardOpen,
  isNewCaseModalOpen, setIsNewCaseModalOpen,
  isAutoDemoActive, setIsAutoDemoActive,
  pendingHandoff, setPendingHandoff,
  handleSelectPersona, handleAdvanceStage, handleUpdateCase,
  handleNextCase, handleResetDemo, handleResetActiveCase,
  handleAddNewCase, handleAutoFill,
  handleToggleLang, handleToggleTheme, handleToggleViewMode,
  handleSetStage, handleSelectPatientSubView,
  handleSelectCaseFromPipeline,
  handleAutoDemoNextStage, handleAutoDemoPrevStage,
  handleConfirmHandoff, handleLogout, handleStartCaseToCockpit,
}) => {
  const isAr = lang === 'ar';
  const isPureLandingPage = activePersona.code === 'P' && patientSubView === 'landing' && viewMode !== 'studio';
  const isDemoMode = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('demo') === '1' || window.location.hash === '#cockpit');

  // ── Authentication gate ──────────────────────────────────────────────────
  if (!userSession) {
    return (
      <UnifiedAuthGate
        initialLang={lang}
        onAuthenticated={(session) => {
          setUserSession(session);
          if (session.personaId) {
            const personaCodeMap: Record<string, string> = {
              patient: 'P', doctor: 'D', nurse: 'N', admin: 'C', consultant: 'K',
            };
            const targetCode = personaCodeMap[session.personaId] || 'P';
            const matched = PERSONAS.find((p) => p.code === targetCode);
            if (matched) handleSelectPersona(matched);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-alo-canvas dark:bg-alo-darkCanvas text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200 ${isAr ? 'font-cairo' : 'font-sans'}`}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={lang}
    >
      {/* 1. Top Utility Ribbon & Persona Switcher */}
      {!isPureLandingPage && (
        <TopProfileSwitcher
          activePersona={activePersona}
          onSelectPersona={handleSelectPersona}
          activeCase={activeCase}
          onNextCase={handleNextCase}
          onSelectCase={setActiveCaseId}
          cases={cases}
          onAutoFill={handleAutoFill}
          onResetDemo={handleResetDemo}
          onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)}
          onResetCurrentCase={handleResetActiveCase}
          onOpenGuide={() => setIsGuideOpen(true)}
          onStartAutoDemo={() => setIsAutoDemoActive(true)}
          onOpenPipelineBoard={() => setIsPipelineBoardOpen(true)}
          lang={lang}
          onToggleLang={handleToggleLang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          viewMode={viewMode}
          onToggleViewMode={handleToggleViewMode}
          patientSubView={patientSubView}
          onSelectPatientSubView={handleSelectPatientSubView}
          onLogout={handleLogout}
        />
      )}

      {/* Floating Demo Cockpit Badge (?demo=1) */}
      {isPureLandingPage &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('demo') === '1' && (
        <button
          type="button"
          onClick={handleStartCaseToCockpit}
          className="fixed bottom-6 start-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-900 text-teal-300 hover:text-white rounded-full shadow-2xl border border-teal-500/30 backdrop-blur-md text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title={isAr ? 'الانتقال إلى قمرة المحاكاة الخماسية (Demo Cockpit)' : 'Open 5-Role Demo Cockpit'}
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>{isAr ? '📱 قمرة المحاكاة الخماسية' : '📱 5-Role Demo Cockpit'}</span>
        </button>
      )}

      {/* 2. Main Area: Studio Cockpit OR Workstation */}
      {viewMode === 'studio' ? (
        <FiveDeviceCockpitView
          activeCase={activeCase}
          onAdvanceStage={handleAdvanceStage}
          onUpdateCase={handleUpdateCase}
          onResetActiveCase={handleResetActiveCase}
          lang={lang}
          onSwitchToWorkstation={() => handleSelectPatientSubView('landing')}
          onOpenWhatsAppDrawer={() => setIsWhatsAppDrawerOpen(true)}
        />
      ) : (
        <>
          {/* Stage Progress Bar (strictly gated behind ?demo=1) */}
          {isDemoMode && !(activePersona.code === 'P' && patientSubView === 'landing') && (
            <StageProgressBar
              currentStage={activeCase.currentStage}
              onSetStage={handleSetStage}
              lang={lang}
            />
          )}

          {/* Main Clinical Screen */}
          <main className={activePersona.code === 'P' && patientSubView === 'landing' ? 'flex-1 w-full p-0' : 'flex-1 p-4 sm:p-6 lg:p-8'}>
            {children}
          </main>
        </>
      )}

      {/* 3. WhatsApp Toast (hidden on patient home) */}
      {!isPureLandingPage && (
        <WhatsAppToast
          activeCase={activeCase}
          onAdvanceStage={handleAdvanceStage}
          onOpenDrawer={() => setIsWhatsAppDrawerOpen(true)}
          lang={lang}
        />
      )}

      {/* 4. WhatsApp Drawer */}
      <WhatsAppDrawer
        activeCase={activeCase}
        externalOpen={isWhatsAppDrawerOpen}
        onSetExternalOpen={setIsWhatsAppDrawerOpen}
        hideFloatingToggle={isPureLandingPage}
      />

      {/* 5. Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        lang={lang}
        onSelectStage={handleSetStage}
        onSelectPersonaCode={(code) => { const p = PERSONAS.find((x) => x.code === code); if (p) handleSelectPersona(p); }}
      />

      {/* 6. Stage Handoff Modal (disabled via false && guard — kept for future re-enable) */}
      {false && pendingHandoff && (
        <StageHandoffModal
          isOpen={!!pendingHandoff}
          fromStage={(pendingHandoff as any).fromStage}
          toStage={(pendingHandoff as any).toStage}
          nextPersona={(pendingHandoff as any).nextPersona}
          lang={lang}
          onContinue={handleConfirmHandoff}
          onClose={() => setPendingHandoff(null)}
        />
      )}

      {/* 7. Pipeline Board */}
      <PatientPipelineBoard
        isOpen={isPipelineBoardOpen}
        onClose={() => setIsPipelineBoardOpen(false)}
        cases={cases}
        activeCaseId={activeCase.id}
        onSelectCase={handleSelectCaseFromPipeline}
        isAr={lang === 'ar'}
      />

      {/* 8. Auto-Demo Controller */}
      <AutoDemoController
        isActive={isAutoDemoActive}
        currentStage={activeCase.currentStage}
        activePersona={activePersona}
        lang={lang}
        onNextStage={handleAutoDemoNextStage}
        onPrevStage={handleAutoDemoPrevStage}
        onSelectStage={handleSetStage}
        onStop={() => setIsAutoDemoActive(false)}
        activeCaseNumber={activeCase.caseNumber}
      />

      {/* 9. New Case Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        onAddCase={handleAddNewCase}
        existingCount={cases.filter((c) => c.id.startsWith('TEST-')).length}
        lang={lang}
      />
    </div>
  );
};

export default AppLayout;

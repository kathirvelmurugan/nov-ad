/**
 * App.tsx  —  Root Orchestrator
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsibility: wire hook → layout → router. No business logic lives here.
 *
 * Architecture rule (enforced by .gemini/AGENTS.md):
 *   • This file must stay ≤ 150 lines.
 *   • State      → src/hooks/useClinicalWorkflowState.ts
 *   • Routing    → src/router/ScreenRouter.tsx
 *   • Shell/UI   → src/layout/AppLayout.tsx
 */

import React from 'react';
import { useClinicalWorkflowState } from './hooks/useClinicalWorkflowState';
import { AppLayout }                from './layout/AppLayout';
import { ScreenRouter }             from './router/ScreenRouter';

export const App: React.FC = () => {
  const state = useClinicalWorkflowState();

  return (
    <AppLayout
      // Auth
      userSession={state.userSession}
      setUserSession={state.setUserSession}
      lang={state.lang}
      // Persona & case
      activePersona={state.activePersona}
      activeCase={state.activeCase}
      cases={state.cases}
      activeCaseId={state.activeCaseId}
      setActiveCaseId={state.setActiveCaseId}
      // View
      viewMode={state.viewMode}
      patientSubView={state.patientSubView}
      theme={state.theme}
      // UI flags
      isWhatsAppDrawerOpen={state.isWhatsAppDrawerOpen}
      setIsWhatsAppDrawerOpen={state.setIsWhatsAppDrawerOpen}
      isGuideOpen={state.isGuideOpen}
      setIsGuideOpen={state.setIsGuideOpen}
      isPipelineBoardOpen={state.isPipelineBoardOpen}
      setIsPipelineBoardOpen={state.setIsPipelineBoardOpen}
      isNewCaseModalOpen={state.isNewCaseModalOpen}
      setIsNewCaseModalOpen={state.setIsNewCaseModalOpen}
      isAutoDemoActive={state.isAutoDemoActive}
      setIsAutoDemoActive={state.setIsAutoDemoActive}
      pendingHandoff={state.pendingHandoff}
      setPendingHandoff={state.setPendingHandoff}
      // Handlers
      handleSelectPersona={state.handleSelectPersona}
      handleAdvanceStage={state.handleAdvanceStage}
      handleUpdateCase={state.handleUpdateCase}
      handleNextCase={state.handleNextCase}
      handleResetDemo={state.handleResetDemo}
      handleResetActiveCase={state.handleResetActiveCase}
      handleAddNewCase={state.handleAddNewCase}
      handleAutoFill={state.handleAutoFill}
      handleToggleLang={state.handleToggleLang}
      handleToggleTheme={state.handleToggleTheme}
      handleToggleViewMode={state.handleToggleViewMode}
      handleSetStage={state.handleSetStage}
      handleSelectPatientSubView={state.handleSelectPatientSubView}
      handleSelectCaseFromPipeline={state.handleSelectCaseFromPipeline}
      handleAutoDemoNextStage={state.handleAutoDemoNextStage}
      handleAutoDemoPrevStage={state.handleAutoDemoPrevStage}
      handleConfirmHandoff={state.handleConfirmHandoff}
      handleLogout={state.handleLogout}
      handleStartCaseToCockpit={state.handleStartCaseToCockpit}
    >
      <ScreenRouter
        activePersona={state.activePersona}
        activeCase={state.activeCase}
        lang={state.lang}
        patientSubView={state.patientSubView}
        selectedServiceId={state.selectedServiceId}
        setSelectedServiceId={state.setSelectedServiceId}
        setActivePersona={state.setActivePersona}
        setIsWhatsAppDrawerOpen={state.setIsWhatsAppDrawerOpen}
        handleAdvanceStage={state.handleAdvanceStage}
        handleUpdateCase={state.handleUpdateCase}
        handleSelectPersona={state.handleSelectPersona}
        handleSelectPatientSubView={state.handleSelectPatientSubView}
        handleSelectServiceFromLanding={state.handleSelectServiceFromLanding}
        handleResetActiveCase={state.handleResetActiveCase}
        handleToggleLang={state.handleToggleLang}
        handleLogout={state.handleLogout}
      />
    </AppLayout>
  );
};

export default App;

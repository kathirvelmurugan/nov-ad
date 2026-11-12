import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersona } from '../contexts/PersonaContext';
import { useClinicalWorkflowState } from '../hooks/useClinicalWorkflowState';

interface PatientIntakeViewProps {
  onUpdateCase: (updates: Record<string, any>) => void;
  onAdvanceStage: () => void;
}

const PatientIntakeView: React.FC<PatientIntakeViewProps> = ({
  onUpdateCase,
  onAdvanceStage,
}) => {
  const { t, dir, isRTL } = useLanguage();
  const { activePersona } = usePersona();
  const { state } = useClinicalWorkflowState();

  const handleSubmitIntake = useCallback(() => {
    // FIX: Removed redundant onAdvanceStage() call.
    // Previously, calling both onUpdateCase with stage/currentStage AND onAdvanceStage
    // caused a race condition where currentStage advanced to WITH_CONSULTANT while stage remained 2.
    // Now we rely solely on onUpdateCase to atomically set the stage and currentStage.
    onUpdateCase({
      currentStage: 'NURSE_CHECK',
      stage: 2,
      intakeCompletedAt: new Date().toISOString(),
      submittedBy: activePersona?.id || 'PATIENT_DEFAULT',
    });
  }, [onUpdateCase, activePersona]);

  return (
    <ScrollView
      style={[styles.container, { direction: dir }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isRTL ? styles.textRight : styles.textLeft]}>
          {t('patient_intake_title')}
        </Text>
        <Text style={[styles.subtitle, isRTL ? styles.textRight : styles.textLeft]}>
          {t('patient_intake_subtitle')}
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={[styles.sectionTitle, isRTL ? styles.textRight : styles.textLeft]}>
          {t('symptoms_description')}
        </Text>
        
        {/* Form fields would be rendered here */}
        
      </View>

      <Pressable
        onPress={handleSubmitIntake}
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.submitButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('submit_case')}
      >
        <Text style={styles.submitButtonText}>{t('submit_case')}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6FAF7',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 28,
    color: '#007B6E',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    color: '#007B6E',
    opacity: 0.8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#007B6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 18,
    color: '#007B6E',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007B6E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007B6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonPressed: {
    backgroundColor: '#00C6AE',
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  textRight: {
    textAlign: 'right',
  },
  textLeft: {
    textAlign: 'left',
  },
});

export default PatientIntakeView;


import { useState, useCallback, useMemo } from 'react';
import { STAGE_ORDER } from './workflowConstants';

export type ClinicalStage = 
  | 'INTAKE'
  | 'NURSE_CHECK'
  | 'DOCTOR_REVIEW'
  | 'LAB_WORK'
  | 'DIAGNOSIS'
  | 'TREATMENT'
  | 'DISCHARGE';

export type PatientSubView = 'timeline' | 'details' | 'actions' | 'history';

export interface ClinicalWorkflowState {
  currentStage: ClinicalStage;
  stage: number;
  patientSubView: PatientSubView;
  caseData: Record<string, any>;
}

interface UseClinicalWorkflowStateReturn {
  state: ClinicalWorkflowState;
  handleUpdateCase: (updates: Partial<ClinicalWorkflowState> & Record<string, any>) => void;
  advanceStage: () => void;
  resetWorkflow: () => void;
}

const INITIAL_STATE: ClinicalWorkflowState = {
  currentStage: 'INTAKE',
  stage: 1,
  patientSubView: 'details',
  caseData: {},
};

export const useClinicalWorkflowState = (): UseClinicalWorkflowStateReturn => {
  const [state, setState] = useState<ClinicalWorkflowState>(INITIAL_STATE);

  const handleUpdateCase = useCallback((
    updates: Partial<ClinicalWorkflowState> & Record<string, any>
  ) => {
    setState((prev) => {
      const updated = { ...prev, ...updates };

      // Sync stage number if currentStage is provided but stage is not explicitly overridden
      if (updated.currentStage && !Object.prototype.hasOwnProperty.call(updates, 'stage')) {
        const computedIndex = STAGE_ORDER.indexOf(updated.currentStage);
        if (computedIndex !== -1) {
          updated.stage = computedIndex + 1;
        }
      }

      // Switch patientSubView to 'timeline' when a patient submits to NURSE_CHECK
      if (updated.currentStage === 'NURSE_CHECK' && prev.currentStage !== 'NURSE_CHECK') {
        updated.patientSubView = 'timeline';
      }

      // Separate workflow state keys from case data payload
      const { currentStage, stage, patientSubView, ...casePayload } = updated;

      return {
        currentStage,
        stage,
        patientSubView,
        caseData: {
          ...prev.caseData,
          ...casePayload,
        },
      };
    });
  }, []);

  const advanceStage = useCallback(() => {
    setState((prev) => {
      const currentIndex = STAGE_ORDER.indexOf(prev.currentStage);
      if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) {
        return prev;
      }

      const nextStage = STAGE_ORDER[currentIndex + 1] as ClinicalStage;
      
      return {
        ...prev,
        currentStage: nextStage,
        stage: currentIndex + 2,
        // Maintain timeline view for clinical staff stages
        patientSubView: nextStage === 'NURSE_CHECK' ? 'timeline' : prev.patientSubView,
      };
    });
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return useMemo(() => ({
    state,
    handleUpdateCase,
    advanceStage,
    resetWorkflow,
  }), [state, handleUpdateCase, advanceStage, resetWorkflow]);
};
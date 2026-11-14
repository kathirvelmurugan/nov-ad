import { PersonaProfile } from '../types/persona';

export const PINTEREST_TEAL = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
} as const;

export const DEFAULT_CONSULTANT_TEMPLATE = {
  id: 'ref-consultant-pradeep',
  nameEn: 'Dr. Pradeep Kumar',
  nameAr: 'د. براديب كومار',
  specialty: 'Internal Medicine',
  isActiveTemplate: true,
} as const;

export const DEFAULT_TREATING_DOCTOR_TEMPLATE = {
  id: 'ref-doctor-abdullah',
  nameEn: 'Dr. Abdullah Al-Shammari',
  nameAr: 'د. عبدالله الشمري',
  specialty: 'General Practice',
  isActiveTemplate: true,
} as const;

export const PERSONA_PROFILES: Record<string, PersonaProfile> = {
  patient: { id: 'patient', labelEn: 'Patient', labelAr: 'المريض', dir: 'rtl', font: 'Cairo' },
  doctor: { id: 'doctor', labelEn: 'Doctor', labelAr: 'الطبيب', dir: 'rtl', font: 'Cairo' },
  consultant: { id: 'consultant', labelEn: 'Consultant', labelAr: 'الاستشاري', dir: 'rtl', font: 'Cairo' },
  coordinator: { id: 'coordinator', labelEn: 'Coordinator', labelAr: 'المنسق', dir: 'rtl', font: 'Cairo' },
  admin: { id: 'admin', labelEn: 'Admin', labelAr: 'المسؤول', dir: 'rtl', font: 'Cairo' },
  pharmacist: { id: 'pharmacist', labelEn: 'Pharmacist', labelAr: 'الصيدلي', dir: 'rtl', font: 'Cairo' },
  nurse: { id: 'nurse', labelEn: 'Nurse', labelAr: 'الممرض', dir: 'rtl', font: 'Cairo' },
  labTech: { id: 'labTech', labelEn: 'Lab Tech', labelAr: 'فني المختبر', dir: 'rtl', font: 'Cairo' },
  radiologist: { id: 'radiologist', labelEn: 'Radiologist', labelAr: 'أخصائي الأشعة', dir: 'rtl', font: 'Cairo' },
  billing: { id: 'billing', labelEn: 'Billing', labelAr: 'الفواتير', dir: 'rtl', font: 'Cairo' },
  guest: { id: 'guest', labelEn: 'Guest', labelAr: 'زائر', dir: 'ltr', font: 'Cairo' },
};

export const SUPPORTED_PERSONAS = Object.keys(PERSONA_PROFILES) as Array<keyof typeof PERSONA_PROFILES>;
// src/hooks/workflowConstants.ts
// ALO DOCTOR v2.4 Saudi Edition - Production Data Modeling Architecture

export interface DoctorReferenceTemplate {
  readonly id: string;
  readonly nameEn: string;
  readonly nameAr: string;
  readonly role: 'CONSULTANT' | 'TREATING_DOCTOR';
  readonly isTemplateOnly: true;
}

/**
 * Reference templates for UI suggestions and fallback displays.
 * These are NO LONGER automatically pre-filled into new draft cases.
 * They exist strictly as optional reference data for coordinators or system defaults.
 */
export const DEFAULT_CONSULTANT: DoctorReferenceTemplate = {
  id: 'tpl_consultant_001',
  nameEn: 'Dr. Pradeep Kumar',
  nameAr: 'د. براديب كومار',
  role: 'CONSULTANT',
  isTemplateOnly: true,
} as const;

export const DEFAULT_TREATING_DOCTOR: DoctorReferenceTemplate = {
  id: 'tpl_treating_doctor_001',
  nameEn: 'Dr. Abdullah Al-Shammari',
  nameAr: 'د. عبدالله الشمري',
  role: 'TREATING_DOCTOR',
  isTemplateOnly: true,
} as const;

export const REFERENCE_TEMPLATES = {
  consultant: DEFAULT_CONSULTANT,
  treatingDoctor: DEFAULT_TREATING_DOCTOR,
} as const;

export type WorkflowStatus = 'DRAFT' | 'HOSPITAL_SELECTED' | 'DOCTOR_CLAIMED' | 'CONSULTANT_ASSIGNED' | 'ACTIVE' | 'CLOSED';

export const WORKFLOW_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  DRAFT: ['HOSPITAL_SELECTED'],
  HOSPITAL_SELECTED: ['DOCTOR_CLAIMED'],
  DOCTOR_CLAIMED: ['CONSULTANT_ASSIGNED', 'ACTIVE'],
  CONSULTANT_ASSIGNED: ['ACTIVE'],
  ACTIVE: ['CLOSED'],
  CLOSED: [],
};
// src/hooks/useClinicalWorkflowState.ts
// ALO DOCTOR v2.4 Saudi Edition - Production Clinical Workflow State

import { useState, useCallback, useMemo } from 'react';
import { WorkflowStatus } from './workflowConstants';

export interface AssignedDoctor {
  id: string;
  nameEn: string;
  nameAr: string;
  hospitalId?: string;
}

export interface PatientCase {
  caseId: string;
  patientId: string;
  status: WorkflowStatus;
  hospitalId: string | undefined;
  treatingDoctor: AssignedDoctor | undefined;
  consultant: AssignedDoctor | undefined;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface CreateDraftIntakePayload {
  patientId: string;
  initialMetadata?: Record<string, unknown>;
}

export interface UseClinicalWorkflowStateReturn {
  currentCase: PatientCase | null;
  createFreshDraftIntake: (payload: CreateDraftIntakePayload) => PatientCase;
  assignHospital: (hospitalId: string, treatingDoctor?: AssignedDoctor) => void;
  claimReviewByDoctor: (doctor: AssignedDoctor) => void;
  assignConsultant: (consultant: AssignedDoctor) => void;
  updateCaseMetadata: (metadata: Record<string, unknown>) => void;
  resetWorkflow: () => void;
  isTreatingDoctorAssigned: boolean;
  isConsultantAssigned: boolean;
}

const generateCaseId = (): string => {
  return `ALO-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
};

export function useClinicalWorkflowState(): UseClinicalWorkflowStateReturn {
  const [currentCase, setCurrentCase] = useState<PatientCase | null>(null);

  /**
   * Creates a fresh draft intake.
   * Per production requirements, treatingDoctor and consultant MUST start as undefined.
   * No hardcoded defaults are injected here.
   */
  const createFreshDraftIntake = useCallback((payload: CreateDraftIntakePayload): PatientCase => {
    const now = new Date().toISOString();
    
    const freshDraft: PatientCase = {
      caseId: generateCaseId(),
      patientId: payload.patientId,
      status: 'DRAFT',
      hospitalId: undefined,
      treatingDoctor: undefined,
      consultant: undefined,
      createdAt: now,
      updatedAt: now,
      metadata: payload.initialMetadata ?? {},
    };

    setCurrentCase(freshDraft);
    return freshDraft;
  }, []);

  /**
   * Treating doctor is populated when the patient selects their hospital.
   * The hospital selection may optionally provide a default treating doctor for that facility.
   */
  const assignHospital = useCallback((hospitalId: string, treatingDoctor?: AssignedDoctor) => {
    setCurrentCase((prev) => {
      if (!prev) return prev;
      
      return {
        ...prev,
        hospitalId,
        treatingDoctor: treatingDoctor ?? prev.treatingDoctor,
        status: treatingDoctor ? 'DOCTOR_CLAIMED' : 'HOSPITAL_SELECTED',
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  /**
   * Treating doctor is populated when the Saudi doctor claims review.
   * This transitions the workflow state appropriately.
   */
  const claimReviewByDoctor = useCallback((doctor: AssignedDoctor) => {
    setCurrentCase((prev) => {
      if (!prev) return prev;
      if (prev.status !== 'HOSPITAL_SELECTED' && prev.status !== 'DRAFT') return prev;

      return {
        ...prev,
        treatingDoctor: {
          ...doctor,
          hospitalId: doctor.hospitalId ?? prev.hospitalId,
        },
        status: 'DOCTOR_CLAIMED',
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  /**
   * Consultant is populated ONLY when the Coordinator assigns the referral.
   * Decoupled entirely from initial draft creation.
   */
  const assignConsultant = useCallback((consultant: AssignedDoctor) => {
    setCurrentCase((prev) => {
      if (!prev) return prev;
      if (prev.status !== 'DOCTOR_CLAIMED' && prev.status !== 'CONSULTANT_ASSIGNED') return prev;

      return {
        ...prev,
        consultant,
        status: 'CONSULTANT_ASSIGNED',
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateCaseMetadata = useCallback((metadata: Record<string, unknown>) => {
    setCurrentCase((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        metadata: { ...prev.metadata, ...metadata },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const resetWorkflow = useCallback(() => {
    setCurrentCase(null);
  }, []);

  const isTreatingDoctorAssigned = useMemo(() => {
    return currentCase?.treatingDoctor !== undefined;
  }, [currentCase?.treatingDoctor]);

  const isConsultantAssigned = useMemo(() => {
    return currentCase?.consultant !== undefined;
  }, [currentCase?.consultant]);

  return {
    currentCase,
    createFreshDraftIntake,
    assignHospital,
    claimReviewByDoctor,
    assignConsultant,
    updateCaseMetadata,
    resetWorkflow,
    isTreatingDoctorAssigned,
    isConsultantAssigned,
  };
}

export default useClinicalWorkflowState;
// src/components/PersonaSwitcher.tsx
// ALO DOCTOR v2.4 Saudi Edition - 11 Persona Profile Switcher

import React, { useMemo } from 'react';
import { PERSONA_PROFILES, SUPPORTED_PERSONAS, PINTEREST_TEAL } from '../hooks/workflowConstants';

export interface PersonaSwitcherProps {
  activePersonaId: string;
  onPersonaChange: (personaId: string) => void;
  disabled?: boolean;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  activePersonaId,
  onPersonaChange,
  disabled = false,
}) => {
  const activePersona = useMemo(
    () => PERSONA_PROFILES[activePersonaId] || PERSONA_PROFILES.guest,
    [activePersonaId]
  );

  const containerDirection = activePersona.dir === 'rtl' ? 'rtl' : 'ltr';
  const fontFamily = activePersona.font === 'Cairo' ? "'Cairo', sans-serif" : 'system-ui, sans-serif';

  return (
    <div
      dir={containerDirection}
      style={{
        fontFamily,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '16px',
        backgroundColor: PINTEREST_TEAL.background,
        borderRadius: '12px',
        border: `1px solid ${PINTEREST_TEAL.secondary}`,
        direction: containerDirection,
      }}
      role="radiogroup"
      aria-label="Persona Profile Switcher"
    >
      {SUPPORTED_PERSONAS.map((personaKey) => {
        const persona = PERSONA_PROFILES[personaKey];
        const isActive = personaKey === activePersonaId;
        const label = persona.dir === 'rtl' ? persona.labelAr : persona.labelEn;

        return (
          <button
            key={persona.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onPersonaChange(personaKey)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: isActive ? PINTEREST_TEAL.primary : '#FFFFFF',
              color: isActive ? '#FFFFFF' : PINTEREST_TEAL.primary,
              fontWeight: isActive ? 700 : 500,
              fontSize: '14px',
              fontFamily,
              transition: 'all 0.2s ease-in-out',
              boxShadow: isActive ? `0 2px 8px ${PINTEREST_TEAL.primary}40` : '0 1px 3px rgba(0,0,0,0.1)',
              outline: 'none',
              opacity: disabled ? 0.6 : 1,
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 3px ${PINTEREST_TEAL.secondary}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = isActive
                ? `0 2px 8px ${PINTEREST_TEAL.primary}40`
                : '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default PersonaSwitcher;
// src/components/CaseIntakeForm.tsx
// ALO DOCTOR v2.4 Saudi Edition - Clean Accessible Case Intake

import React, { useState } from 'react';
import { useClinicalWorkflowState, AssignedDoctor } from '../hooks/useClinicalWorkflowState';
import { REFERENCE_TEMPLATES, PINTEREST_TEAL } from '../hooks/workflowConstants';
import { PersonaSwitcher } from './PersonaSwitcher';

export const CaseIntakeForm: React.FC = () => {
  const {
    currentCase,
    createFreshDraftIntake,
    assignHospital,
    claimReviewByDoctor,
    assignConsultant,
    isTreatingDoctorAssigned,
    isConsultantAssigned,
  } = useClinicalWorkflowState();

  const [activePersona, setActivePersona] = useState<string>('coordinator');
  const [patientIdInput, setPatientIdInput] = useState<string>('');
  const [hospitalInput, setHospitalInput] = useState<string>('');

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput.trim()) return;
    createFreshDraftIntake({ patientId: patientIdInput.trim() });
  };

  const handleHospitalSelection = () => {
    if (!hospitalInput.trim()) return;
    // Treating doctor remains undefined until explicitly claimed or provided by hospital routing
    assignHospital(hospitalInput.trim());
  };

  const handleDoctorClaim = () => {
    const claimingDoctor: AssignedDoctor = {
      id: 'doc_claimed_' + Date.now(),
      nameEn: 'Dr. Claiming Physician',
      nameAr: 'د. الطبيب المعالج',
      hospitalId: currentCase?.hospitalId,
    };
    claimReviewByDoctor(claimingDoctor);
  };

  const handleConsultantAssignment = () => {
    // Coordinator uses the reference template as a suggestion, but dynamically assigns
    const assignedConsultant: AssignedDoctor = {
      id: REFERENCE_TEMPLATES.consultant.id,
      nameEn: REFERENCE_TEMPLATES.consultant.nameEn,
      nameAr: REFERENCE_TEMPLATES.consultant.nameAr,
    };
    assignConsultant(assignedConsultant);
  };

  const isRtl = activePersona !== 'guest';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Cairo', sans-serif",
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
      }}
    >
      <header style={{ marginBottom: '32px' }}>
        <h1
          style={{
            color: PINTEREST_TEAL.primary,
            fontSize: '28px',
            fontWeight: 800,
            marginBottom: '16px',
          }}
        >
          {isRtl ? 'نظام إدارة الحالات - ألو دكتور' : 'ALO DOCTOR Case Management'}
        </h1>
        <PersonaSwitcher activePersonaId={activePersona} onPersonaChange={setActivePersona} />
      </header>

      <section
        aria-label={isRtl ? 'إنشاء حالة جديدة' : 'Create New Case'}
        style={{
          padding: '24px',
          backgroundColor: PINTEREST_TEAL.background,
          borderRadius: '16px',
          marginBottom: '24px',
          border: `1px solid ${PINTEREST_TEAL.secondary}33`,
        }}
      >
        <h2 style={{ color: PINTEREST_TEAL.primary, fontSize: '20px', marginBottom: '16px' }}>
          {isRtl ? 'بدء استلام مريض جديد' : 'Start New Patient Intake'}
        </h2>

        {!currentCase ? (
          <form onSubmit={handleCreateDraft} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="patientId"
                style={{ display: 'block', marginBottom: '6px', color: '#333', fontWeight: 600 }}
              >
                {isRtl ? 'رقم المريض' : 'Patient ID'}
              </label>
              <input
                id="patientId"
                type="text"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `2px solid ${PINTEREST_TEAL.secondary}`,
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '16px',
                  outline: 'none',
                  direction: isRtl ? 'rtl' : 'ltr',
                }}
                placeholder={isRtl ? 'أدخل رقم المريض...' : 'Enter patient ID...'}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: PINTEREST_TEAL.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              {isRtl ? 'إنشاء مسودة' : 'Create Draft'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: `1px solid ${PINTEREST_TEAL.secondary}44`,
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: '#333' }}>
                {isRtl ? 'رقم الحالة:' : 'Case ID:'}{' '}
                <span style={{ color: PINTEREST_TEAL.primary }}>{currentCase.caseId}</span>
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                {isRtl ? 'الحالة:' : 'Status:'} {currentCase.status}
              </p>
            </div>

            {/* Hospital Selection Step */}
            {!currentCase.hospitalId && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="hospitalId"
                    style={{ display: 'block', marginBottom: '6px', color: '#333', fontWeight: 600 }}
                  >
                    {isRtl ? 'اختيار المستشفى' : 'Select Hospital'}
                  </label>
                  <input
                    id="hospitalId"
                    type="text"
                    value={hospitalInput}
                    onChange={(e) => setHospitalInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${PINTEREST_TEAL.secondary}`,
                      fontFamily: "'Cairo', sans-serif",
                      fontSize: '16px',
                      outline: 'none',
                    }}
                    placeholder={isRtl ? 'معرف المستشفى...' : 'Hospital ID...'}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleHospitalSelection}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: PINTEREST_TEAL.secondary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {isRtl ? 'تأكيد المستشفى' : 'Confirm Hospital'}
                </button>
              </div>
            )}

            {/* Doctor Claim Step */}
            {currentCase.hospitalId && !isTreatingDoctorAssigned && (
              <button
                type="button"
                onClick={handleDoctorClaim}
                style={{
                  padding: '14px 24px',
                  backgroundColor: PINTEREST_TEAL.whatsapp,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '16px',
                }}
              >
                {isRtl ? 'المطالبة بمراجعة الحالة (طبيب معالج)' : 'Claim Review (Treating Doctor)'}
              </button>
            )}

            {/* Consultant Assignment Step */}
            {isTreatingDoctorAssigned && !isConsultantAssigned && activePersona === 'coordinator' && (
              <button
                type="button"
                onClick={handleConsultantAssignment}
                style={{
                  padding: '14px 24px',
                  backgroundColor: PINTEREST_TEAL.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '16px',
                }}
              >
                {isRtl ? 'تعيين استشاري الإحالة' : 'Assign Referral Consultant'}
              </button>
            )}

            {/* Current Assignments Display */}
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: `1px solid #E0E0E0`,
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
                {isRtl ? 'التعيينات الحالية' : 'Current Assignments'}
              </h3>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>{isRtl ? 'الطبيب المعالج:' : 'Treating Doctor:'}</strong>{' '}
                {currentCase.treatingDoctor ? (
                  <span style={{ color: PINTEREST_TEAL.primary }}>
                    {isRtl ? currentCase.treatingDoctor.nameAr : currentCase.treatingDoctor.nameEn}
                  </span>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>
                    {isRtl ? 'غير معين - في انتظار اختيار المستشفى أو المطالبة' : 'Unassigned - Pending hospital selection or claim'}
                  </span>
                )}
              </div>

              <div>
                <strong>{isRtl ? 'الاستشاري:' : 'Consultant:'}</strong>{' '}
                {currentCase.consultant ? (
                  <span style={{ color: PINTEREST_TEAL.primary }}>
                    {isRtl ? currentCase.consultant.nameAr : currentCase.consultant.nameEn}
                  </span>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>
                    {isRtl ? 'غير معين - في انتظار إحالة المنسق' : 'Unassigned - Pending coordinator referral'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <footer
        style={{
          textAlign: 'center',
          padding: '16px',
          color: '#888',
          fontSize: '12px',
          borderTop: `1px solid ${PINTEREST_TEAL.background}`,
        }}
      >
        ALO DOCTOR v2.4 Saudi Edition • Production Clinical Workflow Engine
      </footer>
    </div>
  );
};

export default CaseIntakeForm;
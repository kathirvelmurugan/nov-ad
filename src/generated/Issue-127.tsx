import { useState, useEffect, useCallback } from 'react';

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  formattedTimeAr: string;
  formattedTimeEn: string;
  actionCode: string;
  stage: string;
  actorRole: string;
  actorName: string;
  actorRoleTitleAr: string;
  actorRoleTitleEn: string;
  actionSummaryAr: string;
  actionSummaryEn: string;
  isMilestone: boolean;
}

export interface ClinicalCase {
  id: string;
  patientName: string;
  currentStage: string;
  timeline: TimelineEvent[];
  personaId?: string;
  [key: string]: any;
}

interface ApiClient {
  saveCase: (caseData: ClinicalCase) => Promise<ClinicalCase>;
}

const apiClient: ApiClient = {
  saveCase: async (caseData: ClinicalCase): Promise<ClinicalCase> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...caseData, serverConfirmed: true } as any), 300);
    });
  },
};

const generateAstTimestamp = () => {
  const now = new Date();
  const astTime = new Date(now.getTime() + (3 * 3600000) + (now.getTimezoneOffset() * 60000));
  const hours = astTime.getHours();
  const minutes = astTime.getMinutes().toString().padStart(2, '0');
  const periodEn = hours >= 12 ? 'PM' : 'AM';
  const periodAr = hours >= 12 ? 'م' : 'ص';
  const displayH = hours % 12 || 12;
  return {
    iso: now.toISOString(),
    timeAr: `${displayH.toString().padStart(2, '0')}:${minutes} ${periodAr} بتوقيت مكة`,
    timeEn: `${displayH.toString().padStart(2, '0')}:${minutes} ${periodEn} AST`,
  };
};

const MILESTONE_MAP: Record<string, Omit<TimelineEvent, 'id' | 'caseId' | 'timestamp' | 'formattedTimeAr' | 'formattedTimeEn'>> = {
  NURSE_CHECK: {
    actionCode: 'M02',
    stage: 'NURSE_CHECK',
    actorRole: 'N',
    actorName: 'Adrian Lewis',
    actorRoleTitleAr: 'الممرض',
    actorRoleTitleEn: 'Nurse',
    actionSummaryAr: 'تم إكمال الفحص التمريضي الأولي',
    actionSummaryEn: 'Initial nursing triage and vitals check completed',
    isMilestone: true,
  },
  DOCTOR_REVIEW: {
    actionCode: 'M03',
    stage: 'DOCTOR_REVIEW',
    actorRole: 'D',
    actorName: 'Emmanuel Arcon Gonzalez',
    actorRoleTitleAr: 'الطبيب',
    actorRoleTitleEn: 'Doctor',
    actionSummaryAr: 'بدأ الطبيب بمراجعة الحالة السريرية',
    actionSummaryEn: 'Physician initiated clinical review of the case',
    isMilestone: true,
  },
  AWAITING_PAYMENT: {
    actionCode: 'M04',
    stage: 'AWAITING_PAYMENT',
    actorRole: 'A',
    actorName: 'David Nunez',
    actorRoleTitleAr: 'الإدارة',
    actorRoleTitleEn: 'Admin',
    actionSummaryAr: 'في انتظار الدفع أو تحويل الاستشارة',
    actionSummaryEn: 'Awaiting payment processing or consultant referral',
    isMilestone: true,
  },
  WITH_CONSULTANT: {
    actionCode: 'M04',
    stage: 'WITH_CONSULTANT',
    actorRole: 'C',
    actorName: 'Marcus Vance',
    actorRoleTitleAr: 'الاستشاري',
    actorRoleTitleEn: 'Consultant',
    actionSummaryAr: 'تمت الإحالة إلى الاستشاري المختص',
    actionSummaryEn: 'Escalated to specialist consultant for advanced review',
    isMilestone: true,
  },
  OPINION_READY: {
    actionCode: 'M05',
    stage: 'OPINION_READY',
    actorRole: 'S',
    actorName: 'V. Prasanth',
    actorRoleTitleAr: 'النظام',
    actorRoleTitleEn: 'System',
    actionSummaryAr: 'الرأي الطبي جاهز وتم إغلاق الحالة',
    actionSummaryEn: 'Medical opinion finalized and case closed successfully',
    isMilestone: true,
  },
  CLOSED: {
    actionCode: 'M05',
    stage: 'CLOSED',
    actorRole: 'S',
    actorName: 'V. Prasanth',
    actorRoleTitleAr: 'النظام',
    actorRoleTitleEn: 'System',
    actionSummaryAr: 'تم إغلاق الحالة نهائياً في النظام',
    actionSummaryEn: 'Case permanently closed in the ALO DOCTOR system',
    isMilestone: true,
  },
};

export function useClinicalWorkflowState() {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('alo_active_case_id');
    if (storedId) {
      setActiveCaseId(storedId);
    }
  }, []);

  const activeCase = cases.find((c) => c.id === activeCaseId) || null;

  const handleRegisterCase = useCallback((payload: Partial<ClinicalCase>) => {
    const freshId = payload.id || `case-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const nameToSet = payload.patientName;
    const timeInfo = generateAstTimestamp();

    const registeredCase: ClinicalCase = {
      id: freshId,
      patientName: nameToSet || 'Sami Al-Harbi (سامي الحربي)',
      currentStage: 'INTAKE_RECEIVED',
      timeline: [
        {
          id: `evt-${Date.now()}-m01`,
          caseId: freshId,
          timestamp: timeInfo.iso,
          formattedTimeAr: timeInfo.timeAr,
          formattedTimeEn: timeInfo.timeEn,
          actionCode: 'M01',
          stage: 'INTAKE_RECEIVED',
          actorRole: 'P',
          actorName: nameToSet || 'Sami Al-Harbi (سامي الحربي)',
          actorRoleTitleAr: 'المريض',
          actorRoleTitleEn: 'Patient',
          actionSummaryAr: 'تم تسجيل الحالة وتوثيق موافقة الخصوصية',
          actionSummaryEn: 'Case intake registered with MOH verified consent',
          isMilestone: true,
        },
      ],
      ...payload,
      id: freshId,
    };

    setCases((prev) => [...prev, registeredCase]);
    setActiveCaseId(freshId);
    localStorage.setItem('alo_active_case_id', freshId);

    apiClient.saveCase(registeredCase).then((serverCase) => {
      setCases((prev) => prev.map((c) => (c.id === freshId ? { ...c, ...serverCase } : c)));
    });

    return registeredCase;
  }, []);

  const onUpdateCase = useCallback((targetId: string, updates: Partial<ClinicalCase>) => {
    let updatedCaseRef: ClinicalCase | null = null;

    setCases((prev) => {
      return prev.map((existingCase) => {
        if (existingCase.id !== targetId) return existingCase;

        const nextStage = updates.currentStage || existingCase.currentStage;
        const milestoneDef = nextStage ? MILESTONE_MAP[nextStage] : null;
        const nextTimeline = [...existingCase.timeline];

        if (milestoneDef) {
          const alreadyExists = nextTimeline.some((evt) => evt.actionCode === milestoneDef.actionCode && evt.stage === milestoneDef.stage);

          if (!alreadyExists) {
            const timeInfo = generateAstTimestamp();
            const newEvent: TimelineEvent = {
              id: `evt-${Date.now()}-${milestoneDef.actionCode.toLowerCase()}`,
              caseId: targetId,
              timestamp: timeInfo.iso,
              formattedTimeAr: timeInfo.timeAr,
              formattedTimeEn: timeInfo.timeEn,
              ...milestoneDef,
            };
            nextTimeline.push(newEvent);
          }
        }

        const mergedCase: ClinicalCase = {
          ...existingCase,
          ...updates,
          timeline: nextTimeline,
          currentStage: nextStage,
        };

        updatedCaseRef = mergedCase;
        return mergedCase;
      });
    });

    setActiveCaseId(targetId);
    localStorage.setItem('alo_active_case_id', targetId);

    const executeServerSync = () => {
      if (updatedCaseRef) {
        apiClient.saveCase(updatedCaseRef).then((serverCase) => {
          setCases((prev) => prev.map((c) => (c.id === targetId ? { ...c, ...serverCase } : c)));
        });
      }
    };

    setTimeout(executeServerSync, 0);

    return updatedCaseRef;
  }, []);

  return {
    cases,
    activeCase,
    activeCaseId,
    handleRegisterCase,
    onUpdateCase,
    setActiveCaseId: (id: string) => {
      setActiveCaseId(id);
      localStorage.setItem('alo_active_case_id', id);
    },
  };
}

export default useClinicalWorkflowState;
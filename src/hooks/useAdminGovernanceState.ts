import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import {
  TenantHospital,
  StaffAccountRecord,
  AuditLogEntry,
  RoleCode,
  Persona,
  AdminCatalogsState,
  ImpersonationSession,
} from '../types';
import { SEEDED_TENANT_HOSPITALS, SEEDED_STAFF_DIRECTORY } from '../data/platformSeed';
import { PERSONAS } from '../data/personas';
import {
  TENANTS_KEY,
  PLATFORM_USERS_KEY,
  CATALOGS_KEY,
  AUDIT_LOGS_KEY,
} from './workflowConstants';

const IMPERSONATION_KEY = 'alo_impersonation_session_v3.0';

export const DEFAULT_ADMIN_CATALOGS: AdminCatalogsState = {
  specialties: [
    'أمراض وجراحة القلب (Cardiology & CTVS)',
    'جراحة المخ والأعصاب (Neurosurgery)',
    'طب وأورام الأطفال (Pediatric Oncology)',
    'جراحة العظام والمفاصل (Orthopedics)',
    'أمراض الدم والأورام (Hematology & Oncology)',
  ],
  labTests: [
    'تروبونين عالي الحساسية (hs-cTnI)',
    'فحص الدهون الشامل (Lipid Profile)',
    'وظائف كلى وأملاح (Renal Function Panel)',
    'تخطيط كهربية القلب (12-Lead ECG)',
    'فحص السكر التراكمي (HbA1c)',
  ],
  medications: [
    'Lipitor 40mg (Atorvastatin)',
    'Plavix 75mg (Clopidogrel)',
    'Concor 5mg (Bisoprolol)',
    'Aspirin Protect 81mg',
    'Crestor 20mg (Rosuvastatin)',
  ],
};

export function useAdminGovernanceState(
  activePersona?: Persona,
  onSelectPersona?: (p: Persona) => void
) {
  // 1. Tenants State
  const [tenants, setTenants] = useState<TenantHospital[]>(() => {
    try {
      const saved = localStorage.getItem(TENANTS_KEY);
      return saved ? JSON.parse(saved) : SEEDED_TENANT_HOSPITALS;
    } catch {
      return SEEDED_TENANT_HOSPITALS;
    }
  });

  // 2. Staff Directory State
  const [staffDirectory, setStaffDirectory] = useState<StaffAccountRecord[]>(() => {
    try {
      const saved = localStorage.getItem(PLATFORM_USERS_KEY);
      return saved ? JSON.parse(saved) : SEEDED_STAFF_DIRECTORY;
    } catch {
      return SEEDED_STAFF_DIRECTORY;
    }
  });

  // 3. Catalogs State
  const [catalogs, setCatalogs] = useState<AdminCatalogsState>(() => {
    try {
      const saved = localStorage.getItem(CATALOGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ADMIN_CATALOGS;
    } catch {
      return DEFAULT_ADMIN_CATALOGS;
    }
  });

  // 4. Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(AUDIT_LOGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Impersonation (Act-As) Session State
  const [impersonationSession, setImpersonationSession] = useState<ImpersonationSession | null>(() => {
    try {
      const saved = localStorage.getItem(IMPERSONATION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Cross-component sync for Act-As
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(IMPERSONATION_KEY);
        setImpersonationSession(saved ? JSON.parse(saved) : null);
      } catch {
        setImpersonationSession(null);
      }
    };
    window.addEventListener('alo_act_as_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('alo_act_as_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
    } catch {}
  }, [tenants]);

  useEffect(() => {
    try {
      localStorage.setItem(PLATFORM_USERS_KEY, JSON.stringify(staffDirectory));
    } catch {}
  }, [staffDirectory]);

  useEffect(() => {
    try {
      localStorage.setItem(CATALOGS_KEY, JSON.stringify(catalogs));
    } catch {}
  }, [catalogs]);

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      if (impersonationSession) {
        localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(impersonationSession));
      } else {
        localStorage.removeItem(IMPERSONATION_KEY);
      }
    } catch {}
  }, [impersonationSession]);

  // Initial backend fetch on mount
  useEffect(() => {
    apiClient.fetchTenants().then((fetched) => {
      if (Array.isArray(fetched) && fetched.length > 0) setTenants(fetched);
    });
    apiClient.fetchUsers().then((fetched) => {
      if (Array.isArray(fetched) && fetched.length > 0) setStaffDirectory(fetched);
    });
    apiClient.fetchAuditLogs().then((fetched) => {
      if (Array.isArray(fetched) && fetched.length > 0) setAuditLogs(fetched);
    });
  }, []);

  // Logging Helper
  const appendAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    apiClient.appendAuditLog(newLog);
  }, []);

  // Tenant Actions
  const createTenant = useCallback(
    (data: Omit<TenantHospital, 'id' | 'createdAt'>) => {
      const newTenant: TenantHospital = {
        ...data,
        id: `hosp-${data.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
      };
      setTenants((prev) => [newTenant, ...prev]);
      apiClient.createTenant(newTenant);
      appendAuditLog({
        actorName: activePersona?.name || 'Super Admin',
        actorRole: activePersona?.code || 'AD',
        actionType: 'CREATE_TENANT',
        target: newTenant.id,
        details: `Created new hospital tenant ${newTenant.nameEn} in ${newTenant.city}`,
      });
      return newTenant;
    },
    [activePersona, appendAuditLog]
  );

  const toggleTenantStatus = useCallback(
    (id: string) => {
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' } : t))
      );
      appendAuditLog({
        actorName: activePersona?.name || 'Super Admin',
        actorRole: activePersona?.code || 'AD',
        hospitalId: id,
        actionType: 'TOGGLE_TENANT_STATUS',
        target: id,
        details: `Toggled active status for hospital tenant ${id}`,
      });
    },
    [activePersona, appendAuditLog]
  );

  // Staff Actions
  const createStaffMember = useCallback(
    (data: Omit<StaffAccountRecord, 'id' | 'createdAt'>) => {
      const newStaff: StaffAccountRecord = {
        ...data,
        id: `staff-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
      };
      setStaffDirectory((prev) => [newStaff, ...prev]);
      apiClient.createUser(newStaff);
      appendAuditLog({
        actorName: activePersona?.name || 'Admin',
        actorRole: activePersona?.code || 'AD',
        hospitalId: data.hospitalId,
        actionType: 'CREATE_STAFF_RECORD',
        target: newStaff.staffCode,
        details: `Enrolled staff ${newStaff.fullName} (${newStaff.roleCode})`,
      });
      return newStaff;
    },
    [activePersona, appendAuditLog]
  );

  const toggleStaffActive = useCallback(
    (id: string) => {
      setStaffDirectory((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
      );
      appendAuditLog({
        actorName: activePersona?.name || 'Admin',
        actorRole: activePersona?.code || 'AD',
        actionType: 'TOGGLE_STAFF_STATUS',
        target: id,
        details: `Toggled active status for staff member ${id}`,
      });
    },
    [activePersona, appendAuditLog]
  );

  // Catalog Actions
  const addSpecialty = useCallback((spec: string) => {
    setCatalogs((prev) => ({
      ...prev,
      specialties: [...prev.specialties, spec],
    }));
  }, []);

  const removeSpecialty = useCallback((spec: string) => {
    setCatalogs((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== spec),
    }));
  }, []);

  const addLabTest = useCallback((test: string) => {
    setCatalogs((prev) => ({
      ...prev,
      labTests: [...prev.labTests, test],
    }));
  }, []);

  const removeLabTest = useCallback((test: string) => {
    setCatalogs((prev) => ({
      ...prev,
      labTests: prev.labTests.filter((t) => t !== test),
    }));
  }, []);

  const addMedication = useCallback((med: string) => {
    setCatalogs((prev) => ({
      ...prev,
      medications: [...prev.medications, med],
    }));
  }, []);

  const removeMedication = useCallback((med: string) => {
    setCatalogs((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m !== med),
    }));
  }, []);

  // Act-As Impersonation Preview
  const startActAs = useCallback(
    (roleCode: RoleCode, overridePersonaOrHospitalId?: Persona | string, maybeHospitalId?: string) => {
      const origPersona =
        typeof overridePersonaOrHospitalId === 'object' && overridePersonaOrHospitalId
          ? overridePersonaOrHospitalId
          : activePersona || PERSONAS[0];

      const hospId =
        typeof overridePersonaOrHospitalId === 'string'
          ? overridePersonaOrHospitalId
          : maybeHospitalId || origPersona.hospitalId;

      const targetPersona = PERSONAS.find((p) => p.code === roleCode) || PERSONAS[0];
      const customizedTarget: Persona = {
        ...targetPersona,
        hospitalId: hospId || targetPersona.hospitalId,
      };

      const session: ImpersonationSession = {
        originalPersona: origPersona,
        originalHospitalId: origPersona.hospitalId,
        actingAs: customizedTarget,
        actingHospitalId: hospId || targetPersona.hospitalId,
      };

      try {
        localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(session));
      } catch {}

      setImpersonationSession(session);
      window.dispatchEvent(new CustomEvent('alo_act_as_changed', { detail: session }));

      if (onSelectPersona) {
        onSelectPersona(customizedTarget);
      }

      appendAuditLog({
        actorName: origPersona.name,
        actorRole: origPersona.code,
        hospitalId: hospId || origPersona.hospitalId,
        actionType: 'ACT_AS_ROLE_PREVIEW',
        target: roleCode,
        details: `Started preview session as ${roleCode} (${hospId || 'Global'})`,
      });
    },
    [activePersona, onSelectPersona, appendAuditLog]
  );

  const stopActAs = useCallback(() => {
    if (impersonationSession) {
      if (onSelectPersona) {
        onSelectPersona(impersonationSession.originalPersona);
      }
      appendAuditLog({
        actorName: impersonationSession.originalPersona.name,
        actorRole: impersonationSession.originalPersona.code,
        actionType: 'EXIT_ACT_AS_PREVIEW',
        target: impersonationSession.actingAs.code,
        details: `Exited preview session back to ${impersonationSession.originalPersona.code}`,
      });
      const previousSession = impersonationSession;
      try {
        localStorage.removeItem(IMPERSONATION_KEY);
      } catch {}
      setImpersonationSession(null);
      window.dispatchEvent(new CustomEvent('alo_act_as_changed', { detail: null }));
      return previousSession;
    }
    return null;
  }, [impersonationSession, onSelectPersona, appendAuditLog]);

  return {
    tenants,
    createTenant,
    toggleTenantStatus,
    staffDirectory,
    createStaffMember,
    toggleStaffActive,
    catalogs,
    addSpecialty,
    removeSpecialty,
    addLabTest,
    removeLabTest,
    addMedication,
    removeMedication,
    auditLogs,
    impersonationSession,
    startActAs,
    stopActAs,
  };
}

export default useAdminGovernanceState;

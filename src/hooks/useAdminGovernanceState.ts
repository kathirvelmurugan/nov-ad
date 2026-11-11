import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import {
  TenantHospital,
  StaffAccountRecord,
  AuditLogEntry,
  RoleCode,
  Persona,
  AdminCatalogsState,
} from '../types';
import { DEFAULT_TENANT_HOSPITALS, DEFAULT_STAFF_DIRECTORY } from '../data/accreditedStaffAndTenants';
import { PERSONAS } from '../data/personas';
import {
  TENANTS_KEY,
  PLATFORM_USERS_KEY,
  CATALOGS_KEY,
  AUDIT_LOGS_KEY,
} from './workflowConstants';

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_TENANT_HOSPITALS;
  });

  // 2. Staff Directory State
  const [staffDirectory, setStaffDirectory] = useState<StaffAccountRecord[]>(() => {
    try {
      const saved = localStorage.getItem(PLATFORM_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_STAFF_DIRECTORY;
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

  // Initial backend fetch on mount & legacy cache auto-eviction
  useEffect(() => {
    try {
      [
        'alo_platform_users_v3.0',
        'alo_tenants_v3.0',
        'alo_cases_v3.0',
        'alo_platform_users_v2.0',
        'alo_tenants_v2.0',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {}

    apiClient.fetchTenants().then((fetched) => {
      if (Array.isArray(fetched)) setTenants(fetched);
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
  };
}

export default useAdminGovernanceState;

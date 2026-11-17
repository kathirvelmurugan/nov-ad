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
import { PERSONAS } from '../data/personas';
import { getPlatformConfig } from '../config/platformConfig';

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
  // 1. Tenants State — Postgres is the only source; no localStorage cache.
  const [tenants, setTenants] = useState<TenantHospital[]>([]);

  // 2. Staff Directory State — Postgres is the only source.
  const [staffDirectory, setStaffDirectory] = useState<StaffAccountRecord[]>([]);

  // 3. Catalogs State — read from platform config defaults (no localStorage cache)
  const [catalogs, setCatalogs] = useState<AdminCatalogsState>(() => {
    const cfg = getPlatformConfig();
    return cfg?.catalogs ? (cfg.catalogs as AdminCatalogsState) : DEFAULT_ADMIN_CATALOGS;
  });

  // 4. Audit Logs State — Postgres is the only source.
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Initial backend fetch on mount & legacy cache auto-eviction
  useEffect(() => {
    try {
      [
        'alo_platform_users_v3.0',
        'alo_tenants_v3.0',
        'alo_cases_v3.0',
        'alo_platform_users_v2.0',
        'alo_tenants_v2.0',
        // v4 caches are no longer read anywhere: a stale copy must never
        // resurface a tenant/staff/audit row that Postgres deleted.
        'alo_platform_users_v4.0_clean',
        'alo_tenants_v4.0_clean',
        'alo_audit_logs_v4.0_clean',
        'alo_user_pins_v4.0_clean',
        'alo_consultant_session_v4.0_clean',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {}

    apiClient.fetchTenants().then(setTenants).catch(() => {});
    apiClient.fetchUsers().then(setStaffDirectory).catch(() => {});
    apiClient.fetchAuditLogs().then(setAuditLogs).catch(() => {});
  }, []);

  // Logging Helper
  const appendAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    // Server assigns id/timestamp/actor; the local row is only an optimistic echo.
    setAuditLogs((prev) => [
      { ...entry, id: `log-${Date.now()}`, timestamp: new Date().toISOString() } as AuditLogEntry,
      ...prev.slice(0, 99),
    ]);
    apiClient.appendAuditLog(entry as AuditLogEntry).catch(() => {});
  }, []);

  // Tenant Actions
  const createTenant = useCallback(
    async (data: Omit<TenantHospital, 'id' | 'createdAt'>) => {
      // The row must exist in Postgres before it appears in the UI.
      const created = await apiClient.createTenant(data);
      setTenants((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
      appendAuditLog({
        actorName: activePersona?.name || 'Super Admin',
        actorRole: activePersona?.code || 'AD',
        actionType: 'CREATE_TENANT',
        target: created.id,
        details: `Created new hospital tenant ${created.nameEn} in ${created.city}`,
      });
      return created;
    },
    [activePersona, appendAuditLog]
  );

  const toggleTenantStatus = useCallback(
    async (id: string) => {
      const current = tenants.find((t) => t.id === id);
      if (!current) return;
      const nextStatus = current.status === 'active' ? 'suspended' : 'active';
      await apiClient.updateTenantStatus(id, nextStatus);
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
      );
      appendAuditLog({
        actorName: activePersona?.name || 'Super Admin',
        actorRole: activePersona?.code || 'AD',
        hospitalId: id,
        actionType: 'TOGGLE_TENANT_STATUS',
        target: id,
        details: `Set hospital tenant ${id} to ${nextStatus}`,
      });
    },
    [activePersona, appendAuditLog, tenants]
  );

  // Staff Actions
  const createStaffMember = useCallback(
    async (data: Omit<StaffAccountRecord, 'id' | 'createdAt'>) => {
      const optimisticId = `staff-${Date.now().toString().slice(-6)}`;
      const newStaff: StaffAccountRecord = {
        ...data,
        id: optimisticId,
        createdAt: new Date().toISOString(),
      };
      setStaffDirectory((prev) => [newStaff, ...prev]);

      try {
        // Persist first: an account that only exists in localStorage can never be
        // routed by the auth gate (role_code is resolved from Postgres at login).
        const saved: any = await apiClient.createUser(data);
        const persisted: StaffAccountRecord = {
          ...newStaff,
          ...saved,
          id: saved?.id || optimisticId,
          roleCode: (saved?.roleCode || newStaff.roleCode) as RoleCode,
          status: newStaff.status,
        };
        setStaffDirectory((prev) => prev.map((s) => (s.id === optimisticId ? persisted : s)));
        appendAuditLog({
          actorName: activePersona?.name || 'Admin',
          actorRole: activePersona?.code || 'AD',
          hospitalId: data.hospitalId,
          actionType: 'CREATE_STAFF_RECORD',
          target: newStaff.staffCode,
          details: `Enrolled staff ${newStaff.fullName} (${newStaff.roleCode})`,
        });
        return persisted;
      } catch (err) {
        // Roll the optimistic row back — the account was NOT created.
        setStaffDirectory((prev) => prev.filter((s) => s.id !== optimisticId));
        appendAuditLog({
          actorName: activePersona?.name || 'Admin',
          actorRole: activePersona?.code || 'AD',
          hospitalId: data.hospitalId,
          actionType: 'CREATE_STAFF_FAILED',
          target: newStaff.staffCode,
          details: `Failed to persist staff ${newStaff.fullName} (${newStaff.roleCode}); account not created`,
        });
        throw err;
      }
    },
    [activePersona, appendAuditLog]
  );

  const toggleStaffActive = useCallback(
    async (id: string) => {
      const current = staffDirectory.find((s) => s.id === id);
      if (!current) return;
      const nextStatus = current.status === 'active' ? 'inactive' : 'active';
      setStaffDirectory((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
      );
      try {
        // Persist first: login filters on platform_users.status, so a status that
        // only lives in localStorage leaves the account able to sign in.
        await apiClient.updateUserStatus(id, nextStatus);
        appendAuditLog({
          actorName: activePersona?.name || 'Admin',
          actorRole: activePersona?.code || 'AD',
          actionType: 'TOGGLE_STAFF_STATUS',
          target: id,
          details: `Staff member ${id} set to ${nextStatus} (persisted)`,
        });
      } catch (err) {
        // The account was NOT updated: put the row back to its database state.
        setStaffDirectory((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: current.status } : s))
        );
        appendAuditLog({
          actorName: activePersona?.name || 'Admin',
          actorRole: activePersona?.code || 'AD',
          actionType: 'TOGGLE_STAFF_STATUS_FAILED',
          target: id,
          details: `Failed to persist status change for staff member ${id}; UI reverted`,
        });
        throw err;
      }
    },
    [activePersona, appendAuditLog, staffDirectory]
  );

  // PIN recovery: enrollment mints a PIN and shows it once. If it is lost, this
  // issues a new one. No endpoint ever reads a PIN back out of the database.
  const resetStaffPin = useCallback(
    async (staffId: string) => {
      const issued = await apiClient.resetUserPin(staffId);
      appendAuditLog({
        actorName: activePersona?.name || 'Admin',
        actorRole: activePersona?.code || 'AD',
        actionType: 'RESET_STAFF_PIN',
        target: staffId,
        details: `Issued a new PIN for staff account ${staffId}`,
      });
      return issued;
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
    resetStaffPin,
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

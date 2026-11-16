import { TenantHospital, StaffAccountRecord, ClinicalCase, AuditLogEntry } from '../types';
import { TENANTS_KEY, PLATFORM_USERS_KEY, STORAGE_KEY, ACTIVE_CASE_KEY } from '../hooks/workflowConstants';
import { DEFAULT_TENANT_HOSPITALS, DEFAULT_STAFF_DIRECTORY } from '../data/accreditedStaffAndTenants';
import { purgeAllCaseStorage } from '../utils/storagePurge';

function normalizeTenant(raw: any): TenantHospital {
  const nameEn = (raw.nameEn || raw.name_en || '').trim();
  const normalizedNameEn = (nameEn === 'Alo Care Specialist Medical Center' || !nameEn)
    ? 'Riyadh Care Medical Center'
    : nameEn;
  const nameAr = (raw.nameAr || raw.name_ar || '').trim();
  const normalizedNameAr = (nameAr === 'مركز ألو كير الطبي التخصصي' || nameAr === 'مركز الرعاية التخصصية الطبي (الرياض)' || !nameAr)
    ? 'مستشفى رعاية الرياض المعتمد'
    : nameAr;

  return {
    id: raw.id || 'hosp-alo-riyadh-01',
    nameEn: normalizedNameEn,
    nameAr: normalizedNameAr,
    city: raw.city || 'الرياض',
    cityAr: raw.cityAr || raw.city_ar || raw.city || 'الرياض',
    mciLicenseNumber: raw.mciLicenseNumber || raw.mci_license_number || 'MCI-SA-2024-8891',
    status: (raw.status as any) || 'active',
    hospitalAdminName: raw.hospitalAdminName || raw.hospital_admin_name || 'David Nunez',
    hospitalAdminPhone: raw.hospitalAdminPhone || raw.hospital_admin_phone || '+966504444444',
    doctorCount: typeof raw.doctorCount === 'number' ? raw.doctorCount : (typeof raw.doctor_count === 'number' ? raw.doctor_count : 8),
    createdAt: raw.createdAt || raw.created_at || '2026-01-01T08:00:00.000Z',
  };
}

function normalizeCase(c: ClinicalCase): ClinicalCase {
  if (!c) return c;
  const rawHospital = c.treatingDoctor?.hospital;
  if (
    rawHospital === 'Alo Care Specialist Medical Center' ||
    rawHospital === 'مركز ألو كير الطبي التخصصي' ||
    rawHospital === 'مركز الرعاية التخصصية الطبي (الرياض)' ||
    rawHospital === 'المجمع الطبي الشريك'
  ) {
    return {
      ...c,
      treatingDoctor: {
        ...c.treatingDoctor,
        hospital: 'Riyadh Care Medical Center',
      },
    };
  }
  return c;
}

function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length > 0 && !parts[0].includes('.')) {
    return `${window.location.origin}/${parts[0]}`;
  }
  return window.location.origin;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('alo_user_session_v4.0_clean') || localStorage.getItem('alo_user_session_v3.0');
    if (!raw) return {};
    const session = JSON.parse(raw);
    return {
      'x-user-role': session.roleCode || 'P',
      'x-user-phone': session.phone || '',
      'x-user-id': session.userId || session.id || '',
      'x-tenant-id': session.hospitalId || session.tenantId || '',
    };
  } catch {
    return {};
  }
}

async function safeFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const authHeaders = getAuthHeaders();
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...(options?.headers || {}),
    },
  };
  const primaryUrl = `${getApiBase()}${endpoint}`;
  try {
    const res = await fetch(primaryUrl, mergedOptions);
    if (res.ok) return res;
  } catch (err) {
    if (getApiBase() !== window.location.origin) {
      return await fetch(`${window.location.origin}${endpoint}`, mergedOptions);
    }
    throw err;
  }
  if (getApiBase() !== window.location.origin) {
    return await fetch(`${window.location.origin}${endpoint}`, mergedOptions);
  }
  return await fetch(primaryUrl, mergedOptions);
}

export const apiClient = {
  // ── Tenants ───────────────────────────────────────────────────────────────
  async fetchTenants(): Promise<TenantHospital[]> {
    try {
      const res = await safeFetch('/api/tenants', { headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : null);
        if (rawList && rawList.length > 0) {
          const mapped = rawList.map(normalizeTenant);
          localStorage.setItem(TENANTS_KEY, JSON.stringify(mapped));
          return mapped;
        }
      }
    } catch (e) {
      console.warn('[API] Failed to fetch tenants from backend, using local fallback:', e);
    }
    try {
      const saved = localStorage.getItem(TENANTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeTenant);
      }
    } catch {}
    return DEFAULT_TENANT_HOSPITALS;
  },

  async createTenant(data: Omit<TenantHospital, 'id' | 'createdAt'>): Promise<TenantHospital> {
    try {
      const res = await safeFetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        const created = json?.data || json;
        if (created && created.id) return normalizeTenant(created);
      }
    } catch (e) {
      console.warn('[API] Failed to create tenant on backend:', e);
    }
    const localTenant: TenantHospital = {
      ...data,
      id: `hosp-${data.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    return localTenant;
  },

  // ── Staff Users ───────────────────────────────────────────────────────────
  async fetchUsers(): Promise<StaffAccountRecord[]> {
    try {
      const res = await safeFetch('/api/users', { headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : null);
        if (rawList && rawList.length > 0) {
          // Preserve local activation flags across remote sync
          const existing = (() => {
            try {
              const saved = localStorage.getItem(PLATFORM_USERS_KEY);
              return saved ? JSON.parse(saved) : [];
            } catch { return []; }
          })();
          const merged = rawList.map((u: any) => {
            const loc = existing.find((e: any) => e.id === u.id || e.phone === u.phone || e.phone?.replace(/\D/g, '') === u.phone?.replace(/\D/g, ''));
            const record: StaffAccountRecord = {
              id: u.id,
              staffCode: u.staffCode || u.staff_code || u.id,
              fullName: u.fullName || u.full_name || '',
              fullNameAr: u.fullNameAr || u.full_name_ar || u.fullName,
              roleCode: u.roleCode || u.role_code || 'P',
              hospitalId: u.hospitalId || u.hospital_id || (u.roleCode === 'D' || u.role_code === 'D' ? 'hosp-alo-riyadh-01' : undefined),
              phone: u.phone,
              pin: loc?.pin || u.pin || '1234',
              hasCustomPin: Boolean(loc?.hasCustomPin || u.hasCustomPin || u.has_custom_pin),
              department: u.department,
              status: u.status || 'active',
              createdAt: u.createdAt || u.created_at || new Date().toISOString(),
            };
            return record;
          });
          localStorage.setItem(PLATFORM_USERS_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      console.warn('[API] Failed to fetch users from backend, using local fallback:', e);
    }
    try {
      const saved = localStorage.getItem(PLATFORM_USERS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STAFF_DIRECTORY;
    } catch {
      return DEFAULT_STAFF_DIRECTORY;
    }
  },

  async cleanSlateDatabase(): Promise<boolean> {
    try {
      const res = await safeFetch('/api/admin/clean-slate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async updateUserPin(phone: string, pin: string): Promise<boolean> {
    try {
      const res = await safeFetch('/api/users/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async createUser(data: Omit<StaffAccountRecord, 'id' | 'createdAt'>): Promise<StaffAccountRecord> {
    try {
      const res = await safeFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      console.warn('[API] Failed to create user on backend:', e);
    }
    const localUser: StaffAccountRecord = {
      ...data,
      id: `staff-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    return localUser;
  },

  // ── Cases ─────────────────────────────────────────────────────────────────
  async fetchCases(): Promise<ClinicalCase[]> {
    try {
      const res = await safeFetch('/api/cases', { headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : null);
        if (rawList) {
          const normalized = rawList.map(normalizeCase);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (e) {
      console.warn('[API] Failed to fetch cases from backend, using local fallback:', e);
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(normalizeCase);
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveCase(c: ClinicalCase): Promise<void> {
    try {
      await safeFetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
    } catch (e) {
      console.warn('[API] Failed to sync case to backend:', e);
    }
  },

  async purgeAllCases(): Promise<void> {
    try {
      await safeFetch('/api/cases', { method: 'DELETE' });
    } catch (e) {
      console.warn('[API] Failed to purge cases from backend:', e);
    }
    // Full 3-layer wipe: DB + server in-memory (above) + all localStorage case keys
    purgeAllCaseStorage();
  },

  async deleteSingleCase(caseId: string): Promise<void> {
    try {
      await safeFetch(`/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[API] Failed to delete case from backend:', e);
    }
    // Remove from localStorage cases array
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const arr = JSON.parse(stored) as ClinicalCase[];
        const updated = arr.filter((x) => x.id !== caseId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}
  },

  // ── Audit Logs ────────────────────────────────────────────────────────────
  async fetchAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const res = await safeFetch('/api/audit', { headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          localStorage.setItem('alo_audit_logs_v3.0', JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[API] Failed to fetch audit logs from backend:', e);
    }
    try {
      const saved = localStorage.getItem('alo_audit_logs_v3.0');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async appendAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      await safeFetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (e) {
      console.warn('[API] Failed to save audit log to backend:', e);
    }
  },

  // ── File Storage (MinIO) ──────────────────────────────────────────────────
  async uploadFile(file: File): Promise<{ url: string; size: string; storage: string } | null> {
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const fileData = await base64Promise;

      const res = await safeFetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileData,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          return { url: `${getApiBase()}${json.url}`, size: json.size, storage: json.storage };
        }
      }
    } catch (e) {
      console.warn('[API] MinIO upload failed, using fallback:', e);
    }
    return null;
  },

  // ── LiveKit WebRTC Token API ──────────────────────────────────────────────
  async createLiveKitToken(params: {
    roomName: string;
    participantName: string;
    participantRole: string;
    identity?: string;
  }): Promise<{ token: string; serverUrl: string; roomName: string; identity: string } | null> {
    try {
      const res = await safeFetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.token) {
          return json;
        }
      }
    } catch (e) {
      console.warn('[API] Failed to get LiveKit token from backend:', e);
    }
    return null;
  },
};

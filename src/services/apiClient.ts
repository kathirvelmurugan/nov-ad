import { TenantHospital, StaffAccountRecord, ClinicalCase, AuditLogEntry } from '../types';
import { TENANTS_KEY, PLATFORM_USERS_KEY } from '../hooks/workflowConstants';

function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length > 0 && !parts[0].includes('.')) {
    return `${window.location.origin}/${parts[0]}`;
  }
  return window.location.origin;
}

async function safeFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const primaryUrl = `${getApiBase()}${endpoint}`;
  try {
    const res = await fetch(primaryUrl, options);
    if (res.ok) return res;
  } catch (err) {
    if (getApiBase() !== window.location.origin) {
      return await fetch(`${window.location.origin}${endpoint}`, options);
    }
    throw err;
  }
  if (getApiBase() !== window.location.origin) {
    return await fetch(`${window.location.origin}${endpoint}`, options);
  }
  return await fetch(primaryUrl, options);
}

export const apiClient = {
  // ── Tenants ───────────────────────────────────────────────────────────────
  async fetchTenants(): Promise<TenantHospital[]> {
    try {
      const res = await safeFetch('/api/tenants', { headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          localStorage.setItem(TENANTS_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[API] Failed to fetch tenants from backend, using local fallback:', e);
    }
    try {
      const saved = localStorage.getItem(TENANTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
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
        if (json.data) return json.data;
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
        if (Array.isArray(json.data)) {
          localStorage.setItem(PLATFORM_USERS_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[API] Failed to fetch users from backend, using local fallback:', e);
    }
    try {
      const saved = localStorage.getItem(PLATFORM_USERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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
};

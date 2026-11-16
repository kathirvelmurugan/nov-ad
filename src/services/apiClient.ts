import { TenantHospital, StaffAccountRecord, ClinicalCase, AuditLogEntry } from '../types';
import { TENANTS_KEY, PLATFORM_USERS_KEY, STORAGE_KEY, ACTIVE_CASE_KEY } from '../hooks/workflowConstants';
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

function emitApiError(endpoint: string, status: number | string, message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('alo:api-error', {
        detail: { endpoint, status, message },
      })
    );
  }
}

async function executeFetch(endpoint: string, options?: RequestInit): Promise<Response> {
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

/**
 * Safe fetch with 1-shot automatic retry (500ms delay).
 * If retry fails, emits 'alo:api-error' event and throws fatal error (Zero Silent Fallback).
 */
async function safeFetchWithRetry(endpoint: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await executeFetch(endpoint, options);
    if (res.ok) return res;
    throw new Error(`HTTP ${res.status}`);
  } catch (firstErr: any) {
    // 1-Shot automatic retry after 500ms backoff
    await new Promise((r) => setTimeout(r, 500));
    try {
      const retryRes = await executeFetch(endpoint, options);
      if (retryRes.ok) return retryRes;
      throw new Error(`Retry HTTP ${retryRes.status}`);
    } catch (fatalErr: any) {
      emitApiError(endpoint, fatalErr.status || 500, fatalErr.message || 'API connection failed after retry');
      throw fatalErr;
    }
  }
}

export const apiClient = {
  // ── Authentication ────────────────────────────────────────────────────────
  async checkUserExists(phone: string): Promise<{ exists: boolean; hasPin: boolean }> {
    try {
      const users = await this.fetchUsers();
      const sanitized = phone.replace(/[\s\-\(\)\.]/g, '');
      const user = users.find((u) => u.phone.replace(/[\s\-\(\)\.]/g, '').endsWith(sanitized.slice(-8)));
      return { exists: !!user, hasPin: Boolean(user?.hasCustomPin || user?.pin) };
    } catch {
      return { exists: false, hasPin: false };
    }
  },

  async login(phone: string, pin: string): Promise<StaffAccountRecord> {
    const res = await safeFetchWithRetry('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin }),
    });
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Login failed');
    }
    return json.data;
  },

  // ── Tenants ───────────────────────────────────────────────────────────────
  async fetchTenants(): Promise<TenantHospital[]> {
    const res = await safeFetchWithRetry('/api/tenants', { headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
    const mapped = rawList.map(normalizeTenant);
    try { localStorage.setItem(TENANTS_KEY, JSON.stringify(mapped)); } catch {}
    return mapped;
  },

  async createTenant(data: Omit<TenantHospital, 'id' | 'createdAt'>): Promise<TenantHospital> {
    const res = await safeFetchWithRetry('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    const created = json?.data || json;
    return normalizeTenant(created);
  },

  // ── Staff Users ───────────────────────────────────────────────────────────
  async fetchUsers(): Promise<StaffAccountRecord[]> {
    const res = await safeFetchWithRetry('/api/users', { headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
    const mapped: StaffAccountRecord[] = rawList.map((u: any) => ({
      id: u.id,
      staffCode: u.staffCode || u.staff_code || u.id,
      fullName: u.fullName || u.full_name || '',
      fullNameAr: u.fullNameAr || u.full_name_ar || u.fullName,
      roleCode: u.roleCode || u.role_code || 'P',
      hospitalId: u.hospitalId || u.hospital_id,
      phone: u.phone,
      pin: u.pin || '1234',
      hasCustomPin: Boolean(u.hasCustomPin || u.has_custom_pin),
      department: u.department,
      status: u.status || 'active',
      createdAt: u.createdAt || u.created_at || new Date().toISOString(),
    }));
    try { localStorage.setItem(PLATFORM_USERS_KEY, JSON.stringify(mapped)); } catch {}
    return mapped;
  },

  async cleanSlateDatabase(): Promise<boolean> {
    const res = await safeFetchWithRetry('/api/admin/clean-slate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  },

  async updateUserPin(phone: string, pin: string): Promise<boolean> {
    const res = await safeFetchWithRetry('/api/users/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin }),
    });
    return res.ok;
  },

  async createUser(data: Omit<StaffAccountRecord, 'id' | 'createdAt'>): Promise<StaffAccountRecord> {
    const res = await safeFetchWithRetry('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json?.data || json;
  },

  // ── Cases ─────────────────────────────────────────────────────────────────
  async fetchCases(): Promise<ClinicalCase[]> {
    const res = await safeFetchWithRetry('/api/cases', { headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
    const normalized = rawList.map(normalizeCase);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized)); } catch {}
    return normalized;
  },

  async saveCase(c: ClinicalCase): Promise<void> {
    await safeFetchWithRetry('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });
  },

  async purgeAllCases(): Promise<void> {
    await safeFetchWithRetry('/api/cases', { method: 'DELETE' });
    purgeAllCaseStorage();
  },

  async deleteSingleCase(caseId: string): Promise<void> {
    await safeFetchWithRetry(`/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const arr = JSON.parse(stored) as ClinicalCase[];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.filter((x) => x.id !== caseId)));
      }
    } catch {}
  },

  // ── Dedicated Transition Endpoints ────────────────────────────────────────
  async payCase(caseId: string, payload: any): Promise<void> {
    await safeFetchWithRetry(`/api/cases/${encodeURIComponent(caseId)}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async verifyPayment(caseId: string): Promise<void> {
    await safeFetchWithRetry(`/api/cases/${encodeURIComponent(caseId)}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async submitOpinion(caseId: string, payload: any): Promise<void> {
    await safeFetchWithRetry(`/api/cases/${encodeURIComponent(caseId)}/opinion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async closeCase(caseId: string): Promise<void> {
    await safeFetchWithRetry(`/api/cases/${encodeURIComponent(caseId)}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // ── Audit Logs ────────────────────────────────────────────────────────────
  async fetchAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await safeFetchWithRetry('/api/audit', { headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
  },

  async appendAuditLog(entry: AuditLogEntry): Promise<void> {
    await safeFetchWithRetry('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  },

  // ── File Upload ───────────────────────────────────────────────────────────
  async uploadFile(file: File): Promise<{ url: string; size: string; storage: string } | null> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await safeFetchWithRetry('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    return json.success ? json.data : null;
  },

  // ── LiveKit Consultation Tokens ───────────────────────────────────────────
  async createLiveKitToken(params: {
    roomName: string;
    participantName: string;
    participantRole?: string;
    role?: string;
    identity?: string;
    participantIdentity?: string;
    caseId?: string;
  }): Promise<{ token: string; roomName: string; wsUrl: string }> {
    const res = await safeFetchWithRetry('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return json.data || json;
  },
};

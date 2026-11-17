import { TenantHospital, StaffAccountRecord, ClinicalCase, AuditLogEntry } from '../types';
import { ACTIVE_CASE_KEY, USER_SESSION_KEY } from '../hooks/workflowConstants';
import { purgeAllCaseStorage } from '../utils/storagePurge';

// Returned when a hospital is onboarded: the administrator account is created in
// the same transaction as the tenant, and a generated PIN is shown exactly once.
export interface TenantAdminAccount {
  id: string;
  phone: string;
  created: boolean;
  promotedFromPatient: boolean;
  initialPin: string | null;
}

// Field mapping only: snake_case → camelCase. No fallback names, ids, cities or
// statuses — an empty field means the row genuinely has no value.
function normalizeTenant(raw: any): TenantHospital {
  return {
    id: raw.id != null ? String(raw.id) : '',
    nameEn: raw.nameEn || raw.name_en || '',
    nameAr: raw.nameAr || raw.name_ar || '',
    city: raw.city || '',
    cityAr: raw.cityAr || raw.city_ar || raw.city || '',
    mciLicenseNumber: raw.mciLicenseNumber || raw.mci_license_number || '',
    status: (raw.status as TenantHospital['status']) || 'active',
    hospitalAdminName: raw.hospitalAdminName || raw.hospital_admin_name || '',
    hospitalAdminPhone: raw.hospitalAdminPhone || raw.hospital_admin_phone || '',
    doctorCount: typeof raw.doctorCount === 'number' ? raw.doctorCount : (typeof raw.doctor_count === 'number' ? raw.doctor_count : 0),
    createdAt: raw.createdAt || raw.created_at || '',
  };
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
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return {};
    const session = JSON.parse(raw);
    if (session.token) {
      return { 'Authorization': `Bearer ${session.token}` };
    }
    return {};
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

// A 401 from these endpoints is a normal credential answer, not an expired session.
const AUTH_ENDPOINTS = ['/api/users/login', '/api/users/lookup', '/api/users/pin', '/api/users/access-code', '/api/users/activate'];

/**
 * A 401 on an authenticated endpoint means the Bearer token is no longer valid
 * (12h TTL, server restart, revoked). Clear the stale session and let the auth
 * gate reopen instead of looping in the retry modal.
 */
function handleUnauthorized(endpoint: string) {
  if (typeof window === 'undefined') return;
  if (AUTH_ENDPOINTS.some((p) => endpoint.startsWith(p))) return;
  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch {}
  window.dispatchEvent(new CustomEvent('alo:session-expired'));
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
    return await fetch(primaryUrl, mergedOptions);
  } catch (err) {
    if (getApiBase() !== window.location.origin) {
      try {
        return await fetch(`${window.location.origin}${endpoint}`, mergedOptions);
      } catch (fallbackErr) {
        throw err;
      }
    }
    throw err;
  }
}

/**
 * Safe fetch with 1-shot automatic retry (500ms delay).
 * If retry fails, emits 'alo:api-error' event and throws fatal error (Zero Silent Fallback).
 */
async function safeFetchWithRetry(endpoint: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await executeFetch(endpoint, options);
    if (res.status === 401) handleUnauthorized(endpoint);
    // 4xx client responses (e.g. 401 Invalid PIN, 404 not found, 400 bad request) are valid clinical/auth answers, not server outages!
    if (res.ok || (res.status >= 400 && res.status < 500)) return res;
    throw new Error(`HTTP ${res.status}`);
  } catch (firstErr: any) {
    // 1-Shot automatic retry after 500ms backoff
    await new Promise((r) => setTimeout(r, 500));
    try {
      const retryRes = await executeFetch(endpoint, options);
      if (retryRes.status === 401) handleUnauthorized(endpoint);
      if (retryRes.ok || (retryRes.status >= 400 && retryRes.status < 500)) return retryRes;
      throw new Error(`Retry HTTP ${retryRes.status}`);
    } catch (fatalErr: any) {
      emitApiError(endpoint, fatalErr.status || 500, fatalErr.message || 'API connection failed after retry');
      throw fatalErr;
    }
  }
}

export const apiClient = {
  // ── Authentication ────────────────────────────────────────────────────────
  async checkUserExists(phone: string): Promise<{
    exists: boolean;
    hasPin: boolean;
    accountType: 'staff' | 'patient' | 'unknown';
    roleCode: string;
  }> {
    const res = await safeFetchWithRetry('/api/users/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (!res.ok) {
      const error: any = new Error(json?.message || `LOOKUP_FAILED (${res.status})`);
      error.response = { status: res.status };
      throw error;
    }
    // A backend that cannot answer must never be read as "this person is new".
    const accountType =
      json?.accountType === 'staff' || json?.accountType === 'patient'
        ? json.accountType
        : 'unknown';
    return {
      exists: Boolean(json.exists),
      hasPin: Boolean(json.requiresPin),
      accountType,
      roleCode: String(json.roleCode || ''),
    };
  },

  async login(phone: string, pin: string): Promise<StaffAccountRecord> {
    const res = await safeFetchWithRetry('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin }),
    });
    const json = await res.json();
    if (!res.ok) {
      const err: any = new Error(json.error || 'Login failed');
      err.response = { status: res.status };
      throw err;
    }
    const user = json.data || (json.id ? json : null);
    if (!user) {
      throw new Error(json.error || 'Login failed');
    }
    return user;
  },

  // ── Tenants ───────────────────────────────────────────────────────────────
  async fetchTenants(): Promise<TenantHospital[]> {
    const res = await safeFetchWithRetry('/api/tenants', { headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
    return rawList.map(normalizeTenant);
  },

  async createTenant(data: Omit<TenantHospital, 'id' | 'createdAt'>): Promise<TenantHospital & { adminAccount?: TenantAdminAccount }> {
    const res = await safeFetchWithRetry('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    // The administrator account is created with the tenant, so a refusal here
    // means no hospital exists either. Surface it instead of rendering a
    // half-built tenant card.
    if (!res.ok || json?.success === false) {
      throw new Error(json?.message || json?.error || 'Tenant could not be created.');
    }
    const created = json?.data || json;
    return { ...normalizeTenant(created), adminAccount: json?.adminAccount || undefined };
  },

  async updateTenantStatus(id: string, status: 'active' | 'pending' | 'suspended'): Promise<void> {
    const res = await safeFetchWithRetry(`/api/tenants/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({} as any));
      const error: any = new Error(json?.message || `TENANT_STATUS_FAILED (${res.status})`);
      error.response = { status: res.status, data: json };
      throw error;
    }
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
      roleCode: u.roleCode || u.role_code || '',
      hospitalId: u.hospitalId || u.hospital_id,
      phone: u.phone,
      hasCustomPin: Boolean(u.hasCustomPin || u.has_custom_pin),
      department: u.department,
      status: u.status || 'active',
      createdAt: u.createdAt || u.created_at || '',
    }));
    return mapped;
  },

  // Sanitized public directory. role defaults to D so existing callers keep their
  // behaviour; K is the international consultant directory. /api/users stays
  // admin-only because it exposes pins.
  async fetchDoctors(hospitalId?: string, role: 'D' | 'K' = 'D'): Promise<Array<{
    id: string;
    roleCode?: string;
    fullName: string;
    fullNameAr?: string | null;
    hospitalId?: string | null;
    department?: string | null;
    scfhsLicense?: string | null;
  }>> {
    const params = new URLSearchParams();
    if (hospitalId) params.set('hospitalId', hospitalId);
    if (role !== 'D') params.set('role', role);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await safeFetchWithRetry(`/api/users/doctors${qs}`, { headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
    return rawList.map((d: any) => ({
      id: d.id,
      roleCode: d.roleCode ?? undefined,
      fullName: d.fullName || d.full_name || '',
      fullNameAr: d.fullNameAr ?? d.full_name_ar ?? null,
      hospitalId: d.hospitalId ?? d.hospital_id ?? null,
      department: d.department ?? null,
      scfhsLicense: d.scfhsLicense ?? d.scfhs_license ?? null,
    }));
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
    if (!res.ok) {
      const json = await res.json().catch(() => ({} as any));
      const error: any = new Error(json?.message || `PIN_NOT_SAVED (${res.status})`);
      error.response = { status: res.status, data: json };
      throw error;
    }
    return true;
  },

  // Completes a first login: swaps the activation code used at sign-in for a PIN
  // only the owner knows. The server re-verifies the code from the database; the
  // session token proves who is asking, it does not stand in for the code.
  //
  // The token is passed in explicitly on purpose. This call happens *before* the
  // session is written to storage, so getAuthHeaders() has nothing to read yet and
  // the request would leave without an Authorization header.
  async activateAccount(code: string, newPin: string, token: string): Promise<boolean> {
    const res = await safeFetchWithRetry('/api/users/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code, newPin }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({} as any));
      const error: any = new Error(json?.message || `ACTIVATION_FAILED (${res.status})`);
      error.response = { status: res.status, data: json };
      throw error;
    }
    return true;
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

  // Issues a brand-new PIN for a staff account and returns it once. There is no
  // read endpoint for a PIN: if it is lost, this is the only recovery path.
  async resetUserPin(id: string): Promise<{ id: string; pin: string; fullName?: string; roleCode?: string }> {
    const res = await safeFetchWithRetry(`/api/users/${encodeURIComponent(id)}/reset-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok) {
      const error: any = new Error(json?.message || `PIN_RESET_FAILED (${res.status})`);
      error.response = { status: res.status, data: json };
      throw error;
    }
    return json;
  },

  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
    const res = await safeFetchWithRetry(`/api/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({} as any));
      const error: any = new Error(json?.message || `STATUS_UPDATE_FAILED (${res.status})`);
      error.response = { status: res.status, data: json };
      throw error;
    }
  },

  // ── Cases ─────────────────────────────────────────────────────────────────
  async fetchCases(): Promise<ClinicalCase[]> {
    const res = await safeFetchWithRetry('/api/cases', { headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
    return rawList as ClinicalCase[];
  },

  async saveCase(c: ClinicalCase): Promise<void> {
    const stamped = { ...c, updatedAt: new Date().toISOString() };
    const res = await safeFetchWithRetry('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stamped),
    });
    // 4xx answers are returned by safeFetchWithRetry, not thrown: a rejected
    // write must still surface as a failure instead of looking like a success.
    if (!res.ok) {
      const body = await res.json().catch(() => ({} as Record<string, unknown>));
      throw new Error((body as any).message || (body as any).error || `Case save rejected (HTTP ${res.status})`);
    }
  },

  async purgeAllCases(): Promise<void> {
    await safeFetchWithRetry('/api/cases', { method: 'DELETE' });
    purgeAllCaseStorage();
  },

  async deleteSingleCase(caseId: string): Promise<void> {
    await safeFetchWithRetry(`/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
  },

  // Validates a consultant magic-link token against the stored case and returns a
  // REAL server session. Without this the consultant portal would run on a
  // client-invented identity whose API calls could never authenticate.
  async verifyMagicLink(caseId: string, token: string): Promise<{
    token: string;
    expiresAt: string;
    caseId: string;
    caseNumber?: string;
    patientName?: string;
    currentStage?: string;
  }> {
    const res = await safeFetchWithRetry(`/api/cases/${encodeURIComponent(caseId)}/magic-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    if (!res.ok || !json?.success) {
      const error: any = new Error(json?.message || 'Invalid or expired magic link');
      error.response = { status: res.status, data: json };
      throw error;
    }
    return json.data;
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

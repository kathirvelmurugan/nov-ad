import { useCallback } from 'react';

export interface AloUserSession {
  userId?: string;
  id?: string;
  roleCode?: string;
  phone?: string;
  hospitalId?: string;
  tenantId?: string;
  [key: string]: any;
}

const ALO_SESSION_KEY = 'alo_user_session_v3.0';

function getActiveSession(): AloUserSession | null {
  try {
    const raw = localStorage.getItem(ALO_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AloUserSession;
  } catch (error) {
    console.error('[ALO DOCTOR] Failed to parse active user session:', error);
    return null;
  }
}

function isDirectionRTL(): boolean {
  if (typeof document !== 'undefined') {
    return document.documentElement.dir === 'rtl' || document.documentElement.lang?.startsWith('ar') === true;
  }
  return false;
}

export async function safeFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const session = getActiveSession();
  const isRtl = isDirectionRTL();

  const injectedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': isRtl ? 'ar-SA' : 'en-US',
    'x-user-role': session?.roleCode || 'P',
    'x-user-phone': session?.phone || '',
    'x-user-id': session?.userId || session?.id || '',
    'x-tenant-id': session?.hospitalId || session?.tenantId || '',
  };

  const mergedHeaders = new Headers(options.headers || {});

  Object.entries(injectedHeaders).forEach(([key, value]) => {
    if (!mergedHeaders.has(key)) {
      mergedHeaders.set(key, value);
    }
  });

  const config: RequestInit = {
    ...options,
    headers: mergedHeaders,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown Error');
      throw new Error(
        `[ALO API] Request failed with status ${response.status}: ${errorBody}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (error) {
    console.error(`[ALO API] safeFetch error for ${url}:`, error);
    throw error;
  }
}

export const apiClient = {
  get: <T = any>(url: string, options?: RequestInit) =>
    safeFetch<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: RequestInit) =>
    safeFetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(url: string, body?: any, options?: RequestInit) =>
    safeFetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(url: string, body?: any, options?: RequestInit) =>
    safeFetch<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(url: string, options?: RequestInit) =>
    safeFetch<T>(url, { ...options, method: 'DELETE' }),
};

export function useApiClient() {
  const get = useCallback(<T = any>(url: string, options?: RequestInit) => {
    return apiClient.get<T>(url, options);
  }, []);

  const post = useCallback(<T = any>(url: string, body?: any, options?: RequestInit) => {
    return apiClient.post<T>(url, body, options);
  }, []);

  const put = useCallback(<T = any>(url: string, body?: any, options?: RequestInit) => {
    return apiClient.put<T>(url, body, options);
  }, []);

  const patch = useCallback(<T = any>(url: string, body?: any, options?: RequestInit) => {
    return apiClient.patch<T>(url, body, options);
  }, []);

  const del = useCallback(<T = any>(url: string, options?: RequestInit) => {
    return apiClient.delete<T>(url, options);
  }, []);

  return { get, post, put, patch, delete: del };
}

export default apiClient;
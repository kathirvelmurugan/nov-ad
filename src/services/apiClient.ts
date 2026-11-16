import { User, CaseRecord, AuthSession } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const RETRY_DELAY_MS = 500;
const MAX_RETRIES = 1;

interface ApiErrorDetail {
  endpoint: string;
  status: number;
  message: string;
}

class ApiFatalError extends Error {
  public readonly endpoint: string;
  public readonly status: number;

  constructor(endpoint: string, status: number, message: string) {
    super(message);
    this.name = 'ApiFatalError';
    this.endpoint = endpoint;
    this.status = status;
  }
}

function emitGlobalApiError(detail: ApiErrorDetail): void {
  window.dispatchEvent(
    new CustomEvent<ApiErrorDetail>('alo:api-error', { detail })
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function unwrapResponse<T>(payload: unknown): T {
  if (payload === null || payload === undefined) {
    return [] as unknown as T;
  }

  if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    if ('success' in record && record.success === true && 'data' in record) {
      return record.data as T;
    }
  }

  return payload as T;
}

async function executeWithRetry<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  let lastError: ApiFatalError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await delay(RETRY_DELAY_MS);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': document.documentElement.dir === 'rtl' ? 'ar-SA' : 'en-US',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new ApiFatalError(endpoint, response.status, errorBody);
      }

      const rawPayload = await response.json();
      return unwrapResponse<T>(rawPayload);
    } catch (error) {
      if (error instanceof ApiFatalError) {
        lastError = error;
      } else {
        lastError = new ApiFatalError(
          endpoint,
          0,
          error instanceof Error ? error.message : 'Network request failed'
        );
      }
    }
  }

  const fatal = lastError!;
  
  emitGlobalApiError({
    endpoint: fatal.endpoint,
    status: fatal.status,
    message: fatal.message,
  });

  throw fatal;
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    return executeWithRetry<T>(endpoint, {
      method: 'GET',
    });
  },

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return executeWithRetry<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return executeWithRetry<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    return executeWithRetry<T>(endpoint, {
      method: 'DELETE',
    });
  },

  async login(phone: string, pin: string): Promise<AuthSession> {
    return executeWithRetry<AuthSession>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
  },

  async getCases(): Promise<CaseRecord[]> {
    return executeWithRetry<CaseRecord[]>('/cases', {
      method: 'GET',
    });
  },

  async getStaffDirectory(): Promise<User[]> {
    return executeWithRetry<User[]>('/users/staff', {
      method: 'GET',
    });
  },
};

export type { ApiErrorDetail, ApiFatalError };
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface ClinicalCase {
  id: string;
  patientPhone?: string;
  userId?: string;
  titleAr: string;
  titleEn: string;
  status: 'active' | 'resolved' | 'pending' | 'archived';
  createdAt: string;
  updatedAt: string;
  personaId?: string;
  metadata?: Record<string, unknown>;
}

export interface UserSession {
  userId?: string;
  phone?: string;
  role?: string;
  isAuthenticated: boolean;
  preferredLanguage?: 'ar' | 'en';
  personaId?: string;
}

interface UseClinicalWorkflowStateProps {
  userSession: UserSession | null;
  onLogout?: () => void;
}

interface UseClinicalWorkflowStateReturn {
  cases: ClinicalCase[];
  effectiveCases: ClinicalCase[];
  isLoading: boolean;
  error: string | null;
  addCase: (newCase: Omit<ClinicalCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCase: (id: string, updates: Partial<ClinicalCase>) => void;
  removeCase: (id: string) => void;
  handleLogout: () => void;
  refreshCases: () => Promise<void>;
}

const STORAGE_PREFIX = 'alo_cases_';

const generateSessionKey = (session: UserSession | null): string => {
  if (!session) return `${STORAGE_PREFIX}guest`;
  const identifier = session.phone || session.userId || 'guest';
  const sanitizedIdentifier = identifier.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${STORAGE_PREFIX}${sanitizedIdentifier}`;
};

const wipeSessionStorage = (session: UserSession | null): void => {
  if (!session) return;
  const key = generateSessionKey(session);
  try {
    localStorage.removeItem(key);
  } catch (storageError) {
    console.error('[ALO DOCTOR v2.4] Failed to wipe session storage:', storageError);
  }
};

const readSessionCache = (key: string): ClinicalCase[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ClinicalCase[];
  } catch (parseError) {
    console.warn('[ALO DOCTOR v2.4] Corrupted cache detected, returning empty state:', parseError);
    return [];
  }
};

const writeSessionCache = (key: string, data: ClinicalCase[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (writeError) {
    console.error('[ALO DOCTOR v2.4] Failed to persist clinical state:', writeError);
  }
};

export function useClinicalWorkflowState({
  userSession,
  onLogout
}: UseClinicalWorkflowStateProps): UseClinicalWorkflowStateReturn {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = useMemo(() => generateSessionKey(userSession), [userSession]);

  const fetchCases = useCallback(async () => {
    if (!userSession?.isAuthenticated) {
      setCases([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cachedData = readSessionCache(storageKey);
      
      if (cachedData.length > 0) {
        setCases(cachedData);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/v2/clinical/cases', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Session': userSession.userId || '',
          'X-User-Phone': userSession.phone || '',
          'X-Persona-Id': userSession.personaId || 'default',
          'Accept-Language': userSession.preferredLanguage === 'ar' ? 'ar-SA' : 'en-US'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Clinical API responded with status: ${response.status}`);
      }

      const payload = await response.json();
      const fetchedCases: ClinicalCase[] = Array.isArray(payload?.data) ? payload.data : [];

      // STRICT REQUIREMENT: Zero seed fallbacks for authenticated users.
      // If the API returns empty or fails, we provide an authenticated empty state ([]).
      // No mock/demo data is ever injected here in production.
      setCases(fetchedCases);
      writeSessionCache(storageKey, fetchedCases);

    } catch (fetchError) {
      console.error('[ALO DOCTOR v2.4] Case fetch failed, enforcing empty state:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Unknown fetch error');
      
      // Fallback to authenticated empty state, NEVER seed cases
      setCases([]);
      writeSessionCache(storageKey, []);
    } finally {
      setIsLoading(false);
    }
  }, [userSession, storageKey]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    if (cases.length > 0 || error) {
      writeSessionCache(storageKey, cases);
    }
  }, [cases, storageKey, error]);

  // STRICT REQUIREMENT: Effective cases filter isolated per session and role
  const effectiveCases = useMemo(() => {
    if (!userSession?.isAuthenticated) return [];

    // For patients, strictly match their phone number to prevent historical cross-case display
    if (userSession.role === 'patient' && userSession.phone) {
      return cases.filter(
        (c) => c.patientPhone === userSession.phone || c.userId === userSession.userId
      );
    }

    // For doctors/admins using specific personas, optionally filter by persona context
    if (userSession.personaId) {
      return cases.filter((c) => !c.personaId || c.personaId === userSession.personaId);
    }

    return cases;
  }, [cases, userSession]);

  const addCase = useCallback((newCase: Omit<ClinicalCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const enrichedCase: ClinicalCase = {
      ...newCase,
      id: `case_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      patientPhone: newCase.patientPhone || userSession?.phone,
      userId: newCase.userId || userSession?.userId,
      personaId: newCase.personaId || userSession?.personaId
    };

    setCases((prev) => {
      const next = [...prev, enrichedCase];
      writeSessionCache(storageKey, next);
      return next;
    });
  }, [userSession, storageKey]);

  const updateCase = useCallback((id: string, updates: Partial<ClinicalCase>) => {
    setCases((prev) => {
      const next = prev.map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      );
      writeSessionCache(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const removeCase = useCallback((id: string) => {
    setCases((prev) => {
      const next = prev.filter((c) => c.id !== id);
      writeSessionCache(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const handleLogout = useCallback(() => {
    // Wipe current user's session cache from localStorage before clearing state
    wipeSessionStorage(userSession);
    
    setCases([]);
    setError(null);
    setIsLoading(false);

    if (onLogout) {
      onLogout();
    }
  }, [userSession, onLogout]);

  const refreshCases = useCallback(async () => {
    await fetchCases();
  }, [fetchCases]);

  return {
    cases,
    effectiveCases,
    isLoading,
    error,
    addCase,
    updateCase,
    removeCase,
    handleLogout,
    refreshCases
  };
}

export default useClinicalWorkflowState;
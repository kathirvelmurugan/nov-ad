import { useState, useEffect, useCallback, useRef } from 'react';

export interface ClinicalCaseRecord {
  id: string;
  titleAr: string;
  titleEn: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  chiefComplaintAr: string;
  chiefComplaintEn: string;
  clinicalNotes: string;
  status: 'draft' | 'active' | 'archived';
  personaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CasePersistenceState {
  activeCase: ClinicalCaseRecord | null;
  casesList: ClinicalCaseRecord[];
  isLoading: boolean;
  error: string | null;
}

export interface UseCasePersistenceReturn extends CasePersistenceState {
  saveCase: (caseData: Partial<ClinicalCaseRecord> & { id?: string }) => Promise<ClinicalCaseRecord>;
  setActiveCase: (caseId: string | null) => void;
  refreshCases: () => Promise<void>;
  deleteCase: (caseId: string) => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEY = 'alo_doctor_v24_cases';
const ACTIVE_CASE_KEY = 'alo_doctor_v24_active_case_id';
const API_ENDPOINT = '/api/cases';

const isRTL = (): boolean => {
  if (typeof document !== 'undefined') {
    return document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
  }
  return true;
};

const readFromStorage = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window === 'undefined') return fallback;
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
};

const writeToStorage = <T>(key: string, value: T): void => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or unavailable
  }
};

const removeFromStorage = (key: string): void => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  } catch {
    // Ignore removal errors
  }
};

const generateId = (): string => {
  return `case_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export function useCasePersistence(): UseCasePersistenceReturn {
  const [casesList, setCasesList] = useState<ClinicalCaseRecord[]>(() => 
    readFromStorage<ClinicalCaseRecord[]>(STORAGE_KEY, [])
  );
  
  const [activeCaseId, setActiveCaseId] = useState<string | null>(() => 
    readFromStorage<string | null>(ACTIVE_CASE_KEY, null)
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeCase = activeCaseId 
    ? casesList.find(c => c.id === activeCaseId) ?? null 
    : null;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const syncToStorage = useCallback((cases: ClinicalCaseRecord[], activeId: string | null) => {
    writeToStorage(STORAGE_KEY, cases);
    if (activeId) {
      writeToStorage(ACTIVE_CASE_KEY, activeId);
    } else {
      removeFromStorage(ACTIVE_CASE_KEY);
    }
  }, []);

  const fetchCasesFromApi = useCallback(async (signal?: AbortSignal): Promise<ClinicalCaseRecord[]> => {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': isRTL() ? 'ar-SA' : 'en-US',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cases: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.cases ?? []);
  }, []);

  const postCaseToApi = useCallback(async (
    caseData: ClinicalCaseRecord, 
    isNew: boolean, 
    signal?: AbortSignal
  ): Promise<ClinicalCaseRecord> => {
    const response = await fetch(API_ENDPOINT, {
      method: isNew ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': isRTL() ? 'ar-SA' : 'en-US',
      },
      body: JSON.stringify(caseData),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to save case: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }, []);

  const deleteCaseFromApi = useCallback(async (caseId: string, signal?: AbortSignal): Promise<void> => {
    const response = await fetch(`${API_ENDPOINT}/${encodeURIComponent(caseId)}`, {
      method: 'DELETE',
      headers: {
        'Accept-Language': isRTL() ? 'ar-SA' : 'en-US',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete case: ${response.status} ${response.statusText}`);
    }
  }, []);

  const refreshCases = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const remoteCases = await fetchCasesFromApi(controller.signal);
      
      const mergedMap = new Map<string, ClinicalCaseRecord>();
      
      casesList.forEach(localCase => {
        mergedMap.set(localCase.id, localCase);
      });

      remoteCases.forEach(remoteCase => {
        const existing = mergedMap.get(remoteCase.id);
        if (!existing || new Date(remoteCase.updatedAt) > new Date(existing.updatedAt)) {
          mergedMap.set(remoteCase.id, remoteCase);
        }
      });

      const mergedCases = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setCasesList(mergedCases);
      syncToStorage(mergedCases, activeCaseId);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during sync';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [casesList, activeCaseId, fetchCasesFromApi, syncToStorage]);

  const saveCase = useCallback(async (
    caseData: Partial<ClinicalCaseRecord> & { id?: string }
  ): Promise<ClinicalCaseRecord> => {
    setIsLoading(true);
    setError(null);

    const now = new Date().toISOString();
    const isNew = !caseData.id;
    
    const fullCase: ClinicalCaseRecord = {
      id: caseData.id ?? generateId(),
      titleAr: caseData.titleAr ?? '',
      titleEn: caseData.titleEn ?? '',
      patientAge: caseData.patientAge ?? 0,
      patientGender: caseData.patientGender ?? 'other',
      chiefComplaintAr: caseData.chiefComplaintAr ?? '',
      chiefComplaintEn: caseData.chiefComplaintEn ?? '',
      clinicalNotes: caseData.clinicalNotes ?? '',
      status: caseData.status ?? 'draft',
      personaId: caseData.personaId ?? 'default',
      createdAt: isNew ? now : (caseData.createdAt ?? now),
      updatedAt: now,
    };

    try {
      let savedCase = fullCase;
      
      try {
        const controller = new AbortController();
        savedCase = await postCaseToApi(fullCase, isNew, controller.signal);
      } catch {
        // Offline fallback: persist locally only
        savedCase = fullCase;
      }

      setCasesList(prev => {
        const filtered = prev.filter(c => c.id !== savedCase.id);
        const updated = [savedCase, ...filtered].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        
        syncToStorage(updated, activeCaseId === savedCase.id || isNew ? savedCase.id : activeCaseId);
        
        if (isNew || activeCaseId === savedCase.id) {
          setActiveCaseId(savedCase.id);
        }

        return updated;
      });

      return savedCase;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save case';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeCaseId, postCaseToApi, syncToStorage]);

  const setActiveCase = useCallback((caseId: string | null) => {
    if (caseId === null) {
      setActiveCaseId(null);
      removeFromStorage(ACTIVE_CASE_KEY);
      return;
    }

    const exists = casesList.some(c => c.id === caseId);
    if (exists) {
      setActiveCaseId(caseId);
      writeToStorage(ACTIVE_CASE_KEY, caseId);
    } else {
      setError(isRTL() ? 'الحالة غير موجودة' : 'Case not found');
    }
  }, [casesList]);

  const deleteCase = useCallback(async (caseId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      try {
        const controller = new AbortController();
        await deleteCaseFromApi(caseId, controller.signal);
      } catch {
        // Offline fallback: remove locally only
      }

      setCasesList(prev => {
        const updated = prev.filter(c => c.id !== caseId);
        
        const nextActiveId = activeCaseId === caseId 
          ? (updated.length > 0 ? updated[0].id : null) 
          : activeCaseId;

        syncToStorage(updated, nextActiveId);
        
        if (activeCaseId === caseId) {
          setActiveCaseId(nextActiveId);
        }

        return updated;
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete case';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activeCaseId, deleteCaseFromApi, syncToStorage]);

  useEffect(() => {
    refreshCases();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    syncToStorage(casesList, activeCaseId);
  }, [casesList, activeCaseId, syncToStorage]);

  return {
    activeCase,
    casesList,
    isLoading,
    error,
    saveCase,
    setActiveCase,
    refreshCases,
    deleteCase,
    clearError,
  };
}

export default useCasePersistence;
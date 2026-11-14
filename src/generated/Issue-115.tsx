import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

export interface ClinicalCase {
  id: string;
  patientNameAr: string;
  patientNameEn: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  personaId: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface UseClinicalWorkflowStateReturn {
  cases: ClinicalCase[];
  isLoading: boolean;
  error: string | null;
  activePersonaId: string;
  setActivePersonaId: (id: string) => void;
  refreshCases: () => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  isRtl: boolean;
  language: 'ar' | 'en';
}

const PERSONA_STORAGE_KEY = 'alo_doctor_active_persona_v2_4';
const CASES_CACHE_KEY = 'alo_doctor_cases_ephemeral_cache';
const DEFAULT_PERSONA_ID = 'persona_1_general_practitioner';

const VALID_PERSONAS = [
  'persona_1_general_practitioner',
  'persona_2_cardiologist',
  'persona_3_pediatrician',
  'persona_4_dermatologist',
  'persona_5_neurologist',
  'persona_6_orthopedic',
  'persona_7_psychiatrist',
  'persona_8_emergency',
  'persona_9_surgeon',
  'persona_10_radiologist',
  'persona_11_admin_supervisor'
];

export function useClinicalWorkflowState(): UseClinicalWorkflowStateReturn {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activePersonaId, setActivePersonaIdState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(PERSONA_STORAGE_KEY);
      if (stored && VALID_PERSONAS.includes(stored)) {
        return stored;
      }
    } catch {
      // localStorage unavailable
    }
    return DEFAULT_PERSONA_ID;
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isRtl = activePersonaId !== 'persona_11_admin_supervisor';
  const language: 'ar' | 'en' = isRtl ? 'ar' : 'en';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.style.fontFamily = 'Cairo, sans-serif';
  }, [isRtl, language]);

  const setActivePersonaId = useCallback((id: string) => {
    if (!VALID_PERSONAS.includes(id)) {
      console.warn(`[ALO DOCTOR v2.4] Invalid persona ID rejected: ${id}`);
      return;
    }
    setActivePersonaIdState(id);
    try {
      localStorage.setItem(PERSONA_STORAGE_KEY, id);
    } catch {
      // Silently fail storage write
    }
  }, []);

  const clearEphemeralCache = useCallback(() => {
    try {
      localStorage.removeItem(CASES_CACHE_KEY);
    } catch {
      // Silently fail cache clear
    }
  }, []);

  const updateEphemeralCache = useCallback((serverCases: ClinicalCase[]) => {
    try {
      localStorage.setItem(CASES_CACHE_KEY, JSON.stringify(serverCases));
    } catch {
      // Silently fail cache update
    }
  }, []);

  const fetchCasesFromServer = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const serverCases: ClinicalCase[] = await apiClient.fetchCases(activePersonaId);
      
      if (!isMountedRef.current) return;

      // HARD SERVER TRUTH ENFORCEMENT
      // We replace state directly with server response.
      // No merging with previous state. No resurrection of deleted cases.
      const authoritativeCases = Array.isArray(serverCases) ? serverCases : [];

      setCases(authoritativeCases);

      if (authoritativeCases.length === 0) {
        // Server returned empty array (e.g., database purge).
        // Clear the ephemeral display cache immediately to prevent ghost resurrection.
        clearEphemeralCache();
      } else {
        // Update ephemeral cache strictly as a mirror of server truth for display caching only.
        updateEphemeralCache(authoritativeCases);
      }

    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clinical cases from server';
      setError(errorMessage);
      
      // On network failure, we DO NOT fall back to localStorage as source of truth.
      // We maintain current state but flag the error. 
      // Ephemeral cache remains untouched until next successful server sync.
      console.error('[ALO DOCTOR v2.4] Server fetch failed. Maintaining current state without local resurrection.', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [activePersonaId, clearEphemeralCache, updateEphemeralCache]);

  useEffect(() => {
    fetchCasesFromServer();
  }, [fetchCasesFromServer]);

  const refreshCases = useCallback(async () => {
    await fetchCasesFromServer();
  }, [fetchCasesFromServer]);

  const deleteCase = useCallback(async (caseId: string) => {
    if (!isMountedRef.current) return;

    // Optimistic UI update - remove from view immediately
    setCases(prev => prev.filter(c => c.id !== caseId));

    try {
      await apiClient.deleteCase(caseId);
      
      // After successful server deletion, enforce hard server truth
      // by re-fetching to ensure no ghosts remain in any edge case
      await fetchCasesFromServer();
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete case on server';
      setError(errorMessage);
      
      // Revert optimistic update on failure by fetching fresh server state
      await fetchCasesFromServer();
    }
  }, [fetchCasesFromServer]);

  return {
    cases,
    isLoading,
    error,
    activePersonaId,
    setActivePersonaId,
    refreshCases,
    deleteCase,
    isRtl,
    language
  };
}

export default useClinicalWorkflowState;
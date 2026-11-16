import type { CSSProperties } from 'react';

// ============================================================================
// ALO DOCTOR (v2.4 Saudi Edition) - Workflow Constants & Storage Isolation
// Target: src/hooks/workflowConstants.ts
// Architect: Lead Clinical Software Engineer
// Palette: Pinterest-Teal (#007B6E, #00C6AE, #E6FAF7, #25D366)
// Typography: Cairo (Native Arabic RTL / English LTR)
// ============================================================================

// --------------------------------------------------------------------------
// 1. STRICT LOCALSTORAGE ISOLATION (Drafts & Transient Preferences Only)
// --------------------------------------------------------------------------

/** Transient user session cache (not a source of truth) */
export const USER_SESSION_KEY = 'alo_user_session_v4.0_clean' as const;

/** Client language preference (ar-SA | en-US) */
export const LANG_KEY = 'alo_lang_preference' as const;

/** Client UI theme preference */
export const THEME_KEY = 'alo_theme_preference' as const;

/** Client view mode state */
export const VIEW_MODE_KEY = 'alo_view_mode_v4.0_clean' as const;

/** Unsubmitted clinical intake draft */
export const DRAFT_INTAKE_KEY = 'alo_draft_intake_v4.0_clean' as const;

// --------------------------------------------------------------------------
// 2. VOLATILE SESSION CACHES (Legacy Keys - Deprecated as Sources of Truth)
// --------------------------------------------------------------------------

/** 
 * @deprecated Volatile session cache only. Do not use as canonical source of truth.
 * Legacy full-case storage key isolated to transient memory.
 */
export const STORAGE_KEY = 'alo_legacy_storage_volatile' as const;

/** 
 * @deprecated Volatile session cache only. Do not use as canonical source of truth.
 * Legacy active case pointer isolated to transient memory.
 */
export const ACTIVE_CASE_KEY = 'alo_legacy_active_case_volatile' as const;

// --------------------------------------------------------------------------
// 3. CANONICAL ACTOR TYPES & REGISTRY (11 Persona Profile Switcher Compat)
// --------------------------------------------------------------------------

export type ActorRole = 
  | 'COORDINATOR'
  | 'DOCTOR'
  | 'CONSULTANT'
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'RECEPTION'
  | 'PATIENT'
  | 'PHARMACIST'
  | 'LAB_TECHNICIAN'
  | 'RADIOLOGIST'
  | 'NURSE';

export interface CanonicalActor {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly role: ActorRole;
  readonly personaIndex: number; // 0-10 for profile switcher compatibility
}

export const ACTORS = {
  COORDINATOR: {
    id: 'actor_coord_01',
    name: 'Emmanuel Arcon Gonzalez',
    phone: '+966500000003',
    role: 'COORDINATOR',
    personaIndex: 0,
  },
  DOCTOR: {
    id: 'actor_doc_01',
    name: 'Dr. Fahad Al-Harbi',
    phone: '+966502222222',
    role: 'DOCTOR',
    personaIndex: 1,
  },
  CONSULTANT: {
    id: 'actor_cons_01',
    name: 'Dr. V. Prasanth',
    phone: '+919876543210',
    role: 'CONSULTANT',
    personaIndex: 2,
  },
  SUPER_ADMIN: {
    id: 'actor_superadmin_01',
    name: 'Adrian Lewis',
    phone: '+966500000001',
    role: 'SUPER_ADMIN',
    personaIndex: 3,
  },
  HOSPITAL_ADMIN: {
    id: 'actor_hospadmin_01',
    name: 'David Nunez',
    phone: '+966504444444',
    role: 'HOSPITAL_ADMIN',
    personaIndex: 4,
  },
  RECEPTION: {
    id: 'actor_rec_01',
    name: 'Marcus Vance',
    phone: '+966500000009',
    role: 'RECEPTION',
    personaIndex: 5,
  },
} as const satisfies Record<string, Omit<CanonicalActor, 'personaIndex'> & { personaIndex: number }>;

export const ALL_ACTORS: ReadonlyArray<CanonicalActor> = Object.values(ACTORS);

// --------------------------------------------------------------------------
// 4. DESIGN SYSTEM TOKENS (Pinterest-Teal Palette + Cairo Typography)
// --------------------------------------------------------------------------

export const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  textDark: '#1A3C38',
  textLight: '#FFFFFF',
  border: '#B2EBE2',
} as const;

export const TYPOGRAPHY = {
  fontFamilyAr: "'Cairo', sans-serif",
  fontFamilyEn: "'Cairo', sans-serif",
  directionAr: 'rtl' as CSSProperties['direction'],
  directionEn: 'ltr' as CSSProperties['direction'],
} as const;

export interface LayoutDirectionConfig {
  dir: 'rtl' | 'ltr';
  fontFamily: string;
  textAlign: 'right' | 'left';
}

export const getLayoutConfig = (lang: string): LayoutDirectionConfig => {
  const isArabic = lang.startsWith('ar');
  return {
    dir: isArabic ? 'rtl' : 'ltr',
    fontFamily: isArabic ? TYPOGRAPHY.fontFamilyAr : TYPOGRAPHY.fontFamilyEn,
    textAlign: isArabic ? 'right' : 'left',
  };
};

// --------------------------------------------------------------------------
// 5. CLEAN ACCESSIBLE STATE HELPERS (Zero Artificial Gates)
// --------------------------------------------------------------------------

export type DraftIntakePayload = {
  patientId?: string;
  chiefComplaint?: string;
  timestamp: number;
};

export const readDraftIntake = (): DraftIntakePayload | null => {
  try {
    const raw = localStorage.getItem(DRAFT_INTAKE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftIntakePayload;
  } catch {
    return null;
  }
};

export const writeDraftIntake = (payload: DraftIntakePayload): void => {
  try {
    localStorage.setItem(DRAFT_INTAKE_KEY, JSON.stringify(payload));
  } catch {
    // Fail silently in strict production environments without blocking UI
  }
};

export const clearVolatileCaches = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CASE_KEY);
    localStorage.removeItem(USER_SESSION_KEY);
  } catch {
    // Zero artificial gates: do not throw on storage quota/clear failures
  }
};

export const clearAllLocalState = (): void => {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(LANG_KEY);
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem(VIEW_MODE_KEY);
    localStorage.removeItem(DRAFT_INTAKE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CASE_KEY);
  } catch {
    // Clean slate enforcement
  }
};
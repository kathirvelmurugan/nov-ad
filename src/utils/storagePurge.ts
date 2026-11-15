/**
 * Auto-purge utility for legacy localStorage cache keys.
 * Ensures testers immediately get a clean-slate v3.0 workspace
 * without needing to manually clear browser cookies or site data.
 */
export function purgeLegacyStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Keep user preferences, active sessions, and clean slate database keys
      if (
        key === 'alo_lang_preference' ||
        key === 'alo_theme_preference' ||
        key.includes('_clean') ||
        key.includes('session') ||
        key.includes('tenants') ||
        key.includes('users') ||
        key.includes('pins')
      ) {
        continue;
      }

      // Purge any old v2.4, v2.x, or unversioned demo keys
      if (
        key.startsWith('alo_') &&
        !key.endsWith('_v3.0')
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove legacy key ${key}:`, e);
      }
    });

    if (keysToRemove.length > 0) {
      console.info(`[ALO Storage] Purged ${keysToRemove.length} legacy keys for v3.0 clean slate:`, keysToRemove);
    }
  } catch (err) {
    console.warn('[ALO Storage] Legacy purge error:', err);
  }
}

/**
 * Hard-wipe all case-related localStorage keys.
 * Call this after a Super Admin purge or when cleaning the platform.
 * This ensures that even browser-local copies are fully removed.
 */
export function purgeAllCaseStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const CASE_KEYS_TO_WIPE = [
    'alo_clinical_cases_v3.0',
    'alo_active_case_id_v3.0',
    'alo_patient_subview_v3.0',
    'alo_doctor_v24_cases',
    'alo_doctor_v24_active_case_id',
    'alo_cases_v3',
    'alo_cases',
  ];

  // Remove explicit known keys
  CASE_KEYS_TO_WIPE.forEach((key) => {
    try { localStorage.removeItem(key); } catch {}
  });

  // Also sweep for any alo_ keys that contain 'case' in name (belt-and-suspenders)
  try {
    const dynamicKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('alo_') && key.toLowerCase().includes('case')) {
        dynamicKeys.push(key);
      }
    }
    dynamicKeys.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
  } catch {}

  console.info('[ALO Storage] All case-related localStorage keys wiped.');
}

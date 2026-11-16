import React, { createContext, useContext, useEffect, useState } from 'react';
import { setPlatformConfig, getPlatformConfig, type PlatformConfig } from './platformConfig';

interface ContextValue {
  config: PlatformConfig;
  ready: boolean;
  error?: string;
}

const Ctx = createContext<ContextValue>({ config: getPlatformConfig(), ready: false });

/**
 * Fetches GET /api/settings/public once at boot and merges it over defaults.
 * Any failure → defaults, no blocking, no error toast.
 */
export const PlatformConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    const base = getApiBase();
    fetch(`${base}/api/settings/public`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (json?.data) {
          setPlatformConfig(json.data as Partial<PlatformConfig>);
        }
        setReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[PlatformConfigProvider] fetch failed, using defaults:', err.message);
        setError(err.message);
        setReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <Ctx.Provider value={{ config: getPlatformConfig(), ready, error }}>
      {children}
    </Ctx.Provider>
  );
};

/** Hook: use after the provider is mounted. Returns the live merged config. */
export function usePlatformConfig() {
  return useContext(Ctx);
}

function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length > 0 && !parts[0].includes('.')) {
    return `${window.location.origin}/${parts[0]}`;
  }
  return window.location.origin;
}
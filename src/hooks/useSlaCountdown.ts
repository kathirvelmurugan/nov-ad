import { useState, useEffect } from 'react';

interface UseSlaCountdownOptions {
  storageKey: string;
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  active?: boolean;
}

export function useSlaCountdown({
  storageKey,
  initialHours = 24,
  initialMinutes = 0,
  initialSeconds = 0,
  active = true,
}: UseSlaCountdownOptions) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (typeof window === 'undefined') {
      return initialHours * 3600 + initialMinutes * 60 + initialSeconds;
    }
    try {
      const savedEnd = sessionStorage.getItem(storageKey);
      if (savedEnd) {
        const parsed = parseInt(savedEnd, 10);
        if (!isNaN(parsed)) {
          return Math.max(0, Math.floor((parsed - Date.now()) / 1000));
        }
      }
      const totalSecs = initialHours * 3600 + initialMinutes * 60 + initialSeconds;
      const endTimestamp = Date.now() + totalSecs * 1000;
      sessionStorage.setItem(storageKey, endTimestamp.toString());
      return totalSecs;
    } catch {
      return initialHours * 3600 + initialMinutes * 60 + initialSeconds;
    }
  });

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, storageKey]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formatted = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    secondsRemaining,
    formatted,
    hours,
    minutes,
    seconds,
    isExpired: secondsRemaining <= 0,
  };
}

import React from 'react';

/**
 * Country flags as inline SVG.
 * Emoji flags (🇮🇳 / 🇹🇭) are not rendered by Chrome on Windows - they fall back to
 * the letters "IN" / "TH" - so the travel section uses vector flags instead.
 */

interface FlagProps {
  className?: string;
}

const frame = 'inline-flex shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10';

export const IndiaFlag: React.FC<FlagProps> = ({ className = 'h-3.5 w-5' }) => (
  <span className={`${frame} ${className}`} title="India" aria-label="India">
    <svg viewBox="0 0 30 20" className="h-full w-full" aria-hidden="true">
      <rect width="30" height="20" fill="#FFFFFF" />
      <rect width="30" height="6.67" fill="#FF9933" />
      <rect y="13.33" width="30" height="6.67" fill="#138808" />
      <circle cx="15" cy="10" r="2.1" fill="none" stroke="#000080" strokeWidth="0.7" />
      <circle cx="15" cy="10" r="0.45" fill="#000080" />
    </svg>
  </span>
);

export const ThailandFlag: React.FC<FlagProps> = ({ className = 'h-3.5 w-5' }) => (
  <span className={`${frame} ${className}`} title="Thailand" aria-label="Thailand">
    <svg viewBox="0 0 30 20" className="h-full w-full" aria-hidden="true">
      <rect width="30" height="20" fill="#F4F5F8" />
      <rect width="30" height="3.33" fill="#A51931" />
      <rect y="16.67" width="30" height="3.33" fill="#A51931" />
      <rect y="6.67" width="30" height="6.66" fill="#2D2A4A" />
    </svg>
  </span>
);

export const DestinationFlag: React.FC<{ id: string; className?: string }> = ({ id, className }) => {
  if (id === 'india') return <IndiaFlag className={className} />;
  if (id === 'thailand') return <ThailandFlag className={className} />;
  return null;
};

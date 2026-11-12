import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  message?: string;
  id?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ message, id, className = '' }) => {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`mt-1.5 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 animate-fadeIn ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Country, formatPhoneDisplay, sanitizePhoneInput, validatePhone } from '../../utils/phoneValidation';

export interface PhoneFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isAr: boolean;
  /** Jurisdiction is locked per form; the login screen keeps its own flag toggle. */
  country?: Country;
  /** Submit-time error coming from the parent form. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Tailwind ring colour of the host form, e.g. "focus:ring-sky-500". */
  accentClass?: string;
  /** Preserves each screen's existing placeholder wording. */
  placeholder?: string;
}

/**
 * Shared number field: silent while typing, explicit on blur / submit.
 * Errors clear themselves as soon as the value becomes valid.
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  id,
  label,
  value,
  onChange,
  isAr,
  country = 'SA',
  error,
  required = false,
  disabled = false,
  accentClass = 'focus:ring-sky-500',
  placeholder,
}) => {
  const [touched, setTouched] = useState(false);

  const result = validatePhone(value, country);
  const isEmpty = !String(value).replace(/\D/g, '');
  const localIssue = result.isValid || isEmpty ? '' : (isAr ? result.issue?.ar : result.issue?.en) || '';
  const shownError = result.isValid ? '' : touched ? localIssue : error || '';

  const handleChange = (raw: string) => {
    onChange(sanitizePhoneInput(raw));
  };

  const inputClass = shownError
    ? 'border-rose-400 focus:ring-rose-500'
    : `border-slate-200 ${accentClass}`;

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel"
        required={required}
        disabled={disabled}
        value={value}
        placeholder={placeholder || (country === 'IN' ? '+91 XXXXX XXXXX' : '+966 5X XXX XXXX')}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={!!shownError}
        aria-describedby={shownError ? `${id}-error` : undefined}
        className={`w-full px-3 py-2 text-sm bg-white border rounded-xl focus:ring-2 text-slate-900 font-mono ${inputClass}`}
      />
      {shownError ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{shownError}</span>
        </p>
      ) : (
        !isEmpty && (
          <p className="mt-1 text-[10px] font-mono text-slate-400">{formatPhoneDisplay(result.e164, country)}</p>
        )
      )}
    </div>
  );
};

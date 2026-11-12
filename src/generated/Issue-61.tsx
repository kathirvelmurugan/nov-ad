import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  custom?: (value: string) => string | undefined;
  label: { ar: string; en: string };
}

export interface UseFormValidationOptions {
  rules: Record<string, ValidationRule>;
  lang: 'ar' | 'en';
}

export interface UseFormValidationReturn {
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  validate: (values: Record<string, string>) => boolean;
  touchField: (field: string) => void;
  touchAll: () => void;
  clearError: (field: string) => void;
  hasErrors: boolean;
}

export function useFormValidation(options: UseFormValidationOptions): UseFormValidationReturn {
  const { rules, lang } = options;

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const runValidation = useCallback(
    (values: Record<string, string>): Record<string, string | undefined> => {
      const nextErrors: Record<string, string | undefined> = {};

      for (const field of Object.keys(rules)) {
        const rule = rules[field];
        const value = values[field] ?? '';
        const label = rule.label[lang];

        if (rule.required && value.trim() === '') {
          nextErrors[field] =
            lang === 'ar' ? `${label} مطلوب.` : `${label} is required.`;
          continue;
        }

        if (rule.minLength && value.length < rule.minLength) {
          nextErrors[field] =
            lang === 'ar'
              ? `يجب أن يحتوي ${label} على ${rule.minLength} أحرف على الأقل.`
              : `${label} must be at least ${rule.minLength} characters.`;
          continue;
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          nextErrors[field] =
            lang === 'ar'
              ? `يجب ألا يتجاوز ${label} ${rule.maxLength} حرفاً.`
              : `${label} must not exceed ${rule.maxLength} characters.`;
          continue;
        }

        if (rule.custom) {
          const customError = rule.custom(value);
          if (customError) {
            nextErrors[field] = customError;
            continue;
          }
        }

        nextErrors[field] = undefined;
      }

      return nextErrors;
    },
    [rules, lang]
  );

  const validate = useCallback(
    (values: Record<string, string>): boolean => {
      const nextErrors = runValidation(values);
      setErrors(nextErrors);

      const isValid = Object.values(nextErrors).every((err) => err === undefined);
      return isValid;
    },
    [runValidation]
  );

  const touchField = useCallback((field: string): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const touchAll = useCallback((): void => {
    const allTouched: Record<string, boolean> = {};
    for (const field of Object.keys(rules)) {
      allTouched[field] = true;
    }
    setTouched(allTouched);
  }, [rules]);

  const clearError = useCallback((field: string): void => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const hasErrors = useMemo(
    () => Object.values(errors).some((err) => err !== undefined),
    [errors]
  );

  return {
    errors,
    touched,
    validate,
    touchField,
    touchAll,
    clearError,
    hasErrors,
  };
}

import React, { useEffect, useRef } from 'react';

export interface FieldErrorProps {
  message: string | undefined;
  id: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ message, id }) => {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 font-cairo"
    >
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
};

export interface FormErrorSummaryField {
  key: string;
  label: string;
  anchorId: string;
}

export interface FormErrorSummaryProps {
  errors: Record<string, string | undefined>;
  fields: FormErrorSummaryField[];
  lang: 'ar' | 'en';
  visible: boolean;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  fields,
  lang,
  visible,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const invalidFields = useMemo(() => {
    return fields.filter((field) => errors[field.key] !== undefined);
  }, [fields, errors]);

  useEffect(() => {
    if (visible && invalidFields.length > 0 && containerRef.current) {
      containerRef.current.focus();
    }
  }, [visible, invalidFields.length]);

  if (!visible || invalidFields.length === 0) return null;

  const count = invalidFields.length;
  const headingText =
    lang === 'ar'
      ? `${count} حقول تحتاج مراجعة قبل الإرسال`
      : `${count} field${count > 1 ? 's' : ''} need attention before submitting`;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchorId: string) => {
    e.preventDefault();
    const target = document.getElementById(anchorId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      role="alert"
      tabIndex={-1}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 p-4 shadow-sm outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:bg-red-950/30 dark:border-red-700 font-cairo"
    >
      <h3 className="text-sm font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
        <svg
          className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        {headingText}
      </h3>
      <ul className="list-disc space-y-1.5 ps-5 text-sm">
        {invalidFields.map((field) => (
          <li key={field.key}>
            <a
              href={`#${field.anchorId}`}
              onClick={(e) => handleAnchorClick(e, field.anchorId)}
              className="text-red-700 underline decoration-red-400 underline-offset-2 transition-colors hover:text-red-900 hover:decoration-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-sm dark:text-red-300 dark:hover:text-red-100"
            >
              {field.label}
            </a>
            <span className="text-red-600 dark:text-red-400 ms-1.5">
              — {errors[field.key]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { FieldError } from './FieldError';
export type { FieldErrorProps } from './FieldError';
export { FormErrorSummary } from './FormErrorSummary';
export type { FormErrorSummaryProps, FormErrorSummaryField } from './FormErrorSummary';
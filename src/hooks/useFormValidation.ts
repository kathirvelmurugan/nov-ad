import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
  label: { ar: string; en: string };
}

export interface UseFormValidationOptions {
  rules: Record<string, ValidationRule>;
  lang?: 'ar' | 'en';
}

export function useFormValidation({ rules, lang = 'ar' }: UseFormValidationOptions) {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (field: string, value: any): string | undefined => {
      const rule = rules[field];
      if (!rule) return undefined;

      const isAr = lang === 'ar';
      const label = isAr ? rule.label.ar : rule.label.en;
      const strVal = typeof value === 'string' ? value.trim() : value;

      // Required check
      if (rule.required) {
        if (strVal === undefined || strVal === null || strVal === '' || strVal === false) {
          return isAr ? `${label} مطلوب.` : `${label} is required.`;
        }
      }

      // If optional and empty, skip further checks
      if (!strVal && strVal !== 0 && strVal !== false) {
        return undefined;
      }

      // MinLength check
      if (rule.minLength !== undefined && typeof strVal === 'string' && strVal.length < rule.minLength) {
        return isAr
          ? `يجب أن يحتوي ${label} على ${rule.minLength} أحرف على الأقل.`
          : `${label} must be at least ${rule.minLength} characters.`;
      }

      // MaxLength check
      if (rule.maxLength !== undefined && typeof strVal === 'string' && strVal.length > rule.maxLength) {
        return isAr
          ? `يجب ألا يتجاوز ${label} ${rule.maxLength} حرفاً.`
          : `${label} must not exceed ${rule.maxLength} characters.`;
      }

      // Numeric Min
      if (rule.min !== undefined && Number(value) < rule.min) {
        return isAr
          ? `أدنى قيمة مسموحة لـ ${label} هي ${rule.min}.`
          : `${label} minimum value is ${rule.min}.`;
      }

      // Numeric Max
      if (rule.max !== undefined && Number(value) > rule.max) {
        return isAr
          ? `أقصى قيمة مسموحة لـ ${label} هي ${rule.max}.`
          : `${label} maximum value is ${rule.max}.`;
      }

      // Pattern check
      if (rule.pattern && typeof strVal === 'string' && !rule.pattern.test(strVal)) {
        return isAr ? `صيغة ${label} غير صحيحة.` : `Invalid format for ${label}.`;
      }

      // Custom check
      if (rule.custom) {
        const customErr = rule.custom(value);
        if (customErr) return customErr;
      }

      return undefined;
    },
    [rules, lang]
  );

  const validateAll = useCallback(
    (values: Record<string, any>): boolean => {
      const newErrors: Record<string, string | undefined> = {};
      const newTouched: Record<string, boolean> = {};
      let isValid = true;

      for (const field of Object.keys(rules)) {
        newTouched[field] = true;
        const err = validateField(field, values[field]);
        if (err) {
          newErrors[field] = err;
          isValid = false;
        }
      }

      setErrors(newErrors);
      setTouched(newTouched);
      return isValid;
    },
    [rules, validateField]
  );

  const touchField = useCallback(
    (field: string, value?: any) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (value !== undefined) {
        const err = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: err }));
      }
    },
    [validateField]
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const hasErrors = Object.values(errors).some((e) => !!e);

  return {
    errors,
    touched,
    validateField,
    validateAll,
    touchField,
    clearError,
    clearAllErrors,
    hasErrors,
  };
}

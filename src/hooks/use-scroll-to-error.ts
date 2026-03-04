import { useEffect } from 'react';
import type { FieldErrors } from 'react-hook-form';

const flattenErrors = (errors: FieldErrors, prefix = ''): string[] => {
  const keys: string[] = [];
  for (const key in errors) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = errors[key] as any;
    if (err?.message) {
      keys.push(fullKey);
    } else if (typeof err === 'object') {
      keys.push(...flattenErrors(err, fullKey));
    }
  }
  return keys;
};

export const useScrollToError = (errors: FieldErrors, isSubmitting: boolean) => {
  useEffect(() => {
    if (!isSubmitting) return;
    const errorKeys = flattenErrors(errors);
    if (errorKeys.length === 0) return;

    const firstKey = errorKeys[0];
    const selector = `[name="${firstKey}"], [data-name="${firstKey}"]`;
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
    }
  }, [errors, isSubmitting]);
};

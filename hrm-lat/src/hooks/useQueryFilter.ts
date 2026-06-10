import { useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

interface UseQueryFilterOptions {
  replace?: boolean;
}

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function cleanSearch<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => !isEmptyValue(v))) as Partial<T>;
}

export function useQueryFilter<T extends Record<string, unknown>>(
  options: UseQueryFilterOptions = {},
) {
  const { replace = false } = options;
  const navigate = useNavigate();
  const filters = useSearch({ strict: false }) as T;

  const update = useCallback(
    (updater: (prev: T) => T | Partial<T>) => {
      navigate({
        search: (prev) => cleanSearch(updater(prev as T)),
        replace,
      });
    },
    [navigate, replace],
  );

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K] | undefined) =>
      update((prev) => ({ ...prev, [key]: value })),
    [update],
  );

  const setFilters = useCallback(
    (updates: Partial<T>) => update((prev) => ({ ...prev, ...updates })),
    [update],
  );

  const removeFilter = useCallback(
    <K extends keyof T>(key: K) =>
      update((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest as Partial<T>;
      }),
    [update],
  );

  const removeFilters = useCallback(
    <K extends keyof T>(keys: K[]) =>
      update((prev) => {
        const next = { ...prev };
        keys.forEach((key) => delete next[key]);
        return next;
      }),
    [update],
  );

  const clearFilters = useCallback(() => navigate({ search: {}, replace }), [navigate, replace]);

  const toggleFilter = useCallback(
    <K extends keyof T>(key: K) => update((prev) => ({ ...prev, [key]: !prev[key] })),
    [update],
  );

  const resetFilters = useCallback((defaults: Partial<T>) => update(() => defaults), [update]);

  return {
    filters,
    setFilter,
    setFilters,
    removeFilter,
    removeFilters,
    clearFilters,
    toggleFilter,
    resetFilters,
  } as const;
}

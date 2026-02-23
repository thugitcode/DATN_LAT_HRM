import { useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

interface UseQueryFilterOptions {
  replace?: boolean;
}

export const useQueryFilter = <T extends Record<string, unknown>>(
  options: UseQueryFilterOptions = {},
) => {
  const { replace = false } = options;
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as T;

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K] | undefined) => {
      navigate({
        search: (prev) => {
          if (value === undefined || value === null || value === '') {
            const { [key as string]: _, ...rest } = prev;
            return rest;
          }

          return {
            ...prev,
            [key]: value,
          };
        },
        replace,
      });
    },
    [navigate, replace],
  );

  const setFilters = useCallback(
    (updates: Partial<T>) => {
      navigate({
        search: (prev) => ({
          ...prev,
          ...updates,
        }),
        replace,
      });
    },
    [navigate, replace],
  );

  const removeFilter = useCallback(
    <K extends keyof T>(key: K) => {
      navigate({
        search: (prev) => {
          const { [key as string]: _, ...rest } = prev;
          return rest;
        },
        replace,
      });
    },
    [navigate, replace],
  );

  const removeFilters = useCallback(
    <K extends keyof T>(keys: K[]) => {
      navigate({
        search: (prev) => {
          const newSearch = { ...prev };
          keys.forEach((key) => {
            delete newSearch[key as string];
          });
          return newSearch;
        },
        replace,
      });
    },
    [navigate, replace],
  );

  const clearFilters = useCallback(() => {
    navigate({
      search: {},
      replace,
    });
  }, [navigate, replace]);

  const toggleFilter = useCallback(
    <K extends keyof T>(key: K) => {
      navigate({
        search: (prev) => ({
          ...prev,
          [key]: !prev[key as string],
        }),
        replace,
      });
    },
    [navigate, replace],
  );

  return {
    filters: search,
    setFilter,
    setFilters,
    removeFilter,
    removeFilters,
    clearFilters,
    toggleFilter,
  };
};

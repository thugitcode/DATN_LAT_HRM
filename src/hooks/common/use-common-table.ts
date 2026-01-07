/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { QueryOptionsListResponse } from '@/types';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@/lib/constants';
import type { QueryOptionsTable } from '@/lib/query-options-table';

type InferQueryOptionsTable<TFn> = TFn extends (
  ...args: any[]
) => QueryOptionsTable<infer T, infer R, infer M>
  ? { data: T; filters: R; meta: M }
  : never;

type InferParams<TFn> = TFn extends (params: infer P) => any ? P : never;

type InferFilters<TFn> = InferParams<TFn> extends { filters: infer F } ? F : never;

export type UseCommonTableProps<
  TQueryOptionsFn extends (params: {
    page: number;
    limit: number;
    filters: Record<string, any>;
  }) => QueryOptionsTable<any, any, any>,
> = {
  defaultFilters?: Partial<InferFilters<TQueryOptionsFn>>;
  defaultPagination?: {
    page?: number;
    limit?: number;
  };
  queryOptions: TQueryOptionsFn;
};

export const useCommonTable = <
  TQueryOptionsFn extends (params: {
    page: number;
    limit: number;
    filters: Record<string, any>;
  }) => QueryOptionsTable<any, any, any>,
>({
  defaultFilters,
  defaultPagination,
  queryOptions,
}: UseCommonTableProps<TQueryOptionsFn>) => {
  type Inferred = InferQueryOptionsTable<TQueryOptionsFn>;
  type T = Inferred['data'];
  type R = InferFilters<TQueryOptionsFn>;
  type M = Inferred['meta'];

  const [filters, setFilters] = useState<Partial<R>>(defaultFilters ?? ({} as Partial<R>));
  const [page, setPage] = useState(defaultPagination?.page ?? DEFAULT_PAGE);
  const [limit, setLimit] = useState(defaultPagination?.limit ?? DEFAULT_LIMIT);

  const {
    data: response,
    isFetching,
    isLoading,
    refetch,
  } = useQuery(queryOptions({ page, limit, filters } as InferParams<TQueryOptionsFn>));

  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);

  const onFilters = useCallback((values: Partial<R>) => {
    setPage(1);
    setFilters(values);
  }, []);

  return {
    page,
    limit,
    setPage,
    setLimit,
    data: (response as QueryOptionsListResponse<T, M> | undefined)?.data ?? [],
    total: (response as QueryOptionsListResponse<T, M> | undefined)?.pagination.total ?? 0,
    meta: (response as QueryOptionsListResponse<T, M> | undefined)?.meta ?? undefined,
    fetching: isFetching,
    loading: isLoading,
    refetch,
    filters,
    onFilters,
    selectedRecords,
    setSelectedRecords,
  };
};

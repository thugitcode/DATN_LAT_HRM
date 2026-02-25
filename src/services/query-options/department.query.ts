import { queryOptions } from '@tanstack/react-query';

import type { PaginationParams } from '@/types';

import { departmentService } from '../deparment.service';

export const departmentKeys = {
  all: ['department'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...departmentKeys.lists(), params] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...departmentKeys.details(), id] as const,
} as const;

export const departmentQueryOptions = {
  list: (params?: PaginationParams) =>
    queryOptions({
      queryKey: departmentKeys.list(params),
      queryFn: () => departmentService.getAll(params),
    }),

  detail: (id: string | number) =>
    queryOptions({
      queryKey: departmentKeys.detail(id),
      queryFn: () => departmentService.getById(id),
      enabled: !!id,
    }),
} as const;

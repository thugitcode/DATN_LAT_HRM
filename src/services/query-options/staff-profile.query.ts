import { queryOptions } from '@tanstack/react-query';

import type { PaginationParams } from '@/types';

import { staffProfileService } from '../staff-profile.service';

export const staffProfileKeys = {
  all: ['staffProfile'] as const,
  lists: () => [...staffProfileKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...staffProfileKeys.lists(), params] as const,
  details: () => [...staffProfileKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...staffProfileKeys.details(), id] as const,
} as const;

export const staffProfileQueryOptions = {
  list: (params?: PaginationParams) =>
    queryOptions({
      queryKey: staffProfileKeys.list(params),
      queryFn: () => staffProfileService.getAll(params),
    }),

  detail: (id: string | number) =>
    queryOptions({
      queryKey: staffProfileKeys.detail(id),
      queryFn: () => staffProfileService.getById(id),
      enabled: !!id,
    }),
} as const;
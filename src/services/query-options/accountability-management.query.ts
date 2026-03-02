import { queryOptions } from '@tanstack/react-query';

import type { AttendanceExplanationFilters } from '@/features/timekeeping-shift-scheduling/accountability-management/types';

import { accountabilityManagementService } from '../accountability-management.service';

export const accountabilityManagementKeys = {
  all: ['accountability-management'] as const,
  lists: () => [...accountabilityManagementKeys.all, 'list'] as const,
  list: (params?: AttendanceExplanationFilters) =>
    [...accountabilityManagementKeys.lists(), params] as const,
  details: () => [...accountabilityManagementKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountabilityManagementKeys.details(), id] as const,
} as const;

export const accountabilityManagementQueryOptions = {
  list: (params?: AttendanceExplanationFilters) =>
    queryOptions({
      queryKey: accountabilityManagementKeys.list(params),
      queryFn: () => accountabilityManagementService.getAll(params),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: accountabilityManagementKeys.detail(id),
      queryFn: () => accountabilityManagementService.getDetail(id),
      enabled: !!id,
    }),
} as const;

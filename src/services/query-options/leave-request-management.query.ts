import { queryOptions } from '@tanstack/react-query';

import type { LeaveRequestManagementFilters } from '@/features/leave-management/leave-request-management/type';

import { leaveRequestManagementService } from '../leave-request-management.service';

export const leaveRequestManagementKeys = {
  all: ['leaveRequest-management'] as const,
  lists: () => [...leaveRequestManagementKeys.all, 'list'] as const,
  list: (params?: LeaveRequestManagementFilters) =>
    [...leaveRequestManagementKeys.lists(), params] as const,
  details: () => [...leaveRequestManagementKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaveRequestManagementKeys.details(), id] as const,
} as const;

export const leaveRequestManagementQueryOptions = {
  list: (params?: LeaveRequestManagementFilters) =>
    queryOptions({
      queryKey: leaveRequestManagementKeys.list(params),
      queryFn: () => leaveRequestManagementService.getAll(params),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: leaveRequestManagementKeys.detail(id),
      queryFn: () => leaveRequestManagementService.getDetail(id),
      enabled: !!id,
    }),
} as const;

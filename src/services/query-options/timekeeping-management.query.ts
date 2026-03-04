import { mutationOptions, queryOptions, useMutation } from '@tanstack/react-query';
import { timekeepingManagementService } from '@/services/timekeeping-management.service';

import type { StaffParams } from '@/types/staff.type';

export const timekeepingManagementKeys = {
  all: ['timekeeping-management'] as const,
  lists: () => [...timekeepingManagementKeys.all, 'list'] as const,
  list: (params?: StaffParams) => [...timekeepingManagementKeys.lists(), params] as const,
  details: () => [...timekeepingManagementKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...timekeepingManagementKeys.details(), id] as const,
  attendanceTable: (params?: StaffParams) =>
    [...timekeepingManagementKeys.all, 'attendance-table', params] as const,
  attendanceByHours: (params?: StaffParams) =>
    [...timekeepingManagementKeys.all, 'attendance-by-hours', params] as const,
} as const;

export const timekeepingManagementQueryOptions = {
  attendanceTable: (params?: StaffParams) =>
    queryOptions({
      queryKey: timekeepingManagementKeys.attendanceTable(params),
      queryFn: () => timekeepingManagementService.getAttendanceTable(params),
      throwOnError: true,
    }),

  attendanceByHours: (params?: StaffParams) =>
    queryOptions({
      queryKey: timekeepingManagementKeys.attendanceByHours(params),
      queryFn: () => timekeepingManagementService.getAttendanceByHours(params),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: timekeepingManagementKeys.detail(id),
      queryFn: () => timekeepingManagementService.getDetail(id),
      enabled: !!id,
      staleTime: 0,
    }),
} as const;

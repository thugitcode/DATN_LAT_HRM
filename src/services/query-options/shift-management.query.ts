import { queryOptions } from '@tanstack/react-query';
import { shiftManagementService } from '@/services/shift-management.service';

import type { StaffParams } from '@/types/staff.type';

export const shiftManagementKeys = {
  all: ['shift-management'] as const,
  lists: () => [...shiftManagementKeys.all, 'list'] as const,
  grids: () => [...shiftManagementKeys.all, 'grid'] as const,
  list: (params?: StaffParams) => [...shiftManagementKeys.lists(), params] as const,
  grid: (params?: StaffParams) => [...shiftManagementKeys.grids(), params] as const,
  staffDailyAttendace: (params?: StaffParams) => ['staff-daily-attendance', params] as const,
  details: () => [...shiftManagementKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...shiftManagementKeys.details(), id] as const,
} as const;

export const shiftManagementQueryOptions = {
  list: (params?: StaffParams) =>
    queryOptions({
      queryKey: shiftManagementKeys.list(params),
      queryFn: () => shiftManagementService.getAll(params),
    }),

  grid: (params?: StaffParams) =>
    queryOptions({
      queryKey: shiftManagementKeys.grid(params),
      queryFn: () => shiftManagementService.getAllGrid(params),
    }),

  staffDailyAttendance: (params?: StaffParams) =>
    queryOptions({
      queryKey: shiftManagementKeys.staffDailyAttendace(params),
      queryFn: () => shiftManagementService.getStaffDailyAttendance(params),
    }),

  detail: (id: string | number) =>
    queryOptions({
      queryKey: shiftManagementKeys.detail(id),
      queryFn: () => shiftManagementService.getDetail(id),
      enabled: !!id,
    }),
} as const;

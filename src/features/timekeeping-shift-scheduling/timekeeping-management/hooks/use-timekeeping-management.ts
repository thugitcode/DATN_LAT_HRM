import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payrollPerriodsService } from '@/services/payroll-management/payroll-periods.service';
import { configurationQueryOptions } from '@/services/query-options/configuration.query';
import { payrollPeriodsKeys } from '@/services/query-options/payroll-management/payroll-periods.query';
import {
  timekeepingManagementKeys,
  timekeepingManagementQueryOptions,
} from '@/services/query-options/timekeeping-management.query';
import { timekeepingManagementService } from '@/services/timekeeping-management.service';
import { addToast } from '@heroui/react';

import type { ShiftManagementParams } from '@/types/shift-management.type';

import type { shiftDetailsFormValues } from '../schemas/shift-details.schema';
import type { ApprovePayload } from '../types/timekeeping-management.type';

export function useAttendanceTable(params?: ShiftManagementParams) {
  return useQuery(timekeepingManagementQueryOptions.attendanceTable(params));
}

export function useAttendanceByHours(params?: ShiftManagementParams) {
  return useQuery(timekeepingManagementQueryOptions.attendanceByHours(params));
}

export function useAttendanceDetail(id: string) {
  return useQuery(timekeepingManagementQueryOptions.detail(id));
}

export function useConfiguration(params?: ShiftManagementParams) {
  return useQuery(configurationQueryOptions.list(params));
}

export function useUpdateAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string } & shiftDetailsFormValues) =>
      timekeepingManagementService.updateAttendance(params.id, params),

    // Tùy chọn sau khi thành công
    onSuccess: () => {
      // refresh lại bảng công
      // queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({
        queryKey: timekeepingManagementKeys.all,
      });
    },

    onError: (error) => {
      console.error('Update attendance failed', error);
    },
  });
}

export function useCraetePeriodsMutation(month: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApprovePayload) => payrollPerriodsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payrollPeriodsKeys.status(month),
      });

      addToast({
        description: 'Duyệt bảng công thành công.',
        color: 'success',
      });
    },
  });
}

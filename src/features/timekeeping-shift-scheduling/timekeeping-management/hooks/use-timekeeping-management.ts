import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timekeepingManagementQueryOptions } from '@/services/query-options/timekeeping-management.query';
import { timekeepingManagementService } from '@/services/timekeeping-management.service';

import type { ShiftManagementParams } from '@/types/shift-management.type';

import type { shiftDetailsFormValues } from '../schemas/shift-details.schema';

export function useAttendanceTable(params?: ShiftManagementParams) {
  return useQuery(timekeepingManagementQueryOptions.attendanceTable(params));
}

export function useAttendanceByHours(params?: ShiftManagementParams) {
  return useQuery(timekeepingManagementQueryOptions.attendanceByHours(params));
}

export function useAttendanceDetail(id: string) {
  return useQuery(timekeepingManagementQueryOptions.detail(id));
}

export function useUpdateAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string } & shiftDetailsFormValues) =>
      timekeepingManagementService.updateAttendance(params.id, params),

    // Tùy chọn sau khi thành công
    onSuccess: () => {
      // refresh lại bảng công
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },

    onError: (error) => {
      console.error('Update attendance failed', error);
    },
  });
}

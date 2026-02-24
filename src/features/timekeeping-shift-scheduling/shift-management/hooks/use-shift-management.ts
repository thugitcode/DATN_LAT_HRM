import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  shiftManagementKeys,
  shiftManagementQueryOptions,
} from '@/services/query-options/shift-management.query';
import { shiftManagementService } from '@/services/shift-management.service';
import { useDrawer } from '@/store/useDrawer';
import { addToast } from '@heroui/react';

import type {
  CreateStaffSchedule,
  ShiftManagementParams,
  UpdateStaffSchedule,
} from '@/types/shift-management.type';
import { normalizeAxiosError } from '@/lib/axios';

export function useShiftManagementList(params?: ShiftManagementParams) {
  return useQuery(shiftManagementQueryOptions.list(params));
}

export function useShiftManagementDetail(id: string | number) {
  return useQuery(shiftManagementQueryOptions.detail(id));
}

export function useCreateShiftManagement() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: (data: CreateStaffSchedule) => shiftManagementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftManagementKeys.lists() });
      addToast({
        title: 'Phân ca làm việc thành công',
        color: 'success',
      });
      closedDrawer();
    },
    onError: (error: unknown) => {
      const { message } = normalizeAxiosError(error);
      addToast({
        title: message,
        color: 'danger',
      });
    },
  });
}

export function useDeleteShiftManagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => shiftManagementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftManagementKeys.lists() });
    },
  });
}

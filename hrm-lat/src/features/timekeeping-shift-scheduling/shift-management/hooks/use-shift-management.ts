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
  UpdateShift,
} from '@/types/shift-management.type';
import { normalizeAxiosError } from '@/lib/axios';

export function useShiftManagementList(params?: ShiftManagementParams) {
  return useQuery(shiftManagementQueryOptions.list(params));
}

export function useShiftManagementGrid(params?: ShiftManagementParams) {
  return useQuery(shiftManagementQueryOptions.grid(params));
}

export function useStaffDailyAttendance(params?: ShiftManagementParams & { staffId: string }) {
  return useQuery(shiftManagementQueryOptions.staffDailyAttendance(params));
}

export function useShiftManagementDetail(id: string | number) {
  return useQuery(shiftManagementQueryOptions.detail(id));
}

export function useCreateShiftManagement() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: (data: CreateStaffSchedule | CreateStaffSchedule[]) => {
      const payloads = Array.isArray(data) ? data : [data];
      return Promise.all(payloads.map((p) => shiftManagementService.create(p)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shiftManagementKeys.grids() });
      addToast({
        description: 'Thêm mới phân ca thành công.',
        color: 'success',
      });
      closedDrawer();
    },
    onError: (error: unknown) => {
      const { message } = normalizeAxiosError(error);
      addToast({
        description: message,
        color: 'danger',
      });
    },
  });
}

export function useUpdateShiftManagement() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: ({ id, data }: UpdateShift) => shiftManagementService.update({ id, data }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: shiftManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shiftManagementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: shiftManagementKeys.grids() });

      addToast({
        description: 'Thay đổi phân ca thành công.',
        color: 'success',
      });
      closedDrawer();
    },
    onError: (error: unknown) => {
      const { message } = normalizeAxiosError(error);
      addToast({
        description: message,
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

export function useImportShiftManagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffSchedule | CreateStaffSchedule[]) => {
      const payloads = Array.isArray(data) ? data : [data];
      return Promise.all(payloads.map((p) => shiftManagementService.create(p)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftManagementKeys.lists() });
      addToast({
        description: 'Import phân ca thành công.',
        color: 'success',
      });
    },
    onError: (error: unknown) => {
      const { message } = normalizeAxiosError(error);
      addToast({
        description: message,
        color: 'danger',
      });
    },
  });
}

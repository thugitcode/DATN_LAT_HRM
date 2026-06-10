import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountabilityManagementService } from '@/services/accountability-management.service';
import {
  accountabilityManagementKeys,
  accountabilityManagementQueryOptions,
} from '@/services/query-options/accountability-management.query';
import { addToast } from '@heroui/react';

import { normalizeAxiosError } from '@/lib/axios';
import type {
  ApproveAttendancePayload,
  AttendanceExplanationFilters,
  BulkApprovePayload,
  RejectAttendancePayload,
} from '@/features/timekeeping-shift-scheduling/accountability-management/types';

export function useAccountabilityManagementList(params?: AttendanceExplanationFilters) {
  return useQuery(accountabilityManagementQueryOptions.list(params));
}

export function useAccountabilityManagementDetail(id: string) {
  return useQuery(accountabilityManagementQueryOptions.detail(id));
}

export function useApproveAccountability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: ApproveAttendancePayload }) =>
      accountabilityManagementService.approve(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountabilityManagementKeys.lists() });
      addToast({
        description: 'Duyệt giải trình công thành công.',
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

export function useManagerApproveAccountability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: ApproveAttendancePayload }) =>
      accountabilityManagementService.managerApprove(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountabilityManagementKeys.lists() });
      addToast({
        description: 'Quản lý duyệt giải trình công thành công.',
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

export function useRejectAccountability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectAttendancePayload }) =>
      accountabilityManagementService.reject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountabilityManagementKeys.lists() });
      addToast({
        description: 'Từ chối giải trình công thành công.',
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

export function useBulkApproveAccountability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkApprovePayload) =>
      accountabilityManagementService.bulkApprove(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountabilityManagementKeys.lists() });
      addToast({
        description: 'Duyệt hàng loạt giải trình công thành công.',
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

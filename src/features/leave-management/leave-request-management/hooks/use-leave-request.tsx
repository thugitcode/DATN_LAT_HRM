import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaveRequestManagementService } from '@/services/leave-request-management.service';
import {
  leaveRequestManagementKeys,
  leaveRequestManagementQueryOptions,
} from '@/services/query-options/leave-request-management.query';
import { addToast } from '@heroui/react';

import { normalizeAxiosError } from '@/lib/axios';

import type {
  ApproveLeaveRequestPayload,
  LeaveRequestManagementFilters,
  RejectLeaveRequestPayload,
} from '../type';

export function useLeaveRequestManagementList(params?: LeaveRequestManagementFilters) {
  return useQuery(leaveRequestManagementQueryOptions.list(params));
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: ApproveLeaveRequestPayload }) =>
      leaveRequestManagementService.approve(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveRequestManagementKeys.lists() });

      addToast({
        description: 'Duyệt đăng ký nghỉ thành công.',
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

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectLeaveRequestPayload }) =>
      leaveRequestManagementService.reject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveRequestManagementKeys.lists() });
      addToast({
        description: 'Từ chối đăng ký nghỉ công thành công.',
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

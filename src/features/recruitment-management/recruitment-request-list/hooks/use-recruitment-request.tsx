import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recruitmentRequestService } from '@/services/recruitment-request.service';
import {
  recruitmentRequestKeys,
  recruitmentRequestQueryOptions,
} from '@/services/query-options/recruitment-request.query';
import { addToast } from '@heroui/react';

import { normalizeAxiosError } from '@/lib/axios';

import type {
  ApproveRecruitmentRequestPayload,
  RecruitmentRequestFilters,
  RejectRecruitmentRequestPayload,
} from '../type';

export function useRecruitmentRequestList(params?: RecruitmentRequestFilters) {
  return useQuery(recruitmentRequestQueryOptions.list(params));
}

export function useApproveRecruitmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: ApproveRecruitmentRequestPayload }) =>
      recruitmentRequestService.approve(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.lists() });

      addToast({
        description: 'Duyệt yêu cầu tuyển dụng thành công.',
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

export function useRejectRecruitmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectRecruitmentRequestPayload }) =>
      recruitmentRequestService.reject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.lists() });
      addToast({
        description: 'Từ chối yêu cầu tuyển dụng thành công.',
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

export function useCloseRecruitmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentRequestService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.lists() });
      addToast({
        description: 'Đóng yêu cầu tuyển dụng thành công.',
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recruitmentRequestService } from '@/services/recruitment-request.service';
import {
  recruitmentRequestKeys,
  recruitmentRequestQueryOptions,
} from '@/services/query-options/recruitment-request.query';
import { addToast } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

import { normalizeAxiosError } from '@/lib/axios';

import type {
  ApproveRecruitmentRequestPayload,
  RecruitmentRequestFilters,
  RejectRecruitmentRequestPayload,
} from '../types/type';

export function useRecruitmentRequestList(
  params?: RecruitmentRequestFilters,
  enabled = true,
) {
  return useQuery({
    ...recruitmentRequestQueryOptions.list(params),
    enabled,
  });
}

export function useRecruitmentRequestSummary(params?: RecruitmentRequestFilters) {
  return useQuery(recruitmentRequestQueryOptions.summary(params));
}

export function useApproveRecruitmentRequest() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: ApproveRecruitmentRequestPayload }) =>
      recruitmentRequestService.approve(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.summary() });

      addToast({
        description: t('recruitment_request.toast.approve_success'),
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
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectRecruitmentRequestPayload }) =>
      recruitmentRequestService.reject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.summary() });
      addToast({
        description: t('recruitment_request.toast.reject_success'),
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
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return useMutation({
    mutationFn: (id: string) => recruitmentRequestService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.summary() });
      addToast({
        description: t('recruitment_request.toast.close_success'),
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

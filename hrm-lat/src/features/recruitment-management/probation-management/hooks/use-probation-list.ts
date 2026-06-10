import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToast } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { normalizeAxiosError } from '@/lib/axios';
import { probationKeys, probationQueryOptions } from '@/services/query-options/recruitment-management/probation.query';
import { probationService } from '@/services/recruitment-management/probation.service';

import type { ProbationFilters } from '../types/probation.type';

export function useProbationList(params?: ProbationFilters) {
  return useQuery(probationQueryOptions.list(params));
}

function useProbationMutation(
  mutationFn: (id: string) => Promise<unknown>,
  successKey: string,
  errorKey: string,
) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: probationKeys.lists() });
      addToast({ description: t(successKey as any), color: 'success' });
    },
    onError: (error: unknown) => {
      const { message } = normalizeAxiosError(error);
      addToast({ description: message || t(errorKey as any), color: 'danger' });
    },
  });
}

export function useProbationResendInvitation() {
  return useProbationMutation(
    (id) => probationService.resendInvitation(id),
    'probation.toast.resend_invitation_success',
    'probation.toast.resend_invitation_error',
  );
}

export function useProbationEvaluate() {
  return useProbationMutation(
    (id) => probationService.evaluate(id),
    'probation.toast.evaluate_success',
    'probation.toast.evaluate_error',
  );
}

export function useProbationExtend() {
  return useProbationMutation(
    (id) => probationService.extend(id),
    'probation.toast.extend_success',
    'probation.toast.extend_error',
  );
}

export function useProbationEndEarly() {
  return useProbationMutation(
    (id) => probationService.endEarly(id),
    'probation.toast.end_early_success',
    'probation.toast.end_early_error',
  );
}

export function useProbationAcceptOfficial() {
  return useProbationMutation(
    (id) => probationService.acceptOfficial(id),
    'probation.toast.accept_official_success',
    'probation.toast.accept_official_error',
  );
}

export function useProbationUpdateExtension() {
  return useProbationMutation(
    (id) => probationService.updateExtension(id),
    'probation.toast.update_extension_success',
    'probation.toast.update_extension_error',
  );
}

export function useProbationEnd() {
  return useProbationMutation(
    (id) => probationService.endProbation(id),
    'probation.toast.end_success',
    'probation.toast.end_error',
  );
}

export function useProbationCancelAcceptance() {
  return useProbationMutation(
    (id) => probationService.cancelAcceptance(id),
    'probation.toast.cancel_acceptance_success',
    'probation.toast.cancel_acceptance_error',
  );
}

export function useProbationEvaluations(id: string) {
  return useQuery(probationQueryOptions.evaluations(id));
}

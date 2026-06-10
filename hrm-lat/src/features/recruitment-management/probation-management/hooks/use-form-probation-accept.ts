import { zodResolver } from '@hookform/resolvers/zod';
import { addToast } from '@heroui/react';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { NAMESPACES } from '@/i18n/constants';
import { normalizeAxiosError } from '@/lib/axios';
import { probationKeys } from '@/services/query-options/recruitment-management/probation.query';
import { probationService } from '@/services/recruitment-management/probation.service';

import {
  probationAcceptSchema,
  PROBATION_ACCEPT_DEFAULT_VALUES,
  type ProbationAcceptFormValues,
} from '../schemas/probation-accept.schema';

interface UseFormProbationAcceptParams {
  probationId: string;
  employeeCode?: string;
  onSuccess?: () => void;
}

export function useFormProbationAccept({
  probationId,
  onSuccess,
}: UseFormProbationAcceptParams) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();

  const methods = useForm<ProbationAcceptFormValues>({
    resolver: zodResolver(probationAcceptSchema(t as any)) as Resolver<ProbationAcceptFormValues>,
    defaultValues: PROBATION_ACCEPT_DEFAULT_VALUES,
    mode: 'onChange',
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: Record<string, unknown> = {
        officialStartDate: data.officialStartDate,
        departmentId: data.departmentId,
        contractType: data.contractType,
        basicSalary: data.basicSalary ? Number(data.basicSalary) : undefined,
        email: data.email || undefined,
        systemPermissions: data.systemPermissions || undefined,
        onboardingDocumentsCompleted: data.onboardingDocumentsCompleted,
        onboardingContractSigned: data.onboardingContractSigned,
        onboardingSystemAccountCreated: data.onboardingSystemAccountCreated,
        onboardingStaffCardIssued: data.onboardingStaffCardIssued,
        onboardingUniformIssued: data.onboardingUniformIssued,
        onboardingOrientationCompleted: data.onboardingOrientationCompleted,
      };

      await probationService.acceptOfficial(probationId, payload);
      await queryClient.invalidateQueries({ queryKey: probationKeys.lists() });

      addToast({
        description: t('probation.toast.accept_official_success' as any),
        color: 'success',
      });

      onSuccess?.();
    } catch (error: unknown) {
      const { message } = normalizeAxiosError(error);
      addToast({
        description: message || t('probation.toast.accept_official_error' as any),
        color: 'danger',
      });
    }
  });

  return { methods, isSubmitting, onSubmit };
}

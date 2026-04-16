import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addToast } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { recruitmentRequestService } from '@/services/recruitment-request.service';
import {
  recruitmentRequestKeys,
  recruitmentRequestQueryOptions,
} from '@/services/query-options/recruitment-request.query';

import {
  recruitmentRequestSchema,
  DEFAULT_VALUES,
  type RecruitmentRequestFormValues,
} from '../schemas/recruitment-request.schema';
import dayjs from 'dayjs';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { normalizePayload } from '@/lib/utils';
import type { IRecruitmentRequestMutatePayload } from '../types/type';

interface UseFormRecruitmentRequestParams {
  id?: string;
  onSuccess?: () => void;
}

export function useFormRecruitmentRequest({ id, onSuccess }: UseFormRecruitmentRequestParams) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();
  const { isDuplicate } = useControlMode()
  const isEditMode = !!id;

  const { data: detailRes, isLoading: isDetailLoading } = useQuery({
    ...recruitmentRequestQueryOptions.detail(id ?? ''),
    enabled: !!id,
  });

  const methods = useForm<RecruitmentRequestFormValues>({
    resolver: zodResolver(recruitmentRequestSchema(t)) as any,
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const { reset, handleSubmit, formState: { isSubmitting } } = methods;

  // Fill form khi edit
  useEffect(() => {
    if (!detailRes?.data) return;
    const d = detailRes.data;
    reset({
      createdAt: dayjs(d.createdAt).format("YYYY-MM-DD") ?? dayjs().format("YYYY-MM-DD"),
      code: isDuplicate ? null : d.code ?? null,
      departmentId: d.department?.id ?? '',
      roomId: d.room?.id ?? '',
      // position: d.position ?? '',
      jobTitleId: d.jobTitle?.id ?? '',
      staffType: d.staffType ?? '',
      workType: d.workType ?? '',
      quantity: d.quantity ?? 1,
      requiredDate: d.requiredDate ?? '',
      reason: d.reason ?? '',
      description: d.description ?? '',
      educationLevel: d.educationLevel ?? '',
      requiredCertificates: d.requiredCertificates ?? '',
      experienceYears: d.experienceYears ?? 0,
      technicalSkills: d.technicalSkills ?? '',
      softSkills: d.softSkills ?? '',
      otherRequirements: d.otherRequirements ?? '',
      salaryFrom: Number(d.salaryFrom) ?? 0,
      salaryTo: Number(d.salaryTo) ?? 0,
      note: d.note ?? '',
      status: d.status,
    });
  }, [detailRes, reset]);

  const createMutation = useMutation({
    mutationFn: (data: RecruitmentRequestFormValues) => recruitmentRequestService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.summary() });
      addToast({ description: t('form.toast.create_success'), color: 'success' });
      onSuccess?.();
    },
    onError: () => {
      addToast({ description: t('form.toast.create_error'), color: 'danger' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: IRecruitmentRequestMutatePayload) =>
      recruitmentRequestService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.summary() });
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.detail(id!) });
      addToast({ description: t('form.toast.update_success'), color: 'success' });
      onSuccess?.();
    },
    onError: () => {
      addToast({ description: t('form.toast.update_error'), color: 'danger' });
    },
  });

  const onSubmit = handleSubmit((data) => {
    const payload = normalizePayload({
      ...data,
      code: data?.code ?? null,
    })
    if (isEditMode && !isDuplicate) {
      updateMutation.mutate(payload as IRecruitmentRequestMutatePayload);
    } else {
      createMutation.mutate({ ...payload, id: null });
    }
  });

  return {
    methods,
    isEditMode,
    isDetailLoading,
    isSubmitting: isSubmitting || createMutation.isPending || updateMutation.isPending,
    onSubmit,
    reset,
  };
}

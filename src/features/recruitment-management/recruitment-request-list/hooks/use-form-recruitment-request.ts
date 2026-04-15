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
      departmentId: d.departmentId ?? d.department?.id ?? '',
      roomId: d.roomId ?? d.room?.id ?? '',
      // position: d.position ?? '',
      jobTitleId: d.jobTitleId ?? d.jobTitle?.id ?? '',
      staffType: (d as any).staffType ?? '',
      workType: d.workType ?? '',
      quantity: d.quantity ?? 1,
      requiredDate: d.requiredDate ?? '',
      reason: (d as any).reason ?? '',
      description: (d as any).description ?? '',
      educationLevel: (d as any).educationLevel ?? '',
      requiredCertificates: (d as any).requiredCertificates ?? '',
      experienceYears: (d as any).experienceYears ?? 0,
      technicalSkills: (d as any).technicalSkills ?? '',
      softSkills: (d as any).softSkills ?? '',
      otherRequirements: (d as any).otherRequirements ?? '',
      salaryFrom: (d as any).salaryFrom ?? 0,
      salaryTo: (d as any).salaryTo ?? 0,
      note: (d as any).note ?? '',
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
    mutationFn: (data: RecruitmentRequestFormValues) =>
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
      updateMutation.mutate(payload);
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

import { zodResolver } from '@hookform/resolvers/zod';
import { addToast } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { normalizeAxiosError } from '@/lib/axios';
import { probationKeys } from '@/services/query-options/recruitment-management/probation.query';
import { probationService } from '@/services/recruitment-management/probation.service';

import { ProbationEvaluationDecisionEnum } from '../types/probation.type';
import {
  probationEvaluationSchema,
  PROBATION_EVALUATION_DEFAULT_VALUES,
  type ProbationEvaluationFormValues,
} from '../schemas/probation-evaluation.schema';

interface UseFormProbationEvaluationParams {
  probationId: string;
  onSuccess?: () => void;
}

export function useFormProbationEvaluation({ probationId, onSuccess }: UseFormProbationEvaluationParams) {
  const queryClient = useQueryClient();

  const methods = useForm<ProbationEvaluationFormValues>({
    resolver: zodResolver(probationEvaluationSchema),
    defaultValues: PROBATION_EVALUATION_DEFAULT_VALUES,
    mode: 'onChange',
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const submit = (decision: ProbationEvaluationDecisionEnum, isFinal: boolean) =>
    handleSubmit(async (data) => {
      try {
        await probationService.submitEvaluation(probationId, {
          ...data,
          professionalScore: data.professionalScore ?? undefined,
          attitudeScore: data.attitudeScore ?? undefined,
          communicationScore: data.communicationScore ?? undefined,
          decision,
          isFinal,
        });
        await queryClient.invalidateQueries({ queryKey: probationKeys.lists() });
        await queryClient.invalidateQueries({ queryKey: probationKeys.evaluations(probationId) });
        addToast({ description: 'Lưu đánh giá thành công.', color: 'success' });
        onSuccess?.();
      } catch (error: unknown) {
        const { message } = normalizeAxiosError(error);
        addToast({ description: message || 'Lưu đánh giá thất bại.', color: 'danger' });
      }
    })();

  const onSaveDraft = () => submit(ProbationEvaluationDecisionEnum.IN_PROGRESS, false);
  const onApprove = () => submit(ProbationEvaluationDecisionEnum.APPROVED, true);
  const onExtend = () => submit(ProbationEvaluationDecisionEnum.EXTENDED, true);
  const onReject = () => submit(ProbationEvaluationDecisionEnum.REJECTED, true);

  return { methods, isSubmitting, onSaveDraft, onApprove, onExtend, onReject };
}

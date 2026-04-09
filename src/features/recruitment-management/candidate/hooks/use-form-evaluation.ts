import { zodResolver } from '@hookform/resolvers/zod';
import { addToast } from '@heroui/react';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { NAMESPACES } from '@/i18n/constants';
import { candidateService } from '@/services/recruitment-management/candidate.service';

import {
  evaluationSchema,
  EVALUATION_DEFAULT_VALUES,
  type EvaluationFormValues,
} from '../schemas/evaluation-schema';
import type { ICandidate } from '../../recruitment-request-details/types/type';
import { QUERY_KEY } from '@/hooks/use-crud-query';

interface UseFormEvaluationParams {
  candidateId: string;
  candidate?: ICandidate;
  onSuccess?: () => void;
}

export function useFormEvaluation({ candidateId, candidate, onSuccess }: UseFormEvaluationParams) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();

  const defaultValues: EvaluationFormValues = candidate
    ? {
      reviewerId: candidate.reviewer?.id ?? '',
      interviewDate: candidate.interviewDate ?? '',
      interviewComment: candidate.interviewComment ?? '',
      professionalScore: candidate.professionalScore ? Number(candidate.professionalScore) : null,
      professionalEvaluation: candidate.professionalEvaluation ?? '',
      professionalComment: candidate.professionalComment ?? '',
      attitudeScore: candidate.attitudeScore ? Number(candidate.attitudeScore) : null,
      attitudeEvaluation: candidate.attitudeEvaluation ?? '',
      attitudeComment: candidate.attitudeComment ?? '',
      communicationScore: candidate.communicationScore ? Number(candidate.communicationScore) : null,
      communicationEvaluation: candidate.communicationEvaluation ?? '',
      communicationComment: candidate.communicationComment ?? '',
      experienceScore: candidate.experienceScore ? Number(candidate.experienceScore) : null,
      experienceEvaluation: candidate.experienceEvaluation ?? '',
      experienceComment: candidate.experienceComment ?? '',
      status: candidate.status ?? '',
    }
    : EVALUATION_DEFAULT_VALUES;

  const methods = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema(t)) as Resolver<EvaluationFormValues>,
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await candidateService.updateEvaluation(candidateId, data);
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, 'detail', candidateId] });
      addToast({ title: t('candidate.evaluation.toast.save_success'), color: 'success' });
      onSuccess?.();
    } catch {
      addToast({ title: t('candidate.evaluation.toast.save_error'), color: 'danger' });
    }
  });

  return { methods, isSubmitting, onSubmit };
}

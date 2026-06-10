import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { NAMESPACES } from '@/i18n/constants';

import { optionalString, requiredString } from './candidate.schema';
import { CandidateStatusEnum } from '../../recruitment-request-details/types/candidate.type';

const scoreField = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().min(0).max(10).nullable(),
);

export const evaluationSchema = (t: TFunction<typeof NAMESPACES.RECRUITMENT_MANAGEMENT>) =>
  z.object({
    reviewerId: requiredString(t('candidate.evaluation.validation.reviewer_required')),
    interviewDate: requiredString(t('candidate.evaluation.validation.interview_date_required')),
    interviewComment: optionalString().nullable(),

    professionalScore: scoreField,
    professionalEvaluation: optionalString().nullable(),
    professionalComment: optionalString().nullable(),

    attitudeScore: scoreField,
    attitudeEvaluation: optionalString().nullable(),
    attitudeComment: optionalString().nullable(),

    communicationScore: scoreField,
    communicationEvaluation: optionalString().nullable(),
    communicationComment: optionalString().nullable(),

    experienceScore: scoreField,
    experienceEvaluation: optionalString().nullable(),
    experienceComment: optionalString().nullable(),
    status: z.nativeEnum(CandidateStatusEnum).nullable(),
  });

export type EvaluationFormValues = z.infer<ReturnType<typeof evaluationSchema>>;

export const EVALUATION_DEFAULT_VALUES: EvaluationFormValues = {
  reviewerId: '',
  interviewDate: '',
  interviewComment: '',
  professionalScore: null,
  professionalEvaluation: '',
  professionalComment: '',
  attitudeScore: null,
  attitudeEvaluation: '',
  attitudeComment: '',
  communicationScore: null,
  communicationEvaluation: '',
  communicationComment: '',
  experienceScore: null,
  experienceEvaluation: '',
  experienceComment: '',
  status: null
};

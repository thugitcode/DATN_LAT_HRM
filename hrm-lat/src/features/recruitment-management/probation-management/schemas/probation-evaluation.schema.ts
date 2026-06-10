import { z } from 'zod';

import { ProbationEvaluationDecisionEnum } from '../types/probation.type';

const scoreField: z.ZodType<number | null> = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().min(0).max(10).nullable(),
);

export const probationEvaluationSchema = z.object({
  reviewerId: z.string().min(1, 'Vui lòng chọn người đánh giá'),
  approverId: z.string().optional(),
  templateName: z.string().optional(),
  roundLabel: z.string().optional(),
  evaluationStartDate: z.string().optional(),
  evaluationEndDate: z.string().optional(),
  evaluationDate: z.string().optional(),
  professionalScore: scoreField,
  attitudeScore: scoreField,
  communicationScore: scoreField,
  generalComment: z.string().optional(),
  strengths: z.string().optional(),
  improvementAreas: z.string().optional(),
  reviewerComment: z.string().optional(),
  approverComment: z.string().optional(),
  decision: z.nativeEnum(ProbationEvaluationDecisionEnum).optional(),
  isFinal: z.boolean().optional(),
});

export type ProbationEvaluationFormValues = z.infer<typeof probationEvaluationSchema>;

export const PROBATION_EVALUATION_DEFAULT_VALUES: ProbationEvaluationFormValues = {
  reviewerId: '',
  approverId: '',
  templateName: '',
  roundLabel: '',
  evaluationStartDate: '',
  evaluationEndDate: '',
  evaluationDate: '',
  professionalScore: null,
  attitudeScore: null,
  communicationScore: null,
  generalComment: '',
  strengths: '',
  improvementAreas: '',
  reviewerComment: '',
  approverComment: '',
  decision: ProbationEvaluationDecisionEnum.IN_PROGRESS,
  isFinal: false,
};

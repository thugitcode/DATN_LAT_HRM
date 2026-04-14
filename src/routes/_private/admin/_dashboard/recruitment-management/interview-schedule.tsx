import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { InterviewSchedule } from '@/features/recruitment-management/interview-schedule/interview-schedule';

const searchSchema = z.object({
  candidateId: z.string().optional(),
});

export const Route = createFileRoute(
  '/_private/admin/_dashboard/recruitment-management/interview-schedule',
)({
  validateSearch: searchSchema,
  component: InterviewSchedule,
});

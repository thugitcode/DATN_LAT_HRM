import { createFileRoute } from '@tanstack/react-router';

import { InterviewSchedule } from '@/features/recruitment-management/interview-schedule/interview-schedule';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/recruitment-management/interview-schedule',
)({
  component: InterviewSchedule,
});

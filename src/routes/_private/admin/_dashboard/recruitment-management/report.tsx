import { createFileRoute } from '@tanstack/react-router';

import { RecruitmentReport } from '@/features/recruitment-management/report/report';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/recruitment-management/report',
)({
  component: RecruitmentReport,
});

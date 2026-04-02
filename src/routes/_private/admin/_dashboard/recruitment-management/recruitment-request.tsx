import { createFileRoute } from '@tanstack/react-router';

import { RecruitmentRequest } from '@/features/recruitment-management/recruitment-request/recruitment-request';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/recruitment-management/recruitment-request',
)({
  component: RecruitmentRequest,
});

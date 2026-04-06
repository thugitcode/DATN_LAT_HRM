import { createFileRoute } from '@tanstack/react-router';

import { RecruitmentRequestList } from '@/features/recruitment-management/recruitment-request-list/recruitment-request-list';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/recruitment-management/recruitment-request/',
)({
  component: RecruitmentRequestList,
});

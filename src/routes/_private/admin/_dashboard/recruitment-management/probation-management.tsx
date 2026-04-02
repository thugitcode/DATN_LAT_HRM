import { createFileRoute } from '@tanstack/react-router';

import { ProbationManagement } from '@/features/recruitment-management/probation-management/probation-management';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/recruitment-management/probation-management',
)({
  component: ProbationManagement,
});

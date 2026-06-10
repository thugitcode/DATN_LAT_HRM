import { createFileRoute } from '@tanstack/react-router';

import { Candidate } from '@/features/recruitment-management/candidate/candidate';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/recruitment-management/candidate',
)({
  component: Candidate,
});

import { createFileRoute } from '@tanstack/react-router';

import { CandidateDetails } from '@/features/recruitment-management/candidate/components/details/candidate-details';

export const Route = createFileRoute(
  '/_private/admin/_detail/recruitment-management/candidate/$id',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <CandidateDetails id={id} />;
}

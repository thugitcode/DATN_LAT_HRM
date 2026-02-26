import { createFileRoute } from '@tanstack/react-router';
import { StaffDetail } from '@/features/staff-management/staff-detail';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/staff-management/detail/$id',
)({
  component: StaffDetailRoute,
});

function StaffDetailRoute() {
  const { id } = Route.useParams();
  return <StaffDetail id={id} />;
}

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/timekeeping-shift-scheduling/explanation-management/',
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Quản lý giải trình</div>;
}

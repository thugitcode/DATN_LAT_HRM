import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/salary-history',
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_private/admin/_dashboard/payroll-management/salary-history"!</div>;
}

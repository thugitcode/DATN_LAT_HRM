import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/payroll-calculation',
)({
  component: () => <Outlet />,
});

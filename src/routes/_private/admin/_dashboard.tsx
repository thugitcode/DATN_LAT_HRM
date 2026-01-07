import { createFileRoute, Outlet } from '@tanstack/react-router';

import { DashboardLayout } from '@/components/layouts/dashboard-layout/dashboard-layout';

export const Route = createFileRoute('/_private/admin/_dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

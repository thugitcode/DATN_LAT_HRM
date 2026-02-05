import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { MainLayout } from '@/components/layouts/main-layout/main-layout';

export const Route = createFileRoute('/_private/admin/_dashboard')({
  component: RouteComponent,
  // beforeLoad: ({ context }) => {
  //   // if (!context.auth) {
  //   throw redirect({ to: '/admin/timekeeping-management' });
  //   // }
  // },
});

function RouteComponent() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

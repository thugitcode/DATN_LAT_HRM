import { createFileRoute, Outlet } from '@tanstack/react-router';

import { DetailsPageLayout } from '@/components/layouts/main-layout/details-page-layout';

export const Route = createFileRoute('/_private/admin/_detail')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DetailsPageLayout>
      <Outlet />
    </DetailsPageLayout>
  );
}

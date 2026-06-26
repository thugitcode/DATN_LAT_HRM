import { createFileRoute, Outlet } from '@tanstack/react-router';
import { UserLayout } from '@/components/layouts/user-layout/user-layout';

export const Route = createFileRoute('/_private/user/_dashboard')({
  component: () => (
    <UserLayout>
      <Outlet />
    </UserLayout>
  ),
});
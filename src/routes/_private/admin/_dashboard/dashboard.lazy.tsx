import { createLazyFileRoute } from '@tanstack/react-router';

import { Dashboard } from '@/features/dasboard/dashboard';

export const Route = createLazyFileRoute('/_private/admin/_dashboard/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Dashboard />;
}

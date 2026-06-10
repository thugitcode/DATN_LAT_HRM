import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/admin/_dashboard/timekeeping-shift-scheduling/')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin/timekeeping-shift-scheduling/timekeeping-management',
    });
  },

  component: RouteComponent,
});

function RouteComponent() {
  return null;
}

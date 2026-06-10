import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/timekeeping-shift-scheduling/')({
  component: RouteComponent,

  beforeLoad: () => {
    throw redirect({
      to: '/timekeeping-shift-scheduling/timekeeping-management',
    });
  },
});

function RouteComponent() {
  return null;
}

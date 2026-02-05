import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/admin/_dashboard/timekeeping-shift-scheduling/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_private/admin/_dashboard/timekeeping-shift-scheduling/"!</div>;
}

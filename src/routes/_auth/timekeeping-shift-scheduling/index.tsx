import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/timekeeping-shift-scheduling/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_auth/timekeeping-shift-scheduling/"!</div>;
}

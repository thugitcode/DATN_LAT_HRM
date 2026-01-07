import { createFileRoute } from '@tanstack/react-router';

import { LoginSuccess } from '@/features/login/login-success';

export const Route = createFileRoute('/authenticated')({
  component: RouteComponent,
});

function RouteComponent() {
  return <LoginSuccess />;
}

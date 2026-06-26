import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/user/')({
  beforeLoad: () => { throw redirect({ to: '/user/profile' }); },
  component: () => null,
});
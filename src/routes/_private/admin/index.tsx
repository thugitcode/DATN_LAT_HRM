import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/admin/')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin/dashboard',
    });
  },
});

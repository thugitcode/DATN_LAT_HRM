import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/admin/_dashboard/recruitment-management/')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin/recruitment-management/recruitment-request',
    });
  },
});

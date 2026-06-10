import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/admin/_dashboard/other-requests-management/')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin/other-requests-management/business-trip-management',
    });
  },
});

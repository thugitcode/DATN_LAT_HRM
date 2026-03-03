import { createFileRoute, redirect } from '@tanstack/react-router';

import { LeaveManagement } from '@/features/leave-management/leave-management';

export const Route = createFileRoute('/_private/admin/_dashboard/leave-management/')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin/leave-management/leave-request-management',
    });
  },
  component: LeaveManagement,
});

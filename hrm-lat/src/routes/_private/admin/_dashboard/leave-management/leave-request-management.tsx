import { createFileRoute } from '@tanstack/react-router';

import { LeaveRequestManagement } from '@/features/leave-management/leave-request-management/leave-request-management';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/leave-management/leave-request-management',
)({
  component: LeaveRequestManagement,
});

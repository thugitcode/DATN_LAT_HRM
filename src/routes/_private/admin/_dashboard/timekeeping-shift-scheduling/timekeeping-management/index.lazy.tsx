import { createLazyFileRoute } from '@tanstack/react-router';

import { TimekeepingManagement } from '@/features/timekeeping-shift-scheduling/timekeeping-management/timekeeping-management';

export const Route = createLazyFileRoute(
  '/_private/admin/_dashboard/timekeeping-shift-scheduling/timekeeping-management/',
)({
  component: TimekeepingManagement,
});

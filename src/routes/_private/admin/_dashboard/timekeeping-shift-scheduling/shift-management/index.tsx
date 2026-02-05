import { createFileRoute } from '@tanstack/react-router';

import { ShiftManagement } from '@/features/timekeeping-shift-scheduling/shift-management/shift-management';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/timekeeping-shift-scheduling/shift-management/',
)({
  component: ShiftManagement,
});

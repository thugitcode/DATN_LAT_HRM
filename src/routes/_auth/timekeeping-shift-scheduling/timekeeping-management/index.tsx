import { createFileRoute, redirect } from '@tanstack/react-router';

import { TimekeepingManagement } from '@/features/timekeeping-shift-scheduling/timekeeping-management/timekeeping-management';

export const Route = createFileRoute('/_auth/timekeeping-shift-scheduling/timekeeping-management/')(
  {
    component: TimekeepingManagement,
  },
);

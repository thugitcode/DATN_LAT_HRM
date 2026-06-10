import { createFileRoute } from '@tanstack/react-router';

import { AccountabilityManagement } from '@/features/timekeeping-shift-scheduling/accountability-management/accountability-management';

// import { ExplanationManagement } from '@/features/timekeeping-shift-scheduling/explanation-management/explanation-management';

export const Route = createFileRoute('/_auth/timekeeping-shift-scheduling/explanation-management/')(
  {
    component: AccountabilityManagement,
  },
);

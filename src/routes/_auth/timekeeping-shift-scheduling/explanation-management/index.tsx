import { createFileRoute } from '@tanstack/react-router';

import { ExplanationManagement } from '@/features/timekeeping-shift-scheduling/explanation-management/explanation-management';

export const Route = createFileRoute('/_auth/timekeeping-shift-scheduling/explanation-management/')(
  {
    component: ExplanationManagement,
  },
);

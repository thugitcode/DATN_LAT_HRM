import { createFileRoute } from '@tanstack/react-router';

import { ExplanationManagement } from '@/features/timekeeping-shift-scheduling/explanation-management/explanation-management';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/timekeeping-shift-scheduling/explanation-management/',
)({
  component: ExplanationManagement,
});

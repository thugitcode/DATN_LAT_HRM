import { createFileRoute } from '@tanstack/react-router';

import { OvertimeManagement } from '@/features/other-requests-management/overtime-management/overtime-management';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/other-requests-management/overtime-management',
)({
  component: OvertimeManagement,
});

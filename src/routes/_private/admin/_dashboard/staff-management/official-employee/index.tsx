import { createFileRoute } from '@tanstack/react-router';

import { OfficialEmployee } from '@/features/staff-management/official-employee/official-employee';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/staff-management/official-employee/',
)({
  component: OfficialEmployee,
});

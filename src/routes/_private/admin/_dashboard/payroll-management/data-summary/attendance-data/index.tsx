import { createFileRoute } from '@tanstack/react-router';

import { AttendanceData } from '@/features/payroll-management/data-summary/attendance-data';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/data-summary/attendance-data/',
)({
  component: AttendanceData,
});

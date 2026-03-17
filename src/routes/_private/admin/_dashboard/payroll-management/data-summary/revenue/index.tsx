import { createFileRoute } from '@tanstack/react-router';

import { RevenueData } from '@/features/payroll-management/data-summary/revenue';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/data-summary/revenue/',
)({
  component: RevenueData,
});

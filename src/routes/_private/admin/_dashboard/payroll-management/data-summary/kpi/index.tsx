import { createFileRoute } from '@tanstack/react-router';

import { Kpi } from '@/features/payroll-management/data-summary/kpi';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/data-summary/kpi/',
)({
  component: Kpi,
});

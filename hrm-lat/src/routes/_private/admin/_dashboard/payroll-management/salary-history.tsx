import { createFileRoute } from '@tanstack/react-router';

import { SalaryHistory } from '@/features/payroll-management/salary-history/salary-history';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/salary-history',
)({
  component: SalaryHistory,
});

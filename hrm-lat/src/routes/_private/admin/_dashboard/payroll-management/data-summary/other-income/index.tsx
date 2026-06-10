import { createFileRoute } from '@tanstack/react-router';

import { OtherIncome } from '@/features/payroll-management/data-summary/other-income';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/data-summary/other-income/',
)({
  component: OtherIncome,
});

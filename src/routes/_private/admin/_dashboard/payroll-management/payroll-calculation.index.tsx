import { createFileRoute } from '@tanstack/react-router';

import { ManagePayPeriods } from '@/features/payroll-management/manage-pay-periods/manage-pay-periods';
import { PayrollCalculation } from '@/features/payroll-management/payroll-calculation/payroll-calculation';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/payroll-calculation/',
)({
  component: PayrollCalculation,
  // component: ManagePayPeriods,
});

import { createFileRoute } from '@tanstack/react-router';

import { PayslipFeedback } from '@/features/payroll-management/payslip-feedback/payslip-feedback';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/payslip-feedback',
)({
  component: PayslipFeedback,
});

import { createFileRoute } from '@tanstack/react-router';

import { SummaryFinalize } from '@/features/payroll-management/data-summary/summary-finalize';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/data-summary/summary-finalize/',
)({
  component: SummaryFinalize,
});

import { createFileRoute } from '@tanstack/react-router';

import { PayrollManagement } from '@/features/payroll-management/payroll-management';

export const Route = createFileRoute('/_private/admin/_dashboard/payroll-management/')({
  component: PayrollManagement,
});

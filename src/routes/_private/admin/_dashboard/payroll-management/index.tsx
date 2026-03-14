import { createFileRoute, redirect } from '@tanstack/react-router';

import { PayrollManagement } from '@/features/payroll-management/payroll-management';

export const Route = createFileRoute('/_private/admin/_dashboard/payroll-management/')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin/payroll-management/data-summary',
    });
  },

  component: PayrollManagement,
});

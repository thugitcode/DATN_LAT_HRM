import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/admin/_dashboard/payroll-management/data-summary/')(
  {
    beforeLoad: () => {
      throw redirect({
        to: '/admin/payroll-management/data-summary/attendance-data',
      });
    },
  },
);

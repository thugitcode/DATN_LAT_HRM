import { createFileRoute } from '@tanstack/react-router';

import { ManagementReport } from '@/features/management-report/management-report';

export const Route = createFileRoute('/_private/admin/_dashboard/management-report/')({
  component: ManagementReport,
});

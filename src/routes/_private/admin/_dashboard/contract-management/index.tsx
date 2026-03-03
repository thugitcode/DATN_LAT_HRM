import { createFileRoute } from '@tanstack/react-router';

import { ContractManagement } from '@/features/contract-management/contract-management';

export const Route = createFileRoute('/_private/admin/_dashboard/contract-management/')({
  component: ContractManagement,
});

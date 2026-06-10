import { createFileRoute } from '@tanstack/react-router';

import { RemoteWorkManagement } from '@/features/other-requests-management/remote-work-management/remote-work-management';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/other-requests-management/remote-work-management',
)({
  component: RemoteWorkManagement,
});

import { createFileRoute } from '@tanstack/react-router';

import { BusinessTripManagement } from '@/features/other-requests-management/business-trip-management/business-trip-management';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/other-requests-management/business-trip-management',
)({
  component: BusinessTripManagement,
});

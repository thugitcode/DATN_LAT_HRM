import { createFileRoute } from '@tanstack/react-router';

import { TrainingRegistrationRanagement } from '@/features/other-requests-management/training-registration-ranagement/training-registration-ranagement';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/other-requests-management/training-registration-ranagement',
)({
  component: TrainingRegistrationRanagement,
});

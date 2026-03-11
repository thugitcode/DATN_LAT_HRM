import { createFileRoute } from '@tanstack/react-router';
import i18n from '@/i18n';
import { NAMESPACES } from '@/i18n/constants';

import { TimekeepingManagement } from '@/features/timekeeping-shift-scheduling/timekeeping-management/timekeeping-management';

export const Route = createFileRoute(
  '/_private/admin/_dashboard/timekeeping-shift-scheduling/timekeeping-management/',
)({
  loader: async () => {
    await i18n.loadNamespaces(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  },

  component: TimekeepingManagement,
});

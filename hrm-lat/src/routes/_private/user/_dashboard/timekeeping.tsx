import { createFileRoute } from '@tanstack/react-router';
import { UserTimekeeping } from '@/features/user/timekeeping/user-timekeeping';
export const Route = createFileRoute('/_private/user/_dashboard/timekeeping')({
  component: UserTimekeeping,
});
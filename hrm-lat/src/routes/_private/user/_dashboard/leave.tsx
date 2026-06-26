import { createFileRoute } from '@tanstack/react-router';
import { UserLeave } from '@/features/user/leave/user-leave';
export const Route = createFileRoute('/_private/user/_dashboard/leave')({
  component: UserLeave,
});
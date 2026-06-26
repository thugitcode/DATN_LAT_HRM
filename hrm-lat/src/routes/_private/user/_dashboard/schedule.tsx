import { createFileRoute } from '@tanstack/react-router';
import { UserSchedule } from '@/features/user/schedule/user-schedule';
export const Route = createFileRoute('/_private/user/_dashboard/schedule')({
  component: UserSchedule,
});
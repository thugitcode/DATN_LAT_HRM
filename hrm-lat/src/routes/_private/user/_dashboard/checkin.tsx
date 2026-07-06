import { createFileRoute } from '@tanstack/react-router';
import { UserCheckin } from '@/features/user/checkin/user-checkin';
export const Route = createFileRoute('/_private/user/_dashboard/checkin')({
  component: UserCheckin,
});
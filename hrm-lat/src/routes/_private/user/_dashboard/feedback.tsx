import { createFileRoute } from '@tanstack/react-router';
import { UserFeedback } from '@/features/user/feedback/user-feedback';
export const Route = createFileRoute('/_private/user/_dashboard/feedback')({
  component: UserFeedback,
});
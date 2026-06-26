import { createFileRoute } from '@tanstack/react-router';
import { UserExplanation } from '@/features/user/explanation/user-explanation';
export const Route = createFileRoute('/_private/user/_dashboard/explanation')({
  component: UserExplanation,
});
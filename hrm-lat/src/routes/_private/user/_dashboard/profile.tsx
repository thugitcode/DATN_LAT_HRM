import { createFileRoute } from '@tanstack/react-router';
import { UserProfile } from '@/features/user/profile/user-profile';
export const Route = createFileRoute('/_private/user/_dashboard/profile')({
  component: UserProfile,
});
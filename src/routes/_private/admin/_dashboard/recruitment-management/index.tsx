import { createFileRoute } from '@tanstack/react-router';

import { RecruitmentManagement } from '@/features/recruitment-management/recruitment-management';

export const Route = createFileRoute('/_private/admin/_dashboard/recruitment-management/')({
  component: RecruitmentManagement,
});

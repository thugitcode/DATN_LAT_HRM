import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { RecruitmentRequestDetails } from '@/features/recruitment-management/recruitment-request-details/recruitment-request-details';

import { RecruitmentRequestTabEnum } from '@/features/recruitment-management/recruitment-request-details/constants/data';

const searchSchema = z.object({
  tab: z.nativeEnum(RecruitmentRequestTabEnum).catch(RecruitmentRequestTabEnum.CANDIDATES),
});

export const Route = createFileRoute(
  '/_private/admin/_detail/recruitment-management/recruitment-request/$id',
)({
  validateSearch: searchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  return <RecruitmentRequestDetails id={id} tab={tab} />;
}

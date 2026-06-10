import { createFileRoute } from '@tanstack/react-router';

import { CandidateDetails } from '@/features/recruitment-management/candidate/components/details/candidate-details';
import z from 'zod';
import { DetailCandidateTabEnum } from '@/features/recruitment-management/constants/details';
const searchSchema = z.object({
  tab: z.nativeEnum(DetailCandidateTabEnum).catch(DetailCandidateTabEnum.APPLICATION),
});
export const Route = createFileRoute(
  '/_private/admin/_detail/recruitment-management/candidate/$id',
)({
  component: RouteComponent,
  validateSearch: searchSchema
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  const onTabChange = (newTab: DetailCandidateTabEnum) => {
    navigate({ search: (prev) => ({ ...prev, tab: newTab }) });
  };

  return <CandidateDetails id={id} tab={tab} onTabChange={onTabChange} />;
}

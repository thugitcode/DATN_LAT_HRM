import { queryOptions } from '@tanstack/react-query';

import type { CandidateFilters } from '@/features/recruitment-management/recruitment-request-details/types/type';
import { candidateService } from '@/services/recruitment-management/candidate.service';

export const candidateKeys = {
  all: ['candidate'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (recruitmentRequestId: string, params?: CandidateFilters) =>
    [...candidateKeys.lists(), recruitmentRequestId, params] as const,
} as const;

export const candidateQueryOptions = {
  list: (recruitmentRequestId: string, params?: CandidateFilters) =>
    queryOptions({
      queryKey: candidateKeys.list(recruitmentRequestId, params),
      queryFn: () => candidateService.getByRecruitmentRequest(recruitmentRequestId, params),
      enabled: !!recruitmentRequestId,
    }),
} as const;

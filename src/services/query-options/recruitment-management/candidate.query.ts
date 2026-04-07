import { queryOptions } from '@tanstack/react-query';

import type { CandidateFilters } from '@/features/recruitment-management/recruitment-request-details/types/type';
import { candidateService } from '@/services/recruitment-management/candidate.service';

export const candidateKeys = {
  all: ['candidate'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (params?: CandidateFilters) =>
    [...candidateKeys.lists(), params] as const,
  allLists: (params?: CandidateFilters) => [...candidateKeys.lists(), 'all', params] as const,
} as const;

export const candidateQueryOptions = {
  list: (recruitmentRequestId: string | undefined, params?: CandidateFilters) => {
    console.log(candidateKeys.list(params), 2222);

    return queryOptions({
      queryKey: candidateKeys.list(params),
      queryFn: () => candidateService.getByRecruitmentRequest(recruitmentRequestId, params),
      // enabled: !!recruitmentRequestId,
    })
  }
  ,
  getAll: (params?: CandidateFilters) =>
    queryOptions({
      queryKey: candidateKeys.allLists(params),
      queryFn: () => candidateService.getAll(params),
    }),
} as const;

import { useQuery } from '@tanstack/react-query';

import { candidateQueryOptions } from '@/services/query-options/recruitment-management/candidate.query';
import type { CandidateFilters } from '../types/candidate.type';

export function useCandidateList(recruitmentRequestId?: string, params?: CandidateFilters) {
  return useQuery(candidateQueryOptions.list(recruitmentRequestId, params));
}

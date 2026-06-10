import { queryOptions } from '@tanstack/react-query';

import type { CandidateFilters, OfferLetterPayload } from '@/features/recruitment-management/recruitment-request-details/types/candidate.type';
import { candidateService } from '@/services/recruitment-management/candidate.service';

export const candidateKeys = {
  all: ['candidate'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (params?: CandidateFilters, recruitmentRequestId?: string) =>
    [...candidateKeys.lists(), params, recruitmentRequestId] as const,
  allLists: (params?: CandidateFilters) => [...candidateKeys.lists(), 'all', params] as const,
  detailsOffer: (candidateId: string) => ["offer", candidateId],
  createOffer: (candidateId: string, payload: OfferLetterPayload) => ["offer", candidateId, payload],
} as const;

export const candidateQueryOptions = {
  list: (recruitmentRequestId: string | undefined, params?: CandidateFilters) => {
    return queryOptions({
      queryKey: candidateKeys.list(params, recruitmentRequestId),
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

  detailsOffer: (candidateId: string) =>
    queryOptions({
      queryKey: candidateKeys.detailsOffer(candidateId),
      queryFn: () => candidateService.getDetailsOffer(candidateId),
      enabled: !!candidateId,
    }),
  createOffer: (candidateId: string, payload: OfferLetterPayload) =>
    queryOptions({
      queryKey: candidateKeys.createOffer(candidateId, payload),
      queryFn: () => candidateService.createOffer(candidateId, payload),
    })
} as const;

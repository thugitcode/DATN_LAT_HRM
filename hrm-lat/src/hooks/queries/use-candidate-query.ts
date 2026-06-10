import { candidateService } from '@/services/recruitment-management/candidate.service';

import type {
  ICandidate,
  CandidateFilters,
  CandidatePayload,
} from '@/features/recruitment-management/recruitment-request-details/types/candidate.type';

import { createCrudHooks, QUERY_KEY } from '../use-crud-query';

export const {
  useList: useCandidateList,
  useDetail: useCandidateDetail,
  useCreate: useCreateCandidate,
  useUpdate: useUpdateCandidate,
  useDelete: useDeleteCandidate,
} = createCrudHooks<ICandidate, CandidateFilters, CandidatePayload, CandidatePayload>(
  [QUERY_KEY.CANDIDATE],
  candidateService,
);

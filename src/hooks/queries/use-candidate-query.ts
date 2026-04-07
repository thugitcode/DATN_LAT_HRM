import { candidateService } from '@/services/recruitment-management/candidate.service';

import type {
  Candidate,
  CandidateFilters,
  CandidatePayload,
} from '@/features/recruitment-management/recruitment-request-details/types/type';

import { createCrudHooks, QUERY_KEY } from '../use-crud-query';

export const {
  useList: useCandidateList,
  useDetail: useCandidateDetail,
  useCreate: useCreateCandidate,
  useUpdate: useUpdateCandidate,
  useDelete: useDeleteCandidate,
} = createCrudHooks<Candidate, CandidateFilters, CandidatePayload, CandidatePayload>(
  [QUERY_KEY.CANDIDATE],
  candidateService,
);
